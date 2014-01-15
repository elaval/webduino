# webduino [![Build Status](https://secure.travis-ci.org/elaval/webduino.png?branch=master)](http://travis-ci.org/elaval/webduino)

Arduino control over http

## Getting Started
Install the module with: `npm install webduino`

```javascript
var webduino = require('webduino');
webduino.awesome(); // "awesome"
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Ernesto Laval  
Licensed under the MIT license.

webduino
========

RESTful API for controlling and reading devices sensors and actuators connected to an Arduino Borad through an HTTP Connection.

It is buit on top of a great set of modules:

**Nodejs** - Javascript on the server!!

**johnny-five** - Communication to Arduino boards in node

**express** - Web server (API & local web pages)

**socket.io** - Get events from sensors of change in state through an http connection

Created by TIDE SA for the support of Makers Movement in Schools.

## Quick start

### Arduino
Get an Arduino (tested on Arduino UNO) and connect to your computer through USB

### NODE JS
If you don't have it already ... install node on your computer.
- http://nodejs.org
- http://howtonode.org/how-to-install-nodejs

### webduino
Create a new directory and install webduino module with nmp
```
$ mkdir myfirstwebduino
$ cd myfirstwebduino
$ npm install webduino
```
Make sure your Arduino is connected to a USB port and run a webduino server
```
$ mkdir myfirstwebduino
$ cd myfirstwebduino
$ npm install webduino
```
Create your server program - server.js
```javascript
var webduino = require('webduino');
var webduinoApp = webduino();

var server = webduinoApp.server();
var PORT = 8000;

webduinoApp.on("ready", function() {
  // On board ready, start listening for http requests
  server.listen(PORT, function() {
    // Notify local IP Addrsss & PORT
    var IP = webduinoApp.localIPs()[0];
    console.log("Listening on "+IP+":"+PORT)
  });
})
```
And run it
```
$ node server
1388687348931 Board Connecting... 
1388687348939 Serial Found possible serial port /dev/cu.usbmodemfa131
1388687348941 Board -> Serialport connected /dev/cu.usbmodemfa131
1388687352124 Board <- Serialport connected /dev/cu.usbmodemfa131
1388687352124 Repl Initialized 
>> Listening on 192.168.1.123:8000

```

### Try it
In a Web Browser (on any computer from your local network) try the following urls to get the state of Pins, Leds or Sensors
- http://{server address}/api/leds 
- http://{server address}/api/leds/13 
- http://{server address}/api/sensors 
- http://{server address}/api/sensors/A1 
- http://{server address}/api/pins 
- http://{server address}/api/pins/7

## Complete API Docs
The complete API docs can be found [here](http://htmlpreview.github.io/?https://raw.github.com/elaval/webduino/master/doc/api/index.html)


 
