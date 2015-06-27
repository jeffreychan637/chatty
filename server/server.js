'use strict';

var path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser');

var app = express(),
    server = app.listen(3000, '127.0.0.1'),
    authentication = require('./authentication')(server);

app.use(bodyParser.json());
app.use(express.static('client'));
app.use(express.static('../client'));


app.get('/', function(req, res) {
        res.status(200);
        res.set('Content-Type', 'text/html');
        res.sendFile(path.resolve(__dirname + '/../client/views/index.html'));
});

//add a function to handle user signups! - do the actual signup in authentication.js

app.post('/userSignup', function(req, res) {
          var user = req.body;
          authentication.createUser(user, sendResponse, res);
});


var sendResponse = function(error, success, res) {
  if (success) {
    res.status(200).send();
  } else {
    res.status(500).send('Internal Server Error: ' + error);
  }
};
