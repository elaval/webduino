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
var Webduino = function() {
  var self = this;

  if ( !(this instanceof Webduino) ) {
    return new Webduino( );
  }

  // Configure Express Server using external http server (for socket.io)
  var expressApp = express(); 
  this.httpserver = require('http').createServer(expressApp);

  // Create manager for dealing with API requests
  var webduinoApiManager = require("./webduino-api");
  var webduinoApi= webduinoApiManager(this.httpserver);

  // Configure Express middelware
  expressApp.use(cors()); // CORS for cross domain requests
  expressApp.use(express.static('public')); // Static web content at public dir
  expressApp.use(express.json()); // JSON management
  expressApp.use(express.urlencoded());

  // Check for the board connection (uses johnny-five underneath)
  webduinoApi.on("ready", function() {
    // Requests for "pin" objects
    expressApp.get('/api/pins/:id', getPin);
    expressApp.get('/api/pins', getPins);
    expressApp.post('/api/pins/:id', putPin);
    expressApp.put('/api/pins/:id', putPin);

    // Requests for "sensor" objects
    expressApp.put('/api/sensors/:id', putSensor);
    expressApp.get('/api/sensors', getSensors);
    expressApp.get('/api/sensors/:id', getSensor);

    // Requests for "led" objects
    expressApp.put('/api/leds/:id', putLed);
    expressApp.get('/api/leds/:id', getLed);
    expressApp.get('/api/leds', getLeds);

    // Request for "board" object
    expressApp.get('/api/board', getBoard);

    // Request for "webduino" object
    expressApp.get('/api/webduino', getWebduino);

    // Route that triggers a sample error:
    expressApp.get('/error', function createError(req, res, next) {
      res.send(500, { error: 'something blew up' });
    });

    self.emit("ready");

  });

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
* @api {get} /api/pin/:id Request Pin State
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
  var getPin = function(req, res, next){
    webduinoApi.getPin(req, res, next);
  };

  /**
  * getPins - GET /api/pin
  *
  * @param {Object} req http request
  * @param {Object} res http rtesponse
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
  var getPins = function(req, res){
    webduinoApi.getPins(req, res);
  };

/**
* putPin - PUT /api/pin/:id
*
* @param {Object} req http request
* @param {Object} res http rtesponse
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
  var putPin = function(req, res){
    webduinoApi.putPin(req, res);
  };
 
  /****************
  * SENSOR Handlers
  *****************/

  /**
  * getSensors - GET /api/sensors
  *
  * @param {Object} req http request
  * @param {Object} res http rtesponse
  */  
  var getSensors = function(req, res){
    webduinoApi.getSensors(req, res);
  };

  /**
  * getSensor - GET /api/sensors/:id
  *
  * @param {Object} req http request
  * @param {Object} res http rtesponse
  */  
  var getSensor = function(req, res){
    webduinoApi.getSensor(req, res);
  };

  /**
  * putSensor - PUT /api/sensors/:id
  * @param {Object} req http request
  * @param {Object} res http rtesponse
  */  
  var putSensor = function(req, res){
    webduinoApi.putSensor(req, res);
  };

  /****************
  * LED Handlers
  *****************/

  /**
  * putLed - PUT /api/leds/:id
  *
  * @param {Object} req http request
  * @param {Object} res http rtesponse
  */  
  var putLed = function(req, res){
    webduinoApi.putLed(req, res);
  };

  /**
  * getLed - GET /api/leds/:id
  *
  * @param {Object} req http request
  * @param {Object} res http rtesponse
  */  
  var getLed = function(req, res){
    webduinoApi.getLed(req, res);
  };

  /**
  * getLeds
  *
  * @param {Object} req http request
  * @param {Object} res http rtesponse
  */  
  var getLeds = function(req, res){
    webduinoApi.getLeds(req, res);
  };

  /****************
  * Other Handlers
  *****************/
  
  /**
  * getBoard
  *
  * @param {Object} req http request
  * @param {Object} res http rtesponse
  */  
  var getBoard= function(req, res){
    webduinoApi.getBoard(req, res);
  };

  /**
  * getWebduino
  *
  * @param {Object} req http request
  * @param {Object} res http rtesponse
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
 * localIPs  Return list of IP address of local server (inlcudes 127.0.0.1 if no other IP is found)
 */
Webduino.prototype.localIPs = function() {
// Identify local IP Address
var interfaces = require('os').networkInterfaces();
  var ips = [];

  var addIP = function(details) {
   if (details.family=='IPv4') {
      // Exclude 127.0.0.1
      if (details.address != "127.0.0.1") {
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




module.exports = Webduino;




