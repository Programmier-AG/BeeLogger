$(document).ready(function () {
    $('select').formSelect();
    $('.dropdown-trigger').dropdown();
    $('.modal').modal();
    $('.sidenav').sidenav();
    setTimeout(() => {
        updateData();
        drawCompareChart();
        drawTempChart();
        drawWeightChart();
        drawHumidityChart();
    }, 500);
});

google.charts.load('current', {
    'packages': ['corechart']
});

// ISO date format => 2021-04-25
var date = luxon.DateTime.now().toISODate();

async function fetchData() {
    var compareValue = document.getElementById("dropSelect");

    if (compareValue) {
        switch (compareValue.options[compareValue.selectedIndex].value) {
            // Today
            case "1":
                response = await fetch("/api/data/get?from=" + date + "&to=" + date);
                break;
            
            // Week
            case "2":
                var dateTwo = luxon.DateTime.now().minus({ weeks: 1 }).toISODate();
                response = await fetch("/api/data/get?from=" + dateTwo + "&to=" + date);
                break;
            
            // Month
            case "3":
                var dateTwo = luxon.DateTime.now().minus({ months: 1 }).toISODate();
                response = await fetch("/api/data/get?from=" + date + "&to=" + date);
                break;

            // Year
            case "4":
                var dateTwo = luxon.DateTime.now().minus({ years: 1 }).toISODate();
                response = await fetch("/api/data/get?from=" + dateTwo + "&to=" + date);
                break;
        }
    
    // If no view is selected, fetch current data
    } else response = await fetch("/api/data/get?from=" + date + "&to=" + date);

    return await response.json();
}

async function updateData() {
    let response = await fetchData();

    if(jQuery.isEmptyObject(response)) {
        let card = '<div class="row"><div class="col m3"></div><div class="col m5"><div class="card blue-grey darken-1"><div class="card-image"><img src="../assets/bee.png"><span class="card-title">Keine Daten erhalten!</span></div><div class="card-content white-text"><p>Der Server hat für den ausgewählten Zeitraum keine Daten zurückgegeben. Diese wurden aufgrund eines temporären technischen Fehlers entweder nicht gemessen oder es gibt Verbindungsprobleme mit der Datenbank.</p></div></div></div><div class="col m3"></div></div>';
        $('#loading-wrapper').html(card);
        return
    }

    $("main").removeClass("hide");
    $("#temperature").html(response[Object.keys(response).length - 1].temperature + " °C");
    $("#weight").html(response[Object.keys(response).length - 1].weight + " kg");
    $("#humidity").html(response[Object.keys(response).length - 1].humidity + " %");
    $("#updated").html(response[Object.keys(response).length - 1].measured);
    $('#loading').addClass('hide');
}

async function getStatistics() {
    let req = await fetch("/api/stats");
    let res = await req.json();

    $("#inserted-count").html(res["insert_calls"]);
    $("#requested-count").html(res["data_calls"]);
    $("#website-count").html(res["website"]);
}

detailChartOptions = {
    height: "100%",
    width: "100%",
    legend: {
        position: 'bottom'
    },
    vAxis: {minValue: 0}
}

async function drawTempChart() {
    var tempData = [['Gemessen', 'Temperatur (°C)']];
    let response = await fetchData();

    for (row in response) {
        var measured = new Date(response[row].measured.replace("-", "/").replace("-", "/"));
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
        var measured = new Date(response[row].measured.replace("-", "/").replace("-", "/"));
        weightData.push([measured, response[row].weight]);
    }

    var data_weight = google.visualization.arrayToDataTable(weightData);
    var weight_chart = new google.visualization.LineChart(document.getElementById('weight_chart'));
    weight_chart.draw(data_weight, {
        height: "100%",
        width: "100%",
        legend: {
            position: 'bottom'
        },
        vAxis: {              
            viewWindowMode:'explicit',
            viewWindow:{
                min: 15
            }
        }
    });
}

async function drawHumidityChart() {
    var humidityData = [['Gemessen', 'Luftfeuchtigkeit (hPa)']];
    let response = await fetchData();

    for (row in response) {
        var measured = new Date(response[row].measured.replace("-", "/").replace("-", "/"));
        humidityData.push([measured, response[row].humidity]);
    }

    var data_humidity = google.visualization.arrayToDataTable(humidityData);
    var humidity_chart = new google.visualization.LineChart(document.getElementById('humidity_chart'));
    humidity_chart.draw(data_humidity, detailChartOptions);
}