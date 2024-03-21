/**
 * This file contains the Quaternion class.
 * @author Aidan Donley
 * @version 1.0.0
 */


/** This class represents a quaternion with an ordered quadruplet of numbers (w x y z). */
class Quaternion {
  /**
   * Creates a new quaternion from a quadruplet of numbers.
   * @constructor
   * @param {number} w 
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  constructor(w, x, y, z) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Creates a new quaternion with default values (1 0 0 0).
   * @returns A new quaternion.
   */
  static empty() {
    return new Quaternion(1, 0, 0, 0);
  }

  /**
   * Converts the quaternion into string format.
   * @returns {string} The quaternion as text.
   */
  print() {
    return "(" + this.w + " " + this.x + " " + this.y + " " + this.z + ")";
  }

  /**
   * Returns a new quaternion with the same values as this one.
   * @returns {Quaternion} A copy of this Quaternion.
   */
  clone() {
    return new Quaternion(this.w, this.x, this.y, this.z);
  }

  /**
   * Copies the w, x, y, z values from other into this quaternion.
   * @param {Quaternion} other The quaternion to copy.
   */
  copy(other) {
    this.w = other.w;
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
  }

  /**
   * Computes the forward vector of this quaternion.
   * @returns {Vec3} The forward vector.
   */
  forward() {
		return new Vec3d(
      2 * ((this.x * this.z) + (this.w * this.y)), 
      2 * ((this.y * this.z) - (this.w * this.x)), 
      1 - (2 * ((this.x * this.x) + (this.y * this.y)))
    );
	}

  /**
   * Computes the up vector of this quaternion.
   * @returns {Vec3} The up vector.
   */
	up() {
    return new Vec3d(
      2 * ((x * y) - (w * z)),
      1 - (2 * ((x * x) + (z * z))),
      2 * ((y * z) + (w * x))
		);
	}

  /**
   * Computes the right vector of this quaternion.
   * @returns {Vec3} The right vector.
   */
	right() {
    return new Vec3d(
      1 - (2 * ((y * y) + (z * z))),
      2 * ((x * y) + (w * z)),
      2 * ((x * z) - (w * y))
		);
	}

  /**
   * Returns the vector part of the imaginary component of this quaternion.
   * @returns {Vec3} The vector part.
   */
	vector() {
		return new Vec3d(x, y, z);
	}

  /**
   * Computes the magnitude of this quaternion.
   * @returns {number} The magnitude of this quaternion.
   */
  magnitude() {
    return Math.sqrt((w * w) + (x * x) + (y * y) + (z * z));
  }

  /** Normalizes this quaternion. */
  normalize() {
    let magnitude = magnitude();
    w = w / magnitude;
    x = x / magnitude;
    y = y / magnitude;
    z = z / magnitude;
  }

  /** Converts this quaternion into its conjugate. */
  conjugate() {
    x = -x;
    y = -y;
    z = -z;
  }

  /**
   * Rotates this quaternion around an axis by some angle.
   * @param {Vec3}   axis  The axis to rotate around.
   * @param {number} angle The angle by which to rotate in radians.
   */
  rotate(axis, angle) {
    this.copy(Quaternion.multiply(Quaternion.localRotation(axis, angle), this));
  }

  /**
   * Computes the matrix equivalent of this quaternion.
   * @returns {Mat4} The resulting matrix.
   */
  matrix() {
    var sqx = x * x, sqy = y * y, sqz = z * z;
    return new Mat4([
      1 - (2 * sqy) - (2 * sqz), (2 * x * y) - (2 * w * z), (2 * x * z) + (2 * w * y), 0,
      (2 * x * y) + (2 * w * z), 1 - (2 * sqx) - (2 * sqz), (2 * y * z) - (2 * w * x), 0,
      (2 * x * z) - (2 * w * y), (2 * y * z) + (2 * w * x), 1 - (2 * sqx) - (2 * sqy), 0,
      0,                         0,                         0,                         1
    ]);
  }

  /**
   * Computes the matrix equivalent of this quaternion along with the provided translation.
   * @param {Vec3} translation The translation.
   * @returns {Mat4}           The resulting matrix.
   */
  matrix(translation) {
    var sqx = x * x, sqy = y * y, sqz = z * z;
    return new Mat4([
      1 - (2 * sqy) - (2 * sqz), (2 * x * y) - (2 * w * z), (2 * x * z) + (2 * w * y), translation.x,
      (2 * x * y) + (2 * w * z), 1 - (2 * sqx) - (2 * sqz), (2 * y * z) - (2 * w * x), translation.y,
      (2 * x * z) - (2 * w * y), (2 * y * z) + (2 * w * x), 1 - (2 * sqx) - (2 * sqy), translation.z,
      0,                         0,                         0,                         1
    ]);
  }
  
  /**
   * Computes a new quaternion that points from the cameras position to the target.
   * @param {Vec3}         camera The position of the camera.
   * @param {Vec3}         target The position of the target.
   * @returns {Quaternion}        The resulting Quaternion
   */
  static lookAt(camera, target) {
    const UP = new Vec3(0, 0, 1);
    var forward = Vec3.subtract(target, camera).normalize();
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
   * Computes the rotation of the point around the center axis by some angle.
   * @param {Vec3}   center The center of the rotation.
   * @param {Vec3}   point  The point to rotate.
   * @param {Vec3}   axis   The axis to rotate around.
   * @param {Float}  angle  The angle by which to rotate in radians.
   * @returns {Vec3}        The resulting vector.
   */
  static rotateAround(center, point, axis, angle) {
    var worldMat = Quaternion.localRotation(axis, angle).matrix(center);
    return worldMat.multiplyVec3(Vec3.subtract(point, center));
  }

  /**
   * Computes the spherical linear interpolation between two the two quaternions using a time factor.
   * @param {Quaternion}   q1   The starting rotation.
   * @param {Quaternion}   q2   The target rotation.
   * @param {Float}        time The time step.
   * @returns {Quaternion}      The resulting rotation.
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
   * @param {Quaternion} q1 The first quaternion.
   * @param {Quaternion} q2 The second quaternion.
   * @returns {number}      The dot product.
   */
  static dotProduct(q1, q2) {
	  return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
  }

  /**
   * Adds two quaternions.
   * @param {Quaternion}   q1 The first quaternion.
   * @param {Quaternion}   q2 The second quaternion.
   * @returns {Quaternion}    The sum of the quaternions.
   */
  static add(q1, q2) {
	  return new Quaternion(q1.w + q2.w, q1.x + q2.x, q1.y + q2.y, q1.z + q2.z);
  }

  /**
   * Subtracts the second quaternion from the first.
   * @param {Quaternion}   q1 The first quaternion.
   * @param {Quaternion}   q2 The second quaternion.
   * @returns {Quaternion}    The result of subtracting the second quaternion from the first.
   */
  static subtract(q1, q2) {
    return new Quaternion(q1.w - q2.w, q1.x - q2.x, q1.y - q2.y, q1.z - q2.z);
  }

  /**
   * Multiplies two quaternions.
   * @param {Quaternion}   q1 The first quaternion.
   * @param {Quaternion}   q2 The second quaternion.
   * @returns {Quaternion}    The result of multiplying the quaternions.
   */
  static multiply(q1, q2) {
    return new Quaternion(
      (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z),
      (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y),
      (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x),
      (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w)
    );
  }

  /**
   * Creates a quaternion which represents a rotation around an axis by some angle.
   * @param {Vec3}         axis  The axis to rotate around.
   * @param {number}       angle The angle by which to rotate in radians.
   * @returns {Quaternion}       The resulting rotation.
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