async function drawCompareChart() {
    var c = await fetchData();
    var compareData = [
        ['Tag', 'Temperatur (°C)', 'Gewicht (KG)', 'Luftfeuchtigkeit (%)']
    ];

    for (row in c) {
        var measured = new Date(c[row].measured);
        compareData.push([measured, c[row].temperature, c[row].weight, c[row].humidity]);
    }

    var from = luxon.DateTime.fromFormat(compareData[1][0], "EEE, d MMM yyyy TTT");
    var to = luxon.DateTime.fromHTTP(compareData[compareData.length - 1][0]);
    console.log(from, to, compareData[1][0], compareData[compareData.length - 1][0]);

    var data = google.visualization.arrayToDataTable(compareData);
    var options = {
        title: `Daten von ${from} bis ${to}`,
        curveType: 'function',
        legend: {
            position: 'bottom'
        },
        width: "100%",
        height: "70%",
        chartArea: {
            left: '8%',
            top: '8%',
            width: "100%",
            height: "70%"
        },
    };
    var chart = new google.visualization.LineChart(document.getElementById("chart"));
    await chart.draw(data, options);
}