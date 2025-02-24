import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { 
    getDatabase, ref, get, set, remove
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
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Lista de adverbios en formato JSON
const adverbs = [
    { "french": "L'artère", "spanish": "La arteria" },
    { "french": "L'articulation", "spanish": "La articulación" },
    { "french": "Le menton", "spanish": "El mentón" },
    { "french": "La bouche", "spanish": "La boca" },
    { "french": "Le bras", "spanish": "El brazo" },
    { "french": "La tête", "spanish": "La cabeza" },
    { "french": "La hanche", "spanish": "La cadera" },
    { "french": "Le visage", "spanish": "La cara" },
    { "french": "Le sourcil", "spanish": "La ceja" },
    { "french": "Le cerveau", "spanish": "El cerebro" },
    { "french": "La taille", "spanish": "La cintura" },
    { "french": "Le coude", "spanish": "El codo" },
    { "french": "La colonne vertébrale", "spanish": "La columna vertebral" },
    { "french": "Le cœur", "spanish": "El corazón" },
    { "french": "Le flanc", "spanish": "El costado" },
    { "french": "La côte", "spanish": "La costilla" },
    { "french": "Le crâne", "spanish": "El cráneo" },
    { "french": "Le cou", "spanish": "El cuello" },
    { "french": "Le doigt", "spanish": "El dedo" },
    { "french": "L'annulaire", "spanish": "El dedo anular" },
    { "french": "Le majeur", "spanish": "El dedo corazón" },
    { "french": "Le pouce", "spanish": "El dedo gordo" },
    { "french": "L'index", "spanish": "El dedo índice" },
    { "french": "Le petit doigt", "spanish": "El dedo meñique" },
    { "french": "La dent", "spanish": "El diente" },
    { "french": "La gencive", "spanish": "La encía" },
    { "french": "Le dos", "spanish": "La espalda" },
    { "french": "L'épine dorsale", "spanish": "La espina dorsal" },
    { "french": "L'estomac", "spanish": "El estómago" },
    { "french": "Le front", "spanish": "La frente" },
    { "french": "Les organes génitaux", "spanish": "Los genitales" },
    { "french": "Le foie", "spanish": "El hígado" },
    { "french": "L'épaule", "spanish": "El hombro" },
    { "french": "L'os", "spanish": "El hueso" },
    { "french": "La lèvre", "spanish": "El labio" },
    { "french": "La mâchoire", "spanish": "La mandíbula" },
    { "french": "La main", "spanish": "La mano" },
    { "french": "La joue", "spanish": "La mejilla" },
    { "french": "Le membre", "spanish": "El miembro" },
    { "french": "Le poignet", "spanish": "La muñeca" },
    { "french": "Le muscle", "spanish": "El músculo" },
    { "french": "La cuisse", "spanish": "El muslo" },
    { "french": "La fesse", "spanish": "La nalga" },
    { "french": "Le nez", "spanish": "La nariz" },
    { "french": "Le nerf", "spanish": "El nervio" },
    { "french": "La paupière", "spanish": "El párpado" },
    { "french": "Le pied", "spanish": "El pie" },
    { "french": "La peau", "spanish": "La piel" },
    { "french": "La jambe", "spanish": "La pierna" },
    { "french": "Le poumon", "spanish": "El pulmón" },
    { "french": "Le poing", "spanish": "El puño" },
    { "french": "Le rein", "spanish": "El riñón" },
    { "french": "Le genou", "spanish": "La rodilla" },
    { "french": "Le sang", "spanish": "La sangre" },
    { "french": "Le talon", "spanish": "El talón" },
    { "french": "La cheville", "spanish": "El tobillo" },
    { "french": "L'ongle", "spanish": "La uña" },
    { "french": "La veine", "spanish": "La vena" },
    { "french": "La vertèbre", "spanish": "La vértebra" }
]

// Función para insertar los adverbios en la base de datos
function insertAdverbs() {
    const categoryRef = database.ref('users/WcT569oObqhffyalDvrREkeKoT22/categories/Cuerpo Humano');

    adverbs.forEach((adverb, index) => {
        const newAdverbRef = categoryRef.push(); // Genera una clave única para cada adverbio
        newAdverbRef.set({
            french: adverb.french,
            spanish: adverb.spanish
        })
        .then(() => {
            console.log(`Adverbio ${index + 1}: ${adverb.french} añadido correctamente.`);
        })
        .catch((error) => {
            console.error(`Error al añadir ${adverb.french}:`, error);
        });
    });
}
insertAdverbs();