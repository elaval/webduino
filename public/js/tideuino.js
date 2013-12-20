var App = {};
App.views = {};
App.models = {};
App.collections = {};

App.views.RemoteLed = Backbone.View.extend({
	initialize: function() {
		this.state = 'off';
	},

	render: function() {
		App.socket.send(JSON.tringify(['lamp', { value: this.state }]));
		return this;
	},

	setSensor: function(sensor, limit) {
		var self = this;

		this.justTurnedOn = false;

		this.sensor = sensor;
		this.limit = limit;

		this.listenTo(sensor, "data", function(d) {
			if ((d.value < limit) && !self.justTurnedOn) {
				self.on();
				self.justTurnedOn = true;
			} else if ( (d.value >= limit) &&self.justTurnedOn) {
				self.off();
				self.justTurnedOn = false;
			}
		});

	},

	on: function() {
		this.state = "on";
		this.render();
	},

	off: function() {
		this.state = "off";
		this.render();
	}
})


App.models.Sensor = Backbone.View.extend({
	initialize : function() {
		_.bindAll(this,"newsample");

		this.value = null;

		this.maxlog = 100;
		this.log = new Backbone.Collection();
		//App.socket.on('light', this.newsample)
	},

	newsample: function(d) {
		var sample = this.log.add(d);
		this.trigger("data", d);

		if (this.log.length > this.maxlog) this.log.shift()
	},

	getlog: function() {
		return this.log.toJSON();
	}
});


App.views.LightSensorView = Backbone.View.extend({
	initialize : function(options) {
		this.listenTo(this.model, "change:value", this.render, this)
		this.decimal = d3.format(".2f");
	},

	render : function() {
		this.$el.html(this.decimal(this.model.get("value")));
		return this;
	},
})

App.views.LEDView2 = Backbone.View.extend({
	events : {
		"click button.on" : "ledOn",
		"click button.off" : "ledOff"
	},
	
	initialize : function(options) {
		this.listenTo(this.model,"change:value", this.ledValue, this);
		this.template = _.template($("#led_template").html());
		this.render();
	},
	
	render : function() {
		this.$el.html(this.template());

		return this;
	},
	
	ledOn : function(d) {
		this.model.set("value", 1);
		this.model.save();
	},

	ledOff : function(d) {
		this.model.set("value", 0);
		this.model.save();
	},

	ledValue : function(d) {
		console.log(this.model.get("id") + " - "+this.model.get("value"))
		if (this.model.get("value") == 1) {
			this.$("div.light").removeClass("off");
			this.$("div.light").addClass("on");
		} else {
			this.$("div.light").removeClass("on");
			this.$("div.light").addClass("off");
		}

	}


})

App.views.LEDView = Backbone.View.extend({
	events : {
		"click button.on" : "ledOn",
		"click button.off" : "ledOff"
	},
	
	initialize : function(options) {
		this.board = options.board;
		this.pin = options.pin;
		this.model = this.board.led(this.pin);
		this.model.on("change:value", this.ledValue, this)
		this.template = _.template($("#led_template").html());
		this.render();
	},
	
	render : function() {
		this.$el.html(this.template());

		return this;
	},
	
	ledOn : function(d) {
		this.board.led(this.pin).turnon();
	},

	ledOff : function(d) {
		this.board.led(this.pin).turnoff();
	},

	ledValue : function(d) {
		if (this.model.get("value") == 1) {
			this.$("div.light").removeClass("off");
			this.$("div.light").addClass("on");
		} else {
			this.$("div.light").removeClass("on");
			this.$("div.light").addClass("off");
		}

	}


})

App.views.ButtonPanelView = Backbone.View.extend({
	events : {
		"click button" : "click"
	},

	initialize : function() {
		//App.socket.on("lamp", this.change)
	},

	render : function() {

	},

	change: function(d) {
		var imgurl = d.value == "on" ? "/img/lighton.png" : "/img/lightoff.png"
		$(".light").attr("src",imgurl);

	},

	click : function(e) {
		var val = $(e.target).attr("name")
		App.socket.emit('lamp', { value: val });
	}
})

App.views.SparklineView = Backbone.View.extend({
	initialize : function(options) {
		var self = this;

		this.sensor = options && options.sensor ? options.sensor : null;
		console.log("Spark2: Init")

		this.data = [];
		this.width = this.$el.width()

		// X scale will fit values from 0-10 within pixels 0-100
		this.x = d3.scale.linear().domain([0, this.sensor.maxlog]).range([-5, this.width]); // starting point is -5 so the first value doesn't show and slides off the edge as part of the transition
		// Y scale will fit values from 0-10 within pixels 0-100
		this.y = d3.scale.linear().domain([0, 1024]).range([100, 0]);
		
		// create a line object that represents the SVN line we're creating
		this.line = d3.svg.line()
			// assign the X function to plot our line as we wish
			.x(function(d,i) { 
				// verbose logging to show what's actually being done
				//console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
				// return the X coordinate where we want to plot this datapoint
				return self.x(i); 
			})
			.y(function(d) { 
				// verbose logging to show what's actually being done
				//console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
				// return the Y coordinate where we want to plot this datapoint
				return self.y(d.value); 
			})
			.interpolate("basis");



		this.svg = d3.select(this.$el[0]).append("svg")
			.attr("height", 100);

		this.thresholdline = this.svg.append("line")
			.attr("x1", 0)
			.attr("y1", this.y(20))
			.attr("x2", this.width)
			.attr("y2", this.y(20))
			.attr("stroke", "red")
			.attr("stroke-wodth", 2)


			// display the line by appending an svg:path element with the data line we created above
		this.svg.append("svg:path").attr("d", this.line(this.data));


		this.listenTo(this.sensor, "data", this.render, this)

	},

	render : function() {
		var self = this;

		var width = this.$el.width();

		this.x.range([-5, width]);
		this.thresholdline.attr("x2", width);

		var data = this.sensor.getlog()

		this.svg.selectAll("path")
			.data([data]) // set the new data
			.attr("transform", "translate(" + this.x(1) + ")") // set the transform to the right by x(1) pixels (6 for the scale we've set) to hide the new value
			.attr("d", this.line) // apply the new data values ... but the new value is hidden at this point off the right of the canvas
			.transition() // start a transition to bring the new value into view
			.ease("linear")
			//.duration(transitionDelay) // for this demo we want a continual slide so set this to the same as the setInterval amount below
			.attr("transform", "translate(" + this.x(0) + ")"); // animate a slide to the left back to x(0) pixels to reveal the new value

		return this;
	},

})


App.models.Monitor = Backbone.Model.extend({
	url : function() {
		return App.baseurl+"monitor/"+this.id;
	}

});

App.models.Pin = Backbone.Model.extend({

});

App.collections.Pins = Backbone.Collection.extend({
	model:App.models.Pin,
	url: function() {return App.baseurl+"pin"}
})