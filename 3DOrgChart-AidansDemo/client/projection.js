const body = document.body;
var WIDTH, HEIGHT;
var canvas = document.getElementById('canvas');
var overlay = document.getElementById('overlay');
var rightpanel = document.getElementById('rightpanel');
var ctx = canvas.getContext('2d', { alpha: false });

function resize() {
	WIDTH = window.innerWidth * 0.80;
	HEIGHT = window.innerHeight * 1 - 24;
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	canvas.style.left = "8px";
	canvas.style.top = "8px";
	overlay.style.width = WIDTH + "px";
	overlay.style.height = HEIGHT + "px";
	overlay.style.left = "8px";
	overlay.style.top = "8px";
	matProjection = Mat4x4.matrix_MakeProjection(90, HEIGHT/WIDTH, 0.1, 1000);
	draw();
}
window.onresize = resize;
window.onorientationchange = resize;

var nodeWidth = 0.5;
var branchSepWidth = 0.5;
var heightDif = 0.5;
var canvasColor = "#FF5470";
var lineColor = "#000";
var childColor = "#0f0";
var parentColor = "#00f";
var tagOffset = 10;
var vTagOffset = new Vec3d(0, 0.1, 0);
var defaultSize = 10;
var vSize = new Vec3d(0, 0.1, 0);
var vNSize = new Vec3d(0, -0.1, 0);
var vTSize = new Vec3d(0, 0.2, 0);
var camAngle = 0;
var selectedNode;

var cameraFrontPlane = new Vec3d(0, 0, 0.1);
var cameraBackPlane = new Vec3d(0, 0, 1);

function drawLine(start, end, width, color) {
	ctx.beginPath();
	ctx.lineCap = 'round';
	ctx.lineWidth = width;
	ctx.strokeStyle = color;

	var matWorld = Mat4x4.matrix_MakeIdentity();

	var vTransformed_start = Vec3d.matrix_MultiplyVector(matWorld, start);
	var vTransformed_end = Vec3d.matrix_MultiplyVector(matWorld, end);

	var vViewed_start = Vec3d.matrix_MultiplyVector(matView, vTransformed_start);
	var vViewed_end = Vec3d.matrix_MultiplyVector(matView, vTransformed_end);

	var clipped = {0: new Vec3d(0, 0, 0), 1: new Vec3d(0, 0, 0)};
	var clip = clipAgainstPlane(cameraFrontPlane, cameraBackPlane, {0: vViewed_start, 1: vViewed_end}, clipped);
	if (clip == 0) return;

	var vProjected_start = Vec3d.matrix_MultiplyVector(matProjection, clipped[0]);
	var vProjected_end = Vec3d.matrix_MultiplyVector(matProjection, clipped[1]);

	vProjected_start = Vec3d.divide(vProjected_start, vProjected_start.w);
	vProjected_end = Vec3d.divide(vProjected_end, vProjected_end.w);

	vProjected_start.x *= -1;
	vProjected_start.y *= -1;
	vProjected_end.x *= -1;
	vProjected_end.y *= -1;

	var offsetView = new Vec3d(1, 1, 0);
	vProjected_start = Vec3d.add(vProjected_start, offsetView);
	vProjected_end = Vec3d.add(vProjected_end, offsetView);

	vProjected_start.x *= 0.5 * WIDTH;
	vProjected_start.y *= 0.5 * HEIGHT;
	vProjected_end.x *= 0.5 * WIDTH;
	vProjected_end.y *= 0.5 * HEIGHT;

	ctx.moveTo(vProjected_start.x, vProjected_start.y);
	ctx.lineTo(vProjected_end.x, vProjected_end.y);
	ctx.stroke();
	ctx.closePath();
}
function clipAgainstPlane(plane_p, plane_n, line_start, line_end) {
	plane_n = Vec3d.normalize(plane_n);

	function dist(p) {
		var n = Vec3d.normalize(p);
		return (plane_n.x * p.x + plane_n.y * p.y + plane_n.z * p.z - v_dotProduct(plane_n, plane_p));
	}

	var inside_points = new Array(2);		var nInsidePointCount = 0;
	var outside_points = new Array(2);	var nOutsidePointCount = 0;

	var d0 = dist(line_start[0]);
	var d1 = dist(line_start[1]);

	if (d0 >= 0) { inside_points[nInsidePointCount++] = line_start[0]; }
	else { outside_points[nOutsidePointCount++] = line_start[0]; }
	if (d1 >= 0) { inside_points[nInsidePointCount++] = line_start[1]; }
	else { outside_points[nOutsidePointCount++] = line_start[1]; }

	if (nInsidePointCount == 0) {
		return 0;
	}
	if (nInsidePointCount == 2) {
		var start = inside_points[0];
		line_end[0].x = start.x;
		line_end[0].y = start.y;
		line_end[0].z = start.z;
		line_end[0].w = start.w;

		var end = inside_points[1];
		line_end[1].x = end.x;
		line_end[1].y = end.y;
		line_end[1].z = end.z;
		line_end[1].w = end.w;
		return 1;
	}
	if (nInsidePointCount == 1 && nOutsidePointCount == 1) {
		var start = inside_points[0];
		line_end[0].x = start.x;
		line_end[0].y = start.y;
		line_end[0].z = start.z;
		line_end[0].w = start.w;

		var end = Vec3d.intersectPlane(plane_p, plane_n, inside_points[0], outside_points[0]);
		line_end[1].x = end.x;
		line_end[1].y = end.y;
		line_end[1].z = end.z;
		line_end[1].w = end.w;

		return 2;
	}
}

function updateSelectedInfo(card) {
	var panel = document.getElementById('cardInfoTable');
	var data = `<table>
		<tr>
			<th>Card Number</th>
		</tr>
		<tr>
			<td>${card.id}</td>
		</tr>
		<tr>
			<th>Title</th>
		</tr>
		<tr>
			<td><input id="cardTitle" class="cardInput" type="text" value="${card.title}"></td>
		</tr>
		<tr>
			<th>Name</th>
		</tr>
		<tr>
			<td><input id="cardName" class="cardInput" type="text" value="${card.name}"></td>
		</tr>
	</table>`
	panel.innerHTML = data;
	panel.style.visibility = "visible";
}

class InfoCard {
	constructor(title, name, id) {
		var id = id;

		this.pos = new Vec3d(0, 0, 0);
		this.tex = new Vec3d(0, 0, 0);
		this.size = 0;
		this.id = id;
		this.title = title;
		this.name = name || id;

		// create the div that represents this InfoCard
		var div = document.createElement("div");
		div.classList.add("card");
		if (darkMode == true) div.classList.add("dark-mode");
		else div.classList.add("light-mode");
		div.id = id;

		div.style.width = (defaultSize * 2.75) + "px";
		div.style.height = (defaultSize * 2) + "px";

		div.onclick = InfoCard.onclick;
		// store the div in this object
		this.div = div;

		// add the name to the div
		this.changeValues()
		// update the div's position
		this.update();
		// add the div to the body
		overlay.appendChild(div);
		// add this object to an array of all points
		InfoCard.collection.push(this);
	}
	update() {
		// transform and rotate the position to screen space
		var tex = InfoCard.project(this.pos);
		// store the projected coordinates
		this.tex = tex;

		// project a point 1 unit above the object
		var s = InfoCard.project(Vec3d.add(new Vec3d(this.pos.x, this.pos.y, this.pos.z), camera.rot.getUpVector()));
		// find the pixel difference between the points
		var size = Math.abs(tex.y - s.y) / 10;
		this.size = size;
		var scale = size / defaultSize;

		/*this.div.style.width = (size * 2) + "px";
		this.div.style.height = (size * 2) + "px";*/

		this.div.style.left = tex.x + "px";
		this.div.style.top = tex.y + "px";
		this.div.style.transform = "translate3d(-50%, -50%, 0) rotateY(" + (camAngle) + "rad) scale(" + scale + ")";
		this.div.style.zIndex = (camera.viewDist) - (tex.z * camera.viewDist) | 0;
		// check if the point is too close or too far from the camera
		if (tex.z > 1 || tex.z < 0) this.div.style.visibility = "hidden";
		else this.div.style.visibility = "visible";
	}
	changeValues() {
		this.div.innerHTML = this.title + "<br>" + this.name;
	}
}
InfoCard.collection = [];
InfoCard.project = function(p) {
	var matWorld = Mat4x4.matrix_MakeIdentity();

	var vTransformed = Vec3d.matrix_MultiplyVector(matWorld, p);
	var vViewed = Vec3d.matrix_MultiplyVector(matView, vTransformed);

	var vProjected = Vec3d.matrix_MultiplyVector(matProjection, vViewed);

	vProjected = Vec3d.divide(vProjected, vProjected.w);

	vProjected.x *= -1;
	vProjected.y *= -1;

	var offsetView = new Vec3d(1, 1, 0);
	vProjected = Vec3d.add(vProjected, offsetView);

	vProjected.x *= 0.5 * WIDTH;
	vProjected.y *= 0.5 * HEIGHT;

	return vProjected;
}
InfoCard.onclick = function(e) {
	var id = e.composedPath()[0].id;
	if (selectedNode != null) {
		var l = selectedNode.parents.length;
		for (var i = 0; i < l; i++) {
			var parent = Node.collection[selectedNode.parents[i]];
			parent.isChildSelected = false;
		}
		selectedNode.isSelected = false;
		selectedNode.card.div.classList.remove("selected");
	}
	var node = Node.collection[id];

	selectedNode = node;
	var l = selectedNode.parents.length;
	for (var i = 0; i < l; i++) {
		var parent = Node.collection[selectedNode.parents[i]];
		parent.isChildSelected = true;
	}
	selectedNode.isSelected = true;
	selectedNode.card.div.classList.add("selected");

	updateSelectedInfo(selectedNode.card);
	draw();
}

class Camera {
	constructor(pos = new Vec3d(), viewDist = 500) {
		this.pos = pos;
		this.rot = new Quaternion();
		this.viewDist = viewDist;
	}
}

function draw() {
	camAngle = Math.atan(-(center.z - camera.pos.z) / -(center.x - camera.pos.x));

	ctx.beginPath();
	ctx.fillStyle = canvasColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.closePath();
	// Camera Rotation
	camera.rot = Quaternion.lookAt(camera.pos, center);
	Quaternion.normalize(camera.rot);
	var matRotation = Quaternion.generateMatrix(camera.rot);
	var matTranslation = Mat4x4.matrix_MakeTranslation(camera.pos.x, camera.pos.y, camera.pos.z);
	matTranslation = Mat4x4.matrix_QuickInverse(matTranslation);
	matView = Mat4x4.matrix_MultiplyMatrix(matTranslation, matRotation);

	Node.update();
	Group.draw();
}
