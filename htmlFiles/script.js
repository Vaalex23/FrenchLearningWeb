let verbos = [];
let aciertos = 0; // Contador de aciertos
let intentos = 0; // Contador de intentos

// Detectar el nombre del archivo HTML actual
const url = new URL(window.location.href); // Obtener la URL completa
const archivoActual = url.pathname.split("/").pop(); // Dividir la ruta y obtener el último segmento
console.log(archivoActual); // Esto debería mostrar "present_simple.html"

let archivoJSON;

// Determinar el archivo JSON a cargar según la página
if (archivoActual === "present_simple.html") {
    archivoJSON = '../JsonFiles/Verbs/verbos_frances_present_simple.json';  // Cargar los verbos en presente
} else if (archivoActual === "passe_compose.html") {
    archivoJSON = '../JsonFiles/Verbs/verbos_frances_passe_compose.json';  // Cargar los verbos en passé composé
} else if (archivoActual === "futur_simple.html"){
    archivoJSON = '../JsonFiles/Verbs/verbos_frances_futur_simple.json';  // Cargar los verbos en futur simple
} else if (archivoActual === "imparfait.html"){
    archivoJSON = '../JsonFiles/Verbs/verbos_frances_imparfait.json';  // Cargar los verbos en l'imparfait
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

    // Muestra la traducción, verbo y el sujeto en la tarjeta
    document.getElementById("traduccion").textContent = verboActual.traduccion; // Traducción del verbo
    document.getElementById("verbo").textContent = verboActual.infinitivo; // Verbo en infinitivo
    document.getElementById("sujeto").textContent = sujetoActual; // Sujeto correspondiente

    // Limpiar la respuesta y el resultado
    document.getElementById("respuesta").value = "";
    document.getElementById("resultado").textContent = "";
    document.getElementById("flipCard").classList.remove("flipped", "correct", "incorrect");

     // Enfocar el input automáticamente
     document.getElementById("respuesta").focus();
}

function verificar() {
    const respuesta = document.getElementById("respuesta").value.toLowerCase();
    const respuestaCorrecta = verboActual.conjugaciones[sujetoActual].toLowerCase();

    // Incrementar el contador de intentos
    intentos++;

    // Gira la tarjeta
    document.getElementById("flipCard").classList.add("flipped");

    // Verifica si la respuesta es correcta
    if (respuesta === respuestaCorrecta) {
        aciertos++;  // Incrementar el contador de aciertos
        document.getElementById("flipCard").classList.add("correct");
        document.getElementById("resultado").textContent = "¡Correcto!";
    } else {
        document.getElementById("flipCard").classList.add("incorrect");
        document.getElementById("resultado").innerHTML = "Incorrecto.<br><br>La respuesta correcta es:<br><br>" + respuestaCorrecta;
    }

    // Actualizar el contador de aciertos y el porcentaje
    actualizarContador();
}

function nextVerb() {
    // Muestra un nuevo verbo aleatorio
    mostrarNuevoVerbo();
}

// Función para actualizar el contador de aciertos y porcentaje
function actualizarContador() {
    const porcentaje = (intentos === 0) ? 0 : Math.round((aciertos / intentos) * 100);
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("intentos").textContent = intentos;
    document.getElementById("porcentaje").textContent = `${porcentaje}%`;
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
