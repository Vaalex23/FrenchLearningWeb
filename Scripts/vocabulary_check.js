import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { 
    getAuth, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { 
    getDatabase, ref, onValue 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBrYA0_hCMoQD7CSH3BXTH4Gdwt_oYsVho",
    authDomain: "easy-language-learning-f.firebaseapp.com",
    databaseURL: "https://easy-language-learning-f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "easy-language-learning-f",
    storageBucket: "easy-language-learning-f.firebasestorage.app",
    messagingSenderId: "883430389199",
    appId: "1:883430389199:web:9dfbfa5933fd756dda4eba",
    measurementId: "G-MS5V079QZ2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let palabras = [];
let categoriaActual = "";
let palabrasMezcladas = [];
let palabraActual = "";
let indiceActual = 0;
let intentos = 0;
let aciertos = 0;

const nextButton = document.getElementById("next-Button");
const verificarB = document.getElementById("verificar-button");

// Obtener categoría de la URL
const urlParams = new URLSearchParams(window.location.search);
categoriaActual = urlParams.get('category');

// Función para normalizar texto
function normalizarTexto(texto) {
    if (!texto || typeof texto !== 'string') {
        return ""; // Devuelve una cadena vacía si el texto es undefined, null o no es una cadena
    }
    return texto.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Cargar palabras desde Firebase
function cargarPalabrasDesdeFirebase(userId) {
    document.getElementById("categoria-titulo").textContent = `Categoría: ${categoriaActual}`;

    const palabrasRef = ref(database, `users/${userId}/categories/${categoriaActual}`);
    
    onValue(palabrasRef, (snapshot) => {
        palabras = [];
        const data = snapshot.val();
        
        if (data) {
            Object.keys(data).forEach(key => {
                palabras.push({
                    word: data[key].french,
                    traduccionESP: data[key].spanish
                });
            });
            
            // Mezclar palabras y reiniciar índice
            palabrasMezcladas = mezclarArray([...palabras]);
            
            mostrarNuevaPalabra();
        } else {
            alert("No hay palabras en esta categoría");
            window.location.href = "../vocabularyIndex.html";
        }
    }, (error) => {
        console.error("Error al cargar palabras:", error);
    });
}
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
// Función para mezclar array (algoritmo Fisher-Yates)
function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Modificar la función para obtener palabra
function obtenerPalabraAleatoria() {
    if (indiceActual >= palabrasMezcladas.length) {
        // Si se acabaron, mezclar de nuevo y reiniciar índice
        palabrasMezcladas = mezclarArray([...palabras]);
        indiceActual = 0;
    }
    
    return palabrasMezcladas[indiceActual++];
}
// Verificar la respuesta
function verificar() {
    const respuesta = normalizarTexto(document.getElementById("respuesta").value);
    
    let esCorrecto = false;
    const traducciones = Array.isArray(palabraActual.traduccionESP) ? 
                        palabraActual.traduccionESP : 
                        [palabraActual.traduccionESP];

    esCorrecto = traducciones.some(trad => normalizarTexto(trad) === respuesta);
   console.log(esCorrecto);
   console.log(" ");
   console.log(traducciones);
    intentos++;
    document.getElementById("flipCard").classList.add("flipped");

    if (esCorrecto) {
        aciertos++;
        document.getElementById("flipCard").classList.add("correct");
        document.getElementById("resultado").textContent = "¡Correcto!";
    } else {
        const respuestaCorrecta = Array.isArray(palabraActual.traduccionESP)
            ? palabraActual.traduccionESP.join(" / ")  // Combina las opciones con " / "
            : palabraActual.traduccionESP;
        document.getElementById("flipCard").classList.add("incorrect");
        document.getElementById("resultado").innerHTML =
            `Incorrecto.<br><br>La respuesta correcta es:<br><br> ${respuestaCorrecta}`;
    }

    actualizarContador();
}
// Actualizar el contador de puntuación
function actualizarContador() {
    const porcentaje = intentos === 0 ? 0 : Math.round((aciertos / intentos) * 100);
    document.getElementById("aciertos").textContent = aciertos;
    document.getElementById("intentos").textContent = intentos;
    document.getElementById("porcentaje").textContent = `${porcentaje}%`;
}

// Inicialización después de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (!categoriaActual) {
            alert("Categoría no especificada");
            window.location.href = "../vocabularyIndex.html";
            return;
        }
        cargarPalabrasDesdeFirebase(user.uid);
    } else {
        alert("Debes iniciar sesión primero");
        window.location.href = "../vocabularyIndex.html";
    }
});

verificarB.addEventListener("click", verificar);
nextButton.addEventListener("click", mostrarNuevaPalabra);

// Configurar el evento de teclado para activar "verificar" o "nextVerb" con "Enter"
document.getElementById("respuesta").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const flipCard = document.getElementById("flipCard");
        if (flipCard.classList.contains("flipped")) {
            mostrarNuevaPalabra();  // Ejecuta "nextVerb" si la tarjeta está volteada
        } else {
            document.getElementById("flipCard").classList.add("flipped");
            verificar(); // Ejecuta "verificar" si la tarjeta aún no está volteada
        }
    }
});