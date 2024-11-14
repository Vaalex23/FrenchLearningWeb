let verbos = [];

// Detectar el nombre del archivo HTML actual
const archivoActual = window.location.pathname.split("/").pop();

let archivoJSON;

// Determinar el archivo JSON a cargar según la página
if (archivoActual === "present_simple.html") {
    archivoJSON = 'verbos_frances_present_simple.json';  // Cargar los verbos en presente
} else if (archivoActual === "passe_compose.html") {
    archivoJSON = 'verbos_frances_passe_compose.json';  // Cargar los verbos en passé composé
} else {
    console.error("No se pudo identificar el archivo HTML.");
}

// Cargar el archivo JSON de forma asincrónica
fetch(archivoJSON)
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
    document.getElementById("flipCard").classList.remove("flipped", "correct", "incorrect");
}

function verificar() {
    console.log("hola");
    const respuesta = document.getElementById("respuesta").value.toLowerCase();
    const respuestaCorrecta = verboActual.conjugaciones[sujetoActual].toLowerCase();

    // Gira la tarjeta
    document.getElementById("flipCard").classList.add("flipped");

    // Verifica si la respuesta es correcta
    if (respuesta === respuestaCorrecta) {
        document.getElementById("flipCard").classList.add("correct");
        document.getElementById("resultado").textContent = "¡Correcto!";
    } else {
        document.getElementById("flipCard").classList.add("incorrect");
        document.getElementById("resultado").innerHTML = "Incorrecto.<br><br>La respuesta correcta es:<br><br>" + respuestaCorrecta;
    }
}

function nextVerb() {
    // Muestra un nuevo verbo aleatorio
    mostrarNuevoVerbo();
}

// Configurar el evento de teclado para activar "verificar" o "nextVerb" con "Enter"
document.getElementById("respuesta").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const flipCard = document.getElementById("flipCard");
        if (flipCard.classList.contains("flipped")) {
            nextVerb();  // Ejecuta "nextVerb" si la tarjeta está volteada
        } else {
            verificar(); // Ejecuta "verificar" si la tarjeta aún no está volteada
        }
    }
});
