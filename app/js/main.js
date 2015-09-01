'use strict';
var angular = require('angular');
require('angular-ui-router');
require('./templates');
require('./controllers/_index');
require('./services/_index');
require('./directives/_index');
window.gauge = require('./vendors/gauge');
window.Chart = require('./vendors/chart');


angular.element(document).ready(function() {
  var requires = [
    'ui.router',
    'templates',
    'app.controllers',
    'app.services',
    'app.directives'
  ];

  window.app = angular.module('app', requires);
  angular.module('app').constant('AppSettings', require('./constants'));
  angular.module('app').config(require('./routes'));
  angular.module('app').config(require('./PostFix'));
  angular.module('app').run(require('./on_run'));
  angular.bootstrap(document, ['app']);
});