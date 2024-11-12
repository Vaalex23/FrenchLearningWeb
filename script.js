function checkAnswer() {
    const userInput = document.getElementById("user-input").value.trim().toLowerCase();
    const correctAnswer = "parle";  // Respuesta correcta para este ejemplo
    const answerElement = document.getElementById("correct-answer");
    const flashcard = document.querySelector(".flashcard");

    if (userInput === correctAnswer) {
        flashcard.classList.add("flipped", "correct");
        answerElement.innerText = `Correcto: ${correctAnswer}`;
    } else {
        flashcard.classList.add("flipped", "incorrect");
        answerElement.innerText = `Incorrecto: ${correctAnswer}`;
    }
}
