(function() {
	'use strict';

	angular
		.module('restaurant.restaurant-delivery')
		.controller('DineInController', DineInController);

	DineInController.$inject = [
		'restaurantCartService', 'restaurantOrderProcessor', 'restaurantInfoService', '$ionicHistory', '$state',
		'deliveryDataService', 'phoneNumber'];

	/* @ngInject */
	function DineInController(
		restaurantCartService, restaurantOrderProcessor, restaurantInfoService, $ionicHistory, $state, deliveryDataService, phoneNumber) {

		var vm = angular.extend(this, {
			confirm: confirm,
			restaurant: null,
			data: deliveryDataService.getDineInData() || {
				email: null,
				table: null,
				phone: phoneNumber,
				notes: null
			}
		});

		(function activate() {
			loadRestaurantInfo();
		})();

		// ********************************************************************

		function loadRestaurantInfo() {
			restaurantInfoService.getRestaurantInfo().then(function(data) {
				vm.restaurant = data.restaurant;
			});
		}

		function confirm(form) {
			angular.forEach(form, function(obj) {
				if (angular.isObject(obj) && angular.isDefined(obj.$setDirty)) {
					obj.$setDirty();
				}
			})

			if (!form.$valid) {
				return;
			}

			var items = restaurantCartService.getAll();
			restaurantOrderProcessor.sendDineInConfirmation(items, vm.restaurant, vm.data)
				.then(function() {
					deliveryDataService.saveDineInData(vm.data);
					restaurantCartService.flush();
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go('app.home');
				}, function() {
					alert("Error when sending email");
				});
		}
	}
})();
