function charts() {
    drawCompareChart()
    drawHumidityChart();
    drawTempChart();
    drawWeightChart();
    $("body").css("backgroundImage", "none");
}

function home() {
    $('.tabs').tabs('select', 'index-tab');
    $("body").css("backgroundImage", "url('/assets/slideshow/bee-background.jpg')");
}

function stundenplan() {
    $("body").css("backgroundImage", "none");
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

$(document).ready(() => {
    $('.tabs').tabs();
    setupTimers();
});