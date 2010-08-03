// Generate a random example spline and fancy visualization to help see what the plugin is doing
DEMO = {
	numSwings: 10,
	maxSwing: 75,
	//numSwings: 10,
	//maxSwing: 100,
	minX: 100,
	minY: 0,
	spawnInterval: 300
	};

DEMO.spawnParticle = function() {
	var currX = Math.floor(Math.random()*(DEMO.maxX-DEMO.minX))+DEMO.minX;
	var deltaY = (DEMO.maxY-DEMO.minY)/DEMO.numSwings;
	var rotate = Math.floor(Math.random()*1080);
	var path = [[currX, DEMO.minY]];
	var dur = Math.floor(Math.random()*6000) + 7000;

	for (var i=0; i<DEMO.numSwings; i++) {
		currX = Math.min(currX + Math.floor((Math.random()-0.5)*DEMO.maxSwing*2), DEMO.maxX);
		path.push([currX, DEMO.minY+deltaY*(i+1)]);
        }

	var elem = $('<img class="mover" src="snowflake_white20.png" />');
	elem.appendTo($(document.body));
	if ($.browser.msie) {
		elem.animate({
			crSpline: $.crSpline.buildSequence(path)
		}, {
			duration: dur,
                        easing: "linear",
                        complete: function () {
                                var that = this;
                                window.setTimeout(function() {
                                        $(that).remove();
                                }, 1000);
                        }
		});
	}
	else {
		elem.rotate3Di(rotate, dur, {});
		elem.animate({
			crSpline: $.crSpline.buildSequence(path),
			rotate3Di: rotate
		     }, {
			duration: dur,
			easing: "linear",
			complete: function () {
				var that = this;
				window.setTimeout(function() {
					$(that).remove();
				}, 1000);
			}
                });
	}
};

DEMO.run = function() {

	DEMO.maxX = $(document).width() - 50;
	DEMO.maxY = $(document).height() - 50;
	
	// Clean up visuals if we've run this once already
	$(".mover").remove();

	window.setInterval(function() {
		DEMO.spawnParticle();
	}, DEMO.spawnInterval);

	
};

$(document).ready(function() {
	DEMO.run();
});
