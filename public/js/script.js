

function verificar(){
    const email = document.getElementById("email");
    const evaluar = email.value;
    
    if(evaluar.includes("@")){
        email.classList.remove("error")
    }else{
        email.classList.add("error");
    }
}

