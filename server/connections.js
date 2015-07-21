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
    if (typeof lastestTime == 'number') {
      getConversations(user, lastestTime);
    }
  })
  user.socket.on('getMessages', function(request) {
    var verifiedRequest = verifyRequest(request);
    if (verifiedRequest) {
      getMessages(user, verifiedRequest);
    }
  })
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
  var callback = function(conversations) {
    user.socket.emit(conversations);
  }
  database.getConversations(user.username, lastestTime, callback);
};

var getMessages = function(user, request) {
  var callback = function(messages) {
    user.socket.emit(messages);
  }
  database.getMessages(request, callback);
};

var storeConversation = function(conversation, messages) {
  database.storeConversation(conversation, messages);
};

var storeMessage = function(message, conversationId) {
  database.storeMessage(message, conversationId);
};

module.exports = {
  addUser: addUser,
  setupSocket: setupSocket,
  storeConversation: storeConversation,
  storeMessage: storeMessage
}
