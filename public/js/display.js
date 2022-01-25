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
    // Refresh data in beeLogger.currentData and beeLogger.cachedData
    var data = await beeLogger.getCurrentData()
        .catch(err => {
            // TODO: Show error in beelogger-current-data-error-box as well
            // as on the display (unlike the dashboard), current data is being
            // refreshed periodically.
            errorHandler('charts', 404);
            throw new Error('Unable to refresh data.');
        });

    // Received data is empty
    if (Object.keys(data).length < 1) {
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
    // Invoke date range change to load data (as currently
    // there is none for the charts to use)
    await applyDateRange();

    // Remove background image
    document.querySelector('body').style.backgroundImage = 'none';
}

/**
 * Executed when user switched to the
 * home tab.
 */
async function home() {
    // Replace background image
    document.querySelector('body').style.backgroundImage = `url('/assets/slideshow/bee-background.jpg')`;

    // Update 'current data' section
    var data = beeLogger.currentData['data'];
    await updateCurrentData(data);
}

/**
 * Executed when user switched to the
 * pages tab.
 */
function pages(url) {
    // Remove background iamge
    document.querySelector('body').style.backgroundImage = 'none';

    navigatePages(url);
}

/**
 * Executed when user switched to the
 * timetable tab.
 */
function timetable() {
    // Remove background image
    document.querySelector('body').style.backgroundImage = 'none';
    
    // Navigate timetable iframe to the timetable main menu
    document.getElementById('plan-frame').setAttribute('src', 'https://tgg-leer.de/stundenplaene/stundenplaene.html');
}

/**
 * Executed when user switched to the
 * about tab.
 */
async function about() {
    // Replace background image
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

/**
 * Make 'feeds' iframe on about page visible and navigate it
 * to the feeds index page.
 */
function showFeeds() {
    let feedsFrame = document.getElementById('feeds-frame');
    feedsFrame.classList.toggle('hide');
    feedsFrame.setAttribute('src', '/rss/feeds');
}

// Register timers and tabs when document is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    M.Tabs.init(document.querySelectorAll('.tabs'), {});
    M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
    setupTimers();
});