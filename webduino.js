var express = require('express');
// CORS - For handling cross domain requests for data
var cors = require('cors');
var path = require("path");
var util = require("util");
var events = require("events");

var application_root = __dirname;

var Webduino = function() {
  var self = this;

  if ( !(this instanceof Webduino) ) {
    return new Webduino( );
  }

  var expressApp = express(); 
  this.httpserver = require('http').createServer(expressApp);

  var webduino = require("./webduino-api");
  var webduinoApi= webduino(this.httpserver);

  // Configure Express middelware
  expressApp.use(cors());
  expressApp.use(express.static('public'));
  expressApp.use(express.json());
  expressApp.use(express.urlencoded());

  // Check for the board connection (uses johnny-five underneath)
  webduinoApi.on("ready", function() {
    // pin API
    expressApp.get('/api/pins/:id', getPin);
    expressApp.get('/api/pins', getPins);
    expressApp.post('/api/pins/:id', putPin);
    expressApp.put('/api/pins/:id', putPin);

    expressApp.put('/api/sensors/:id', putSensor);
    expressApp.get('/api/sensors', getSensors);
    expressApp.get('/api/sensors/:id', getSensor);

    expressApp.put('/api/leds/:id', putLed);
    expressApp.get('/api/leds/:id', getLed);
    expressApp.get('/api/leds', getLeds);

    expressApp.get('/api/board', getBoard);

    expressApp.get('/api/webduino', getWebduino);

    self.emit("ready")

  });





  // getPin - GET /pin/:id
  var getPin = function(req, res){
    webduinoApi.getPin(req, res);
  }

  // getPins - GET /pin
  var getPins = function(req, res){
    webduinoApi.getPins(req, res);
  };

  // putPin - PUT /pin/:id
  var putPin = function(req, res){
    webduinoApi.putPin(req, res);
  };

  // postSensor 
  var getSensors = function(req, res){
    webduinoApi.getSensors(req, res);
  };

  // postSensor 
  var getSensor = function(req, res){
    webduinoApi.getSensor(req, res);
  };

  // putSensor 
  var putSensor = function(req, res){
    webduinoApi.putSensor(req, res);
  };

  // postLed
  var putLed = function(req, res){
    webduinoApi.putLed(req, res);
  };

  // getLed
  var getLed = function(req, res){
    webduinoApi.getLed(req, res);
  };

  // getLed
  var getLeds = function(req, res){
    webduinoApi.getLeds(req, res);
  };

  // getBoard
  var getBoard= function(req, res){
    webduinoApi.getBoard(req, res);
  };

  // getWebduino
  var getWebduino= function(req, res){
    res.send({result:true})
  };

  return this;
} 

// Inherit event api
util.inherits( Webduino, events.EventEmitter );

/**
 * createPins  Creates Pin objects for every digital & analog pin
 */
Webduino.prototype.server = function() {
  return this.httpserver;
}

module.exports = Webduino;




