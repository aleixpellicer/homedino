'use strict';
var controllersModule = require('./_index');
/**
* @ngInject
*/

// 
// PARENT CONTROLLER (STUDENT)
// Controlador Padre (y general) de parte Estudiantes
//

function AppCtrl($scope, $timeout) {

	

}
controllersModule.controller('AppCtrl', AppCtrl);



function HomeCtrl($scope, $http, $stateParams, $interval, $state) {
	
	var vm = this;
	/*
	// MY COURSES
	var config = {
		params: {
			'callback': "JSON_CALLBACK"
		}
	}

	vm.lightSensor = 1;
	vm.lightThreshold = 400;

	var updateTime = function(){

		$http.jsonp('http://192.168.1.210/json', config).success(function (data, config) {

			vm.lightSensor = data.a0-vm.lightThreshold;
			vm.detected = (data.d2==1) ? 'Yes' : 'No';
			vm.toggle = (data.d7==1) ? 'on' : 'off';

			if(vm.lightSensor < 600){
				vm.lightness = 'Dark';
			} else {
				vm.lightness = 'Bright';
			}
			vm.error = JSON.stringify(config);
			vm.jsonerror = false;
		}).error(function (data, status, headers, config) {
			vm.jsonerror = true;
			vm.error = JSON.stringify(data);
			console.log(data);
			console.log(status);
			console.log(headers);
			console.log(config);
		});

	}
	var stopTime = $interval(updateTime, 1000);
	*/
}
controllersModule.controller('HomeCtrl', HomeCtrl);

function RoomCtrl($scope, $http, $interval, $stateParams, $state) {
	
	var vm = this;
	vm.roomId = $stateParams['roomId'];
	vm.roomName = $stateParams['roomName'];
	vm.active = true;
	vm.toggle = 'off';
	
	vm.viewing = 'temperature';
	vm.lightSensor = 1;
	vm.lightThreshold = 400;

	vm.buttonOn = function(){
		$http.post('http://192.168.1.210/ajaxPost', {d7:1}).
		then(function(response) {

		}, function(response) {

		});
	}

	vm.buttonOff = function(){
		$http.post('http://192.168.1.210/ajaxPost', {d7:0}).
		then(function(response) {

		}, function(response) {

		});
	}

	var temp = 0;
	var randomTemp = function(){
		temp = temp + 1;
		if(temp>40){
			temp = 0;
		}
		vm.temperature = temp;
		vm.temperaturePercent = parseFloat((temp/40)*100).toFixed(2);
	}
	var humidity = 0;
	var randomHumidity = function(){
		humidity = humidity + 1;
		if(humidity>100){
			humidity = 0;
		}
		vm.humidity = humidity;
	}
	randomTemp();
	randomHumidity();
	var randomTempTimer = $interval(randomTemp, 5000);
	var randomHumidityTimer = $interval(randomHumidity, 5000);

	var updateTime = function(){
		
		var config = {
			params: {
				'callback': "JSON_CALLBACK"
			}
		}
		
		$http.jsonp('http://192.168.1.210/json', config).success(function (data) {

			vm.lightSensor = data.a0-vm.lightThreshold;
			vm.detected = (data.d2==1) ? 'Yes' : 'No';
			vm.toggle = (data.d7==1) ? 'on' : 'off';

			if(vm.lightSensor < 600){
				vm.lightness = 'Dark';
			} else {
				vm.lightness = 'Bright';
			}

			vm.jsonerror = false;
		}).error(function (data, status, headers, config) {
			vm.courses = {};
			console.log('error json');
			vm.jsonerror = true;
		});
	}

	updateTime();
	var stopTime = $interval(updateTime, 5000);

}
controllersModule.controller('RoomCtrl', RoomCtrl);