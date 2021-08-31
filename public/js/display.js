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
    await updateData();
}

function pages(url) {
    document.querySelector('body').style.backgroundImage = 'none';
    console.log(url)
    navigatePages(url)
}

function stundenplan() {
    document.querySelector('body').style.backgroundImage = 'none';
    document.getElementById("plan-frame").setAttribute("src", "https://tgg-leer.de/stundenplaene/stundenplaene.html")
}

async function about() {
    document.querySelector('body').style.backgroundImage = `url('/assets/slideshow/bee-background.jpg')`;
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
    
    document.getElementById("page-frame").addEventListener('mousemove', resetTimer, false);
    document.getElementById("page-frame").addEventListener('mousedown', resetTimer, false);
    document.getElementById("page-frame").addEventListener('keypress', resetTimer, false);
    document.getElementById("page-frame").addEventListener('touchmove', resetTimer, false);
     
    startTimer();
}

function doInactive() {
    document.getElementById("home-button").click();
}

function navigatePages(url) {
    document.getElementById("page-frame").setAttribute("src", url)
    M.Sidenav.getInstance(document.querySelector('#slide-out')).close();
}

document.addEventListener('DOMContentLoaded', () => {
    M.Tabs.init(document.querySelectorAll('.tabs'), {});
    setupTimers();
});
