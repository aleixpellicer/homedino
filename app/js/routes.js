'use strict';

/**
 * @ngInject
 */
function Routes($stateProvider, $locationProvider, $urlRouterProvider) {

  $locationProvider.html5Mode(false);

  $stateProvider
  .state('Home', {
    url: '/',
    templateUrl: 'home.html',
    controller: 'HomeCtrl as home',
    title: 'Home'
  });

  $stateProvider
  .state('Room', {
    url: '/room/:roomId/:roomName',
    templateUrl: 'room.html',
    controller: 'RoomCtrl as room',
    title: 'Room'
  });

  // DEFAULT
  $urlRouterProvider.otherwise('/');
}
module.exports = Routes;