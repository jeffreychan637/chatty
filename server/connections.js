'use strict';

var database = require('./database');

var addUser = function(username) {
 database.addUser(username);
};

var setupSocket = function(user) {
  var callbackUserList = function(userList) {
    user.socket.emit('userList', {userList: userList});
    user.socket.broadcast.emit('userList', {userList: userList});
  }
  database.getUserListSetup(callbackUserList);

  user.socket.on('getConversations', function(lastestTime) {
    console.log('GETTING CONVERSATIONS');
    console.log(lastestTime);
    if (typeof lastestTime == 'number') {
      console.log('yep - convos');
      getConversations(user, lastestTime);
    }
  });
  user.socket.on('getMessages', function(request) {
    console.log('GETTING MESSAGES');
    console.log(request);
    var verifiedRequest = verifyRequest(request);
    if (verifiedRequest) {
      console.log('request verified');
      getMessages(user, verifiedRequest);
    }
  });

  user.socket.on('readMessage', function(conversationId) {
    console.log('got readMessage from socket');
    if (typeof conversationId == 'string') {
      database.readMessage(user.username, conversationId);
    }
  });
};

var verifyRequest = function(request) {
  var verifiedRequest = {};
  if (typeof request.conversationId == 'string') {
    verifiedRequest.conversationId = request.conversationId;
  } else {
    return false;
  }
  if (typeof request.lastestTime == 'number') {
    verifiedRequest.lastestTime = request.lastestTime;
  } else {
    return false;
  }
  return verifiedRequest;
};

var getConversations = function(user, lastestTime) {
  var conversationCallback = function(conversation) {
    user.socket.emit('newConversation', conversation);
  }
  var messageCallback = function(message) {
    user.socket.emit('newMessage', message);
  }
  var callbacks = {conversation: conversationCallback,
                   message: messageCallback
                  };
  database.getConversations(user.username, lastestTime, callbacks);
};

var getMessages = function(user, request) {
  var callback = function(message) {
    user.socket.emit('newMessage', message);
  }
  database.getMessages(request, callback);
};

var storeConversation = function(conversation, messages) {
  database.storeConversation(conversation, messages);
};

var storeMessage = function(message, conversationId) {
  database.storeMessage(message, conversationId);
};

var sendInitialData = function(user) {
  getConversations(user, Date.now());
};

module.exports = {
  addUser: addUser,
  setupSocket: setupSocket,
  storeConversation: storeConversation,
  storeMessage: storeMessage,
  sendInitialData: sendInitialData
}
