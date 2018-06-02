isRotatingPointMotion = true;
maxDepth = 4;
stepInterval = 2;
angles = {};
t = 0;
colors = [
	{
		h : 0,
		hStep : 0.000001,
		s : 1,
		sStep : 0,
		v : 0.8,
		vStep : 0
	},
	{
		h : 0.4,
		hStep : 0.0000012,
		s : 0.8,
		sStep : 0,
		v : 0.5,
		vStep : 0
	},
	{
		h : 0.8,
		hStep : 0.0000015,
		s : 0.8,
		sStep : 0,
		v : 0.5,
		vStep : 0
	}
];


function onLoad() {
	typeSelect = document.getElementById("type-select");
	typeChanged();
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	var p1,
		p2,
		p3;
	if (isRotatingPointMotion) {
		p1 = {
			center : {
				x : canvas.width / 4,
				y : canvas.height / 4,
			},
			angle : 0,
			angleVel : 0.08 * (Math.random() - 0.5),
			r : canvas.width / 4,
		};
		p2 = {
			center : {
				x : canvas.width * 3 / 4,
				y : canvas.height / 4,
			},
			angle : 0,
			angleVel : 0.08 * (Math.random() - 0.5),
			r : canvas.width / 4,
		};
		p3 = {
			center : {
				x : canvas.width / 2,
				y : canvas.height * 3 / 4,
			},
			angle : 0,
			angleVel : 0.08 * (Math.random() - 0.5),
			r : canvas.width / 4,
		};
	} else {
		p1 = randomPoint();
		p2 = randomPoint();
		p3 = randomPoint();
	}

	var isDrawing = false;
	setInterval(function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		movePoint(p1);
		movePoint(p2);
		movePoint(p3);
		drawRegions(p1, p2, p3);
		t++;
	}, stepInterval);
}

function movePoint(p) {
	if (isRotatingPointMotion) {
		p.x = p.center.x + p.r * Math.cos(p.angle);
		p.y = p.center.y + p.r * Math.sin(p.angle);
		p.angle += p.angleVel;
	} else {
		p.x += p.xvel;
		if (p.x < 0) {
			p.x = -p.x;
			p.xvel = -p.xvel;
		} else if (p.x > canvas.width) {
			p.x = 2 * canvas.width - p.x;
			p.xvel = -p.xvel;
		}

		p.y += p.yvel;
		if (p.y < 0) {
			p.y = -p.y;
			p.yvel = -p.yvel;
		} else if (p.y > canvas.height) {
			p.y = 2 * canvas.height - p.y;
			p.yvel = -p.yvel;
		}
	}
}

function drawRegions(p1, p2, p3, id) {
	if (type == "fractal") {
		var vertices = [ p1, p2, p3 ];
		var p = vertices[Math.floor(Math.random() * vertices.length)];
		for (var j = 0; j < 2000; j++) {
			var i = Math.floor(Math.random() * vertices.length);
			var target = vertices[i];
			var mid = {
				x : (p.x + target.x) / 2,
				y : (p.y + target.y) / 2
			};
			drawPoint(mid, 1, colors[i]);
			p = mid;
			stepColor(colors[i]);
		}
	} else {
		id = id || "";
		if (type == "centroid") {
			var c = computeCentroid(p1, p2, p3);
		} else if (type == "incenter" || type == "random-incenter") {
			var c = computeIncenter(p1, p2, p3);
			if (type == "random-incenter") {
				if (!angles[id]) {
					angles[id] = {
						vel : 0.1 * (Math.random() - 0.5),
						a : 0,
						rFactor : 0.4 + (Math.random() * 0.5),
					};
				}
				angle = angles[id];
				c = {
					x : c.x + c.r * angle.rFactor * Math.cos(angle.a),
					y : c.y + c.r * angle.rFactor * Math.sin(angle.a),
				};
				angle.a += angle.vel;
			}
		}

		//	var c = computeCentroid(p1, p2, p3);
		//	var _distanceSq = distanceSq(centroid, p2);
		//	console.log("_distanceSq", _distanceSq);
		if (id.length > maxDepth) {
			stepColor(colors[0]);
			stepColor(colors[1]);
			stepColor(colors[2]);
			drawTriangle(p1, p2, c, colors[0]);
			drawTriangle(p1, p3, c, colors[1]);
			drawTriangle(p2, p3, c, colors[2]);
		} else {
			drawRegions(p1, p2, c, id + "1");
			drawRegions(p1, p3, c, id + "2");
			drawRegions(p2, p3, c, id + "3");
		}
	}
}

function drawPoint(p, r, color) {
	context.beginPath();
	if (color) {
		color = hsvToRgb(color);
	}
	context.fillStyle = color || "#f00";
	context.arc(p.x, p.y, r || 4, 0, 2 * Math.PI);
	context.fill();
}

function drawTriangle(p1, p2, p3, color) {
	context.beginPath();
	if (color) {
		color = hsvToRgb(color);
	}
	context.fillStyle = color || "#f00";
	context.moveTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);
	context.lineTo(p3.x, p3.y);
	context.closePath();
	context.fill();
}

function computeIncenter(p1, p2, p3) {
	var a = Math.sqrt(distanceSq(p1, p2));
	var b = Math.sqrt(distanceSq(p1, p3));
	var c = Math.sqrt(distanceSq(p2, p3));
	var sumDist = a + b + c;
	return {
		x : ((a * p3.x) + (b * p2.x) + (c * p1.x)) / sumDist,
		y : ((a * p3.y) + (b * p2.y) + (c * p1.y)) / sumDist,
		r : Math.sqrt((b + c - a) * (c + a - b) * (a + b - c) / sumDist) / 2
	};
}


function computeCentroid(p1, p2, p3) {
	var mid1 = {
		x : (p1.x + p2.x) / 2,
		y : (p1.y + p2.y) / 2
	};
	var mid2 = {
		x : (p1.x + p3.x) / 2,
		y : (p1.y + p3.y) / 2
	};
	var m1 = (mid1.y - p3.y) / (mid1.x - p3.x);
	var m2 = (mid2.y - p2.y) / (mid2.x - p2.x);

	var b1 = p3.y - (m1 * p3.x);
	var b2 = p2.y - (m2 * p2.x);

	var centroid = {
		x : (p2.y - p3.y + (m1 * p3.x) - (m2 * p2.x)) / (m1 - m2),
		y : m1 * (p2.y - p3.y + (m1 * p3.x) - (m2 * p2.x)) / (m1 - m2) + p3.y - (m1 * p3.x)
	};
	return centroid;
}

function distanceSq(p1, p2) {
	var dx = p1.x - p2.x;
	var dy = p1.y - p2.y;
	return (dx * dx) + (dy * dy);
}

function randomPoint() {
	return {
		x : Math.random() * canvas.width,
		y : Math.random() * canvas.height,
		xvel : 8 * (Math.random() - 0.5),
		yvel : 8 * (Math.random() - 0.5),
	};
}

function stepColor(color, factor) {
	factor = factor || 1;
	color.h += color.hStep * factor;
	if (color.h > 1) {
		color.hStep *= -1;
		color.h = 2 - color.h;
	} else if (color.h < 0) {
		color.hStep *= -1;
		color.h *= -1;
	}

	color.s += color.sStep * factor;
	if (color.s > 1) {
		color.sStep *= -1;
		color.s = 2 - color.s;
	} else if (color.s < 0) {
		color.sStep *= -1;
		color.s *= -1;
	}

	color.v += color.vStep * factor;
	if (color.v > 1) {
		color.vStep *= -1;
		color.v = 2 - color.v;
	} else if (color.v < 0) {
		color.vStep *= -1;
		color.v *= -1;
	}
}


function typeChanged() {
	type = typeSelect.selectedOptions[0].value;
}


/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function hsvToRgb(h, s, v) {
	var r,
		g,
		b,
		i,
		f,
		p,
		q,
		t;
	if (arguments.length === 1) {
		s = h.s, v = h.v, h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
	case 0:
		r = v, g = t, b = p;
		break;
	case 1:
		r = q, g = v, b = p;
		break;
	case 2:
		r = p, g = v, b = t;
		break;
	case 3:
		r = p, g = q, b = v;
		break;
	case 4:
		r = t, g = p, b = v;
		break;
	case 5:
		r = v, g = p, b = q;
		break;
	}
	r = Math.round(r * 255).toString(16);
	if (r.length < 2) {
		r = "0" + r;
	}
	g = Math.round(g * 255).toString(16);
	if (g.length < 2) {
		g = "0" + g;
	}
	b = Math.round(b * 255).toString(16);
	if (b.length < 2) {
		b = "0" + b;
	}
	return "#" + r + g + b;
}
