var express = require('express');
var app = express(), 
  server = require('http').createServer(app);

var path = require("path");
var application_root = __dirname;

var interfaces = require('os').networkInterfaces();

var LOCAL_IP
if (interfaces.wlan0) {
  LOCAL_IP = interfaces.wlan0[1].address;
} else if (interfaces.en1) {
  LOCAL_IP = interfaces.en1[1].address;
} else if (interfaces.eth0) {
  LOCAL_IP = interfaces.eth0[1].address;
} else {
  LOCAL_IP = "127.0.0.1";
} 
var PORT = 3000;

var webduino = require("./webduino");

var webdinoApi = webduino(server);



app.use(express.static('public'));

webdinoApi.on("ready", function() {
  console.log("WEBDUINO READY")
  // pin API
  app.get('/pins/:id', getPin);
  app.get('/pins', getPins);
  app.post('/pins/:id', putPin);
  app.put('/pins/:id', putPin);

  app.put('/sensors/:id', putSensor);
  app.get('/sensors', getSensors);
  app.get('/sensors/:id', getSensor);

  app.put('/leds/:id', putLed);
  app.get('/leds/:id', getLed);
  app.get('/leds', getLeds);

  server.listen(PORT, function() {
    console.log("Listening on ip "+LOCAL_IP+" on port "+PORT)
  });

});



app.configure(function () {
  app.use(express.bodyParser());
});

// getPin - GET /pin/:id
var getPin = function(req, res){
  webdinoApi.getPin(req, res);
}

// getPins - GET /pin
var getPins = function(req, res){
  webdinoApi.getPins(req, res);
};

// putPin - PUT /pin/:id
var putPin = function(req, res){
  webdinoApi.putPin(req, res);
};

// postSensor 
var getSensors = function(req, res){
  webdinoApi.getSensors(req, res);
};

// postSensor 
var getSensor = function(req, res){
  webdinoApi.getSensor(req, res);
};

// putSensor 
var putSensor = function(req, res){
  webdinoApi.putSensor(req, res);
};

// postLed
var putLed = function(req, res){
  webdinoApi.putLed(req, res);
};

// getLed
var getLed = function(req, res){
  webdinoApi.getLed(req, res);
};

// getLed
var getLeds = function(req, res){
  webdinoApi.getLeds(req, res);
};



console.log(getLocalIPs())
