/*
                        BeeLogger

         Base JavaScript for dashboard and display

           Depends on beelogger.js and charts.js.
    
      Copyright (c) 2020-2021 Fabian Reinders, Sönke K.
*/

// Initialize both date pickers as globals
var datePickerFrom, datePickerTo;

const beeLogger = new BeeLogger();

document.addEventListener('DOMContentLoaded', async () => {
    // Initializing used Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
    M.Modal.init(document.querySelectorAll('.modal'), {});
    M.FormSelect.init(document.querySelectorAll('select'), {});
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {});
    M.ScrollSpy.init(document.querySelectorAll('.scrollspy'), {});

    let fromDate = window.localStorage.getItem("daterange-from");
    let toDate = window.localStorage.getItem("daterange-to");
    let deltaTimespan = window.localStorage.getItem('delta-timespan');

    if (fromDate === null || toDate === null || deltaTimespan === null) {
        console.warn("Cleared localStorage because one or more saved values are not initialized.");
        window.localStorage.clear();
        // If no date range is set, use the last 7 days
        fromDate = luxon.DateTime.now().minus({ days: 7 }).toJSDate();
        toDate = luxon.DateTime.now().toJSDate();
    } else {
        fromDate = luxon.DateTime.fromISO(fromDate).toJSDate();
        toDate = luxon.DateTime.fromISO(toDate).toJSDate();
    }
    // Set daterange save checkbox to setting saved in localStorage
    document.getElementById("daterange-save-to").checked = window.localStorage.getItem("daterange-save-to") === "1";
    if (window.localStorage.getItem("daterange-save-to") === "0") {
        toDate = luxon.DateTime.now().toJSDate();
    }

    datePickerFrom = M.Datepicker.init(document.getElementById('from-date-input'), {
        //minDate: luxon.DateTime.now().minus({ years: 1 }).toJSDate(),
        maxDate: luxon.DateTime.now().toJSDate(),
        defaultDate: fromDate,
        setDefaultDate: true
    });

    datePickerTo = M.Datepicker.init(document.getElementById('to-date-input'), {
        //minDate: luxon.DateTime.now().minus({ years: 1 }).toJSDate(),
        maxDate: luxon.DateTime.now().toJSDate(),
        defaultDate: toDate,
        setDefaultDate: true
    });

    document.getElementById("delta-span-input").value = window.localStorage.getItem("delta-timespan");

    // Get data from the last 24 hours and populate beeLogger.currentData
    var data = await beeLogger.getCurrentData()
        .catch(err => errorHandler('current-data', err));

    data = data['data'];
    
    // If no current data is available,
    if (Object.keys(data).length < 1) {
        // display corresponding error/warning
        errorHandler('current-data', 204);
    }

    //await updateCurrentData(data); // Handled by applyDateRange()

    // Set up background task for keeping the 'measured' date up-to-date
    setInterval(() => {
        if (data[Object.keys(data).length - 1]) {
            var measuredLast = data[Object.keys(data).length - 1].measured;
            var measured = luxon.DateTime.fromISO(measuredLast).toRelative({ locale: 'de' });
            document.querySelector('#updated').innerHTML = measured;
        } else {
            return;
        }
    }, 15000);

    // Initializing google charts
    await google.charts.load('current', {
        'packages': ['corechart'],
        // Callback to just draw charts and show data if charts lib is loaded
        'callback': async () => {            
            // Load charts when the library is ready
            await createChartsForDateRange();

            let checkbox = document.getElementById('scale-switch');

            checkbox.addEventListener('change', async (e) => {
                // Redraw chart when the state of the switch changed
                element = document.getElementById('scale-switch');
                window.localStorage.setItem("separate-weight", element.checked ? '1' : '0');
                await drawCompareChart(beeLogger.cachedData['data'], element.checked);
            });

            checkbox.checked = window.localStorage.getItem("separate-weight") == true;
            
            // Timeout function in variable to later be able to stop it again
            // when the window was resized again
            var chartReload = setTimeout(() => {}, 0);
            
            // Event handler for automatically resizing charts on screen resize
            window.onresize = async () => {
                // Stop scheduled call of `applyDateRange()` (if scheduled)
                clearTimeout(chartReload);
                // Schedule data reload (with the changed width passed)
                // to make sure data compression is done properly
                chartReload = setTimeout(createChartsForDateRange, 500);
            };
        }
    });

});

/**
 * Reads date range from date pickers, fetches data and draws charts
 * for the specified time span. If necessary, `?compressed` is applied
 * as well.
 * 
 * @returns {Promise} Resolves when done re-drawing the charts and rejects on error
 */
function applyDateRange() {
    console.log('Applying date range');
    return new Promise(async (resolve, reject) => {
        document.getElementById('beelogger-charts-error-box').classList.add('hide');

        var fromDate = luxon.DateTime.fromJSDate(datePickerFrom.date);
        var toDate = luxon.DateTime.fromJSDate(datePickerTo.date);

        window.localStorage.setItem('daterange-from', fromDate.toISO());
        window.localStorage.setItem('daterange-to', toDate.toISO());
        window.localStorage.setItem('daterange-save-to', document.getElementById("daterange-save-to").checked ? '1' : '0');
        window.localStorage.setItem('delta-timespan', document.getElementById("delta-span-input").value)

        // Calculate difference between dates
        var diff = fromDate.diff(toDate, 'days');
        diff = Math.abs(diff.toObject().days);
    
        // Append 'compressed' option when difference is > 10 days
        var compressed = diff > 10;
    
        fromDate = fromDate.toISODate();
        toDate = toDate.toISODate();
    
        document.getElementById('beelogger-daterange-icon').classList.add('hide');
        document.getElementById('beelogger-preloader').classList.add('active');
    
        // Get data for the specified time span
        var data = await beeLogger.getData(fromDate, toDate, compressed)
            .catch(err => errorHandler('charts', err));

        // Object only with data from the BeeLogger API
        var dataObject = data['data'];

        // No data available for the requested time span
        if (dataObject === undefined) {
            errorHandler('charts', 204);
            reject();
            return;
        } else if (Object.keys(dataObject).length < 1) {
            errorHandler('charts', 204);
            reject();
            return;
        }

        await updateCurrentData(dataObject);
        await drawCharts(data);
        resolve();
    });
}

/**
 * Creates/draws charts for the currently specified date range.
 * Async wrapper for `applyDateRange()`. 
 */
async function createChartsForDateRange() {
    var chartsSection = document.getElementById('charts');
    
    applyDateRange()
        // Error already handled by `applyDateRange()`
        .catch(() => chartsSection.classList.add('hide'));
}

/**
 * Function that updates the 'current data' section
 * in the DOM that is located on top of the page.
 * The display software utilizes this function as well
 * for the same purpose.
 * If there is an error loading data from the data API,
 * an error message is shown in the DOM.
 * 
 * @param {Object} data Data object from the data API
 */
async function updateCurrentData(data) {
    if (!data || Object.keys(data).length < 1) {
        errorHandler('current-data', 204);
        return;
    }

    // Get the latest record in the dataset.
    let latestRecord = data[Object.keys(data).length - 1];
    
    // Get values for current data displays and round them to 2 decimals
    let temperature = Number(latestRecord.temperature).toFixed(2);
    let weight = Number(latestRecord.weight).toFixed(2);
    let humidity = Number(latestRecord.humidity).toFixed(2);
    let weightDelta = getWeightDeltaString(data);

    // Get date and time of the last record and convert it to a relative string
    // Example: 'Measured 2 minutes ago.'
    let measured = luxon.DateTime.fromISO(latestRecord.measured).toRelative({ locale: 'de' });

    document.querySelector('main').classList.remove('hide');
    document.querySelector('#temperature').innerHTML = temperature + ' °C';
    document.querySelector('#weight').innerHTML = weight + ' g';
    document.querySelector('#weight-delta').innerHTML = weightDelta;
    document.querySelector('#humidity').innerHTML = humidity + ' %';
    document.querySelector('#updated').innerHTML = measured;
    document.querySelector('#loading').classList.add('hide');
}

/**
 * Gets newest and oldest weight from the passed data Object
 * and returns the difference ('delta').
 * 
 * @param {Object} data Data object from the data API
 * @returns {string} HTML containing the weight delta (in a fitting color)
 */
function getWeightDeltaString(data) {
    let timespan = document.getElementById("delta-span-input").value * 60000; // in ms
    if (timespan === undefined || timespan == null || timespan === 0) {
        timespan = 86400000; // 24h
    }
    let i = Object.keys(data).length - 1;
    let newer_measured = new Date(data[i].measured);
    let newer_weight = data[i].weight;

    while (newer_measured.getTime() - Date.parse(data[i].measured) < timespan && i > 0) {
        i--;
    }
    let older_weight = data[i].weight;

    let weightDelta = newer_weight - older_weight;
    weightDelta = weightDelta.toFixed(2);

    return weightDelta >= 0 ? `<p style='color: #8aff6b;'>+${weightDelta}</p>` : `<p style='color: #fe7373;'>${weightDelta}</p>`;
}

/**
 * When the 'show feeds' button has been clicked on the dashboard
 * (not the display!), redirect to the feed page instead of showing
 * the iframe.
 */
 function showFeeds() {
    window.location.href += '/rss/feeds/';
}

/**
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
            error.title = `<h5>❌ Keine Daten verfügbar (${err}).</h5>`;
            error.description += `<p>Es sind leider keine Daten verfügbar, was wahrscheinlich
            an einem temporären Ausfall unsererseits liegt.</p>`;
            break;
        // When there hasn't been a match with a specific error code
        default:
            error.title = `<h5>❌ Keine Verbindung zur BeeLogger API möglich (${err}).</h5>`;
            error.description = `
                <hr><br><br>
                <b style="font-size: 120%;">Das Abrufen der Daten ist fehlgeschlagen!</b><br><br>
                <b style="font-size: 120%;">Fehlercode: ${err}</b><br><br>
                <hr><br><br>
                Dies kann zum Beispiel daran liegen, dass unsere Datenschnittstelle gerade offline
                ist oder wir Wartungen vornehmen.<br><br>
                <hr><br><br>
                <b>Schaue einfach später nochmal vorbei</b>, wir haben das sicher bald repariert!
            `;
            scope = 'data';
            break;
    }

    // Check what sections of the front end are affected by this error
    // and hide or un-hide them accordingly.
    switch (scope) {
        // Error only concerns current data (from about the last 24 hours)
        case 'current-data':
            // Only current-data section has to be hidden
            error.description += `
                <p>Du kannst dir jedoch trotzdem historische
                Daten ansehen. Passe dafür einfach den Zeitraum der Diagramme über den Knopf unten in der Ecke
                an.</p>
            `;

            // Replace current data section with error message
            var errorBox = document.getElementById('beelogger-current-data-error-box');
            errorBox.innerHTML = error.title +  error.description;
            errorBox.classList.remove('hide');

            // Access to historical data should still be available
            document.getElementById('loading').classList.add('hide');
            document.getElementsByTagName('main')[0].classList.remove('hide');
            document.getElementById('beelogger-current-data').classList.add('hide');
            break;

        case 'charts':
            error.description += '<p>Das Abrufen der Daten ist für den ausgewählten Bereich fehlgeschlagen.</p>';

            // Replace charts section with error message
            let chartsErrorBox = document.getElementById('beelogger-charts-error-box');
            chartsErrorBox.innerHTML = error.title +  error.description;
            chartsErrorBox.classList.remove('hide');
            // document.getElementById('charts').classList.add('hide');
            document.getElementById('beelogger-preloader').classList.remove('active');
            document.getElementById('beelogger-daterange-icon').classList.remove('hide');

            break;

        // Something mandatory is broken, show error message across the entire screen
        // and hide all other elements
        default:
            // Write error message to the error card
            document.getElementById('loading-title').innerHTML = error.title;
            document.getElementById('loading-text').innerHTML = error.description;
            break;
    }
}