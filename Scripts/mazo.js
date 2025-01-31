import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { 
    getDatabase, ref, push, onValue, remove, get
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
const provider = new GoogleAuthProvider();

// Elementos del DOM
const loginButton = document.getElementById("google-login-btn");
const logoutButton = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");

// Función de inicio de sesión con Google
loginButton.addEventListener("click", async () => {
    loginButton.disabled = true; // Evita múltiples solicitudes

    try {
        const result = await signInWithPopup(auth, provider);
        console.log("Usuario autenticado:", result.user);
        
        userInfo.textContent = `Hola, ${result.user.displayName}`;
        loginButton.style.display = "none";
        logoutButton.style.display = "inline";
        loadUserCards();
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);

        // Si el popup fue bloqueado, intenta con redirección
        if (error.code === "auth/popup-blocked") {
            console.warn("El popup fue bloqueado, intentando con redirección...");
            signInWithRedirect(auth, provider);
        }
    } finally {
        loginButton.disabled = false;
    }
});

// Función de cierre de sesión
logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("Usuario ha cerrado sesión.");
        userInfo.textContent = "";
        loginButton.style.display = "inline";
        logoutButton.style.display = "none";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});


onAuthStateChanged(auth, (user) => {
    updateUI(user);
    if (user) {
        console.log("Usuario ya autenticado:", user);
        userInfo.textContent = `Hola, ${user.displayName}`;
        loginButton.style.display = "none";
        logoutButton.style.display = "inline";
        loadUserCards();
    }
});

// Elementos del DOM
const wordList = document.getElementById("word-list");

document.getElementById("google-login-btn").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("Usuario autenticado:", user);
            document.getElementById("user-info").textContent = `Hola, ${user.displayName}`;
            document.getElementById("google-login-btn").style.display = "none";
            document.getElementById("logout-btn").style.display = "inline";
            loadUserCards(); // Cargar tarjetas del usuario autenticado
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google:", error);
        });
});

document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        console.log("Usuario ha cerrado sesión.");
        document.getElementById("user-info").textContent = "";
        document.getElementById("google-login-btn").style.display = "inline";
        document.getElementById("logout-btn").style.display = "none";
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
});


// Actualizar la interfaz de usuario
function updateUI(user) {
    if (user) {
        userInfo.textContent = `Hola, ${user.displayName}`;
        loginButton.style.display = "none";
        logoutButton.style.display = "inline";
    } else {
        userInfo.textContent = "";
        loginButton.style.display = "inline";
        logoutButton.style.display = "none";
        wordList.innerHTML = ""; // Limpiar la lista de tarjetas
    }
}

// Cargar las tarjetas del usuario
function loadUserCards() {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(database, `users/${user.uid}/cards`);
    get(userRef).then((snapshot) => {
        wordList.innerHTML = "";
        const cards = snapshot.val();
        
        if (!cards) {
            console.log("No hay tarjetas guardadas.");
            return;
        }

        Object.entries(cards).forEach(([id, card]) => {
            const listItem = document.createElement("li");
            listItem.textContent = card.french;
            listItem.classList.add("word-item");

            listItem.addEventListener("click", () => {
                listItem.textContent = card.spanish;
                setTimeout(() => {
                    const keep = confirm("¿Mantener en la biblioteca?");
                    if (!keep) {
                        remove(ref(database, `users/${user.uid}/cards/${id}`));
                        listItem.remove();
                    } else {
                        listItem.textContent = card.french;
                    }
                }, 1000);
            });

            wordList.appendChild(listItem);
        });
    }).catch((error) => {
        console.error("Error al cargar las tarjetas: ", error);
    });
}

// Referencias
const addCardBtn = document.getElementById("add-card-btn");
const modal = document.getElementById("modal");
const form = document.getElementById("add-card-form");
const cardContainer = document.getElementById("card-container");


// Variables globales
let isShuffled = false; // Estado del modo aleatorio
let viewedCards = new Set(); // Almacena los índices de cartas vistas
let totalCards = 0;
let cardIndex = 0;
let cardArray = [];

// Variable para saber si estamos en la última carta
let lastCardReached = false;

// Mostrar modal para agregar tarjeta
addCardBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

// Cerrar modal al hacer clic fuera del formulario
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// Guardar tarjeta en la base de datos de Firebase
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const frenchInput = document.getElementById("french-word");
    const spanishInput = document.getElementById("spanish-word");

    let frenchWord = frenchInput.value.trim();
    let spanishWord = spanishInput.value.trim();

    if (!frenchWord || !spanishWord) {
        alert("Por favor, completa ambos campos antes de guardar.");
        return;
    }

    frenchWord = frenchWord.charAt(0).toUpperCase() + frenchWord.slice(1).toLowerCase();
    spanishWord = spanishWord.charAt(0).toUpperCase() + spanishWord.slice(1).toLowerCase();

    if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userRef = ref(database, `users/${userId}/cards`);

        push(userRef, { french: frenchWord, spanish: spanishWord }).then(() => {
            modal.style.display = "none";
            form.reset();
            loadUserCards(); // Cargar las tarjetas después de agregar una nueva
        }).catch((error) => {
            console.error("Error al guardar la tarjeta: ", error);
        });
    } else {
        alert("Por favor, inicie sesión para agregar tarjetas.");
    }
});
// Variable para saber si el texto está invertido
let isInverted = false;

// Función para actualizar el contador de cartas vistas
function updateViewedCounter() {
    const viewedCounter = document.getElementById("viewed-counter");
    viewedCounter.textContent = `${viewedCards.size}/${totalCards}`;
}

// Función para mostrar una carta
function showCard(index) {
    if (cardArray.length === 0 || index >= cardArray.length) return;

    const cardInner = document.querySelector(".card-inner");
    const cardFront = document.getElementById("card-front-text");
    const cardBack = document.getElementById("card-back-text");

    // Dependiendo de si el texto está invertido, mostramos el orden adecuado
    if (isInverted) {
        cardFront.textContent = cardArray[index].spanish;
        cardBack.textContent = cardArray[index].french;
    } else {
        cardFront.textContent = cardArray[index].french;
        cardBack.textContent = cardArray[index].spanish;
    }

    if (!viewedCards.has(index)) {
        viewedCards.add(index);
    }

    cardInner.style.transition = "none";
    cardInner.classList.remove("flipped");

    setTimeout(() => {
        cardInner.style.transition = "transform 0.6s ease-in-out";
    }, 10);

    updateViewedCounter();

    // Si se llega a la última carta, activar el estado de "última carta alcanzada"
    lastCardReached = (index === cardArray.length - 1);
}

// Evento para el botón "Invertir texto"
document.getElementById("invert-btn").addEventListener("click", () => {
    isInverted = !isInverted;  // Cambiar el estado de inversión
    showCard(cardIndex);  // Mostrar la carta actual con el texto invertido o no
});

// Función para obtener la siguiente carta
function getNextCard() {
    if (isShuffled) {
        // Si el modo aleatorio está activado, obtener una carta aleatoria no vista
        const remainingCards = cardArray.filter((_, index) => !viewedCards.has(index));

        if (remainingCards.length === 0) {
            alert("¡Has visto todas las cartas!");
            viewedCards.clear();
            cardIndex = 0;  // Reiniciar el índice de carta
        } else {
            const randomIndex = Math.floor(Math.random() * remainingCards.length);
            cardIndex = cardArray.indexOf(remainingCards[randomIndex]);
        }
    } else {
        // Si no está en modo aleatorio, avanzar de forma secuencial
        if (cardIndex < cardArray.length - 1) {
            cardIndex++;
        } else {
            // Si es la última carta, reiniciar
            alert("¡Has visto todas las cartas! Reiniciando la baraja.");
            viewedCards.clear();
            cardIndex = 0; // Reiniciar al principio
        }
    }

    showCard(cardIndex); // Mostrar la siguiente carta
}

// Función para obtener la carta anterior
function getPreviousCard() {
    if (isShuffled) {
        // Si el modo aleatorio está activado, obtener una carta aleatoria no vista
        const remainingCards = cardArray.filter((_, index) => !viewedCards.has(index));

        if (remainingCards.length === 0) {
            alert("¡No hay más cartas por retroceder!");
        } else {
            const randomIndex = Math.floor(Math.random() * remainingCards.length);
            cardIndex = cardArray.indexOf(remainingCards[randomIndex]);
        }
    } else {
        // Si no está en modo aleatorio, retroceder de forma secuencial
        if (cardIndex > 0) {
            cardIndex--;
        } else {
            // Si es la primera carta, no retroceder
            alert("¡Ya estás en la primera carta!");
        }
    }

    showCard(cardIndex); // Mostrar la carta anterior
}

// Evento para el botón "Siguiente"
document.getElementById("next-btn").addEventListener("click", () => {
    getNextCard(); // Mostrar la siguiente carta
});

// Evento para el botón "Anterior"
document.getElementById("prev-btn").addEventListener("click", () => {
    getPreviousCard(); // Mostrar la carta anterior
});

// Evento para el botón "Barajar"
document.getElementById("shuffle-btn").addEventListener("click", () => {
    // Cambiar el estado de la baraja entre aleatorio y normal
    isShuffled = !isShuffled;

    // Cambiar el texto del botón según el estado
    const shuffleBtnText = isShuffled ? "Modo Normal" : "Modo Aleatorio";
    document.getElementById("shuffle-btn").textContent = shuffleBtnText;

    if (isShuffled) {
        alert("Modo aleatorio activado.");
    } else {
        alert("Modo normal activado.");
    }
});

// Girar la tarjeta al hacer clic
document.getElementById("card").addEventListener("click", () => {
    document.querySelector(".card-inner").classList.toggle("flipped");
});

/*// Función para cargar las tarjetas del usuario
function loadUserCards() {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userRef = ref(database, `users/${userId}/cards`);

    get(userRef).then((snapshot) => {
        wordList.innerHTML = "";
        const cards = snapshot.val();
        totalCards = cards ? Object.keys(cards).length : 0;

        cardArray = [];
        for (let id in cards) {
            cardArray.push({ id: id, ...cards[id] });

            const listItem = document.createElement("li");
            listItem.textContent = cards[id].french;
            listItem.classList.add("word-item");

            listItem.addEventListener("click", () => {
                listItem.textContent = cards[id].spanish;
                setTimeout(() => {
                    const keep = confirm("¿Mantener en la biblioteca?");
                    if (!keep) {
                        remove(ref(database, `users/${userId}/cards/${id}`));
                    } else {
                        listItem.textContent = cards[id].french;
                    }
                }, 1000);
            });

            wordList.appendChild(listItem);
        }

        if (cardArray.length > 0) {
            cardIndex = 0;
            viewedCards.clear();
            showCard(cardIndex);
        }
    }).catch((error) => {
        console.error("Error al cargar las tarjetas: ", error);
    });
}*/

// Verificar si el usuario está autenticado
auth.onAuthStateChanged(user => {
    if (user) {
        loadUserCards(); // Cargar tarjetas del usuario cuando inicie sesión
    } else {
        console.log("Usuario no autenticado.");
    }
});
document.getElementById("google-login-btn").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("Usuario autenticado:", user);
            document.getElementById("user-info").textContent = `Hola, ${user.displayName}`;
            document.getElementById("google-login-btn").style.display = "none";
            document.getElementById("logout-btn").style.display = "inline";
            loadUserCards(); // Cargar tarjetas del usuario autenticado
        })
        .catch((error) => {
            console.error("Error al iniciar sesión con Google:", error);
        });
});
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        console.log("Usuario ha cerrado sesión.");
        document.getElementById("user-info").textContent = "";
        document.getElementById("google-login-btn").style.display = "inline";
        document.getElementById("logout-btn").style.display = "none";
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
});
