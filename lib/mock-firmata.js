var util = require("util"),
  events = require("events"),
  pins = require("./mock-pins");

function MockFirmata(opt) {
  var self = this;
  opt = opt || {};
  this.pins = opt.pins || pins.UNO;
  this.analogPins = opt.analogPins || pins.UNOANALOG;

  // Record original values for each Pin 
  this.initialValues = {};
  for (var pin in this.pins) {
    this.initialValues[pin] = this.pins[pin].value;
  }

  this.MODES = {
    INPUT: 0x00,
    OUTPUT: 0x01,
    ANALOG: 0x02,
    PWM: 0x03,
    SERVO: 0x04
  };
  this.HIGH = 1;
  this.LOW = 0;

  this.analogCallbacks = {};



  this.interval = setInterval(function() {

    // Simulate value variation around 10% of original values
    for (var analogpin in self.analogPins) {
      var pin = self.analogPins[analogpin];

      var d = new Date();
      var n = 2*Math.PI*d.getSeconds()/60;  // 0 to 2PI radians in 60 seconds

      var initialValue = self.initialValues[pin];
      var newvalue = Math.floor(initialValue +initialValue*Math.sin(n)/10);

      self.pins[pin].value = newvalue;
    }

    // Call callbacks for active sensors
    for (var pinid in self.analogCallbacks) {
      self.analogCallbacks[pinid](self.pins[self.analogPins[pinid]].value);
    }

  }, 100);
}

util.inherits(MockFirmata, events.EventEmitter);

[
   "servoWrite",
  , "digitalRead",
  "pinMode"
].forEach(function(value) {
  MockFirmata.prototype[value] = function() {};
});

MockFirmata.prototype.analogRead = function (pin, callback) {
    this.analogCallbacks[pin] = callback;
};

MockFirmata.prototype.digitalWrite = function (pin, value) {
    this.pins[pin].value = value;
};

MockFirmata.prototype.analogWrite = function (pin, value) {
    this.pins[pin].value = value;
};

MockFirmata.prototype.queryPinState = function (pin, callback) {
    callback(this.pins[pin]);
};

MockFirmata.prototype.pulseIn = function(opt, callback) {
  callback(this.pulseValue);
};

module.exports = MockFirmata;
