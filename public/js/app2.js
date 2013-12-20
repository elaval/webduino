App.baseurl = window.location.href;

$(document).ready(function() {
	//App.socket = new WebSocket('ws://192.168.2.123:8080'); 
	//App.socket.onopen = function() {console.log("CONNECTED")};
	
	App.board = App.RemoteBoard();
	App.board.connect(App.baseurl, function() {
		console.log("CONNECTED");
		//App.board.monitorSensor("2", function() {});
		App.collections.pins = new App.collections.Pins();
		App.collections.pins.on("reset", function() {
			

		});
		App.collections.pins.fetch({
			success: function() {			
				App.views.ledView13 = new App.views.LEDView2({model: App.collections.pins.get(13)});
				$(".myled13").html(App.views.ledView13.$el);
	
				App.views.ledView12 = new App.views.LEDView2({model: App.collections.pins.get(12)});
				$(".myled12").html(App.views.ledView12.$el);

				App.views.lightSensorView = new App.views.LightSensorView({model: App.collections.pins.get("A2")});
				$("#sensor2").html(App.views.lightSensorView.$el);

				App.models.monitorA2 = new App.models.Monitor({id:"A2", active:1})
				App.models.monitorA2.save();
			}
		});

	})
	
	
	

	
	
	/*
	App.models.sensor = new App.models.Sensor();
	
  	//App.socket = io.connect('http://192.168.2.123:8080');
	var href = window.location.href;
  	App.socket = io.connect(href);
  	
  	
  	App.socket.on('connect', function () { 
  	  App.socket.emit("newsensor", {pin:"A2"}, function(msg) {console.log(msg)} );
  	  App.socket.emit("newled", {pin:13}, function(msg) {console.log(msg)} );
  	  App.socket.emit("newled", {pin:12"}, function(msg) {console.log(msg)} );
    });
    
  	App.socket.on('sensor', function (data) {
  		//$("#msg").html(data.value);
  		if (data.pin == 2) App.models.sensor.newsample(data);
  	});
  	
  	App.views.lightSensorView = new App.views.LightSensorView({
		//el:"input#sensor",
		sensor: App.models.sensor
	});
	$("#sensor2").html(App.views.lightSensorView.$el);

	App.views.sparklineView = new App.views.SparklineView({sensor:App.models.sensor});
	$("div.sparkline").html(App.views.sparklineView.$el)
*/
	/*
	App.justturnedon = false;
	App.views.lightSensorView = new App.views.LightSensorView({
		//el:"input#sensor",
		sensor: App.models.sensor
	});
	$("#sensor2").html(App.views.lightSensorView.$el);

	App.views.buttonPanelView = new App.views.ButtonPanelView({el:".buttonPanel"});
	

	App.views.remoteLed = new App.views.RemoteLed();
	App.views.remoteLed.setSensor(App.models.sensor, 20);
	*/
	



});

App.RemoteBoard = function() {
	var socket = null;
	var sensors = {};
	var sensorcallbacks = {};
	var leds = {};
	var ledvalues = {};
	var board = {};
	
	board.connect = function(url, callback) {
		socket = io.connect(url);
		
		// Listen to sensor messages
		socket.on("pin", function(data) {
			var id = data.id;
			
			if (App.collections.pins && App.collections.pins.get(id)) {
				App.collections.pins.get(id).set(data);
			}

		});
/*
		// Listen to sensor messages
		socket.on("sensor", function(data) {
			var pin = data.pin;
			
			if (App.collections.pins && App.collections.pins.get(pin)) {
				App.collections.pins.get(pin).set("value", data.value);
			}

			if (sensorcallbacks[pin]) {
				sensorcallbacks[pin](data);
			}
		});
*/
		
		socket.on('connect', callback);
		return board;
	}

	board.monitorSensor = function(pin) {
		socket.emit("monitorSensor", {'pin':pin}, function(msg) {console.log(msg)});

		return board;
	}
	
	board.addSensor = function(pin, ondata) {
		socket.emit("newsensor", {'pin':pin}, function(msg) {console.log(msg)});
		
		sensorcallbacks[pin] = ondata;
		return board;
	}
	
	board.addLed = function(pin) {
		socket.emit("newled", {'pin':pin}, function(msg) {console.log(msg)} );
		return board;
	}
	
	board.led = function(pin) {
		if (!leds[pin]) {
			leds[pin] = new Backbone.Model();

			var led = leds[pin];

			led.turnon = function() {
				socket.emit("led", {'pin':pin, 'action': 'on'}, function(msg) {
					if (msg.result == "OK") {
						led.set("value",msg.value);
						console.log(msg.value)
					}
				} );
				return led;
			};
			
			led.turnoff = function() {
				socket.emit("led", {'pin':pin, 'action': 'off'},  function(msg) {
					if (msg.result == "OK") {
						led.set("value",msg.value);
						console.log(msg.value)
					}
				} );
				return led;
			};

			led.toggle = function() {
				socket.emit("led", {'pin':pin, 'action': 'toggle'},  function(msg) {
					if (msg.result == "OK") {
						led.set("value",msg.value);
						console.log(msg.value)
					}
				} );
				return led;
			};
		}
		
		return leds[pin];
	}


		
	return board;

}
