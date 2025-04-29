function redirectToView(quizId) {
    window.location.href = "/user/view_quiz/" + quizId;
}

function redirectToStart(quizId) {
    window.location.href = "/user/start_quiz/" + quizId;
}

function searchItems(event) {
    event.preventDefault(); // Prevent form submission

    const query = document.getElementById("search-input").value.trim();
    if (query.length === 0) {
        document.getElementById("searchResultsDropdown").style.display = "none";
        return;
    }

    fetch(`/user/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            console.log("Search Results:", data); // Debugging output
            displaySearchResults(data);
        })
        .catch(error => console.error("Error fetching search results:", error));
}

function displaySearchResults(data) {
    let dropdown = document.getElementById("searchResultsDropdown");
    dropdown.innerHTML = "";

    if (data.quiz_scores.length === 0 && data.quiz_date.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    dropdown.style.display = "block";

    // Append Quiz Scores
    if (data.quiz_scores.length > 0) {
        dropdown.innerHTML += `<h6 class="dropdown-header"><strong>Quiz Scores</strong></h6>`;
        data.quiz_scores.forEach(qs => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#"><strong>Quiz:</strong> ${qs.quiz_name} <strong>|</strong> <strong>Subject:</strong> ${qs.subject_name} <strong>|</strong> Score: ${qs.score}</a>`;
        });
        dropdown.innerHTML += `<hr class="dropdown-divider">`;
    }

    // Append Quiz Dates
    if (data.quiz_date.length > 0) {
        dropdown.innerHTML += `<h6 class="dropdown-header"><strong>Quiz Dates</strong></h6>`;
        data.quiz_date.forEach(qd => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#"><strong>Quiz:</strong> ${qd.quiz_name} <strong>|</strong> <strong>Subject:</strong> ${qd.subject_name} <strong>|</strong> Date: ${qd.quiz_date}</a>`;
        });
    }
}
