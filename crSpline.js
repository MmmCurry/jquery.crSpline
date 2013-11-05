/**
 * crSpline v0.0.1
 * http://github.com/MmmCurry/jquery.crSpline
 *
 * Supports animation along Catmull-Rom splines based on a series of waypoints.
 * Standalone version, no jQuery required.
 * Usage: See demo.js, demo.html
 * 
 * Copyright 2013, M. Ian Graham
 * MIT License
 *
 */

/*exported crSpline*/

var crSpline = (function () {

  // Auto-generate an animation name if one is not specified.
  var autoAnimName = (function () {
    var cssAnimName = 'crSplineAnim';
    var cssAnimNum = 0;

    return function () {
      var res = cssAnimName + cssAnimNum;
      cssAnimNum++;
      return res;
    };
  }());

  // Partial application.
  var partial = function (func) {
    var slice = Array.prototype.slice;
    var restArgs = slice.call(arguments, 1);

    return function () {
      return func.apply(this, restArgs.concat(slice.call(arguments)));
    };
  };

  // Catmull-Rom interpolation between p0 and p1 for previous point pMinus1 and later point p2
  // http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
  var interpolate = function (t, pMinus1, p0, p1, p2) {
    return Math.floor((t * ((2 - t) * t - 1) * pMinus1 +
                       (t * t * (3 * t - 5) + 2) * p0 +
                       t * ((4 - 3 * t) * t + 1) * p1 +
                       (t - 1) * t * t * p2
                      ) / 2);
  };

  // Extend this p1,p2 sequence linearly to a new p3
  var generateExtension = function (p1, p2) {
    return [
      p2[0] + (p2[0] - p1[0]),
      p2[1] + (p2[1] - p1[1])
    ];
  };

  // Generate all spline control points from our initial set of animation waypoints.
  var generateControlPoints = function (animationPoints) {
    var result = [];

    // Generate the first p_1 so the caller doesn't need to provide it
    result.push(generateExtension(animationPoints[1], animationPoints[0]));

    // Throw provided points on the list
    for (var i = 0; i < animationPoints.length; i++) {
      result.push(animationPoints[i]);
    }

    // Generate the last p2 so the caller doesn't need to provide it
    result.push(generateExtension(result[result.length - 2], result[result.length - 1]));

    return result;
  };

  // For the given control points and the given interpolation value (t = 0.0 - 1.0),
  // Return (x, y) coordinates along the CR spline.
  var getCoords = function (controlPoints, t) {
    var numSegments = controlPoints.length - 3;
    // XXX Assume all segments take equal time.
    var segNum = Math.floor(t * numSegments);
    if (segNum === numSegments) {
      return {
        x: controlPoints[controlPoints.length - 2][0],
        y: controlPoints[controlPoints.length - 2][1]
      };
    }
    var microT = (t - segNum / numSegments) * numSegments;
    return {
      x: interpolate(microT,
                     controlPoints[segNum][0],
                     controlPoints[segNum + 1][0],
                     controlPoints[segNum + 2][0],
                     controlPoints[segNum + 3][0]),
      y: interpolate(microT,
                     controlPoints[segNum][1],
                     controlPoints[segNum + 1][1],
                     controlPoints[segNum + 2][1],
                     controlPoints[segNum + 3][1])
    };
  };

  // For the given control points and the given interpolation value (t = 0.0 - 1.0),
  // Return (left, top) px values along the CR spline.
  var getPos = function (controlPoints, t) {
    var coords = getCoords(controlPoints, t);
    return {
      left: coords.x + 'px',
      top: coords.y + 'px'
    };
  };

  
  // For the given control points and the given interpolation value (t = 0.0 - 1.0),
  // Return style string 'P% {left: L; top: T}' for use in CSS keyframes.
  var getKeyframeStyle = function (controlPoints, t) {
    var coords = getCoords(controlPoints, t);
    var percent = 100.0 * t;
    return percent + '% { left:' + coords.x + 'px; top:' + coords.y + 'px; }';
  };

  // For the given control points, generate and insert CSS keyframes.
  // animationName: Optional name for CSS animation in case you care.
  // numFrames: Optional total number of keyframes for the entire sequence.
  var insertKeyframes = function (controlPoints, animationName, numFrames) {
    var maxFrame = numFrames - 1;

    var cssFrames = [];
    cssFrames.push('{');
    for (var i = 0; i <= maxFrame; i++) {
      cssFrames.push(getKeyframeStyle(controlPoints, i / (1.0 * maxFrame)));
    }
    cssFrames.push('}');

    var cssFramesBlob = cssFrames.join('\n');

    var webKitBlob = '@-webkit-keyframes ' + animationName + ' ' + cssFramesBlob;
    var otherBlob = '@keyframes ' + animationName + ' ' + cssFramesBlob;

    var cssBlob = webKitBlob + '\n\n' + otherBlob;

    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    s.appendChild(document.createTextNode(cssBlob));
    head.appendChild(s);
  };

  // For the given control points, insert CSS keyframes and play the animation.
  // elem: DOM element to animate.
  // duration: Total length of animation in milliseconds.
  // easing: Optional easing config (default: linear).
  var playKeyframes = function (controlPoints, animName, elem, duration, easing) {
    easing = easing || 'linear';
    var numSegments = controlPoints.length - 3;
    var numFrames = numSegments * 10;

    insertKeyframes(controlPoints, animName, numFrames);

    elem.style['-webkit-animation'] = animName + ' ' + duration + 'ms ' + easing + ' forwards';
    elem.style.animation = animName + ' ' + duration + 'ms ' + easing + ' forwards';
  };

  // Return an animation object based on a sequence of points
  // pointList must be an array of [x,y] pairs
  var create = function (pointList, animName) {
    if (pointList.length < 2) {
      throw 'crSpline.create requires at least two points';
    }

    var controlPoints = generateControlPoints(pointList);
    animName = animName || autoAnimName();

    return {
      getCoords: partial(getCoords, controlPoints),
      getPos: partial(getPos, controlPoints),
      getKeyframeStyle: partial(getKeyframeStyle, controlPoints),
      insertKeyframes: partial(insertKeyframes, controlPoints),
      playKeyframes: partial(playKeyframes, controlPoints, animName)
    };
  };

  return {
    create: create
  };
}());
