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
    var dateToday = luxon.DateTime.now().toISODate();
    var dateYesterday = luxon.DateTime.now().minus({ days: 1 }).toISODate();

    // Refresh data in beeLogger.currentData and beeLogger.cachedData
    await beeLogger.getCurrentData(dateYesterday, dateToday)
        .catch(err => {
            errorHandler(err);
            throw new Error('Unable to refresh data because an error occured while fetching the new data.');
        });
    
    // Cache is now filled with valid data
    // Hence, chart and current data sections can be shown again
    document.getElementById('charts').classList.remove('hide');
    document.getElementById('beelogger-current').classList.remove('hide');
    
    // Also, the error boxes can be hidden
    errorBoxes = document.querySelectorAll('.beelogger-error-box');
    errorBoxes.forEach(errorBox => {
        errorBox.classList.add('hide');
    });
}

/**
 * Executed when user switched to the
 * charts tab.
 */
async function charts() {
    document.getElementById('loading').classList.remove('hide');

    // Timeout for the time it roughly takes to switch tabs
    setTimeout(async () => {
        var data = beeLogger.cachedData;

        if(!data || Object.keys(data).length <= 0) {
            errorHandler(1001);
            throw new Error('Unable to draw charts due to missing data.');
        }
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
    var data = beeLogger.currentData;

    document.querySelector('body').style.backgroundImage = `url('/assets/slideshow/bee-background.jpg')`;
    await updateCurrentData(data);
}

/**
 * Executed when user switched to the
 * pages tab.
 */
function pages(url) {
    document.querySelector('body').style.backgroundImage = 'none';
    navigatePages(url);
}

/**
 * Executed when user switched to the
 * timetable tab.
 */
function timetable() {
    document.querySelector('body').style.backgroundImage = 'none';
    document.getElementById("plan-frame").setAttribute("src", "https://tgg-leer.de/stundenplaene/stundenplaene.html");
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
 * @param {string} url URL to navigate the page iframe to
 */
function navigatePages(url) {
    document.getElementById("page-frame").setAttribute("src", url)
    M.Sidenav.getInstance(document.querySelector('#slide-out')).close();
}

// Register timers and tabs when document is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    M.Tabs.init(document.querySelectorAll('.tabs'), {});
    setupTimers();
});

/**
 * Modified errorHandler function (defined in app.js).
 * 
 * Handler function for when the API returns an error.
 * This function will catch the error and display an error
 * message to the user.
 * 
 * @param {number} err HTTP error code passed on promise rejection
 */
 function errorHandler(err) {
    var errorBoxes = document.querySelectorAll('.beelogger-error-box');
    errorBoxes.forEach(errorBox => {
        errorBox.classList.remove('hide');
        errorBox.innerHTML = `<h5>❌ Keine Verbindung zur BeeLogger API möglich (${err}).</h5>`;
        errorBox.innerHTML += `<p>Sobald die Verbindung wieder hergestellt ist, werden hier wieder aktuelle Daten angezeigt.</p>`;
    });

    document.getElementById('charts').classList.add('hide');
    document.getElementById('beelogger-current').classList.add('hide');
    document.getElementById('loading').classList.remove('progress');
}