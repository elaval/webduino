var express = require('express');
var app = express(), 
  server = require('http').createServer(app), 
  io = require('socket.io').listen(server,  { log: true });

var apiduino = require("./apiduino").apiduino();

var path = require("path");
var application_root = __dirname;

// Control Arduino Input/Output through Johnny-Five
var five = require("johnny-five");
var board = new five.Board();  // Arduino Board



// Collection of existing pins
var myLeds = {};
var myPins = {};
var myMonitors = {}

var analogPinMap = {
  "A0":14,
  "A1":15,
  "A2":16,
  "A3":17,
  "A4":18,
  "A5":19
}

server.listen(3000);
app.use(express.static('public'));

app.configure(function () {
  app.use(express.bodyParser());
});


board.on("ready", function() {
  // pin mode constants are available on the Pin class
  /*
  this.pinMode(13, five.Pin.INPUT);

  var testpin = new five.Pin(13);

  testpin.read(13, function(value) {
  	console.log(value);
  });
*/

  
  // Set list of PIN objects
  for (pin in board.pins) {
    if (board.pins.hasOwnProperty(pin)) {
      //myPins[pin] = new five.Pin(pin);
      myPins[pin] = {id:pin};
    }
  }

  //AnalogPins
  var analogPins = board.firmata.analogPins;
  for (var i=0; i< analogPins.length; i++) {
    myPins["A"+i] = {id:pin};
    delete myPins[analogPins[i]];
  }
  
  // pin API
  app.get('/pin/:id', getPin);
  app.get('/pin', getPins);
  app.post('/pin/:id', putPin);
  app.put('/pin/:id', putPin);
  app.get('/monitor/:id', getMonitor);
  app.put('/monitor/:id', putMonitor);

  io.sockets.on('connection',clientconnected);

 
});

// Socket pin communication
var broadcastPinValue = function(id, value) {
   io.sockets.emit('pin', {id:id, value:value});
}

// Socket pin communication
var broadcastPin = function(id) {
  var value = getPinValue(id)
  io.sockets.emit('pin', {id:id, value:value});
}



// getMonitor - GET /monitor/:id
// Get the pin monitor (whith socket broadcast & frequency configuration)
var getMonitor = function(req, res){
  var id = req.params.id;
  var monitordata = {};

  if (myMonitors[id]) {
    monitordata.id = id;
    monitordata.freq = myMonitors[id].freq;
    monitordata.active = myMonitors[id].active;
    res.send(monitordata);
  } else {
    monitordata.id = id;
    monitordata.freq = 250;
    monitordata.active = 0;

    myMonitors[id] = monitordata;
    res.send(monitordata);
  }

}


// putMonitor - PUT /monitor/:id
// Get the pin monitor (whith socket broadcast & frequency configuration)
var putMonitor = function(req, res){
  var id = req.params.id;
  var freq = req.body.freq ? req.body.freq : 250;
  var active = req.body.active ? req.body.active : 0;
  var myMonitor;

  if (myMonitors[id]) {
    myMonitor = myMonitors[id]
  } else {
    myMonitor = {};
    myMonitor.id = id;
    myMonitor.intId = null;
  };

  myMonitor.freq = freq;
  myMonitor.active = active;

  // Clear curren sample interval
  clearInterval(myMonitor.intId);

  var sendSample = function(){
  	broadcastPin(id);
  };

  // If active, create a new sample interval
  if (active == 1) {
    myMonitor.intId = setInterval(sendSample,myMonitor.freq)
  }

  myMonitors[id] = myMonitor;

  var monitordata = {};

  monitordata.id = id;
  monitordata.freq = myMonitors[id].freq;
  monitordata.active = myMonitors[id].active;
  res.send(monitordata);
}

// getPin - GET /pin/:id
var getPin = function(req, res){
  var id = req.params.id;

  var pin = myPins[id];

  console.log(pin)

  var value = getPinValue(id);

  res.send({
    id : id,
    value: value
  })

}


// getPins - GET /pin
var getPins = function(req, res){
  var pins = [];

  for (id in myPins) {
  	var value = getPinValue(id);
    pins.push({id : id, value: value});
  }
    res.send(pins);
};


// putPin - PUT /pin/:id
var putPin = function(req, res){
  var id = req.params.id;
  var pin = myPins[id];
  var value = req.body.value;

  var pin = new five.Pin(id);

  if (pin && value) {
  	pin.write(value);
  }

  broadcastPinValue(id, value);
	
  res.send({
    id : id,
    value: value
  })
};


function clientconnected(socket) {
    socket.on('led', led);
    socket.on('newsensor', newsensor);
    socket.on('monitorSensor', monitorSensor);
    socket.on('newled', newled);
}

// Request an action on an existing led
function led(data, ack) {
  var pin;
  pin = data.pin ? data.pin : 0;
  action = data.action ? data.action : "on";
  var currentValue = null;

  var led = myLeds[pin];
  
  if (!led) {
    led = new five.Led({
        'pin': pin
      });
    
      myLeds[pin] = led;
  }
  
  if (led) {
    console.log("LED: "+led+" - Ation: "+action)
    if (action == "on") led.on()
    else if (action == "off") led.off()
    else if (action == "toggle") led.toggle()
    else if (action == "strobe") led.strobe()
    else if (action == "stop") led.stop();

    var currentValue = led.board.pins[pin].value;
    
    console.log(currentValue);
  }
  
  if (ack) ack({result:"OK",value:currentValue});
  
}

// Request for creation of a new LED object on our board
function newled(data, ack) {
  console.log("NEW LED");
  var pin;
  pin = data.pin ? data.pin : 13;
  
  // Create a standard `led` hardware instance
    var led = new five.Led({
      'pin': pin
    });
    
    myLeds[pin] = led;
    
    if (ack) ack("OK");
    
    return led;
}

// Request to create a new sensor
function monitorSensor(data, ack) {
  var pin, freq;
  
  // Set pin & freq from data or use defaults values (pin=0 ; freq= 250)
  pin = data.pin ? data.pin : 0;
  freq = data.freq ? data.freq : 250;
  
  // Create new sensor
  var sensor = new five.Sensor({
    pin: pin,
    freq: freq
  });
  
  // Inject new sensor on REPL (¿?)
  var injectdata = {};
  injectdata["sensor-"+pin] = sensor;
  board.repl.inject(injectdata);
  
  // Broadcast data through sockets on new data
  sensor.on('data', function() {
    io.sockets.emit('sensor', {pin:this.pin, value: this.value, range: this.range });
  });
  
  // Send a message back to the socket emitter that created the sensor
  ack("OK");
}



// Request to create a new sensor
function newsensor(data, ack) {
  var pin, freq;
  
  // Set pin & freq from data or use defaults values (pin=0 ; freq= 250)
  pin = data.pin ? data.pin : 0;
  freq = data.freq ? data.freq : 250;
  
  // Create new sensor
  var sensor = new five.Sensor({
    pin: pin,
    freq: freq
  });
  
  // Inject new sensor on REPL (¿?)
  var injectdata = {};
  injectdata["sensor-"+pin] = sensor;
  board.repl.inject(injectdata);
  
  // Broadcast data through sockets on new data
  sensor.on('data', function() {
    io.sockets.emit('sensor', {pin:this.pin, value: this.value, range: this.range });
  });
  
  // Send a message back to the socket emitter that created the sensor
  ack("OK");
}


function getPinValue(pin) {

	//console.log("GET PIN VALUE "+pin)
	//console.log(board.pins)
  if (analogPinMap[pin]) {
    return board.pins[analogPinMap[pin]].value;
  } else {
    return board.pins[pin].value;
  }

}
