'use strict';
var ORBIT = ORBIT || {};

ORBIT.Canvas = function (id) {

	this.elem = document.getElementById(id);
	this.context = this.elem.getContext('2d');
	this.height = this.elem.height;
	this.width = this.elem.width;

}

ORBIT.ColourPicker = function (opts) {

	this.elem = document.getElementById(opts.id);
	this.gradient = new this.constructor.Gradient(this, opts.gradient);
	this.spectrum = new this.constructor.Spectrum(this, opts.spectrum);
	this.onchange = opts.onchange;

};

ORBIT.ColourPicker.prototype = {

	constructor: ORBIT.ColourPicker,

	toggleVisibility: function () {
		ORBIT.utils.toggleClass(this.elem, 'visible');
	},

	getColour: function (mode) {
		if (mode === 'data') {
			return this.colour;
		} else {
			return  this.dataToRGB(this.colour);
		}
	},

	updateGradient: function (c) {
		this.gradient.setBaseColour(c);
	},

	dataToRGB: function (d) {
		return 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')';
	},

	setColour: function (c) {
		this.colour = c;
	}

};

ORBIT.ColourPicker.Gradient = function (cp, id) {

	var that = this,
		moveId;
	this.colourPicker = cp;
	this.canvas = new ORBIT.Canvas(id);
	this.baseColour = 'rgb(0, 60, 255)';
	this.render();

	ORBIT.utils.Handler.bind(this.canvas.elem, 'mousedown', function (e) {
		that.update.call(this, e, that);
		moveId = ORBIT.utils.Handler.bind(that.canvas.elem, 'mousemove', function (e) {
			that.update.call(this, e, that);
		});
	});

	ORBIT.utils.Handler.bind(this.canvas.elem, 'mouseup mouseout', function () {
		ORBIT.utils.Handler.unbind(moveId || []);
	});

};

ORBIT.ColourPicker.Gradient.prototype = {

	constructor: ORBIT.ColourPicker.Gradient,

	render: function () {
		var gradient;

		// Solid base colour
		this.canvas.context.fillStyle = this.baseColour;
		this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Vertical transparent to black
		gradient = this.canvas.context.createLinearGradient(0, 0, 0, this.canvas.height);
		gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		gradient.addColorStop(1,   'rgba(0, 0, 0, 1)');

		this.canvas.context.fillStyle = gradient;
		this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Horizontal grey to transparent
		gradient = this.canvas.context.createLinearGradient(0, 0, this.canvas.width, 0);
		gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
		gradient.addColorStop(1,   'rgba(0, 0, 0, 0)');

		this.canvas.context.fillStyle = gradient;
		this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Radial white to transparent
		gradient = this.canvas.context.createRadialGradient(0, 0, 5, 0, 0, this.canvas.height);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
		gradient.addColorStop(1,   'rgba(255, 255, 255, 0)');

		this.canvas.context.fillStyle = gradient;
		this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	},

	sampleColour: function (p) {
		return this.canvas.context.getImageData(p.x, p.y, 1, 1).data;
	},

	setBaseColour: function (c) {
		this.baseColour = c;
		this.render();
	},

	update: function (e, that) {
		var offset = ORBIT.utils.offset(this),
			p = {x: e.pageX - offset.left, y: e.pageY - offset.top},
			d = that.sampleColour(p);
		that.colourPicker.setColour(d);
		if (typeof that.colourPicker.onchange === 'function') {
			that.colourPicker.onchange(d);
		}
	}

};

ORBIT.ColourPicker.Spectrum = function (cp, id) {

	var that = this,
		moveId;
	this.colourPicker = cp;
	this.canvas = new ORBIT.Canvas(id);
	this.render();

	ORBIT.utils.Handler.bind(this.canvas.elem, 'mousedown', function (e) {
		that.update.call(this, e, that);

		moveId = ORBIT.utils.Handler.bind(that.canvas.elem, 'mousemove', function (e) {
			that.update.call(this, e, that);
		});
	});

	ORBIT.utils.Handler.bind(this.canvas.elem, 'mouseup mouseout', function () {
		ORBIT.utils.Handler.unbind(moveId || []);
	});

};

ORBIT.ColourPicker.Spectrum.prototype = {

	constructor: ORBIT.ColourPicker.Spectrum,

	render: function () {
		var gradient = this.canvas.context.createLinearGradient(0, 0, 0, this.canvas.height);
		gradient.addColorStop(0,    'rgb(255,   0,   0)');
		gradient.addColorStop(0.15, 'rgb(255,   0, 255)');
		gradient.addColorStop(0.33, 'rgb(0,     0, 255)');
		gradient.addColorStop(0.49, 'rgb(0,   255, 255)');
		gradient.addColorStop(0.67, 'rgb(0,   255,   0)');
		gradient.addColorStop(0.84, 'rgb(255, 255,   0)');
		gradient.addColorStop(1,    'rgb(255,   0,   0)');

		this.canvas.context.fillStyle = gradient;
		this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	},

	sampleColour: function (p) {
		return this.canvas.context.getImageData(p.x, p.y, 1, 1).data;
	},

	update: function (e, that) {
		var offset = ORBIT.utils.offset(this),
			p = {x: e.pageX - offset.left, y: e.pageY - offset.top},
			d = that.sampleColour(p);
		that.colourPicker.updateGradient(that.colourPicker.dataToRGB(d));
	}

}