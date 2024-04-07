/**
 * This file contains the Mat4 class.
 * @author Aidan Donley, Andy He, Amr Hussein
 * @version 1.0.0
 */


/** This class represents a 4-by-4 matrix. It contains 16 numbers. */
class Mat4 {
  /**
   * Creates a new 4-by-4 matrix from the input data. The array must be 16 elements long.
   * @constructor
   * @param {Array<number>} data 
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * Creates a new 4-by-4 matrix with 16 0s.
   * @returns {Mat4} A new matrix.
   */
  static empty() {
    return new Mat4([ 0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0 ]);
  }

  /**
   * Converts the matrix into string format.
   * @param {number} p The precision of the numbers.
   * @returns {string} The matrix as text.
   */
  print(p) {
    return `[${this.data[0].toFixed(p)}, ${this.data[1].toFixed(p)}, ${this.data[2].toFixed(p)}, ${this.data[3].toFixed(p)}, ` +
           `${this.data[4].toFixed(p)}, ${this.data[5].toFixed(p)}, ${this.data[6].toFixed(p)}, ${this.data[7].toFixed(p)}, ` +
           `${this.data[8].toFixed(p)}, ${this.data[9].toFixed(p)}, ${this.data[10].toFixed(p)}, ${this.data[11].toFixed(p)}, ` +
           `${this.data[12].toFixed(p)}, ${this.data[13].toFixed(p)}, ${this.data[14].toFixed(p)}, ${this.data[15].toFixed(p)}]`;
  }
  
  /**
   * Returns a new matrix with the same data as this one.
   * @returns {Mat4} A copy of this matrix.
   */
  clone() {
    return new Mat4([
      this.data[0],  this.data[1],  this.data[2],  this.data[3],
      this.data[4],  this.data[5],  this.data[6],  this.data[7],
      this.data[8],  this.data[9],  this.data[10], this.data[11],
      this.data[12], this.data[13], this.data[14], this.data[15] ]);
  }

  /**
   * Copies the data from other into this matrix. Shallow copy.
   * @param {Mat4} other The matrix to copy.
   */
  copy(other) {
    for (let i = 0; i < 16; ++i)
      this.data[i] = other.data[i];
  }

  /** 
   * Makes an identity matrix.
   * @returns {Mat4} An identity matrix.
   */
  static identity() {
    return new Mat4([ 
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1 ]);
  }

  /**
   * Makes this matrix into a rotation matrix around the X-axis. Represents roll in Euler angles.
   * @param {number} angle Angle in radians.
   */
  makeRotationX(angle) {
    this.data = [ 1, 0,                0,               0,
                  0, Math.cos(angle), -Math.sin(angle), 0,
                  0, Math.sin(angle),  Math.cos(angle), 0,
                  0, 0,                0,               1 ];
    return this;
  }

  /**
   * Makes this matrix into a rotation matrix around the Y-axis. Represents pitch in Euler angles.
   * @param {number} angle Angle in radians.
   */
  makeRotationY(angle){
    this.data = [  Math.cos(angle), 0, Math.sin(angle), 0,
                   0,               1, 0,               0,
                  -Math.sin(angle), 0, Math.cos(angle), 0,
                   0,               0, 0,               1 ];
    return this;
  }

  /**
   * Makes this matrix into a rotation matrix around the Z-axis. Represents yaw in Euler angles.
   * @param {number} angle Angle in radians.
   */
  makeRotationZ(angle) {
    this.data = [ Math.cos(angle), -Math.sin(angle), 0, 0,
                  Math.sin(angle),  Math.cos(angle), 0, 0,
                  0,                0,               1, 0,
                  0,                0,               0, 1 ];
    return this;
  }

  /**
   * Makes this matrix into a translation matrix.
   * @param {Vec3} v The vector to translate by.
   */
  makeTranslation(v) {
    this.data = [ 1, 0, 0, v.x,
                  0, 1, 0, v.y,
                  0, 0, 1, v.z,
                  0, 0, 0, 1 ];
    return this;
  }

  /**
   * Makes this matrix into a projection matrix that converts from world space to camera space.
   * This matrix scales x and y with the field-of-view and aspect ratio and scales z by the near and far clipping planes.
   * https://www.songho.ca/opengl/gl_projectionmatrix.html
   * @param {number} fovDegrees The field-of-view in degrees.
   * @param {number} WIDTH      The width of the screen in pixels.
   * @param {number} HEIGHT     The height of the screen in pixels.
   * @param {number} near       The distance of the near clipping plane.
   * @param {number} far        The distance of the far clipping plane.
   */
  makeProjection(fovDegrees, WIDTH, HEIGHT, near, far) {
    // calculates the field-of-view
    var fovRad = 1.0 / Math.tan(fovDegrees * 0.5 / 180 * Math.PI);
    var aspectRatio = HEIGHT / WIDTH;

    this.data = [ aspectRatio * fovRad, 0,      0,                              0,
                  0,                    fovRad, 0,                              0,
                  0,                    0,      (-(far + near) / (far - near)), (-(2 * far * near) / (far - near)),
                  0,                    0,      -1,                             0 ];
    return this;
  }
  
  /**
   * Makes this matrix into one that points at the target from the given position.
   * https://registry.khronos.org/OpenGL-Refpages/gl2.1/xhtml/gluLookAt.xml
   * @param {Vec3} lookFrom The position of the camera.
   * @param {Vec3} lookTo   The target to point at.
   * @param {Vec3} up       The up direction of the camera. 
   */
  static lookAt(lookFrom, lookTo, up) {
    // Calculate new forward direction
    var zAxis = Vec3.subtract(lookTo, lookFrom).normalize();
    // Calculate new left direction
    var xAxis = Vec3.crossProduct(zAxis, up).normalize();
    // Calculate new up direction
    var yAxis = Vec3.crossProduct(xAxis, zAxis);
  
    return new Mat4([ 
      xAxis.x,  xAxis.y,  xAxis.z,  0,
      yAxis.x,  yAxis.y,  yAxis.z,  0, 
      -zAxis.x, -zAxis.y, -zAxis.z, 0, 
      0,        0,        0,        1 ]);
  }
  
  /** 
   * Quickly inverts the matrix. 
  */
  quickInverse() {
    var inverse = 
      [ this.data[0], this.data[4], this.data[8],  -(this.data[3] * this.data[0] + this.data[7] * this.data[4] + this.data[11] * this.data[8]),
        this.data[1], this.data[5], this.data[9],  -(this.data[3] * this.data[1] + this.data[7] * this.data[5] + this.data[11] * this.data[9]),
        this.data[2], this.data[6], this.data[10], -(this.data[3] * this.data[2] + this.data[7] * this.data[6] + this.data[11] * this.data[10]),
        0,            0,            0,             1 ];
    this.data = inverse;
    return this;
  }

  /**
   * Multiplies the vector by this matrix.
   * @param {Vec3} v The vector.
   * @returns        The resulting vector.
   */
  multiplyVec3(v) {
    let vec = new Vec3(
      (v.x * this.data[0]) + (v.y * this.data[1]) + (v.z * this.data[2])  + (v.w * this.data[3]),
      (v.x * this.data[4]) + (v.y * this.data[5]) + (v.z * this.data[6])  + (v.w * this.data[7]),
      (v.x * this.data[8]) + (v.y * this.data[9]) + (v.z * this.data[10]) + (v.w * this.data[11])
    );
    vec.w = (v.x * this.data[12]) + (v.y * this.data[13]) + (v.z * this.data[14]) + (v.w * this.data[15]);
    return vec;
  }

  /**
   * Adds the two matrices together.
   * @param {Mat4} m1 The first matrix.
   * @param {Mat4} m2 The second matrix.
   * @returns         The resulting matrix.
   */
  static add(m1, m2) {
    return new Mat4(
      [ m1.data[0]  + m2.data[0],  m1.data[1]  + m2.data[1],  m1.data[2]  + m2.data[2],  m1.data[3]  + m2.data[3],
        m1.data[4]  + m2.data[4],  m1.data[5]  + m2.data[5],  m1.data[6]  + m2.data[6],  m1.data[7]  + m2.data[7],
        m1.data[8]  + m2.data[8],  m1.data[9]  + m2.data[9],  m1.data[10] + m2.data[10], m1.data[11] + m2.data[11],
        m1.data[12] + m2.data[12], m1.data[13] + m2.data[13], m1.data[14] + m2.data[14], m1.data[15] + m2.data[15] ]);
  }

  /**
   * Multiplies two matrices together producing a new 4-by-4 matrix.
   * @param {Mat4} m1 The first matrix.
   * @param {Mat4} m2 The second matrix.
   * @returns         The resulting matrix.
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