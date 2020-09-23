/*
    Vollbild-Slideshow Skript (1.0.0)

    Copyright (c) 2020 Fabian Reinders
*/

// Automatic slide switching
let slide = 0;
let wait = false;
setInterval(() => {
    if(slide < 2) {
        if(wait == false) {
            wait = true;
            return;
        }
        wait = false;
        slide++;
    } else {
        slide = 1;
    }
    
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#slide-" + slide).offset().top
    }, 2000);
}, 15000);


// Get current date
let today = { "timestamp": new Date() };
today["day"] = today["timestamp"].getDate();
today["day"] = (today["day"] < 10 ? "0" : "") + today["day"];
today["month"] = today["timestamp"].getMonth() + 1;
today["month"] = (today["month"] < 10 ? "0" : "") + today["month"];
today["year"] = today["timestamp"].getFullYear();
let today_formated = today["year"] + "-" + today["month"] + "-" + today["day"];

// Get current data from BeeLogger API
todays_data = {};
$.get(`/api/data/get?from=${today_formated}&to=${today_formated}`, data => {
    console.log("++++++ CURRENT ++++++");
    console.log(data);
    console.log(data[Object.keys(data).length - 1]);
    todays_data = data[Object.keys(data).length - 1];
    $("#beelogger-temperature").html(Math.round(todays_data.temperature) + " °C");
    $("#beelogger-humidity").html(Math.round(todays_data.humidity) + " hPa");
    $("#beelogger-weight").html(Math.round(todays_data.weight) + " kg");
    $("#beelogger-meta").html("BeeLogger API: "+todays_data.measured);
});

// Get yesterday's date from BeeLogger API
let yesterday = { "timestamp": new Date(Date.now() - 86400000) };
yesterday["day"] = yesterday["timestamp"].getDate();
yesterday["day"] = (yesterday["day"] < 10 ? "0" : "") + yesterday["day"];
yesterday["month"] = yesterday["timestamp"].getMonth() + 1;
yesterday["month"] = (yesterday["month"] < 10 ? "0" : "") + yesterday["month"];
yesterday["year"] = yesterday["timestamp"].getFullYear();
let yesterday_formated = yesterday["year"] + "-" + yesterday["month"] + "-" + yesterday["day"];

// Get yesterday's data from BeeLogger API
yesterdays_data = {};
$.get(`/api/data/get?from=${yesterday_formated}&to=${yesterday_formated}`, data => {
    console.log("++++++ YESTERDAY ++++++");
    console.log(data);
    console.log(data[new Date().getHours()]);
    yesterdays_data = data[new Date().getHours()];
});

// Calculate and display weight change
setTimeout(() => {
    if(todays_data.weight > yesterdays_data.weight) {
        $("#beelogger-weight-change").html("⬆️ " + Number((todays_data.weight - yesterdays_data.weight).toFixed(2)) + " kg");
    } else if (todays_data.weight == yesterdays_data.weight) {
        $("#beelogger-weight-change").html("↕");
    } else {
        $("#beelogger-weight-change").html("⬇️ " + Number((yesterdays_data.weight - todays_data.weight).toFixed(2)) + " kg");
    }
}, 2000);

// Reload the page every hour
setInterval(() => {
    window.location.reload();
}, 1800000);