/*
	Animation statistcs
	Author: charliehw
*/
var ORBIT = ORBIT || {};

ORBIT.Stats = function (system) {

	var time = Date.now(),
		newTime = time,
		counter = 0,
		diff, fps, particles, attractors;

	return {

		update: function () {

			time = newTime;
			newTime = Date.now();
			diff = newTime - time;
			fps = Math.round(1 / (diff / 1000));

			particles = system.particles.length;
			attractors = system.attractors.length;

			if (counter++ === 5) {
				counter = 0;
				document.querySelector('.stats_fps').textContent = fps;
				document.querySelector('.stats_time').textContent = diff + 'ms';
				document.querySelector('.stats_particles').textContent = particles;
				document.querySelector('.stats_attractors').textContent = attractors;
			}

		}

	}

};