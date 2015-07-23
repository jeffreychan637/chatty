'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('sockets', function ($q, $rootScope, chats) {

  var data = {'conversationsList' : []};

  var getData = function() {
    return data;
  }

  var dataChanged = 0;

  var notAuthenticated = true;

  var checkData = function() {
    return dataChanged;
  }

  var reload = function(src) {
    $('script[src="' + src + '"]').remove();
    $('<script>').attr('src', src + '?cachebuster='+ new Date().getTime()).appendTo('head');
  };

  var authenticate = function(socket, user) {
    var deferred = $q.defer();
    socket.user = user.username; //maybe remove this - should probably remove this
    console.log("authenticating");

    defineSocket(socket, deferred, user.username);

    socket.emit('authentication', user);

    setInterval(function() {
                 if (notAuthenticated) {

                    reload('//cdn.socket.io/socket.io-1.3.5.js');
                    socket = io();
                    defineSocket(socket, deferred);
                    socket.emit('authentication', user);
                    console.log("trying login again");
                 }
               }, 6000);

    return deferred.promise;
  }

  var defineSocket = function(socket, deferred, username) {
    socket.on('authenticated', function() {
      notAuthenticated = false;
      deferred.resolve(socket);
    });

    socket.on('unauthorized', function(err){
      notAuthenticated = false;
      console.log("There was an error with the authentication:", err.message);
      deferred.reject(err.message);
    });

    socket.on('onlineList', function(onlineList) {
      data.onlineList = onlineList;
      dataChanged += 1;
      $rootScope.$apply();
    });

    socket.on('userList', function(serverData) {
      data.userList = serverData.userList;
      dataChanged += 1;
      console.log(dataChanged);
      $rootScope.$apply();
    });

    socket.on('newMessage', function(response) {
      console.log(response);
      var conversation = getParentConversation(response.conversationId);
      if (conversation) {
        conversation.messages.push(response.message);
        conversation.latestMessage = response.message.content;
      } else {
        console.warn('Got message with no conversation parent');
      }
    });

    socket.on('newConversation', function(conversation) {
      console.log(conversation);
      //CURRENTLY ASSUMING CONVERSATIONS ARRIVE IN ORDER
      conversation = chats.getConversationInfo(conversation, username)
      data.conversationsList.unshift(conversation);
      console.debug(data.conversationsList);
      dataChanged += 1;
      $rootScope.$apply();
    });
  };

  var getParentConversation = function(conversationId) {
    var i;
    for (i = 0; i < data.conversationsList.length; i++) {
      if (data.conversationsList[i].id == conversationId) {
        return data.conversationsList[i];
      }
    }
    return false;
  };

  var getConversations = function(socket) {
    //ASSUMES DATA.CONVERSATION IS SORTED
    var length = data.conversationsList.length;
    var latestTime;
    if (length) {
      latestTime = data.conversationsList[length - 1].time;
    } else {
      latestTime = Date.now();
    }
    socket.emit('getConversations', {latestTime: latestTime});
    //provide some id so server knows where in the list you are
  };

  var getMessages = function(socket) {
    socket.emit('getMessages', {});
    //provide some id so server knows where in the list you are
    //provide conversation id too
  };

  var sendConversation = function(socket, conversation) {
    socket.emit('sendConversation', conversation);
  };

  var sendMessage = function(socket, message, conversationId) {
    socket.emit('sendMessage', {message: message,
                            conversationId: ''});//conversationId});
  };

//  var getOnlineList = function(socket) {
//    console.log('emit onlineList');
////    socket.emit('onlineList');
//    //I don't think you should ever be getting online list...it should be sent to you automatically...
//  };

  var disconnect = function(socket) {
    socket.emit('disconnect');
  };

  return {
    reload: reload,
    authenticate: authenticate,
    defineSocket: defineSocket,
    getData: getData,
    checkData: checkData,
    getConversations: getConversations,
    getMessages: getMessages,
    sendConversation: sendConversation,
    sendMessage: sendMessage,
    disconnect: disconnect
  };
});
