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
} else if (archivoActual === "plus_que_parfait.html"){
    archivoJSON = '../JsonFiles/Verbs/verbos_frances_plus_que_parfait.json';  // Cargar los verbos en plus que parfait
} else if (archivoActual === "futur_anterieur.html"){
    archivoJSON = '../JsonFiles/Verbs/verbos_frances_futur_anterieur.json';  // Cargar los verbos en futur anterieur
}else if (archivoActual === "gerondif.html"){
    archivoJSON = '../JsonFiles/Verbs/verbos_frances_gerondif.json';  // Cargar los verbos en gerondif
}else{
     console.error("No se pudo identificar el archivo HTML.");
}

// Cargar el archivo JSON de forma asincrónica
fetch(archivoJSON)
    .then(response => response.json())
    .then(data => {
        // Inicializar el peso de cada verbo
        verbos = data.map(verbo => ({ ...verbo, peso: 1 }));
        mostrarNuevoVerbo(); // Mostrar un verbo al cargar la página
    })
    .catch(error => console.error("Error cargando el archivo JSON:", error));

let verboActual;
let sujetoActual;

function obtenerVerboAleatorio() {
    // Calcular la suma total de los pesos
    const totalPesos = verbos.reduce((sum, verbo) => sum + verbo.peso, 0);
    // Seleccionar un número aleatorio entre 0 y el total de pesos
    let random = Math.random() * totalPesos;
    // Encontrar el verbo correspondiente al número aleatorio
    for (const verbo of verbos) {
        if (random < verbo.peso) {
            return verbo;
        }
        random -= verbo.peso;
    }
}

function mostrarNuevoVerbo() {
    if (verbos.length === 0) {
        alert("No se pudieron cargar los verbos.");
        return;
    }

    // Obtén un verbo aleatorio y un sujeto aleatorio
    verboActual = obtenerVerboAleatorio();
    if (archivoActual != "gerondif.html"){
        const sujetos = Object.keys(verboActual.conjugaciones);
        sujetoActual = sujetos[Math.floor(Math.random() * sujetos.length)];
    }

    // Reducir el peso del verbo actual para que tenga menos probabilidad de aparecer de nuevo
    verboActual.peso *= 0.2; // Puedes ajustar este factor para cambiar la reducción de peso

    // Muestra la traducción, verbo y el sujeto en la tarjeta
    document.getElementById("traduccion").textContent = verboActual.traduccion; // Traducción del verbo
    document.getElementById("verbo").textContent = verboActual.infinitivo; // Verbo en infinitivo
    if (archivoActual != "gerondif.html")
        document.getElementById("sujeto").textContent = sujetoActual; // Sujeto correspondiente

    // Limpiar la respuesta y el resultado
    document.getElementById("respuesta").value = "";
    document.getElementById("resultado").textContent = "";
    document.getElementById("flipCard").classList.remove("flipped", "correct", "incorrect");

     // Enfocar el input automáticamente
     document.getElementById("respuesta").focus();
}

function verificar() {
    const respuesta = document.getElementById("respuesta").value.trim().toLowerCase();
    let respuestaCorrecta = verboActual.gerundio;
    if (archivoActual != "gerondif.html"){
        respuestaCorrecta = verboActual.conjugaciones[sujetoActual].toLowerCase();
    }
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
        document.getElementById("resultado").innerHTML = respuesta + "<br><br>Incorrecto.<br><br>La respuesta correcta es:<br><br>" + respuestaCorrecta;
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