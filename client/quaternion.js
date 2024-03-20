/**
 * This file contains the Quaternion class.
 * @author Aidan Donley
 */

class Quaternion {
  constructor() {
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
  constructor(w, x, y, z) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  /**
   * @returns a deep copy of this Quaternion
   */
  clone() {
    return new Quaternion(this.w, this.x, this.y, this.z);
  }
  copy(q) {
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
  }

  /**
   * Gets the forward vector of this quaternion.
   * @returns a Vec3
   */
  getForward() {
		return new Vec3d(
      2 * ((x * z) + (w * y)), 
      2 * ((y * z) - (w * x)), 
      1 - (2 * ((x * x) + (y * y)))
    );
	}
  /**
   * Gets the up vector of this quaternion.
   * @returns a Vec3
   */
	getUp() {
    return new Vec3d(
      2 * ((x * y) - (w * z)),
      1 - (2 * ((x * x) + (z * z))),
      2 * ((y * z) + (w * x))
		);
	}
  /**
   * Gets the right vector of this quaternion.
   * @returns a Vec3
   */
	getRight() {
    return new Vec3d(
      1 - (2 * ((y * y) + (z * z))),
      2 * ((x * y) + (w * z)),
      2 * ((x * z) - (w * y))
		);
	}
  /**
   * Gets the axis component of this quaternion.
   * @returns a Vec3
   */
	getAxis() {
		return new Vec3d(x, y, z);
	}
  /**
   * @returns the magnitude of this quaternion
   */
  getMagnitude() {
    return Math.sqrt((w * w) + (x * x) + (y * y) + (z * z));
  }
  /**
   * Normalizes this quaternion.
   */
  normalize() {
    var magnitude = getMagnitude();
    w = w / magnitude;
    x = x / magnitude;
    y = y / magnitude;
    z = z / magnitude;
  }
  /**
   * Converts this quaternion into its conjugate.
   */
  conjugate() {
    x = -x;
    y = -y;
    z = -z;
  }

  /**
   * Rotates this quaternion by <angle> radians around <axis>.
   * @param {Vec3} axis The axis to rotate around
   * @param {Float} angle The amount to rotate in radians
   */
  rotate(axis, angle) {
    this.copy(Quaternion.multiply(Quaternion.localRotation(axis, angle), this));
  }

  /**
   * Converts this quaternion into a 4-by-4 matrix.
   * @returns a Mat4
   */
  getMatrix() {
    var sqx = x * x, sqy = y * y, sqz = z * z;
    return new Mat4([
      1 - (2 * sqy) - (2 * sqz), (2 * x * y) - (2 * w * z), (2 * x * z) + (2 * w * y), 0,
      (2 * x * y) + (2 * w * z), 1 - (2 * sqx) - (2 * sqz), (2 * y * z) - (2 * w * x), 0,
      (2 * x * z) - (2 * w * y), (2 * y * z) + (2 * w * x), 1 - (2 * sqx) - (2 * sqy), 0,
      0,                         0,                         0,                         1
    ]);
  }
  /**
   * Converts this quaternion into a 4-by-4 matrix.
   * @param {Vec3} position The position of the object to be rotated
   * @returns a Mat4
   */
  getMatrix(position) {
    var sqx = x * x, sqy = y * y, sqz = z * z;
    return new Mat4([
      1 - (2 * sqy) - (2 * sqz), (2 * x * y) - (2 * w * z), (2 * x * z) + (2 * w * y), position.x,
      (2 * x * y) + (2 * w * z), 1 - (2 * sqx) - (2 * sqz), (2 * y * z) - (2 * w * x), position.y,
      (2 * x * z) - (2 * w * y), (2 * y * z) + (2 * w * x), 1 - (2 * sqx) - (2 * sqy), position.z,
      0,                         0,                         0,                         1
    ]);
  }
  
  /**
   * Calculates a Quaternion that points to <target> from <pos>. The camera at <pos> will point directly at <target>.
   * @param {Vec3} pos Position of the camera
   * @param {Vec3} target Position of the target to look at
   * @returns a new Quaternion
   */
  static lookAt(pos, target) {
    const UP = new Vec3(0, 0, 1);
    var forward = Vec3.subtract(target, pos).normalize();
    var dot = Vec3.dotProduct(UP, forward);
  
    // Avoid gimble lock
    if (Math.abs(dot - (-1.0)) < 0.000001) {
      return new Quaternion(Math.PI, 0, 1, 0);
    }
    if (Math.abs(dot - (1.0)) < 0.000001) {
      return new Quaternion();
    }
  
    var angle = Math.acos(dot);
    var axis = Vec3.crossProduct(UP, forward).normalize();
    return Quaternion.localRotation(axis, angle).normalize();
  }
  /**
   * Rotates <point> around <center> by <angle> radians around the local axis <axis>.
   * @param {Vec3} center 
   * @param {Vec3} point 
   * @param {Vec3} axis 
   * @param {Float} angle 
   * @returns a new Vec3
   */
  static rotateAround(center, point, axis, angle) {
    var worldMat = Quaternion.localRotation(axis, angle).getMatrix(center);
    return worldMat.multiplyVec3(Vec3.subtract(point, center));
  }
  /**
   * Smooth Linear Interpolation between two rotations <q1>, <q2> using time factor <time>
   * @param {Quaternion} q1 
   * @param {Quaternion} q2 
   * @param {Float} time 
   * @returns a new Quaternion
   */
  static slerp = function(q1, q2, time) {
    q1 = q1.clone().normalize();
    q2 = q2.clone().normalize();
  
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
      var result = new Quaternion(w1 + time * (w2 - w1), x1 + time * (x2 - x1), y1 + time * (y2 - y1), z1 + time * (z2 - z1));
      return result.normalize();
    }
  
    var theta_0 = Math.acos(dot);
    var sin_theta_0 = Math.sin(theta_0);
  
    var theta = theta_0 * time;
    var sin_theta = Math.sin(theta);
    var cos_theta = Math.cos(theta);
  
    var s0 = cos_theta - dot * sin_theta / sin_theta_0;
    var s1 = sin_theta / sin_theta_0;
  
    var result = new Quaternion(s0 * w1 + s1 * w2, s0 * x1 + s1 * x2, s0 * y1 + s1 * y2, s0 * z1 + s1 * z2);
    return result;
  }

  /**
   * Calculates the dot product between two quaternions.
   * @param {Quaternion} q1 
   * @param {Quaternion} q2 
   * @returns a float
   */
  static dotProduct(q1, q2) {
	  return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
  }

  static add(q1, q2) {
	  return new Quaternion(q1.w + q2.w, q1.x + q2.x, q1.y + q2.y, q1.z + q2.z);
  }
  static subtract(q1, q2) {
    return new Quaternion(q1.w - q2.w, q1.x - q2.x, q1.y - q2.y, q1.z - q2.z);
  }
  static multiply(q1, q2) {
    return new Quaternion(
      (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z),
      (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y),
      (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x),
      (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w)
    );
  }
  /**
   * Creates a quaternion which represents a rotation of <angle> radians around <axis>.
   * @param {Vec3} axis 
   * @param {Float} angle 
   * @returns a Quaternion
   */
  static localRotation(axis, angle) {
    var angleHalf = angle / 2;
    return new Quaternion(
      Math.cos(angleHalf),
      axis.x * Math.sin(angleHalf),
      axis.y * Math.sin(angleHalf),
      axis.z * Math.sin(angleHalf)
    );
  }
}