var App = {};
App.views = {};
App.models = {};
App.collections = {};

App.views.Lab = Backbone.View.extend({
	initialize : function(options) {
		this.sensors = options && options.sensors ? options.sensors : new Backbone.Collection();
		this.leds = options && options.leds ? options.leds : new Backbone.Collection();
		this.switch = options && options.switch ? options.switch : new Backbone.Model();

		this.mydata = this.sensors.models;

		this.svg = d3.select(this.el).append("svg")
			.attr("height", 1024)
			.attr("width", "100%")
			.append("g");

		this.render();
		

	},

	render : function() {
		this.sensorView = new App.views.LabSensors({el:this.svg[0][0], collection: this.sensors})
		this.ledView = new App.views.LabLeds({el:this.svg[0][0], collection: this.leds})
		this.switchView = new App.views.LabSwitch({el:this.svg[0][0], model: this.switch})
	},

})

App.views.LabSwitch = Backbone.View.extend({
	initialize : function(options) {
		this.model = this.model ? this.model : new Backbone.Model();

		this.mydata = [this.model];

		_.each(this.mydata,function(d,i) {
			d.set({x:150, y:100+i*50, value:"0"})
		});

		this.svg = d3.select(this.el)

		this.width = 140;
		this.height = 60;

		this.render();

		this.listenTo(this.model, "change", this.update, this)

		this.listenTo(this.model, "change:sensor", function() {
			this.listenTo(this.model.get("sensor"), "change", this.update, this)
		}, this)

		this.listenTo(this.model, "change:led", function() {
			this.listenTo(this.model.get("led"), "change", this.update, this)
		}, this)

	},


	render: function() {
		var self = this;
		var drag = d3.behavior.drag()
		    .on('drag', function (d,i) {
		    	var x = d.get("x") + d3.event.dx;
		    	var y = d.get("y") + d3.event.dy;

		    	d.set("x", x);
		    	d.set("y", y);

		        var target = d3.select(this);

		        target.attr("transform", function (d, i) {
		            return "translate(" + [x,y] + ")";
		        })
	    	})

		this.switches = this.svg.selectAll("g.switch")
			.data(this.mydata,function(d) {
				return d.get("id")
			})

		var newswitches = this.switches.enter()
			.append("g")
			.attr("class", "switch")
			.attr("transform", function (d, i) {
				var x = d.get("x") ? d.get("x") : 150;
				var y = d.get("y") ? d.get("y") : 10+i*55;
				d.set({'x':x, 'y':y});
		        return "translate(" + [x,y] + ")";
		    })
		    .call(drag)

		
		newswitches.append("line")
      		.classed("sensor", true)
     		.attr("stroke-width", 2)
     		.attr("stroke", "black")

      	newswitches.append("line")
      		.classed("led", true)
     		.attr("stroke-width", 2)
     		.attr("stroke", "black")

     	var newswitches_header = newswitches.append("g")

     	newswitches_header
     		.append("rect")
	     		.attr("height", 10)
	     		.attr("width", this.width)
	     		.attr("stroke", "blue")
				.attr("fill", "#DDD")

		newswitches_header	
			.append("text")
				.attr("y", 8)
				.attr("x", this.width/2)
				.attr("font-size", "8px")
				.style("text-anchor",  "middle")
				.text("Switch")

     	var newswitches_body = newswitches.append("g")
     		.attr("transform", function (d, i) {
		        return "translate(" + [0,10] + ")";
		    })


		newswitches_body.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", function(d) {return self.height})
			.attr("width", function(d) {return self.width})
			.attr("stroke", "blue")
			.attr("fill", "cyan")

		newswitches_body.append("text")
			.attr("dx", function(d) { return  2; })
      		.attr("dy", 13)
      		.classed("sensor",true)
      		.style("text-anchor", "start")
      		.text(function(d) { 
      			if (d.get("sensor")) {
      				var sensor = d.get("sensor");
      				var sensorid = sensor.get("id") ? sensor.get("id")  : "0";
      				return "Sensor: "+sensorid;
      			} else {
      				return "Sensor: "+"0"; 
      			}
      			
      		})


		newswitches_body.append("text")
			.attr("dx", 2)
      		.attr("dy", 33)
      		.classed("value",true)
      		.style("text-anchor",  "start")
      		.text(function(d) { 

      			var value = d.get("led") ? d.get("value").get("id") : null;
      			return "Led: "+ value; 
      		})

      	newswitches_body.append("text")
			.attr("dx", 2)
      		.attr("dy", 53)
      		.classed("minmax",true)
      		.style("text-anchor",  "start")
      		.text(function(d) { 
      			var min = d.get("min") ? d.get("min") : 0;      			
      			var max = d.get("max") ? d.get("max") : 0;
      			return "Min: "+ min+" Max: "+max; 
      		})

/*
      	newswitches.append("foreignObject")
      		.attr("x", 2)
      		.attr("y", 75)
      		.attr("width", 200)
      		.attr("height", 40)
      		.classed("input",true)
 		  .append("xhtml:body")
		    .html("<input></input>");
*/

      	this.update();
					
	},

	update : function() {
		var self = this;

		this.switches.select("text.sensor")
     		.text(function(d) { 
      			if (d.get("sensor")) {
      				var sensor = d.get("sensor");
      				var sensorid = sensor.get("id") ? sensor.get("id")  : "0";
      				return "Sensor: "+sensorid;
      			} else {
      				return "Sensor: "+"0"; 
      			}
      			
      		})

      	this.switches.select("text.minmax")
      		.text(function(d) { 
      			var min = d.get("min") ? d.get("min") : 0;      			
      			var max = d.get("max") ? d.get("max") : 0;
      			return "Min: "+ min+" Max: "+max; 
      		})



		this.switches.select("text.value")
      		.text(function(d) { 
      			var value = d.get("led") ? d.get("led").get("id") : null;
      			return "Led: "+ value; 
      		})

      	this.switches.select("line.sensor")
     		.attr("x1", function(d) {
      			if (d.get("sensor")) {
      				var sensor = d.get("sensor");
      				var x = sensor.get("x") ? sensor.get("x")  : "0";
      				return x-d.get("x")+sensor.get("width")/2;
      			} else {
      				return 0; 
      			}
      		})
      		.attr("y1", function(d) {
      			if (d.get("sensor")) {
      				var sensor = d.get("sensor");
      				var y = sensor.get("y") ? sensor.get("y")  : "0";
      				return y-d.get("y")+sensor.get("height")/2;
      			} else {
      				return 0; 
      			}
      		})
      		.attr("x2", function(d) {
      			return 0
      		})
     		.attr("y2", function(d) {
     			return 0
     		})

     	this.switches.select("line.led")
     		.attr("x1", function(d) {
      			if (d.get("led")) {
      				var led = d.get("led");
      				var x = led.get("x") ? led.get("x")  : "0";
      				return x-d.get("x")+led.get("width")/2;
      			} else {
      				return 0; 
      			}
      		})
      		.attr("y1", function(d) {
      			if (d.get("led")) {
      				var led = d.get("led");
      				var y = led.get("y") ? led.get("y")  : "0";
      				return y-d.get("y")+led.get("height")/2;
      			} else {
      				return 0; 
      			}
      		})
      		.attr("x2", function(d) {
      			return 140
      		})
     		.attr("y2", function(d) {
     			return 0
     		})




      	//if (this.model.get("sensor")) this.listenTo(this.model.get("sensor"), "change", this.update, this)
      	//if (this.model.get("led")) thi(s.listenTo(this.model.get("led"), "change", this.update, this)


	},





})

App.views.LabSensors = Backbone.View.extend({
	initialize : function(options) {
		this.collection = this.collection ? this.collection : new Backbone.Collection();

		this.mydata = this.collection.models;

		this.width = 100;
		this.headerheight = 15;
		this.height = 40;
		this.originX = 10;
		this.originY = 10;
		this.space = 10

		_.each(this.mydata,function(d,i) {
			d.set({x:200, y:100+i*50, value:"0"})
		});

		this.svg = d3.select(this.el)
		this.containerWidth = 600;

		this.render();

		this.listenTo(this.collection, "add", this.render, this)
		this.listenTo(this.collection, "sync", this.render, this)
		this.listenTo(this.collection, "change", this.update, this)

		this.formatDecimal = d3.format('.2f')
		this.formatPercentage = d3.format('%')


	},


	render: function() {
		var self = this;
		var drag = d3.behavior.drag()
		    .on('drag', function (d,i) {
		    	var x = d.get("x") + d3.event.dx;
		    	var y = d.get("y") + d3.event.dy;

		    	d.set("x", x);
		    	d.set("y", y);

		        var target = d3.select(this);

		        target.attr("transform", function (d, i) {
		            return "translate(" + [x,y] + ")";
		        })
	    	})

		this.sensors = this.svg.selectAll("g.sensor")
			.data(this.mydata,function(d) {
				return d.get("id")
			})

		var pos = function(i) {
			var columnWith = self.width+self.space;
			var columnHeight = self.height+self.space;

			var columnsPerRow = Math.floor(self.containerWidth / columnWith);
			var row = Math.floor(i / columnsPerRow);
			var column = i % columnsPerRow

			var x = self.originX+column*columnWith;
			var y = self.originY+row*columnHeight;

			return [x,y];
		}

		var newsensors = this.sensors.enter()
			.append("g")
			.attr("class", "sensor")
			.attr("transform", function (d, i) {
				var x = d.get("x") ? d.get("x") : pos(i)[0];
				var y = d.get("y") ? d.get("y") : pos(i)[1];
				d.set({'x':x, 'y':y});
				d.set("width", self.width);
				d.set("height", self.height);
		        return "translate(" + [x,y] + ")";
		    })
		    .call(drag)


    	var newsensors_header = newsensors.append("g")
    		.classed("header", true)

     	newsensors_header
     		.append("rect")
	     		.attr("height", this.headerheight)
	     		.attr("width", this.width)
	     		.attr("stroke", "blue")
				.attr("fill", "#DDD")

		newsensors_header	
			.append("text")
				.attr("y", this.headerheight-2+"px")
				.attr("x", this.width/2)
				.attr("font-size", this.headerheight+"px")
				.style("text-anchor",  "middle")
				.text("Sensor")

     	var newsensors_body = newsensors.append("g")
     		.attr("transform", function (d, i) {
		        return "translate(" + [0,self.headerheight] + ")";
		    })


		newsensors_body.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", function(d) {return self.height-self.headerheight})
			.attr("width", function(d) {return self.width})
			.attr("stroke", "blue")
			.attr("fill", "cyan")

		/*
		newsensors_body.append("text")
			.attr("dx", function(d) { return  2; })
      		.attr("dy", 13)
      		.classed("pin",true)
      		.style("text-anchor", "start")
      		.text(function(d) { return "Pin: "+d.get("id"); })
		*/

		newsensors_body.append("text")
			.attr("dx", this.width/2)
      		.attr("dy", (this.height-this.headerheight-2)+"px")
      		.classed("value",true)
      		.style("text-anchor",  "middle")
      		.attr("font-size", (this.height-this.headerheight)+"px")
      		.text(function(d) { 
      			var value = d.value() ? d.value() : 0;
      			return value; 
      		})

      	this.update();
					
	},

	update : function() {
		var self = this;
		this.sensors.select("text.value")
			.text(function(d) { 
				var value = "";
				switch(d.get("type"))
				{
				case "temp":
				  value = self.formatDecimal(d.value())+" º";
				  break;
				case "light":
				  value = self.formatPercentage(d.value());
				  break;
				default:
				  value = d.value();
				}

      			return value; 
 			})

 		this.sensors.select("g.header")
 			.select("text")
			.text(function(d) { 
      			return d.label();
 			})


	}

})

App.views.LabLeds = Backbone.View.extend({
	initialize : function(options) {
		this.collection = this.collection ? this.collection : new Backbone.Collection();

		this.width = 60;
		this.headerheight = 15;
		this.lampwidth = 20;
		this.height = 50;
		this.originX = 10;
		this.originY = 200;
		this.space = 10

		this.mydata = this.collection.models;

		this.containerWidth = 600;

		this.svg = d3.select(this.el)

		this.render();

		this.listenTo(this.collection, "add", this.render, this)
		this.listenTo(this.collection, "sync", this.render, this)
		this.listenTo(this.collection, "change", this.update, this)

	},


	render: function() {
		var self = this;
		var drag = d3.behavior.drag()
		    .on('drag', function (d,i) {
		    	var x = d.get("x") + d3.event.dx;
		    	var y = d.get("y") + d3.event.dy;

		    	d.set("x", x);
		    	d.set("y", y);

		        var target = d3.select(this);

		        target.attr("transform", function (d, i) {
		            return "translate(" + [x,y] + ")";
		        })
	    	})

	    var pos = function(i) {
			var columnWith = self.width+self.space;
			var columnHeight = self.height+self.space;

			var columnsPerRow = Math.floor(self.containerWidth / columnWith);
			var row = Math.floor(i / columnsPerRow);
			var column = i % columnsPerRow

			var x = self.originX+column*columnWith;
			var y = self.originY+row*columnHeight;

			return [x,y];
		}

		this.leds = this.svg.selectAll("g.led")
			.data(this.mydata,function(d) {
				return d.get("id")
			})

		var newleds = this.leds.enter()
			.append("g")
			.attr("class", "led")
			.attr("transform", function (d, i) {
				var x = d.get("x") ? d.get("x") : pos(i)[0];
				var y = d.get("y") ? d.get("y") : pos(i)[1];
				d.set({'x':x, 'y':y});
				d.set("height", self.height);
				d.set("width", self.width);
		        return "translate(" + [x,y] + ")";
		    })
		    .call(drag)

   		var newleds_header = newleds.append("g")
    		.classed("header", true)

     	newleds_header
     		.append("rect")
	     		.attr("height", this.headerheight)
	     		.attr("width", this.width)
	     		.attr("stroke", "blue")
				.attr("fill", "#DDD")

		newleds_header	
			.append("text")
				.attr("y", this.headerheight-2+"px")
				.attr("x", this.width/2)
				.attr("font-size", this.headerheight+"px")
				.style("text-anchor",  "middle")
				.text("Led")

     	var newleds_body = newleds.append("g")
     		.attr("transform", function (d, i) {
		        return "translate(" + [0,self.headerheight] + ")";
		    })

		newleds_body.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", function(d) {return self.height-self.headerheight})
			.attr("width", function(d) {return self.width})
			.attr("stroke", "blue")
			.attr("fill", "cyan")

/*
		newleds_body.append("text")
			.attr("dx", function(d) { return  2; })
      		.attr("dy", 13)
      		.classed("pin",true)
      		.style("text-anchor", "start")
      		.text(function(d) { return "Pin: "+d.get("id"); })
      		*/


		newleds_body.append("text")
			.attr("dx", (this.width-this.lampwidth)/2)
      		.attr("dy", (this.height-this.headerheight-2)+"px")
      		.classed("state",true)
      		.attr("font-size", (this.height-this.headerheight)+"px")
      		.style("text-anchor",  "middle")
      		.text(function(d) { 
      			var state = d.get("state") ? d.get("state") : 0;
      			return state; 
      		})

      	newleds_body.append("image")
      		.attr("xlink:href", function(d) {
      			var state = d.get("on") ? "on" : "off";
      			return "./img/light"+state+".png"
      		})
      		.attr("x", this.width- this.lampwidth)
			.attr("y", 0)
			.attr("height",  this.height-this.headerheight)
			.attr("width",  this.lampwidth)
			.on("click", function(d,i) {
				// Toggle between on/off state of the Led
				if (d.get("on") == false) {
					d.set("on", true)
				} else {
					d.set("on", false)
				}
				d.save();
			})

      	this.update();
					
	},

	update : function() {
		this.leds.select("text.state")
			.text(function(d) { 
      			var state = d.get("on") ? "on" : "off";
      			return state
 			})

		this.leds.select("image")
      		.attr("xlink:href", function(d) {
     			var state = d.get("on") ? "on" : "off";
      			return "./img/light"+state+".png"
       		})

		this.leds.select("g.header")
 			.select("text")
			.text(function(d) { 
     			var value = d.get("id") ? d.get("id") : 0;
      			return "Led ("+ value+")"; 
 			})


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
	url: function() {return App.baseurl+"/api/pins"}
})

// Led - Models
App.models.Led = Backbone.Model.extend({
	url: function() {
		return App.baseurl+"/api/leds/"+this.id;
	},

	turnon: function() {
		this.set("on", true);
		this.save();
	},

	turnoff: function() {
		this.set("on", false);
		this.save();
	}
}) 

App.collections.Leds = Backbone.Collection.extend({
	model: App.models.Led,

	url: function() {
		return App.baseurl+"/api/leds";
	}
}) 

App.models.Sensor = Backbone.Model.extend({
	defaults: {
		scale : [0,1024],
		type: null
	},

	setScale: function(range) {
		this.set("scale", range)
	},

	setType: function(type) {
		this.set("type", type)
		switch(this.get("type"))
			{
			case "temp":
			  this.set("scale", [0,500])
			  break;
			case "light":
			  this.set("scale", [0,500])
			  break;
			default:
			  this.set("scale", [0,1024])
			}

	},

	label : function() {
		switch(this.get("type"))
			{
			case "temp":
			  return "Temperature"
			  break;
			case "light":
			  return "Light"
			  break;
			case "humidity":
			  return "Humidity"
			  break;
			default:
			  return "Sensor "+this.get("id");
			}
	},

	value: function() {
		var value = this.get("value");


		switch(this.get("type"))
			{
			case "temp":
			  return this.scale(value, [0,500], [0,1024])
			  break;
			case "light":
			  return this.scale(value, [0,1], [0,500])
			  break;
			default:
			  return value
			}
	},

	scale: function(value, range, domain) {
		var rmin = range[0];
		var rmax = range[1];

		var dmin = domain[0];
		var dmax = domain[1];

		value = value > dmax ? dmax : value;
		value = value < dmin ? dmin : value;

		var scaledValue = rmin + (rmax-rmin)*(value-dmin)/(dmax-dmin)

		return scaledValue;

	}


})

App.collections.Sensors = Backbone.Collection.extend({
	model: App.models.Sensor,

	url: function() {
		return App.baseurl+"/api/sensors"
	}
})

// Auto switch
App.models.Switch = Backbone.Model.extend({
	initialize : function(options) {
		this.sensor = null;
		this.led = null;
		this.set("min", 1000);
		this.set("max", 1024);
	},

	setSensor: function(sensor) {
		this.set("sensor",sensor);
		this.listenTo(sensor, "change", this.checkLevel);
		this.checkLevel();
	},

	setLed: function(led) {
		this.set("led", led);
	},

	checkLevel: function() {
		var value = this.get("sensor").value();

		if (this.get("sensor").get("type")=="light") {
			value = value*100
		}

		if (value >= this.get("min") && value <= this.get("max")) {
			if (this.get("led") && this.get("led").get("state") != "on") this.get("led").turnon();
		} else {
			if (this.get("led") && this.get("led").get("state") != "off") this.get("led").turnoff();
		}

		
	}


}) 






