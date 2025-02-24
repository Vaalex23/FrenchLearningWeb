import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { 
    getDatabase, ref, push, onValue, remove, get, set
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
const wordList = document.getElementById("word-list");
const addCardBtn = document.getElementById("add-card-btn");
const modal = document.getElementById("modal");
const form = document.getElementById("add-card-form");
const cardContainer = document.getElementById("card-container");
const totalElement = document.getElementById("total-cards");
const viewedElement = document.getElementById("viewed-cards");
const invertButton = document.getElementById("invert-btn");
const nextButton = document.getElementById("next-btn");
const prevButton = document.getElementById("prev-btn");
const shuffleButton = document.getElementById("shuffle-btn");
const card = document.getElementById("card");

// Variables de estado
let cardIndex = 0;
let totalCards = 0;
let viewedCards = new Set(); // Almacena los índices de cartas vistas
let isInverted = false; // Para inversión de carta
let isShuffled = false; // Para barajar cartas
let cardArray = []; // Arreglo de cartas

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
        wordList.innerHTML = ""; // Limpiar la lista de tarjetas
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});

// Verificar si el usuario ya está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        userInfo.textContent = `¡Hola, ${user.displayName}!`;
        loadUserCards(); // Cargar las tarjetas del usuario
        showCard(0); // Asegurarse de que la tarjeta se muestre correctamente desde el principio
        loginButton.style.display  = "none";
    } else {
        //userInfo.textContent = "No hay usuario autenticado";
        document.getElementById("card-front-text").textContent = "Cargando..."; // Mostrar "Cargando..." cuando no hay usuario
        logoutButton.style.display = "none";
    }
});
// Función para cargar las tarjetas del usuario
function loadUserCards() {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const oldCardsRef = ref(database, `users/${userId}/cards`); // Referencia a la antigua estructura
    const newCardsRef = ref(database, `users/${userId}/categories`); // Referencia a la nueva estructura

    // Cargar tarjetas de la antigua estructura
    get(oldCardsRef).then((oldCardsSnapshot) => {
        const oldCards = oldCardsSnapshot.val();
        let combinedCards = [];

        if (oldCards) {
            // Convertir las tarjetas antiguas al formato nuevo
            combinedCards = Object.entries(oldCards).map(([id, card]) => {
                return { id, ...card, category: card.category || "Sin categoría" };
            });
        }

        // Cargar tarjetas de la nueva estructura
        get(newCardsRef).then((newCardsSnapshot) => {
            const newCards = newCardsSnapshot.val();

            if (newCards) {
                // Recorrer las categorías y agregar las tarjetas a la lista combinada
                Object.entries(newCards).forEach(([category, cards]) => {
                    Object.entries(cards).forEach(([id, card]) => {
                        combinedCards.push({ id, ...card, category });
                    });
                });
            }

            // Mostrar las tarjetas combinadas
            displayCards(combinedCards);
        }).catch((error) => {
            console.error("Error al cargar las tarjetas de la nueva estructura: ", error);
        });
    }).catch((error) => {
        console.error("Error al cargar las tarjetas de la antigua estructura: ", error);
    });
}
// Variables de estado nuevas
let currentCategory = null;
let filteredCards = [];

// Modificar la función displayCards
function displayCards(cards) {
    cardArray = cards;
    filteredCards = [...cards]; // Copia de todas las cartas
    updateCategoryList(cards);
    updateWordList(cards);
    showCard(0);
}

// Nueva función para actualizar categorías
function updateCategoryList(cards) {
    const categoryList = document.getElementById("category-list");
    categoryList.innerHTML = "<h3>Categorías</h3>";
    
    const categories = [...new Set(cards.map(card => card.category || "Sin categoría"))];
    
    categories.forEach(category => {
        const categoryElement = document.createElement("div");
        categoryElement.className = "category-item";
        categoryElement.innerHTML = `
            <button class="category-btn">${category} 
                <span class="category-count">(${cards.filter(c => (c.category || "Sin categoría") === category).length})</span>
            </button>
        `;
        
        categoryElement.querySelector(".category-btn").addEventListener("click", () => {
            currentCategory = category;
            filteredCards = cards.filter(c => (c.category || "Sin categoría") === category);
            updateWordList(filteredCards);
            cardIndex = 0;
            viewedCards.clear();
            showCard(0);
        });
        
        categoryList.appendChild(categoryElement);
    });

    // Botón para mostrar todas las cartas
    const allCardsButton = document.createElement("button");
    allCardsButton.textContent = "Todas las cartas";
    allCardsButton.addEventListener("click", () => {
        currentCategory = null;
        filteredCards = [...cards];
        updateWordList(filteredCards);
        cardIndex = 0;
        viewedCards.clear();
        showCard(0);
    });
    categoryList.appendChild(allCardsButton);
}

// Modificar updateWordList para mantener la funcionalidad original
function updateWordList(cards) {
    wordList.innerHTML = "";
    
    cards.forEach(({ id, french, spanish, category }) => {
        const listItem = document.createElement("li");
        listItem.textContent = french;
        listItem.classList.add("word-item");

        listItem.addEventListener("click", () => {
            listItem.textContent = spanish;
            setTimeout(() => {
                showModal(id, french, listItem, category || "Sin categoría");
            }, 1000);
        });

        wordList.appendChild(listItem);
    });
}

// Función para mostrar el modal de confirmación con opción de mover a categoría
// Función para mostrar el modal de confirmación con opción de mover a categoría
function showModal(cardId, frenchWord, listItem, currentCategory) {
    const modal = document.getElementById("confirm-modal");
    const yesButton = document.getElementById("yes-btn");
    const noButton = document.getElementById("no-btn");
    const moveButton = document.getElementById("move-btn");
    const moveOptions = document.getElementById("move-options");
    const categorySelect = document.getElementById("category-select");
    const acceptMoveButton = document.getElementById("accept-move-btn");

    const categories = new Set(cardArray.map(card => card.category || "Sin categoría"));
    categorySelect.innerHTML = ""; // Limpiar antes de agregar opciones
    
    // Agregar siempre "Sin categoría" primero
    const defaultOption = document.createElement("option");
    defaultOption.value = "Sin categoría";
    defaultOption.textContent = "Sin categoría";
    categorySelect.appendChild(defaultOption);
    
    // Agregar las demás categorías sin duplicados
    categories.forEach(category => {
        if (category !== "Sin categoría") { // Evita agregarlo dos veces
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        }
    });

    modal.style.display = "flex"; // Mostrar el modal al hacer clic
    moveOptions.style.display = "none"; // Ocultar las opciones de mover inicialmente

    // Limpiar event listeners previos para evitar duplicación
    yesButton.onclick = null;
    noButton.onclick = null;
    moveButton.onclick = null;
    acceptMoveButton.onclick = null;

    // Acción cuando el usuario presiona "Sí"
    yesButton.onclick = () => {
        modal.style.display = "none"; // Ocultar el modal
        listItem.textContent = frenchWord; // Volver a mostrar el texto en francés
    };

    // Acción cuando el usuario presiona "No"
    noButton.onclick = () => {
        modal.style.display = "none"; // Ocultar el modal
        remove(ref(database, `users/${auth.currentUser.uid}/categories/${currentCategory}/${cardId}`))
            .then(() => listItem.remove()) // Eliminar del DOM solo si se borra en Firebase
            .catch(error => console.error("Error al eliminar la tarjeta: ", error));
    };

    // Acción cuando el usuario presiona "Mover"
    moveButton.onclick = () => {
        moveOptions.style.display = "block"; // Mostrar las opciones de mover
    };

    // Acción cuando el usuario presiona "Aceptar" después de seleccionar una categoría
    acceptMoveButton.onclick = () => {
        const selectedCategory = categorySelect.value;
        moveCardToCategory(cardId, selectedCategory); // Mover la tarjeta a la nueva categoría
        modal.style.display = "none"; // Ocultar el modal
    };
}

// Función para mover una tarjeta a otra categoría
function moveCardToCategory(cardId, newCategory) {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    
    // Primero buscamos la tarjeta en 'cards' (sin categoría)
    const uncategorizedRef = ref(database, `users/${userId}/cards/${cardId}`);
    get(uncategorizedRef).then((snapshot) => {
        if (snapshot.exists()) {
            moveCard(snapshot.val(), cardId, null, newCategory, userId);
        } else {
            // Si no está ahí, buscamos en 'categories'
            const categoriesRef = ref(database, `users/${userId}/categories`);
            get(categoriesRef).then((categoriesSnapshot) => {
                if (categoriesSnapshot.exists()) {
                    let found = false;
                    categoriesSnapshot.forEach((categorySnap) => {
                        const categoryName = categorySnap.key; // Nombre de la categoría
                        const categoryCards = categorySnap.val();
                        if (categoryCards && categoryCards[cardId]) {
                            moveCard(categoryCards[cardId], cardId, categoryName, newCategory, userId);
                            found = true;
                        }
                    });
                    if (!found) console.error("La tarjeta no existe en ninguna categoría.");
                } else {
                    console.error("No hay categorías en la base de datos.");
                }
            }).catch(error => console.error("Error al buscar en categorías:", error));
        }
    }).catch(error => console.error("Error al buscar en tarjetas sin categoría:", error));
}

// Función auxiliar para mover la tarjeta
function moveCard(cardData, cardId, currentCategory, newCategory, userId) {
    let oldPath;
    if (currentCategory) {
        oldPath = `users/${userId}/categories/${currentCategory}/${cardId}`;
    } else {
        oldPath = `users/${userId}/cards/${cardId}`;
    }

    const oldCardRef = ref(database, oldPath);
    const newCardRef = ref(database, `users/${userId}/categories/${newCategory}/${cardId}`);

    // Mover la tarjeta a la nueva categoría
    set(newCardRef, cardData).then(() => {
        // Eliminar la tarjeta de la ubicación anterior
        remove(oldCardRef).then(() => {
            console.log("Tarjeta movida correctamente.");
            loadUserCards(); // Recargar la interfaz
        }).catch(error => console.error("Error al eliminar la tarjeta:", error));
    }).catch(error => console.error("Error al mover la tarjeta:", error));
}



// Cerrar modal al hacer clic fuera del formulario
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
// Función para cargar categorías en el datalist
async function loadCategories() {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const categoriesRef = ref(database, `users/${userId}/categories`);
    
    try {
        const snapshot = await get(categoriesRef);
        const datalist = document.getElementById("category-options");
        datalist.innerHTML = ""; // Limpiar opciones anteriores

        if (snapshot.exists()) {
            Object.keys(snapshot.val()).forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                datalist.appendChild(option);
            });
        }
        
        // Agregar opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = "Sin categoría";
        datalist.appendChild(defaultOption);
    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
}

// Modificar el evento de apertura del modal
addCardBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    loadCategories(); // Cargar categorías al abrir el modal
});
// Modificar el submit del formulario
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const frenchInput = document.getElementById("french-word");
    const spanishInput = document.getElementById("spanish-word");
    const categoryInput = document.getElementById("category");

    let frenchWord = frenchInput.value.trim();
    let spanishWord = spanishInput.value.trim();
    let category = categoryInput.value.trim();

    if (!frenchWord || !spanishWord || !category) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Obtener categorías existentes
    const existingCategories = await getExistingCategories();
    
    // Buscar coincidencia exacta (insensible a mayúsculas)
    const matchedCategory = existingCategories.find(c => 
        c.toLowerCase() === category.toLowerCase()
    );

    // Usar categoría existente si hay coincidencia
    if (matchedCategory) {
        category = matchedCategory;
    } else {
        // Capitalizar nueva categoría
        category = category.charAt(0).toUpperCase() + 
                  category.slice(1).toLowerCase();
    }

    // Guardar en Firebase
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userRef = ref(database, `users/${userId}/categories/${category}`);
        
        try {
            await push(userRef, { 
                french: frenchWord.charAt(0).toUpperCase() + frenchWord.slice(1).toLowerCase(),
                spanish: spanishWord.charAt(0).toUpperCase() + spanishWord.slice(1).toLowerCase()
            });
            
            modal.style.display = "none";
            form.reset();
            loadUserCards();
        } catch (error) {
            console.error("Error guardando tarjeta:", error);
        }
    }
});

// Función auxiliar para obtener categorías existentes
async function getExistingCategories() {
    const user = auth.currentUser;
    if (!user) return [];
    
    const userId = user.uid;
    const categoriesRef = ref(database, `users/${userId}/categories`);
    
    try {
        const snapshot = await get(categoriesRef);
        return snapshot.exists() ? Object.keys(snapshot.val()) : [];
    } catch (error) {
        console.error("Error obteniendo categorías:", error);
        return [];
    }
}

// Función actualizada para mostrar el contador
function updateViewedCounter() {
    const currentCards = currentCategory ? filteredCards : cardArray;
    document.getElementById("viewed-counter").textContent = 
        `${viewedCards.size}/${currentCards.length}${currentCategory ? ` (${currentCategory})` : ''}`;
}


// Función showCard actualizada
function showCard(index) {
    const currentCards = currentCategory ? filteredCards : cardArray;
    totalCards = currentCards.length;

    if (totalCards === 0) return;

    // Manejar fin de categoría
    if (index >= totalCards) {
        handleCategoryTransition();
        index = 0;
    }

    const cardData = currentCards[index];
    
    // Actualizar contenido de la tarjeta
    const [frontText, backText] = isInverted ? 
        [cardData.spanish, cardData.french] : 
        [cardData.french, cardData.spanish];
    
    document.getElementById("card-front-text").textContent = frontText;
    document.getElementById("card-back-text").textContent = backText;

    // Marcar como vista
    viewedCards.add(cardData.id);
    updateViewedCounter();
}

// Nuevas funciones de apoyo
function handleAllCardsViewed() {
    alert("¡Has visto todas las cartas!");
    viewedCards.clear();
    cardIndex = 0;
    
    if (currentCategory) {
        handleCategoryTransition();
    }
}

function handleCategoryTransition() {
    if (currentCategory) {
        const categories = [...new Set(cardArray.map(c => c.category || "Sin categoría"))];
        const currentIndex = categories.indexOf(currentCategory);
        
        if (currentIndex < categories.length - 1) {
            currentCategory = categories[currentIndex + 1];
            filteredCards = cardArray.filter(c => (c.category || "Sin categoría") === currentCategory);
        } else {
            currentCategory = null;
            filteredCards = [...cardArray];
        }
    }
    viewedCards.clear();
}


// Función para obtener la siguiente carta (actualizada)
function getNextCard() {
    const cardInner = document.querySelector(".card-inner");
    const currentCards = currentCategory ? filteredCards : cardArray;

    if (cardInner.classList.contains("flipped")) {
        cardInner.classList.remove("flipped");
    }

    setTimeout(() => {
        if (isShuffled) {
            const remainingCards = currentCards.filter(card => !viewedCards.has(card.id));
            if (remainingCards.length === 0) {
                handleAllCardsViewed();
            } else {
                const randomCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
                cardIndex = currentCards.findIndex(c => c.id === randomCard.id);
            }
        } else {
            cardIndex = (cardIndex + 1) % currentCards.length;
        }
        
        showCard(cardIndex);
    }, 250);
}

// Función para obtener la carta anterior (actualizada)
function getPreviousCard() {
    const currentCards = currentCategory ? filteredCards : cardArray;

    if (isShuffled) {
        const remainingCards = currentCards.filter(card => !viewedCards.has(card.id));
        if (remainingCards.length > 0) {
            const randomCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
            cardIndex = currentCards.findIndex(c => c.id === randomCard.id);
        }
    } else {
        cardIndex = (cardIndex - 1 + currentCards.length) % currentCards.length;
    }
    
    showCard(cardIndex);
}
function invertText(){
    isInverted = !isInverted;
}
// Eventos para los botones de siguiente, anterior, e inversión
nextButton.addEventListener("click", getNextCard);
prevButton.addEventListener("click", getPreviousCard);
invertButton.addEventListener("click", invertText);
// Modificar la función de barajar
shuffleButton.addEventListener("click", () => {
    isShuffled = !isShuffled;
    shuffleButton.textContent = isShuffled ? "Modo Normal" : "Modo Aleatorio";
    viewedCards.clear();
    
    if (isShuffled) {
        cardIndex = Math.floor(Math.random() * filteredCards.length);
    } else {
        cardIndex = 0;
    }
    
    showCard(cardIndex);
});

// Girar la tarjeta al hacer clic
document.getElementById("card").addEventListener("click", () => {
    document.querySelector(".card-inner").classList.toggle("flipped");
    
});
