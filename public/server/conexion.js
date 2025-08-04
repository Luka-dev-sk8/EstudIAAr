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



app.get('/getMaterias', async (req, res) => {
  const { año, tecnicatura } = req.query;
  console.log('Parámetros recibidos:', { año, tecnicatura })
    if (!año) {
        return res.status(400).json({ message: 'Falta el parámetro año' });
    }
    try {
        const pool = await sql.connect(config);
        let result;

        if(tecnicatura === '*'){
            result = await pool.request()
            .input('año', sql.VarChar,año)
            .query('SELECT DISTINCT tecnicatura FROM cronograma_estudio WHERE año = @año')

            if (result.recordset.length === 0) {
        return res.status(404).json({ message: `No se encontraron tecnicaturas para el año ${año}` });
      }

      
      // Devolver tecnicaturas con una clave específica para el frontend
      res.status(200).json({ type: 'tecnicaturas', data: result.recordset });
        }else{
          
          if(!tecnicatura){
            return res.status(400).json({message: 'Falta el parametro tecnicatura'});
          }

            result = await pool.request()
              .input('año', sql.VarChar, año)
              .input('tecnicatura',sql.VarChar, tecnicatura)
              .query('SELECT materia FROM cronograma_estudio WHERE año = @año AND tecnicatura = @tecnicatura');
          if (result.recordset.length === 0) {
              return res.status(404).json({ message: 'No se encontraron materias para este año' });
          }
          
          res.status(200).json({ type: 'materias', data: result.recordset });

        }}catch (err) {
        console.error('Error obteniendo materias:', err);
        res.status(500).json({ message: 'Error al obtener materias' });
    }
});

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