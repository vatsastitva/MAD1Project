
// function searchItems(event) {
//     event.preventDefault();  // Prevent form submission
    
//     let query = document.getElementById("search-input").value.toLowerCase();
//     let cards = document.querySelectorAll(".subject-card");

//     cards.forEach(card => {
//         let title = card.querySelector("h4").textContent.toLowerCase();
        
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
        dropdown.innerHTML += `<h6 class="dropdown-header">Users</h6>`;
        data.users.forEach(user => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#">${user.name} | (ID: ${user.id})</a>`;
        });
    }

    // Append Subjects
    if (data.subjects.length > 0) {
        dropdown.innerHTML += `<h6 class="dropdown-header">Subjects</h6>`;
        data.subjects.forEach(subject => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#">${subject.name}</a>`;
        });
    }

    // Append Quizzes
    if (data.quizzes.length > 0) {
        dropdown.innerHTML += `<h6 class="dropdown-header">Quizzes</h6>`;
        data.quizzes.forEach(quiz => {
            dropdown.innerHTML += `<a class="dropdown-item" href="#"><strong>${quiz.name}</strong> | ${quiz.subject} | (Ch: ${quiz.chapter_id})</a>`;
        });
    }
}
