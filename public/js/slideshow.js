/*
    Vollbild-Slideshow Skript (1.0.0)

    Copyright (c) 2020 Fabian Reinders
*/

// Slides durchwechseln
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
}, 10000);


// BeeLogger Daten abrufen
let timestamp = new Date();
let year = timestamp.getFullYear();
let month = timestamp.getMonth();
month = (month < 10 ? "0" : "") + month;
let day = timestamp.getDate();
day = (day < 10 ? "0" : "") + day;
let date_formated = year + "-" + month + "-" + day;

$.get(`/api/data/get?from=${date_formated}&to=${date_formated}`, data => {
    console.log(data);
    console.log(data[Object.keys(data).length - 1]);
    var latestData = data[Object.keys(data).length - 1];
    $("#beelogger-temperature").html(Math.round(latestData.temperature) + " °C");
    $("#beelogger-humidity").html(Math.round(latestData.humidity) + " hPa");
    $("#beelogger-weight").html(Math.round(latestData.weight) + " kg");
    $("#beelogger-meta").html("BeeLogger API - "+latestData.measured);
});

setInterval(() => {
    window.location.reload();
}, 3600000);