var events = require("events"),
    util = require("util");


var apiduino = function() {
  events.EventEmitter.call(this);
  var api = {};

  var pins = {}
  var analogppins = [];
  var digitalpins = [];
  var board = null;
  var five = null;
  var type;

  // Special kit-centric pin translations
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

  api.start = function(_five, _board) {
    five = _five;
    board = _board;
    type = board.type;

    // References to analog pins
    for (var i = 0 ; i < pincatalog[type].analog.length; i++) {
      var pinid = pincatalog[type].analog[i]
      //pins[pinid] = {id:pinid, isAnalog:true};
      pins[pinid] = new five.Pin(pinid);

      // CHECK HOW TO DO THIS IN J5
      pins[pinid].id = pinid
    }

    // References to digital pins
    for (var i = 0 ; i < pincatalog[type].digital.length; i++) {
      var pinid = pincatalog[type].digital[i]
      pins[pinid] = new five.Pin(pinid)

      // CHECK HOW TO DO THIS IN J5
      pins[pinid].id = pinid
    }

    this.emit( "APIDUINOREADY", null );

    return this;
  }

  api.getPinState = function(id, callback) {
    var pin = pins[id];

    // pin.query does not work well with analog pins // this is a patch to get their state
    if (pin.type == "analog") {
      var pinstate = pin.firmata.pins[pin.firmata.analogPins[pin.addr]];
      pinstate.id = id;
      callback(pinstate);
    } else  {
      pin.query(function(state) {
        state.id = id;
        callback(state)
      });      
    }
  }


  // PIns - Get value
  api.getPins = function(callback) {
    var out = []
    for (var id in pins){
      api.getPinState(id, function(state) {
        out.push(state);
        if (out.length >= 20) callback(out)
      })
    }
  }

  // Pin - set value
  api.setPin = function(id, value, callback) {
    var pin = pins[id];
    pin.write(value);

    api.getPinState(id, function(state) {
      callback(state)
    });
  }
  events.EventEmitter.call(api);
  util.inherits( api, events.EventEmitter );

  //return api;

} 

// Inherit event api
util.inherits( apiduino, events.EventEmitter );



/**
 * high  Write high/1 to the pin
 * @return {Pin}
 */

apiduino.prototype.start = function(_five, _board) {
    five = _five;
    board = _board;
    type = board.type;

    // References to analog pins
    for (var i = 0 ; i < this.pincatalog[type].analog.length; i++) {
      var pinid = pincatalog[type].analog[i]
      //pins[pinid] = {id:pinid, isAnalog:true};
      pins[pinid] = new five.Pin(pinid);

      // CHECK HOW TO DO THIS IN J5
      pins[pinid].id = pinid
    }

    // References to digital pins
    for (var i = 0 ; i < pincatalog[type].digital.length; i++) {
      var pinid = pincatalog[type].digital[i]
      pins[pinid] = new five.Pin(pinid)

      // CHECK HOW TO DO THIS IN J5
      pins[pinid].id = pinid
    }

    this.emit( "APIDUINOREADY", null );

    return this;
};



module.exports.apiduino = apiduino;
