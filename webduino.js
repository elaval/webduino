var events = require("events"),
    util = require("util");

// Control Arduino Input/Output through Johnny-Five
var five = require("johnny-five");


var pincatalog = {
    UNO: {
      analog: ["A0","A1","A2","A3","A4","A5"],
      digital: [0,1,2,3,4,5,6,7,8,9,10,11,12,13]
    },
    MEGA: {
      analog: ["A0","A1","A2","A3","A4","A5","A6","A7","A8", "A9"]
    } ,
    LEONARDO: {
      analog: ["A0","A1","A2","A3","A4","A5"]
    }
};


var Webduino = function(server) {

  if ( !(this instanceof Webduino) ) {
    return new Webduino( server );
  }

  var self = this;
  events.EventEmitter.call(this);

  this.pins = {};
  this.sensors = {};
  this.leds = {};
  this.board = null;
  this.five = five;;
  this.type;
  this.server = server;
  this.io = require('socket.io').listen(server,  { log: false });

  this.board = new five.Board();

  this.board.on("ready",function() {
    self.start(five, this.board)
    self.io.sockets.on('connection',function() {});
  });

} 

// Inherit event api
util.inherits( Webduino, events.EventEmitter );



/**
 * start  Initialize the variables associated to pins
 * @return {Webduino}
 */
Webduino.prototype.start = function(_five, _board) {
    this.five = _five;
    this.board = _board;
    this.type = board.type;
    this.numPins = 0;

    // References to analog pins
    for (var i = 0 ; i < pincatalog[this.type].analog.length; i++) {
      var pinid = pincatalog[this.type].analog[i]
      this.pins[pinid] = new this.five.Pin(pinid);

      // CHECK HOW TO DO THIS IN J5
      this.pins[pinid].id = pinid
    }

    // References to digital pins
    for (var i = 0 ; i < pincatalog[this.type].digital.length; i++) {
      var pinid = pincatalog[this.type].digital[i]
      this.pins[pinid] = new this.five.Pin(pinid)

      // CHECK HOW TO DO THIS IN J5
      this.pins[pinid].id = pinid
    }

    this.numPins = pincatalog[this.type].analog.length + pincatalog[this.type].digital.length;

    this.emit( "ready", null );

    return this;
};


/**
 * getPinState  Get the state of a given pin id through callback function
 * @return {Webduino}
 */
Webduino.prototype.getPinState = function(id, callback) {
    var pin = this.pins[id];

    // pin.query does not work well with analog pins // this is a patch to get their state
    if (pin.type == "analog") {
      console.log(pin);
      var pinstate = pin.firmata.pins[pin.firmata.analogPins[pin.addr]];
      pinstate.id = id;
      callback(pinstate);
    } else  {
      pin.query(function(state) {
        state.id = id;
        callback(state)
      });      
    }

    return this;
};

/**
 * getPin
 * 
 * @return {Webduino}
 */
Webduino.prototype.getPin = function(req, res) {
    var id = req.params.id;
    var pin = this.pins[id];

    this.getPinState(id, function(state) {
      res.send(state)
    })
    return this;
};

/**
 * getPins  Get an array with current state of each pin
 * @return {Webduino}
 */
Webduino.prototype.getPins = function(req, res) {
  var out = [];
  var self = this;

  for (var id in this.pins){
    this.getPinState(id, function(state) {
      out.push(state);

      // Once received data from all pins - send reply
      if (out.length >= self.numPins) {
        res.send(out);
      }

    })
    
  }
  return this;
};

/**
 * putPin  Set the value of a PIN 
 * @return {Webduino}
 */ 
Webduino.prototype.putPin = function(req, res) {
  var id = req.params.id;
  var value = req.body.value;
   
  var self = this;
  var pin = this.pins[id];
  pin.write(value);

  this.getPinState(id, function(state) {
    self.socketBroadcastPinState(state);
    res.send(state);
  });
}

/**
* getSensor
*/ 
Webduino.prototype.getSensor = function(req, res) {
  var self = this;

  var id = req.params.id ? req.params.id : "13";

  var state = this.getSensorState(id)

  res.send(state);
}

/**
 * getSensors 
 */ 
Webduino.prototype.getSensors = function(req, res) {
  var self = this;
  var out = [];

  for (id in this.sensors) {
    var state = this.getSensorState(id)
    out.push(state);
  }

  res.send(out);
}

 /**
 * putSensor  Add a new sensor on the given pin id
 * @return {Webduino}
 */ 
Webduino.prototype.putSensor = function(req, res) {
  var self = this;

  var id = req.params.id ? req.params.id : "A0";
  var freq = req.body.freq ? req.body.freq : 25;

  if (!this.sensors[id]) {
    this.sensors[id] = {};
    this.sensors[id].j5sensor = new five.Sensor({'pin':id, 'freq':freq});
  }

  var sensor = this.sensors[id];
  sensor.freq = freq;
   
  // Broadcast through sockets.io when each sample is received
  sensor.j5sensor.on("data", function() {
    var state = {};
    state.id = id;
    state.value = this.value;
    state.mode = this.mode;

    self.socketBroadcastSensorState(state);
  })

  var state = this.getSensorState(id)
  res.send(state);
}

 /**
 * postLed  Create a new Led object on the given pin id
 */ 
Webduino.prototype.putLed = function(req, res) {
  var self = this;

  var id = req.params.id ? req.params.id : "13";
  var state = req.body.state ? req.body.state : "off";
  var strobe = req.body.strobe ? req.body.strobe : false;
  var strobetime = req.body.strobetime ? req.body.strobetime : 500;

  if (!this.leds[id]) {
    this.leds[id] = {};
    this.leds[id].j5led = new five.Led(id);
  } 

  var led = this.leds[id];

  if (state == "on") {led.j5led.on();} else {led.j5led.off();}
  led.state = state;

  if (strobe) {
    led.j5led.strobe(strobetime);
  } else {
    led.j5led.stop();
  }

  led.strobe = strobe;
  led.strobetime = strobetime;

  var state = this.getLedState(id);

  self.socketBroadcastLedState(state);


  res.send(state);
}

 /**
 * postLed  
 */ 
Webduino.prototype.getLed = function(req, res) {
  var self = this;

  var id = req.params.id ? req.params.id : "13";

  var state = this.getLedState(id)

  res.send(state);
}

/**
 * getLeds  
 */ 
Webduino.prototype.getLeds = function(req, res) {
  var self = this;
  var out = [];

  for (id in this.leds) {
    var state = this.getLedState(id)
    out.push(state);
  }

  res.send(out);
}

/**
* getLedState  
*/ 
Webduino.prototype.getLedState = function(id) {
  var state = {}
  if (this.leds[id]) {
    var led = this.leds[id];
    state.id = id;
    state.state = led.state;
    state.strobe = led.strobe;
    state.strobetime = led.strobetime;
  }
  return state;
}

/**
* getSensorState  
*/ 
Webduino.prototype.getSensorState = function(id) {
  var state = {}
  if (this.sensors[id]) {
    var sensor = this.sensors[id];
    state.id = id;
    state.freq = sensor.freq;
  }
  return state;
}

/**
 * socketBroadcastPinState  Set the value of a PIN 
 * @return {Webduino}
 */ 
Webduino.prototype.socketBroadcastPinState = function(state) {
  this.io.sockets.emit("pin", state)
}

/**
 * socketBroadcastSensorState  Set the value of a PIN 
 * @return {Webduino}
 */ 
Webduino.prototype.socketBroadcastSensorState = function(state) {
  this.io.sockets.emit("sensor", state)
}

/**
 * socketBroadcastLedState  Set the value of a PIN 
 * @return {Webduino}
 */ 
Webduino.prototype.socketBroadcastLedState = function(state) {
  this.io.sockets.emit("led", state)
}




module.exports = Webduino;
