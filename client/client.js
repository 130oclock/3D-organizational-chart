/**
 * This file handles scripts related to the client interface.
 * @author Aidan Donley, Andy He, Amr Hussein
 * @version 1.0.0
 */

var chart = new Chart();

// add nodes
chart.insert([], new Member("Ben"));
chart.insert([DataNode.collection[0]], new Member("Tom"));
chart.insert([DataNode.collection[0]], new Member("Mark"));
let rNode = chart.insert([DataNode.collection[1]], new Member("John"));
chart.insert([DataNode.collection[2], DataNode.collection[3]], new Member("Tim"));

chart.print();

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