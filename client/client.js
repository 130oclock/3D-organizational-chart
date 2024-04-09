/**
 * This file handles scripts related to the client interface.
 * @author Aidan Donley, Andy He, Amr Hussein
 * @version 1.0.0
 */

var chart = new Chart();

// add nodes
chart.insert([], new Member(1948, "Mary", "CEO"), new Vec3(0, 0, 0));
chart.insert([DataNode.collection[0]], new Member(2109, "James", "Vice President"), new Vec3(0, -2, 0));
chart.insert([DataNode.collection[0]], new Member(3977, "Robert", "General Manager"), new Vec3(0, -2, 1));
let rNode = chart.insert([DataNode.collection[1]], new Member(4226, "Jennifer", "Office Manager"), new Vec3(0, -4, 0));
chart.insert([DataNode.collection[2], DataNode.collection[3]], new Member(5038, "David", "Team Leader"), new Vec3(2, -4, 0));
chart.insert([DataNode.collection[0]], new Member(6731, "Tom", "Finance Manager"), new Vec3(-2, -2, 0));
chart.insert([DataNode.collection[0]], new Member(7622, "Ben", "Regional Manager"), new Vec3(-4, -2, 0));

function resize() {
  chart.resizeScreen();
}

window.onresize = resize;

var mouseX = 0, mouseY = 0, mouseXChange = 0, mouseYChange = 0, mouseDown = false;
document.addEventListener("mousemove", function(e) {
	e = e || window.event;
	mouseXChange = e.clientX - mouseX;
	mouseYChange = e.clientY - mouseY;
	mouseX = e.clientX, mouseY = e.clientY;
	if (mouseDown == true) {
    chart.rotateCamera(mouseXChange, mouseYChange);
  }
}, false);
chart.body.addEventListener("mousedown", function() {
	mouseDown = true;
}, false);
document.addEventListener("mouseup", function() {
	mouseDown = false;
}, false);
document.addEventListener("mouseleave", function() {
	mouseDown = false;
}, false);