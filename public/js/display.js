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

    drawCompareChart()

    drawHumidityChart();
    drawTempChart();
    drawWeightChart();
}