// Función para cargar los archivos JSON
async function loadJSONFiles() {
    const prepositions = ['à', 'après', 'avant', 'chez', 'contre', 'dans', 'de', 'depuis', 'devant', 'en', 'sans'];
    let questions = [];
    
    // Cargar un archivo aleatorio para cada preposición
    for (let i = 0; i < prepositions.length; i++) {
        const file = `../JsonFiles/Excercises/Prepositions/Preposition_${prepositions[i]}.json`; // Ruta a los archivos JSON
        
        // Intentar cargar el archivo JSON
        try {
            const response = await fetch(file);
            const data = await response.json();

            // Seleccionar una frase aleatoria del archivo
            const randomIndex = Math.floor(Math.random() * data.length);
            const randomQuestion = data[randomIndex];
            
            questions.push(randomQuestion);
        } catch (error) {
            console.error(`No se pudo cargar el archivo ${file}:`, error);
        }
    }
    
    // Mostrar las preguntas seleccionadas aleatoriamente en el HTML
    displayQuestions(questions);
}

// Función para mostrar las preguntas en el HTML
function displayQuestions(questions) {
    const questionsContainer = document.getElementById('questions-container');
    questions.forEach((question, index) => {
        // Crear un contenedor para cada pregunta
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question-container');
        
        // Crear el texto de la pregunta
        const questionText = document.createElement('p');
        questionText.textContent = question.frase;
        questionDiv.appendChild(questionText);
        
        // Crear el select para las preposiciones
        const select = document.createElement('select');
        select.id = `answer${index + 1}`;
        const options = ['à', 'après', 'avant', 'chez', 'contre', 'dans', 'de', 'depuis', 'devant', 'en', 'sans'];
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
        questionDiv.appendChild(select);
        
        // Agregar la explicación vacía por ahora
        const explanationDiv = document.createElement('div');
        explanationDiv.id = `explanation${index + 1}`;
        questionDiv.appendChild(explanationDiv);
        
        // Agregar la pregunta al contenedor principal
        questionsContainer.appendChild(questionDiv);
    });
}

// Función para verificar las respuestas del usuario
function verifyAnswers() {
    const questions = document.querySelectorAll('.question-container');
    questions.forEach((questionDiv, index) => {
        const userAnswer = document.getElementById(`answer${index + 1}`).value;
        const explanationDiv = document.getElementById(`explanation${index + 1}`);
        const correctAnswer = questionsData[index].respuesta;
        const explanation = questionsData[index].explicacionES;
        
        if (userAnswer === correctAnswer) {
            explanationDiv.textContent = explanation;
            explanationDiv.style.color = 'green';
        } else {
            explanationDiv.textContent = `Preposición correcta: ${correctAnswer} - ${explanation}`;
            explanationDiv.style.color = 'red';
        }
    });
}

// Cargar los archivos JSON y mostrar las preguntas
window.onload = loadJSONFiles;
