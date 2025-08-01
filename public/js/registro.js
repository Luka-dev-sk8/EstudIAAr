const nombre = document.getElementById("nombre")
const correo = document.getElementById("email")
const password = document.getElementById("password")
const Form = document.getElementById("container2")
const parrafo = document.getElementById("warning")
const parrafo2 = document.getElementById("warning2")
const parrafo3 = document.getElementById("warning3")

async function enviarDatos() {
    const nombreValue = nombre.value;
    const correoValue = correo.value;
    const passwordValue = password.value;

    if (!nombreValue || !correoValue || !passwordValue) {
        parrafo2.innerHTML = 'Todos los campos son requeridos';
        return false;
    }

    const data = { nombre: nombreValue, correo_electronico: correoValue, contraseña: passwordValue };

    try {
        const response = await fetch('http://localhost:3000/insertData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Datos insertados con éxito');
            return true;
        } else if (response.status === 400) {
            parrafo2.innerHTML = result.message;
            return false;
        } else {
            console.log('Error al insertar datos');
            parrafo2.innerHTML = 'Error al insertar datos. Por favor, intenta de nuevo.';
            return false;
        }
    } catch (error) {
        console.error('Error al enviar datos:', error);
        parrafo2.innerHTML = 'Error de conexión con el servidor';
        return false;
    }
}


Form.addEventListener("submit",async e => {
    e.preventDefault();
    let warning = ""
    let warning2 = ""
    let warning3 = ""
    let entrar = false
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    
    if(nombre.value.length <6){
        warning += 'el nombre no es valido <br>'
        entrar = true
    }
    if(!regexEmail.test(correo.value)){
        warning2 += "email no es valido <br>"
        entrar = true
    }

    if (password.value.length < 8){
        warning3 += "contraseña no es valido <br>"
        entrar = true
        

    }

    if (entrar) {

          parrafo.innerHTML = warning
          parrafo2.innerHTML = warning2
          parrafo3.innerHTML = warning3
          warning = "";
          warning2 = "";
          warning3 = "";
         } else { 
             const enviarDatosResult = await enviarDatos();
              if (enviarDatosResult) {
                  window.location.href = '/inicio.html';
                 } else {
                     console.log('Error al insertar datos.');
                     } }
                    });