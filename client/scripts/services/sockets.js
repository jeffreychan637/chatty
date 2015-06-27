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
  
  var getBasicInfo = function(socket) {
    var deferred = $q.defer();
    deferred.resolve();
    return deferred.promise;
  };
  
  var defineSocket = function(socket) {
    //define socket properties 
  }

  return {
    authenticate: authenticate,
    getBasicInfo: getBasicInfo,
    defineSocket: defineSocket
  };
});