'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('sockets', function ($q) {

  var authenticate = function(socket, user) {
    var deferred = $q.defer();
    socket.emit('authentication', user);
    
    socket.on('authorized', function() {
      defineSocket(socket);
      deferred.resolve();
    });
    
    socket.on('unauthorized', function(err){
      console.log("There was an error with the authentication:", err.message);
      deferred.reject();
    });
    
    return deferred.promise;
  }
  
  //used to load basic info  - lastest conversations and online list
  var getBasicInfo = function(socket) {
    var deferred = $q.defer();
    
    //request online list
    //request latest conversations
    getOnlineList(socket);
    
    setTimeout(function() { deferred.resolve() }, 1000);
    
    return deferred.promise;
  };
  
  var defineSocket = function(socket) {
    //define socket properties
    socket.on('onlineList', function(onlineList) {
      //run some kind of callback to index.js that causes the online list to be updated
      console.log(onlineList);
    });
  };
  
  var getConversation = function(socket) {
    //get details on a conversation
  };
  
  var getOnlineList = function(socket) {
    console.log('emit onlineList');
    socket.emit('onlineList');
  };

  return {
    authenticate: authenticate,
    getBasicInfo: getBasicInfo,
    defineSocket: defineSocket
  };
});