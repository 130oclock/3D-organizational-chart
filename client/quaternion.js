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
    return `(${this.w} ${this.x} ${this.y} ${this.z})`;
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
		return new Vec3(
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
    return new Vec3(
      2 * ((this.x * this.y) - (this.w * this.z)),
      1 - (2 * ((this.x * this.x) + (this.z * this.z))),
      2 * ((this.y * this.z) + (this.w * this.x))
		);
	}

  /**
   * Computes the right vector of this quaternion.
   * @returns {Vec3} The right vector.
   */
	right() {
    return new Vec3(
      1 - (2 * ((this.y * this.y) + (this.z * this.z))),
      2 * ((this.x * this.y) + (this.w * this.z)),
      2 * ((this.x * this.z) - (this.w * this.y))
		);
	}

  /**
   * Returns the vector part of the imaginary component of this quaternion.
   * @returns {Vec3} The vector part.
   */
	vector() {
		return new Vec3(this.x, this.y, this.z);
	}

  /**
   * Computes the magnitude of this quaternion.
   * @returns {number} The magnitude of this quaternion.
   */
  magnitude() {
    return Math.sqrt((this.w * this.w) + (this.x * this.x) + (this.y * this.y) + (this.z * this.z));
  }

  /** Normalizes this quaternion. */
  normalize() {
    let magnitude = this.magnitude();
    this.w = this.w / magnitude;
    this.x = this.x / magnitude;
    this.y = this.y / magnitude;
    this.z = this.z / magnitude;
  }

  /** Converts this quaternion into its conjugate. */
  conjugate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
  }

  /**
   * Rotates this quaternion around an axis by some angle.
   * @param {Vec3}   axis  The axis to rotate around.
   * @param {number} angle The angle by which to rotate in radians.
   */
  rotate(axis, angle) {
    this.copy(Quaternion.multiply(Quaternion.localRotation(axis, angle), this));
    return this;
  }

  /**
   * Computes the matrix equivalent of this quaternion. Quaternion must be normalized.
   * Implementation from https://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToMatrix/index.htm
   * @returns {Mat4} The resulting matrix.
   */
  matrix() {
    var sqx = this.x * this.x, sqy = this.y * this.y, sqz = this.z * this.z;
    return new Mat4([
      1 - (2 * sqy) - (2 * sqz),                     (2 * this.x * this.y) - (2 * this.w * this.z), (2 * this.x * this.z) + (2 * this.w * this.y), 0,
      (2 * this.x * this.y) + (2 * this.w * this.z), 1 - (2 * sqx) - (2 * sqz),                     (2 * this.y * this.z) - (2 * this.w * this.x), 0,
      (2 * this.x * this.z) - (2 * this.w * this.y), (2 * this.y * this.z) + (2 * this.w * this.x), 1 - (2 * sqx) - (2 * sqy),                     0,
      0,                                             0,                                             0,                                             1
    ]);
  }
  
  /**
   * Computes a new quaternion that points from the cameras position to the target.
   * @param {Vec3}         camera The position of the camera.
   * @param {Vec3}         target The position of the target.
   * @returns {Quaternion}        The resulting Quaternion
   */
  static lookAt(camera, target) {
    const FORWARD = new Vec3(0, 0, 1);
    var forward = Vec3.subtract(target, camera).normalize();
    var dot = Vec3.dotProduct(FORWARD, forward);
  
    // Avoid gimble lock
    if (Math.abs(dot - (-1.0)) < 0.000001) {
      return new Quaternion(Math.PI, 0, 1, 0);
    }
    if (Math.abs(dot - (1.0)) < 0.000001) {
      return Quaternion.empty();
    }
  
    var angle = Math.acos(dot);
    var axis = Vec3.crossProduct(FORWARD, forward).normalize();
    return Quaternion.localRotation(axis, angle);
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
    let relativePosition = Vec3.subtract(point, center);
    let worldRotation = Quaternion.localRotation(axis, angle);
    var rotatedPosition = worldRotation.matrix().multiplyVec3(relativePosition);
    return Vec3.add(rotatedPosition, center);
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
      return new Quaternion(w1 + time * (w2 - w1), x1 + time * (x2 - x1), y1 + time * (y2 - y1), z1 + time * (z2 - z1)).normalize();
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
    let halfAngle = angle / 2;
    let sinAngleHalf = Math.sin(halfAngle);
    return new Quaternion(
      Math.cos(halfAngle),
      axis.x * sinAngleHalf,
      axis.y * sinAngleHalf,
      axis.z * sinAngleHalf
    );
  }
}