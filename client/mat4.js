/**
 * This file contains the Mat4 class. A general representation of 4-by-4 matrices.
 * @author Aidan Donley
 * @version 1.0.0
 */


function to1D(row, column) {
  return row * 4 + column;
}

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
  
  identity() {
    this.data = [ 1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1 ];
  }

  static makeRotationX(angle) {
    //roll
    return new Mat4(
      [ 1, 0, 0, 0,
        0, Math.cos(angle), Math.sin(angle), 0,
        0,-Math.sin(angle), Math.cos(angle), 0,
        0, 0, 0, 1 ]);
  }

  static makeRotationY(angle){
    //pitch
    return new Mat4(
      [ Math.cos(angle), 0, Math.sin(angle), 0,
        0, 1, 0, 0,
       -Math.sin(angle), 0, Math.cos(angle), 0,
        0, 0, 0, 1 ]);
  }

  static makeRotationZ(angle) {
    //yaw
    return new Mat4(
      [ Math.cos(angle), Math.sin(angle), 0, 0,
       -Math.sin(angle), Math.cos(angle), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1 ]);
  }

  static makeTranslation(x, y, z) {
    return new Mat4(
      [ 1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1 ]);
  }

  static makeProjection(FovDegrees, AspectRatio, Near, Far) {
    var FovRad = 1 / Math.tan(FovDegrees * 0.5 / 180 * Math.PI);
    return new Mat4(
      [ AspectRatio * FovRad, 0, 0, 0,
        0, FovRad, 0, 0,
        0, 0, (Far / (Far - Near)), ((-Far * Near) / (Far - Near)),
        0, 0, 1, 0 ]);
  }
  
  static multiplyMatrix(m1, m2) {
    var matrix = new Mat4();

    const realMatrix = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16]
    ];


    // 4x4 matrix updated multiplication
    for (var i = 0; i < 4; ++i) {
      for (var j = 0; j < 4; ++j) {
        for (var k = 0; k < 4; ++k) {
          realMatrix[i][j] = m1.data[k] * m2.data[j];
        }
      }
    }

    // Convert it to 1D vector
    for (var i = 0; i < 4; ++i) {
      for (var j = 0; j < 4; ++j) {
        matrix[i + j] = realMatrix[i][j];
      }
    }

    return matrix;
  }

  static addMatrix(m1, m2) {
    return new Mat4(
      [ m1.data[0]  + m2.data[0],  m1.data[1]  + m2.data[1],  m1.data[2]  + m2.data[2],  m1.data[3]  + m2.data[3],
        m1.data[4]  + m2.data[4],  m1.data[5]  + m2.data[5],  m1.data[6]  + m2.data[6],  m1.data[7]  + m2.data[7],
        m1.data[8]  + m2.data[8],  m1.data[9]  + m2.data[9],  m1.data[10] + m2.data[10], m1.data[11] + m2.data[11],
        m1.data[12] + m2.data[12], m1.data[13] + m2.data[13], m1.data[14] + m2.data[14], m1.data[15] + m2.data[15] ]);
  }
  
  static matrix_PointAt(pos, target, up) {
    // Calculate new forward direction
    var newForward = Vec3d.subtract(target, pos);
    newForward = Vec3d.normalize(newForward);
  
    // Calculate new up direction
    var a = Vec3d.multiply(newForward, v_dotProduct(up, newForward));
    var newUp = Vec3d.subtract(up, a);
    newUp = Vec3d.normalize(newUp);
  
    var newRight = Vec3d.crossProduct(newUp, newForward);
  
    return new Mat4(
      [ newRight.x, newUp.x, newForward.x, pos.x,
        newRight.y, newUp.y, newForward.y, pos.y, 
        newRight.z, newUp.z, newForward.y, pos.z, 
        0, 0, 0, 1 ]);
  }
  static matrix_QuickInverse(m) {
    var matrix = new Mat4(
      [
        


      ]);
    matrix.m[0][0] = m.m[0][0]; matrix.m[0][1] = m.m[1][0]; matrix.m[0][2] = m.m[2][0]; matrix.m[0][3] = 0;
    matrix.m[1][0] = m.m[0][1]; matrix.m[1][1] = m.m[1][1]; matrix.m[1][2] = m.m[2][1]; matrix.m[1][3] = 0;
    matrix.m[2][0] = m.m[0][2]; matrix.m[2][1] = m.m[1][2]; matrix.m[2][2] = m.m[2][2]; matrix.m[2][3] = 0;
    matrix.m[3][0] = -(m.m[3][0] * matrix.m[0][0] + m.m[3][1] * matrix.m[1][0] + m.m[3][2] * matrix.m[2][0]);
    matrix.m[3][1] = -(m.m[3][0] * matrix.m[0][1] + m.m[3][1] * matrix.m[1][1] + m.m[3][2] * matrix.m[2][1]);
    matrix.m[3][2] = -(m.m[3][0] * matrix.m[0][2] + m.m[3][1] * matrix.m[1][2] + m.m[3][2] * matrix.m[2][2]);
    matrix.m[3][3] = 1;
    return matrix;
  }


}