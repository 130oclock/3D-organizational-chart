/**
 * This file handles data structures.
 * @author Aidan Donley, Andy He, Amr Hussein
 * @version 1.0.0
 */


/** This class handles the users position in 3D space and is used to project the chart onto the screen. */
class Camera {
  /** Default constructor of class Camera. */
  constructor(WIDTH, HEIGHT) {
    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;

    this.position = new Vec3(0, 0, -1); //Vec3.empty();
    this.rotation = Quaternion.empty();

    this.viewMat4 = Mat4.empty();
    this.projectMat4 = Mat4.empty();
    this.projectMat4.makeProjection(90, HEIGHT/WIDTH, 0.1, 1000);

    this.update();
  }

  update() {
    // look at selected card

    // generate view matrix
    let rotationMat4 = this.rotation.matrix();
    let translationMat4 = Mat4.empty();
    translationMat4.makeTranslation(this.position);
    translationMat4.quickInverse();

    this.viewMat4 = Mat4.multiply(translationMat4, rotationMat4);
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

  getHTML() {
    return `Name: ${this.name}`;
  }
}

/** This class handles organizing node objects. */
class Chart {
  constructor() {
    // The root node of the chart.
    this.root = null;
    this.size = 0;

    this.body = document.createElement("div");
    this.body.classList.add("chart", "body");
    document.body.appendChild(this.body);

    this.camera = new Camera(this.body.clientWidth, this.body.clientHeight);
  }

  /** Prints a list of nodes in the chart. */
  print() {
    for (let i = 0; i < DataNode.collection.length; ++i) {
      let node = DataNode.collection[i];
      console.log(node.depth(), node.member.name);
    }
  }

  /**
   * Inserts a new node as a child of the given nodes. The parents given must already exist in the chart.
   * @param {Array<DataNode>} parents The parents of the new node.
   * @param {Member}          member  The member which the node represents.
   * @returns {DataNode}              The new node.
   */
  insert(parents, member) {
    ++this.size;
    let newNode = new DataNode(member, this);
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
   * Removes the given node from the chart.
   * @param {DataNode}   node The node to remove.
   * @returns {DataNode}      The new root node.
   */
  remove(node) {
    if (node === null) return;
    // check if node has any parents
    if (node.parents.length === 0) {
      this.getFirstNeighbor(node);
    }
    // check if there are any more nodes in the neighborhood
    // check if node is the parent of any nodes
  }

  /**
   * Adds a node to a neighborhood.
   * @param {DataNode}  neighborhood The first node in the neighborhood.
   * @param {DataNode}  node         The node to add.
   * @return {DataNode}              The first node in the neighborhood.
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
   * Finds and returns the first node in the same neighborhood as the given node.
   * @param {DataNode}   node A node in the neighborhood.
   * @returns {DataNode}      The first node in the neighborhood.
   */
  getFirstNeighbor(node) {
    if (node.parents.length === 0) {
      return this.root;
    }

    // search the children of the first parent for any matches.
    let firstParent = node.parents[0];
    let cLength = firstParent.children.length;
    for (let c = 0; c < cLength; ++c) {
      let otherNode = firstParent.children[c];
      if (node === otherNode) 
        return node;

      // the first neighbor in this neighborhood will be the first child.
      if (node.parentsMatch(otherNode)) {
        return otherNode;
      }
    }
    return node;
  }

  /**
   * Counts the number of nodes in this neighborhood. A neighborhood is a group of related nodes which share the same parent.
   * @param {DataNode} node A node in the neighborhood.
   * @returns {number}      The number of nodes in this neighborhood.
   */
  countNeighbors(node) {
    let count = 0;
    node = this.getFirstNeighbor(node);
    while (node !== null) {
      ++count;
      node = node.next;
    }
    return count;
  }
}

/**
 * This class handles organizing and displaying information related to an associated person.
 */
class DataNode {
  static collection = [];
  static #unique = 0;

  static #DEF_WIDTH = 96;
  static #DEF_HEIGHT = 54;

  /**
   * Default constructor for class DataNode.
   * @param {Member} member The member which this node represents.
   */
  constructor(member, chart) {
    this.unique = DataNode.#unique++;

    this.position = new Vec3(0, this.unique / 5, 0); //Vec3.empty();
    this.rotation = Quaternion.empty();

    this.chart = chart;

    // An sorted array of this node's children.
    this.children = [];
    // An sorted array of this node's parents.
    this.parents = [];
    // The next node in this nodes neighborhood.
    this.next = null;

    this.member = member;
    this.display = document.createElement("div");
    this.display.classList.add("chart", "member");
    this.display.innerHTML = member.getHTML();

    this.chart.body.append(this.display);

    this.draw(this.chart.camera);

    DataNode.collection.push(this);
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
   * Adds a node as the parent of this node while keeping the sorted order.
   * @param {DataNode} node The parent.
   * @returns {number}      The index where the node was inserted.
   */
  addParent(node) {
    let length = this.parents.length;
    for (let i = 0; i < length; ++i)
      if (this.parents[i].unique > node.unique) {
        this.parents.splice(i - 1, 0, node);
        return i - 1;
      }
    this.parents.push(node);
    return length;
  }

  /**
   * Removes a node from the list of this node's parents.
   * @param {DataNode} node The parent to remove.
   * @returns {number}      The index where the parent was removed or -1 if the parent was not found.
   */
  removeParent(node) {
    let length = this.parents.length;
    for (let i = 0; i < length; ++i)
      if (this.parents[i].unique === node.unique) {
        this.parents.splice(i, 1);
        return i;
      }
    return -1;
  }

  /**
   * Returns true if other has the same parents as this node.
   * @param {DataNode}  other The other node.
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
   * @param {DataNode} node The child.
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

  /**
   * Removes a node from the list of this node's children.
   * @param {DataNode} node The child to remove.
   * @returns {number}      The index where the child was removed or -1 if the child was not found.
   */
  removeChild(node) {
    let length = this.children.length;
    for (let i = 0; i < length; ++i)
      if (this.children[i].unique === node.unique) {
        this.children.splice(i, 1);
        return i;
      }
    return -1;
  }

  /** Updates any html elements related to this node. */
  draw(camera) {
    let width = DataNode.#DEF_WIDTH;
    let height = DataNode.#DEF_HEIGHT;

    let position = this.#project(camera);

    let yRotation = 0;

    let visibility = "visible";
    if (position.z > 1 || position.z < 0) visibility = "hidden";

    this.display.setAttribute("style",
     `left: ${position.x}px; 
      top: ${position.y}px; 
      width: ${width}px; 
      height: ${height}px;
      visibility: ${visibility};
     `);

     this.#setTransform(yRotation, 1);
  }

  /**
   * Sets the transform property of this node's html element.
   * @param {number} yRotation Rotation in radians
   * @param {number} scale 
   */
  #setTransform(yRotation, scale) {
    let transform = `translate3d(-50%, -50%, 0) rotateY(${yRotation}rad) scale(${scale})`;

    this.display.style.webkitTransform = transform;
    this.display.style.MozTransform = transform;
    this.display.style.msTransform = transform;
    this.display.style.OTransform = transform;
    this.display.style.transform = transform;
  }

  /**
   * Computes the projection of this node from world space to screen space.
   * @param {Camera} camera The user's camera.
   * @returns {Vec3}        The pixel coordinate of the node.
   */
  #project(camera) {
    let viewVec3 = camera.viewMat4.multiplyVec3(this.position);

    let projectVec3 = camera.projectMat4.multiplyVec3(viewVec3);

    projectVec3.multiplyScalar(1 / projectVec3.w);

    projectVec3.x *= -1;
    projectVec3.y *= -1;

    // move origin to middle of the screen
    projectVec3.x += 1;
    projectVec3.y += 1;

    projectVec3.x *= 0.5 * camera.WIDTH;
    projectVec3.y *= 0.5 * camera.HEIGHT;

    return projectVec3;
  }

  /**
   * Finds the node using its unique.
   * @param {number} unique 
   */
  static find(unique) {
    let length = DataNode.collection.length; // change to binary search
    for (let i = 0; i < length; ++i)
      if (unique === DataNode.collection[i].unique) 
        return DataNode.collection[i];
    return null;
  }
}
