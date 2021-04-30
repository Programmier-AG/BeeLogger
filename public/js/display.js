/*
                BeeLogger

            JS for display page
    
    Copyright (c) 2020-2021 Fabian R., Sönke K.
*/

async function charts() {
    document.getElementById('loading').classList.remove('hide');

    // Timeout for the time it roughly takes to switch tabs
    setTimeout(async () => {
        response = await fetchData();
        await drawCharts();
        document.getElementById('loading').classList.add('hide');
    }, 1000);

    document.querySelector('body').style.backgroundImage = 'none';
}

async function home() {
    response = await fetchData();

    document.querySelector('body').style.backgroundImage = `url('/assets/slideshow/bee-background.jpg')`;
    document.querySelector('#temperature').innerHTML = response[Object.keys(response).length - 1].temperature + ' °C';
    document.querySelector('#weight').innerHTML = response[Object.keys(response).length - 1].weight + ' kg';
    document.querySelector('#humidity').innerHTML = response[Object.keys(response).length - 1].humidity + ' %';
    document.querySelector('#updated').innerHTML = measured;
}

function gallery() {
    document.querySelector('body').style.backgroundImage = 'none';
    document.getElementById("gallery-frame").setAttribute("src", "http://localhost:8080")
}

function stundenplan() {
    document.querySelector('body').style.backgroundImage = 'none';
    document.getElementById("plan-frame").setAttribute("src", "https://tgg-leer.de/stundenplaene/stundenplaene.html")
}

async function about() {
    document.querySelector('body').style.backgroundImage = `url('/assets/slideshow/bee-background.jpg')`;
    await getStatistics();
}

var timeoutID;

function startTimer() {
    timeoutID = window.setTimeout(doInactive, 60000);
}


function resetTimer() { 
    window.clearTimeout(timeoutID);
    startTimer();
}

function setupTimers () {
    document.addEventListener('mousemove', resetTimer, false);
    document.addEventListener('mousedown', resetTimer, false);
    document.addEventListener('keypress', resetTimer, false);
    document.addEventListener('touchmove', resetTimer, false);
    
    document.getElementById("gallery-frame").addEventListener('mousemove', resetTimer, false);
    document.getElementById("gallery-frame").addEventListener('mousedown', resetTimer, false);
    document.getElementById("gallery-frame").addEventListener('keypress', resetTimer, false);
    document.getElementById("gallery-frame").addEventListener('touchmove', resetTimer, false);
     
    startTimer();
}

function doInactive() {
    document.getElementById("home-button").click();
}

document.addEventListener('DOMContentLoaded', () => {
    M.Tabs.init(document.querySelectorAll('.tabs'), {});
    setupTimers();
});
