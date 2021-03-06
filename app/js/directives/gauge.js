'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function gauge($window) {

  return {
      restrict: 'AC',
      link: function(scope, element, attrs) {

        var opts = {
          lines: 1,
          angle: 0.32,
          lineWidth: 0.05,
          pointer: {
            length: 0.9,
            strokeWidth: 0.035
          },
          percentColors: JSON.parse(attrs.percentColors),
          limitMax: 'true',
          colorStart: '#6FADCF',  
          colorStop: '#8FC0DA',   
          strokeColor: '#E0E0E0',
          responsive: true  
        };

        var gauge;
        gauge = new $window.gauge.Donut(element[0]).setOptions(opts);
        gauge.value = parseInt(attrs.gaugeValue, 10);
        gauge.maxValue = parseInt(attrs.gaugeMaxvalue);
        
        attrs.$observe('gaugeValue', function(value){
          gauge.set(parseInt(value,10));
        });
      }
  };
}

directivesModule.directive('gauge', gauge);
