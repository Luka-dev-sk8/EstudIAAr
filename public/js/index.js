const btn = document.querySelector('#boton');
const contenido = document.querySelector('#content');

btn.addEventListener('click', () => {
    contenido.classList.toggle('no_click');

    
});

function coso(){
    var num = Math.floor(Math.random() * 6) + 1;
    console.log(num);
    if(num===1){
        swal('Tomate Un Descanso', 'Tomate un descanso como de 5-15 minutos.');
    }else{
        if(num===2){
            swal('Recuerde Que En La Vida Todo Se Puede.','');
        }else{       
            if(num===3){
                swal('Tomate El Tiempo Para Reflexionar.','');
            
            }
            if(num===4){
                swal('perdiste en el momento que te rendiste.','');
            
            }if(num===5){
                swal('El exito es la suma de pequeños esfuerzos que se repiten.','');
            
            }else{
                swal('Tu Puedes Yo Confio En Ti.','');
                
            }
        }
    }
}


async function obtenerMaterias() {
    const urlParams = new URLSearchParams(window.location.search);
    const año = urlParams.get('año');
    const tecnicatura = urlParams.get('tecnicatura');
    if (!año) {
        console.error('Falta el parámetro año en la URL');
        return;
    }

try {
        // Codificar parámetros para evitar problemas con caracteres especiales
        const response = await fetch(`http://localhost:3000/getMaterias?año=${encodeURIComponent(año)}&tecnicatura=${encodeURIComponent(tecnicatura || '')}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al obtener datos: ${response.status} - ${errorData.message || 'Sin mensaje'}`);
        }

        const responseData = await response.json();
        let type, data;
        // Manejar tanto arrays directos como objetos { type, data }
        if (Array.isArray(responseData)) {
            type = 'materias';
            data = responseData;
        } else {
            ({ type, data } = responseData);
        }

        if (!Array.isArray(data)) {
            throw new Error('Los datos recibidos no son un array');
        }

        const container = document.getElementById('materias-container');
        if (!container) {
            console.error('No se encontró el elemento con ID "materias-container"');
            return;
        }
        container.innerHTML = ''; // Limpiar el contenedor

        // Procesar según el tipo de datos
        if (type === 'tecnicaturas') {
            data.forEach(item => {
                const button = document.createElement('button');
                button.textContent = item.tecnicatura || 'Sin nombre';
                button.addEventListener('click', () => {
                    window.location.href = `?año=${encodeURIComponent(año)}&tecnicatura=${encodeURIComponent(item.tecnicatura)}`;
                });
                container.appendChild(button);
            });
        } else if (type === 'materias') {
            data.forEach(item => {
                const button = document.createElement('button');
                button.textContent = item.materia || 'Sin nombre';
                container.appendChild(button);
            });
        } else {
            throw new Error(`Tipo de datos desconocido: ${type}`);
        }
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('materias-container');
        if (container) {
            container.innerHTML = 'No se pudieron cargar los datos.';
        }
    }
}