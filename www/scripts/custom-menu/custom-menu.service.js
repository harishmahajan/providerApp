/**
 * Created by anubhavshrimal on 02/10/16.
 */
(function() {
	'use strict';

	angular
		.module('restaurant.custom-menu')
		.factory('addOffersService', addOffersService);

	addOffersService.$inject = ['dataService', '$q', '_'];

	/* @ngInject */
	function addOffersService(dataService, $q, _) {
		var service = {
			getMenuOffers: getMenuOffers,
			getSpecialOffers: getSpecialOffers,
			updateMealDeals:updateMealDeals,
			updateSpecialOffers:updateSpecialOffers

		};
		return service;

		// ***************************************************************

		function getMenuOffers() {
			return dataService.getMenuOffers();
		}

		function getSpecialOffers() {
			return dataService.getSpecialOffers();
		}

		function updateSpecialOffers(businessId,item) {
			return dataService.updateSpecialOffers(businessId,item);
		}

		function updateMealDeals(businessId, item) {
			return dataService.updateMealDeals(businessId, item)
		}
	}
})();
