'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('sockets', function ($q) {

  var authenticate = function(socket, user) {
    var deferred = $q.defer();
    socket.emit('authentication', user);
    
    socket.on('authorized', function() {
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
    
    setTimeout(function() { deferred.resolve() }, 1000);
    
    return deferred.promise;
  };
  
  var defineSocket = function(socket) {
    //define socket properties 
  };
  
  var getConversation = function(socket) {
    //get details on a conversation
  };

  return {
    authenticate: authenticate,
    getBasicInfo: getBasicInfo,
    defineSocket: defineSocket
  };
});