/*
                BeeLogger

            JS for display page
    
    Copyright (c) 2020-2021 Fabian R., Sönke K.
*/

function charts() {
    drawCompareChart()
    drawHumidityChart();
    drawTempChart();
    drawWeightChart();
    document.querySelector('body').style.backgroundImage = 'none';
}

function home() {
    // $('.tabs').tabs('select', 'index-tab');
    document.querySelector('body').style.backgroundImage = `url('/assets/slideshow/bee-background.jpg')`;
}

function gallery() {
    document.querySelector('body').style.backgroundImage = 'none';
}

function stundenplan() {
    document.querySelector('body').style.backgroundImage = 'none';
}

async function about() {
    document.querySelector('body').style.backgroundImage = `url('/assets/slideshow/bee-background.jpg')`;

    let req = await fetch('/api/stats');
    let res = await req.json();

    document.querySelector('#inserted-count').innerHTML = res['insert_calls'];
    document.querySelector('#requested-count').innerHTML = res['data_calls'];
    document.querySelector('#website-count').innerHTML = res['website'];
}

var timeoutID;

function startTimer() {
    timeoutID = window.setTimeout(doInactive, 60000);
}


function resetTimer() { 
    window.clearTimeout(timeoutID)
    startTimer();
}

function setupTimers () {
    document.addEventListener('mousemove', resetTimer, false);
    document.addEventListener('mousedown', resetTimer, false);
    document.addEventListener('keypress', resetTimer, false);
    document.addEventListener('touchmove', resetTimer, false);
     
    startTimer();
}

function doInactive() {
    home();
}

document.addEventListener('DOMContentLoaded', () => {
    M.Tabs.init(document.querySelectorAll('.tabs'), {});
    setupTimers();
});
