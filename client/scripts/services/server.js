'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('server', function ($http, $q) {

  var postUserLogin = function(user) {
    var deferred = $q.defer();
    $http({
            method: 'PUT',
            url: "/userSignup",
            timeout: 10000,
            data: user
          }).success(function (message, status) {
            if (status === 200) {
              deferred.resolve();
            } else {
              console.warn('The server is returning an incorrect status.');
              deferred.reject();
            }
          }).error(function (message, status) {
            console.debug(status, message);
            deferred.reject();
          });
    return deferred.promise;
  };

  return {
    postUserSignup: postUserSignup
  };
});