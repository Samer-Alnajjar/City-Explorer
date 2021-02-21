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
app.get("/location", handleLocation)


// Handler function
function handleLocation(req,res) {
  // Get the data array from JSON
  let searchQuery = req.query.city;
  // Accessing the location.json and store it in locationData
  let locationObject =  getLocationData(searchQuery);
  res.status(200).send(locationObject);
}


// Handle data from function
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


// Listener
app.listen(PORT,() => {
  console.log(`The server is listening to PORT ${PORT}`);
});