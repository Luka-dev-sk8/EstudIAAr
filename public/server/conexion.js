// importacion para la conexion, creacion de un servidor y codificacion de datos
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sql from 'mssql';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname,join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const app = express();
app.use(express.json());

app.use(express.static(join(__dirname, '../../')));
app.use(cors());

//creamos una configuracion para la conexion de la base de datos
//algunos datos son sacados de un archivo .env, para tenerlos mas resguardados
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

//creamos una ruta para el inserto de datos
//usamos post, por que los datos seran sacados de un formulario y mantenerlos ocultos
app.post('/insertData', async (req, res) => {
    console.log('>>req.body',req.body);
    const { nombre, correo_electronico, contraseña } = req.body;

    try {
        let pool = await sql.connect(config);

        let result = await pool.request()
        .input('correo_electronico',sql.VarChar,correo_electronico)
        .query("SELECT COUNT(*) AS count FROM USUARIO WHERE correo_electronico = @correo_electronico");
        console.log('registros con ese correo',result.recordset[0].count);

        if(result.recordset[0].count > 0){
            return res.status(400).json({message: 'el correo ya esta registrado'
            });
            
        }
        
        await pool.request()
        .input('correo_electronico', sql.VarChar, correo_electronico)
        .input('contraseña', sql.VarChar, contraseña)
        .input('nombre', sql.VarChar, nombre)
        .query("INSERT INTO USUARIO (correo_electronico, contraseña, nombre) VALUES (@correo_electronico, @contraseña, @nombre)");
    

        res.status(200).json({message: 'Datos insertados con éxito'});
    } catch (err) {
        console.error('Error ejecutando la consulta', err);
        return res.status(500).json({ message: 'Error insertando datos.' });
    }
});

//creamos una ruta para la verificacion
//usamos post, por que los datos seran sacados de un formulario y mantenerlos ocultos
app.post('/verificarData', async (req, res) => {
    
    console.log('payload recibido: ', req.body);
    const { correo_electronico, contraseña } = req.body;
    try {
      const pool = await sql.connect(config);
  
      // Compruebo si el correo existe
      const correoResult = await pool.request()
        .input('correo', sql.VarChar, correo_electronico)
        .query(`
          SELECT COUNT(*) AS count
          FROM USUARIO
          WHERE correo_electronico = @correo;
        `);
      const correoExiste = correoResult.recordset[0].count > 0;
          
      console.log('→ Parámetros pasados a SQL:', {
        correo: correo_electronico,
        pass: contraseña
      });

      
      let contraseñaExiste = false;
      if (correoExiste) {
        const passResult = await pool.request()
          .input('correo', sql.VarChar, correo_electronico)
          .input('pass',   sql.VarChar, contraseña)
          .query(`
            SELECT COUNT(*) AS count
            FROM USUARIO
            WHERE correo_electronico = @correo
              AND contraseña = @pass;
          `);
          contraseñaExiste = passResult.recordset[0].count > 0;
          console.log('→ Resultado de la comprobación de contraseña:', contraseñaExiste);
      }
  
      
      return res.status(200).json({ correoExiste, contraseñaExiste });
  
    } catch (err) {
      console.error('Error verificando datos', err);
      return res.status(500).json({ message: 'Error en servidor verificando datos.' });
    }
  });


//definimos una ruta
//usamos get, por que los datos seran sacados de la url
app.get('/getMaterias', async (req, res) => {
  const { año, tecnicatura } = req.query; // sacamos los valores para la consulta de la url
  console.log('Parámetros recibidos:', { año, tecnicatura }) // imprimimos los valores para cualquier falla

  //iniciamos un bloque try.catch para las consultas sql y manejar los posibles fallos
    try {
        const pool = await sql.connect(config); // establecemos la conexion con la configuracion antes creada
        let result; // creamos una variable para guardar los resultados y reutilizarlos

        //verificamos el valor de tecnicatura que son sirve como filtro para las consultas
        if(tecnicatura === '*'){
            result = await pool.request()
            .input('año', sql.VarChar,año) // recibe el valor año
            //consultamos con DISTINCT para recibir valores unicos y tener repetidos
            .query('SELECT DISTINCT tecnicatura FROM cronograma_estudio WHERE año = @año')

            //en caso no haber ninguna tecnicatura, retornamos un mensaje
            if (result.recordset.length === 0) {
        return res.status(404).json({ message: `No se encontraron tecnicaturas para el año ${año}` });
      }      
      // Devolvemos un objeto json, que funciona como array que mandaremos al index.js
      res.status(200).json({ type: 'tecnicaturas', data: result.recordset });
        
    }else{
          // como tecnicatura no es "*", verificamos que no este vacia, si lo esta. se informa por medio de un mensaje
          if(!tecnicatura){
            return res.status(400).json({message: 'Falta el parametro tecnicatura'});
          }
          //ejecutamos una consulta, que nos devuelva las materias
          //que coincidan con el año y tecnicatura pasados por la url del html
            result = await pool.request()
              .input('año', sql.VarChar, año)
              .input('tecnicatura',sql.VarChar, tecnicatura)
              .query('SELECT materia FROM cronograma_estudio WHERE año = @año AND tecnicatura = @tecnicatura');

          if (result.recordset.length === 0) {//en caso de que no haya materas, se informa por un mensaje
              return res.status(404).json({ message: 'No se encontraron materias para este año' });
          }
          
          //se crea otro objeto json que funciona como array, pero de tipo materias
          res.status(200).json({ type: 'materias', data: result.recordset });

        }}catch (err) // se verifica cualquier ripo de error, durante la conexion con la base de datos
         {
        console.error('Error obteniendo materias:', err);
        res.status(500).json({ message: 'Error al obtener materias' });
    }
});


app.get('/getinformacion', async(req, res)=>{
  const{año,tecnicatura,materia} = req.query;
  console.log('parametros recibidos para información:',{año, tecnicatura, materia});

  try{
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('año',sql.VarChar,año)
      .input('tecnicatura', sql.VarChar, tecnicatura)
      .input('materia',sql.VarChar, materia)
      .query('SELECT informacion FROM cronograma_estudio WHERE año = @año AND tecnicatura = @tecnicatura AND materia = @materia');

      if(result.recordset.length === 0){
        return res.status(404).json({message: 'No se encontró información para esta materia'});
      }
      res.status(200).json({informacion : result.recordset[0].informacion});
  }catch(err){
  console.error('Error obteniendo información:', err);
  res.status(500).json ({message: 'Error al obtener información'});
  }
})
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => res.status(204).end());

app.use((req,res)=>{
  console.log("ruta no encontrada:", req.url);
  res.status(404).json({message:'Ruta no encontrada'});
});

const port = 3000;
app.listen(port, () =>{
  console.log(`servidor corriendo en http://localhost:${port}`);
});