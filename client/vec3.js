/**
 * This file contains the Vec3 class. 
 * @author Aidan Donley
 * @version 1.0.0
 */


/** This class represents 3D vectors with an ordered triplet of numbers (x y z). */
class Vec3 {
  /**
   * Creates a new vector from a triplet of numbers.
   * @constructor
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Creates a new vector with x, y, z set to 0.
   * @returns {Vec3} A new vector (0 0 0).
   */
  static empty() {
    return new Vec3(0, 0, 0);
  }

  /**
   * Converts this vector into string format "(x y z)".
   * @returns {string} The vector as text.
   */
  print() {
    return `(${this.x} ${this.y} ${this.z})`;
  }

  /**
   * Returns a new vector with the same x, y, z values as this one.
   * @returns {Vec3} A new vector.
   */
	clone() {
		return new Vec3(this.x, this.y, this.z);
	}

  /**
   * Copies the x, y, z values from other into this vector.
   * @param {Vec3} other The vector to copy.
   */
  copy(other) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
  }

  /**
   * Computes the Euclidean length from (0 0 0) to (x y z).
   * @returns {number} The length of this vector.
   */
  length() {
    return Math.sqrt(Vec3.dotProduct(this, this));
  }

  /** Normalizes this vector. */
  normalize() {
    var l = length();
    this.x = this.x / l;
    this.y = this.y / l;
    this.z = this.z / l;
  }

  /**
   * Adds two vectors.
   * @param {Vec3}   v1 The first vector.
   * @param {Vec3}   v2 The second vector.
   * @returns {Vec3}    The sum of the two vectors.
   */
  static add(v1, v2) {
    return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }

  /**
   * Subtracts the second vector from the first vector.
   * @param {Vec3}   v1 The first vector.
   * @param {Vec3}   v2 The second vector.
   * @returns {Vec3}    The result of the subtraction.
   */
  static subtract(v1, v2) {
    return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  /**
   * Multiplies each value x, y, z in the vector by the scalar k.
   * @param {Vec3}   v1 A vector.
   * @param {number} k  A scalar.
   * @returns {Vec3}    The result of multiplying by k.
   */
  static multiplyScalar(v1, k) {
    return new Vec3(v1.x * k, v1.y * k, v1.z * k);
  }

  /**
   * Divides each value x, y, z in the vector by the scalar k.
   * @param {Vec3}   v1 A vector.
   * @param {number} k  A scalar.
   * @returns {Vec3}    The result of dividing by k.
   */
  static divideScalar(v1, k) {
    return new Vec3(v1.x / k, v1.y / k, v1.z / k);
  }

  /**
   * Computes the dot product of the first and second vectors.
   * @param {Vec3}     v1 The first vector.
   * @param {Vec3}     v2 The second vector.
   * @returns {number}    The dot product of both vectors.
   */
  static dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  /**
   * Computes the distance between the first and second vectors.
   * @param {Vec3}     v1 The first vector.
   * @param {Vec3}     v2 The second vector.
   * @returns {number}    The distance between both vectors.
   */
  static distance(v1, v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Computes the cross product of the first and second vectors.
   * @param {Vec3}   v1 The first vector.
   * @param {Vec3}   v2 The second vector.
   * @returns {Vec3}    The cross product of both vectors.
   */
  static crossProduct(v1, v2) {
    return new Vec3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }

  /**
   * Computes the point where the line intersects the plane.
   * @param {Vec3} planePoint  A point in the plane.
   * @param {Vec3} planeNormal The normal of the plane.
   * @param {Vec3} lineStart   The start of the line.
   * @param {Vec3} lineEnd     The end of the line.
   * @returns {Vec3}           The intersection of the line and plane.
   */
  static intersectPlane(planePoint, planeNormal, lineStart, lineEnd) {
    planeNormal = planeNormal.clone().normalize();
    var plane_d = Vec3.dotProduct(planeNormal, planePoint);
    var ad = Vec3.dotProduct(lineStart, planeNormal);
    var bd = Vec3.dotProduct(lineEnd, planeNormal);
    var t = (-plane_d - ad) / (bd - ad);
    var lineStartToEnd = Vec3.subtract(lineEnd, lineStart);
    var lineToIntersect = Vec3.multiplyScalar(lineStartToEnd, t);
    return Vec3.add(lineStart, lineToIntersect);
  }
}