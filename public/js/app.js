/*
                    BeeLogger

     Base JavaScript for dashboard and display
    
     Copyright (c) 2020-2021 Fabian R., Sönke K.
*/

// Initialize both date pickers as globals
var datePickerFrom, datePickerTo;

const beeLoggerAPI = new BeeLoggerAPI();

document.addEventListener('DOMContentLoaded', async () => {
    var dateToday = luxon.DateTime.now().toISODate();
    var dateYesterday = luxon.DateTime.now().minus({ days: 1 }).toISODate();
    
    // Query all records from yesterday to today
    // Yesterday's records are needed for delta calculation
    var data = await beeLoggerAPI.getData(dateYesterday, dateToday, false);
    beeLoggerAPI.data.current = data;
    beeLoggerAPI.data.cache = data;

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
            await updateCurrentData(data);
            await drawCharts(data);

            checkbox = document.getElementById("scale-switch");
            checkbox.addEventListener("change", async (e) => {
                element = document.getElementById("scale-switch");
                if (element.checked) await drawCompareChart(data, true);
                else await drawCompareChart(data, false);
            });
            checkbox.checked = false;

            // Event handler for automatically resizing charts on screen resize
            window.onresize = async () => {
                // Load currently displayed data from cache.
                data = beeLoggerAPI.data.cache;
                await drawCharts(data);
            };
        }
    });

});

async function changeDateRange() {
    var fromDate = luxon.DateTime.fromJSDate(datePickerFrom.date);
    var toDate = luxon.DateTime.fromJSDate(datePickerTo.date);

    // Calculate difference between dates
    var diff = fromDate.diff(toDate, 'days');
    diff = Math.abs(diff.toObject().days);

    // Append 'compressed' option when difference is > 10 days.
    var compressed = diff > 10 ? true : false;

    fromDate = fromDate.toISODate();
    toDate = toDate.toISODate();

    var data = await beeLoggerAPI.getData(fromDate, toDate, compressed);
    beeLoggerAPI.data.cache = data;

    await drawCharts(data);
}

// Function for updating the 'current data' section
async function updateCurrentData(data) {
    if(data === null) {
        document.getElementById('loading-title').innerHTML = '❌ Momentan nicht verfügbar';
        document.getElementById('loading-text').innerHTML = `
            <hr>
            <b style="font-size: 120%;">Das Abrufen der Daten ist fehlgeschlagen!</b>
            <br>
            <hr>
            Dies kann daran liegen, dass unsere Datenschnittstelle gerade offline ist,
            wir Wartungen vornehmen oder aufgrund eines Vorfalls keine aktuellen Daten
            aufgezeichnet wurden.<hr>
            <b>Schaue einfach später nochmal vorbei</b>, wir haben das sicher bald repariert!
        `;
        document.getElementById('loading-progress').classList.remove('progress');
    }
    
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