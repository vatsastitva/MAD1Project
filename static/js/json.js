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
                        backgroundColor: ['#6baed6', '#31a354', '#fdae61'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
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
                        backgroundColor: ['#1f77b4', '#ff7f0e', '#2ca02c']
                    }]
                },
                options: {
                    responsive: true
                }
            });
        })
        .catch(error => console.error('Error fetching summary data:', error));
});