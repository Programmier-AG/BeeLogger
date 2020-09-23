async function fetchCompareData() {
    var response, dateTwo;
    var compareValue = document.getElementById("dropSelect");

    if (compareValue) {
        switch (compareValue.options[compareValue.selectedIndex].value) {
            // Today
            case "1":
                response = await fetch("http://" + api_adress + "/api/data/get?from=" + date + "&to=" + date);
                from = date;
                to = date;
                view = "today";
                break;
                // Week
            case "2":
                var dateTwo = new Date(Date.now() - 604800000);
                var yearTwo = dateTwo.getFullYear();
                var monthTwo = dateTwo.getMonth() + 1;
                monthTwo = (monthTwo < 10 ? "0" : "") + monthTwo;
                var dayTwo = dateTwo.getDate();
                dayTwo = (dayTwo < 10 ? "0" : "") + dayTwo;
                dateTwo = yearTwo + "-" + monthTwo + "-" + dayTwo;
                from = dateTwo;
                to = date;
                view = "week";
                response = await fetch("http://" + api_adress + "/api/data/get?from=" + dateTwo + "&to=" + date);
                break;
                // Month
            case "3":
                var dateTwo = new Date(Date.now());
                dateTwo.setMonth(dateTwo.getMonth());
                var yearTwo = dateTwo.getFullYear();
                var monthTwo = dateTwo.getMonth();
                monthTwo = (monthTwo < 10 ? "0" : "") + monthTwo;
                var dayTwo = dateTwo.getDate();
                dayTwo = (dayTwo < 10 ? "0" : "") + dayTwo;
                dateTwo = yearTwo + "-" + monthTwo + "-" + dayTwo;
                from = dateTwo;
                to = date;
                view = "month";
                response = await fetch("http://" + api_adress + "/api/data/get?from=" + dateTwo + "&to=" + date + "&compressed");
                break;
                // Year
            case "4":
                var year = new Date(Date.now()).getFullYear();
                from = year;
                to = year;
                view = year;
                response = await fetch("http://" + api_adress + "/api/data/get?from=" + year + "-01-01&to=" + year + "-12-31&compressed");
                break;
                // All
            case "5":
                from = "2020";
                to = "-";
                view = "all";
                response = await fetch("http://" + api_adress + "/api/data/get?from=2000-01-01&to=2099-12-31&compressed");
                break;
        }
    } else {
        response = await fetch("http://" + api_adress + "/api/data/get?from=" + date + "&to=" + date);
        from = date;
        to = date;
        view = "today";
    }

    let ret = await response.json();
    return await ret;
}

async function drawCompareChart() {
    chart_st = true;
    var c = await fetchCompareData();
    var compareData = [
        ['Tag', 'Temperatur (°C)', 'Gewicht (KG)', 'Luftfeuchtigkeit (%)']
    ];

    for (row in c) {
        var measured = new Date(c[row].measured.replace("-", "/").replace("-", "/"));
        compareData.push([measured, c[row].temperature, c[row].weight, c[row].humidity]);
    }

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