App.baseurl = window.location.origin;

$(document).ready(function() {

	App.board = App.RemoteBoard();
	App.board.connect(App.baseurl, function() {
		console.log("CONNECTED");
		//App.board.monitorSensor("2", function() {});
		App.collections.pins = new App.collections.Pins();

		App.switch = new App.models.Switch();

		App.sensors = new App.collections.Sensors();

		App.sensors.fetch({
			success: function() {
				App.sensors.get("A0").set("active",true);
				App.sensors.get("A0").save();
				App.sensors.get("A1").set("active",true);
				App.sensors.get("A1").save();
				App.sensors.get("A2").set("active",true);
				App.sensors.get("A2").save();

		
				App.sensors.get("A0").setType("temp");
				App.sensors.get("A1").setType("humidity");
				App.sensors.get("A2").setType("light");
				App.switch.setSensor(App.sensors.get("A2"));
			},

		});

		App.sensors.on("all", function(a,b,c,d) {
			//console.log("Sensor: "+a+b+c+d);

		});
		App.sensors.on("sync", function() {
		});


		App.leds = new App.collections.Leds();

		App.leds.fetch({
			success: function() {
				App.switch.setLed(App.leds.get(13));
			}
		});
		App.leds.on("sync", function() {

		});

		App.views.lab = new App.views.Lab({sensors: App.sensors, leds: App.leds, switch: App.switch});
		$("#svgcontainer").html(App.views.lab.$el);


		App.testswitch  = new App.models.Switch({sensor:App.sensors.get("A2"), led:App.leds.get(13)})

		App.switch.set("min", d3.select("input.min").attr("value"));
		App.switch.set("max", d3.select("input.max").attr("value"));
		
		var inputmin = d3.select("input.min")
	    	.on("change", function() { 
	    		App.switch.set("min", this.value) 
	    	})

		var inputmax = d3.select("input.max")
	    	.on("change", function() { 
	    		App.switch.set("max", this.value) 
	    	})

	})



});

App.RemoteBoard = function() {
	var socket = null;
	var sensors = {};
	var sensorcallbacks = {};
	var leds = {};
	var ledvalues = {};
	var board = {};
	
	board.connect = function(url, callback) {
		// When board is connected, create socket through socket.io
		socket = io.connect(App.baseurl);
		
		// Listen to pin chaneg of value messages
		socket.on("pin", function(data) {
			var id = data.id;
			
			if (App.collections.pins && App.collections.pins.get(id)) {
				App.collections.pins.get(id).set(data);
			}

		});

		// Listen to sensor data messages
		socket.on("sensor", function(data) {
			var id = data.id;
			
			if (App.sensors && App.sensors.get(id)) {
				App.sensors.get(id).set(data);
			}

		});

		// Listen to led change of state messages
		socket.on("led", function(data) {
			var id = data.id;

			console.log(data);

			if (App.leds && App.leds.get(id)) {
				App.leds.get(id).set(data);
			}

		});

		// Listen to board connection
		socket.on("board", function(data) {
			console.log(data);
		});

		
		socket.on('connect', callback);
		return board;
	}


		
	return board;

}
