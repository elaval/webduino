var express = require('express');
var app = express(), 
  server = require('http').createServer(app);
// CORS - For handling cross domain requests for data
var cors = require('cors');
var path = require("path");
var application_root = __dirname;
var localtunnel = require('localtunnel');

// Identify local IP Address
var interfaces = require('os').networkInterfaces();
var LOCAL_IP = "127.0.0.1";  // Default
for (var dev in interfaces) {
  var alias=0;
  interfaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      if (details.address != "127.0.0.1") {
        LOCAL_IP = details.address
      }
    }
  });
}


var PORT = 3000;

var webduino = require("./webduino");

var  webduinoApi= webduino(server);

app.use(cors());
app.use(express.static('public'));

// Check for the board connection (uses johnny-five underneath)
webduinoApi.on("ready", function() {
  console.log("webduino ready")
  // pin API
  app.get('/api/pins/:id', getPin);
  app.get('/api/pins', getPins);
  app.post('/api/pins/:id', putPin);
  app.put('/api/pins/:id', putPin);

  app.put('/api/sensors/:id', putSensor);
  app.get('/api/sensors', getSensors);
  app.get('/api/sensors/:id', getSensor);

  app.put('/api/leds/:id', putLed);
  app.get('/api/leds/:id', getLed);
  app.get('/api/leds', getLeds);

  app.get('/api/board', getBoard);

  app.get('/api/webduino', getWebduino);

});

server.listen(PORT, function() {
  console.log("Listening on "+LOCAL_IP+":"+PORT)
});


app.configure(function () {
  app.use(express.bodyParser());
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

