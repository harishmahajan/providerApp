(function() {
	'use strict';

	angular
		.module('restaurant.orders')
		.factory('ordersService', ordersService);

	ordersService.$inject = ['dataService'];

	/* @ngInject */
	function ordersService(dataService) {
		var service = {
			getFeaturedCategories: getFeaturedCategories,
			getFeaturedProducts: getFeaturedProducts,
			getBusiness: dataService.getBusiness,
			getDeviceTokenOfCustomer: getDeviceTokenOfCustomer
		};
		return service;

		// ***************************************************************

		function getFeaturedCategories() {
			return dataService.getFeaturedCategories();
		}

		function getFeaturedProducts() {
			return dataService.getFeaturedProducts();
		}

		function getDeviceTokenOfCustomer(userId) {
			return dataService.getDeviceTokenOfCustomer(userId);
		}
	}

})();
