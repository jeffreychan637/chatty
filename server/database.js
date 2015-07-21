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
        conversationsRef.child(snapshot.val().conKey).once('value',
          function(conSnapshot) {
            console.log('got conversation from db');
            console.log(conSnapshot.val());
            callbacks.conversation(conSnapshot.val());
        });
        var messageRequest = {conversationId: snapshot.val().conKey,
                              latestTime: latestTime
                             };
        getMessages(messageRequest, callbacks.message);
      }
    }
  );
};

var getMessages = function(request, callback) {
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

var storeConversation = function(conversation, messages) {
  var sender = conversation.origSender;
  var recipient = conversation.origRecipient;

  var conRef = conversationsRef.push(conversation);
  var conRefInUser = {'conKey' : conRef.key(), 'time' : messages.time};

  usersRef.child(sender).child(recipient).update(conRefInUser);
  usersRef.child(recipient).child(sender).update(conRefInUser);

  messagesRef.child(conRef.key()).push(messages);
  console.log('conversation stored');
};

var storeMessage = function(message, conversationId) {
  //what if conversation not created yet?
  console.log(conversationId);

  var conRef = conversationsRef.child(conversationId);

  var time = {'time': message.time};
  conRef.update(time);

  messagesRef.child(conversationId).push(message);

  conRef.child('origSender').once('value', function (sender) {
    conRef.child('origRecipient').once('value', function(recipient) {
      sender = sender.val();
      recipient = recipient.val();
      usersRef.child(sender).child(recipient).update(time);
      usersRef.child(recipient).child(sender).update(time);
    });
  });
};

module.exports = {
  getConversations: getConversations,
  getMessages: getMessages,
  addUser: addUser,
  getUserListSetup: getUserListSetup,
  storeConversation: storeConversation,
  storeMessage: storeMessage
};
