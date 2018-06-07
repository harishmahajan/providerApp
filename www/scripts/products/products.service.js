(function() {
	'use strict';

	angular
		.module('restaurant.products')
		.factory('productsService', productsService);

	productsService.$inject = ['dataService'];

	/* @ngInject */
	function productsService(dataService) {
		var service = {
			getMenuItem: getMenuItem,
			getStorageBusiness: getStorageBusiness,
			deleteFile: deleteFile,
			updateItem: updateItem,
			getMenuItems: getMenuItems,
			deleteMenuItem: deleteMenuItem,
		};
		return service;

		// ******************************************************************
		function getMenuItem(title) {
			return dataService.getMenuItem(title);
		}
		
		function getStorageBusiness(businessId, imageData, directory, name) {
			return dataService.getStorageBusiness(businessId, imageData, directory, name)
		}
		
		function deleteFile(businessId, name) {
			return dataService.deleteFile(businessId, name)
		}

		function updateItem(businessId,itemId, item) {
			return dataService.updateMenuItem(businessId,itemId, item)
		}

		function getMenuItems() {
			return dataService.getMenuItems();
		}

		function deleteMenuItem(key) {
			return dataService.deleteMenuItem(key);
		}
	}
})();
