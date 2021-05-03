/*
                    BeeLogger

        JS for dashboard and display page
    
    Copyright (c) 2020-2021 Fabian R., Sönke K.
*/

// Global variables
var last_measured;
var response;

document.addEventListener('DOMContentLoaded', async () => {
    // Initializing used Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
    M.Modal.init(document.querySelectorAll('.modal'), {});
    M.FormSelect.init(document.querySelectorAll('select'), {});
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {});

    response = await fetchData();

    // Setting up background task for keeping the 'measured' date up-to-date
    setInterval(() => {
        var measured = luxon.DateTime.fromISO(last_measured).toRelative({ locale: 'de' });
        document.querySelector('#updated').innerHTML = measured;
    }, 15000);

    // Initializing google charts
    await google.charts.load('current', {
        'packages': ['corechart'],
        // Callback to just draw charts and show data if charts lib is loaded
        'callback': async () => {
            await updateData();
            await drawCharts();
            checkbox = document.getElementById("scale-switch");
            checkbox.addEventListener("change", async function(e) {
                element = document.getElementById("scale-switch");
                if (element.checked) { await drawCompareChart(true); }
                else {await drawCompareChart(false); }
            });
            checkbox.checked = false;

            // Event handler for automatically resizing charts on screen resize
            window.onresize = async () => {
                await drawCharts();
            };
        }
    });

});

// ISO date format => 2021-04-25
var date = luxon.DateTime.now().toISODate();

async function fetchData() {
    var compareValue = document.getElementById('dropSelect');
    var url;
    
    // Handling date range dropdown and just fetching data for the corresponding time frame
    if (compareValue) {
        switch (compareValue.options[compareValue.selectedIndex].value) {
            // Today
            case '1':
                url = '/api/data/get?from=' + date + '&to=' + date;
                break;
            
            // Week
            case '2':
                var dateTwo = luxon.DateTime.now().minus({ weeks: 1 }).toISODate();
                url = '/api/data/get?from=' + dateTwo + '&to=' + date;
                break;
            
            // Month
            case '3':
                var dateTwo = luxon.DateTime.now().minus({ months: 1 }).toISODate();
                url = '/api/data/get?from=' + dateTwo + '&to=' + date
                break;

            // Year
            case '4':
                var dateTwo = luxon.DateTime.now().minus({ years: 1 }).toISODate();
                url = '/api/data/get?from=' + dateTwo + '&to=' + date;
                break;
        }

        response = await fetch(url);
    
    // If no view is selected, fetch current data
    } else response = await fetch('/api/data/get?from=' + date + '&to=' + date);

    // Checking if valid data is returned and not some error
    if(!response.ok) {
        document.getElementById('loading-title').innerHTML = '❌ Momentan nicht verfügbar';
        document.getElementById('loading-text').innerHTML = `
            <hr>
            <b>Das Laden der Daten ist fehlgeschlagen!</b><br>
            Dies kann daran liegen, dass unsere Datenschnittstelle gerade offline ist,
            wir Wartungen vornehmen oder aufgrund eines Vorfalls keine aktuellen Daten
            aufgezeichnet wurden.<hr>
            <b>Schaue einfach später nochmal vorbei</b>, wir haben das sicher bald repariert!
        `;
        document.getElementById('loading-progress').classList.remove('progress');
    }

    return await response.json();
}

// Function for updating the 'current data' section
async function updateData() {
    response = await fetchData();
    
    last_measured = response[Object.keys(response).length - 1].measured;
    var measured = luxon.DateTime.fromISO(last_measured).toRelative({ locale: 'de' });

    document.querySelector('main').classList.remove('hide');
    document.querySelector('#temperature').innerHTML = response[Object.keys(response).length - 1].temperature + ' °C';
    document.querySelector('#weight').innerHTML = response[Object.keys(response).length - 1].weight + ' kg';
    document.querySelector('#humidity').innerHTML = response[Object.keys(response).length - 1].humidity + ' %';
    document.querySelector('#updated').innerHTML = measured;
    document.querySelector('#loading').className = 'hide';
}

async function getStatistics() {
    let req = await fetch('/api/stats');
    let res = await req.json();

    document.querySelector('#inserted-count').innerHTML = res['insert_calls'];
    document.querySelector('#requested-count').innerHTML = res['data_calls'];
    document.querySelector('#website-count').innerHTML = res['website'];
}

async function drawCharts() {
    await drawCompareChart(false);
    await drawTempChart();
    await drawWeightChart();
    await drawHumidityChart();
}

async function drawCompareChart(seperate_weight) {
    console.log(seperate_weight);
    var compareData = [
        ['Tag', 'Temperatur (°C)', 'Gewicht (KG)', 'Luftfeuchtigkeit (%)']
    ];

    for (row in response) {
        var measured = new Date(response[row].measured);
        compareData.push([measured, response[row].temperature, response[row].weight, response[row].humidity]);
    }

    var from = luxon.DateTime.fromJSDate(compareData[1][0]).toISODate();
    var to = luxon.DateTime.fromJSDate(compareData[compareData.length - 1][0]).toISODate();

    var data = google.visualization.arrayToDataTable(compareData);
    var options = {
        title: `Daten von ${from} bis ${to}`,
        curveType: 'function',
        legend: {
            position: 'bottom'
        },
        colors: ['red', 'black', 'blue'],
        lineWidth: 3,
        width: '100%',
        height: '70%',
        chartArea: {
            left: '10%',
            top: '10%',
            right: '10%',
            width: '100%',
            height: '70%'
        },
        series: {
            0: {targetAxisIndex: 0},
            1: {targetAxisIndex: 1},
            2: {targetAxisIndex: 0},
        },
        vAxes: {
            0: {title: "Temperatur und Lauftfeuchtigkeit"},
            1: {title: "Gewicht"}
        },
    };

    if (seperate_weight == false) {
        delete options["series"]
        delete options["vAxes"]
    }

    var chart = new google.visualization.LineChart(document.getElementById('chart'));
    await chart.draw(data, options);
}

async function drawTempChart() {
    var tempData = [['Gemessen', 'Temperatur (°C)']];

    for (row in response) {
        var measured = new Date(response[row].measured);
        tempData.push([measured, response[row].temperature]);
    }

    var data_temp = google.visualization.arrayToDataTable(tempData);
    var temp_chart = new google.visualization.LineChart(document.getElementById('temp_chart'));
    temp_chart.draw(data_temp, {
        height: '100%',
        width: '100%',
        lineWidth: 3,
        colors: ['red'],
        chartArea: {
            left: '10%',
            top: '10%',
            right: '10%',
            width: '100%',
            height: '70%'
        },
        legend: {
            position: 'bottom'
        },
        vAxis: {minValue: 0}
    });
}

async function drawWeightChart() {
    var weightData = [['Gemessen', 'Gewicht (kg)']];

    for (row in response) {
        var measured = new Date(response[row].measured);
        weightData.push([measured, response[row].weight]);
    }

    var data_weight = google.visualization.arrayToDataTable(weightData);
    var weight_chart = new google.visualization.LineChart(document.getElementById('weight_chart'));
    weight_chart.draw(data_weight, {
        height: '100%',
        lineWidth: 3,
        colors: ['black'],
        chartArea: {
            left: '10%',
            top: '10%',
            right: '10%',
            width: '100%',
            height: '70%'
        },
        legend: {
            position: 'bottom'
        },
    });
}

async function drawHumidityChart() {
    var humidityData = [['Gemessen', 'Luftfeuchtigkeit (%)']];

    for (row in response) {
        var measured = new Date(response[row].measured);
        humidityData.push([measured, response[row].humidity]);
    }

    var data_humidity = google.visualization.arrayToDataTable(humidityData);
    var humidity_chart = new google.visualization.LineChart(document.getElementById('humidity_chart'));
    humidity_chart.draw(data_humidity, {
        height: '100%',
        width: '100%',
        lineWidth: 3,
        colors: ['blue'],
        chartArea: {
            left: '10%',
            top: '10%',
            right: '10%',
            width: '100%',
            height: '70%'
        },
        legend: {
            position: 'bottom'
        },
        vAxis: {minValue: 0}
    });
}

