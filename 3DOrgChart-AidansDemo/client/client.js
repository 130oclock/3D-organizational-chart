

var darkMode = true;
function darkModeOn() {
	darkMode = true;
	lineColor = "#fff";
	canvasColor = "#000";
	document.body.classList.add("dark-mode");
	document.body.classList.remove("light-mode");
	let l = InfoCard.collection.length;
	for (var i = 0; i < l; i++) {
		var div = InfoCard.collection[i].div;
		div.classList.add("dark-mode");
		div.classList.remove("light-mode");
	}
	draw();
}
function lightModeOn() {
	darkMode = false;
	lineColor = "#000";
	canvasColor = "#FFFFFE";
	document.body.classList.add("light-mode");
	document.body.classList.remove("dark-mode");
	let l = InfoCard.collection.length;
	for (var i = 0; i < l; i++) {
		var div = InfoCard.collection[i].div;
		div.classList.add("light-mode");
		div.classList.remove("dark-mode");
	}
	draw();
}

function openTab(e, tabName) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].classList.remove("active");
	}

	document.getElementById(tabName).style.display = "block";
	e.currentTarget.classList.add("active");
}

function moveCamera() {
	if (selectedNode == null) return;
	var dif = Vec3d.subtract(selectedNode.card.pos, center);
	camera.pos.x += dif.x;
	camera.pos.y += dif.y;
	camera.pos.z += dif.z;
	center = selectedNode.card.pos;

	draw();
}

function editCardValues() {
	if (selectedNode == null) return;
	var title = document.getElementById("cardTitle").value;
	var name = document.getElementById("cardName").value;

	var card = selectedNode.card;
	card.title = title;
	card.name = name;

	card.changeValues();
}

// create points
/*function readTextFile(file) {
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function () {
		if(rawFile.readyState === 4) {
			if(rawFile.status === 200 || rawFile.status == 0) {
				var allText = rawFile.responseText;
				console.log(allText);
			}
		}
	}
	rawFile.send(null);
}*/
/*var info = [
	"r1 A 1 2 3 4 5 6 7 8 9 10 11 12 13 14",
	"l1 A",
	"l2 A",
	"l3 A",
	"l4 A",
	"l5 A",
	"l6 A",
	"l7 A",
	"l8 A",
	"l9 A",
	"l10 A",
	"l11 A",
	"l12 A",
	"l13 A",
	"l14 A",
];*/
var info = [
	"General_Manager A 1 2 3 4 5 6 7 8 9",
	"Production_Manager B 10 11 12",
	"Finance_Manager C 13 14 15",
	"Marketing_Manager D 16 17 18",
	"Sales_Manager E 19 20 21",
	"Development_Manager F 22 23 24",
	"Research_Manager G 25 26 27",
	"Project_1 H 10 13 16 19 22 25",
	"Project_2 I 11 14 17 20 23 26",
	"Project_3 J 12 15 18 21 24 27",
	"P_Team_1",
	"P_Team_2",
	"P_Team_3",
	"F_Team_1",
	"F_Team_2",
	"F_Team_3",
	"M_Team_1",
	"M_Team_2",
	"M_Team_3",
	"S_Team_1",
	"S_Team_2",
	"S_Team_3",
	"D_Team_1",
	"D_Team_2",
	"D_Team_3",
	"R_Team_1",
	"R_Team_2",
	"R_Team_3",
];


var camera = new Camera(new Vec3d(2.82, 0, 2.82));
var center = new Vec3d(0, 0, 0);
var matView = Mat4x4.matrix_MakeIdentity();
var matProjection = Mat4x4.matrix_MakeProjection(90, HEIGHT/WIDTH, 0.1, 1000);

resize();
generateNodes(info);
//console.log(Node.collection);
generateGroups();
updatePositions();

console.log(Level.collection);
draw();

lightModeOn();
//darkModeOn();

function loop() {
	moveNodes();
	draw();
}
//window.requestAnimationFrame(loop);
setInterval(loop, 1/30 * 1000);

overlay.addEventListener("wheel", function(e) {
	e = e || window.event;
	let dist = v_distance(center, camera.pos);
	if (dist > 0.5 && e.deltaY == -100 || dist < 500 && e.deltaY == 100) {
		var forwardAxis = camera.rot.getForwardVector();
		camera.pos = Vec3d.add(camera.pos, Vec3d.multiply(forwardAxis, -e.deltaY * 0.005));
	}
	draw();
}, false);

var mouseX = 0, mouseY = 0, mouseXChange = 0, mouseYChange = 0, mouseDown = false;
document.addEventListener("mousemove", function(e) {
	e = e || window.event;
	mouseXChange = e.clientX - mouseX;
	mouseYChange = e.clientY - mouseY;
	mouseX = e.clientX, mouseY = e.clientY;
	if (mouseDown == true) {
		var upAxis = camera.rot.getUpVector();
		var rightAxis = camera.rot.getRightVector();
		camera.pos = Quaternion.rotateAround(center, camera.pos, upAxis, mouseXChange / 1800 * Math.PI);
		//camera.pos = Quaternion.rotateAround(center, camera.pos, rightAxis, -mouseYChange / 1800 * Math.PI);
		/*camera.rot = Quaternion.rotate(camera.rot, upAxis, mouseXChange / 1800 * Math.PI);
		camera.rot = Quaternion.rotate(camera.rot, rightAxis, -mouseYChange / 1800 * Math.PI);*/
		draw();
	}
}, false);
overlay.addEventListener("mousedown", function() {
	mouseDown = true;
}, false);
document.addEventListener("mouseup", function() {
	mouseDown = false;
}, false);
document.addEventListener("mouseleave", function() {
	mouseDown = false;
}, false);
