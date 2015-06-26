'use strict';

var path = require('path'),
    express = require('express');

var app = express(),
    server = app.listen(3000, '127.0.0.1'),
    io = require('./sockets')(server);

app.use(express.static('client'));
app.use(express.static('../client'));


app.get('/', function(req, res) {
      res.status(200);
      res.set('Content-Type', 'text/html');
      res.sendFile(path.resolve(__dirname + '/../client/views/index.html'));
    });

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


