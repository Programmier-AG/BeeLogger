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

async function about() {
    let req = await fetch("http://" + api_adress + "/api/stats");
    let res = await req.json();

    $("#inserted-count").html(res["insert_calls"]);
    $("#requested-count").html(res["data_calls"]);
    $("#website-count").html(res["website"]);

    $("body").css("backgroundImage", "url('/assets/slideshow/bee-background.jpg')");

}

var timeoutID;

function startTimer() {
    timeoutID = window.setTimeout(doInactive, 60000);
}


function resetTimer() { 
    window.clearTimeout(timeoutID)
    startTimer();
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

$(document).ready(() => {
    $('.tabs').tabs();
    setupTimers();
});
