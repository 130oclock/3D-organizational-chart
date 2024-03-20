/**
 * This file contains the Mat4 class. A general representation of 4-by-4 matrices.
 * @author Aidan Donley, Andy He, Amr Hussein
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
  /**
   * @returns A deep copy of this matrix
   */
  clone() {
    return new Mat4([
      this.data[0],  this.data[1],  this.data[2],  this.data[3],
      this.data[4],  this.data[5],  this.data[6],  this.data[7],
      this.data[8],  this.data[9],  this.data[10], this.data[11],
      this.data[12], this.data[13], this.data[14], this.data[15] ]);
  }
  /**
   * Turns this matrix into an identity matrix.
   */
  makeIdentity() {
    this.data = [ 1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1 ];
  }

  makeRotationX(angle) { //roll
    this.data = [ 1,  0,               0,               0,
                  0,  Math.cos(angle), Math.sin(angle), 0,
                  0, -Math.sin(angle), Math.cos(angle), 0,
                  0,  0,               0,               1 ];
  }

  makeRotationY(angle){ //pitch
    this.data = [  Math.cos(angle), 0, Math.sin(angle), 0,
                   0,               1, 0,               0,
                  -Math.sin(angle), 0, Math.cos(angle), 0,
                   0,               0, 0,               1 ];
  }

  makeRotationZ(angle) { //yaw
    this.data = [  Math.cos(angle), Math.sin(angle), 0, 0,
                  -Math.sin(angle), Math.cos(angle), 0, 0,
                   0,               0,               1, 0,
                   0,               0,               0, 1 ];
  }

  makeTranslation(x, y, z) {
    this.data = [ 1, 0, 0, x,
                  0, 1, 0, y,
                  0, 0, 1, z,
                  0, 0, 0, 1 ];
  }

  makeProjection(FovDegrees, AspectRatio, Near, Far) {
    var FovRad = 1 / Math.tan(FovDegrees * 0.5 / 180 * Math.PI);
    this.data = [ AspectRatio * FovRad, 0,      0,                    0,
                  0,                    FovRad, 0,                    0,
                  0,                    0,      (Far / (Far - Near)), ((-Far * Near) / (Far - Near)),
                  0,                    0,      1,                    0 ];
  }
  
  pointAt(position, target, up_axis) {
    // Calculate new forward direction
    var new_forward = Vec3.subtract(target, position).normalize();
  
    // Calculate new up direction
    var a = Vec3.multiply(new_forward, Vec3.dotProduct(up_axis, new_forward));
    var new_up = Vec3.subtract(up_axis, a).normalize();
  
    // Calculate new right direction
    var new_right = Vec3.crossProduct(new_up, new_forward);
  
    this.data = [ new_right.x, new_up.x, new_forward.x, position.x,
                  new_right.y, new_up.y, new_forward.y, position.y, 
                  new_right.z, new_up.z, new_forward.y, position.z, 
                  0,          0,       0,            1 ];
  }
  
  quickInverse() {
    var inverse = 
      [ this.data[0], this.data[4], this.data[8],  -(this.data[12] * this.data[0] + this.data[13] * this.data[1] + this.data[10] * this.data[2]),
        this.data[1], this.data[5], this.data[9],  -(this.data[12] * this.data[4] + this.data[13] * this.data[5] + this.data[10] * this.data[6]),
        this.data[2], this.data[6], this.data[10], -(this.data[12] * this.data[8] + this.data[13] * this.data[9] + this.data[10] * this.data[10]),
        0,            0,            0,             1 ];
    this.data = inverse;
  }

  multiplyVec3(v) {
    return new Vec3d(
      (v.x * this.data[0]) + (v.y * this.data[4]) + (v.z * this.data[8])  + (this.data[12]),
      (v.x * this.data[1]) + (v.y * this.data[5]) + (v.z * this.data[9])  + (this.data[13]),
      (v.x * this.data[2]) + (v.y * this.data[6]) + (v.z * this.data[10]) + (this.data[14])
    );
  }

  static add(m1, m2) {
    return new Mat4(
      [ m1.data[0]  + m2.data[0],  m1.data[1]  + m2.data[1],  m1.data[2]  + m2.data[2],  m1.data[3]  + m2.data[3],
        m1.data[4]  + m2.data[4],  m1.data[5]  + m2.data[5],  m1.data[6]  + m2.data[6],  m1.data[7]  + m2.data[7],
        m1.data[8]  + m2.data[8],  m1.data[9]  + m2.data[9],  m1.data[10] + m2.data[10], m1.data[11] + m2.data[11],
        m1.data[12] + m2.data[12], m1.data[13] + m2.data[13], m1.data[14] + m2.data[14], m1.data[15] + m2.data[15] ]);
  }

  /**
   * Multiplies m1 by m2. Both m1 and m2 must be valid 4-by-4 matrices.
   * @param {Mat4} m1 
   * @param {Mat4} m2 
   * @returns A new Mat4
   */
  static multiply(m1, m2) {
    return new Mat4(
      [ // row 1
        m1.data[0]  * m2.data[0]  + m1.data[1]  * m2.data[4]  + m1.data[2]  * m2.data[8]  + m1.data[3]  * m2.data[12],
        m1.data[0]  * m2.data[1]  + m1.data[1]  * m2.data[5]  + m1.data[2]  * m2.data[9]  + m1.data[3]  * m2.data[13],
        m1.data[0]  * m2.data[2]  + m1.data[1]  * m2.data[6]  + m1.data[2]  * m2.data[10] + m1.data[3]  * m2.data[14],
        m1.data[0]  * m2.data[3]  + m1.data[1]  * m2.data[7]  + m1.data[2]  * m2.data[11] + m1.data[3]  * m2.data[15],
        // row 2
        m1.data[4]  * m2.data[0]  + m1.data[5]  * m2.data[4]  + m1.data[6]  * m2.data[8]  + m1.data[7]  * m2.data[12],
        m1.data[4]  * m2.data[1]  + m1.data[5]  * m2.data[5]  + m1.data[6]  * m2.data[9]  + m1.data[7]  * m2.data[13],
        m1.data[4]  * m2.data[2]  + m1.data[5]  * m2.data[6]  + m1.data[6]  * m2.data[10] + m1.data[7]  * m2.data[14],
        m1.data[4]  * m2.data[3]  + m1.data[5]  * m2.data[7]  + m1.data[6]  * m2.data[11] + m1.data[7]  * m2.data[15],
        // row 3
        m1.data[8]  * m2.data[0]  + m1.data[9]  * m2.data[4]  + m1.data[10] * m2.data[8]  + m1.data[11] * m2.data[12],
        m1.data[8]  * m2.data[1]  + m1.data[9]  * m2.data[5]  + m1.data[10] * m2.data[9]  + m1.data[11] * m2.data[13],
        m1.data[8]  * m2.data[2]  + m1.data[9]  * m2.data[6]  + m1.data[10] * m2.data[10] + m1.data[11] * m2.data[14],
        m1.data[8]  * m2.data[3]  + m1.data[9]  * m2.data[7]  + m1.data[10] * m2.data[11] + m1.data[11] * m2.data[15],
        // row 4
        m1.data[12] * m2.data[0]  + m1.data[13] * m2.data[4]  + m1.data[14] * m2.data[8]  + m1.data[15] * m2.data[12],
        m1.data[12] * m2.data[1]  + m1.data[13] * m2.data[5]  + m1.data[14] * m2.data[9]  + m1.data[15] * m2.data[13],
        m1.data[12] * m2.data[2]  + m1.data[13] * m2.data[6]  + m1.data[14] * m2.data[10] + m1.data[15] * m2.data[14],
        m1.data[12] * m2.data[3]  + m1.data[13] * m2.data[7]  + m1.data[14] * m2.data[11] + m1.data[15] * m2.data[15],
      ]
    )
  }
}