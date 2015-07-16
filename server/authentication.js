'use strict';

var Firebase = require('firebase'),
    connections = require('./connections'),
    secrets = require('./secrets');

var firebaseRef = new Firebase(secrets.firebaseUrl);

var onlineList = [];
var socketList = [];

var removeStringFromList = function(list, value) {
  var index = list.indexOf(value);
  if (index !== -1) {
   list.splice(index, 1);
  }
  return list
};

//TEST THIS
var removeObjectFromSocketList = function(list, user) {
  var i, index;
  for (i = 0; i < list.length; i++) {
    if (list[i].username == user) {
      index = i;
      break;
    }
  }
  list.splice(index, 1);
  return list;
};

var contains = function(array, value) {
  return array.indexOf(value) > -1;
}

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
      connections.addUser(user.username);
      callback(null, true, responseObject);
    }
  });

}

var authenticate = function(userLogin, callback) {
  console.log("username: " + userLogin.username + "\n");
  console.log("password: " + userLogin.password + "\n");

  firebaseRef.authWithPassword({
    email    : userLogin.username + "@valid.email",
    password : userLogin.password
  }, function(error, authData) {
    if (error) {
      var errorMessage = error.code.toLowerCase();
      if (contains(errorMessage, "invalid") || contains(errorMessage, "exist")) {
        callback(new Error("User Error"), false);
      } else {
        callback(new Error("Server Error"), false);
      }
      console.log(error.code);
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
  if (!contains(onlineList, user.username)) {
    onlineList.push(user.username);
    socketList.push(user);
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
    onlineList = removeStringFromList(onlineList, user.username);
    socketList = removeObjectFromSocketList(socketList, user.username);
    console.log(onlineList);
    console.log("disconnected");
    user.socket.broadcast.emit('onlineList', onlineList);
    //do some other cleanup? - actually setup cleanup in the connections file
  });

  user.socket.on('sendConversation', function(conversation) {
    //Conversation.firstUser is original sender so secondUser is recipient
    connections.storeConversation(conversation);
  });

  user.socket.on('sendMessage', function(message) {
    connections.storeMessage(message);
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


  return {
    io: io,
    createUser: createUser
  }

}

