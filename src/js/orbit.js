'use strict';
var ORBIT = ORBIT || {};

ORBIT.opts = {
	mass: 0.2,
	radius: 5,
	attractorRadius: 10,
	traceLength: 100,
	traceGradient: 100,
	drawTrace: true,
	drawingMode: false,
	drawParticles: true,
	drawAcceleration: true,
	drawVelocity: true,
	drawAttractors: true,
	animate: true,
	globalSpeed: 1
};

ORBIT.ParticleSystem = function (id, overlay, opts) {

	this.opts = ORBIT.utils.extend(ORBIT.opts, opts)
	this.initCanvas(id); // This canvas will contain traces
	this.initOverlay(overlay); // This canvas will contain elements that need to be updated constantly
	this.particles = [];
	this.attractors = [];
	this.userInterface = new ORBIT.ParticleSystem.UserInterface(this);
	this.stats = new ORBIT.Stats(this);
	this.addAttractor({displacement: this.mid});
	this.animate();

};

ORBIT.ParticleSystem.prototype = {

	constructor: ORBIT.ParticleSystem,

	initCanvas: function (id) {
		this.canvas = document.getElementById(id);
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.mid = {x: this.canvas.width/2, y: this.canvas.height/2};
		this.context = this.canvas.getContext('2d');
	},

	initOverlay: function (id) {
		this.overlayCanvas = document.getElementById(id);
		this.overlayCanvas.width = this.canvas.width;
		this.overlayCanvas.height = this.canvas.height;
		this.overlayContext = this.overlayCanvas.getContext('2d');
	},

	animate: function () {
		var that = this;
		if (this.opts.animate) {
			this.overlayContext.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
			if (!this.opts.drawingMode) {
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}
			this.draw();
			this.updateParticles();
		}
		that.stats.update();
		ORBIT.utils.requestAnimationFrame.call(window, function () {
			that.animate.call(that);
		});
		
	},

	draw: function () {
		this.drawAttractors();
		this.drawPlaceholder();
		this.drawParticles();
	},

	addParticle: function (opts) {
		this.particles.push(new ORBIT.ParticleSystem.Particle(this, opts || {}));
	},

	addSuperParticle: function (opts) {
		var p = new ORBIT.ParticleSystem.Particle(this, opts || {});
		this.particles.push(p);
		this.attractors.push(p);
	},

	popParticle: function () {
		this.particles.pop();
	},

	clearParticles: function () {
		this.particles = [];
	},

	updateParticles: function () {
		for (var i = 0, l = this.particles.length; i < l; i++) {
			this.particles[i].update();
		}
	},

	drawParticles: function () {
		for (var i = 0, l = this.particles.length; i < l; i++) {
			this.particles[i].draw();
		}
	},

	addAttractor: function (opts) {
		this.attractors.push(new ORBIT.ParticleSystem.Attractor(this, opts || {}));
	},

	popAttractor: function () {
		this.attractors.pop();
	},

	drawAttractors: function () {
		for (var i = 0, l = this.attractors.length; i < l; i++) {
			this.attractors[i].draw();
		}
	},

	drawPlaceholder: function () {
		var placeholderPoints = this.userInterface.placeholderPoints;
		if (placeholderPoints.length > 0) {
			var p = placeholderPoints[placeholderPoints.length - 1];
			this.overlayContext.beginPath();
			this.overlayContext.arc(p.x, p.y, this.opts.radius, 0, Math.PI*2, true);
			this.overlayContext.closePath();
			this.overlayContext.fill();
		}
	},

	clearTraces: function () {
		for (var i = 0, l = this.particles.length; i < l; i++) {
			this.particles[i].traceStream = [];
		}
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	toggleExtras: function () {
		this.opts.drawParticles = !this.opts.drawParticles;
		this.opts.drawAcceleration = !this.opts.drawAcceleration;
		this.opts.drawVelocity = !this.opts.drawVelocity;
		this.opts.drawAttractors = !this.opts.drawAttractors;
	}

};

ORBIT.ParticleSystem.Particle = function (system, opts) {

	this.system = system;
	this.displacement = opts.displacement || {x: 200, y: 200};
	this.velocity = opts.velocity || {x: 3, y: 3};
	this.acceleration = {x: 0, y: 0};
	this.traceStream = [];
	this.traceColour = opts.traceColour || '204,204,204';

};

ORBIT.ParticleSystem.Particle.prototype = {

	constructor: ORBIT.ParticleSystem.Particle,

	draw: function () {
		if (this.system.opts.drawTrace || this.system.opts.drawingMode) {
			this.drawTrace();
		}
		if (this.system.opts.drawAcceleration) {
			this.drawAcceleration();
		}
		if (this.system.opts.drawVelocity) {
			this.drawVelocity();
		}
		if (this.system.opts.drawParticles) {
			this.system.overlayContext.beginPath();
			this.system.overlayContext.arc(this.displacement.x, this.displacement.y, this.system.opts.radius, 0, 2*Math.PI, true);
			this.system.overlayContext.closePath();
			this.system.overlayContext.fillStyle = 'black';
			this.system.overlayContext.fill();
		}
	},

	update: function () {
		var acceleration = {x: 0, y: 0},
			vector, g;

		for (var i = 0, l = this.system.attractors.length; i < l; i++) {
			if (this.system.attractors[i] === this) {
				// Make sure it's not being attracted to itself in the case of superparticles
				continue;
			}
			vector = {
				x: (this.displacement.x - this.system.attractors[i].displacement.x) || 1, 
				y: (this.displacement.y - this.system.attractors[i].displacement.y) || 1
			};

			// acceleration due to gravity g = -GM/r^2
			g = - this.system.opts.mass / Math.pow((vector.x * vector.x + vector.y * vector.y), 0.5);
			acceleration.x += vector.x * g;
			acceleration.y += vector.y * g;
		}
		this.acceleration = acceleration;

		this.velocity = {x: this.velocity.x + this.system.opts.globalSpeed * this.acceleration.x, y: this.velocity.y + this.system.opts.globalSpeed * this.acceleration.y};
		this.displacement = {x: this.displacement.x + this.velocity.x, y: this.displacement.y + this.velocity.y};
		this.traceStream.push(this.displacement);
	},

	drawVelocity: function () {
		this.drawLineFromParticle({x: this.velocity.x*5, y: this.velocity.y*5}, 'green');
	},

	drawAcceleration: function () {
		this.drawLineFromParticle({x: this.acceleration.x*100, y: this.acceleration.y*100}, 'red');
	},

	drawLineFromParticle: function (end, colour) {
		this.system.overlayContext.beginPath();
		this.system.overlayContext.moveTo(this.displacement.x, this.displacement.y);
		this.system.overlayContext.lineTo(this.displacement.x + end.x, this.displacement.y + end.y);
		this.system.overlayContext.strokeStyle = colour;
		this.system.overlayContext.stroke();
		this.system.overlayContext.closePath();
	},

	drawTrace: function () {
		var traceStream = this.traceStream,
			i = this.system.opts.drawingMode ? traceStream.length - 2 : 0;
		if (traceStream.length > 1) {
			for (var l = traceStream.length; i < l - 1; i++) {
				this.system.context.beginPath();
				this.system.context.moveTo(traceStream[i].x, traceStream[i].y);
				this.system.context.lineTo(traceStream[i + 1].x, traceStream[i + 1].y);
				if (i/this.system.opts.traceGradient > 1) {
					this.system.context.strokeStyle = 'rgba(' + this.traceColour + ',1)';
				} else { // Fade the stroke color
					this.system.context.strokeStyle = 'rgba(' + this.traceColour + ',' + i/this.system.opts.traceGradient + ')';
				}
				this.system.context.stroke();
				this.system.context.closePath();
			}
			// Truncate the trace stream if it's too long
			if (traceStream.length > this.system.opts.traceLength) {
				this.traceStream = traceStream.slice(traceStream.length - this.system.opts.traceLength, traceStream.length - 1);
			}
		}
	}

};

ORBIT.ParticleSystem.Attractor = function (system, opts) {

	this.system = system;
	this.displacement = opts.displacement || this.system.mid;
	this.staticAttractor = true;

};

ORBIT.ParticleSystem.Attractor.prototype = {

	constructor: ORBIT.ParticleSystem.Attractor,

	draw: function () {
		if (this.system.opts.drawAttractors) {
			this.system.overlayContext.beginPath();
			this.system.overlayContext.arc(this.displacement.x, this.displacement.y, this.system.opts.attractorRadius, 0, 2*Math.PI, true);
			this.system.overlayContext.closePath();
			this.system.overlayContext.fillStyle = 'black';
			this.system.overlayContext.fill();
		}
	},

	moveTo: function (p) {
		this.displacement = p;
	},

	destroy: function () {
		this.system.attractors.splice(this.system.attractors.indexOf(this), 1);
	}

};

ORBIT.ParticleSystem.UserInterface = function (system) {

	var that = this;

	this.system = system;
	this.placeholderPoints = [];
	ORBIT.utils.Handler.bind(this.system.overlayCanvas, 'mousedown touchstart', function (e) {
		var p = that.getEventPosition(e),
			attractor = that.attractorClicked(p),
			moveId, upId; // these will contain arrays of id references to the mousemove, touchmove and mouseup, touchend event handlers

		e.preventDefault();

		if (attractor) { // user has clicked on an attractor
			if (e.button === 1) {
				return attractor.destroy();
			}
			moveId = ORBIT.utils.Handler.bind(that.system.overlayCanvas, 'mousemove touchmove', function (e) {
				that.eventHandler.mousemoveAttractor.call(that, e, attractor);
			});
			upId = ORBIT.utils.Handler.bind(that.system.overlayCanvas, 'mouseup touchend', function (e) {
				ORBIT.utils.Handler.unbind(upId, moveId);
			});	
		} else {
			that.placeholderPoints.push(p);
			moveId = ORBIT.utils.Handler.bind(that.system.overlayCanvas, 'mousemove touchmove', function (e) {
				that.eventHandler.mousemoveParticle.call(that, e);
			});
			upId = ORBIT.utils.Handler.bind(that.system.overlayCanvas, 'mouseup touchend', function (e) {
				var v = that.getVelocity(),
					p = that.getEventPosition(e),
					ev = new CustomEvent('particleadded', {
						position: p,
						bubbles: false,
						cancelable: false
					});
				that.system.addParticle({velocity: v, displacement: p, traceColour: that.system.opts.traceColour});
				document.body.dispatchEvent(ev);
				ORBIT.utils.Handler.unbind(upId, moveId);
			});
		}
	});

	this.controls = new ORBIT.ParticleSystem.UserInterface.Controls(this.system);

	this.initTooltips();

};

ORBIT.ParticleSystem.UserInterface.prototype = {

	constructor: ORBIT.ParticleSystem.UserInterface,

	eventHandler: {

		mousemoveParticle: function (e) {
			var p = this.getEventPosition(e);
			this.placeholderPoints.push(p);
		},

		mousemoveAttractor: function (e, attractor) {
			var p = this.getEventPosition(e);
			attractor.moveTo(p);
		}

	},

	getEventPosition: function (e) {
		if (e.changedTouches) {
			return {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY};
		} else {
			return {x: e.pageX, y: e.pageY};
		}
	},

	attractorClicked: function (p) {
		var attractor, i, l;
		for (i = 0, l = this.system.attractors.length; i < l; i++) {
			attractor = this.system.attractors[i];
			if (attractor.staticAttractor) {
				// Equation for circle: (x-a)^2 + (y-b)^2 = r^2
				if (Math.pow((p.x - attractor.displacement.x), 2) + 
					Math.pow((p.y - attractor.displacement.y), 2) < 
					Math.pow(this.system.opts.attractorRadius, 2)) {
					return attractor;
				}
			}
		}
		return false;
	},

	getVelocity: function () {
		// Calculate velocity of the drag
		// Only using the last 2 points in the drag - could be improved
		if (this.placeholderPoints.length > 1) { 
			var length = this.placeholderPoints.length,
				velocityX = this.placeholderPoints[length-1].x - this.placeholderPoints[length-2].x,
				velocityY = this.placeholderPoints[length-1].y - this.placeholderPoints[length-2].y,
				v = {x: velocityX, y: velocityY};
		} else {
			var v = {x: 0, y: 0};
		}

		this.placeholderPoints = [];
		return v;
	},

	initTooltips: function () {

		var that = this,
			particleTooltip = new ORBIT.Tooltip({x:200, y:200}, 'Click and drag anywhere to create a particle.'),
			paId;

		paId = ORBIT.utils.Handler.bind(document.body, 'particleadded', function () {
			particleTooltip.destroy();
			ORBIT.utils.Handler.unbind(paId);
		});
		window.setTimeout(function () {
			new ORBIT.Tooltip(that.system.mid, 'Click and drag to move the attractor.');
		}, 4000);
		window.setTimeout(function () {
			new ORBIT.Tooltip(that.system.mid, 'Add more attractors from the menu (+) or remove them with middle click.', 6000);
		}, 12000);


	}

};

ORBIT.ParticleSystem.UserInterface.Controls = function (system) {

	var that = this;
	this.system = system;

	ORBIT.utils.Handler.bind(document.querySelector('.play_pause'), 'click', function (e) {
		e.preventDefault();
		if (that.system.opts.animate) {
			this.getElementsByTagName('img')[0].src = 'img/play.png';
		} else {
			this.getElementsByTagName('img')[0].src = 'img/pause.png';
		}
		that.system.opts.animate = !that.system.opts.animate;
		return false;
	});

	ORBIT.utils.Handler.bind(document.querySelector('.draw'), 'click', function (e) {
		e.preventDefault();
		ORBIT.utils.toggleClass(this, 'active');
		that.system.opts.drawingMode = !that.system.opts.drawingMode;
	});

	ORBIT.utils.Handler.bind(document.querySelector('.clear'), 'click', function (e) {
		e.preventDefault();
		that.system.clearTraces();
	});

	ORBIT.utils.Handler.bind(document.querySelector('.clear_particles'), 'click', function (e) {
		e.preventDefault();
		that.system.clearParticles();
	});

	ORBIT.utils.Handler.bind(document.querySelector('.toggle_extras'), 'click', function (e) {
		e.preventDefault();
		ORBIT.utils.toggleClass(this, 'active');
		that.system.toggleExtras();
	});

	ORBIT.utils.Handler.bind(document.querySelector('.add_attractor'), 'click', function (e) {
		e.preventDefault();
		that.system.addAttractor();
	});

	ORBIT.utils.Handler.bind(document.querySelector('.view_stats'), 'click', function (e) {
		e.preventDefault();
		ORBIT.utils.toggleClass(this, 'active');
		ORBIT.utils.toggleClass(document.getElementById('stats'), 'visible');
	});

	ORBIT.utils.Handler.bind(document.querySelector('.save'), 'click', function (e) {
		e.preventDefault();
		window.open(that.system.canvas.toDataURL("image/png"));
	});

	ORBIT.utils.Handler.bind(document.querySelector('.colour_picker'), 'click', function (e) {
		e.preventDefault();
		ORBIT.utils.toggleClass(this, 'active');
		ORBIT.colourPicker.toggleVisibility();
	});

};

ORBIT.Tooltip = function (p, msg, t) {

	var tooltip = document.createElement('div'),
		time, exists = true;

	function destroy() {
		tooltip.className = 'tooltip';
		window.clearTimeout(time);
		window.setTimeout(function () {
			if (exists) {
				exists = false;
				document.body.removeChild(tooltip);
			}
		}, 1000);
	}

	tooltip.className = 'tooltip';
	tooltip.textContent = msg;
	tooltip.style.left = p.x + 'px';
	tooltip.style.top = p.y + 'px';
	document.body.appendChild(tooltip);
	window.setTimeout(function () {
		tooltip.className += ' visible';
	}, 100);

	time = window.setTimeout(function () {
		destroy();
	}, t || 3000);

	return {

		destroy: destroy

	}

};

ORBIT.utils = {};
// Interface for binding and unbinding event handlers
ORBIT.utils.Handler = (function () {

	var n = 1,
        listeners = {};

	return {
		bind: function (element, event, handler) {
			var events = event.split(' '),
				ids = [],
				i, l;
			for (i = 0, l = events.length; i < l; i++) {
				element.addEventListener(events[i], handler);
	            listeners[n] = {
	            	element: element,
	            	event: events[i],
	            	handler: handler
	            };
	            ids.push(n++);
			}
            return ids;
		},

		unbind: function () {
			var ids;
			for (var j = 0, k = arguments.length; j < k; j++) {
				ids = arguments[j];
				for (var i = 0, l = ids.length; i < l; i++) {
					if (ids[i] in listeners) {
		                var h = listeners[ids[i]];
		                h.element.removeEventListener(h.event, h.handler);
		            }
		        }
			}
		}
	}

}());

// Utility function for basic object extending
ORBIT.utils.extend = function (target, other) {
	target = target || {};
	other = other || {};
	for (name in other) {
		target[name] = other[name];
	}
	return target;
};

ORBIT.utils.toggleClass = function (element, c) {
	var classes = element.className.split(' ');
	if (classes.indexOf(c) > -1) {
		// remove from array
		classes.splice(classes.indexOf(c), 1);
	} else {
		classes.push(c);
	}
	element.className = classes.join(' ');
};

ORBIT.utils.inArray = function (item, array) {
	var l = array.length;
	while (l--) {
		if (array[l] === item) {
			return true;
		}
	}
	return false;
};

ORBIT.utils.offset = function (elem) {
	var offset = {
		left: elem.offsetLeft,
		top: elem.offsetTop
	};
	while (elem = elem.offsetParent) {
		offset.left += elem.offsetLeft;
		offset.top += elem.offsetTop;
	}
	return offset;
}

// Utilitise requestAnimationFrame
ORBIT.utils.requestAnimationFrame = (function () {
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
}());