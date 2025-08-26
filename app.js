// app.js

// IMPORTANT: Replace this with the URL you get after publishing your Google Sheet to the web as a CSV.
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1fGxnJfI-Rt_SFqUeN59PV73950wTqVvih0Rqj81MESQ/edit?usp=drivesdk';

let dailyData = [];
let myChart;

// Function to fetch data from the public Google Sheet CSV URL
async function fetchData() {
    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1); // Split by lines and remove the header row

        // --- MODIFIED PARSING LOGIC TO MATCH YOUR SHEET'S COLUMN ORDER ---
        dailyData = rows.map(row => {
            const columns = row.split(',');
            // Assuming the columns are Ticker, Date, Close, Open, High, Low
            const [ticker, dateStr, close, open, high, low] = columns;

            return {
                x: new Date(dateStr),
                o: parseFloat(open),
                h: parseFloat(high),
                l: parseFloat(low),
                c: parseFloat(close),
            };
        }).filter(d => d.h && !isNaN(d.o)); // Filter out any incomplete or invalid rows, using High as a check

        // Initialize the chart with daily data
        renderChart(dailyData, 'candlestick');

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('chartContainer').innerHTML = '<h2>Failed to load chart data. Please check your Google Sheet URL.</h2>';
    }
}

// ---- The rest of the code is unchanged and remains exactly the same ----

// Function to aggregate daily data into weekly or monthly data
function aggregateData(data, timeframe) {
    if (timeframe === 'daily') {
        return data; // No aggregation needed
    }

    const aggregated = [];
    let currentPeriod = null;

    data.forEach(item => {
        const date = item.x;
        let periodKey;

        if (timeframe === 'weekly') {
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            periodKey = `${d.getUTCFullYear()}-${weekNo}`;
        } else if (timeframe === 'monthly') {
            periodKey = `${date.getFullYear()}-${date.getMonth()}`;
        }

        if (!currentPeriod || currentPeriod.key !== periodKey) {
            if (currentPeriod) {
                aggregated.push(currentPeriod.data);
            }
            currentPeriod = {
                key: periodKey,
                data: {
                    x: date,
                    o: item.o,
                    h: item.h,
                    l: item.l,
                    c: item.c,
                }
            };
        } else {
            currentPeriod.data.c = item.c;
            currentPeriod.data.h = Math.max(currentPeriod.data.h, item.h);
            currentPeriod.data.l = Math.min(currentPeriod.data.l, item.l);
        }
    });

    if (currentPeriod) {
        aggregated.push(currentPeriod.data);
    }
    
    return aggregated;
}

// Function to render the chart using Chart.js
function renderChart(data, chartType) {
    const ctx = document.getElementById('myChart').getContext('2d');

    let chartData;
    if (chartType === 'line') {
        chartData = data.map(d => ({
            x: d.x,
            y: d.c
        }));
    } else {
        chartData = data;
    }

    const chartConfig = {
        type: chartType,
        data: {
            datasets: [{
                label: 'Price',
                data: chartData,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: chartType === 'monthly' ? 'month' : 'day'
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.type === 'candlestick') {
                                const dataPoint = context.raw;
                                return `O: ${dataPoint.o.toFixed(2)}, H: ${dataPoint.h.toFixed(2)}, L: ${dataPoint.l.toFixed(2)}, C: ${dataPoint.c.toFixed(2)}`;
                            }
                            return `Price: ${context.raw.y.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    };

    if (myChart) {
        myChart.data.datasets[0].data = chartData;
        myChart.config.type = chartConfig.type;
        myChart.update();
    } else {
        myChart = new Chart(ctx, chartConfig);
    }
}

// Add event listeners to the buttons
document.addEventListener('DOMContentLoaded', () => {
    fetchData(); // Fetch the data on page load

    document.getElementById('dailyBtn').addEventListener('click', () => {
        renderChart(dailyData, 'candlestick');
    });

    document.getElementById('weeklyBtn').addEventListener('click', () => {
        const weeklyData = aggregateData(dailyData, 'weekly');
        renderChart(weeklyData, 'candlestick');
    });

    document.getElementById('monthlyBtn').addEventListener('click', () => {
        const monthlyData = aggregateData(dailyData, 'monthly');
        renderChart(monthlyData, 'line');
    });
});
