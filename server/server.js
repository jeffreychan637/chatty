'use strict';

var path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser');

var app = express(),
    server = app.listen(process.env.PORT || 3000),
    authentication = require('./authentication')(server);

app.use(bodyParser.json());
app.use(express.static('client'));
app.use(express.static('../client'));

app.get('/', function(req, res) {
        res.status(200);
        res.set('Content-Type', 'text/html');
        res.sendFile(path.resolve(__dirname + '/../client/views/index.html'));
});

app.post('/userSignup', function(req, res) {
          var user = req.body;
          authentication.createUser(user, sendResponse, res);
});

var sendResponse = function(error, success, res) {
  if (success) {
    res.status(200).send();
  } else {
    res.status(500).send(error);
  }
};
