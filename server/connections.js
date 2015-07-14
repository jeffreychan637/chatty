'use strict';

var database = require('./database');

var addUser = function(username) {
 database.addUser(username);
}

var setupSocket = function(user) {
 //break setup into multiple functions
  database.getUserListSetup(user);
  handleConversations(user);
  handlesMessages(user);
}

var handleConversations = function(user) {
  user.socket.on("getConversations", function(conversationId) {
    var conversations = database.getConversations(user, conversationId, 10);
    user.socket.emit(conversations);
  });
};

var handleMessages = function(user) {
  user.socket.on("getMessages", function(request)) {
    var messages = database.getMessages(user, request, 20);
    user.socket.emit(messages);
  });
};

module.exports = {
  addUser: addUser,
  setupSocket: setupSocket
}
