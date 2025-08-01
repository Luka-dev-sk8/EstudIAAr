//recibimos los datos atravez de los ID

const correo = document.getElementById("email"),
    password = document.getElementById("password"),
    parrafo = document.getElementById("warning"),
    parrafo2 = document.getElementById("warning2"),
    Form = document.getElementById("container");

// llamo a la consulta de la base de datos
    async function verificarData(correo_electronico, contraseña) {
        const payload = {correo_electronico, contraseña}
               try {
                const response = await fetch('http://localhost:3000/verificarData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              if (!response.ok) {
                console.error('Error al verificar datos:', response.status);
                return null;
              }
              return await response.json();
            } catch (error) {
              console.error('Error de conexión:', error);
              return null;
            }
          }

          
Form.addEventListener("submit",async e =>{
    e.preventDefault();
  parrafo.textContent = '';
  parrafo2.textContent = '';

  let warning = '';
  let warning2 = '';
  let entrar = false;

  const correoValue = correo.value.trim();
  const passwordValue = password.value.trim();

  regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if(!regexEmail.test(correo.value)){
  warning += "email no es valido"
  entrar = true

  }
    if(!correoValue){
        warning = "ingresa tu correo";
        entrar = true;
    }

    if(password.value.lenngth <8){
        warning2 = "ingresa tu contraseña";
        entrar = true;
    }

    if(entrar){
        parrafo.innerHTML = warning;
        parrafo.innerHTML = warning2
        return;
    }

    const result = await verificarData(correoValue, passwordValue);
    if (!result) {
        parrafo2.textContent = 'No se pudo verificar (error de conexión)';
        return;
      }

    const { correoExiste, contraseñaExiste } = result;

    if (!correoExiste) {
        warning = "el correo no esta registrado";
        entrar = true;
      } else if (!contraseñaExiste) {
        warning2 = "contraseña incorrecta";
        entrar = true;
      }
    

    if(entrar){
        parrafo.innerHTML = warning
        parrafo2.innerHTML = warning2
        warning = ""
        warning2 = ""
    }else{
        window.location.href = '/inicio.html';
    }
})