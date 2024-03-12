class Node {
	constructor(id, title, name, children) {
		this.id = id;
		// the name of the node
		this.title = title;
		// an array of the node's children
		this.children = children;
		this.parents = [];
		this.ownedGroups = [];

		this.isSelected = false;
		this.isChildSelected = false;

		// does this node have children?
		this.hasChildren = children.length == 0 ? false : true;
		// the visual object
		this.card = new InfoCard(title, name, id);
	}
	getChild(id) {
		return Node.collection[this.children[id]];
	}
	getParent(id) {
		return Node.collection[this.parents[id]];
	}
	connect() {
		if (this.children.length == 0) return;
		var child = Node.collection[this.children[0]];
		var start, end;
		start = Vec3d.add(this.card.pos, vNSize);
		end = Vec3d.add(child.card.pos, vTSize);
		drawLine(start, end, 1, lineColor);
	}
	drawGroups() {
		if (this.ownedGroups.length <= 1) return;
		var start, end;
		start = Vec3d.add(this.ownedGroups[0].nodes[0].card.pos, vTSize);
		end = Vec3d.add(this.ownedGroups[this.ownedGroups.length-1].nodes[0].card.pos, vTSize);
		drawLine(start, end, 1, lineColor);
	}
	drawTop() {
		if (this.parents.length == 0) return;
		var start = Vec3d.add(this.card.pos, vSize);
		var end = Vec3d.add(this.card.pos, vTSize);
		drawLine(start, end, 1, lineColor);
	}
}
Node.collection = [];
Node.update = function() {
	let l = Node.collection.length;
	for (let i = 0; i < l; i++) {
		Node.collection[i].card.update();
	}
	for (let i = 0; i < l; i++) {
		var node = Node.collection[i];
		node.drawTop();
		node.drawGroups();
		node.connect();
	}
};

class Group {
	constructor(owners, nodes) {
		this.owners = owners; // A single node that leads this group
		this.nodes = nodes; // All node within the group

		Group.collection.push(this);
	}
	match(node) {
		var comparative = this.nodes[0];
		return arraysEqual(node.children, comparative.children) && arraysEqual(node.parents, comparative.parents);
	}
	getWidth() {
		var width = nodeWidth;
		var sumWidth = 0;
		var l = this.nodes.length;
		for (var i = 0; i < l; i++) {
			var node = this.nodes[i];
			var gl = node.ownedGroups.length;
			for (var j = 0; j < gl; j++) {
				var group = node.ownedGroups[j];
				sumWidth += group.getWidth();
			}
		}
		if (sumWidth > width) width = sumWidth;
		return width;
	}
	drawLine() {
		if (this.nodes.length <= 1) return;
		var start, end;
		start = Vec3d.add(this.nodes[0].card, vTagOffset);
		end = Vec3d.add(this.nodes[this.nodes.length-1].card, vTagOffset);
		drawLine(start.pos, end.pos, 1, lineColor);
	}
}
Group.collection = [];
Group.draw = function() {
	let l = Group.collection.length;
	for (let i = 0; i < l; i++) {
		//Group.collection[i].drawLine();
	}
};

class Level {
	constructor(y) {
		this.nodes = []; // All node within the group
		this.y = y;
		this.previousPos = [];
		this.pos = [];

		Level.collection[y] = this;
	}
	addNode(node) {
		this.nodes.push(node);
	}
	storePos() {
		this.previousPos = this.pos;
		this.pos = [];
		var i, l = this.nodes.length;
		for (i = 0; i < l; i++) {
			var node = this.nodes[i];
			this.pos[i] = node.card.pos.copy();
		}
	}
	distance(v1, v2) {
		var dx = v1.x - v2.x;
		var dz = v1.z - v2.z;
		return Math.sqrt(dx * dx + dz * dz);
	}
	findCommonElements(arr1, arr2) {
		return arr1.some(item => arr2.includes(item));
	}
	clamp(num, min, max) {
		return Math.min(Math.max(num, min), max);
	}
	moveNodes() { // nodes with the same parents attract each other, all nodes push away from each other
		this.storePos();

		var minDistance = 0;
		var repulsionDist = 5;
		var repulsionConst = 0.005;
		var damp = 0.05;
		var i, j, k, l = this.nodes.length;
		for (i = 0; i < l; i++) {
			var node1 = this.nodes[i];
			var pos1 = this.pos[i];
			var vel = new Vec3d(0, 0, 0);
			// move nodes away from other nodes
			for (j = 0; j < l; j++) {
				var node2 = this.nodes[j];
				var pos2 = this.pos[j];
				if (i != j/* && this.findCommonElements(node1.parents, node2.parents)*/) {
					if (this.distance(pos1, pos2) < repulsionDist) {
						var dif = Vec3d.subtract(pos2, pos1);
						vel.x -= repulsionConst / (dif.x * dif.x) * Math.sign(dif.x);
						vel.z -= repulsionConst / (dif.z * dif.z) * Math.sign(dif.z);
					}
				}
			}
			// move nodes towards their parents
			var pl = node1.parents.length;
			for (k = 0; k < pl; k++) {
				var parent = Node.collection[node1.parents[k]];
				var pos2 = parent.card.pos;
				if (this.distance(pos1, pos2) < minDistance) {
					vel.x -= (pos2.x - pos1.x);
					vel.z -= (pos2.z - pos1.z);
				} else {
					var dif = Vec3d.subtract(pos2, pos1);
					dif.y = 0;
					/*var dir = Vec3d.normalize(dif);
					vel.x += ((pos2.x - dir.x) - pos1.x) * damp;
					vel.z += ((pos2.z - dir.z) - pos1.z) * damp;*/
					vel.x += dif.x * damp;
					vel.z += dif.z * damp;
				}
			}

			//node1.card.pos.x += this.clamp(vel.x, -0.5, 0.5);
			//node1.card.pos.z += this.clamp(vel.z, -0.5, 0.5);
		}
	}
}
Level.collection = [];

// read through file and generate nodes
function generateNodes(data) {
	let l = data.length;
	var nodes = [];

	for (var i = 0; i < l; i++) {
		let line = data[i];
		if (nodes[i] != null) continue;
		let parts = line.split(" ");
		let title = parts.shift();
		let name = parts.shift();

		var node = new Node(i, title, name, parts);
		nodes[i] = node;
		let pl = parts.length;
		if (pl > 0) {
			generateChildNodes(data, nodes, parts, i);
		}
	}
	Node.collection = nodes;
}
function generateChildNodes(data, nodes, children, parent) {
	let pl = children.length;
	for (var j = 0; j < pl; j++) {
		let i = parseInt(children[j]);
		let line = data[i];
		if (nodes[i] != null) {
			nodes[i].parents.push(parent);
			continue;
		}
		let parts = line.split(" ");
		let title = parts.shift();
		let name = parts.shift();

		var node = new Node(i, title, name, parts);
		node.parents.push(parent);
		nodes[i] = node;
		let pl = parts.length;
		if (pl > 0) {
			generateChildNodes(data, nodes, parts, i);
		}
	}
}
function generateGroups() {
	// only create group if it has a parent
	// put objects with the same children and parents into a group
	// put objects with different children or different parents into different groups
	// iterate through the children of every object
	var groups = [];
	var nodes = Array(Node.collection.length).fill(true);
	let l = nodes.length;
	for (var i = 0; i < l; i++) {
		if (nodes[i] == false) continue;
		var node = Node.collection[i];
		if (node.parents.length == 0) {
			var group = new Group([], [node]);
			groups.push(group);
			nodes[i] = false;
			var group = generateChildGroups(nodes, node.children);
			for (var j = 0; j < group.length; j++) {
				groups.push(group[j]);
			}
		}
	}
}
function generateChildGroups(nodes, children) {
	var groups = [];
	let l = children.length;
	for (var i = 0; i < l; i++) {
		let id = children[i];
		if (nodes[id] == false) continue;
		var node = Node.collection[id];
		if (groups.length == 0) {
			var group = new Group(node.parents.slice(), [node]);
			var npl = node.parents.length;
			for (var k = 0; k < npl; k++) {
				var parent = Node.collection[node.parents[k]];
				parent.ownedGroups.push(group);
			}
			groups.push(group);
		} else {
			let g = groups.length;
			var match = false;
			for (var j = 0; j < g; j++) {
				let group = groups[j];
				if (group.match(node) == true) {
					match = true;
					group.nodes.push(node);
				}
			}
			if (match == false) {
				var group = new Group(node.parents.slice(), [node]);
				var npl = node.parents.length;
				for (var k = 0; k < npl; k++) {
					var parent = Node.collection[node.parents[k]];
					parent.ownedGroups.push(group);
				}
				groups.push(group);
			}
		}
		nodes[id] = false;
		if (node.children.length > 0)
			var group = generateChildGroups(nodes, node.children);
			for (var j = 0; j < group.length; j++) {
				groups.push(group[j]);
			}
	}
	return groups;
}

function updatePositions() {
	var roots = [];
	var i, l = Group.collection.length;
	for (i = 0; i < l; i++) {
		var group = Group.collection[i];
		if (group.owners.length == 0) {
			updateChildHierarchy(group.nodes[0], 0, 0);
		}
	}
}
function moveNodes() {
	var j, ll = Level.collection.length;
	Level.collection[ll-1].moveNodes();
}
function updateChildHierarchy(node, yOffset, xOffset) {
	var level;
	if (!Level.collection[yOffset]) {
		level = new Level(yOffset);
		level.addNode(node);
	} else {
		level = Level.collection[yOffset];
		if (!level.nodes.some(e => e.id == node.id)) {
			level.addNode(node);
		}
	}
	node.card.pos.y = (node.card.pos.y > -yOffset) ? -yOffset : node.card.pos.y; // add variable for global offset
	if (yOffset > 0) {
		node.card.pos.x = Math.random();
		node.card.pos.z = Math.random();
	}

	var i, l = node.children.length;
	for (i = 0; i < l; i++) {
		var child = Node.collection[node.children[i]];
		updateChildHierarchy(child, yOffset + 1, xOffset);
	}
}

/*function updatePositions() {
	var roots = [];
	var l = Group.collection.length;
	for (var i = 0; i < l; i++) {
		var group = Group.collection[i];
		if (group.owners.length == 0) roots.push(group);
	}
	var rl = roots.length;
	var xOffset = 0;
	var zOffset = 0;
	for (var i = 0; i < rl; i++) {
		var group = roots[i];
		var nl = group.nodes.length;
		for (var j = 0; j < nl; j++) {
			var node = group.nodes[j];
			node.card.pos.z = zOffset;
			updateGroupPositions(node, xOffset, heightDif, zOffset);
		}
		//xOffset += group.getWidth() + branchSepWidth;
		zOffset += 1;
	}
}
function updateGroupPositions(node, xOffset, yOffset, zOffset) {
	var groups = node.ownedGroups;
	var gl = groups.length;
	for (var i = 0; i < gl; i++) {
		var group = groups[i];
		var nl = group.nodes.length;
		for (var j = 0; j < nl; j++) {
			var n = group.nodes[j];
			n.card.pos.x = xOffset;
			n.card.pos.y = (n.card.pos.y > -yOffset) ? -yOffset : n.card.pos.y;
			n.card.pos.z = (j / 2) + node.card.pos.z;
			updateGroupPositions(n, xOffset, yOffset + heightDif, zOffset);
		}
		xOffset += group.getWidth();
	}
}*/

/*var levelZeroPtr, xTopAdjustment, yTopAdjustment;
const levelSeparation = 1, maxDepth = 1000, siblingSeparation = 1, subtreeSeparation = 2;
function positionTree(apex) {

}
positionTree(Node.collection[0]);*/
