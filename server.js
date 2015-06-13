'use strict';

var express = require('express');

var app = express(),
    server = app.listen(3000, '127.0.0.1');

app.get('/', function(req, res) {
      res.status(200);
      res.set('Content-Type', 'text/html');
      res.sendFile(__dirname + '/index.html');
    });



