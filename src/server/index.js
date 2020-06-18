const dotenv = require('dotenv');
dotenv.config();

// Setup empty JS object to act as endpoint for all routes
let projectData = {};

// Personal API Key for GeoNames API
const baseUrlGeoNames = 'http://api.geonames.org/searchJSON?q=';
const userName = process.env.API_USERNAME;

// Personal API Key for Weatherbit API
const baseUrlWeatherbit = 'http://api.weatherbit.io/v2.0/forecast/daily?';
const weatherbitKey = process.env.API_KEY_WEATHER;

// Personal API Key for Pixabay API
const baseUrlPixabay = 'https://pixabay.com/api/?key=';
const pixabayKey = process.env.API_KEY_PIXABAY;

// Require Express to run server and routes
const express = require('express')
const app = express();
const http = require("http");
const https = require("https");

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');

app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'));

app.listen(8000, () => {
    console.log('App listening on port 8000!')
});


app.get('/', (req, res) => {
    res.sendFile('dist/index.html')
});


// Initialize getGeonames route with a callback function
app.get('/getTravelInfo', travelInfo);

async function travelInfo(req, res) {
    const inputLocation = req.query.inputLocation;
    getGeoNamesData(inputLocation)
    .then(function(geoData){
        if(!geoData || geoData.geonames.length == 0){
            res.send({error: 'Please enter correct location (e.g London)'});
        }else{
            const lng = geoData.geonames[0].lng;
            const lat = geoData.geonames[0].lat;
            const toponymName = geoData.geonames[0].toponymName;
            const countryName = geoData.geonames[0].countryName;
            const weatherbitUrl = `${baseUrlWeatherbit}lat=${lat}&lon=${lng}&key=${weatherbitKey}`;

            getWeatherbitData(weatherbitUrl)
            .then(function(weatherData){

                const pixabayUrl = `${baseUrlPixabay}${pixabayKey}&q=${inputLocation}+${countryName}`;

                getPixabayData(pixabayUrl)
                
                .then(function(pixabayData){
                    let imageInfo;

                    //console.log(pixabayData)

                    if(!pixabayData || !pixabayData.hits || pixabayData.hits.length == 0){
                        //Set default image if pixabay can't find an image for the location
                        imageInfo = "https://static.m.lot.com/hrbeqclerhdplj/a/travel-time4.jpg";
                    }else{
                        imageInfo =  pixabayData.hits[0].webformatURL;
                    }

                    res.send({
                        inputLocation: toponymName, 
                        country: geoData.geonames[0].countryName,
                        highTemp: weatherData.data[0].high_temp, 
                        lowTemp: weatherData.data[0].low_temp, 
                        description: weatherData.data[0].weather.description,
                        image: imageInfo
                    })
                })
            })
        }
    })
}



function getGeoNamesData(inputLocation){
    
    const geoNamesUrl = `${baseUrlGeoNames}${encodeURIComponent(inputLocation)}&maxRows=10&username=${userName}`;
    
    //const response = await fetch(geoNamesUrl);

    let geoNameRequest = new Promise((resolve) => {
        http.get(geoNamesUrl, externalRes=>{
            externalRes.setEncoding("utf-8");
            let body = "";
            externalRes.on("data", data=>{
                body += data;
            });
            externalRes.on("end", () =>{
                body = JSON.parse(body);
                console.log(body);
                //res.send(body)
                resolve(body);
            });
        });
    })
    
    return geoNameRequest;
}


function getWeatherbitData(weatherbitUrl){
    
    let weatherbitRequest = new Promise((resolve) =>{
        http.get(weatherbitUrl, externalRes=>{
            externalRes.setEncoding("utf-8");
            let body = "";
            externalRes.on("data", data=>{
                body += data;
            });
            externalRes.on("end", () =>{
                body = JSON.parse(body);
                console.log(body);
                //res.send(body)
                resolve(body);
            });
        });
    })
    return weatherbitRequest;
}


function getPixabayData(pixabayUrl){

    let pixabayRequest = new Promise((resolve) =>{
        https.get(pixabayUrl, externalRes=>{
            externalRes.setEncoding("utf-8");
            let body = "";
            externalRes.on("data", data=>{
                body += data;
            });
            externalRes.on("end", () =>{
                body = JSON.parse(body);
                console.log(body);
                //res.send(body)
                resolve(body);
            });
        });
    });
    return pixabayRequest;
}


// Initialize all route with a callback function
app.get('/all', getData);

/* Callback function to complete GET '/all' */
function getData(req, res){
    res.send(projectData);
}


// Post Route
app.post('/addInfo', addInfo);

/* Callback function to complete POST '/addInfo' */
function addInfo(req, res){
    //console.log(req);

    projectData = {
        inputLocation: req.body.inputLocation,
        country: req.body.country,
        inputDate: req.body.inputDate,
        daysLeft: req.body.daysLeft,
        tripLenght: req.body.tripLenght,
        highTemp: req.body.highTemp,
        lowTemp: req.body.lowTemp,
        description: req.body.description,
        image: req.body.image
    };

    res.send(projectData);
    console.log(projectData);
}

module.exports = app;