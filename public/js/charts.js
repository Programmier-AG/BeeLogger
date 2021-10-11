/**
 * Takes in an array containing BeeLogger data records (from the API) and passes
 * it on to all chart draw functions.
 * 
 * Therefore, a compare, temperature, weight and humidity chart will be generated
 * and rendered on the page from that array.
 * 
 * @param {Array} data Array containing the data records that should be used to generate the charts from
 */
async function drawCharts(data) {
    await drawCompareChart(data, false);
    await drawTempChart(data);
    await drawWeightChart(data);
    await drawHumidityChart(data);
}

/**
 * Generates and renders the compare chart on the page.
 * 
 * @param {Array} data Array containing the data records that the graph should be generated from
 * @param {boolean} seperateWeight Whether the weight should have its own axis (to be able to see even small changes)
 */
async function drawCompareChart(data, seperateWeight) {
    var compareData = [
        ['Tag', 'Temperatur (°C)', 'Gewicht (KG)', 'Luftfeuchtigkeit (%)']
    ];

    for (row in data) {
        var measured = new Date(data[row].measured);
        compareData.push([measured, data[row].temperature, data[row].weight, data[row].humidity]);
    }

    var from = luxon.DateTime.fromJSDate(compareData[1][0]).toISODate();
    var to = luxon.DateTime.fromJSDate(compareData[compareData.length - 1][0]).toISODate();

    var dataTable = google.visualization.arrayToDataTable(compareData);
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

    if (seperateWeight == false) {
        delete options["series"]
        delete options["vAxes"]
    }

    var chart = new google.visualization.LineChart(document.getElementById('chart'));
    await chart.draw(dataTable, options);
}

/**
 * Generates and renders the temperature chart on the page.
 * 
 * @param {Array} data Array containing the data records that the graph should be generated from
 */
async function drawTempChart(data) {
    var tempData = [['Gemessen', 'Temperatur (°C)']];

    for (row in data) {
        var measured = new Date(data[row].measured);
        tempData.push([measured, data[row].temperature]);
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

/**
 * Generates and renders the weight chart on the page.
 * 
 * @param {Array} data Array containing the data records that the graph should be generated from
 */
async function drawWeightChart(data) {
    var weightData = [['Gemessen', 'Gewicht (kg)']];

    for (row in data) {
        var measured = new Date(data[row].measured);
        weightData.push([measured, data[row].weight]);
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

/**
 * Generates and renders the humidity chart on the page.
 * 
 * @param {Array} data Array containing the data records that the graph should be generated from
 */
async function drawHumidityChart(data) {
    var humidityData = [['Gemessen', 'Luftfeuchtigkeit (%)']];

    for (row in data) {
        var measured = new Date(data[row].measured);
        humidityData.push([measured, data[row].humidity]);
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