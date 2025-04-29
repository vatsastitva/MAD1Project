document.addEventListener("DOMContentLoaded", function () {
    const monthNames = {
        "01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June",
        "07": "July", "08": "August", "09": "September", "10": "October", "11": "November", "12": "December"
    };

    fetch('/user/summary_data')
        .then(response => response.json())
        .then(data => {
            const subjects = Object.keys(data.subjectQuizCounts);
            const quizCounts = Object.values(data.subjectQuizCounts);

            // Fix: Correctly map month numbers to names
            const months = Object.keys(data.monthlyQuizAttempts).map(num => monthNames[num] || num);
            const monthlyAttempts = Object.values(data.monthlyQuizAttempts);

            // Bar Chart - Subject Wise Quiz Count
            const subjectQuizCtx = document.getElementById('subjectQuizChart').getContext('2d');
            new Chart(subjectQuizCtx, {
                type: 'bar',
                data: {
                    labels: subjects,
                    datasets: [{
                        label: 'Percentage Obtained',
                        data: quizCounts,
                        backgroundColor: [
                            'rgb(255, 69, 69)',
                            'rgb(54, 163, 235)',
                            'rgb(255, 207, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(153, 102, 255)',
                            'rgb(255, 160, 64)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            //min: 0,
                            max:100,
                            ticks: {
                                stepSize: 10,

                                color: "white",
                                font: { size: 14 }
                            },
                            grid: {
                                color: "white",
                                borderColor: "white",
                                lineWidth: 2
                            }
                        },
                        x: {
                            ticks: {
                                color: "white",
                                font: { size: 18 }
                            },
                            grid: {
                                color: "white",
                                borderColor: "white",
                                lineWidth: 2
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                            labels: {
                                color: "white",
                                font: { size: 18 }
                            }
                        },
                        tooltip:{
                            callbacks: {
                                label: function (context){
                                    return `Score: ${(context.parsed.y).toFixed(2)}%`;
                                }
                            }
                        }
                    }
                }
            });

            // Pie Chart - Monthly Quiz Attempts
            const monthlyQuizCtx = document.getElementById('monthlyQuizChart').getContext('2d');
            new Chart(monthlyQuizCtx, {
                type: 'doughnut',
                data: {
                    labels: months,  // Now correctly mapped to month names
                    datasets: [{
                        label: 'Quizzes Attempted',
                        data: monthlyAttempts,
                        backgroundColor: [
                            'rgb(255, 69, 69)',
                            'rgb(54, 163, 235)',
                            'rgb(255, 207, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(153, 102, 255)',
                            'rgb(255, 160, 64)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: "white",
                                font: { size: 16 }
                            }
                            
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching summary data:', error));
});