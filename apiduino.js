var apiduino = function() {
  var api = {};

  var pins = {}
  var analogppins = [];
  var digitalpins = [];

  api.start = function() {

    // Set list of PIN objects
    for (pin in board.pins) {
      if (board.pins.hasOwnProperty(pin)) {
       pins[pin] = {id:pin};
      }
    }

    //AnalogPins
    var analogPins = board.firmata.analogPins;
    for (var i=0; i< analogPins.length; i++) {
      myPins["A"+i] = {id:pin};
      delete pins[analogPins[i]];
    }


  }



  return api;

} 

module.exports.apiduino = apiduino;
