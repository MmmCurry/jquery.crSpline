// Generate a random example spline and fancy visualization to help see what the plugin is doing
DEMO = {};

DEMO.run = function() {

	var minX = 200;
	var minY = 200;
	var maxX = $(document).width() - 100;
	var maxY = $(document).height() - 100;

	var numPoints = 10;
	var dotsPerSeg = 50;
	var i;

	var points = [];

	// Make a random list of waypoints for the animation to follow
	for (i=0; i<numPoints; i++) {
		points.push([Math.floor(Math.random()*(maxX-minX))+minX, Math.floor(Math.random()*(maxY-minY))+minY]);
	}

	// -- Important bit #1: Generate the spline animation object --
	var spline = $.crSpline.buildSequence(points);
	
	// Clean up visuals if we've run this once already
	$("#mover").remove();
	$(".waypoint").remove();
	$(".path-dot").remove();

	// Scary-looking stuff to visualize the waypoints and the trail of dots
	// NOT needed for animation
	for (i=0; i<numPoints; i++) {
		$('<div class="waypoint">' + i + '</div>')
			.appendTo($(document.body))
			.css({
				left: points[i][0],
				top: points[i][1]
			});

		for (var j=0; j<dotsPerSeg; j++) {
			var t = (i + j/dotsPerSeg) / points.length;
			var pos = spline.getPos(t);
			$('<div class="path-dot" />')
				.appendTo($(document.body))
				.css({
					left: pos.left,
					top: pos.top
				});
		}
	}

	// -- Important bit #2: Actually animate our mover object. --
	$('<div id="mover" />')
		.appendTo($(document.body))
		.animate({ crSpline: spline }, 20000, function () {
			// Re-run the demo with a new spline after we're done
			window.setTimeout(function() {
				DEMO.run();
			}, 5000);
		});
	
};

$(document).ready(function() {
	DEMO.run();
});
