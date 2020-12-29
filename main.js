
//Create Map
const mymap = L.map('issMap').setView([0,0], 3);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
const api_url = "https://api.wheretheiss.at/v1/satellites/25544";
tiles.addTo(mymap);

//Create Icon
const issIcon = L.icon({
    iconUrl: 'iss.png',
    iconSize: [50, 32],
    iconAnchor: [25, 16],
});
let marker = L.marker([0,0],{icon: issIcon}).addTo(mymap);

//Communicate with the API
let firstTime = false;
async function getISS() {
const response = await fetch(api_url);
const data = await response.json();
const { latitude, longitude, altitude } = data;
const aspect = 1.5625;
const w = (altitude * aspect) / 10;
const h = altitude / 10;
issIcon.options.iconSize = [w,h];
issIcon.options.iconAnchor = [w/2,h/2]
mymap.setView([latitude,longitude],mymap.getZoom());
marker.setLatLng([latitude,longitude]);
document.getElementById('lat').textContent = latitude;
document.getElementById('lon').textContent = longitude;
document.getElementById('alt').textContent = altitude.toFixed(2);
};
getISS();
setInterval(function(){getISS()},3000);



//For Charting
async function getData1() {
    const xs1 = [];
    const ys1 = [];
    const response = await fetch('ZonAnn.Ts+dSST.csv');
    const data = await response.text();
    const table = data.split('\n').slice(1);
    table.forEach(row => {
        const columns = row.split(',');
        const year = columns[0];
        const temp = columns[1];
        xs1.push(year);
        ys1.push(parseFloat(temp) + 57);
        console.log(year, temp);
    });
    return { xs1, ys1 };
}

async function getData2() {
    const xs2 = [];
    const ys2 = [];
    const response = await fetch('NH.Ts+dSST.csv');
    const data2 = await response.text();
    const table = data2.split('\n').slice(1);
    table.forEach(row => {
        const columns = row.split(',');
        const year = columns[0];
        const temp = columns[1];
        xs2.push(year);
        ys2.push(parseFloat(temp) + 57);
        console.log(year, temp);
    });
    return { xs2, ys2 };
}

async function chartIt() {
const data1 = await getData1();
const data2 = await getData2();
const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
        labels: data1.xs1,
        datasets: [{
            label: 'Combined Land-Surface Air and Sea-Surface Water Temperature Anomalies (Land-Ocean Temperature Index, L-OTI)',
            backgroundColor: 'green',
            fill: false,
            borderColor: 'green',
            borderWidth: .5,
            data: data1.ys1,
        },{
        label: 'Northern Hemisphere-mean monthly, seasonal, and annual means',
            backgroundColor: 'blue',
            fill: false,
            borderColor: 'blue',
            borderWidth: .5,
            data: data2.ys2,
        }]
    },

    // Configuration options go here
    options: {
        scales: {
            yAxes: [
                {
                ticks: {
callback: function(value, index, values) {
    return value + '°';
}
                }
            }
            ]
        },
        layout: {
            padding: {
                left: 100,
                right: 150,
                top: 50,
                bottom: 650
            }
        }
    }
});
}
chartIt();
