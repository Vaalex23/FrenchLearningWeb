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

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referencias
const addCardBtn = document.getElementById("add-card-btn");
const modal = document.getElementById("modal");
const form = document.getElementById("add-card-form");
const cardContainer = document.getElementById("card-container");
const wordList = document.getElementById("word-list"); // Lista de palabras en la biblioteca

// Mostrar modal para agregar tarjeta
addCardBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

// Cerrar modal al hacer clic en el fondo
modal.addEventListener("click", (e) => {
    // Verifica si el clic ocurrió fuera del formulario (contenido del modal)
    if (e.target === modal) {
        modal.style.display = "none";
    }
});


// Guardar tarjeta en Firebase
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const frenchInput = document.getElementById("french-word");
    const spanishInput = document.getElementById("spanish-word");
    
    let frenchWord = frenchInput.value.trim();
    let spanishWord = spanishInput.value.trim();

    // Validar que ambos campos estén completos
    if (!frenchWord || !spanishWord) {
        alert("Por favor, completa ambos campos antes de guardar.");
        return;
    }

    // Formatear palabras: primera letra en mayúscula, el resto en minúscula
    frenchWord = frenchWord.charAt(0).toUpperCase() + frenchWord.slice(1).toLowerCase();
    spanishWord = spanishWord.charAt(0).toUpperCase() + spanishWord.slice(1).toLowerCase();

    // Guardar en Firebase
    database.ref("cards").push({ french: frenchWord, spanish: spanishWord }, () => {
        // Cerrar el modal y resetear el formulario
        modal.style.display = "none";
        form.reset();
    });
});

// Recuperar y mostrar tarjetas
database.ref("cards").on("value", (snapshot) => {
    const wordList = document.getElementById("word-list"); // Lista dentro de .library
    wordList.innerHTML = ""; // Limpiar la lista antes de agregar nuevas palabras
    const cards = snapshot.val();

    for (let id in cards) {
        const listItem = document.createElement("li"); // Crear elemento <li> para cada palabra
        listItem.textContent = cards[id].french;

        // Evento para mostrar traducción al hacer clic
        listItem.addEventListener("click", () => {
            listItem.textContent = cards[id].spanish;
            setTimeout(() => {
                const keep = confirm("¿Mantener en la biblioteca?");
                if (!keep) {
                    database.ref(`cards/${id}`).remove(); // Eliminar tarjeta si no se quiere mantener
                } else {
                    listItem.textContent = cards[id].french; // Volver al texto original
                }
            }, 1000);
        });

        wordList.appendChild(listItem); // Agregar la palabra a la lista
    }
});
