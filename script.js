let verbos = [];

// Cargar el archivo JSON de forma asincrónica
fetch('verbos_frances_present_simple.json')
    .then(response => response.json())
    .then(data => {
        verbos = data; // Guardar los datos del JSON en la variable verbos
        mostrarNuevoVerbo(); // Mostrar un verbo al cargar la página
    })
    .catch(error => console.error("Error cargando el archivo JSON:", error));

let verboActual;
let sujetoActual;

function obtenerVerboAleatorio() {
    // Selecciona un verbo aleatorio de la lista cargada desde el JSON
    const verbo = verbos[Math.floor(Math.random() * verbos.length)];
    return verbo;
}

function mostrarNuevoVerbo() {
    if (verbos.length === 0) {
        alert("No se pudieron cargar los verbos.");
        return;
    }

    // Obtén un verbo aleatorio y un sujeto aleatorio
    verboActual = obtenerVerboAleatorio();
    const sujetos = Object.keys(verboActual.conjugaciones);
    sujetoActual = sujetos[Math.floor(Math.random() * sujetos.length)];

    // Muestra el verbo y el sujeto en la tarjeta
    document.getElementById("verbo").textContent = verboActual.infinitivo;
    document.getElementById("sujeto").textContent = sujetoActual;

    // Limpiar la respuesta y el resultado
    document.getElementById("respuesta").value = "";
    document.getElementById("resultado").textContent = "";
    document.getElementById("flipCard").classList.remove("flip", "correct", "incorrect");
}

function verificar() {
    const respuesta = document.getElementById("respuesta").value.toLowerCase();
    const respuestaCorrecta = verboActual.conjugaciones[sujetoActual].toLowerCase();

    // Gira la tarjeta
    document.getElementById("flipCard").classList.add("flip");

    // Verifica si la respuesta es correcta
    if (respuesta === respuestaCorrecta) {
        document.getElementById("flipCard").classList.add("correct");
        document.getElementById("resultado").textContent = "¡Correcto!";
    } else {
        document.getElementById("flipCard").classList.add("incorrect");
        document.getElementById("resultado").textContent = "Incorrecto. La respuesta correcta es: " + respuestaCorrecta;
    }
}

function nextVerb() {
    // Muestra un nuevo verbo aleatorio
    mostrarNuevoVerbo();
}

// Al cargar la página, muestra el primer verbo
mostrarNuevoVerbo();
