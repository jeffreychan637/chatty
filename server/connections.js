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
  storeConversation(user);
  storeMessage(user);
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

var storeConversation = function(user) {
    user.socket.on('sendConversation', function(conversation) {
        //should verify conversation

        database.storeConversation(user, conversation);
    });
};

var storeMessage = function(user) {
    user.socket.on('sendMessage', function(messageInfo) {
        //should verify message details
        database.storeMessage(user, messageInfo);
    });
};

var verifyConversation = function(user, conversation) {
    var convoObject = {}
    convoObject.origSender = user.username;
    if (conversation.origRecipient) {
        convoObject.origRecipient = conversation.origRecipient;
    } else {
        return false;
    }
};

var verifyMessage = function() {

};

module.exports = {
  addUser: addUser,
  setupSocket: setupSocket,
  storeConversations: storeConversation,
  storeMessages: storeMessage
}
