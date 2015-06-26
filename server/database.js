'use strict';

var Firebase = require("firebase");
var secret = require("./secret");

var myFirebaseRef = new Firebase(secret.firebaseUrl);

var getUserConversations = function(amount) {

};





module.exports = {
  getUserConversations: getUserConversations
};
