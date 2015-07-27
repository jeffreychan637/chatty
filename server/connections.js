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

  user.socket.on('getConversations', function(latestTime) {
    console.log('GETTING CONVERSATIONS');
    console.log(latestTime);
    if (typeof latestTime == 'number') {
      console.log('yep - convos');
      getConversations(user, latestTime);
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
  console.log(typeof request.conversationId);
  console.log(typeof request.latestTime);
  if (typeof request.conversationId == 'string') {
    verifiedRequest.conversationId = request.conversationId;
  } else {
    return false;
  }
  if (typeof request.latestTime == 'number') {
    verifiedRequest.latestTime = request.latestTime;
  } else {
    return false;
  }
  return verifiedRequest;
};

var getConversations = function(user, latestTime) {
  var conversationCallback = function(conversation) {
    user.socket.emit('newConversation', conversation);
  }
  var messageCallback = function(message) {
    user.socket.emit('newMessage', message);
  }
  var callbacks = {conversation: conversationCallback,
                   message: messageCallback
                  };
  database.getConversations(user.username, latestTime, callbacks);
};

var getMessages = function(user, request) {
  var callback = function(message) {
    user.socket.emit('newMessage', message);
  }
  database.verifyMessagesRequest(user.username, request, callback);
};

var storeConversation = function(conversation, messages, callback) {
  database.storeConversation(conversation, messages, callback);
};

var storeMessage = function(message, conversationId, callback) {
  database.storeMessage(message, conversationId, callback);
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
