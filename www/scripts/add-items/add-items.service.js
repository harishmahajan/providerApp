(function() {
	'use strict';

	angular
		.module('restaurant.add-items')
		.factory('additemsService', additemsService);

	additemsService.$inject = ['dataService', '$q', '_'];

	/* @ngInject */
	function additemsService(dataService, $q, _) {
		var service = {
			getMenuItems: getMenuItems,
			getStorageBusiness:getStorageBusiness
		};
		return service;

		// ***************************************************************

		function getMenuItems() {
			return dataService.getMenuItems();
		}
		function getStorageBusiness(businessId, imageData, directory, name) {
			return dataService.getStorageBusiness(businessId, imageData, directory, name)
		}
	}
})();
