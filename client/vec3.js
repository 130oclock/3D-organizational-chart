/**
 * This file contains the Vec3 class. A general representation of 3D vectors.
 * @author Aidan Donley
 * @version 1.0.0
 */


/**
 * A class representing a 3D vector. A vector is an ordered triplet of numbers (x, y, z).
 */
class Vec3 {
  /**
   * Default constructor of vec3 class
   * @param {Float} x 
   * @param {Float} y 
   * @param {Float} z 
   */
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  /**
   * Creates a new Vec3 with identical values as this Vec3.
   * @returns a Vec3
   */
	clone() {
		return new Vec3(this.x, this.y, this.z);
	}
  /**
   * Copies the values of Vec3 v into this Vec3.
   * @param {Vec3} v 
   */
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }
  /**
   * @returns the length of this Vec3
   */
  getLength() {
    return Math.sqrt(dotProduct(v, v));
  }
  /**
   * Normalizes this Vec3.
   */
  normalize() {
    var l = length();
    this.x = x / l;
    this.y = y / l;
    this.z = z / l;
  }

  static add(v1, v2) {
    return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }
  static subtract(v1, v2) {
    return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }
  static multiply(v1, k) {
    return new Vec3(v1.x * k, v1.y * k, v1.z * k);
  }
  static divide(v1, k) {
    return new Vec3(v1.x / k, v1.y / k, v1.z / k);
  }

  static dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }
  static distance(v1, v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  static crossProduct(v1, v2) {
    var v = new Vec3();
    v.x = v1.y * v2.z - v1.z * v2.y;
    v.y = v1.z * v2.x - v1.x * v2.z;
    v.z = v1.x * v2.y - v1.y * v2.x;
    return v;
  }
  static intersectPlane(plane_p, plane_n, lineStart, lineEnd) {
    plane_n = plane_n.clone().normalize();
    var plane_d = Vec3.dotProduct(plane_n, plane_p);
    var ad = Vec3.dotProduct(lineStart, plane_n);
    var bd = Vec3.dotProduct(lineEnd, plane_n);
    var t = (-plane_d - ad) / (bd - ad);
    var lineStartToEnd = Vec3.subtract(lineEnd, lineStart);
    var lineToIntersect = Vec3.multiply(lineStartToEnd, t);
    return Vec3.add(lineStart, lineToIntersect);
  }
}