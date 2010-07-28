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

	for (i=0; i<numPoints; i++) {
		points.push([Math.floor(Math.random()*(maxX-minX))+minX, Math.floor(Math.random()*(maxY-minY))+minY]);
	}

	var spline = $.crSpline.buildSequence.apply(null, points);
	
	$("#mover").remove();
	$(".waypoint").remove();
	$(".path-dot").remove();

	for (i=0; i<numPoints; i++) {
		$('<div class="waypoint">' + i + '</div>')
			.appendTo($(document.body))
			.css({
				left: points[i][0],
				top: points[i][1],
			});

		for (var j=0; j<dotsPerSeg; j++) {
			var t = (i + j/dotsPerSeg) / points.length;
			var pos = spline.getPos(t);
			$('<div class="path-dot"></div>')
				.appendTo($(document.body))
				.css({
					left: pos.left,
					top: pos.top,
				});
		}
	}

	$('<div id="mover"></div>')
		.appendTo($(document.body))
		.css({
			left: points[0][0],
			top: points[0][1],
		})
		.animate({ crSpline: spline }, 20000, function () {
			window.setTimeout(function() {
				DEMO.run();
			}, 5000);
		});
	
};

$(document).ready(function() {
	DEMO.run();
});
