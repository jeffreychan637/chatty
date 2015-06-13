'use strict';

$(document).ready(function(){ 
						   
	var windowHeight = $(window).height();
    var leftover = windowHeight - $(".nav").height();
    console.log(leftover + "px");
    $(".chats").css("height", leftover.toString() + "px");
//    $("#chats").css("background-color", "red");
	
});