'use strict';

var database = require('./database');

var addUser = function(username) {
 database.addUser(username);
}

var setupSocket = function(user) {
 //break setup into multiple functions
  database.getUserListSetup(user);
  getConversations(user);
  getMessages(user);
}

var getConversations = function(user) {
  user.socket.on('getConversations', function(conversationId) {
    var conversations = database.getConversations(user, conversationId, 10);
    user.socket.emit(conversations);
  });
};

var getMessages = function(user) {
  user.socket.on('getMessages', function(request) {
    var messages = database.getMessages(user, request, 20);
    user.socket.emit(messages);
  });
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
