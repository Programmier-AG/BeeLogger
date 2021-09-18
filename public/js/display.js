/*
                          BeeLogger

    Addition to base JavaScript specifically for the display page
    
            Copyright (c) 2020-2021 Fabian R., Sönke K.
*/

/**
 * Periodically re-fetches data from the
 * API and writes it to the cache.
 */
async function refreshData() {
    // Refresh data in beeLogger.data.current and beeLogger.data.cache.
    await beeLogger.getCurrentData(dateYesterday, dateToday)
        .catch(err => errorHandler(err));
}

/**
 * Executed when user switched to the
 * charts tab.
 */
async function charts() {
    document.getElementById('loading').classList.remove('hide');

    // Timeout for the time it roughly takes to switch tabs
    setTimeout(async () => {
        var data = beeLogger.data.cache;
        await drawCharts(data);
        document.getElementById('loading').classList.add('hide');
    }, 1000);

    document.querySelector('body').style.backgroundImage = 'none';
}

/**
 * Executed when user switched to the
 * home tab.
 */
async function home() {
    var data = beeLogger.data.current;

    document.querySelector('body').style.backgroundImage = `url('/assets/slideshow/bee-background.jpg')`;
    await updateCurrentData(data);
}

/**
 * Executed when user switched to the
 * pages tab.
 */
function pages(url) {
    document.querySelector('body').style.backgroundImage = 'none';
    console.log(url)
    navigatePages(url)
}

/**
 * Executed when user switched to the
 * timetable tab.
 */
function timetable() {
    document.querySelector('body').style.backgroundImage = 'none';
    document.getElementById("plan-frame").setAttribute("src", "https://tgg-leer.de/stundenplaene/stundenplaene.html")
}

/**
 * Executed when user switched to the
 * about tab.
 */
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

/**
 * Navigate the iframe of the embedded pages system
 * (https://github.com/Programmier-AG/BeeLogger/pull/48)
 * to the passed URL.
 * 
 * @param {string} url URL to navigate the page iframe to.
 */
function navigatePages(url) {
    document.getElementById("page-frame").setAttribute("src", url)
    M.Sidenav.getInstance(document.querySelector('#slide-out')).close();
}

// Register timers and tabs when document is fully loaded.
document.addEventListener('DOMContentLoaded', async () => {
    M.Tabs.init(document.querySelectorAll('.tabs'), {});
    setupTimers();
});
