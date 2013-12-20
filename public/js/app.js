
$(document).ready(function() {
	App.socket = new WebSocket('ws://192.168.2.123:8080'); 
	App.socket.onopen = function() {console.log("CONNECTED")};
	
	
	
	App.justturnedon = false;
	App.models.sensor = new App.models.Sensor();

	App.views.lightSensorView = new App.views.LightSensorView({
		//el:"input#sensor",
		sensor: App.models.sensor
	});
	$("#sensor2").html(App.views.lightSensorView.$el);

	App.views.buttonPanelView = new App.views.ButtonPanelView({el:".buttonPanel"});
	
	App.views.sparklineView = new App.views.SparklineView({sensor:App.models.sensor});
	$("div.sparkline").html(App.views.sparklineView.$el)

	App.views.remoteLed = new App.views.RemoteLed();
	App.views.remoteLed.setSensor(App.models.sensor, 20);
	
	App.socket.onmessage = function(websocketevent) {
		var jsonmsg = JSON.parse(websocketevent.data);
		var type = jsonmsg[0];
		var data = jsonmsg[1];
		$("#msg").html(data.value + " ("+data.count+") cpu: "+data.cpu);
		App.models.sensor.newsample(data);
	};

	
	/*
	App.socket.on("data", function(count,light, mem, cpu) {
		//console.log(d);
		$("#msg").html(count+" - "+light+" - "+mem+" - "+cpu);
	});
	*/


});
