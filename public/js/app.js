$(document).ready(function () {
    $('select').formSelect();
    $('.dropdown-trigger').dropdown();
    $('.modal').modal();
    if (document.cookie.includes("darkmode")) darkmode();
    setTimeout(() => {
        updateData();
        drawCompareChart();
    }, 500);
});

var api_adress = window.location.host;
var darkmode_st = false;
var chart_st = false;
var from, to;
var view = "today";

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
    let response = await fetch("http://" + api_adress + "/api/data/get?from=" + date + "&to=" + date);
    return await response.json();
}

async function fetchCompareData() {
    var response, dateTwo;
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

    let ret = await response.json();
    return await ret;
}

async function updateData() {
    let response = await fetchData();
    
    if(jQuery.isEmptyObject(response)) {
        let card = '<div class="row"><div class="col m3"></div><div class="col m5"><div class="card blue-grey darken-1"><div class="card-image"><img src="../assets/bee.png"><span class="card-title">Keine Daten erhalten!</span></div><div class="card-content white-text"><p>Der Server hat für den ausgewählten Zeitraum keine Daten zurückgegeben. Diese wurden aufgrund eines temporären technischen Fehlers entweder nicht gemessen oder es gibt Verbindungsprobleme mit der Datenbank.</p></div></div></div><div class="col m3"></div></div>';
        $('#loading-wrapper').html(card);
        return
    }

    $("#dataDisplay").removeClass('hide');
    $("#temperature").html(Math.round(response[Object.keys(response).length - 1].temperature) + " °C");
    $("#weight").html(Math.round(response[Object.keys(response).length - 1].weight) + " kg");
    $("#humidity").html(Math.round(response[Object.keys(response).length - 1].humidity) + " %");
    $("#updated").html(Math.round(response[Object.keys(response).length - 1].measured));
    $('#loading').addClass('hide');
}

async function drawCompareChart() {
    chart_st = true;
    var c = await fetchCompareData();
    var compareData = [
        ['Tag', 'Temperatur (°C)', 'Gewicht (KG)', 'Luftfeuchtigkeit (%)']
    ];
    console.log(c);
    for (row in c) {
        var measured = new Date(c[row].measured.replace("-", "/").replace("-", "/"));
        compareData.push([measured, c[row].temperature, c[row].weight, c[row].humidity]);
    }

    var data = google.visualization.arrayToDataTable(compareData);

    if (darkmode_st == false) {
        var options = {
            title: `Daten von ${from} bis ${to}`,
            curveType: 'function',
            legend: {
                position: 'bottom'
            },
            width: "100%",
            height: "70%",
            chartArea: {
                left: '8%',
                top: '8%',
                width: "100%",
                height: "70%"
            },
        };
    } else {
        var options = {
            title: `Daten von ${from} bis ${to}`,
            backgroundColor: '#212121',
            curveType: 'function',
            legend: {
                position: 'bottom',
                textStyle: {
                    color: '#fff'
                }
            },
            titleTextStyle: {
                color: '#fff'
            },
            hAxis: {
                textStyle: {
                    color: '#fff'
                },
                titleTextStyle: {
                    color: '#fff'
                }
            },
            vAxis: {
                textStyle: {
                    color: '#fff'
                },
                titleTextStyle: {
                    color: '#fff'
                }
            },
            width: "100%",
            height: "70%",
            chartArea: {
                left: '8%',
                top: '8%',
                width: "100%",
                height: "70%"
            },
        };
    }

    var chart = new google.visualization.LineChart(document.getElementById("chart"));

    await chart.draw(data, options);
}

function darkmode() {
    if (darkmode_st == true) {
        darkmode_st = false;
        $("#main").removeClass("dark");
        $(".select-dropdown").removeClass("dark");
        $(".modal").removeClass("dark");
        $(".modal-footer").removeClass("dark");

    } else {
        darkmode_st = true;
        $("#main").addClass("dark");
        $(".select-dropdown").addClass("dark");
        $(".modal").addClass("dark");
        $(".modal-footer").addClass("dark");
        if (chart_st == true) drawCompareChart();
    }
}

async function getStatistics() {
    let req = await fetch("http://" + api_adress + "/api/stats");
    let res = await req.json();

    $("#inserted-count").html(res["insert_calls"]);
    $("#requested-count").html(res["data_calls"]);
    $("#website-count").html(res["website"]);
}