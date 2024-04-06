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
    this.w = 1;
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
    var l = this.length();
    this.x = this.x / l;
    this.y = this.y / l;
    this.z = this.z / l;
    return this;
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
   * @param {number} k  A scalar.
   * @returns {Vec3}    The result of multiplying by k.
   */
  multiplyScalar(k) {
    this.x *= k; 
    this.y *= k;
    this.z *= k;
    return this;
  }

  /**
   * Divides each value x, y, z in the vector by the scalar k.
   * @param {number} k  A scalar.
   * @returns {Vec3}    The result of dividing by k.
   */
  divideScalar(k) {
    this.x /= k;
    this.y /= k;
    this.z /= k;
    return this;
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
   * Projects a vector onto the normal. 
   * The vector projection of v1 on v2 is a vector whose magnitude is the scalar projection of v1 on v2 with the same direction as v2.
   * @param {Vec3} v1 The vector.
   * @param {Vec3} v2 The normal.
   * @returns {Vec3}  The projected vector.
   */
  static project(v1, v2) {
    let normal = v2.clone().normalize();
    let dot = Vec3.dotProduct(v1, normal);
    return v2.clone().multiplyScalar(dot);
  }

  /**
   * Makes tangent orthogonal to normal.
   * Gram-Schmidt process for 2 vertices.
   * @param {Vec3} v1 The normal.
   * @param {Vec3} v2 The tangent.
   */
  static orthoNormal(v1, v2) {
    var n = v1.clone().normalize();
    var dot = Vec3.dotProduct(v2, n);
    var projected = n.clone().multiplyScalar(dot);
    var t = Vec3.subtract(v2, projected).normalize();
    v1.x = n.x;
    v1.y = n.y;
    v1.z = n.z;
    v2.x = t.x;
    v2.y = t.y;
    v2.z = t.z;
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

Vec3.LEFT = new Vec3(1, 0, 0);
Vec3.UP = new Vec3(0, 1, 0);
Vec3.FORWARD = new Vec3(0, 0, 1);