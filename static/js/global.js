function searchItems(event, userType) {
    event.preventDefault(); // Prevent form submission

    const query = document.getElementById("search-input").value.trim();
    const dropdown = document.getElementById("searchResultsDropdown");
    dropdown.innerHTML = "";

    if (query.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    const endpoint = userType === "admin" ? `/admin/search?q=${query}` : `/user/search?q=${query}`;

    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            console.log("Search Results:", data); // Debugging
            dropdown.innerHTML = ""; // Clear previous
            dropdown.style.display = "block";

            if (userType === "admin") {
                const { users, subjects, quizzes } = data;

                if (users.length === 0 && subjects.length === 0 && quizzes.length === 0) {
                    dropdown.style.display = "none";
                    return;
                }

                if (users.length > 0) {
                    dropdown.innerHTML += `<h6 class="dropdown-header">Users</h6>`;
                    users.forEach(user => {
                        dropdown.innerHTML += `<a class="dropdown-item" href="#">${user.name} | (ID: ${user.id})</a>`;
                    });
                    dropdown.innerHTML += `<hr class="dropdown-divider">`;
                }

                if (subjects.length > 0) {
                    dropdown.innerHTML += `<h6 class="dropdown-header">Subjects</h6>`;
                    subjects.forEach(subject => {
                        dropdown.innerHTML += `<a class="dropdown-item" href="#">${subject.name}</a>`;
                    });
                    dropdown.innerHTML += `<hr class="dropdown-divider">`;
                }

                if (quizzes.length > 0) {
                    dropdown.innerHTML += `<h6 class="dropdown-header">Quizzes</h6>`;
                    quizzes.forEach(quiz => {
                        dropdown.innerHTML += `<a class="dropdown-item" href="#"><strong>${quiz.name}</strong> | ${quiz.subject} | (Ch: ${quiz.chapter_id})</a>`;
                    });
                    
                }

            } else {
                const { quiz_scores, quiz_date } = data;

                if (quiz_scores.length === 0 && quiz_date.length === 0) {
                    dropdown.style.display = "none";
                    return;
                }

                if (quiz_scores.length > 0) {
                    dropdown.innerHTML += `<h6 class="dropdown-header"><strong>Quiz Scores</strong></h6>`;
                    quiz_scores.forEach(qs => {
                        dropdown.innerHTML += `<a class="dropdown-item" href="#"><strong>Quiz:</strong> ${qs.quiz_name} <strong>|</strong> <strong>Subject:</strong> ${qs.subject_name} <strong>|</strong> Score: ${qs.score}</a>`;
                    });
                    dropdown.innerHTML += `<hr class="dropdown-divider">`;
                }

                if (quiz_date.length > 0) {
                    dropdown.innerHTML += `<h6 class="dropdown-header"><strong>Quiz Dates</strong></h6>`;
                    quiz_date.forEach(qd => {
                        dropdown.innerHTML += `<a class="dropdown-item" href="#"><strong>Quiz:</strong> ${qd.quiz_name} <strong>|</strong> <strong>Subject:</strong> ${qd.subject_name} <strong>|</strong> Date: ${qd.quiz_date}</a>`;
                    });
                }
            }
        })
        .catch(error => {
            console.error("Error fetching search results:", error);
            dropdown.style.display = "none";
        });
}