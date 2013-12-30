var five = require("johnny-five");
var board = five.Board();
var count = 0;
var firmata;

board.on("ready", function() {
  firmata = board.firmata;
  console.log("board ready");
  

  pA0 = five.Pin("A0");
  pA2 = five.Pin("A2");
  p7 = five.Pin(7);

  firmata.digitalRead(7,function(value) {
          console.log("7: "+count++ +" - " +value);
  })

/*
  p7.read(function(value) {
          console.log("7: "+count++ +" - " +value);
  });
*/

  board.pinMode(7, five.Pin.OUTPUT);
  console.log("SET HIGH")
  p7.high();

  setTimeout(function() {
    console.log("SET LOW")
    p7.low();
    setTimeout(function() {
      console.log("SET HIGH")
      p7.high();
      board.pinMode(7, five.Pin.INPUT);
      setTimeout(function() {
        

      }, 40) 
    },20)

  },250);

  setInterval(requestDTH11, 5000)



})

var requestDTH11 = function() {
  firmata.pinMode(7, firmata.MODES.OUTPUT);
  console.log("SET HIGH")
  firmata.digitalWrite(7, firmata.HGH);

  setTimeout(function() {
    console.log("SET LOW")
    firmata.digitalWrite(7, firmata.LOW);;
    setTimeout(function() {
      console.log("SET HIGH");
      firmata.digitalWrite(7, firmata.HGH);
      firmata.pinMode(7, firmata.MODES.INPUT);
    },30)

  },250);
  count=0;
}

var requestDTH11B = function() {
  board.pinMode(7, five.Pin.OUTPUT);
  console.log("SET HIGH")
  p7.high();

  setTimeout(function() {
    console.log("SET LOW")
    p7.low();
    setTimeout(function() {
      console.log("SET HIGH")
      p7.high();
      board.pinMode(7, five.Pin.INPUT);
    },18)

  },250);
  count=0;
}