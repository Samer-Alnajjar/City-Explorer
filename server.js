"use strict"
// Importing packages (require)

const express = require("express");
const cors = require('cors');


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
  let locationObject = getLocationData(searchQuery);
  res.status(200).send(locationObject);
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
function getLocationData(searchQuery) {

  let locationData = require("./data/location.json");
  // Get values from object
  let longitude = locationData[0].lon;
  let latitude = locationData[0].lat;
  let displayName = locationData[0].display_name;
  // create data object  
  let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);
  return responseObject;
}

// Constructors
function CityLocation(searchQuery, displayName, lat, lon) {
  this.search_query = searchQuery;
  this.formatted_query = displayName;
  this.latitude = lat;
  this.longitude = lon;
}

function Weather(description, time) {
  this.forecast = description;
  this.time = time
}


// Listener
app.listen(PORT, () => {
  console.log(`The server is listening to PORT ${PORT}`);
});