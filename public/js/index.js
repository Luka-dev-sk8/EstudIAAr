const btn = document.querySelector('#boton');
const contenido = document.querySelector('#content');

btn.addEventListener('click', () => {
    contenido.classList.add('.no_click');

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
// Como funcion coso? encima si parametros y el SOLID hermano?

async function obtenerMaterias() {
    const urlParams = new URLSearchParams(window.location.search);
    const año = urlParams.get('año');
    if (!año) {
        console.error('Falta el parámetro año en la URL');
        return;
    }

    try {
        const response = await fetch (`http://localhost:3000/getMaterias?año=${año}`);
        if (!response.ok) {
            throw new Error('Error al obtener las materias');
        }
        const materias = await response.json();
        const container = document.getElementById('materias-container');
        container.innerHTML = ''; // Limpiar el contenedor
        materias.forEach(materia => {
            const button = document.createElement('button');
            button.textContent = materia.materia;
            container.appendChild(button);
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('materias-container').innerHTML = 'No se pudieron cargar las materias.';
    }
}