/**
 * Created by DrTone on 25/01/2017.
 */

//Incorporate socket io
var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function(socket) {
    console.log("User connected");
    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    });
});

server.listen(3000, function() {
    console.log("Listening on port 3000");
});
