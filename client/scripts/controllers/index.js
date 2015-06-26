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
    
//    if ($("#y").height() > 21) {
//        $(""
//    };
    
//    $("body").css("max-height", windowHeight.toString() + "px");
        
	
    });
  
    var socket;
    
    
    
    $scope.login = function() {
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
        //show some spinning wheel saying login happening      
      }
    };
  
    $scope.signup = function() {
       if ($scope.username && $scope.password) {
        var user = {
                    username: $scope.username,
                    password: $scope.password
                   };
        server.postUserSignup(user).then(
          function () {
            $scope.login(); //verift that $scope.username/pwd didn't get reset
          },
          function () {
            //show some failure message (e.g. username taken)
            //go back to basic sign in page
          });
         //show some spinnning wheel saying sign up happening
      }
    }
          
    var getBasicInfo = function() {
        sockets.getBasicInfo(socket).then(
          function() {
            modals.login.modal("hide");
          },
          function() {
            //show some failure to load info; please refresh page message
          });
        //show some message saying loading info
            
    };
    
});
