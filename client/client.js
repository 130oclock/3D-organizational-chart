/**
 * This file handles scripts related to the client interface.
 * @author Aidan Donley, Andy He, Amr Hussein
 * @version 1.0.0
 */

let chart = new Chart();

// add nodes
chart.insert([], new Member("Ben"));
chart.insert([Node.collection[0]], new Member("Tom"));
chart.insert([Node.collection[0]], new Member("Mark"));
chart.insert([Node.collection[1]], new Member("John"));
chart.insert([Node.collection[2], Node.collection[3]], new Member("Tim"));

chart.print();