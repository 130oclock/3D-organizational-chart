/**
 * This file handles data structures.
 * @author Aidan Donley, Andy He, Amr Hussein
 * @version 1.0.0
 */


/**
 * This class handles the users position in 3D space and is used to project the chart onto the screen.
 */
class Camera {
  /**
   * Default constructor of class Camera.
   * @param {Vec3} position_in
   */
  constructor(position_in) {
    this.position = position_in;
    this.rotation = Quaternion.empty();
  }
}

/**
 * This class represents a single person in the organization. 
 */
class Person {
  /**
   * Default constructor of class Person.
   * @param {String} name_in 
   * @param {String} title_in 
   */
  constructor(name_in, title_in) {
    this.name = name_in;
    this.title = title_in;
  }
}

/**
 * This class handles organizing and displaying information related to an associated person.
 */
class DataNode {
  // An array containing all DataNode objects
  static collection = [];
  
  /**
   * Default constructor for class DataNode.
   * @param {Person} person_in 
   */
  constructor(person_in) {
    collection.push(this);

    this.position = Vec3.empty();

    this.person = person_in;
    this.children = [];
  }
  /**
   * Returns a reference to the array of all of this node's children.
   * @returns an array of children
   */
  getChildren() {
    return this.children;
  }
  /**
   * Updates any html elements related to this node.
   */
  draw() {

  }
}
