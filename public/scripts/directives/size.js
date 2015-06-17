'use strict';

angular.module('chatty')
  .directive('height', function($window) {
        return {
          link: function(scope, element) {
            var window = angular.element($window);
            scope.$watch(function() {
                
              },
              function() {
                if (scope.settings) {
                  element.css('border-width', scope.settings.borderWidth + 'px');
                }
              });
          }
        };
      });