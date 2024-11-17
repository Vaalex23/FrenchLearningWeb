let palabras = []; // Lista de palabras cargadas desde el JSON
let aciertos = 0; // Contador de aciertos
let intentos = 0; // Contador de intentos
let palabraActual;

const url = new URL(window.location.href); // Obtener la URL completa
const archivoActual = url.pathname.split("/").pop(); // Dividir la ruta y obtener el último segmento
console.log(archivoActual); // Esto debería mostrar "present_simple.html"

let archivoJSON;

// Determinar el archivo JSON a cargar según la página
if (archivoActual === "calendar_vocabulary.html") {
    archivoJSON = '../JsonFiles/Vocabulary/calendar.json';  // Cargar los verbos en presente
} else if (archivoActual === "family_vocabulary.html") {
    archivoJSON = '../JsonFiles/Vocabulary/family.json';  // Cargar los verbos en passé composé
} else if (archivoActual === "futur_simple.html"){
    archivoJSON = '../JsonFiles/Verbs/verbos_frances_futur_simple.json';  // Cargar los verbos en futur simple
} else if (archivoActual === "imparfait.html"){
    archivoJSON = '../JsonFiles/Verbs/verbos_frances_imparfait.json';  // Cargar los verbos en l'imparfait
} else {   
     console.error("No se pudo identificar el archivo HTML.");
}
// Cargar el archivo JSON con vocabulario
fetch(archivoJSON)
    .then(response => response.json())
    .then(data => {
        palabras = data;
        mostrarNuevaPalabra();
    })
    .catch(error => console.error("Error al cargar el archivo JSON:", error));

// Selección de palabra aleatoria
function obtenerPalabraAleatoria() {
    return palabras[Math.floor(Math.random() * palabras.length)];
}

// Mostrar una nueva palabra
function mostrarNuevaPalabra() {
    if (palabras.length === 0) {
        alert("No se pudieron cargar las palabras.");
        return;
    }

    palabraActual = obtenerPalabraAleatoria();
    document.getElementById("palabra").textContent = palabraActual.word;
    document.getElementById("respuesta").value = "";
    document.getElementById("respuesta").focus();
    document.getElementById("flipCard").classList.remove("flipped", "correct", "incorrect");
    document.getElementById("resultado").textContent = "";
}

// Verificar la respuesta
function verificar() {
    const respuesta = document.getElementById("respuesta").value.toLowerCase().trim();
    const respuestaCorrecta = palabraActual.traduccionESP.toLowerCase();

    intentos++;
    document.getElementById("flipCard").classList.add("flipped");

    if (respuesta === respuestaCorrecta) {
        aciertos++;
        document.getElementById("flipCard").classList.add("correct");
        document.getElementById("resultado").textContent = "¡Correcto!";
    } else {
        document.getElementById("flipCard").classList.add("incorrect");
        document.getElementById("resultado").innerHTML =
            `Incorrecto. La respuesta correcta es: ${respuestaCorrecta}`;
    }

    actualizarContador();
}

// Pasar a la siguiente palabra
function nextVerb() {
    mostrarNuevaPalabra();
}

// Actualizar el contador de puntuación
function actualizarContador() {
    const porcentaje = intentos === 0 ? 0 : Math.round((aciertos / intentos) * 100);
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("intentos").textContent = intentos;
    document.getElementById("porcentaje").textContent = `${porcentaje}%`;
}

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