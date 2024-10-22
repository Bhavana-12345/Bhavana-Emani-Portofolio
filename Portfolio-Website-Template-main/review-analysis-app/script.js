document.getElementById('analyzeBtn').addEventListener('click', analyzeFile);
document.getElementById('themeSwitch').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});

let pieChart;
let barChart;

function analyzeFile() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert("Please upload a file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const text = event.target.result;
        const analysisResult = analyzeText(text);
        displayResults(analysisResult);
    };

    reader.readAsText(file);
}

function analyzeText(text) {
    const words = text.split(/\W+/).filter(word => word.length > 0);
    const totalWords = words.length;

    const positiveWords = ['good', 'excellent', 'amazing', 'love', 'great'];
    const negativeWords = ['bad', 'terrible', 'hate', 'poor', 'awful'];
    const serviceWords = [...positiveWords, ...negativeWords];

    let positiveCount = 0;
    let negativeCount = 0;
    const commonWords = {};

    words.forEach(word => {
        const lowerWord = word.toLowerCase();
        if (serviceWords.includes(lowerWord)) {
            if (positiveWords.includes(lowerWord)) positiveCount++;
            if (negativeWords.includes(lowerWord)) negativeCount++;

            commonWords[lowerWord] = (commonWords[lowerWord] || 0) + 1;
        }
    });

    const positivePercentage = ((positiveCount / totalWords) * 100).toFixed(2);
    const negativePercentage = ((negativeCount / totalWords) * 100).toFixed(2);

    // Get top 5 common service-related words
    const sortedCommonWords = Object.entries(commonWords)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

    return {
        positivePercentage,
        negativePercentage,
        commonWords: sortedCommonWords
    };
}

function displayResults({ positivePercentage, negativePercentage, commonWords }) {
    document.getElementById('positivePercent').innerText = `Positive: ${positivePercentage}%`;
    document.getElementById('negativePercent').innerText = `Negative: ${negativePercentage}%`;
    document.getElementById('commonWordsList').innerHTML = commonWords.map(word => `<li>${word}</li>`).join('');
    document.getElementById('results').classList.remove('hidden');

    renderCharts(positivePercentage, negativePercentage);
}

function renderCharts(positivePercentage, negativePercentage) {
    const pieCtx = document.getElementById('pieChartCanvas').getContext('2d');
    const barCtx = document.getElementById('barChartCanvas').getContext('2d');

    // Destroy previous charts if they exist
    if (pieChart) {
        pieChart.destroy();
    }
    if (barChart) {
        barChart.destroy();
    }

    // Pie Chart
    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Negative'],
            datasets: [{
                label: 'Review Sentiment',
                data: [positivePercentage, negativePercentage],
                backgroundColor: ['#28a745', '#dc3545'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Sentiment Analysis (Pie Chart)'
                }
            }
        }
    });

    // Bar Chart
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Positive', 'Negative'],
            datasets: [{
                label: 'Review Sentiment',
                data: [positivePercentage, negativePercentage],
                backgroundColor: ['#28a745', '#dc3545'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Sentiment Analysis (Bar Chart)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
}
