(function() {
	'use strict';

	angular
		.module('restaurant.restaurant-delivery')
		.factory('deliveryDataService', deliveryDataService);

	deliveryDataService.$inject = ['localStorageService'];

	/* @ngInject */
	function deliveryDataService(localStorageService) {
		var takeAwayKey = 'take-away-data';
		var dineInKey = 'dine-in-data';
		var homeDeliveryKey = 'home-delivery-data';

		var service = {
			saveTakeAwayData: saveTakeAwayData,
			getTakeAwayData: getTakeAwayData,
			saveDineInData: saveDineInData,
			getDineInData: getDineInData,
			saveHomeDeliveryData: saveHomeDeliveryData,
			getHomeDeliveryData: getHomeDeliveryData
		};
		return service;

		// ************************************************************

		function saveDineInData(data) {
			localStorageService.set(dineInKey, data);
		}

		function getDineInData() {
			return localStorageService.get(dineInKey);
		}

		function saveTakeAwayData(data) {
			localStorageService.set(takeAwayKey, data);
		}

		function getTakeAwayData() {
			return localStorageService.get(takeAwayKey);
		}

		function saveHomeDeliveryData(data) {
			localStorageService.set(homeDeliveryKey, data);
		}

		function getHomeDeliveryData() {
			return localStorageService.get(homeDeliveryKey);
		}
	}
})();
