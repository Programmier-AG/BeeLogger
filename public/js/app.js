/*
                    BeeLogger

        JS for dashboard and display page
    
    Copyright (c) 2020-2021 Fabian R., Sönke K.
*/

// Global variables
var last_measured;

document.addEventListener('DOMContentLoaded', () => {
    // Initializing used Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
    M.Modal.init(document.querySelectorAll('.modal'), {});
    M.FormSelect.init(document.querySelectorAll('select'), {});
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {});

    // Fetching data and rendering charts with a little timeout
    setTimeout(async () => {
        await updateData();
        await drawCompareChart();
        await drawTempChart();
        await drawWeightChart();
        await drawHumidityChart();
    }, 500);

    // Setting up background tasks for keeping the 'last updated' date up-to-date
    setInterval(() => {
        var measured = luxon.DateTime.fromISO(last_measured).toRelative({ locale: 'de' });
        document.querySelector('#updated').innerHTML = measured;
    }, 15000);
});

google.charts.load('current', {
    'packages': ['corechart']
});

// ISO date format => 2021-04-25
var date = luxon.DateTime.now().toISODate();

async function fetchData() {
    var compareValue = document.getElementById('dropSelect');

    if (compareValue) {
        switch (compareValue.options[compareValue.selectedIndex].value) {
            // Today
            case '1':
                response = await fetch('/api/data/get?from=' + date + '&to=' + date);
                break;
            
            // Week
            case '2':
                var dateTwo = luxon.DateTime.now().minus({ weeks: 1 }).toISODate();
                response = await fetch('/api/data/get?from=' + dateTwo + '&to=' + date);
                break;
            
            // Month
            case '3':
                var dateTwo = luxon.DateTime.now().minus({ months: 1 }).toISODate();
                response = await fetch('/api/data/get?from=' + date + '&to=' + date);
                break;

            // Year
            case '4':
                var dateTwo = luxon.DateTime.now().minus({ years: 1 }).toISODate();
                response = await fetch('/api/data/get?from=' + dateTwo + '&to=' + date);
                break;
        }
    
    // If no view is selected, fetch current data
    } else response = await fetch('/api/data/get?from=' + date + '&to=' + date);

    return await response.json();
}

// Function for updating the 'current data' section
async function updateData() {
    let response = await fetchData();

    if(Object.keys(response).length <= 0) {
        let card = '<div class="row"><div class="col m3"></div><div class="col m5"><div class="card blue-grey darken-1"><div class="card-image"><img src="../assets/bee.png"><span class="card-title">Keine Daten erhalten!</span></div><div class="card-content white-text"><p>Der Server hat für den ausgewählten Zeitraum keine Daten zurückgegeben. Diese wurden aufgrund eines temporären technischen Fehlers entweder nicht gemessen oder es gibt Verbindungsprobleme mit der Datenbank.</p></div></div></div><div class="col m3"></div></div>';
        document.querySelector('#loading').innerHTML = card;
        return
    }

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

async function drawCompareChart() {
    var c = await fetchData();
    var compareData = [
        ['Tag', 'Temperatur (°C)', 'Gewicht (KG)', 'Luftfeuchtigkeit (%)']
    ];

    for (row in c) {
        var measured = new Date(c[row].measured);
        compareData.push([measured, c[row].temperature, c[row].weight, c[row].humidity]);
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
        width: '100%',
        height: '70%',
        chartArea: {
            left: '8%',
            top: '8%',
            width: '100%',
            height: '70%'
        },
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart'));
    await chart.draw(data, options);
}

detailChartOptions = {
    height: '100%',
    width: '100%',
    legend: {
        position: 'bottom'
    },
    vAxis: {minValue: 0}
}

async function drawTempChart() {
    var tempData = [['Gemessen', 'Temperatur (°C)']];
    let response = await fetchData();

    for (row in response) {
        var measured = new Date(response[row].measured);
        tempData.push([measured, response[row].temperature]);
    }

    var data_temp = google.visualization.arrayToDataTable(tempData);
    var temp_chart = new google.visualization.LineChart(document.getElementById('temp_chart'));
    temp_chart.draw(data_temp, detailChartOptions);
}

async function drawWeightChart() {
    var weightData = [['Gemessen', 'Gewicht (kg)']];
    let response = await fetchData();

    for (row in response) {
        var measured = new Date(response[row].measured);
        weightData.push([measured, response[row].weight]);
    }

    var data_weight = google.visualization.arrayToDataTable(weightData);
    var weight_chart = new google.visualization.LineChart(document.getElementById('weight_chart'));
    weight_chart.draw(data_weight, {
        height: '100%',
        width: '100%',
        legend: {
            position: 'bottom'
        },
        vAxis: {              
            viewWindowMode:'explicit',
            viewWindow:{
                min: 20
            }
        }
    });
}

async function drawHumidityChart() {
    var humidityData = [['Gemessen', 'Luftfeuchtigkeit (%)']];
    let response = await fetchData();

    for (row in response) {
        var measured = new Date(response[row].measured);
        humidityData.push([measured, response[row].humidity]);
    }

    var data_humidity = google.visualization.arrayToDataTable(humidityData);
    var humidity_chart = new google.visualization.LineChart(document.getElementById('humidity_chart'));
    humidity_chart.draw(data_humidity, detailChartOptions);
}