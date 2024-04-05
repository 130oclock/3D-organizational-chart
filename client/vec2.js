/**
 * This file contains the Vec2 class. 
 * @author Aidan Donley
 * @version 1.0.0
 */


/** This class represents 2D vectors with an ordered pair of numbers (u v). */
class Vec2 {
  /**
   * Creates a new vector from a triplet of numbers.
   * @constructor
   * @param {number} u 
   * @param {number} v 
   */
  constructor(u, v) {
    this.u = u;
    this.v = v;
    this.w = 1;
  }

  /**
   * Creates a new vector with u, v set to 0.
   * @returns {Vec2} A new vector (0 0).
   */
  static empty() {
    return new Vec2(0, 0);
  }

  /**
   * Converts this vector into string format "(u v)".
   * @returns {string} The vector as text.
   */
  print() {
    return `(${this.u} ${this.v})`;
  }

  /**
   * Returns a new vector with the same u, v values as this one.
   * @returns {Vec2} A new vector.
   */
	clone() {
		return new Vec2(this.u, this.v);
	}

  /**
   * Copies the u, v values from other into this vector.
   * @param {Vec2} other The vector to copy.
   */
  copy(other) {
    this.u = other.u;
    this.v = other.v;
    this.w = 1;
  }
}