var App = {};
App.views = {};
App.models = {};
App.collections = {};

App.views.Lab = Backbone.View.extend({
	initialize : function() {
		this.mydata = [{x:100, y:100}, {x:200, y:200}];
		this.led1 = new Backbone.Model({x:100, y:100, value:"8345"});
		this.mydata = [this.led1];
		this.svg = d3.select(this.el).append("svg").append("g");
		this.render();
	},

	render : function() {
		var self = this;
		var drag = d3.behavior.drag()
			.on('dragstart', function(d,i) {
				self.svg 
					.append("g")
					.attr("class", "placeholder")
					.append("rect")
					.attr({height:20, width:20})
				console.log("dragstart")
			})
		    .on('drag', function (d,i) {
		        d.set("x", d.get("x") + d3.event.dx);
		        d.set("y", d.get("y") + d3.event.dy);

		        var target = d3.select("rect.placeholder");
		        //target.attr("x", d.get("x")).attr("y", d.get("y"));
		        
		        target.attr("transform", function (d, i) {
		            return "translate(" + [d.get("x"),d.get("y")] + ")";
		        })

	    	});

		this.visor = this.svg.selectAll("g.visor")
			.data(this.mydata)
			.enter()
				.append("g")
				.attr("class", "visor")
				.attr("transform", function (d, i) {
		            return "translate(" + [d.get("x"),d.get("y")] + ")";
		        })
		        .call(drag)

		this.visor.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", function(d) {return 20})
			.attr("width", function(d) {return 20})

		this.visor.append("text")
			.attr("dx", function(d) { return  8; })
      		.attr("dy", 3)
      		.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      		.text(function(d) { return d.get("value"); })
					
	}

})

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


App.models.Sensor2 = Backbone.View.extend({
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

/* 
==============================
* VIEWS
*
*/ 

App.views.Sensor = Backbone.View.extend({

	initialize: function() {
		this.listenTo(this.model, "change", this.render);
		this.template = _.template($("#Sensor_template").html());
		this.render();
	},

	render: function() {
		var self = this;
		var data = this.model.toJSON();
		if (!data.value) data.value=0;

		var html = this.template(data);
		this.$el.html(html);

		return this;
	},

})

App.views.Sensors = Backbone.View.extend({
	initialize: function() {
		this.listenTo(this.collection, "sync", this.render);
	},

	render: function() {
		var self = this;

		this.$el.html("");

		this.collection.each(function(item) {
			var itemview = new App.views.Sensor({model:item});
			self.$el.append(itemview.$el);
		})

		return this;
	}

})


App.views.Led = Backbone.View.extend({
	events : {
		"click" : "click"
	},

	initialize: function() {
		var self = this;

		this.listenTo(this.model, "change", function() {
			self.render();
		});

		this.template = _.template($("#Led_template").html());
		this.render();
	},

	render: function() {
		var self = this;
		var data = this.model.toJSON();
		var html = this.template(data);
		this.$el.html(html);

		return this;
	},

	click: function() {
		var newstate = this.model.get("state") == "on" ? "off" : "on";

		this.model.set("state", newstate);
		this.model.save();
	}


})

App.views.MyLEDs = Backbone.View.extend({
	initialize: function() {
		this.listenTo(this.collection, "sync", this.render);
	},

	render: function() {
		var self = this;

		this.$el.html("");

		this.collection.each(function(d) {
			var ledView = new App.views.Led({model:d});
			self.$el.append(ledView.$el);
		})

		return this;
	}


})

/* ==============================
* MODELS & COLLECTIONS
*
=================================*/ 

App.models.Monitor = Backbone.Model.extend({
	url : function() {
		return App.baseurl+"/monitor/"+this.id;
	}

});

App.models.Pin = Backbone.Model.extend({

});

App.collections.Pins = Backbone.Collection.extend({
	model:App.models.Pin,
	url: function() {return App.baseurl+"/pins"}
})

// Led - Models
App.models.Led = Backbone.Model.extend({
	url: function() {
		return App.baseurl+"/leds/"+this.id;
	},

	turnon: function() {
		this.set("state", "on");
		this.save();
	},

	turnoff: function() {
		this.set("state", "off");
		this.save();
	}
}) 

App.collections.Leds = Backbone.Collection.extend({
	model: App.models.Led,

	url: function() {
		return App.baseurl+"/leds";
	}
}) 

App.collections.Sensors = Backbone.Collection.extend({
	url: function() {
		return App.baseurl+"/sensors"
	}
})

// Auto switch
App.models.Switch = Backbone.Model.extend({
	initialize : function(options) {
		this.sensor = null;
		this.led = null;
		this.set("min", 900);
		this.set("max", 1024);
	},

	setSensor: function(sensor) {
		this.sensor = sensor;
		this.listenTo(this.sensor, "change", this.checkLevel);
	},

	setLed: function(led) {
		this.led = led;
	},

	checkLevel: function() {
		var value = this.sensor.get("value");

		if (value >= this.get("min") && value <= this.get("max")) {
			if (this.led && this.led.get("state") != "on") this.led.turnon();
		} else {
			if (this.led && this.led.get("state") != "off") this.led.turnoff();
		}

		
	}


}) 






