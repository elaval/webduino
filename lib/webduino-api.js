// Var & util used for Events management
var events = require("events");
var util = require("util");

// Firebase is a real time data exchnage service
var Firebase = require("firebase");

// Control Arduino Input/Output through Johnny-Five
var five = require("johnny-five");

// Information about digital & analog pins in each type of supported board
var pincatalog = {
    UNO: {
      analog: ["A0","A1","A2","A3","A4","A5"],
      digital: [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
      numpins: 20
    },
    MEGA: {
      analog: ["A0","A1","A2","A3","A4","A5","A6","A7","A8", "A9"],
      digital: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53],
      numpins: 64
    } ,
    LEONARDO: {
      analog: ["A0","A1","A2","A3","A4","A5"],
      digital: [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
      numpins: 20
    }
};


var ApiManager = function(server) {

  if ( !(this instanceof ApiManager) ) {
    return new ApiManager( server );
  }

  var self = this;
  events.EventEmitter.call(this);

  // johnny-five Pin objects for board pins
  this.pins = {};

  // jonhnny-five Sensor object for analog pins (only for active sensors)
  this.sensors = {};

  // store the current state of each sensor (freq, value, active)
  // Ex. this.sensorStates["A0"] = {id:"A0", freq:250, active: true, value: 512}
  this.sensorStates = {}

  // johnny-five Led object for digital pins
  this.leds = {};

  // store the current state of each led (on, strobe, time)
  // Ex. this.ledStates[13] = {id:13, on:true, strobe: false, time: 250}
  this.ledStates = {};

  this.board = null;
  this.five = five;;
  this.type;
  this.server = server;
  this.firebase = null;

  // Set up socket.io connection
  this.io = require('socket.io').listen(server,  { log: false });
  self.io.sockets.on('connection',function(d) {
    console.log("New socket.io connection: "+d.id)
  });


  // Initialize johnny-five Board
  this.board = new five.Board();

  this.board.on("ready",function() {
    self.type = self.board.type;

    // Remember the bumber of pins when retreiving Pin states
    self.numPins = pincatalog[self.type].numpins;

    // Creates Pin objects for every pin in the board
    self.createPins();

    // Creates LED objects for every digital pin in the board
    self.createLeds();

    // Creates sensor state objects for every analog pin
    self.createSensors();

    // send socket signal indicating that the board is connected
    self.socketBroadcastBoardConnected();

    self.emit( "ready", null );
  });

} 

// Inherit event api
util.inherits( ApiManager, events.EventEmitter );


/**
 * createPins  Creates Pin objects for every digital & analog pin
 */
ApiManager.prototype.createPins = function() {
    var analogPins = pincatalog[this.type].analog;
    var digitalPins = pincatalog[this.type].digital;

    // References to analog pins
    for (var i = 0 ; i < analogPins.length; i++) {
      var pinid = analogPins[i]
      this.pins[pinid] = new this.five.Pin(pinid);
    }

    // References to digital pins
    for (var i = 0 ; i < digitalPins.length; i++) {
      var pinid = digitalPins[i]
      this.pins[pinid] = new this.five.Pin(pinid)
    }
}

/**
 * createLeds  Creates Led objects for every digital pin & creates a state object for each Led
 */
ApiManager.prototype.createLeds = function() {
    // References to digital pins
    for (var i = 0 ; i < pincatalog[this.type].digital.length; i++) {
      var pinid = pincatalog[this.type].digital[i];

      // Create it if it doesn't exists already
      if (!this.leds[pinid]) {
        this.leds[pinid] = {};

        if(!this.ledStates[pinid]) this.ledStates[pinid] = {};

        var newled = new five.Led(pinid);
        newled.off();
        newled.stop();

        this.leds[pinid] = newled;

        this.ledStates[pinid].id = pinid;
        this.ledStates[pinid].on = false;
        this.ledStates[pinid].strobe = false;
        this.ledStates[pinid].time = 250;

      }
    }

}

/**
 * createSensors  Creates Sensor state objects for every Analog pin
 * Actual johnny-five Sensor objects are not created initially (only when they become active)
 */
ApiManager.prototype.createSensors = function() {
    var analogPins = pincatalog[this.type].analog

    // References to digital pins
    for (var i = 0 ; i < analogPins.length; i++) {
      var pinid = analogPins[i];

      // Create it if it doesn't exists already
      if (!this.sensorStates[pinid]) {
        this.sensorStates[pinid] = {};
      }

      // Don't create Led object until it becomes active (with PutSensor)
      this.sensors[pinid] = null;

      this.sensorStates[pinid].id = pinid;
      this.sensorStates[pinid].active = false;
      this.sensorStates[pinid].freq = 250;
      this.sensorStates[pinid].value = null;
    }

}


/**
 * getPinState  Get the state of a given pin id through callback function
 */
ApiManager.prototype.getPinState = function(id, callback) {
    var pin = this.pins[id];

    // For Analog Pins, the pin.query function does not work well with analog pins // this is a patch to get their state
    if (pin.type == "analog") {
      var pinstate;
      if (pin.io) {
        console.log("io")
        pinstate = pin.io.pins[pin.io.analogPins[pin.addr]];
      }
      else {
        console.log("firmata")
        pinstate = pin.firmata.pins[pin.firmata.analogPins[pin.addr]];
      }
      pinstate.id = id;
      callback(pinstate);
    } 

    // For Digital Pins, the query function works
    else  {
      pin.query(function(state) {
        state.id = id;
        callback(state)
      });      
    }

};

/**
 * getPin
 * 
 * @return {ApiManager}
 */
ApiManager.prototype.getPin = function(req, res) {
    var id = req.params.id;
    var pin = this.pins[id];

    this.getPinState(id, function(state) {
      res.send(state)
    })
    return this;
};

/**
 * getPins  Get an array with current state of each pin
 * @return {ApiManager}
 */
ApiManager.prototype.getPins = function(req, res) {
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
 */ 
ApiManager.prototype.putPin = function(req, res) {
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
ApiManager.prototype.getSensor = function(req, res) {
  var self = this;

  var id = req.params.id ? req.params.id : "13";

  var state = this.getSensorState(id)

  res.send(state);
}

/**
 * getSensors 
 */ 
ApiManager.prototype.getSensors = function(req, res) {
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
 */ 
ApiManager.prototype.putSensor = function(req, res) {
  var self = this;

  var id = req.params.id ? req.params.id : "A0";
  var previousFreq;

   // Confirm that we had the state for this Sensor
  if (this.sensorStates[id]) {
    // Remind existint frequency (to check if we need to create a new one or mantain the existing one)
    previousFreq = this.sensorStates[id].freq
  }

  // If not, create a new sensor stata object
  else {
    this.sensorStates[id] = {}
  }

  var state = this.sensorStates[id];
  state.id = id;

  // Get new state from body data Ex: {active:true, freq:500}
  state.active = req.body.active ? req.body.active : false;
  state.freq = req.body.freq ? req.body.freq : 500;

  // Sensor should be activated
  if (state.active) {

    // There is no Sensor object created or there is one with a different frequency
    if (!this.sensors[id] || (this.sensors[id] && (state.freq != previousFreq))) {
      // Deactiviate existing sensor with different frequency
      if (this.sensors[id] && (state.freq != previousFreq)) {
        this.sensors[id].removeAllListeners("data");
      }

      // Create new Sensor
      this.sensors[id] = new five.Sensor({'pin':state.id, 'freq':state.freq});

      // Actions to be taken on data events
      this.sensors[id].on("data", function() {
        var state = self.sensorStates[id];

        // Update state value
        state.value = this.value;

        // Broadcast new value
        self.socketBroadcastSensorState(state);
      })
    }

  } 

  // Sensor should be deactivated
  else {
    // Check if it existes and deactivate it
    if (this.sensors[id]) {
      // Stop listening to data events
      this.sensors[id].removeAllListeners("data");

      this.sensors[id] = null;
    }
  }


  res.send(state);
}

 /**
 * postLed  Create a new Led object on the given pin id
 */ 
ApiManager.prototype.putLed = function(req, res) {
  var self = this;

  var id = req.params.id ? req.params.id : "13";

  // Confirm that we had the state for this Led
  if (!this.ledStates[id]) {
    this.ledStates[id] = {}
  }

  var state = this.ledStates[id];
  state.id = id;

  // Get new state from body data Ex: {on:true, strobe:false, time:250}
  state.on = req.body.on ? req.body.on : false;
  state.strobe = req.body.strobe ? req.body.strobe : false;
  state.time = req.body.time ? req.body.time : 500;

  // Confirm that we have a Johnny-Five Led Object for this Led
  if (!this.leds[id]) {
    this.leds[id]= new five.Led(id);
  } 

  var led = this.leds[id];

  // Turn Led on/off according to obtained state
  if (state.on) {
    led.on(); 
  } else {
    led.off();
  }

  // Activate / deactivate strobe
  if (state.strobe) {
    led.strobe(state.time);
  } else {
    led.stop();
  }

  self.socketBroadcastLedState(state);

  res.send(state);
}

 /**
 * getLed  
 */ 
ApiManager.prototype.getLed = function(req, res) {
  var self = this;

  var id = req.params.id ? req.params.id : "13";

  var state = this.ledStates[id] ? this.ledStates[id] : {};

  res.send(state);
}

/**
 * getLeds  
 */ 
ApiManager.prototype.getLeds = function(req, res) {
  var self = this;
  var out = [];

  for (id in this.leds) {
    var state = this.ledStates[id] ? this.ledStates[id] : {};
    out.push(state);
  }

  res.send(out);
}


/**
* getSensorState  
*/ 
ApiManager.prototype.getSensorState = function(id) {
  var state = {}
  if (this.sensors[id]) {
    var sensor = this.sensors[id];
    state.id = id;
    state.freq = sensor.freq;
  }
  //return state;

  return this.sensorStates[id] ? this.sensorStates[id] : {};
}

/**
* getBoard 
*/ 
ApiManager.prototype.getBoard = function(req, res) {

  var state = {}
  if (this.board) {
    state.id = this.board.id;
    state.type = this.board.type;
    state.port = this.board.port;
  }
  res.send(state);
}

/**
* getBoard 
*/ 
ApiManager.prototype.firebase = function(ref) {
  this.firebase = new Firebase(ref)
}


/**
 * socketBroadcastPinState  Set the value of a PIN 
 * @return {ApiManager}
 */ 
ApiManager.prototype.socketBroadcastPinState = function(state) {
  this.io.sockets.emit("pin", state)
}

/**
 * socketBroadcastSensorState  Set the value of a PIN 
 * @return {ApiManager}
 */ 
ApiManager.prototype.socketBroadcastSensorState = function(state) {
  this.io.sockets.emit("sensor", state)
  if (this.firebase) {
    this.firebase.child('sensors/'+state.id).set(state);
  }
}

/**
 * socketBroadcastLedState  Set the value of a PIN 
 * @return {ApiManager}
 */ 
ApiManager.prototype.socketBroadcastLedState = function(state) {
  this.io.sockets.emit("led", state)
  if (this.firebase) {
    this.firebase.child('leds/'+state.id).set(state);
  }
}

/**
 * socketBroadcastBoardConnected  informs board connection 
 * @return {ApiManager}
 */ 
ApiManager.prototype.socketBroadcastBoardConnected = function() {
  this.io.sockets.emit("board", {state:"on"})
}




module.exports = ApiManager;
