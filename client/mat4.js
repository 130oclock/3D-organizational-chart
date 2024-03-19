/**
 * This file contains the Mat4 class. A general representation of 4-by-4 matrices.
 * @author Aidan Donley
 * @version 1.0.0
 */


/**
 * A class representing a 4-by-4 matrix. 
 */
class Mat4 {
  /**
   * Default constructor of class Mat4.
   */
  constructor() {
    this.data = [ 0, 0, 0, 0,
                  0, 0, 0, 0,
                  0, 0, 0, 0,
                  0, 0, 0, 0 ];
  }
  /**
   * Constructs a Mat4 from the input array. The array must be 16 elements long.
   * @param {Array} array 
   */
  constructor(array) {
    this.data = array;
  }
}