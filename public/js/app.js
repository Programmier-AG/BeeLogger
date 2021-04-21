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

var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;
month = (month < 10 ? "0" : "") + month;
var day = date.getDate();
day = (day < 10 ? "0" : "") + day;
date = year + "-" + month + "-" + day;

async function fetchData() {
    var compareValue = document.getElementById("dropSelect");

    if (compareValue) {
        switch (compareValue.options[compareValue.selectedIndex].value) {
            // Today
            case "1":
                response = await fetch("http://" + api_adress + "/api/data/get?from=" + date + "&to=" + date);
                from = date;
                to = date;
                view = "today";
                break;
                // Week
            case "2":
                var dateTwo = new Date(Date.now() - 604800000);
                var yearTwo = dateTwo.getFullYear();
                var monthTwo = dateTwo.getMonth() + 1;
                monthTwo = (monthTwo < 10 ? "0" : "") + monthTwo;
                var dayTwo = dateTwo.getDate();
                dayTwo = (dayTwo < 10 ? "0" : "") + dayTwo;
                dateTwo = yearTwo + "-" + monthTwo + "-" + dayTwo;
                from = dateTwo;
                to = date;
                view = "week";
                response = await fetch("http://" + api_adress + "/api/data/get?from=" + dateTwo + "&to=" + date);
                break;
                // Month
            case "3":
                var dateTwo = new Date(Date.now());
                dateTwo.setMonth(dateTwo.getMonth());
                var yearTwo = dateTwo.getFullYear();
                var monthTwo = dateTwo.getMonth();
                monthTwo = (monthTwo < 10 ? "0" : "") + monthTwo;
                var dayTwo = dateTwo.getDate();
                dayTwo = (dayTwo < 10 ? "0" : "") + dayTwo;
                dateTwo = yearTwo + "-" + monthTwo + "-" + dayTwo;
                from = dateTwo;
                to = date;
                view = "month";
                response = await fetch("http://" + api_adress + "/api/data/get?from=" + dateTwo + "&to=" + date + "&compressed");
                break;
                // Year
            case "4":
                var year = new Date(Date.now()).getFullYear();
                from = year;
                to = year;
                view = year;
                response = await fetch("http://" + api_adress + "/api/data/get?from=" + year + "-01-01&to=" + year + "-12-31&compressed");
                break;
                // All
            case "5":
                from = "2020";
                to = "-";
                view = "all";
                response = await fetch("http://" + api_adress + "/api/data/get?from=2000-01-01&to=2099-12-31&compressed");
                break;
        }
    } else {
        response = await fetch("http://" + api_adress + "/api/data/get?from=" + date + "&to=" + date);
        from = date;
        to = date;
        view = "today";
    }

    return await response.json();

/*
    let response = await fetch("http://" + api_adress + "/api/data/get?from=" + date + "&to=" + date);
    return await response.json();
*/
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
    let req = await fetch("http://" + api_adress + "/api/stats");
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
    var temp_chart = new google.visualization.LineChart(document.getElementById('weight_chart'));
    temp_chart.draw(data_weight, detailChartOptions);
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