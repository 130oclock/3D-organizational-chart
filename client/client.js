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