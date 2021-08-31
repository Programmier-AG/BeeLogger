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

async function fetchData() {
    var date = luxon.DateTime.fromJSDate(datePickerTo.date);
    var dateTwo = luxon.DateTime.fromJSDate(datePickerFrom.date);
    
    // Calculating difference between dates to determine whether or not 'compressed' should be used 
    var diff = date.diff(dateTwo, 'days');
    diff = diff.toObject().days;

    date = date.toISODate();
    dateTwo = dateTwo.toISODate();

    var url = '/api/data/get?from=' + dateTwo + '&to=' + date;
    
    // When more than or 10 days are requested add 'compressed'
    if(diff > 10) url += '&compressed'
    
    response = await fetch(url);

    // Checking if valid data is returned and not some error
    if(!response.ok) {
        document.getElementById('loading-title').innerHTML = '❌ Momentan nicht verfügbar';
        document.getElementById('loading-text').innerHTML = `
            <hr>
            <b style="font-size: 120%;">Das Abrufen der Daten ist fehlgeschlagen!</b>
            <br>
            <hr>
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

async function drawCharts() {
    await drawCompareChart(false);
    await drawTempChart();
    await drawWeightChart();
    await drawHumidityChart();
}

async function updateCharts() {
    response = await fetchData();
    await drawCharts();
}

async function drawCompareChart(seperate_weight) {
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
        lineWidth: 2,
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
        lineWidth: 2,
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
        lineWidth: 2,
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
        lineWidth: 2,
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

