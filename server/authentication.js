'use strict';

var Firebase = require('firebase');
var connections = require('./connections');
var secrets = require('./secrets');

var firebaseRef = new Firebase(secrets.firebaseUrl);

var verifyEnum = {
  SUCCESS: 0,
  WRONGPASSWORD: 1,
  NOUSER: 2
};

Object.freeze(verifyEnum);

var onlineList = [];

var removeFromList = function(list, value) {
  var index = list.indexOf(value);
  if (index !== -1) {
   list.splice(index, 1); 
  }
  return list
};

var authenticate = function(data, callback) {
  console.log(data);
  var response = verifyPassword(data);
  if (response == verifyEnum.SUCCESS) {
    callback(null, true); 
  } else if (response == verifyEnum.WRONGPASSWORD) {
    callback(null, false);
  } else {
    callback(new Error("No such User found"));
  }
};

var verifyPassword = function(userLogin) {
  console.log("username: " + userLogin.username + "\n");
  console.log("password: " + userLogin.password + "\n");
//  return verifyEnum.SUCCESS;
  
  firebaseRef.authWithPassword({
    email    : userLogin.username,
    password : userLogin.password
  }, function(error, authData) {
    if (error) {
      return verifyEnum.WRONGPASSWORD;
    } else {
      console.log("Authenticated successfully with payload:", authData);
      return verifyEnum.SUCCESS;
    }
  });
}
  
var postAuthenticate = function(socket, data) {
  //maybe go to database and get user's ID instead and set that to socket instead
  //create a user
  var user = {
    socket: socket,
    username: data.username
  };

  setupSocket(user);
  user.socket.emit("authorized");
  onlineList.push(user.username);
  console.log(onlineList);
  //braodcast online list here
};

var setupSocket = function(user) {
  connections.setupSocket(user);
  user.socket.on('disconnect', function() {
    onlineList = removeFromList(onlineList, user.username);
    console.log(onlineList);
    //broadcast new online list
    //do some other cleanup? - actually setup cleanup in the connections file
  });
};

module.exports = function(server) {
  var io = require('socket.io').listen(server);
  
  require('socketio-auth')(io, {
    authenticate: authenticate, 
    postAuthenticate: postAuthenticate,
    timeout: 2000 //set to 1000 if possible
  });
  
  // set up other socket stuff
  
  
  return io; 
  
}
  