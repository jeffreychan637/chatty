'use strict';

var Firebase = require("firebase");
var secrets = require("./secrets");

var firebaseRef = new Firebase(secrets.firebaseUrl);
var usersRef = new Firebase(secrets.firebaseUrl + '/users');
var conversationsRef = new Firebase(secrets.firebaseUrl + '/conversations');

var getUserConversations = function(amount) {

};

var addUser = function(username) {
  usersRef.push({
    username: username
  });
}

var getUserListSetup = function(user) {
  //use username to remove that person from list
  // Attach an asynchronous callback to read the data at our posts reference
  console.log("setting up socket for: " + user.username);
  usersRef.on("value", function(snapshot) {
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
              
module.exports = {
  getUserConversations: getUserConversations,
  addUser: addUser,
  getUserListSetup: getUserListSetup
};
