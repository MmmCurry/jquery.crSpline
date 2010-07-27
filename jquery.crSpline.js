/**
 * jQuery support for animation along Catmull-Rom splines
 * MIT License
 */


(function($){

	$.crSpline = {};

	// Catmull-Rom interpolation between p0 and p1 for previous point p_1 and later point p2
	// http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
	var interpolate = function (t, p_1, p0, p1, p2) {
		return (t * ((2 - t) * t - 1) * p_1 +
			t * t * ((3 * t - 5) + 2) * p0 +
			t * ((4 - 3 * t) * t + 1) * p1 +
			(t - 1) * t * t * p2
			) / 2;
	};

	// Extend this p1,p2 sequence linearly to a new p3
	var generateExtension = function (p1, p2) {
		return [
			p2[0] + (p2[0] - p1[0]),
			p2[1] + (p2[1] - p1[1])
			];
		
	};

	// Return a CSS animation object based on a sequence of points
	// Arguments must be [x,y] pairs
	$.crSpline.buildSequence = function() {
		var res = {};
		var seq = [];
		var numSegments;

		if (arguments.length < 2) {
			throw "crSpline.buildSequence requires at least two points";
		}

		// Generate the first p_1 so the caller doesn't need to provide it
		seq.push(generateExtension(arguments[1], arguments[0]));

		// Throw provided points on the list
		for (var i = 0; i < arguments.length; i++) {
			seq.push(arguments[i]);
		}

		// Generate the last p2 so the caller doesn't need to provide it
		seq.push(generateExtension(seq[seq.length-2], seq[seq.length-1]));

		numSegments = seq.length - 3;

		res.getPos = function (t) {
			// XXX For now, assume all segments take equal time
			var seqNum = Math.floor(t * numSegments);
			if (seqNum === numSegments) {
				return {
					left: seq[seq.length-2][0],
					top: seq[seq.length-2][1]
					};
			}
			var microT = t - seqNum/numSegments;
			return {
				left: interpolate(microT,
						seq[seqNum][0],
						seq[seqNum+1][0],
						seq[seqNum+2][0],
						seq[seqNum+3][0]) + "px",
				top: interpolate(microT,
						seq[seqNum][1],
						seq[seqNum+1][1],
						seq[seqNum+2][1],
						seq[seqNum+3][1]) + "px"
				};
		};
		return res;
	};

	$.fx.step.crSpline = function (fx) {
		var css = fx.end.getPos(fx.pos);
		for (var i in css) {
			fx.elem.style[i] = css[i];
		}
	};

})(jQuery);
