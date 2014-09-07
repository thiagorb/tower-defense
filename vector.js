Vector = function (x, y) {
	this.x = x;
	this.y = y;
};

Vector.norm = function (v) {
	return Math.sqrt(Vector.norm2(v));
};

Vector.norm2 = function (v) {
	return v.x * v.x + v.y * v.y;
};

Vector.scale = function (v, factor) {
	v.x *= factor;
	v.y *= factor;
	return v;
};

Vector.addTo = function (a, b) {
	b.x += a.x;
	b.y += a.y;
	return b;
};
Vector.subFrom = function (a, b) {
	b.x -= a.x;
	b.y -= a.y;
	return b;
};

Vector.copy = function (v) {
	return { x: v.x, y: v.y };
};

Vector.equals = function (a, b) {
	return a.x == b.x && a.y == b.y;
};

Vector.round = function (v) {
	v.x = Math.round(v.x);
	v.y = Math.round(v.y);
	return v;
};

Vector.scalarProduct = function (a, b) {
	return a.x * b.x + a.y * b.y;
};

Vector.project = function (a, b) {
	var factor = Vector.scalarProduct(a, b) / Vector.scalarProduct(b, b);
	return Vector.scale(b, factor);
};