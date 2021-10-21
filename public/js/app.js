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
    var dateToday = luxon.DateTime.now().toISODate();
    var dateYesterday = luxon.DateTime.now().minus({ days: 1 }).toISODate();
    
    // Get data from the last 24 hours and populate beeLogger.currentData
    var data = await beeLogger.getCurrentData(dateYesterday, dateToday)
        .catch(err => errorHandler(err));
    
    // No data available for the requested time span
    if (Object.keys(data).length < 1) {
        errorHandler(204);
        return;
    }

    // Initializing used Materialize components
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
    M.Modal.init(document.querySelectorAll('.modal'), {});
    M.FormSelect.init(document.querySelectorAll('select'), {});
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {});

    datePickerFrom = M.Datepicker.init(document.getElementById('from-date-input'), {
        minDate: luxon.DateTime.now().minus({ years: 1 }).toJSDate(),
        maxDate: luxon.DateTime.now().toJSDate(),
        defaultDate: luxon.DateTime.now().minus({ days: 4 }).toJSDate(),
        setDefaultDate: true
    });

    datePickerTo = M.Datepicker.init(document.getElementById('to-date-input'), {
        minDate: luxon.DateTime.now().minus({ years: 1 }).toJSDate(),
        maxDate: luxon.DateTime.now().toJSDate(),
        defaultDate: luxon.DateTime.now().toJSDate(),
        setDefaultDate: true
    });

    // Setting up background task for keeping the 'measured' date up-to-date
    setInterval(() => {
        var measuredLast = data[Object.keys(data).length - 1].measured;
        var measured = luxon.DateTime.fromISO(measuredLast).toRelative({ locale: 'de' });
        document.querySelector('#updated').innerHTML = measured;
    }, 15000);

    // Initializing google charts
    await google.charts.load('current', {
        'packages': ['corechart'],
        // Callback to just draw charts and show data if charts lib is loaded
        'callback': async () => {
            await updateCurrentData(data)
                .catch(err => { throw err; });
            
            await drawCharts(data)
                .catch(err => { throw err; });;

            checkbox = document.getElementById("scale-switch");
            checkbox.addEventListener("change", async (e) => {
                element = document.getElementById("scale-switch");
                if(element.checked) await drawCompareChart(data, true);
                else await drawCompareChart(data, false);
            });
            checkbox.checked = false;

            // Event handler for automatically resizing charts on screen resize
            window.onresize = async () => {
                // Load currently displayed data from cache
                data = beeLogger.data.cachedData;
                await drawCharts(data)
                    .catch(err => { throw err; });;
            };
        }
    });

});

/**
 * When the button for changing the date is pressed,
 * this function gets executed to load the new data into
 * the document-wide, cache of the API class and invoke
 * the chart re-renders.
 */
async function changeDateRange() {
    var fromDate = luxon.DateTime.fromJSDate(datePickerFrom.date);
    var toDate = luxon.DateTime.fromJSDate(datePickerTo.date);

    // Calculate difference between dates
    var diff = fromDate.diff(toDate, 'days');
    diff = Math.abs(diff.toObject().days);

    // Append 'compressed' option when difference is > 10 days
    var compressed = diff > 10 ? true : false;

    fromDate = fromDate.toISODate();
    toDate = toDate.toISODate();

    // Get data from the last 24 hours and (re-)populate beeLogger.cachedData
    var data = await beeLogger.getData(fromDate, toDate, compressed)
        .catch(err => errorHandler(err));

    // No data available for the requested time span
    if (Object.keys(data).length < 1) {
        errorHandler(204);
        return;
    }
    
    await drawCharts(data);
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
    if(!data) throw new Error('Unable to update current data due to missing data.');

    // Get the measured timestamp from latest record
    var measuredLast = data[Object.keys(data).length - 1].measured;
    var measured = luxon.DateTime.fromISO(measuredLast).toRelative({ locale: 'de' });

    document.querySelector('main').classList.remove('hide');
    document.querySelector('#temperature').innerHTML = data[Object.keys(data).length - 1].temperature + ' °C';
    
    var weightCurrent = data[Object.keys(data).length - 1].weight;
    var weightDelta = getWeightDelta(data);
    var humidityCurrent = data[Object.keys(data).length - 1].humidity;
    
    document.querySelector('#weight').innerHTML = weightCurrent + ' kg';
    document.querySelector('#weight-delta').innerHTML = weightDelta;
    document.querySelector('#humidity').innerHTML = humidityCurrent + ' %';
    document.querySelector('#updated').innerHTML = measured;
    document.querySelector('#loading').classList.add('hide');
}

/**
 * Gets newest and oldest weight from the passed data Object
 * and returns the difference ("delta").
 * 
 * @param {Object} data Data object from the data API
 * @returns {string} HTML containing the weight delta (in a fitting color)
 */
function getWeightDelta(data) {
    // Get weight from most recent record
    var weightCurrent = data[Object.keys(data).length - 1].weight;
    // Get weight from the record in the middle of the array (measured approximately 24 hours ago)
    // This is done in case there is no record from *exactly* 24 hours ago
    var weightStartIndex = Math.floor(((Object.keys(data).length - 1) / 2))
    var weightStart = data[weightStartIndex].weight;
    // Calculate the delta of the current and start weight
    var weightDelta = weightCurrent - weightStart;
    // Limit float to 2 decimal places
    weightDelta = Number(weightDelta.toFixed(2));
    // Format HTML string with green color for weight growth and red color for weight decline
    var weightDeltaString = weightDelta >= 0 ? `<p style="color: #8aff6b;">+${weightDelta}</p>` : `<p style="color: #fe7373;">${weightDelta}</p>`;
    
    return weightDeltaString;
}

/**
 * Handler function for when the API returns an error.
 * This function will catch the error and display an error
 * message to the user.
 * 
 * @param {number} err HTTP error code passed on promise rejection
 */
function errorHandler(err) {
    // The error to display to the user
    var error = {
        title: '',
        description: ''
    }

    // Get error message that fits the error code (if defined)
    switch (err) {
        case 204:
            error.title = `<h5>❌ Keine aktuellen Daten verfügbar (${err}).</h5>`;
            error.description += `
                <hr><br><br>
                <b style="font-size: 120%;">Es sind keine aktuellen Daten verfügbar!</b><br><br>
                <b style="font-size: 120%;">Fehlercode: ${err}</b><br><br>
                <hr><br><br>
                Es sind leider keine aktuellen Daten verfügbar, was wahrscheinlich an einem
                Ausfall unsererseits liegt.<br><br>
                <hr><br><br>
                <b>Schaue einfach später nochmal vorbei</b>, wir haben das sicher bald repariert!
            `;
            break;
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
            break;
    }

    // Write error message to the error card
    document.getElementById('loading-title').innerHTML = error.title;
    document.getElementById('loading-text').innerHTML = error.description;
    
    // API request is done, hide spinner
    document.getElementById('loading-progress').classList.remove('progress');
}