/**
 * This file creates the server and handles routing files to the client.
 * @author Aidan Donley
 * @version 1.0
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var server = http.Server(app);

var port_ = 8000;

app.set('port', port_);
app.use('/client', express.static(__dirname + '/client'));

// Route the default link to index.html
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, '/client/index.html'));
});

// Starts the server and listens
server.listen(port_, function() {
	console.log('Listening on port ' + port_);
});
