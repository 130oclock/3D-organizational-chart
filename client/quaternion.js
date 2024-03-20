/**
 * This file contains the Quaternion class.
 * @author Aidan Donley
 */

class Quaternion {
  constructor() {
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
  constructor(w, x, y, z) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  clone() {
    return new Quaternion(this.w, this.x, this.y, this.z);
  }

  getForward() {
		return new Vec3d(
      2 * ((this.x * this.z) + (this.w * this.y)), 
      2 * ((this.y * this.z) - (this.w * this.x)), 
      1 - (2 * ((this.x * this.x) + (this.y * this.y)))
    );
	}
	getUp() {
    return new Vec3d(
      2 * ((this.x * this.y) - (this.w * this.z)),
      1 - (2 * ((this.x * this.x) + (this.z * this.z))),
      2 * ((this.y * this.z) + (this.w * this.x))
		);
	}
	getRight() {
    return new Vec3d(
      1 - (2 * ((this.y * this.y) + (this.z * this.z))),
      2 * ((this.x * this.y) + (this.w * this.z)),
      2 * ((this.x * this.z) - (this.w * this.y))
		);
	}
	getAxis() {
		return new Vec3d(this.x, this.y, this.z);
	}
  getMagnitude() {
    return Math.sqrt((this.w * this.w) + (this.x * this.x) + (this.y * this.y) + (this.z * this.z));
  }
  normalize() {
    var magnitude = this.getMagnitude();
    this.w = this.w / magnitude;
    this.x = this.x / magnitude;
    this.y = this.y / magnitude;
    this.z = this.z / magnitude;
  }
  conjugate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
  }

  static dotProduct(q1, q2) {
	  return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
  }
}