var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var server = http.Server(app);

var port_ = 2000;

app.set('port', port_);
app.use('/client', express.static(__dirname + '/client'));

// Routing
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, '/client/index.html'));
});

// Starts the server.
server.listen(port_, function() {
	console.log('Starting server on port ' + port_);
});
