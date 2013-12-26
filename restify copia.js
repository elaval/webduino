var restify = require('restify');
var ecstatic = require('ecstatic');

var webduino = require("./webduino").webduino;


var server = restify.createServer();
server.use(ecstatic({ root: __dirname + '/public', handleError: false }));

  server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
  });
//var apiduino = new webduino(server);

/*
apiduino.on("ready", function() {
  console.log("WEBDUINO READY")

  server.get('/pins/:id', getPin);
  server.get('/pins', getPins);
  server.put('/pins/:id', putPin);
  server.post('/sensors/:id', postSensor);


});
*/


// getPin - GET /pin/:id
var getPin = function(req, res, next){
  getPinState(req, res)
}

// getPinState - GET /pinstate/:id
var getPinState = function(req, res){
  var id = req.params.id;
  apiduino.getPinState(id, function(state) {
    res.send(state);
  })
  
}

// getPins - GET /pin
var getPins = function(req, res){
  apiduino.getPins(function(out) {
    res.send(out)
  })
};


// putPin - PUT /pin/:id
var putPin = function(req, res){
  var id = req.params.id;
  var value = req.body.value;

  apiduino.setPin(id, value, function(state) {
    res.send(state);
  });
  
};

// postSensor 
var postSensor = function(req, res){
  var id = req.params.id;
  var freq = req.body.freq;


  apiduino.postSensor({id:id, freq:freq}, function(state) {
    res.send(state);
  });
  
};







