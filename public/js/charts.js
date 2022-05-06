/*
                            BeeLogger

         Front-end charts module for generating and rendering
              charts using the Google Charts library
                (https://developers.google.com/chart)
    
           Copyright (c) 2020-2021 Fabian Reinders, Sönke K.
*/

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
    if ('rows' in data) {
        var infoText = `Gezeigt werden Rohdaten aus ${data['rows']} Einträgen.`;
    } else {
        var infoText = `
            Gezeigt werden ${data['compressed']} komprimierte Daten aus
            ${data['original']} Einträgen. (Es wurden je ${data['interval']} Einträge
            approximentiert).
        `;
    }

    data = data['data'];

    // Try to get the time interval between records to use for delta graph.
    let deltaGraphInterval = document.getElementById("delta-span-input").value;

    // If none or invalid interval is specified, use 24 hours by default (in ms).
    if (typeof deltaGraphInterval !== 'string' || deltaGraphInterval === '' || deltaGraphInterval === '0' ) {
        deltaGraphInterval = 86400000;
    } else {
        // Turn input string into number and convert to milliseconds.
        deltaGraphInterval = parseInt(deltaGraphInterval) * 60000;
    }

    if (data == undefined || data == [] || Object.keys(data) == 0) {
        errorHandler('charts', 204);
        return;
    }

    let infoTextElements = document.querySelectorAll('.display-info');

    infoTextElements.forEach(infoTextElement => {
        infoTextElement.innerHTML = infoText;
    });

    document.getElementById('charts').classList.remove('hide');

    await drawCompareChart(data, false);
    await drawTempChart(data);
    await drawWeightChart(data);
    await drawDeltaChart(data, deltaGraphInterval);
    await drawHumidityChart(data);

    document.getElementById('beelogger-charts-loader').classList.add('hide');
}

/**
 * Generates and renders the compare chart on the page.
 * 
 * @param {Array} data Array containing the data records that the graph should be generated from
 * @param {boolean} separateWeight Whether the weight should have its own axis (to be able to see even small changes)
 */
async function drawCompareChart(data, separateWeight) {
    var compareData = [
        ['Tag', 'Temperatur (°C)', 'Gewicht (kg)', 'Luftfeuchtigkeit (%)']
    ];

    for (row in data) {
        var measured = new Date(data[row].measured);
        compareData.push([measured, data[row].temperature, data[row].weight, data[row].humidity]);
    }

    var dataTable = google.visualization.arrayToDataTable(compareData);
    var options = {
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
            0: {title: 'Temperatur und Lauftfeuchtigkeit'},
            1: {title: 'Gewicht'}
        },
    };

    if (separateWeight == false) {
        delete options['series'];
        delete options['vAxes'];
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

    var temperatureDataTable = google.visualization.arrayToDataTable(tempData);
    var temperatureChart = new google.visualization.LineChart(document.getElementById('temp_chart'));
    
    temperatureChart.draw(temperatureDataTable, {
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
 * Generates and renders the weight delta chart on the page.
 * 
 * @param {Array} data Array containing the data records that the graph should be generated from
 */
async function drawWeightChart(data) {
    var weightData = [['Gemessen', 'Gewicht (kg)']];

    for (row in data) {
        var measured = new Date(data[row].measured);
        weightData.push([measured, data[row].weight]);
    }

    var weightDataTable = google.visualization.arrayToDataTable(weightData);
    var weightChart = new google.visualization.LineChart(document.getElementById('weight_chart'));
    
    weightChart.draw(weightDataTable, {
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
 * Generates and renders the weight delta chart on the page.
 *
 * @param {Array} data Array containing the data records that the graph should be generated from
 * @param {number} interval The amount of time between records used for delta calculation (in between will be ignored)
 */
async function drawDeltaChart(data, interval) {
    // Create array to visualize as a chart.
    let deltaData = [['Gemessen', 'Delta (g)']];

    // Start with newest record.
    let recordIndex = Object.keys(data).length - 1;

    // Go through each record.
    while (recordIndex !== 0) {
        let newerRecord = data[recordIndex];
        let newerRecordTimestamp = new Date(newerRecord.measured);
        let newerWeight = newerRecord.weight;

        // Go further in the dataset until the set interval is reached again.
        while (newerRecordTimestamp.getTime() - Date.parse(data[recordIndex].measured) < interval && recordIndex > 0) {
            recordIndex--;
        }
        
        // The weight of the record one interval further.
        let olderWeight = data[recordIndex].weight;

        // Calculate the difference between the two weights.
        let weightDelta = newerWeight - olderWeight;

        // Push timestamp and weight data to visualization data array.
        deltaData.push([newerRecordTimestamp, weightDelta]);
    }

    let weightDataTable = google.visualization.arrayToDataTable(deltaData);
    let weightChart = new google.visualization.LineChart(document.getElementById('delta_chart'));

    weightChart.draw(weightDataTable, {
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

    var humidityDataTable = google.visualization.arrayToDataTable(humidityData);
    var humidityChart = new google.visualization.LineChart(document.getElementById('humidity_chart'));
    
    humidityChart.draw(humidityDataTable, {
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