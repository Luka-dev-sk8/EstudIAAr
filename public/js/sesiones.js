const correo = document.getElementById("email"),
    password = document.getElementById("password"),
    parrafo = document.getElementById("warning"),
    parrafo2 = document.getElementById("warning2"),
    Form = document.getElementById("container");

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
  parrafo.classList.remove('er_email');
  parrafo2.classList.remove('er_contra');

  let warning = '';
  let warning2 = '';
  let entrar = false;

  const correoValue = correo.value.trim();
  const passwordValue = password.value.trim();

    if(!correoValue){
        warning = "ingresa tu correo";
        entrar = true;
    }

    if(!passwordValue){
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
        parrafo2.classList.add('er_contra');
        return;
      }

    const { correoExiste, contraseñaExiste } = result;

    if (!correoExiste) {
        warning = "el correo no esta registrado";
        parrafo.classList.add('er_email');
        entrar = true;
      } else if (!contraseñaExiste) {
        warning2 = "contraseña incorrecta";
        parrafo2.classList.add('er_contra');
        entrar = true;
      }
    

    if(entrar){
        parrafo.innerHTML = warning
        parrafo2.innerHTML = warning2
        warning = ""
        warning2 = ""
    }else{
        window.location.href = '/public/inicio.html';
    }
})