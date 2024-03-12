function v_distance(v1, v2) {
	var dx = v1.x - v2.x;
	var dy = v1.y - v2.y;
	var dz = v1.z - v2.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function v_dotProduct(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
function v_length(v) {
	return Math.sqrt(v_dotProduct(v, v));
}
// check if two arrays are equal to each other
function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	return a.every(item => b.includes(item)) && b.every(item => a.includes(item));
}

class Mat4x4 {
	constructor() {
		this.m =
		[[0,0,0,0,],
		[0,0,0,0,],
		[0,0,0,0,],
		[0,0,0,0,]];
	}
}
Mat4x4.matrix_MakeIdentity = function() {
	var matrix = new Mat4x4();
	matrix.m[0][0] = 1;
	matrix.m[1][1] = 1;
	matrix.m[2][2] = 1;
	matrix.m[3][3] = 1;
	return matrix;
}
Mat4x4.matrix_makeRotationX = function(angle) {
	//roll
	var matrix = new Mat4x4();
	matrix.m[0][0] = 1;
	matrix.m[1][1] = Math.cos(angle);
	matrix.m[1][2] = Math.sin(angle);
	matrix.m[2][1] = -Math.sin(angle);
	matrix.m[2][2] = Math.cos(angle);
	matrix.m[3][3] = 1;
	return matrix;
}
Mat4x4.matrix_makeRotationY = function(angle) {
	//pitch
	var matrix = new Mat4x4();
	matrix.m[0][0] = Math.cos(angle);
	matrix.m[0][2] = Math.sin(angle);
	matrix.m[1][1] = 1;
	matrix.m[2][0] = -Math.sin(angle);
	matrix.m[2][2] = Math.cos(angle);
	matrix.m[3][3] = 1;
	return matrix;
}
Mat4x4.matrix_makeRotationZ = function(angle) {
	//yaw
	var matrix = new Mat4x4();
	matrix.m[0][0] = Math.cos(angle);
	matrix.m[0][1] = Math.sin(angle);
	matrix.m[1][0] = -Math.sin(angle);
	matrix.m[1][1] = Math.cos(angle);
	matrix.m[2][2] = 1;
	matrix.m[3][3] = 1;
	return matrix;
}
Mat4x4.matrix_MakeTranslation = function(x, y, z) {
	var matrix = new Mat4x4();
	matrix.m[0][0] = 1;
	matrix.m[1][1] = 1;
	matrix.m[2][2] = 1;
	matrix.m[3][3] = 1;
	matrix.m[3][0] = x;
	matrix.m[3][1] = y;
	matrix.m[3][2] = z;
	return matrix;
}
Mat4x4.matrix_MakeProjection = function(FovDegrees, AspectRatio, Near, Far) {
	var FovRad = 1 / Math.tan(FovDegrees * 0.5 / 180 * Math.PI);
	var matrix = new Mat4x4();
	matrix.m[0][0] = AspectRatio * FovRad;
	matrix.m[1][1] = FovRad;
	matrix.m[2][2] = Far / (Far - Near);
	matrix.m[3][2] = (-Far * Near) / (Far - Near);
	matrix.m[2][3] = 1;
	matrix.m[3][3] = 0;
	return matrix;
}
Mat4x4.matrix_MultiplyMatrix = function(m1, m2) {
	var matrix = new Mat4x4();
	for (var brightness = 0; brightness < 4; brightness++) {
		for (var r = 0; r < 4; r++) {
			matrix.m[r][brightness] = m1.m[r][0] * m2.m[0][brightness] + m1.m[r][1] * m2.m[1][brightness] + m1.m[r][2] * m2.m[2][brightness] + m1.m[r][3] * m2.m[3][brightness];
		}
	}
	return matrix;
}
Mat4x4.matrix_PointAt = function(pos, target, up) {
	// Calculate new forward direction
	var newForward = Vec3d.subtract(target, pos);
	newForward = Vec3d.normalize(newForward);

	// Calculate new up direction
	var a = Vec3d.multiply(newForward, v_dotProduct(up, newForward));
	var newUp = Vec3d.subtract(up, a);
	newUp = Vec3d.normalize(newUp);

	var newRight = Vec3d.crossProduct(newUp, newForward);

	var matrix = new Mat4x4();
	matrix.m[0][0] = newRight.x;	matrix.m[0][1] = newRight.y;	matrix.m[0][2] = newRight.z;	matrix.m[0][3] = 0;
	matrix.m[1][0] = newUp.x;		matrix.m[1][1] = newUp.y;		matrix.m[1][2] = newUp.z;		matrix.m[1][3] = 0;
	matrix.m[2][0] = newForward.x;	matrix.m[2][1] = newForward.y;	matrix.m[2][2] = newForward.z;	matrix.m[2][3] = 0;
	matrix.m[3][0] = pos.x;			matrix.m[3][1] = pos.y;			matrix.m[3][2] = pos.z;			matrix.m[3][3] = 1;
	return matrix;
}
Mat4x4.matrix_QuickInverse = function(m) {
	var matrix = new Mat4x4();
	matrix.m[0][0] = m.m[0][0]; matrix.m[0][1] = m.m[1][0]; matrix.m[0][2] = m.m[2][0]; matrix.m[0][3] = 0;
	matrix.m[1][0] = m.m[0][1]; matrix.m[1][1] = m.m[1][1]; matrix.m[1][2] = m.m[2][1]; matrix.m[1][3] = 0;
	matrix.m[2][0] = m.m[0][2]; matrix.m[2][1] = m.m[1][2]; matrix.m[2][2] = m.m[2][2]; matrix.m[2][3] = 0;
	matrix.m[3][0] = -(m.m[3][0] * matrix.m[0][0] + m.m[3][1] * matrix.m[1][0] + m.m[3][2] * matrix.m[2][0]);
	matrix.m[3][1] = -(m.m[3][0] * matrix.m[0][1] + m.m[3][1] * matrix.m[1][1] + m.m[3][2] * matrix.m[2][1]);
	matrix.m[3][2] = -(m.m[3][0] * matrix.m[0][2] + m.m[3][1] * matrix.m[1][2] + m.m[3][2] * matrix.m[2][2]);
	matrix.m[3][3] = 1;
	return matrix;
}

class Vec3d {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = 1;
	}
	print() {
		console.log(this.x + " " + this.y + " " + this.z);
	}
	copy() {
		return new Vec3d(this.x, this.y, this.z);
	}
}
Vec3d.matrix_MultiplyVector = function(m, i) {
	var v = new Vec3d();
	v.x = (i.x * m.m[0][0]) + (i.y * m.m[1][0]) + (i.z * m.m[2][0]) + (i.w * m.m[3][0]);
	v.y = (i.x * m.m[0][1]) + (i.y * m.m[1][1]) + (i.z * m.m[2][1]) + (i.w * m.m[3][1]);
	v.z = (i.x * m.m[0][2]) + (i.y * m.m[1][2]) + (i.z * m.m[2][2]) + (i.w * m.m[3][2]);
	v.w = (i.x * m.m[0][3]) + (i.y * m.m[1][3]) + (i.z * m.m[2][3]) + (i.w * m.m[3][3]);
	return v;
}
Vec3d.add = function(v1, v2) {
	return new Vec3d(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}
Vec3d.subtract = function(v1, v2) {
	return new Vec3d(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}
Vec3d.multiply = function(v1, k) {
	return new Vec3d(v1.x * k, v1.y * k, v1.z * k);
}
Vec3d.divide = function(v1, k) {
	return new Vec3d(v1.x / k, v1.y / k, v1.z / k);
}
Vec3d.normalize = function(v) {
	var l = v_length(v);
		return new Vec3d(v.x / l, v.y / l, v.z / l);
}
Vec3d.crossProduct = function(v1, v2) {
	var v = new Vec3d();
	v.x = v1.y * v2.z - v1.z * v2.y;
	v.y = v1.z * v2.x - v1.x * v2.z;
	v.z = v1.x * v2.y - v1.y * v2.x;
	return v;
}
Vec3d.intersectPlane = function(plane_p, plane_n, lineStart, lineEnd) {
	plane_n = Vec3d.normalize(plane_n);
	var plane_d = -v_dotProduct(plane_n, plane_p);
	var ad = v_dotProduct(lineStart, plane_n);
	var bd = v_dotProduct(lineEnd, plane_n);
	var t = (-plane_d - ad) / (bd - ad);
	var lineStartToEnd = Vec3d.subtract(lineEnd, lineStart);
	var lineToIntersect = Vec3d.multiply(lineStartToEnd, t);
	return Vec3d.add(lineStart, lineToIntersect);
}
