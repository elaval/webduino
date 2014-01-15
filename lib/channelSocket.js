// Var & util used for Events management
var events = require("events");
var util = require("util");

var Channel = function(opts) {

  if ( !(this instanceof Channel) ) {
    return new Channel(opts);
  }

  var server = opts.server;

  // Set up socket.io connection
  this.io = require('socket.io').listen(server,  { log: false });
  this.io.sockets.on('connection',function(d) {
    console.log("New socket.io connection: "+d.id);
  });
 
  this.io.sockets.on("data", function(msg) {
    this.emit("data", msg);
  }.bind(this));

  events.EventEmitter.call(this);
};

// Inherit event api
util.inherits( Channel, events.EventEmitter );

Channel.prototype.put = function(resource, id,  data) {
  var msg = {};

  msg.resource = resource;
  msg.id = id;
  msg.data = data;

  this.io.sockets.emit("data", msg);
};






module.exports.Create = Channel;
