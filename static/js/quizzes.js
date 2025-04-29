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


// function searchItems(event) {
//     event.preventDefault();  // Prevent form submission
    
//     let query = document.getElementById("search-input").value.toLowerCase();
//     let cards = document.querySelectorAll(".quiz-card");

//     cards.forEach(card => {
//         let title = card.querySelector(".quiz-link").textContent.toLowerCase();
        
//         if (title.includes(query)) {
//             card.style.display = "block";
//         } else {
//             card.style.display = "none";
//         }
//     });
// }
function searchItems(event) {
    event.preventDefault(); // Prevent form submission

    const query = document.getElementById("search-input").value.trim();
    if (query.length === 0) {
        document.getElementById("searchResultsDropdown").style.display = "none";
        return;
    }

    fetch(`/admin/search?q=${query}`) // Ensure correct route
        .then(response => response.json())
        .then(data => {
            console.log("Search Results:", data); // Debugging output
            displaySearchResults(data);
        })
        .catch(error => console.error("Error fetching search results:", error));
}

function displaySearchResults(data) {
    let dropdown = document.getElementById("searchResultsDropdown");

    // Clear old results
    dropdown.innerHTML = "";

    if (data.users.length === 0 && data.subjects.length === 0 && data.quizzes.length === 0) {
        dropdown.style.display = "none"; // Hide if no results
        return;
    }

    dropdown.style.display = "block"; // Show dropdown

    // Append Users
    if (data.users.length > 0) {
        dropdown.innerHTML += `<h6 class="dropdown-header"><strong>Users</strong></h6>`;
        data.users.forEach(user => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#">ID: ${user.id} <strong>${user.name}</strong></a>`;
        });
        dropdown.innerHTML += `<hr class="dropdown-divider ">`;
    }

    // Append Subjects
    if (data.subjects.length > 0) {
        dropdown.innerHTML += `<h6 class="dropdown-header"><strong>Subjects</strong></h6>`;
        data.subjects.forEach(subject => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#"><strong>${subject.name}</strong></a>`;
        });
        dropdown.innerHTML += `<hr class="dropdown-divider ">`;
    }

    // Append Quizzes
    if (data.quizzes.length > 0) {
        dropdown.innerHTML += `<h6 class="dropdown-header"><strong>Quizzes</strong></h6>`;
        data.quizzes.forEach(quiz => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#"><strong>${quiz.name}</strong> - ${quiz.subject}(Ch: ${quiz.chapter_id})</a>`;
        });
    }


    // SELECT q.subject_name, COUNT(q.id) AS quiz_count
    //     FROM quiz q
    //     GROUP BY q.subject_name
}
    