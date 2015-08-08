'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('sockets', function ($q, $rootScope, $timeout, chats) {

  var data = {'lists': {'onlineList': [], 'userList': []},
              'cons': {'conversationsList' : [], 'gettingConvos': false},
              'messages': {'changedId': null, 'changedIndex': null}
             };

  var getListsData = function() {
    return data.lists;
  };

  var getConsData = function() {
    return data.cons;
  };

  var getMessagesData = function() {
    return data.messages;
  };

  var listDataChanged = 0,
      consDataChanged = 0,
      messagesDataChanged = 0;

  // var dataChanged = 0;

  var notAuthenticated = true;

  var checkListsData = function() {
    return listDataChanged;
  }

  var checkConsData = function() {
    return consDataChanged;
  }

  var checkMessagesData = function() {
    return messagesDataChanged;
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
                    defineSocket(socket, deferred, user.username);
                    socket.emit('authentication', user);
                    console.log("trying login again");
                 }
               }, 10000);

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
      data.lists.onlineList = onlineList;
      listDataChanged += 1;
      $rootScope.$apply();
    });

    socket.on('userList', function(serverData) {
      data.lists.userList = serverData.userList;
      listDataChanged += 1;
      $rootScope.$apply();
    });

    socket.on('initialMessage', function(response) {
      processMessage(response);
    });

    socket.on('onlineMessage', function(response) {
      processMessage(response);
      messagesDataChanged += 1;
      $rootScope.$apply();
    });

    socket.on('initialConversation', function(conversation) {
      processConversation(conversation, username, true);
    });

    socket.on('olderMessage', function(response) {
      processMessage(response);
    });

    socket.on('olderConversation', function(conversation) {
      console.log('older cons');
      processConversation(conversation, username, false);
    });
  };

  var getParentConversation = function(conversationId) {
    var i;
    for (i = 0; i < data.cons.conversationsList.length; i++) {
      if (data.cons.conversationsList[i].id == conversationId) {
        return {conversation: data.cons.conversationsList[i], index: i};
      }
    }
    return false;
  };

  var processConversation = function(conversation, username, initial) {
    console.log('latest conversation');
    console.log(conversation);
    //CURRENTLY ASSUMING CONVERSATIONS ARRIVE IN ORDER
    conversation = chats.getConversationInfo(conversation, username)
    if (initial) {
      data.cons.conversationsList.unshift(conversation);
    } else {
      console.log('trying to add to con list');
      var i;
      for (i = data.cons.conversationsList.length - 1; i >= 0; i--) {
        console.log(i);
        console.log(conversation.unixTime);
        console.log(data.cons.conversationsList[i].unixTime);
        if (conversation.unixTime < data.cons.conversationsList[i].unixTime) {
          console.log(i);
          data.cons.conversationsList.splice(i + 1, 0, conversation);
          console.log(data.cons.conversationsList);
          break;
        }
      }
      data.cons.gettingConvos = false;
    }
    console.debug(data.cons.conversationsList);
    //not updating changedId and changedIndex
    consDataChanged += 1;
    console.info(data.cons.gettingConvos);
    $rootScope.$apply();
  };

  var processMessage = function(response) {
    console.log(response);
    //ASSUMING MESSAGES ARRIVE IN ORDER
    var result = getParentConversation(response.conversationId);
    // if (!conversation) {
    //   console.log('going to sleep');
    //   setTimeout(function() {console.log('wokeup from sleep')}, 2000);
    // }
    if (result) {
      var conversation = result.conversation;
      var conIndex = result.index;
      conversation.messages.push(response.message);
      chats.updateConversationInfo(conversation, response.message.time);
      console.log('updated conversation');
      console.log(conversation);
      data.cons.conversationsList.splice(conIndex, 1);
      data.cons.conversationsList.unshift(conversation);
      data.messages.changedId = conversation.id;
      data.messages.changedIndex = 0;
      consDataChanged += 1;
      $rootScope.$apply();
    } else {
      console.warn('Got message with no conversation parent');
    }
  };

  var addToConversation

  var getConversations = function(socket) {
    //ASSUMES DATA.CONVERSATION IS SORTED
    if (!data.cons.gettingConvos) {
      data.cons.gettingConvos = true;
      console.log('getting conversations');
      var length = data.cons.conversationsList.length;
      var latestTime;
      if (length) {
        latestTime = data.cons.conversationsList[length - 1].unixTime - 1;
      } else {
        latestTime = Date.now();
      }
      consDataChanged += 1;
      $rootScope.$apply();
      $timeout(function() {
        data.cons.gettingConvos = false;
        consDataChanged += 1;
        $rootScope.$apply();
      }, 2000);
      socket.emit('getConversations', latestTime);
    }
  };

  var getMessages = function(socket, conversation) {
    console.log('getting messages');
    var latestTime;
    if (conversation.messages) {
      console.log(conversation.messages);
      latestTime = conversation.messages[0].time - 1;
    } else {
      latestTime = Date.now();
    }
    socket.emit('getMessages', {conversationId: conversation.id,
                                latestTime: latestTime});
  };

  var sendConversation = function(socket, conversation) {
    socket.emit('sendConversation', conversation);
  };

  var sendMessage = function(socket, message, conversationId) {
    socket.emit('sendMessage', {message: message,
                                conversationId: conversationId});
  };

  var readMessage = function(socket, conversationId) {
    socket.emit('readMessage', conversationId);
  };

  var disconnect = function(socket) {
    socket.emit('disconnect');
  };

  return {
    reload: reload,
    authenticate: authenticate,
    defineSocket: defineSocket,
    getListsData: getListsData,
    getConsData: getConsData,
    getMessagesData: getMessagesData,
    checkListsData: checkListsData,
    checkConsData: checkConsData,
    checkMessagesData: checkMessagesData,
    getConversations: getConversations,
    getMessages: getMessages,
    sendConversation: sendConversation,
    sendMessage: sendMessage,
    readMessage: readMessage,
    disconnect: disconnect
  };
});
