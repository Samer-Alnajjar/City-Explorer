"use strict"
// Importing packages

const express = require("express");

//Initialization and configuration 

const app = express();
require("dotenv").config();

const PORT = process.env.PORT;

app.listen(PORT,handleLocation);



function handleLocation(req,res) {
  console.log(`The server is listening to PORT ${PORT}`);
}