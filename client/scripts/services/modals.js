'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('modals', function () {

  var login = $("#login").modal({
                backdrop: 'static',
                keyboard: false
              });
  
  var newConversation = $("#new-conversation").modal({
                          show: false
                        });

  return {
    login: login,
    newConversation: newConversation
  };
});