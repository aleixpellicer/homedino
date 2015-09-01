'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function chart($window) {

  return {
      restrict: 'AC',
      link: function(scope, element, attrs) {

        var options = {
            // Boolean - Whether to animate the chart
            animation: false,

            // Number - Number of animation steps
            animationSteps: 30,
            // String - Animation easing effect
            // Possible effects are:
            // [easeInOutQuart, linear, easeOutBounce, easeInBack, easeInOutQuad,
            //  easeOutQuart, easeOutQuad, easeInOutBounce, easeOutSine, easeInOutCubic,
            //  easeInExpo, easeInOutBack, easeInCirc, easeInOutElastic, easeOutBack,
            //  easeInQuad, easeInOutExpo, easeInQuart, easeOutQuint, easeInOutCirc,
            //  easeInSine, easeOutExpo, easeOutCirc, easeOutCubic, easeInQuint,
            //  easeInElastic, easeInOutSine, easeInOutQuint, easeInBounce,
            //  easeOutElastic, easeInCubic]
            animationEasing: "easeOutQuart",
            // Boolean - If we should show the scale at all
            showScale: true,
            // Boolean - If we want to override with a hard coded scale
            scaleOverride: false,
            // ** Required if scaleOverride is true **
            // Number - The number of steps in a hard coded scale
            scaleSteps: null,
            // Number - The value jump in the hard coded scale
            scaleStepWidth: null,
            // Number - The scale starting value
            scaleStartValue: null,
            // String - Colour of the scale line
            scaleLineColor: "rgba(0,0,0,.1)",
            // Number - Pixel width of the scale line
            scaleLineWidth: 1,
            // Boolean - Whether to show labels on the scale
            scaleShowLabels: true,
            // Interpolated JS string - can access value
            scaleLabel: "<%=value%>",
            // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
            scaleIntegersOnly: true,
            // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
            scaleBeginAtZero: false,
            // String - Scale label font declaration for the scale label
            scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            // Number - Scale label font size in pixels
            scaleFontSize: 10,
            // String - Scale label font weight style
            scaleFontStyle: "normal",
            // String - Scale label font colour
            scaleFontColor: "#666",
            // Boolean - whether or not the chart should be responsive and resize when the browser does.
            responsive: true,
            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
            maintainAspectRatio: false,
            // Boolean - Determines whether to draw tooltips on the canvas or not
            showTooltips: true,
            // Function - Determines whether to execute the customTooltips function instead of drawing the built in tooltips (See [Advanced - External Tooltips](#advanced-usage-custom-tooltips))
            customTooltips: false,
            // Array - Array of string names to attach tooltip events
            tooltipEvents: ["mousemove", "touchstart", "touchmove"],
            // String - Tooltip background colour
            tooltipFillColor: "rgba(0,0,0,0.8)",
            // String - Tooltip label font declaration for the scale label
            tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            // Number - Tooltip label font size in pixels
            tooltipFontSize: 14,
            // String - Tooltip font weight style
            tooltipFontStyle: "normal",
            // String - Tooltip label font colour
            tooltipFontColor: "#fff",
            // String - Tooltip title font declaration for the scale label
            tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            // Number - Tooltip title font size in pixels
            tooltipTitleFontSize: 14,
            // String - Tooltip title font weight style
            tooltipTitleFontStyle: "bold",
            // String - Tooltip title font colour
            tooltipTitleFontColor: "#fff",
            // Number - pixel width of padding around tooltip text
            tooltipYPadding: 6,
            // Number - pixel width of padding around tooltip text
            tooltipXPadding: 6,
            // Number - Size of the caret on the tooltip
            tooltipCaretSize: 8,
            // Number - Pixel radius of the tooltip border
            tooltipCornerRadius: 6,
            // Number - Pixel offset from point x to tooltip edge
            tooltipXOffset: 10,
            // String - Template string for single tooltips
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
            // String - Template string for multiple tooltips
            multiTooltipTemplate: "<%= value %>",
            // Function - Will fire on animation progression.
            onAnimationProgress: function(){},
            // Function - Will fire on animation completion.
            onAnimationComplete: function(){}
        }

        var datas = [];

        var dataTemp = {
            labels: ["27", "28", "29", "30", "31"],
            datasets: [
                {
                    label: "Max Temperature",
                    fillColor: "rgba(212,42,74,0.1)",
                    strokeColor: "rgba(212,42,74,1)",
                    pointColor: "rgba(212,42,74,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [33, 32, 35, 31, 28]
                },
                {
                    label: "Average Temperature",
                    fillColor: "rgba(151,187,205,0.1)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [21, 22, 21, 17, 23]
                },
                {
                    label: "Min Temperature",
                    fillColor: "rgba(154,212,42,0.1)",
                    strokeColor: "rgba(154,212,42,1)",
                    pointColor: "rgba(154,212,42,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [17, 15, 17, 13, 21]
                }
            ]
        };
        datas['temperature'] = dataTemp;

        var dataHumidity = {
            labels: ["27", "28", "29", "30", "31"],
            datasets: [
                {
                    label: "Max Humidity",
                    fillColor: "rgba(154,212,42,0.1)",
                    strokeColor: "rgba(154,212,42,1)",
                    pointColor: "rgba(154,212,42,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [77, 75, 67, 83, 81]
                },
                {
                    label: "Min Humidity",
                    fillColor: "rgba(212,42,74,0.1)",
                    strokeColor: "rgba(212,42,74,1)",
                    pointColor: "rgba(212,42,74,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [15, 22, 25, 21, 22]
                },
                {
                    label: "Average Humidity",
                    fillColor: "rgba(151,187,205,0.1)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [52, 56, 45, 56, 36]
                }
            ]
        };
        datas['humidity'] = dataHumidity;

        var ctx = element[0].getContext("2d");
        var chart = new window.Chart(ctx).Line(datas[attrs.chartType], options);

        /*
        attrs.$observe('gaugeValue', function(value){

          chart.set(parseInt(value,10));
          
        });
        */
      }
  };
}

directivesModule.directive('chart', chart);
