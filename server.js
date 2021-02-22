"use strict"
// Importing packages (require)

const express = require("express");
const cors = require('cors');
const superagent = require('superagent');


//Initialization and configuration 

const app = express();
app.use(cors());
require("dotenv").config();

const PORT = process.env.PORT;

// Routes - endpoints
//Location routes
app.get("/location", handleLocation);

// Weather routes
app.get("/weather", handleWeather);

// Any other routes
app.get('*', (req, res) => {
  res.status(404).send('Sorry, the page you are trying to access does not exist....');
}); 



// weatherHandler function
function handleWeather(req, res) {
  // Accessing the weather.json and store it in weatherData
  let weatherObject = getWeatherData();
  res.status(200).send(weatherObject);
}

// locationHandler function
function handleLocation(req, res) {
  // Get the data array from JSON
  let searchQuery = req.query.city;
  // Accessing the location.json and store it in locationData
  getLocationData(searchQuery, res);
  // res.status(200).send(locationObject);
}


// Handle weather data from function
function getWeatherData() {

  // Get values from object

  let weatherData = require("./data/weather.json");
  let weatherArray = weatherData.data;
  let arrayOfObjects = [];
  // create data object
  for (let i = 0; i < weatherArray.length; i++) {
    let currentDate = new Date(weatherArray[i].valid_date).toString();
    let modifiedDate = currentDate.split(" ").splice(0, 4).join(" ");
    let responseObject = new Weather(weatherArray[i].weather.description, modifiedDate);
    arrayOfObjects.push(responseObject);
  }
  return arrayOfObjects;
}


// Handle location data from function
function getLocationData(searchQuery, res) {

  const query = {
    key: process.env.GEOCODE_API_KEY, 
    q: searchQuery,
    limit: 1,
    format: 'json'
  }

  let url = `https://us1.locationiq.com/v1/search.php`
  superagent.get(url).query(query).then(data => {
    // It's recommended to log the data to see the structure of the data you are getting
    // We added .body because it will retain the header and the body and for now we need just the body

    // Checking if my code is correct
    try {
      // Getting the data from the object
      let longitude = data.body[0].lon;
      let latitude = data.body[0].lat;
      let displayName = data.body[0].display_name;
  
      // Creating an object using these data
      let responseObject = new CityLocation(searchQuery, longitude, latitude, displayName);
      res.status(200).send(responseObject) ;
    } catch {
      res.status(500).send("Sorry, something went wrong");
    } 
  }).catch( () => {
    res.status(500).send("Sorry, something went wrong");
  });

  // Old code (lab-06)
  // let locationData = require("./data/location.json");
  // // Get values from object
  // let longitude = locationData[0].lon;
  // let latitude = locationData[0].lat;
  // let displayName = locationData[0].display_name;
  // // create data object  
  // let responseObject = new CityLocation(searchQuery, longitude, latitude, displayName);
  // return responseObject;
}

// Constructors
function CityLocation(searchQuery, longitude, latitude, displayName) {
  this.search_query = searchQuery;
  this.formatted_query = displayName;
  this.latitude = latitude;
  this.longitude = longitude;
}

function Weather(description, time) {
  this.forecast = description;
  this.time = time
}


// Listener
app.listen(PORT, () => {
  console.log(`The server is listening to PORT ${PORT}`);
});