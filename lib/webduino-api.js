// Var & util used for Events management
var events = require("events");
var util = require("util");

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

var COLLECTION = {};
var ELEMENT = {};

ELEMENT.GET = {};
ELEMENT.PUT = {};
COLLECTION.GET = {};


var ApiManager = function(server, opts) {

  if ( !(this instanceof ApiManager) ) {
    return new ApiManager( server, opts );
  }

  // Ensure opts is an object
  opts = opts || {};

  // Get ist of devices
  opts.devices = opts.devices || {}; 

  // Channels are additional connections that can trigger resource updates (put) and are expecting data updates (result of puts)
  this.channels = [];

  var self = this;
  events.EventEmitter.call(this);
  //this.setMaxListeners(100);

  // johnny-five Pin objects for board pins
  this.pins = {};

  // jonhnny-five Sensor object for analog pins (only for active sensors)
  this.sensors = {};

  // store the current state of each sensor (freq, value, active)
  // Ex. this.sensorStates["A0"] = {id:"A0", freq:250, active: true, value: 512}
  this.sensorStates = {};

  // johnny-five Led object for digital pins
  this.leds = {};

  // store the current state of each led (on, strobe, time)
  // Ex. this.ledStates[13] = {id:13, on:true, strobe: false, time: 250}
  this.ledStates = {};

  // johnny-five Servo object for digital pins
  this.servos = {};
 
  // store the current state of each servo (moving,, to range, ...)
  // Ex. this.servoStates[13] = {id:13, moving:false, to: 35, ...}
  this.servoStates = {};

  this.board = null;
  this.five = five;
  this.type = null;
  this.server = server;

  // Check if ne need to use a fake (test) board or a real one
  if (opts && opts.test) {
    console.log("Test Mode (Using a simulated board)");
    // Initialize johnny-five Mock Board
    var MockFirmata = require("./mock-firmata");
    this.board = new five.Board({
      repl: false,
      io: new MockFirmata()
    });

    // Dealy board ready notification (which is listened by API Manager)
    setTimeout(function() {self.board.emit( "ready", null );},1000);

  } else {
    var boardopts = {};
    boardopts.port = opts.port;
    // Initialize johnny-five Board
    this.board = new five.Board(boardopts);    
  }

  this.board.on("ready",function() {
    self.type = self.board.type;

    if (!pincatalog[self.type]) {
      console.log("Board type not supported: "+self.type + " - Will assume UNO Pins");
      self.type = "UNO";

    } else {
      console.log("Board type: "+self.type);
    }

    // Remember the bumber of pins when retreiving Pin states
    self.numPins = pincatalog[self.type].numpins;
 

    // Creates Pin objects for every pin in the board
    self.createPins();

    // Creates LED objects for every digital pin in the board
    self.createLeds(opts.devices.leds);

    // Creates sensor state objects for every analog pin
    self.createSensors(opts.devices.sensors);

    // Creates servo state objects for every analog pin
    self.createServos(opts.devices.servos);

    self.emit( "ready", null );
  });

};

// Inherit event api
util.inherits( ApiManager, events.EventEmitter );


/**
 * addChannel  Add another communication channel to send updates on resources data
 * Examples: sockectChannel, firebaseChannel
 */
ApiManager.prototype.addChannel = function(channel) {
  this.channels.push(channel);

  channel.on("data", function(msg) {
      var resource = msg.resource;
      var id = msg.id;
      var data = msg.data;
      var callback = function() {};

      this.putElement(resource, id, data, callback);

      //console.log(resource+" - "+id+" - "+data);
  }.bind(this));

  // For each element in the collection for one resource (Eg. Pins), sends its data through the channel
  var putResourceCollection = function(resource) {
    COLLECTION.GET[resource].bind(this)(function(code,dataArray) {
      for (var i = 0 ; i < dataArray.length; i++) {
        var data = dataArray[i];
        channel.put(resource, data.id, data);
      }
    });
  }.bind(this);

  // For all resource types, sendstheir elements data through the channel
  for(var resource in COLLECTION.GET) {
    putResourceCollection(resource);
  }


};



/**
 * createPins  Creates Pin objects for every digital & analog pin
 */
ApiManager.prototype.createPins = function() {
    var analogPins = pincatalog[this.type].analog;
    var digitalPins = pincatalog[this.type].digital;
    var pinid = null;
    var i = 0;

    // References to analog pins
    for (i = 0 ; i < analogPins.length; i++) {
      pinid = analogPins[i];
      this.pins[pinid] = new this.five.Pin(pinid);
    }

    // References to digital pins
    for (i = 0 ; i < digitalPins.length; i++) {
      pinid = digitalPins[i];
      this.pins[pinid] = new this.five.Pin(pinid);
    }
};

/**
 * createLeds  Creates Led objects for every digital pin & creates a state object for each Led
 */
ApiManager.prototype.createLeds = function(pinsToConfigure) {
    if (pinsToConfigure === undefined || pinsToConfigure == null) {
      // If no LED pin is predefined, all available digital pins will be used
      pinsToConfigure = pincatalog[this.type].digital;
    }

    // References to digital pins
    for (var i = 0 ; i < pinsToConfigure.length; i++) {
      var pinid = pinsToConfigure[i];

      // Create it if it doesn't exists already
      if (!this.leds[pinid]) {
        this.leds[pinid] = {};

        if(!this.ledStates[pinid]) {
          this.ledStates[pinid] = {};
        }

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

};

/**
 * createSensors  Creates Sensor state objects for every Analog pin
 * Actual johnny-five Sensor objects are not created initially (only when they become active)
 */
ApiManager.prototype.createSensors = function(pinsToConfigure) {
    if (pinsToConfigure === undefined || pinsToConfigure == null) {
      // If no LED pin is predefined, all available digital pins will be used
      pinsToConfigure = pincatalog[this.type].analog;
    }

    // References to digital pins
    for (var i = 0 ; i < pinsToConfigure.length; i++) {
      var pinid = pinsToConfigure[i];

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

};

/**
 * createServos  Creates Servo objects for every digital pin & creates a state object for each Servo
 */
ApiManager.prototype.createServos = function(pinsToConfigure) {
    if (pinsToConfigure === undefined || pinsToConfigure == null) {
      // If no LED pin is predefined, all available digital pins will be used
      pinsToConfigure = pincatalog[this.type].digital;
    }

    var createServo = function(pinid) {
      if (!this.servos[pinid]) {
        this.servos[pinid] = {};

        if(!this.servoStates[pinid]) {this.servoStates[pinid] = {};}

        var newServo = new five.Servo(pinid);

        this.servos[pinid] = newServo;

        this.servoStates[pinid].id = pinid;
        this.servoStates[pinid].range = newServo.range;
        this.servoStates[pinid].to = 0;
        this.servoStates[pinid].type = newServo.type;
        this.servoStates[pinid].specs = newServo.specs;
      }
    }.bind(this);

    // References to digital pins
    for (var i = 0 ; i < pinsToConfigure.length; i++) {
      var pinid = pinsToConfigure[i];
      createServo(pinid);
    }


    

    /*
    for (var i = 0 ; i < pincatalog[this.type].digital.length; i++) {
      var pinid = pincatalog[this.type].digital[i];

      // Create it if it doesn't exists already
      if (!this.servos[pinid]) {
        this.servos[pinid] = {};

        if(!this.servoStates[pinid]) this.servoStates[pinid] = {};

        var newServo = new five.Servo(pinid);

        this.servos[pinid] = newServo;

        this.servoStates[pinid].id = pinid;
        this.servoStates[pinid].range = newServo.range;
        this.servoStates[pinid].to = 0;
        this.servoStates[pinid].type = newServo.type;
        this.servoStates[pinid].specs = newServo.specs;
      }
    }
    */

};


/**
 * getPinState  Get the state of a given pin id through callback function
 */
ApiManager.prototype.getPinState = function(id, callback) {
    var pin = this.pins[id];

    // For Analog Pins, the pin.query function does not work well with analog pins // this is a patch to get their state
    if (pin.type === "analog") {
      var pinstate;
      if (pin.io) {
        pinstate = pin.io.pins[pin.io.analogPins[pin.addr]];
      }
      else {
        pinstate = pin.firmata.pins[pin.firmata.analogPins[pin.addr]];
      }
      pinstate.id = id;
      callback(pinstate);
    } 

    // For Digital Pins, the query function works
    else  {
      pin.query(function(state) {
        state.id = id;
        callback(state);
      });      
    }

};


/**
* getSensorState  
*/ 
ApiManager.prototype.getSensorState = function(id) {
  var state = {};
  if (this.sensors[id]) {
    var sensor = this.sensors[id];
    state.id = id;
    state.freq = sensor.freq;
  }
  //return state;

  return this.sensorStates[id] ? this.sensorStates[id] : {};
};

/**
* getBoard 
*/ 
ApiManager.prototype.getBoard = function(req, res) {

  var state = {};
  if (this.board) {
    state.id = this.board.id;
    state.type = this.board.type;
    state.port = this.board.port;
  }
  res.send(state);
};



/**
 * dataBroadcast informs new state in the resource 
 */ 
ApiManager.prototype.dataBroadcast = function(resource, id, data) {
  for (var i = 0; i < this.channels.length; i++) {
      this.channels[i].put(resource, id, data);
  }
};



/**
 * getElement - Process the request for getting the state of a specific resource element
 */ 
ApiManager.prototype.getElement = function(resource, id, callback) {

  if (ELEMENT.GET[resource]) {
    ELEMENT.GET[resource].bind(this)(id, callback);
  } else {
    callback(400, {'error':'Resource <'+resource+"> not valid."});
  }
};

/**
 * putElement - Process the request for setting the state of a specific resource element
 */ 
ApiManager.prototype.putElement = function(resource, id, data, callback) {

  if (ELEMENT.PUT[resource]) {
    ELEMENT.PUT[resource].bind(this)(id, data, function(result_code, data) {
      // Communicate resource state through channels
      this.dataBroadcast(resource, id, data);

      // Callback to requester (usually HTTP)
      callback(result_code, data);
    }.bind(this));
  } else {
    callback(400, {'error':'Resource <'+resource+"> not valid."});
  }
};

/**
 * getCollection - Process the request for getting the state of a resource collection (i.e. Pins, Servos, ...)
 */ 
ApiManager.prototype.getCollection = function(resource, callback) {
  if (COLLECTION.GET[resource]) {
    COLLECTION.GET[resource].bind(this)(callback);
  } else {
    callback(400, {'error':'Resource <'+resource+"> not valid."});
  }
};



COLLECTION.GET['pins'] = function(callback) {
  var out = [];
  var self = this;

  var addState = function(state) {
    out.push(state);

    // Once received data from all pins - send reply
    if (out.length >= self.numPins) {
      callback(200,out);
    }
  };

  for (var id in this.pins){
    this.getPinState(id, addState);
  }
};

ELEMENT.GET['pins'] = function(id, callback) {
  this.getPinState(id, function(data) {
    callback(200, data);
  }); 
};

ELEMENT.PUT['pins'] = function(id, data, callback) {
  var value = data.value;

  if (this.pins[id]) {
    var pin = this.pins[id];
    pin.write(value);

    this.getPinState(id, function(state) {
      //this.socketBroadcastPinState(state);
      callback(200,state);
    }.bind(this));
  } else {
    callback(404, {error: 'Led '+id+' not found'});
  }
};



COLLECTION.GET['leds'] = function(callback) {
  var out = [];

  for (var id in this.leds) {
    var state = this.ledStates[id] ? this.ledStates[id] : {};
    out.push(state);
  }

  callback(200,out);
};


ELEMENT.GET['leds'] = function(id, callback) {
  if (this.ledStates[id]) {
    var data = this.ledStates[id];
    callback(200, data);
  } else {
    callback(404, {error: 'Led '+id+' not found'});
  }
};

ELEMENT.PUT['leds'] = function(id, data, callback) {
  if (this.ledStates[id]) {
    var state = this.ledStates[id];
    state.id = id;

    // Get new state from body data Ex: {on:true, strobe:false, time:250}
    state.on = data.on ? data.on : false;
    state.strobe = data.strobe ? data.strobe : false;
    state.time = data.time ? data.time : 500;

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

    callback(200, state);

  } else {
    callback(404, {error: 'Led '+id+' not found'});
  }
};

COLLECTION.GET['sensors'] = function(callback) {
  var out = [];

  for (var id in this.sensors) {
    var state = this.getSensorState(id);
    out.push(state);
  }

  callback(200,out);
};

ELEMENT.GET['sensors'] = function(id, callback) {
  if (this.getSensorState(id)) {
    var data = this.getSensorState(id);
    callback(200, data);
  } else {
    callback(404, {error: 'Sensor '+id+' not found'});
  }
};

ELEMENT.PUT['sensors'] = function(id, data, callback) {
  var self = this;

  if (this.sensorStates[id]) {
    var state = this.sensorStates[id];
    state.id = id;

    var previousFreq = state.freq;

    // Get new state from body data Ex: {active:true, freq:500}
    state.active = data.active ? data.active : false;
    state.freq = data.freq ? data.freq : 500;

    // Sensor should be activated
    if (state.active) {

      // There is no Sensor object created or there is one with a different frequency
      if (!this.sensors[id] || (this.sensors[id] && (state.freq !== previousFreq))) {
        // Deactiviate existing sensor with different frequency
        if (this.sensors[id] && (state.freq !== previousFreq)) {
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
          self.dataBroadcast("sensors", id, state);
        });
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

    callback(200, state);

  } else {
    callback(404, {error: 'Led '+id+' not found'});
  }
};

COLLECTION.GET['servos'] = function(callback) {
  var out = [];

  for (var id in this.servos) {
    var state = this.servoStates[id] ? this.servoStates[id] : {};
    out.push(state);
  }

  callback(200,out);
};

ELEMENT.GET['servos'] = function(id, callback) {
  if (this.servoStates[id]) {
    var data = this.servoStates[id];
    callback(200, data);
  } else {
    callback(404, {error: 'Sensor '+id+' not found'});
  }
};




ELEMENT.PUT['servos'] = function(id, data, callback) {
  if (this.servoStates[id]) {
    var state = this.servoStates[id];
    state.id = id;

    // Get new state from body data Ex: {on:true, strobe:false, time:250}
    state.to = data.to ? data.to : 0;
   
    // Confirm that we have a Johnny-Five Servo Object for this Led
    if (!this.servos[id]) {
      this.servos[id]= new five.Servo(id);
    } 

    var servo = this.servos[id];

    //Change the place where the servo is heading
    servo.to(state.to);
 
    callback(200, state);

  } else {
    callback(404, {error: 'Led '+id+' not found'});
  }
};

















module.exports = ApiManager;
