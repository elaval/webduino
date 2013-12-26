var restify = require('restify');
var static = require("./static");
var express = require("express");
var app = express();


var server = restify.createServer(app);



server.get(/\/js\/?.*/, static({
  directory: './public/js'
}));

server.get(/\/css\/?.*/, static({
  directory: './public/css'
}));

server.get("index.html", static({
  directory: './public'
}));


server.get("h", function(req,res,next) {
	res.send("hola");
})



server.listen(3000)

