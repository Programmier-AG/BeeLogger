/*
                    BeeLogger

        JS for dashboard and display page
    
    Copyright (c) 2020-2021 Fabian R., Sönke K.
*/

// Global variables
var last_measured;
var response;

// Initializing both date pickers as globals
var datePickerFrom, datePickerTo;

document.addEventListener('DOMContentLoaded', async () => {
    // Initializing used Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
    M.Modal.init(document.querySelectorAll('.modal'), {});
    M.FormSelect.init(document.querySelectorAll('select'), {});
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {});

    datePickerFrom = M.Datepicker.init(document.getElementById('from-date-input'), {
        minDate: luxon.DateTime.now().minus({ years: 1 }).toJSDate(),
        maxDate: luxon.DateTime.now().toJSDate(),
        defaultDate: luxon.DateTime.now().minus({ days: 4 }).toJSDate(),
        setDefaultDate: true
    });

    datePickerTo = M.Datepicker.init(document.getElementById('to-date-input'), {
        minDate: luxon.DateTime.now().minus({ years: 1 }).toJSDate(),
        maxDate: luxon.DateTime.now().toJSDate(),
        defaultDate: luxon.DateTime.now().toJSDate(),
        setDefaultDate: true
    });

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
            // Event handler for automatically resizing charts on screen resize
            window.onresize = async () => {
                await drawCharts();
            };
        }
    });

});

async function fetchData() {
    var date = luxon.DateTime.fromJSDate(datePickerTo.date).toISODate();
    var dateTwo = luxon.DateTime.fromJSDate(datePickerFrom.date).toISODate();
    
    response = await fetch('/api/data/get?from=' + dateTwo + '&to=' + date);
    
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
    document.querySelector('#loading').classList.add('hide');
}

async function getStatistics() {
    let req = await fetch('/api/stats');
    let res = await req.json();

    document.querySelector('#inserted-count').innerHTML = res['insert_calls'];
    document.querySelector('#requested-count').innerHTML = res['data_calls'];
    document.querySelector('#website-count').innerHTML = res['website'];
}

async function drawCharts() {
    await drawCompareChart();
    await drawTempChart();
    await drawWeightChart();
    await drawHumidityChart();
}

async function updateCharts() {
    response = await fetchData();
    await drawCharts();
}

async function drawCompareChart() {
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
    };

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