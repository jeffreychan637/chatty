'use strict';

var Firebase = require('firebase'),
    connections = require('./connections'),
    secrets = require('./secrets');

var firebaseRef = new Firebase(secrets.firebaseUrl);

var onlineList = [];

var removeFromList = function(list, value) {
  var index = list.indexOf(value);
  if (index !== -1) {
   list.splice(index, 1); 
  }
  return list
};

var createUser = function(user, callback, responseObject) {

  firebaseRef.createUser({
    email    : user.username + "@valid.email",
    password : user.password
  }, function(error, userData) {
    if (error) {
      console.log("Error creating user:", error);
      callback(error, false, responseObject);
    } else {
      console.log("Successfully created user account with uid:", userData.uid);
      callback(null, true, responseObject);
    }
  });
  
  connections.addUser(user.username);
  
}

var authenticate = function(userLogin, callback) {
  console.log("username: " + userLogin.username + "\n");
  console.log("password: " + userLogin.password + "\n");
  
  firebaseRef.authWithPassword({
    email    : userLogin.username + "@valid.email",
    password : userLogin.password
  }, function(error, authData) {
    if (error) {
      callback(error, false);
    } else {
      console.log("Authenticated successfully with payload:", authData);
      callback(null, true);
    }
  }, { remember: "none"});
}
  
var postAuthenticate = function(socket, data) {
  //maybe go to database and get user's ID instead and set that to socket instead
  //create a user
  var user = {
    socket: socket,
    username: data.username
  };
  console.log('user has been authorized');
  setupSocket(user);
  if (onlineList.indexOf(user.username) == -1) {
    onlineList.push(user.username);
  }
  console.log(onlineList);
  user.socket.emit('onlineList', onlineList);
  user.socket.broadcast.emit('onlineList', onlineList);
};

var setupSocket = function(user) {
  connections.setupSocket(user);
  
//  user.socket.on('onlineList', function() {
//    user.socket.emit('onlineList', onlineList);
//  }); 
  //should be ok to remove this - don't ever have to ask for online list.
  
  user.socket.on('disconnect', function() {
    onlineList = removeFromList(onlineList, user.username);
    console.log(onlineList);
    user.socket.broadcast.emit('onlineList', onlineList);
    //do some other cleanup? - actually setup cleanup in the connections file
  });
};

module.exports = function(server) {
  var io = require('socket.io').listen(server);
  
  require('socketio-auth')(io, {
    authenticate: authenticate, 
    postAuthenticate: postAuthenticate,
    timeout: 5000 //set to 1000 if possible
  });
  
  // set up other socket stuff
  
  
  return {
    io: io,
    createUser: createUser
  }
  
}
  