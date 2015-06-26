'use strict';

var database = require('./database');

var setupSocket = function(user) {
 //break setup into multiple functions
  handleConversations(user);
}

var handleConversations = function(user) {
  user.socket.on("get20Conversations", function() {
    var conversations = database.getUserConversations(20); 
  });
};

module.exports = {
  setupSocket: setupSocket
}
