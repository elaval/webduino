define({ api: [
  {
    "type": "get",
    "url": "/api/pin/:id",
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
    "url": "/user/:id",
    "title": "Request User information",
    "name": "GetUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "field": "id",
            "optional": false,
            "description": "Users unique ID."
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
            "field": "firstname",
            "optional": false,
            "description": "Firstname of the User."
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "lastname",
            "optional": false,
            "description": "Lastname of the User."
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "   HTTP/1.1 200 OK\n   {\n     \"firstname\": \"John\",\n     \"lastname\": \"Doe\"\n   }\n"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "UserNotFound",
            "optional": false,
            "description": "The id of the User was not found."
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "   HTTP/1.1 404 Not Found\n   {\n     \"error\": \"UserNotFound\"\n   }\n"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "lib/a.js"
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