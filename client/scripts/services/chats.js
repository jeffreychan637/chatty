'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('chats', function () {

  var getRecipientandUnread = function(chat, username) {
    console.log(chat.origRecipient);
    console.log(username);
    console.log('WTFFFFFF');
    if (chat.origRecipient == username) {
      return {recipient: chat.origSender,
              unread: chat.origRecipientUnread || 0
             };
    } else {
      return {recipient: chat.origRecipient,
              unread: chat.origSenderUnread || 0
             };
    }
  };

  var getLatest = function(messages) {
    console.log(messages);
    if (messages) {
      console.log(messages[messages.length - 1]);
      return messages[messages.length - 1].content;
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

  var getConversationInfo = function(chat, username) {
    var newChat = getRecipientandUnread(chat, username);
    newChat.unixTime = chat.time;
    newChat.time = getTime(chat.time);
    //newChat.latestMessage = getLatest(chat.messages);
    newChat.id = chat.id;
    newChat.messages = [];
    return newChat;
  };

  var updateConversationInfo = function(chat, time) {
    console.log('updating conversation');
    chat.unixTime = time;
    chat.time = getTime(chat.unixTime);
    chat.latestMessage = getLatest(chat.messages);
  };

  return {
    getConversationInfo: getConversationInfo,
    updateConversationInfo: updateConversationInfo
  };
});
