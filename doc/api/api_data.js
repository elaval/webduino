define({ api: [
  {
    "type": "get",
    "url": "/api/board",
    "title": "Request board information",
    "name": "getBoard",
    "group": "Board",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "field": "id",
            "optional": false,
            "description": "Board id (used by johnny-five)"
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "type",
            "optional": false,
            "description": "Board type (Example: UNO)"
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "port",
            "optional": false,
            "description": "USB port the board is connected to"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nX-Powered-By: Express\nAccess-Control-Allow-Origin: *\nContent-Type: application/json; charset=utf-8\nContent-Length: 102\nETag: \"-2048363588\"\nDate: Sun, 05 Jan 2014 23:47:25 GMT\nConnection: keep-alive\n{\n \"id\": \"20E014E1-3BC3-4D46-B057-67E78115961F\",\n \"type\": \"UNO\",\n \"port\": \"/dev/cu.usbmodemfa131\"\n}\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "get",
    "url": "/api/leds/:id",
    "title": "Request Led State",
    "name": "getLed",
    "group": "Led",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "field": "id",
            "optional": false,
            "description": "Pin id (0 - 13)."
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "field": "id",
            "optional": false,
            "description": "Pin unique ID (0-13)."
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "field": "on",
            "optional": false,
            "description": "Led is On / Off  (true|false)"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "field": "strobe",
            "optional": false,
            "description": "Led is set to strobe/blink (true|false)"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "time",
            "optional": false,
            "description": "Time (in milliseconds) used for strobe|blinking."
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nX-Powered-By: Express\nAccess-Control-Allow-Origin: *\nContent-Type: application/json; charset=utf-8\nContent-Length: 129\nETag: \"-2125057399\"\nDate: Thu, 02 Jan 2014 23:57:12 GMT\nConnection: keep-alive\n {\n  \"id\": 13,\n  \"on\": false,\n  \"strobe\": false,\n  \"time\": 250\n}\n"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "PinNotFound",
            "optional": false,
            "description": "The id of the Pin was not found."
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "   HTTP/1.1 404 Not Found\n   {\n     \"error\": \"PinNotFound\"\n   }\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "get",
    "url": "/api/leds",
    "title": "Request array with Leds State",
    "name": "getLeds",
    "group": "Led",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "field": "id",
            "optional": false,
            "description": "Pin id (0 - 13)."
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "field": "state",
            "optional": false,
            "description": "State of each Led."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "state.id",
            "optional": false,
            "description": "Pin unique ID (0-13)."
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "field": "state.on",
            "optional": false,
            "description": "Led is On / Off  (true|false)"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "field": "state.strobe",
            "optional": false,
            "description": "Led is set to strobe/blink (true|false)"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "state.time",
            "optional": false,
            "description": "Time (in milliseconds) used for strobe|blinking."
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nX-Powered-By: Express\nAccess-Control-Allow-Origin: *\nContent-Type: application/json; charset=utf-8\nContent-Length: 1070\nETag: \"23474528\"\nDate: Sun, 05 Jan 2014 23:41:04 GMT\nConnection: keep-alive\n[\n {\n   \"id\": 0,\n   \"on\": false,\n   \"strobe\": false,\n   \"time\": 250\n },\n ...\n]\n"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "PinNotFound",
            "optional": false,
            "description": "The id of the Pin was not found."
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "   HTTP/1.1 404 Not Found\n   {\n     \"error\": \"PinNotFound\"\n   }\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "put",
    "url": "/api/leds/:id",
    "title": "Modify Led state",
    "name": "putLed",
    "group": "Led",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "field": "id",
            "optional": false,
            "description": "Pin unique ID (0-13)."
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "field": "on",
            "optional": false,
            "description": "Turn Led On / Off  (true|false)"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "field": "strobe",
            "optional": false,
            "description": "Set Led to strobe/blink (true|false)"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "field": "time",
            "optional": false,
            "description": "Time (in milliseconds) used for strobe|blinking."
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "field": "id",
            "optional": false,
            "description": "Pin unique ID (0-13)."
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "field": "on",
            "optional": false,
            "description": "Led is On / Off  (true|false)"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "field": "strobe",
            "optional": false,
            "description": "Led is set to strobe/blink (true|false)"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "time",
            "optional": false,
            "description": "Time (in milliseconds) used for strobe|blinking."
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n {\n  \"id\": 13,\n  \"on\": false,\n  \"strobe\": false,\n  \"time\": 250\n}\n"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "PinNotFound",
            "optional": false,
            "description": "The id of the Pin was not found."
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "   HTTP/1.1 404 Not Found\n   {\n     \"error\": \"PinNotFound\"\n   }\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "get",
    "url": "/api/pins/:id",
    "title": "Request Pin State",
    "name": "GetPin",
    "group": "Pin",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "field": "id",
            "optional": false,
            "description": "Pin id (0 - 13 | A0 - A5)."
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "field": "id",
            "optional": false,
            "description": "Pin's id"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "field": "supportModes",
            "optional": false,
            "description": "List of modes supported by this Pin."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "mode",
            "optional": false,
            "description": "Mode currently set to this Pin."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "value",
            "optional": false,
            "description": "Current value."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "report",
            "optional": false,
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "analogChannel",
            "optional": false,
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nX-Powered-By: Express\nAccess-Control-Allow-Origin: *\nContent-Type: application/json; charset=utf-8\nContent-Length: 129\nETag: \"-2125057399\"\nDate: Thu, 02 Jan 2014 23:57:12 GMT\nConnection: keep-alive\n{\n \"supportedModes\": [\n   0,\n   1,\n   4\n ],\n \"mode\": 1,\n \"value\": 0,\n \"report\": 1,\n \"analogChannel\": 127,\n \"id\": \"13\"\n}\n"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "PinNotFound",
            "optional": false,
            "description": "The id of the Pin was not found."
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "   HTTP/1.1 404 Not Found\n   {\n     \"error\": \"PinNotFound\"\n   }\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "get",
    "url": "/api/pins",
    "title": "Request State of all Pins",
    "name": "GetPins",
    "group": "Pin",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "field": "states",
            "optional": false,
            "description": "List of Pin States."
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "states.id",
            "optional": false,
            "description": "Pin id."
          },
          {
            "group": "Success 200",
            "type": "Number[]",
            "field": "states.supportModes",
            "optional": false,
            "description": "Support Modes"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "states.mode",
            "optional": false,
            "description": "Mode currently set to this Pin."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "states.value",
            "optional": false,
            "description": "Current value."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "states.report",
            "optional": false,
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "states.analogChannel",
            "optional": false,
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200OK\n[{\n  \"supportedModes\": [\n    0,\n    1,\n    4\n  ],\n  \"mode\": 1,\n  \"value\": 0,\n  \"report\": 1,\n  \"analogChannel\": 127,\n  \"id\": \"13\"\n},\n ...\n]\n"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "   curl -i http://localhost:8000/api/pins\n"
      }
    ],
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "put",
    "url": "/api/pins/:id",
    "title": "Modify Pin value",
    "name": "putPin",
    "group": "Pin",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "field": "id",
            "optional": false,
            "description": "Pin unique ID (0-13 | A0-A5)."
          },
          {
            "group": "Parameter",
            "type": "String",
            "field": "value",
            "optional": false,
            "description": "Pin value."
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"supportedModes\": [\n    0,\n    1,\n    4\n  ],\n  \"mode\": 1,\n  \"value\": 0,\n  \"report\": 1,\n  \"analogChannel\": 127,\n  \"id\": \"13\"\n}\n"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "PinNotFound",
            "optional": false,
            "description": "The id of the Pin was not found."
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "   HTTP/1.1 404 Not Found\n   {\n     \"error\": \"PinNotFound\"\n   }\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "get",
    "url": "/api/sensors/:id",
    "title": "Request Sensor State",
    "name": "getSensor",
    "group": "Sensor",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "field": "id",
            "optional": false,
            "description": "Pin id (A0 - A5)."
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "field": "id",
            "optional": false,
            "description": "Pin's id"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "field": "active",
            "optional": false,
            "description": "Current Sensor is active (true|false)."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "freq",
            "optional": false,
            "description": "Frequency (in milliseconds) for broadcasting the sensor value."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "value",
            "optional": false,
            "description": "Current value."
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nX-Powered-By: Express\nAccess-Control-Allow-Origin: *\nContent-Type: application/json; charset=utf-8\nContent-Length: 129\nETag: \"-2125057399\"\nDate: Thu, 02 Jan 2014 23:57:12 GMT\nConnection: keep-alive\n{\n  \"id\": \"A0\",\n  \"active\": false,\n  \"freq\": 250,\n  \"value\": null\n},\n"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "PinNotFound",
            "optional": false,
            "description": "The id of the Pin was not found."
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "   HTTP/1.1 404 Not Found\n   {\n     \"error\": \"PinNotFound\"\n   }\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "get",
    "url": "/api/sensors",
    "title": "Request array with sensor states",
    "name": "getSensors",
    "group": "Sensor",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "field": "id",
            "optional": false,
            "description": "Pin id (A0 - A5)."
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "field": "states",
            "optional": false,
            "description": "List of Pin States."
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "states.id",
            "optional": false,
            "description": "Pin's id"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "field": "states.active",
            "optional": false,
            "description": "Current Sensor is active (true|false)."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "states.freq",
            "optional": false,
            "description": "Frequency (in milliseconds) for broadcasting the sensor value."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "states.value",
            "optional": false,
            "description": "Current value."
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nX-Powered-By: Express\nAccess-Control-Allow-Origin: *\nContent-Type: application/json; charset=utf-8\nContent-Length: 488\nETag: \"117272816\"\nDate: Sun, 05 Jan 2014 23:25:12 GMT\nConnection: keep-alive\n[\n {\n   \"id\": \"A0\",\n   \"active\": false,\n   \"freq\": 500,\n   \"value\": null\n },\n ...\n]\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "put",
    "url": "/api/sensors/:id",
    "title": "Modify Sensor state/frequency",
    "name": "putSensor",
    "group": "Sensor",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "field": "id",
            "optional": false,
            "description": "Pin unique ID (A0-A5)."
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "field": "active",
            "optional": false,
            "description": "Sensor is active (true|false)."
          },
          {
            "group": "Parameter",
            "type": "Number",
            "field": "frequency",
            "optional": false,
            "description": "Frequency in milliseconds."
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "field": "id",
            "optional": false,
            "description": "Pin's id"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "field": "active",
            "optional": false,
            "description": "Current Sensor is active (true|false)."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "freq",
            "optional": false,
            "description": "Frequency (in milliseconds) for broadcasting the sensor value."
          },
          {
            "group": "Success 200",
            "type": "Number",
            "field": "value",
            "optional": false,
            "description": "Current value."
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"A0\",\n  \"active\": true,\n  \"freq\": 125,\n  \"value\": 50\n},\n"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "PinNotFound",
            "optional": false,
            "description": "The id of the Pin was not found."
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "   HTTP/1.1 404 Not Found\n   {\n     \"error\": \"PinNotFound\"\n   }\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "type": "get",
    "url": "/api/webduino",
    "title": "Test api to check if webduino is active",
    "name": "getWebduino",
    "group": "Webduino",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "field": "result",
            "optional": false,
            "description": "(true)"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nX-Powered-By: Express\nAccess-Control-Allow-Origin: *\nContent-Type: application/json; charset=utf-8\nContent-Length: 102\nETag: \"-2048363588\"\nDate: Sun, 05 Jan 2014 23:47:25 GMT\nConnection: keep-alive\n{\n \"resulr\": true\n}\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  },
  {
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "PinNotFound",
            "optional": false,
            "description": "The id of the Pin was not found."
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "   HTTP/1.1 404 Not Found\n   {\n     \"error\": \"PinNotFound\"\n   }\n"
        }
      ]
    },
    "group": "webduino.js",
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "lib/webduino.js"
  }
] });