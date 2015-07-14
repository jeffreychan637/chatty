'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('chats', function () {

  var getRecipientandUnread = function(chat, user) {
    if (chat.firstUser == user) {
      return {recipient: chat.secondUser,
              unread: chat.firstUserPostsUnread
             };
    } else {
      return {recipient: chat.firstUser,
              unread: chat.secondUserPostsUnread
             };
    }
  };

  var getLatest = function(messages) {
    return messages[messages.length - 1].contents
  };

  var getTime = function(message) {
    var unixTime = message.time;
    var messageTime = new Date(unixTime * 1000);
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
    var newChat = getRecipientandUnread(chat, user);
    newChat.latestMessage = getLatest(chat.messages);
    newChat.date = getTime(newChat.latestMessage);
    newChat.messages = chat.messages;
    return newChat;
  };

  return {
    getConversationInfo: getConversationInfo
  };
});
