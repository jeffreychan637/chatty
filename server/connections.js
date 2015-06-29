'use strict';

var database = require('./database');

var addUser = function(username) {
 database.addUser(username); 
}

var setupSocket = function(user) {
 //break setup into multiple functions
  database.getUserListSetup(user);
  handleConversations(user);
}

var handleConversations = function(user) {
  user.socket.on("get20Conversations", function() {
    var conversations = database.getUserConversations(20); 
  });
};

module.exports = {
  addUser: addUser,
  setupSocket: setupSocket
}
