'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('modals', function () {

  var login = $("#login").modal({
                backdrop: 'static',
                keyboard: false,
              });
    

  return {
    login: login
  };
});