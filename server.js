"use strict"
// Importing packages (require)

const express = require("express");
const cors = require('cors');
const superagent = require('superagent');
const pg = require("pg");
const { search } = require("superagent");


//Initialization and configuration 

const app = express();
app.use(cors());
require("dotenv").config();
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const PORT = process.env.PORT;

// Routes - endpoints
//Location routes
app.get("/location", handleLocation);

// Weather routes
app.get("/weather", handleWeather);

// parks routes
app.get("/parks", handlePark);

// Movie routes
app.get("/movies", handleMovies);

// Any other routes
app.get('*', (req, res) => {
  res.status(404).send('Sorry, the page you are trying to access does not exist....');
});

// Handlers

// locationHandler function
function handleLocation(req, res) {
  // Get the data array from JSON
  let searchQuery = req.query.city;
  // Check database 
  checkDataBase(searchQuery, res);
  // res.status(200).send(locationObject);
}

// weatherHandler function
function handleWeather(req, res) {
  // Get the data from req
  let searchQuery = req.query.search_query;
  // Accessing the weather.json and store it in weatherData
  getWeatherData(searchQuery, res);
}

// parkHandler function
function handlePark(req, res) {
  // Get the data array from JSON
  let searchQuery = req.query.search_query;
  // Accessing the location.json and store it in locationData
  getParksData(searchQuery, res);
  // res.status(200).send(locationObject);
}

// Movies function
function handleMovies(req, res) {
  let searchQuery = req.query.search_query;
  // Accessing the data from the movie API
  getMoviesData(searchQuery, res);
}

// Getting the data 

// Handle location data from function
function getLocationData(searchQuery, res) {

  // Using Data from API
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

      let dbQuery = `INSERT INTO city(search_query, display_name , lon, lat) VALUES ($1, $2 ,$3, $4)`;
      
      let secureValue = [searchQuery, displayName, longitude, latitude];

      client.query(dbQuery, secureValue).then(() => {
        console.log(`the city ${searchQuery} added to the database`);
      }).catch(error => {
        res.status(400).send("Something went wrong from the database" + error);
      })

      // Creating an object using these data
      let responseObject = new CityLocation(searchQuery, longitude, latitude, displayName);
      res.status(200).send(responseObject);
      return responseObject;
    } catch {
      res.status(500).send("Sorry, something went wrong from inner CATCH");
    }
  }).catch(() => {
    res.status(500).send("Sorry, something went wrong from PROMISE");
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

// Handle weather data from function
function getWeatherData(searchQuery, res) {

  // Using Data from API
  let query = {
    city: searchQuery,
    key: process.env.WEATHER_API_KEY,
  }
  let url = `https://api.weatherbit.io/v2.0/forecast/daily`;
  superagent.get(url).query(query).then(weatherData => {
    try {
      let weatherArray = weatherData.body.data;
      let arrayOfObjects = [];

      weatherArray.map(value => {
        let currentDate = new Date(value.valid_date).toString();
        let modifiedDate = currentDate.split(" ").splice(0, 4).join(" ");
        let responseObject = new Weather(value.weather.description, modifiedDate);
        arrayOfObjects.push(responseObject);
      })
      res.status(200).send(arrayOfObjects);
    } catch {
      res.status(500).send("Sorry, something went wrong");
    }
  }).catch(() => {
    res.status(500).send("Sorry, something went wrong");
  });
  // Get values from object (Old way from lab06)

  // let weatherData = require("./data/weather.json");
  // let weatherArray = weatherData.data;
  // let arrayOfObjects = [];
  // for (let i = 0; i < weatherArray.length; i++) {
  //   let currentDate = new Date(weatherArray[i].valid_date).toString();
  //   let modifiedDate = currentDate.split(" ").splice(0, 4).join(" ");
  //   let responseObject = new Weather(weatherArray[i].weather.description, modifiedDate);
  //   arrayOfObjects.push(responseObject);
  // }
  // return arrayOfObjects;
}

// Handle parks data from function
function getParksData(searchQuery, res) {

  // Using Data from API
  let query = {
    q: searchQuery,
    api_key: process.env.PARKS_API_KEY
  };
  let url = "https://developer.nps.gov/api/v1/parks";
  superagent.get(url).query(query).then((parkData) => {
    try {
      let parksArray = parkData.body.data;
      let arrayOfObjects = [];

      parksArray.forEach(value => {
        let name = value.fullName;
        let address = value.addresses[0].line1 + " " + value.addresses[0].city + " " + value.addresses[0].stateCode + " " + value.addresses[0].postalCode;
        let fee = value.entranceFees[0].cost;
        let description = value.description;
        let url = value.url;
        let responseObject = new Park(name, address, fee, description, url);
        arrayOfObjects.push(responseObject);
      })
      res.status(200).send(arrayOfObjects);
    } catch {
      res.status(500).send("Sorry, something went wrong");
    }
  }).catch((error) => {
    res.status(500).send("Sorry, something went wrong from promise" + error);
  });
}

// Handle movie data from function
function getMoviesData(searchQuery, res) {

  // Using data from API
  let query={
    api_key: process.env.MOVIE_API_KEY,
    query: searchQuery,
  }

  let url = `https://api.themoviedb.org/3/search/movie`;
  superagent.get(url).query(query).then(movieData => {
    try {
      let moviesArray = movieData.body.results;
      let arrayOfObjects = [];

      moviesArray.map(value => {
        let title = value.title;
        let overview = value.overview
        let avgVotes = value.vote_average;
        let totVotes = value.vote_count;
        let image = `https://image.tmdb.org/t/p/w500${value.poster_path}`;
        let popularity = value.popularity;
        let released = value.release_date;  
        let responseObject = new Movie(title, overview, avgVotes, totVotes, image, popularity, released);
        arrayOfObjects.push(responseObject);
      })
      res.status(200).send(arrayOfObjects);

    } catch {
      console.log('Sorry something idiot happened (from internal catch)');
    }
  }).catch(error=> {
    console.log('Sorry ann error occurred, Error from catch ');
  })
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

function Park(name, address, fee, description, url) {
  this.name = name;
  this.address = address;
  this.fee = fee;
  this.description = description;
  this.url = url;
}

function Movie(title, overview, avgVotes, totVotes, image, popularity, released) {
  this.title = title;
  this.overview = overview;
  this.average_votes =  avgVotes;
  this.total_votes = totVotes;
  this.image_url = image;
  this.popularity = popularity;
  this.released_on = released;
}

// Check the database
function checkDataBase(searchQuery, res) {
  let dataBaseQuery = `SELECT * FROM city WHERE search_query='${searchQuery}';`;
  client.query(dataBaseQuery).then(data => {
    if(data.rows.length === 0) {
      console.log(data.rows);
      console.log("Fetching data from API");
      getLocationData(searchQuery, res)
    } else {
      console.log("Fetching data from Database");

      let dbQuery = `SELECT * FROM city WHERE search_query='${searchQuery}'`;
      
      client.query(dbQuery).then((data) => {
        let databaseData = data.rows[0];
        let locationObject = new CityLocation(databaseData.search_query, databaseData.lon, databaseData.lat , databaseData.display_name);
        res.status(200).send(locationObject);
      }).catch(error => {
        res.status(400).send("Something went wrong from the database" + error);
      })
    }
  })
}


// Listener

client.connect().then(()=> {
  app.listen(PORT, () => {
    console.log(`The server is listening to PORT ${PORT}`);
  });
}).catch((error) => {
  console.log("An error occurred while connecting the database", error);
});
