function redirectToAddQuiz() {
    window.location.href = `/admin/quizzes/add`;
}

function redirectToEditQuiz(quizId) {
    window.location.href = `/admin/quizzes/edit/${quizId}`;
}

function redirectToDeleteQuiz(quizId) {
    window.location.href = `/admin/quizzes/delete/${quizId}`;
}
function redirectToAddQuestion(quizId) {
    window.location.href = `/admin/questions/add/${quizId}`;
}

function showQuizDetails(subject, chapter, ques, marks, event) {
    let popup = document.getElementById("quizDetailsPopup");

    // Set content dynamically
    document.getElementById("subjectname").textContent = subject;
    document.getElementById("chaptername").textContent = chapter;
    document.getElementById("totalques").textContent = ques;
    document.getElementById("totalmarks").textContent = marks;

    // Position the popup near the clicked element
    let rect = event.target.getBoundingClientRect();
    popup.style.left = `${rect.right + window.scrollX + 0}px`;  // Offset from the link
    popup.style.top = `${rect.top + window.scrollY + 30}px`;    // Offset downward
    popup.style.display = "block";
}

// Hide popup when clicking outside
document.addEventListener("click", function(event) {
    let popup = document.getElementById("quizDetailsPopup");
    if (!popup.contains(event.target) && !event.target.matches(".quiz-link")) {
        popup.style.display = "none";
    }
});

function hideQuizPopup() {
    document.getElementById("quizDetailsPopup").style.display = "none";
}
