class Quaternion {
	constructor(a, b, c, d) {
		// q = w + (x * i) + (y * j) + (z * k)
		this.w = a || 1;
		this.x = b || 0; //i
		this.y = c || 0; //j
		this.z = d || 0; //k
	}

	getForwardVector() {
		var x = 2 * ((this.x * this.z) + (this.w * this.y)),
		y = 2 * ((this.y * this.z) - (this.w * this.x)),
		z = 1 - (2 * ((this.x * this.x) + (this.y * this.y)));
		return new Vec3d(x, y, z);
	}
	getUpVector() {
		var x = 2 * ((this.x * this.y) - (this.w * this.z)),
		y = 1 - (2 * ((this.x * this.x) + (this.z * this.z))),
		z = 2 * ((this.y * this.z) + (this.w * this.x));
		return new Vec3d(x, y, z);
	}
	getRightVector() {
		var x = 1 - (2 * ((this.y * this.y) + (this.z * this.z))),
		y = 2 * ((this.x * this.y) + (this.w * this.z)),
		z = 2 * ((this.x * this.z) - (this.w * this.y));
		return new Vec3d(x, y, z);
	}
	getAxis() {
		return new Vec3d(this.x, this.y, this.z);
	}
}
Quaternion.copy = function(q) {
	return new Quaternion(q.w, q.x, q.y, q.z);
}
Quaternion.dotProduct = function(q1, q2) {
	return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
}
Quaternion.magnitude = function(q) {
	return Math.sqrt((q.w * q.w) + (q.x * q.x) + (q.y * q.y) + (q.z * q.z));
}
Quaternion.normalize = function(q) {
	var magnitude = Quaternion.magnitude(q);
	q.w /= magnitude;
	q.x /= magnitude;
	q.y /= magnitude;
	q.z /= magnitude;
}
Quaternion.add = function(q1, q2) {
	return new Quaternion(q1.w + q2.w, q1.x + q2.x, q1.y + q2.y, q1.z + q2.z);
}
Quaternion.subtract = function(q1, q2) {
	return new Quaternion(q1.w - q2.w, q1.x - q2.x, q1.y - q2.y, q1.z - q2.z);
}
Quaternion.multiply = function(q1, q2) {
	var a = (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z),
	b = (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y),
	c = (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x),
	d = (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w);
	return new Quaternion(a, b, c, d);
}
Quaternion.conjugate = function(q) {
	return new Quaternion(q.w, -q.x, -q.y, -q.z);
}
Quaternion.localRotation = function(axis, angle) {
	var local_rotation = new Quaternion();
	var angleHalf = angle/2;
	local_rotation.w = Math.cos(angleHalf);
	local_rotation.x = axis.x * Math.sin(angleHalf);
	local_rotation.y = axis.y * Math.sin(angleHalf);
	local_rotation.z = axis.z * Math.sin(angleHalf);
	return local_rotation;
}
Quaternion.rotate = function(q, axis, angle) {
	var local_rotation = Quaternion.localRotation(axis, angle);
	var total = Quaternion.multiply(local_rotation, q);
	return total;
}
Quaternion.lookAt = function(pos, target) {
	var axis;
	var forward = Vec3d.normalize(Vec3d.subtract(target, pos));
	var dot = v_dotProduct(new Vec3d(0, 0, 1), forward);

	if (Math.abs(dot - (-1.0)) < 0.000001) {
		return new Quaternion(Math.PI, 0, 1, 0);
	}
	if (Math.abs(dot - (1.0)) < 0.000001) {
		return new Quaternion();
	}

	var angle = Math.acos(dot);
	axis = Vec3d.normalize(Vec3d.crossProduct(new Vec3d(0, 0, 1), forward));
	var quat = Quaternion.localRotation(axis, angle);
	Quaternion.normalize(quat);
	return quat;
}
Quaternion.lookRotation = function(pos, target, upDir) {
	var forward = Vec3d.normalize(Vec3d.subtract(target, pos));
	var up = Vec3d.normalize(upDir);
	Vec3d.orthoNormal(forward, up);
	var right = Vec3d.crossProduct(up, forward);

	var ret = new Quaternion();
	ret.w = Math.sqrt(1 + right.x + up.y + forward.z) * 0.5;
	var w4_recip = 1 / (4 * ret.w);
	ret.x = (up.z - forward.y) * w4_recip;
	ret.y = (forward.x - right.z) * w4_recip;
	ret.z = (right.y - up.x) * w4_recip;
	return ret;
}
Quaternion.rotateAround = function(center, point, axis, angle) {
	var localPoint = Vec3d.subtract(point, center);
	var q = Quaternion.localRotation(axis, angle);
	var worldMat = Quaternion.generateMatrix(q, center);
	return Vec3d.matrix_MultiplyVector(worldMat, localPoint);
}
Quaternion.slerp = function(_q1, _q2, t) {
	var q1 = new Quaternion(_q1.w, _q1.x, _q1.y, _q1.z);
	var q2 = new Quaternion(_q2.w, _q2.x, _q2.y, _q2.z);
	Quaternion.normalize(q1);
	Quaternion.normalize(q2);

	var dot = Quaternion.dotProduct(q1, q2);
	var w1 = q1.w, x1 = q1.x, y1 = q1.y, z1 = q1.z;
	var w2 = q2.w, x2 = q2.x, y2 = q2.y, z2 = q2.z;

	if (dot < 0) {
		w1 = -w1;
		x1 = -x1;
		y1 = -y1;
		z1 = -z1;
		dot = -dot;
	}

	const DOT_THRESHOLD = 0.9995;
	if (dot > DOT_THRESHOLD) {
		var result = new Quaternion(w1 + t * (w2 - w1), x1 + t * (x2 - x1), y1 + t * (y2 - y1), z1 + t * (z2 - z1));
		Quaternion.normalize(result);
		return result;
	}

	var theta_0 = Math.acos(dot);
	var sin_theta_0 = Math.sin(theta_0);

	var theta = theta_0 * t;
	var sin_theta = Math.sin(theta);
	var cos_theta = Math.cos(theta);

	var s0 = cos_theta - dot * sin_theta / sin_theta_0;
	var s1 = sin_theta / sin_theta_0;

	var result = new Quaternion(s0 * w1 + s1 * w2, s0 * x1 + s1 * x2, s0 * y1 + s1 * y2, s0 * z1 + s1 * z2);
	return result
}
Quaternion.generateMatrix = function(q, pos) {
	var w = q.w, x = q.x, y = q.y, z = q.z;
	var sqw = w * w, sqx = x * x, sqy = y * y, sqz = z * z;
	/*var s = 1 / (sqx + sqy + sqz + sqw);
	s *= 2;*/
	var mat = new Mat4x4();
	mat.m[0][0] = 1 - (2 * sqy) - (2 * sqz);
	mat.m[0][1] = (2 * x * y) - (2 * w * z);
	mat.m[0][2] = (2 * x * z) + (2 * w * y);
	mat.m[1][0] = (2 * x * y) + (2 * w * z);
	mat.m[1][1] = 1 - (2 * sqx) - (2 * sqz);
	mat.m[1][2] = (2 * y * z) - (2 * w * x);
	mat.m[2][0] = (2 * x * z) - (2 * w * y);
	mat.m[2][1] = (2 * y * z) + (2 * w * x);
	mat.m[2][2] = 1 - (2 * sqx) - (2 * sqy);
	mat.m[3][3] = 1;
	if (pos) {
		mat.m[3][0] = pos.x;
		mat.m[3][1] = pos.y;
		mat.m[3][2] = pos.z;
	}
	return mat;
}
