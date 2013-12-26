App.baseurl = window.location.origin;

$(document).ready(function() {
	App.views.lab = new App.views.Lab();
	$("#svgcontainer").html(App.views.lab.$el);

	App.board = App.RemoteBoard();
	App.board.connect(App.baseurl, function() {
		console.log("CONNECTED");
		//App.board.monitorSensor("2", function() {});
		App.collections.pins = new App.collections.Pins();

		App.switch = new App.models.Switch();

		App.sensors = new App.collections.Sensors();
		App.views.mysensors = new App.views.Sensors({collection:App.sensors});
		$(".mysensors").html(App.views.mysensors.$el);

		App.sensors.fetch();
		App.sensors.on("sync", function() {
			if (!App.sensors.get("A0")) App.sensors.create({id:"A0"});
			if (!App.sensors.get("A1")) App.sensors.create({id:"A1"});
			if (!App.sensors.get("A2")) App.sensors.create({id:"A2"});
			App.switch.setSensor(App.sensors.get("A2"));
		});


		App.leds = new App.collections.Leds();
		App.views.myleds = new App.views.MyLEDs({collection:App.leds});
		$(".myleds").html(App.views.myleds.$el);

		App.leds.fetch();
		App.leds.on("sync", function() {
			if (!App.leds.get(13)) App.leds.create({id:13});
			if (!App.leds.get(12)) App.leds.create({id:12});
			if (!App.leds.get(11)) App.leds.create({id:11});
			App.switch.setLed(App.leds.get(13));
		});

		App.testswitch  = new App.models.Switch({sensor:App.sensors.get("A2"), led:App.leds.get(13)})

		App.collections.pins.fetch({
			success: function() {			
				App.views.ledView13 = new App.views.LEDView2({model: App.collections.pins.get(13)});
				$(".myled13").html(App.views.ledView13.$el);
	
				App.views.ledView12 = new App.views.LEDView2({model: App.collections.pins.get(12)});
				$(".myled12").html(App.views.ledView12.$el);

				App.views.lightSensorView = new App.views.LightSensorView({model: App.collections.pins.get("A2")});
				$("#sensor2").html(App.views.lightSensorView.$el);

			}
		});

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

			if (App.leds && App.leds.get(id)) {
				App.leds.get(id).set(data);
			}

		});

		
		socket.on('connect', callback);
		return board;
	}


		
	return board;

}
