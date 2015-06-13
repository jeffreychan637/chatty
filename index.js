'use strict';

$(document).ready(function(){ 
						   
	var windowHeight = $(window).height();
    var leftover = windowHeight - $(".nav").height();
    $(".chats").css("height", leftover.toString() + "px");
    $(".user-list").css("height", leftover.toString() + "px");
    
	
});