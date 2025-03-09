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

// Lista de adverbios en formato JSON
const list =[
    { "french": "L'agence de voyages", "spanish": "La agencia de viajes" },
    { "french": "L'agence d'assurances", "spanish": "La agencia de seguros" },
    { "french": "L'agence immobilière", "spanish": "La agencia inmobiliaria" },
    { "french": "Le magasin d'alimentation", "spanish": "La alimentación" },
    { "french": "Le magasin d'antiquités", "spanish": "Las antigüedades" },
    { "french": "La banque", "spanish": "El banco" },
    { "french": "Le bar", "spanish": "El bar" },
    { "french": "La menuiserie", "spanish": "La carpintería (de muebles)" },
    { "french": "La charpenterie", "spanish": "La carpintería (de tejado)" },
    { "french": "Le casino", "spanish": "El casino" },
    { "french": "L'institut de beauté", "spanish": "El centro de belleza" },
    { "french": "Le centre d'esthétique", "spanish": "El centro de estética" },
    { "french": "Le cinéma", "spanish": "El cine" },
    { "french": "La boîte de nuit", "spanish": "La discoteca" },
    { "french": "La boutique de corsets", "spanish": "La corsetería" },
    { "french": "La droguerie", "spanish": "La droguería" },
    { "french": "Le bureau de tabac", "spanish": "El estanco" },
    { "french": "La quincaillerie", "spanish": "La ferretería" },
    { "french": "La fruiterie", "spanish": "La frutería" },
    { "french": "La station-service", "spanish": "La gasolinera" },
    { "french": "L'hôpital", "spanish": "El hospital" },
    { "french": "Le magasin de jouets", "spanish": "La juguetería" },
    { "french": "Le kiosque", "spanish": "El kiosco" },
    { "french": "La librairie", "spanish": "La librería" },
    { "french": "La maroquinerie", "spanish": "La marroquinería" },
    { "french": "Le musée", "spanish": "El museo" },
    { "french": "La papeterie", "spanish": "La papelería" },
    { "french": "Le salon de coiffure", "spanish": "La peluquería" },
    { "french": "La poissonerie", "spanish": "La pescadería" },
    { "french": "La parfumerie", "spanish": "La perfumería" },
    { "french": "La boutique de tailleur", "spanish": "La sastrería" }
]
const botonMigrar = document.getElementById("boton");
botonMigrar.addEventListener("click" , insertAdverbs);
onAuthStateChanged(auth, (user) => {
    if (user) {
        
        insertAdverbs(user.uid);
    }
});
// Función para insertar los adverbios en la base de datos
function insertAdverbs(userId) {
    const categoryRef = ref(database, `users/${userId}/categories/Ciudad`);
    list.forEach((adjetivo, index) => {
        const newAdverbRef = push(categoryRef); // Genera una clave única
        set(newAdverbRef, {
            french: adjetivo.french,
            spanish: adjetivo.spanish
        })
        .then(() => {
            console.log(`Adverbio ${index + 1}: ${adjetivo.french} añadido correctamente.`);
        })
        .catch((error) => {
            console.error(`Error al añadir ${adjetivo.french}:`, error);
        });
    });
}