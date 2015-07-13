'use strict';

angular.module('chatty')
  .controller('chattyCtrl', function ($scope, $document, server, modals, sockets) {
    $document.ready(function() { 
						   
        var windowHeight = $(window).height();
        var leftover = windowHeight - $(".nav").height();
        $(".chats").css("height", leftover.toString() + "px");
        $(".user-list").css("height", leftover.toString() + "px");

        var replyMargin = 2 * parseInt($(".reply").css("margin-left"), 10);
        var replyPadding = 2 * parseInt($(".reply").css("padding-left"), 10);
        var replyBorder = 2 * parseInt($(".reply").css("border-width"), 10);
        var replyWidth = $(".reply-box").width() - replyMargin - replyPadding - replyBorder;
        $(".reply").css("width", replyWidth.toString() + "px");

        var remainingHeight = leftover - $(".reply-box").height();
        console.log(remainingHeight);
        $(".conversation-box").css("height", remainingHeight.toString() + "px");
		
		autosize($('#new-message'));
        autosize($('#reply'));
        
        $("#reply").on('autosize:resized', function() {
            console.log('textarea height updated');
            var remainingHeight = leftover - $(".reply-box").height();
            console.log(remainingHeight);
            $(".conversation-box").css("height", remainingHeight.toString() + "px");
        });
    
//    if ($("#y").height() > 21) {
//        $(""
//    };
    
//    $("body").css("max-height", windowHeight.toString() + "px");
        
	
    });
    
    var socket,
        data;
    $scope.userList = [];
    $scope.loading = false;
	$scope.loginError = false;
    
    $scope.$watch(function() {
                    console.log("checking data");
                    return sockets.checkData()
                  },
                  function() {
                    data = sockets.getData();
                    $scope.onlineList = data.onlineList;
                    if (data.userList && data.onlineList) {
                      console.log('current userList: ' + data.userList);
                      console.log('current onlineList: ' + data.onlineList);
                      var index = data.userList.indexOf($scope.username);
                      if (index > -1) {
                        data.userList.splice(index, 1);
                      }
                      console.log('spliced userList: ' + data.userList);
                      data.userList.sort(sortByOnline);
                      $scope.userList = data.userList;
                    }
                    console.log("saw change in data");
                    console.log(sockets.checkData());
                    console.log("sorted: " + $scope.userList);
    }, true);
  
    var sortByOnline = function(a, b) {
      var aOnline = contains($scope.onlineList, a);
      var bOnline = contains($scope.onlineList, b);
      if (aOnline && !bOnline) {
        return -1;
      } else if (!aOnline && bOnline) {
        return 1; 
      } else {
        if (a < b) {
          return -1;
        } else {
          return 1;
        }
      }
    }
    
    var contains = function(array, value) {
     return array.indexOf(value) > -1; 
    }
    
    $scope.login = function() {
	  $scope.loginMessage = "Logging In...";
      $scope.loading = true;
      if ($scope.username && $scope.password) {
        var user = {
                    username: $scope.username,
                    password: $scope.password
                   };
        socket = io();
        sockets.authenticate(socket, user).then(
          function() {
            console.log("yes");
            getBasicInfo();
          }, 
          function() {
            console.log("no");
            //show some failure message
          });      
      }
    };
  
    $scope.signup = function() {
		$scope.loginMessage = "Signing Up...";
	    $scope.loading = true;
       if ($scope.username && $scope.password) {
        var user = {
                    username: $scope.username,
                    password: $scope.password
                   };
        server.postUserSignup(user).then(
          function () {
            $scope.login();
          },
          function () {
            //show some failure message (e.g. username taken)
            //go back to basic sign in page
			$scope.loginError = true;
          });
      }
    }
          
    var getBasicInfo = function() {
		$scope.loginMessage = "Loading Data...";
        sockets.getBasicInfo(socket).then(
          function(data) {
//            modals.login.modal('hide');
            setTimeout(function() {
                        $scope.loading = false;
                       }, 1000);
          },
          function() {
            console.log('get basic info failed');
            //show some failure to load info; please refresh page message
          });
    };
	
	$scope.restartLogin = function() {
		$scope.loading = false;
		$scope.loginError = false;
	};
  
    $scope.startNewConversation = function() {
      modals.newConversation.modal('show');
    };
  
    $scope.cancel = function() {
      modals.newConversation.modal('hide');
    };
	
	$scope.sendNewMessage = function() {
		if ($scope.newRecipient && $scope.newMessage) {
			console.log('sending new message!');
		};
	};
    
});
