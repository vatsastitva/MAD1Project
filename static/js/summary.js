document.addEventListener("DOMContentLoaded", function () {
    fetch('/admin/summary_data')
        .then(response => response.json())
        .then(data => {
            const highestScores = data.highestScores;
            const userAttempts = data.userAttempts;

            const subjects = Object.keys(highestScores);
            const topScores = Object.values(highestScores);
            const attemptsData = Object.values(userAttempts);

            // Bar Chart - Top Scores
            const topScoresCtx = document.getElementById('topScoresChart').getContext('2d');
            new Chart(topScoresCtx, {
                type: 'bar',
                data: {
                    labels: subjects,
                    datasets: [{
                        label: 'Top Scores',
                        data: topScores,
                        backgroundColor: [
                            'rgb(255, 69, 69)',  // Red
                            'rgb(54, 163, 235)',  // Blue
                            'rgb(255, 207, 86)',  // Yellow
                            'rgb(75, 192, 192)',  // Teal
                            'rgb(153, 102, 255)', // Purple
                            'rgb(255, 160, 64)'   // Orange
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            ticks: {
                                color: "white" ,
                                font: { size: 18 } // 🔹 X-axis text color
                            },
                            grid: {
                                color: "white" ,
                                borderColor: "white",
                                lineWidth: 2 // 🔹 X-axis grid lines color (lighter white)
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: "white",
                                font: { size: 14 }  // 🔹 Y-axis text color
                            },
                            grid: {
                                color: "white",
                                borderColor: "white",
                                lineWidth: 2  // 🔹 Y-axis grid lines color (lighter white)
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                            labels: {
                                color: "white",
                                font: { size: 16 }  // 🔹 Legend text color
                            }
                        }
                    }
                }
            });

            // Doughnut Chart - User Attempts
            const userAttemptsCtx = document.getElementById('userAttemptsChart').getContext('2d');
            new Chart(userAttemptsCtx, {
                type: 'doughnut',
                data: {
                    labels: subjects,
                    datasets: [{
                        label: 'User Attempts',
                        data: attemptsData,
                        backgroundColor: [
                            'rgb(255, 69, 69)',  // Red
                            'rgb(54, 163, 235)',  // Blue
                            'rgb(255, 207, 86)',  // Yellow
                            'rgb(75, 192, 192)',  // Teal
                            'rgb(153, 102, 255)', // Purple
                            'rgb(255, 160, 64)'   // Orange
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: "white" ,
                                font: { size: 16 } // 🔹 Legend text color
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching summary data:', error));
});

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
}