//toggle a un contenedor
const btn = document.querySelector('#boton');
const contenido = document.querySelector('#content');
const titulo = document.getElementById('titulo');
const tituloMateria = document.getElementById('materia-titulo');
const no_click = document.querySelector('si_click')


btn.addEventListener('click', () => {
    contenido.classList.toggle('si_click'); 
});

//toggle tematica de mario bros
const btn_img = document.querySelector('.img');

const header = document.querySelector('.normal');
const grados = document.querySelector('.grados');

const mariobros = document.querySelector('.mariobros')
const body = document.querySelector('.body')

btn_img.addEventListener('click', () => {
    
    header.classList.toggle('mario');
    grados.classList.toggle('mario');
    
    mariobros.classList.toggle('mario');
    body.classList.toggle('mario');
});


//obtencion de materias
async function obtenerMaterias() {
    tituloMateria.innerHTML = "";
    const urlParams = new URLSearchParams(window.location.search); // guardamos la url en una variable
    //creamos variables, que tendran valores sacados de la url
    const año = urlParams.get('año');
    const tecnicatura = urlParams.get('tecnicatura');
    titulo.innerHTML = año + " año "
    //verificamos que si tengan valores las variables
    if (!año) {
        console.error('Falta el parámetro año en la URL');
        return;
    }

try {
        // se codifica los parámetros para evitar problemas con caracteres especiales
        const response = await fetch(`http://localhost:3000/getMaterias?año=${encodeURIComponent(año)}&tecnicatura=${encodeURIComponent(tecnicatura || '')}`);
       
        //se verifica cualquier tipo de error
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al obtener datos: ${response.status} - ${errorData.message || 'Sin mensaje'}`);
        }
        //se llama a el objeto json
        const responseData = await response.json();

        let type, data;
        // manejamos 2 tipos de respuestas, por si responseData es un objeto o un array
        if (Array.isArray(responseData)) {
            //si es un array, se le asigna un type
            type = tecnicatura === '*' ? 'tecnicaturas' : 'materias';
            data = responseData;
        } else {
            //si es un objeto, se le saca los valores directamente
            ({ type, data } = responseData);
        }

        //en caso de que data no es un array, se muestra el error
        if (!Array.isArray(data)) {
            throw new Error('Los datos recibidos no son un array');
        }

        //se busca a un contenedor por su id
        const container = document.getElementById('materias-container');
        if (!container) {
            console.error('No se encontró el elemento con ID "materias-container"');
            return;
        }
        
        container.innerHTML = ''; // Limpiar el contenedor

        // segun el type, se generan diferentes bottones
        if (type === 'tecnicaturas') {
            data.forEach(item => {
                const button = document.createElement('button'); //creamos una variable, que sean botones
                button.textContent = item.tecnicatura || 'Sin nombre'; //le asignamos un contenido, basandonos en la consulta sql
                button.className = 'tecnicatura-button'; //le asigno una clase para diferencialos y luka le ponga estilo css
                //los botones nos envian a la misma pagina, pero esta vez rellenando el valor tecnicatura
                button.addEventListener('click', () => {
                    window.location.href = `?año=${encodeURIComponent(año)}&tecnicatura=${encodeURIComponent(item.tecnicatura)}`;
                });
                container.appendChild(button);
            });
        } else if (type === 'materias')  //en caso de que hablamos de materias, creamos otros tipos de botones
            {
            data.forEach(item => {
                const button = document.createElement('button'); // creamos una variable que sean botones
                button.textContent = item.materia || 'Sin nombre'; // le asginamos un contenido
                button.className = 'materia-button'; // una clase para diferenciar
                button.addEventListener('click', async () => {
                    if (tituloMateria) {
                        tituloMateria.innerHTML = item.materia;
                    }
                    try {
                        const response = await fetch(`http://localhost:3000/getInformacion?año=${encodeURIComponent(año)}&tecnicatura=${encodeURIComponent(tecnicatura)}&materia=${encodeURIComponent(item.materia)}`);
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(`Error al obtener información: ${response.status} - ${errorData.message || 'Sin mensaje'}`);
                        }
                        const { informacion } = await response.json();
                        const infoContainer = document.getElementById('materias-info');
                        if (infoContainer) {
                            infoContainer.innerHTML = informacion || 'No hay información disponible';
                        } else {
                            console.error('No se encontró el elemento con ID "materias-info"');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        const infoContainer = document.getElementById('materias-info');
                        if (infoContainer) {
                            infoContainer.innerHTML = 'No se pudo cargar la información.';
                        }
                        swal('Error', 'No se pudo cargar la información de la materia.', 'error');
                    }
                });
                container.appendChild(button);
                titulo.innerHTML = año + " año " + "-" + tecnicatura + "-"; //ponemos un titulo difenrente en cada caso
            });
        } else {
            //en caso de no ser uno de los 2 valores, se emite el error
            throw new Error(`Tipo de datos desconocido: ${type}`);
        }
    } catch (error) {
        //errores con la conexion, se lo comunica a la pagina
        console.error('Error:', error);
        const container = document.getElementById('materias-container');
        if (container) {
            container.innerHTML = 'No se pudieron cargar los datos.';
        }
    }
}