'use strict';

var Firebase = require("firebase");
var secrets = require("./secrets");

var firebaseRef = new Firebase(secrets.firebaseUrl);
var userListRef = new Firebase(secrets.firebaseUrl + '/userList');
var usersRef = new Firebase(secrets.firebaseUrl + '/users');
var conversationsRef = new Firebase(secrets.firebaseUrl + '/conversations');

var getConversations = function(id, amount) {

  return []
};

var getMessages = function(request, amount) {

  return [];
};

var addUser = function(username) {
  userListRef.push({
    username: username
  });
}

var getUserListSetup = function(user) {
  //use username to remove that person from list
  // Attach an asynchronous callback to read the data at our posts reference
  console.log("setting up socket for: " + user.username);
  userListRef.on("value", function(snapshot) {
    console.log(snapshot.val());
    var userObject = snapshot.val();
    var userList = []
    for (var key in userObject) {
      console.log(userObject[key].username);
      userList.push(userObject[key].username);
    }
    console.log(userList);
    console.log("emitting userlist for: " + user.username);
    user.socket.emit('userList', {userList: userList, emit: 5, user: user.username});
    user.socket.broadcast.emit('userList', {userList: userList, broadcast: 5, user: user.username});
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}

var storeConversation = function(conversation, messages) {
  var conRef = conversationsRef.push(conversation);
  var newConRefUser = {};
  var newConRefRecipient = {};
  var conRefInUser = {'conKey' : conRef.key(), 'time' : messages.time};
  newConRefUser[conversation.origRecipient] = conRefInUser;
  newConRefRecipient[conversation.origSender] = conRefInUser;
  usersRef.child(conversation.origSender).update(newConRefUser);
  usersRef.child(conversation.origRecipient).update(newConRefRecipient);
  conRef.child('messages').push(messages);
  console.log('conversation stored');
};

var storeMessage = function(message, conversationId) {
  //what if conversation not created yet?
  console.log(conversationId);
  var conRef = conversationsRef.child(conversationId);
  var time = {'time': message.time};
  conRef.update(time);
  conRef.child('messages').push(message);
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
