window.onload = function () {
	window.ORBIT.system = new ORBIT.ParticleSystem('system', 'overlay');
	window.ORBIT.colourPicker = new ORBIT.ColourPicker({
		id: 'colour_picker',
		gradient: 'colour',
		spectrum: 'spectrum',
		onchange: function (d) {
			ORBIT.system.opts.traceColour = d[0] + ',' + d[1] + ',' + d[2];
		}
	});	
};