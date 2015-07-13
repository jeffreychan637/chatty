'use strict';
/*global $:false, FB:false, jQuery:false */

angular.module('chatty').factory('server', function ($http, $q) {

  var postUserSignup = function(user) {
    console.log(user);
    var deferred = $q.defer();
    $http({
            method: 'POST',
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
            deferred.reject(message);
          });
    return deferred.promise;
  };

  return {
    postUserSignup: postUserSignup
  };
});