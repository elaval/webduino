var webduino = require('./webduino');
var webduinoApp = webduino();
var server = webduinoApp.server();
var PORT = 3000;

webduinoApp.on("ready", function() {
  server.listen(PORT, function() {
    console.log("Listening on localhost, PORT: "+PORT)
  });
})




