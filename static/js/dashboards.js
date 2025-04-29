function redirectToEditSubject(subjectId) {
    window.location.href = `/admin/subjects/edit/${subjectId}`;
}
function redirectToDeleteSubject(subjectId) {
    window.location.href = `/admin/subjects/delete/${subjectId}`;
}

function redirectToAddChapter(subjectId) {
    window.location.href = `/admin/chapters/add/${subjectId}`;
}
function redirectToAddSubject() {
    window.location.href = `/admin/add_subject`;
}



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
            dropdown.innerHTML += `<a class="dropdown-item" href="#"> User ID: ${user.id} | Name: <strong>${user.name}</strong></a>`;
        });
        dropdown.innerHTML += `<hr class="dropdown-divider ">`;
    }

    // Append Subjects
    if (data.subjects.length > 0) {
        dropdown.innerHTML += `<h6 class="dropdown-header"><strong>Subjects</strong></h6>`;
        data.subjects.forEach(subject => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#">Subject: <strong>${subject.name}</strong></a>`;
        });
        dropdown.innerHTML += `<hr class="dropdown-divider ">`;
    }

    // Append Quizzes
    if (data.quizzes.length > 0) {
        dropdown.innerHTML += `<h6 class="dropdown-header"><strong>Quizzes</strong></h6>`;
        data.quizzes.forEach(quiz => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#"> Quiz: <strong>${quiz.name}</strong> | Subject: ${quiz.subject} | Chapter: ${quiz.chapter_id}</a>`;
        });
    }
}