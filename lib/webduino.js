/*
 * webduino
 * https://github.com/elaval/webduino
 *
 * Copyright (c) 2014 Ernesto Laval
 * Licensed under the MIT license.
 */

'use strict';

// Express is the base Web Server for API & local files
var express = require('express');

// CORS is required for cross domain data requests
var cors = require('cors');

// Util & Events to use Events.Emitter
var util = require("util");
var events = require("events");


/**
 * Webduino
 * @constructor
 *
 * @description Configures WebServer and asigns API requests to be handles via WebduinoApi through johnny-five
 *
 */
var Webduino = function(opts) {
  var self = this;

  // Ensure opts is an object
  opts = opts || {};

  if ( !(this instanceof Webduino) ) {
    return new Webduino(opts);
  }

  // Configure Express Server using external http server (for socket.io)
  var expressApp = express(); 
  this.httpserver = require('http').createServer(expressApp);

  // Create manager for dealing with API requests
  var webduinoApiManager = require("./webduino-api");
  var webduinoApi= webduinoApiManager(this.httpserver, opts);
  this.webduinoApi = webduinoApi;

 
  // Configure Express middelware
  expressApp.use(cors()); // CORS for cross domain requests
  expressApp.use(express.static('public')); // Static web content at public dir
  expressApp.use(express.json()); // JSON management
  expressApp.use(express.urlencoded());

  // Check for the board connection (uses johnny-five underneath)
  webduinoApi.on("ready", function() {

    // Create a channel for 2 way communication with web clients through socket.io
    var socketChannel = require("./channelSocket").Create({server: this.httpserver});
    webduinoApi.addChannel(socketChannel);


    // Request for "board" object
    expressApp.get('/api/board', getBoard);

    // Request for "webduino" object
    expressApp.get('/api/webduino', getWebduino);

    expressApp.get('/api/:resource/:id', getElement);
    expressApp.put('/api/:resource/:id', putElement);

    expressApp.get('/api/:resource', getCollection);


    // Route that triggers a sample error:
    expressApp.get('/error', function createError(req, res) {
      res.send(500, { error: 'something blew up' });
    });

    self.emit("ready");

  }.bind(this));

  var getElement = function(req, res){
    var resource = req.params.resource;
    var id = req.params.id;

    webduinoApi.getElement(resource, id, function(status, data) {
      res.send(status, data);
    });
  };

  var putElement = function(req, res){
    var resource = req.params.resource;
    var id = req.params.id;
    var data = req.body;

    webduinoApi.putElement(resource, id, data, function(status, data) {
      res.send(status, data);
    });
  };

  var getCollection = function(req, res){
    var resource = req.params.resource;

    webduinoApi.getCollection(resource, function(status, data) {
      res.send(status, data);
    });
  };



  /****************
  * PIN Handlers
  *****************/

  /**
  * getPin - GET /api/pin/:id
  *
  * @param {Object} req http request
  * @param {Object} res http rtesponse
  */

/**
* @apiDefineErrorStructure PinNotFoundError
*
* @apiError PinNotFound The id of the Pin was not found.
*
* @apiErrorExample Error-Response:
*     HTTP/1.1 404 Not Found
*     {
*       "error": "PinNotFound"
*     }
*/
   
/**
* @api {get} /api/pins/:id Request Pin State
* @apiName GetPin
* @apiGroup Pin
*
* @apiParam {String} id Pin id (0 - 13 | A0 - A5).
*
* @apiSuccess {String} id Pin's id  
* @apiSuccess {Array} supportModes List of modes supported by this Pin.
* @apiSuccess {Number} mode  Mode currently set to this Pin.
* @apiSuccess {Number} value  Current value.
* @apiSuccess {Number} report  
* @apiSuccess {Number} analogChannel   
* @apiSuccessExample Success-Response:
* HTTP/1.1 200 OK
* X-Powered-By: Express
* Access-Control-Allow-Origin: *
* Content-Type: application/json; charset=utf-8
* Content-Length: 129
* ETag: "-2125057399"
* Date: Thu, 02 Jan 2014 23:57:12 GMT
* Connection: keep-alive
* 
* {
*   "supportedModes": [
*     0,
*     1,
*     4
*   ],
*   "mode": 1,
*   "value": 0,
*   "report": 1,
*   "analogChannel": 127,
*   "id": "13"
* }
*
* @apiErrorStructure PinNotFoundError
*
*/
 

/**
* @api {get} /api/pins Request State of all Pins
* @apiName GetPins
* @apiGroup Pin
*
* 
* @apiSuccess {Object[]} states       List of Pin States.
* @apiSuccess {String}   states.id   Pin id.
* @apiSuccess {Number[]}   states.supportModes Support Modes
* @apiSuccess {Number} states.mode  Mode currently set to this Pin.
* @apiSuccess {Number} states.value  Current value.
* @apiSuccess {Number} states.report  
* @apiSuccess {Number} states.analogChannel   
* @apiSuccessExample Success-Response:
*  HTTP/1.1 200OK
*  [{
*    "supportedModes": [
*      0,
*      1,
*      4
*    ],
*    "mode": 1,
*    "value": 0,
*    "report": 1,
*    "analogChannel": 127,
*    "id": "13"
*  },
*   ...
*  ]
*
* @apiExample Example usage:
*     curl -i http://localhost:8000/api/pins
*
*/

/**
* @api {put} /api/pins/:id Modify Pin value
* @apiName putPin
* @apiGroup Pin
*
* @apiParam {Number} id          Pin unique ID (0-13 | A0-A5).
* @apiParam {String} value Pin value.
*
* @apiSuccessExample Success-Response:
*  HTTP/1.1 200 OK
*  {
*    "supportedModes": [
*      0,
*      1,
*      4
*    ],
*    "mode": 1,
*    "value": 0,
*    "report": 1,
*    "analogChannel": 127,
*    "id": "13"
*  }
*
* @apiErrorStructure PinNotFoundError
*
*/
 
  /****************
  * SENSOR Handlers
  *****************/


/**
* @api {get} /api/sensors Request array with sensor states
* @apiName getSensors
* @apiGroup Sensor
*
* @apiParam {String} id Pin id (A0 - A5).
*
* @apiSuccess {Object[]} states       List of Pin States.
* @apiSuccess {String} states.id Pin's id  
* @apiSuccess {Array} states.active Current Sensor is active (true|false).
* @apiSuccess {Number} states.freq  Frequency (in milliseconds) for broadcasting the sensor value.
* @apiSuccess {Number} states.value  Current value.
* @apiSuccessExample Success-Response:
* HTTP/1.1 200 OK
* X-Powered-By: Express
* Access-Control-Allow-Origin: *
* Content-Type: application/json; charset=utf-8
* Content-Length: 488
* ETag: "117272816"
* Date: Sun, 05 Jan 2014 23:25:12 GMT
* Connection: keep-alive
* 
* [
*   {
*     "id": "A0",
*     "active": false,
*     "freq": 500,
*     "value": null
*   },
*   ...
* ]
*
*
*/
 
/**
* @api {get} /api/sensors/:id Request Sensor State
* @apiName getSensor
* @apiGroup Sensor
*
* @apiParam {String} id Pin id (A0 - A5).
*
* @apiSuccess {String} id Pin's id  
* @apiSuccess {Array} active Current Sensor is active (true|false).
* @apiSuccess {Number} freq  Frequency (in milliseconds) for broadcasting the sensor value.
* @apiSuccess {Number} value  Current value.
* @apiSuccessExample Success-Response:
* HTTP/1.1 200 OK
* X-Powered-By: Express
* Access-Control-Allow-Origin: *
* Content-Type: application/json; charset=utf-8
* Content-Length: 129
* ETag: "-2125057399"
* Date: Thu, 02 Jan 2014 23:57:12 GMT
* Connection: keep-alive
* 
* {
*    "id": "A0",
*    "active": false,
*    "freq": 250,
*    "value": null
*  },
*
* @apiErrorStructure PinNotFoundError
*
*/

/**
* @api {put} /api/sensors/:id Modify Sensor state/frequency
* @apiName putSensor
* @apiGroup Sensor
*
* @apiParam {Number} id          Pin unique ID (A0-A5).
* @apiParam {Boolean} active Sensor is active (true|false).
* @apiParam {Number} frequency Frequency in milliseconds.
*
* @apiSuccess {String} id Pin's id  
* @apiSuccess {Array} active Current Sensor is active (true|false).
* @apiSuccess {Number} freq  Frequency (in milliseconds) for broadcasting the sensor value.
* @apiSuccess {Number} value  Current value.
* @apiSuccessExample Success-Response:
*  HTTP/1.1 200 OK
*
* {
*    "id": "A0",
*    "active": true,
*    "freq": 125,
*    "value": 50
*  },
*
* @apiErrorStructure PinNotFoundError
*
*/ 

  /****************
  * Led Handlers
  *****************/

/**
* @api {put} /api/leds/:id Modify Led state
* @apiName putLed
* @apiGroup Led
*
* @apiParam {Number} id  Pin unique ID (0-13).
* @apiParam {Boolean} on  Turn Led On / Off  (true|false)
* @apiParam {Boolean} strobe Set Led to strobe/blink (true|false)
* @apiParam {Number} time Time (in milliseconds) used for strobe|blinking.
*
* @apiSuccess {Number} id  Pin unique ID (0-13).
* @apiSuccess {Boolean} on Led is On / Off  (true|false)
* @apiSuccess {Boolean} strobe Led is set to strobe/blink (true|false)
* @apiSuccess {Number} time Time (in milliseconds) used for strobe|blinking.
* @apiSuccessExample Success-Response:
*  HTTP/1.1 200 OK
*
*  {
*    "id": 13,
*    "on": false,
*    "strobe": false,
*    "time": 250
*  }
*
* @apiErrorStructure PinNotFoundError
*
*/  

/**
* @api {get} /api/leds/:id Request Led State
* @apiName getLed
* @apiGroup Led
*
* @apiParam {String} id Pin id (0 - 13).
*
* @apiSuccess {Number} id  Pin unique ID (0-13).
* @apiSuccess {Boolean} on Led is On / Off  (true|false)
* @apiSuccess {Boolean} strobe Led is set to strobe/blink (true|false)
* @apiSuccess {Number} time Time (in milliseconds) used for strobe|blinking.
* @apiSuccessExample Success-Response:
* HTTP/1.1 200 OK
* X-Powered-By: Express
* Access-Control-Allow-Origin: *
* Content-Type: application/json; charset=utf-8
* Content-Length: 129
* ETag: "-2125057399"
* Date: Thu, 02 Jan 2014 23:57:12 GMT
* Connection: keep-alive
* 
*  {
*    "id": 13,
*    "on": false,
*    "strobe": false,
*    "time": 250
*  }
*
* @apiErrorStructure PinNotFoundError
*
*/
 
/**
* @api {get} /api/leds Request array with Leds State
* @apiName getLeds
* @apiGroup Led
*
* @apiParam {String} id Pin id (0 - 13).
*
* @apiSuccess {Object[]} state  State of each Led.
* @apiSuccess {Number} state.id  Pin unique ID (0-13).
* @apiSuccess {Boolean} state.on Led is On / Off  (true|false)
* @apiSuccess {Boolean} state.strobe Led is set to strobe/blink (true|false)
* @apiSuccess {Number} state.time Time (in milliseconds) used for strobe|blinking.
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* X-Powered-By: Express
* Access-Control-Allow-Origin: *
* Content-Type: application/json; charset=utf-8
* Content-Length: 1070
* ETag: "23474528"
* Date: Sun, 05 Jan 2014 23:41:04 GMT
* Connection: keep-alive
*
* [
*   {
*     "id": 0,
*     "on": false,
*     "strobe": false,
*     "time": 250
*   },
*   ...
* ]
*
* @apiErrorStructure PinNotFoundError
*
*/
 
  /****************
  * SERVO Handlers
  *****************/

/**
* @api {put} /api/servos/:id Modify Servo state
* @apiName putServo
* @apiGroup Servo
*
* @apiParam {Number} id  Pin unique ID (0-13).
* @apiParam {Boolean} on  Turn Servo On / Off  (true|false)
* @apiParam {Boolean} strobe Set Servo to strobe/blink (true|false)
* @apiParam {Number} time Time (in milliseconds) used for strobe|blinking.
*
* @apiSuccess {Number} id  Pin unique ID (0-13).
* @apiSuccess {Boolean} on Servo is On / Off  (true|false)
* @apiSuccess {Boolean} strobe Servo is set to strobe/blink (true|false)
* @apiSuccess {Number} time Time (in milliseconds) used for strobe|blinking.
* @apiSuccessExample Success-Response:
*  HTTP/1.1 200 OK
*
*  {
*    "id": 13,
*    "on": false,
*    "strobe": false,
*    "time": 250
*  }
*
* @apiErrorStructure PinNotFoundError
*
*/  

/**
* @api {get} /api/servos/:id Request Servo State
* @apiName getServo
* @apiGroup Servo
*
* @apiParam {String} id Pin id (0 - 13).
*
* @apiSuccess {Number} id  Pin unique ID (0-13).
* @apiSuccess {Boolean} on Servo is On / Off  (true|false)
* @apiSuccess {Boolean} strobe Servo is set to strobe/blink (true|false)
* @apiSuccess {Number} time Time (in milliseconds) used for strobe|blinking.
* @apiSuccessExample Success-Response:
* HTTP/1.1 200 OK
* X-Powered-By: Express
* Access-Control-Allow-Origin: *
* Content-Type: application/json; charset=utf-8
* Content-Length: 129
* ETag: "-2125057399"
* Date: Thu, 02 Jan 2014 23:57:12 GMT
* Connection: keep-alive
* 
*  {
*    "id": 13,
*    "on": false,
*    "strobe": false,
*    "time": 250
*  }
*
* @apiErrorStructure PinNotFoundError
*
*/

/**
* @api {get} /api/servos Request array with Servos State
* @apiName getServos
* @apiGroup Servo
*
* @apiParam {String} id Pin id (0 - 13).
*
* @apiSuccess {Object[]} state  State of each Servo.
* @apiSuccess {Number} state.id  Pin unique ID (0-13).
* @apiSuccess {Boolean} state.on Servo is On / Off  (true|false)
* @apiSuccess {Boolean} state.strobe Servo is set to strobe/blink (true|false)
* @apiSuccess {Number} state.time Time (in milliseconds) used for strobe|blinking.
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* X-Powered-By: Express
* Access-Control-Allow-Origin: *
* Content-Type: application/json; charset=utf-8
* Content-Length: 1070
* ETag: "23474528"
* Date: Sun, 05 Jan 2014 23:41:04 GMT
* Connection: keep-alive
*
* [
*   {
*     "id": 0,
*     "on": false,
*     "strobe": false,
*     "time": 250
*   },
*   ...
* ]
*
* @apiErrorStructure PinNotFoundError
*
*/

  /****************
  * Other Handlers
  *****************/
  
/**
* @api {get} /api/board Request board information
* @apiName getBoard
* @apiGroup Board
*
* @apiSuccess {String} id Board id (used by johnny-five)  
* @apiSuccess {String} type Board type (Example: UNO)  
* @apiSuccess {String} port USB port the board is connected to
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* X-Powered-By: Express
* Access-Control-Allow-Origin: *
* Content-Type: application/json; charset=utf-8
* Content-Length: 102
* ETag: "-2048363588"
* Date: Sun, 05 Jan 2014 23:47:25 GMT
* Connection: keep-alive
* 
* {
*   "id": "20E014E1-3BC3-4D46-B057-67E78115961F",
*   "type": "UNO",
*   "port": "/dev/cu.usbmodemfa131"
* }
*
*
*/
  var getBoard= function(req, res){
    webduinoApi.getBoard(req, res);
  };

/**
* @api {get} /api/webduino Test api to check if webduino is active
* @apiName getWebduino
* @apiGroup Webduino
*
* @apiSuccess {String} result (true)  
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* X-Powered-By: Express
* Access-Control-Allow-Origin: *
* Content-Type: application/json; charset=utf-8
* Content-Length: 102
* ETag: "-2048363588"
* Date: Sun, 05 Jan 2014 23:47:25 GMT
* Connection: keep-alive
* 
* {
*   "resulr": true
* }
*
*
*/ 
 var getWebduino= function(req, res){
    res.send({result:true});
  };

  return this;
}; 

// Inherit event api
util.inherits( Webduino, events.EventEmitter );

/**
* server  Return the HTTP Server object used by webduino
*/
Webduino.prototype.server = function() {
  return this.httpserver;
};


/**
* addChannel  Adds a channel for 2 way communication of resource updates
* Channel requires:
*
* method channel.put(resource, id, data)
* 
* emit event "data" with mgs parameter: {'resource': resource, "id":id, 'data':data});
*
*/
Webduino.prototype.addChannel = function(channel) {
  this.webduinoApi.addChannel(channel);
};

/**
 * localIPs  Return list of IP address of local server (inlcudes 127.0.0.1 if no other IP is found)
 */
Webduino.prototype.localIPs = function() {
// Identify local IP Address
var interfaces = require('os').networkInterfaces();
  var ips = [];

  var addIP = function(details) {
   if (details.family==='IPv4') {
      // Exclude 127.0.0.1
      if (details.address !== "127.0.0.1") {
        ips.push(details.address);
      }
    }
  };

  // Check for IPv4 adress on each interface and add it to ips
  for (var dev in interfaces) {
    interfaces[dev].forEach(addIP);
  }

  // If no other address found, include 127.0.0.1
  if (ips.length===0) {
    ips.push("127.0.0.1");
  }

  return ips;
};

Webduino.prototype.awesome = function() {
  return 'awesome';
};


module.exports = Webduino;




/*

exports.awesome = function() {
  return 'awesome';
};

*/
