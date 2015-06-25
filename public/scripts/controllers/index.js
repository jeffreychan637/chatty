'use strict';

angular.module('chatty')
  .controller('chattyCtrl', function ($scope, $document, server, modals) {
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
    
    
    
    $scope.login = function() {
      console.log($scope.username);
      if ($scope.username && $scope.password) {
        user = {
                username: $scope.username,
                password: $scope.password
               };
        server.postUserLogin(user);    
        modals.login.modal("hide");
          
//          var socket = io();
      }
    };
    
});
