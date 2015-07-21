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
    getConversations(user, lastestTime);
  })
  user.socket.on('getMessages', function(request) {
    getMessages(user, request);
  })
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
