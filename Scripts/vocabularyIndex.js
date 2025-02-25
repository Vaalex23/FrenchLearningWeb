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

// Función de inicio de sesión con Google
loginButton.addEventListener("click", async () => {
    loginButton.disabled = true; // Evita múltiples solicitudes
       
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("Usuario autenticado:", result.user);
        
        userInfo.textContent = `Hola, ${result.user.displayName}`;
        loginButton.style.display = "none";
        logoutButton.style.display = "inline";
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

// vocabularyIndex.js (añadir al final del archivo)

// Referencia al contenedor de categorías
const categoriesContainer = document.getElementById('categories-container');

// Función para cargar categorías
const loadUserCategories = (userId) => {
    const categoriesRef = ref(database, `users/${userId}/categories`);
    
    onValue(categoriesRef, (snapshot) => {
        categoriesContainer.innerHTML = ''; // Limpiar contenedor
        
        const categories = snapshot.val();
        
        if (categories) {
            Object.keys(categories).forEach(categoryName => {
                const button = document.createElement('button');
                button.textContent = categoryName;
                button.onclick = () => {
                    window.location.href = `../htmlFiles/tarjetasVocabulario.html?category=${encodeURIComponent(categoryName)}`;
                };
                categoriesContainer.appendChild(button);
            });
        } else {
            categoriesContainer.innerHTML = '<p>No tienes categorías guardadas</p>';
        }
    }, (error) => {
        console.error("Error al cargar categorías:", error);
    });
};

// Modificar el observer de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        userInfo.textContent = `¡Hola, ${user.displayName}!`;
        loginButton.style.display = "none";
        logoutButton.style.display = "inline";
        loadUserCategories(user.uid); // Cargar categorías al autenticar
    } else {
        logoutButton.style.display = "none";
        categoriesContainer.innerHTML = ''; // Limpiar al cerrar sesión
    }
});