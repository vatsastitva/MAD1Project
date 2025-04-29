document.addEventListener("DOMContentLoaded", function () {
    fetch('/admin/summary_data')
        .then(response => response.json())
        .then(data => {
            //const highestScores = data.highestScores;
            const averageScores = data.averageScores;
            const userAttempts = data.userAttempts;

            const subjects = Object.keys(averageScores);
            //const topScores = Object.values(highestScores);
            const avgScores = Object.values(averageScores);
            const attemptsData = Object.values(userAttempts);

            // Bar Chart - Top Scores
            const topScoresCtx = document.getElementById('topScoresChart').getContext('2d');
            new Chart(topScoresCtx, {
                type: 'bar',
                data: {
                    labels: subjects,
                    datasets: [{
                        //label: ' Avg Score(%) ',
                        data: avgScores,
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
                            //min: 0,
                            max:100,
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
                        },
                        tooltip: {
                            //titleFont: { size: 12, weight: 'bold' },
                            //bodyFont: { size: 12, weight: 'bold' },
                            //backgroundColor: 'rgba(0, 0, 0, 0.89)', // 🔸 Tooltip background
                            //titleColor: 'white',                  // 🔸 Title text color
                            //bodyColor: 'white',                   // 🔸 Body text color
                            //borderColor: 'white',                 // 🔸 Optional border
                            //borderWidth: 2,
                            callbacks: {
                                label: function (context){
                                    return ` Avg Score : ${(context.parsed.y).toFixed(2)}%`;
                                }
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