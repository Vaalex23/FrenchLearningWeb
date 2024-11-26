const jsonFiles = [
    "../JsonFiles/Excercises/Prepositions/Preposition_à.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_après.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_avant.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_chez.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_contre.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_dans.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_de.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_depuis.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_devant.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_en.json",
    "../JsonFiles/Excercises/Prepositions/Preposition_sans.json",
];

const prepositions = ["à", "après", "avant", "chez", "contre", "dans", "de", "depuis", "devant", "en", "sans"];
let questionsData = [];

async function loadRandomQuestions() {
    const container = document.getElementById("questions-container");
    const usedIndexes = new Set();

    for (let file of jsonFiles) {
        try {
            const response = await fetch(file);
            const data = await response.json();

            // Choose a random question from the file
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * data.length);
            } while (usedIndexes.has(randomIndex));

            usedIndexes.add(randomIndex);
            const question = data[randomIndex];
            questionsData.push(question);

            // Create the question HTML
            const questionRow = document.createElement("div");
            questionRow.className = "question";
            questionRow.innerHTML = `
                <span class="phrase">${question.frase}</span>
                <select>
                    <option value="">---</option>
                    ${prepositions.map(p => `<option value="${p}">${p}</option>`).join("")}
                </select>
            `;
            container.appendChild(questionRow);
        } catch (error) {
            console.error(`Failed to load file ${file}: ${error}`);
        }
    }
}

function verifyAnswers() {
    const container = document.getElementById("questions-container");
    const questionRows = container.querySelectorAll(".question");

    questionRows.forEach((row, index) => {
        const dropdown = row.querySelector("select");
        const userAnswer = dropdown.value;
        const correctAnswer = questionsData[index].respuesta;

        // Reset styles
        dropdown.style.color = "";
        dropdown.style.textDecoration = "";

        // Remove old feedback if exists
        const existingCorrectAnswer = row.querySelector(".correct-answer");
        if (existingCorrectAnswer) existingCorrectAnswer.remove();

        const existingExplanation = row.querySelector(".explanation");
        if (existingExplanation) existingExplanation.remove();

        if (userAnswer === correctAnswer) {
            dropdown.style.color = "green";
        } else {
            dropdown.style.color = "red";
            dropdown.style.textDecoration = "line-through";

            // Show the correct answer
            const correctAnswerElement = document.createElement("div");
            correctAnswerElement.className = "correct-answer";
            correctAnswerElement.textContent = `Correct answer: ${correctAnswer}`;
            row.appendChild(correctAnswerElement);

            // Show the explanation
            const explanationDisplay = document.createElement("div");
            explanationDisplay.className = "explanation";
            explanationDisplay.textContent = questionsData[index].explicacionES;
            row.appendChild(explanationDisplay);
        }
    });
}

document.getElementById("verifyButton").onclick = verifyAnswers;

// Load random questions on page load
loadRandomQuestions();
