function updateCharts() {
    drawCompareChart();

    drawHumidityChart();
    drawTempChart();
    drawWeightChart();
}

function stundenplan() {
    document.getElementById("data-site").style.display = "none";
    document.getElementById("charts").style.display = "none";
    document.getElementById("tgg-frame").style.display = "block";
    let frame = document.getElementById("plan-frame");
    frame.src = "http://tgg-leer.de/stundenplaene/stundenplaene.html";
}
function home() {
    document.getElementById("data-site").style.display = "block";
    document.getElementById("tgg-frame").style.display = "none";
    document.getElementById("charts").style.display = "none";
}
function charts() {
    document.getElementById("charts").style.display = "block";
    document.getElementById("data-site").style.display = "none";
    document.getElementById("tgg-frame").style.display = "none";

    updateCharts();
}

var timeoutID;

function startTimer() {
    timeoutID = window.setTimeout(doInactive, 60000);
}
function setupTimers () {
    document.addEventListener("mousemove", resetTimer, false);
    document.addEventListener("mousedown", resetTimer, false);
    document.addEventListener("keypress", resetTimer, false);
    document.addEventListener("touchmove", resetTimer, false);
     
    startTimer();
}
function doInactive() {
    home();
}
function resetTimer() { 
    window.clearTimeout(timeoutID)
    startTimer();
}


