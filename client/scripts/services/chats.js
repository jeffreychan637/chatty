'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('chats', function () {

  var getRecipientandUnread = function(chat, user) {
    if (chat.origReceiver == user) {
      return {recipient: chat.origSender,
              unread: chat.origReceiverUnread
             };
    } else {
      return {recipient: chat.origSender,
              unread: chat.origReceiverUnread
             };
    }
  };

  var getLatest = function(messages) {
    console.log(messages);
    var latestMessage = messages[messages.length - 1];
    console.log(latestMessage);
    return {message: latestMessage.content,
            time: getTime(latestMessage.time)
           }
  };

  var getTime = function(unixTime) {
    var messageTime = new Date(unixTime);
    console.log(messageTime);
    var curTime = new Date();
    if (curTime.getDate() == messageTime.getDate()
        && curTime.getMonth() == messageTime.getMonth()
        && curTime.getYear() == messageTime.getYear()) {
      return messageTime.toLocaleTimeString();
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  var getConversationInfo = function(chat, user) {
    console.log(chat);
    var newChat = getRecipientandUnread(chat, user);
    var latest = getLatest(chat.messages);
    newChat.time = latest.time;
    newChat.latestMessage = latest.message;
    newChat.id = chat.id;
    newChat.messages = chat.messages;
    return newChat;
  };

  return {
    getConversationInfo: getConversationInfo
  };
});
