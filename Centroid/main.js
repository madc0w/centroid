maxDepth = 5;
stepInterval = 20;

color1 = {
	h : 0,
	hStep : 0.000001,
	s : 1,
	sStep : 0,
	v : 0.8,
	vStep : 0
};
color2 = {
	h : 0.4,
	hStep : 0.0000012,
	s : 0.8,
	sStep : 0,
	v : 0.5,
	vStep : 0
};
color3 = {
	h : 0.8,
	hStep : 0.0000015,
	s : 0.8,
	sStep : 0,
	v : 0.5,
	vStep : 0
};

function onLoad() {
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	var p1 = randomPoint();
	var p2 = randomPoint();
	var p3 = randomPoint();

	var isDrawing = false;
	setInterval(function() {
		if (isDrawing) {
			console.log("iteraion skipped");
		} else {
			isDrawing = true;
			context.clearRect(0, 0, canvas.width, canvas.height);
			drawRegions(p1, p2, p3);
			movePoint(p1);
			movePoint(p2);
			movePoint(p3);
			isDrawing = false;
		}
	}, stepInterval);
}

function movePoint(p) {
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

function drawRegions(p1, p2, p3, depth) {
	depth = depth || 0;
	var centroid = computeCentroid(p1, p2, p3);
	//	var _distanceSq = distanceSq(centroid, p2);
	//	console.log("_distanceSq", _distanceSq);
	if (depth > maxDepth) {
		stepColor(color1);
		stepColor(color2);
		stepColor(color3);
		drawTriangle(p1, p2, centroid, hsvToRgb(color1));
		drawTriangle(p1, p3, centroid, hsvToRgb(color2));
		drawTriangle(p2, p3, centroid, hsvToRgb(color3));
	} else {
		drawRegions(p1, p2, centroid, depth + 1);
		drawRegions(p1, p3, centroid, depth + 1);
		drawRegions(p2, p3, centroid, depth + 1);
	}
}

function drawTriangle(p1, p2, p3, color) {
	context.beginPath();
	context.fillStyle = color || "#f00";
	context.moveTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);
	context.lineTo(p3.x, p3.y);
	context.closePath();
	context.fill();
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

function stepColor(color) {
	color.h += color.hStep;
	if (color.h > 1) {
		color.hStep *= -1;
		color.h = 2 - color.h;
	} else if (color.h < 0) {
		color.hStep *= -1;
		color.h *= -1;
	}

	color.s += color.sStep;
	if (color.s > 1) {
		color.sStep *= -1;
		color.s = 2 - color.s;
	} else if (color.s < 0) {
		color.sStep *= -1;
		color.s *= -1;
	}

	color.v += color.vStep;
	if (color.v > 1) {
		color.vStep *= -1;
		color.v = 2 - color.v;
	} else if (color.v < 0) {
		color.vStep *= -1;
		color.v *= -1;
	}
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