/**
 * This file handles data structures.
 * @author Aidan Donley, Andy He, Amr Hussein
 * @version 1.0.0
 */


/** This class handles the users position in 3D space and is used to project the chart onto the screen. */
class Camera {
  /** Default constructor of class Camera. */
  constructor() {
    this.position = Vec3.empty();
    this.rotation = Quaternion.empty();
  }
}

/** This class represents a single member of the organization. */
class Member {
  /**
   * Default constructor of class Member.
   * @param {String} name 
   */
  constructor(name) {
    this.name = name;
  }
}

/** This class handles organizing node objects. */
class Chart {
  constructor() {
    // The root node of the chart.
    this.root = null;
    this.size = 0;
  }

  /** Prints a list of nodes in the chart. */
  print() {
    for (let i = 0; i < Node.collection.length; ++i) {
      let node = Node.collection[i];
      console.log(node.depth(), node.member.name);
    }
  }

  /**
   * Inserts a new node as a child of the given nodes. The parents given must already exist in the chart.
   * @param {Array<Node>} parents The parents of the new node.
   * @param {Member}      member  The member which the node represents.
   * @returns {Node}              The new node.
   */
  insert(parents, member) {
    ++this.size;
    let newNode = new Node(member);
    let pLength = parents.length;
    newNode.parents = parents;

    // if the new node has no parents, then it is part of the root group.
    if (pLength === 0) {
      this.root = this.addNeighbor(this.root, newNode);
      return newNode;
    }

    // find the parents of the new node
    let firstParent = parents[0];
    let cLength = firstParent.children.length;
    for (let c = 0; c < cLength; ++c) {
      let otherNode = firstParent.children[c];

      // if there is another node with the same parents
      // add the new node as a neighbor.
      if (newNode.parentsMatch(otherNode)) {
        this.addNeighbor(otherNode, newNode);
        return newNode;
      }
    }

    // add the new node as a child of all its parents.
    for (let p = 0; p < pLength; ++p) {
      parents[p].addChild(newNode);
    }
    return newNode;
  }

  /**
   * Adds a node to a neighborhood.
   * @param {Node}  neighborhood The first node in the neighborhood.
   * @param {Node}  node         The node to add.
   * @return {Node}              The first node in the neighborhood.
   */
  addNeighbor(neighborhood, node) {
    if (neighborhood === null) return node;

    // find the end of the neighborhood.
    let neighbor = neighborhood;
    while(neighbor.next !== null)
      neighbor = neighbor.next;

    neighbor.next = node;
    return neighborhood;
  }

  /**
   * Removes the given node from the chart.
   * @param {Node} node The node to remove.
   */
  remove(node) {
    if (node === null) return;

  }
}

/**
 * This class handles organizing and displaying information related to an associated person.
 */
class Node {
  static collection = [];
  static unique = 0;

  /**
   * Default constructor for class Node.
   * @param {Member} member The member which this node represents.
   */
  constructor(member) {
    this.unique = Node.unique++;

    this.position = Vec3.empty();
    this.rotation = Quaternion.empty();

    // An sorted array of this node's children.
    this.children = [];
    // An sorted array of this node's parents.
    this.parents = [];
    // The next node in this nodes neighborhood.
    this.next = null;

    this.member = member;
    this.display = document.createElement("div");

    Node.collection.push(this);
  }

  /**
   * Returns the height of this node.
   * @returns {number} The height of this node.
   */
  height() {
    let length = this.children.length;
    if (length === 0) return 0;

    let heights = new Array(length);
    for (let i = 0; i < length; ++i)
      heights[i] = this.children[i].height();
    return Math.max(...heights) + 1;
  }

  /**
   * Returns the depth of this node.
   * @returns {number} The depth of this node.
   */
  depth() {
    let length = this.parents.length;
    if (length === 0) return 0;
    
    let depths = new Array(length);
    for (let i = 0; i < length; ++i) {
      depths[i] = this.parents[i].depth();
    }
    return Math.max(...depths) + 1;
  }

  /**
   * Counts the number of nodes in this neighborhood. A neighborhood is a group of related nodes which share the same parent.
   * @returns {number} The number of nodes in this neighborhood.
   */
  neighbors() {
    let count = 0;
    let node = this;
    while (node !== null) {
      ++count;
      node = node.next;
    }
    return count;
  }

  /**
   * Adds a node as the parent of this node while keeping the sorted order.
   * @param {Node}     node The parent.
   * @returns {number}      The index where the node was inserted.
   */
  addParent(node) {
    let length = this.parents.length;
    for (let i = 0; i < length; ++i)
      if (this.parents[i].unique > node.unique) {
        // add the node into the array.
        this.parents.splice(i - 1, 0, node);
        return i - 1;
      }
    this.parents.push(node);
    return length;
  }

  /**
   * Returns true if other has the same parents as this node.
   * @param {Node}      other The other node.
   * @returns {boolean}       True if the parents match, otherwise false.
   */
  parentsMatch(other) {
    if (this.parents.length !== other.parents.length) return false;
    let length = this.parents.length;
    for (let i = 0; i < length; ++i)
      if (this.parents[i].unique !== other.parents[i].unique) return false;
    return true;
  }

  /**
   * Adds a node as the child of this node while keeping the sorted order.
   * @param {Node}     node The child.
   * @returns {number}      The index where the node was inserted.
   */
  addChild(node) {
    let length = this.children.length;
    for (let i = 0; i < length; ++i)
      if (this.children[i].unique > node.unique) {
        // add the node into the array.
        this.children.splice(i - 1, 0, node);
        return i - 1;
      }
    this.children.push(node);
    return length;
  }

  /** Updates any html elements related to this node. */
  draw() {

  }

  /**
   * Computes the projection of this node from world space to screen space.
   * @param {Camera} camera 
   */
  project(camera) {

  }

  /**
   * Finds the node using its unique.
   * @param {number} unique 
   */
  static find(unique) {
    let length = Node.collection.length;
    for (let i = 0; i < length; ++i)
      if (unique === Node.collection[i].unique) 
        return Node.collection[i];
    return null;
  }
}
