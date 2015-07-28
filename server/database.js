'use strict';

var Firebase = require("firebase");
var secrets = require("./secrets");

var userListRef = new Firebase(secrets.firebaseUrl + '/userList');
var usersRef = new Firebase(secrets.firebaseUrl + '/users');
var conversationsRef = new Firebase(secrets.firebaseUrl + '/conversations');
var messagesRef = new Firebase(secrets.firebaseUrl + '/messages');

var CONVERSATIONS_SENT_PER_TIME = 10;
var MESSAGES_SENT_PER_TIME = 20;

var getConversations = function(username, latestTime, callbacks) {
  var user = usersRef.child(username);
  user.orderByChild('time').endAt(latestTime).limitToLast(
    CONVERSATIONS_SENT_PER_TIME).on('child_added',
    function(snapshot) {
      console.log('got con key from db');
      console.log(snapshot.val());
      if (snapshot.val() != null) {
        conversationsRef.child(snapshot.val().conId).once('value',
          function(conSnapshot) {
            console.log('got conversation from db');
            console.log(conSnapshot.val());
            var conversation = conSnapshot.val();
            conversation.id = snapshot.val().conId;
            callbacks.conversation(conversation);
        });
        var messageRequest = {conversationId: snapshot.val().conId,
                              latestTime: latestTime
                             };
        getMessages(messageRequest, callbacks.message);
      }
    }
  );
};

var verifyMessagesRequest = function(username, request, callback) {
  console.log('verifying Messages Request');
  var conRef = conversationsRef.child(request.conversationId);
  conRef.child('origSender').once('value', function (sender) {
    conRef.child('origRecipient').once('value', function(recipient) {
      console.log(username + ' ' + sender + ' ' + recipient);
      if ((username == sender.val()) || (username == recipient.val())) {
        console.log('REQUEST VALID');
        getMessages(request, callback);
      }
    });
  });
};

var getMessages = function(request, callback) {
  console.log('getting messages...!');
  var messages = messagesRef.child(request.conversationId);
  messages.orderByChild('time').endAt(request.latestTime).limitToLast(
    MESSAGES_SENT_PER_TIME).on('child_added',
    function(snapshot) {
      console.log('got message from db');
      console.log(snapshot.val());
      if (snapshot.val() != null) {
        var message = {conversationId: request.conversationId,
                       message: snapshot.val()
                      };
        callback(message);
      }
    }
  );
};

var addUser = function(username) {
  userListRef.push({
    username: username
  });
}


var getUserListSetup = function(callback) {
  // Attach an asynchronous callback to read the data at our posts reference
  userListRef.on("value", function(snapshot) {
    console.log(snapshot.val());
    var userObject = snapshot.val();
    var userList = []
    for (var key in userObject) {
      console.log(userObject[key].username);
      userList.push(userObject[key].username);
    }
    console.log(userList);
    callback(userList);
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}

var storeConversation = function(conversation, messages, callback) {
  var sender = conversation.origSender;
  var recipient = conversation.origRecipient;

  var conRef = conversationsRef.push(conversation);
  var id = conRef.key();
  var conRefInUser = {'conId' : id, 'time' : messages.time};

  usersRef.child(sender).child(recipient).update(conRefInUser);
  usersRef.child(recipient).child(sender).update(conRefInUser);

  messagesRef.child(id).push(messages);

  conversation.id = id;
  callback(sender, recipient, conversation, false);
  callback(sender, recipient, {conversationId: id, message: messages}, true);
  console.log('conversation stored');
};

var storeMessage = function(message, conversationId, callback) {
  //what if conversation not created yet?
  console.log(conversationId);

  var conRef = conversationsRef.child(conversationId);

  conRef.child('origSender').once('value', function (sender) {
    conRef.child('origRecipient').once('value', function(recipient) {
      sender = sender.val();
      recipient = recipient.val();
      console.log('verifying message sender');
      if ((message.sender == sender) || (message.sender == recipient)) {
        console.log('message sender is valid');
        var time = {'time': message.time};
        conRef.update(time);

        messagesRef.child(conversationId).push(message);

        usersRef.child(sender).child(recipient).update(time);
        usersRef.child(recipient).child(sender).update(time);
        var recipientUnread = getUnread(sender, message.sender, 0);
        conRef.child(recipientUnread).transaction(function(currValue) {
          return (currValue || 0) + 1;
        }, function() {}, false);
        var messageObject = {conversationId: conversationId,
                             message: message
                            };
        if (recipientUnread == 'origSenderUnread') {
          callback(null, sender, messageObject, true);
        } else {
          callback(null, recipient, messageObject, true);
        }
      } else {
        console.log('verify failed');
      }
    });
  });
};

var readMessage = function(username, conversationId) {
  console.log('got read message');
  var conRef = conversationsRef.child(conversationId);
  conRef.child('origSender').once('value', function(sender) {
    var senderUnread = getUnread(sender.val(), username, 1);
    console.log(senderUnread);
    conRef.child(senderUnread).transaction(function(currValue) {
      console.log('setting to zero');
      return 0;
    }, function() {}, false);
  });
};

var getUnread = function(senderDB, senderClient, chooseSender) {
  console.log(senderDB);
  //console.log();
  if (senderDB == senderClient) {
    if (chooseSender) {
      return 'origSenderUnread';
    } else {
      return 'origRecipientUnread';
    }
  } else {
    if (chooseSender) {
      return 'origRecipientUnread';
    } else {
      return 'origSenderUnread';
    }
  }
};

module.exports = {
  getConversations: getConversations,
  verifyMessagesRequest: verifyMessagesRequest,
  getMessages: getMessages,
  addUser: addUser,
  getUserListSetup: getUserListSetup,
  storeConversation: storeConversation,
  storeMessage: storeMessage,
  readMessage: readMessage
};
