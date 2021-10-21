/*
                               BeeLogger

    Addition to base JavaScript (app.js) specifically for the display page
            
              Depends on beelogger.js, charts.js and app.js.
    
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
    var data = await beeLogger.getCurrentData(dateYesterday, dateToday)
        .catch(err => {
            errorHandler('data', 404);
            throw new Error('Unable to refresh data.');
        });

    // Received data is empty
    if (Object.keys(data) < 1) {
        errorHandler('current-data', 204);
        // Enable charts tab again because only current data
        // seems to be affected currently
        var chartsTabLink = document.getElementById('charts-button');
        chartsTabLink.setAttribute('href', '#charts-tab');
        chartsTabLink.setAttribute('onclick', 'charts()');
        throw new Error('Unable to refresh data.');
    }

    // Enable charts tab since there's data again
    var chartsTabLink = document.getElementById('charts-button');
    chartsTabLink.setAttribute('href', '#charts-tab');
    chartsTabLink.setAttribute('onclick', 'charts()');
    
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

        if (!data || Object.keys(data).length < 1) {
            errorHandler('charts', 204);
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
    document.getElementById('plan-frame').setAttribute('src', 'https://tgg-leer.de/stundenplaene/stundenplaene.html');
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
    
    document.getElementById('page-frame').addEventListener('mousemove', resetTimer, false);
    document.getElementById('page-frame').addEventListener('mousedown', resetTimer, false);
    document.getElementById('page-frame').addEventListener('keypress', resetTimer, false);
    document.getElementById('page-frame').addEventListener('touchmove', resetTimer, false);
     
    startTimer();
}

function doInactive() {
    document.getElementById('home-button').click();
}

/**
 * Navigate the iframe of the embedded pages system
 * (https://github.com/Programmier-AG/BeeLogger/pull/48)
 * to the passed URL.
 * 
 * @param {string} url URL to navigate the page iframe to
 */
function navigatePages(url) {
    document.getElementById('page-frame').setAttribute('src', url)
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
 * @param {string} scope Identifier for where in the program the error occurred.
 * @param {number} err HTTP error code passed on promise rejection
 */
 function errorHandler(scope, err) {
    // The error to display to the user
    var error = {
        title: '',
        description: ''
    }

    // Get error message that fits the error code (if defined)
    switch (err) {
        // 204 - No content i.e. no data available
        case 204:
            error.title = `<h5>❌ Keine aktuellen Daten verfügbar (${err}).</h5>`;
            error.description += `<p>Es sind leider keine aktuellen Daten verfügbar, was wahrscheinlich
            an einem temporären Ausfall unsererseits liegt.<br>Du kannst dir jedoch trotzdem historische
            Daten im Tab "Diagramme" ansehen, indem du dort über den Knopf unten in der Ecke den Zeitraum anpasst.</p>`
            break;

        // When there hasn't been a match with a specific error code
        default:
            error.title = `<h5>❌ Keine Verbindung zur BeeLogger API möglich (${err}).</h5>`;
            error.description = `<p>Sobald die Verbindung wieder hergestellt ist, werden hier wieder aktuelle Daten angezeigt.</p>`;
            // Disable charts tab as a connection to the API can't be established anyway
            var chartsTabLink = document.getElementById('charts-button');
            chartsTabLink.removeAttribute('href');
            chartsTabLink.removeAttribute('onclick');
            break;
    }

    // Check what sections of the front end are affected by this error
    // and hide or un-hide them accordingly.
    switch (scope) {
        // Error only concerns current data (from about the last 24 hours)
        case 'current-data':
            // Only current-data section has to be hidden
            var currentDataErrorBox = document.getElementById('beelogger-current-data-error-box');
            currentDataErrorBox.innerHTML = error.title +  error.description;
            currentDataErrorBox.classList.remove('hide');

            // Access to historical data should still be available
            document.getElementById('loading').classList.add('hide');
            document.getElementById('beelogger-current-data').classList.add('hide');

            // Put at least an info in the chart tab's error box as the user
            // has to change the time span manually first to get something to
            // show up in the charts.
            var chartsErrorBox = document.getElementById('beelogger-charts-error-box');
            chartsErrorBox.innerHTML = error.title +  error.description;
            chartsErrorBox.classList.remove('hide');
            break;

        // Error only concerns charts
        case 'charts':
            var errorBox = document.getElementById('beelogger-charts-error-box');
            errorBox.innerHTML = error.title +  error.description;
            errorBox.classList.remove('hide');
            break;

        // Something mandatory is broken
        default:
            // Update error message in 'current data' section
            var currentDataErrorBox = document.getElementById('beelogger-current-data-error-box');
            currentDataErrorBox.innerHTML = error.title +  error.description;
            currentDataErrorBox.classList.remove('hide');
            
            // Update error message in 'charts' tab
            var chartsErrorBox = document.getElementById('beelogger-charts-error-box');
            chartsErrorBox.innerHTML = error.title +  error.description;
            chartsErrorBox.classList.remove('hide');

    }
}