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

var removeObjectFromSocketList = function(list, user) {
  var i, index;
  console.log(index);
  for (i = 0; i < list.length; i++) {
    if (list[i].username == user) {
      index = i;
      break;
    }
  }
  if (index != null) {
    list.splice(index, 1);
  }
  return list;
};

var getObjectFromSocketList = function(list, user) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].username == user) {
      return list[i];
    }
  }
}

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
  user.socket.emit('authenticated');
  console.log('user has been authorized');
  setupSocket(user);
  if (!contains(onlineList, user.username)) {
    onlineList.push(user.username);
  }
  socketList = removeObjectFromSocketList(socketList, user.username);
  socketList.push(user);
  console.log(onlineList);
  console.log(socketList);
  user.socket.emit('onlineList', onlineList);
  user.socket.broadcast.emit('onlineList', onlineList);
};

var setupSocket = function(user) {
  connections.setupSocket(user);

  user.socket.on('disconnect', function() {
    onlineList = removeStringFromList(onlineList, user.username);
    socketList = removeObjectFromSocketList(socketList, user.username);
    console.log(onlineList);
    console.log(socketList);
    console.log("disconnected");
    user.socket.broadcast.emit('onlineList', onlineList);
    //do some other cleanup? - actually setup cleanup in the connections file
  });

  user.socket.on('sendConversation', function(conversation) {
    console.log(conversation);
    console.log('got conversation');
    var verifiedConvo = verifyConversation(user, conversation);
    if (verifiedConvo) {
      connections.storeConversation(verifiedConvo.conversation,
                                    verifiedConvo.messages, sendToOnline);
    }
    //failing silentily
  });

  user.socket.on('sendMessage', function(messageObject) {
    //send to user already based on online list
    //probably should set up something for socket to emit a message back to the client
    console.log('got message');
    console.log(messageObject);
    var verifiedMessage = verifyMessage(user, messageObject.message);
    if (verifiedMessage && typeof messageObject.conversationId == 'string') {
      connections.storeMessage(verifiedMessage, messageObject.conversationId,
                               sendToOnline);
    }
    //failing silently
  });

  connections.sendInitialData(user);
};

var sendToOnline = function(sender, recipient, object, isMessage) {
  console.log(recipient);
  console.log(onlineList);
  if (contains(onlineList, recipient)) {
    var recSocket = getObjectFromSocketList(socketList, recipient);
    if (isMessage) {
      recSocket.socket.emit('newMessage', object);
    } else {
      recSocket.socket.emit('newConversation', object);
    }
  }
  if (sender) {
    var sendSocket = getObjectFromSocketList(socketList, sender);
    if (isMessage) {
      sendSocket.socket.emit('newMessage', object);
    } else {
      sendSocket.socket.emit('newConversation', object)
    }
  }
}

var verifyConversation = function(user, conversation) {
    var convoObject = {};
    if (typeof conversation.origRecipient == 'string') {
        convoObject.origRecipient = conversation.origRecipient;
    } else {
        console.log(conversation.origRecipient);
        console.log('failed1');
        return false;
    }
    if (Array.isArray(conversation.messages) && conversation.messages[0]) {
        var messageObject = verifyMessage(user, conversation.messages[0]);
        if (!messageObject) {
            console.log('failed2');
            return false;
        }
    } else {
        console.log('not array');
        return false;
    }
    convoObject.origSender = user.username;
    convoObject.origSenderUnread = 0;
    convoObject.origRecipientUnread = 1;
    convoObject.time = messageObject.time;
    console.log(convoObject);
    return {conversation: convoObject, messages: messageObject};
};

var verifyMessage = function(user, message) {
  console.log(message);
  var messageObject = {};
  if (typeof message.content == 'string') {
    messageObject.content = message.content;
  } else {
    console.log('failed3');
    return false;
  }
  messageObject.time = Date.now();
  messageObject.sender = user.username;
  console.log(messageObject);
  return messageObject;
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

