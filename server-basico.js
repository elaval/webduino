var express = require('express');
var app = express(), 
  server = require('http').createServer(app);


server.listen(3000);
app.use(express.static('public'));

app.get('/nacho', function(req, res){

    res.send("Hola, Soy nacho");

});

