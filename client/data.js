/**
 * This file handles data structures and graphics.
 * @author Aidan Donley, Andy He, Amr Hussein
 * @version 1.0.0
 */


/** This class handles the users position in 3D space and is used to project the chart onto the screen. */
class Camera {
  /** Default constructor of class Camera. */
  constructor(WIDTH, HEIGHT) {
    this.position = new Vec3(4, -1, -6); //Vec3.empty();
    this.rotation = Quaternion.empty();
    this.target = new Vec3(0, -1, 0);

    this.diffAngle = 0;

    this.FAR = 1000; // the maximum distance
    this.NEAR = 0.1; // can't be 0
    this.FOV = 70; // degrees

    this.viewMat = Mat4.identity();
    this.projectMat = Mat4.identity();

    this.resizeScreen(WIDTH, HEIGHT);
    this.update();
  }

  getAngle() {
    this.diffAngle = Math.atan((this.target.x - this.position.x) / (this.target.z - this.position.z));
  }

  rotateByMouse(mouseDX, mouseDY) {
    this.position = Quaternion.rotateAround(this.position, this.target, Vec3.UP, mouseDX / 900 * Math.PI);
    
    this.update();
  }

  resizeScreen(WIDTH, HEIGHT) {
    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;

    this.projectMat.makeProjection(this.FOV, WIDTH, HEIGHT, this.NEAR, this.FAR);
  }

  update() {
    this.rotation = Quaternion.lookRotation(this.position, this.target, Vec3.UP);
    this.getAngle();

    // generate view matrix
    let rotationMat = this.rotation.normalize().matrix();
    let translationMat = Mat4.empty().makeTranslation(this.position);
    translationMat.quickInverse();

    this.viewMat = Mat4.multiply(rotationMat, translationMat);
  }
}

class Line {
  #start;
  #end;

  constructor(start, end) {
    this.#start = start;
    this.#end = end;

    this.draw();
  }

  draw() {
    // create an SVG

  }
}

/** This class represents a single member of the organization. */
class Member {
  /**
   * Default constructor of class Member.
   * @param {number} id 
   * @param {String} name 
   * @param {String} title
   */
  constructor(id, name, title) {
    this.id = id;
    this.name = name;
    this.title = title;
  }

  getHTML() {
    return `<img src="/client/images/avatar.png" alt="Avatar" class="avatar"><br><span>${this.name}</span>`;
  }

  getTable() {
    return `<table class=""><tr><td style="width: 30%">Name</td><td>${this.name}</td></tr><tr><td>Title</td><td>${this.title}</td></tr><tr><td>ID</td><td>${this.id}</td></tr></table>`;
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
    document.getElementById("chart-wrapper").appendChild(this.body);

    this.axisDisplay = document.createElement("div");
    this.axisDisplay.classList.add("chart", "axis");
    document.getElementById("chart-wrapper").appendChild(this.axisDisplay);

    this.activeNode = null;
    this.activeNodeDisplay = document.getElementById("chart-active");

    this.camera = new Camera(this.body.clientWidth, this.body.clientHeight);
  }

  rotateCamera(mouseDX, mouseDY) {
    this.camera.rotateByMouse(mouseDX, mouseDY);
    this.draw();
  }

  resizeScreen() {
    this.camera.resizeScreen(this.body.clientWidth, this.body.clientHeight);
    this.draw();
  }

  loadActive() {
    if (this.activeNode != null) {
      this.activeNodeDisplay.innerHTML = this.activeNode.member.getTable();
    }
  }

  /** Calls draw on all nodes in the chart. */
  draw() {
    this.forEach((node) => {
      node.draw(this.camera);
    });
  }

  /** Prints a list of nodes in the chart. */
  print() {
    this.forEach((node) => {
      console.log(node.height(), node.depth(), node.member.name);
    });
  }

  forEach(func) {
    let nodes = [];
    nodes.push(this.root);

    while (nodes.length > 0) {
      let node = nodes.shift();

      let cSize = node.children.length;
      for (let i = 0; i < cSize; ++i) {
        nodes.push(node.children[i]);
      }
      
      while (node != null) {
        func(node);
        node = node.next;
      }
    }
  }

  // ========================== Data Structure Implementation ===============================
  /**
   * Inserts a new node as a child of the given nodes. The parents given must already exist in the chart.
   * @param {Array<DataNode>} parents The parents of the new node.
   * @param {Member}          member  The member which the node represents.
   * @returns {DataNode}              The new node.
   */
  insert(parents, member, position) {
    ++this.size;
    let newNode = new DataNode(member, this);
    newNode.position.copy(position);
    newNode.draw(this.camera);
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
      if (newNode.matchParents(otherNode)) {
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
      if (node.matchParents(otherNode)) {
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

  static #DEF_WIDTH = 54;
  static #DEF_HEIGHT = 54;

  /**
   * Default constructor for class DataNode.
   * @param {Member} member The member which this node represents.
   */
  constructor(member, chart) {
    this.unique = DataNode.#unique++;

    this.position = new Vec3(0, 0, 0); //Vec3.empty();
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
    this.display.dataset.unique = this.unique;
    this.display.innerHTML = member.getHTML();

    this.display.addEventListener("click", () => {
      let chart = this.chart;
      let display = this.display;

      if (chart.activeNode != null && chart.activeNode.unique != this.unique) {
        chart.activeNode.display.classList.remove("active");
      }

      display.classList.toggle("active");
      chart.activeNode = this;

      chart.loadActive();
    });

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
  matchParents(other) {
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
  draw() {
    let camera = this.chart.camera;

    let width = DataNode.#DEF_WIDTH;
    let height = DataNode.#DEF_HEIGHT;

    let lower = this.position.clone();
    lower.y -= 1;
    let lowerScreen = this.#project(camera, lower);
    let upper = this.position.clone();
    upper.y += 1;
    let upperScreen = this.#project(camera, upper);
    
    let centerScreen = new Vec3(
      (lowerScreen.x + upperScreen.x) / 2,
      (lowerScreen.y + upperScreen.y) / 2,
      (lowerScreen.z + upperScreen.z) / 2,
    );

    let visibility = "visible";
    if (centerScreen.z > 1 || centerScreen.z < 0) visibility = "hidden"; // check if the object is "behind" the screen.

    this.display.setAttribute("style",
     `left: ${centerScreen.x}px; 
      top: ${centerScreen.y}px; 
      width: ${width}px; 
      height: ${height}px;
      visibility: ${visibility};
      z-index: ${((camera.FAR * 10) - (centerScreen.z * camera.FAR * 10) | 0) + 50};
     `);

     this.#setTransform(camera.diffAngle, (lowerScreen.y - upperScreen.y) / 100);
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
  #project(camera, point) {
    // project
    let viewPoint = camera.viewMat.multiplyVec3(point);
    let projectPoint = camera.projectMat.multiplyVec3(viewPoint);

    // scale the values of the projection based on the screen size.
    projectPoint.multiplyScalar(1 / projectPoint.w);

    // invert horizontal and vertical to match screen space directions
    projectPoint.x *= -1;
    projectPoint.y *= -1;

    // move origin to middle of the screen
    projectPoint.x += 1;
    projectPoint.y += 1;
    projectPoint.x *= 0.5 * camera.WIDTH;
    projectPoint.y *= 0.5 * camera.HEIGHT;

    return projectPoint;
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