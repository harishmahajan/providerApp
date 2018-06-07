/**
 * Created by anubhavshrimal on 02/10/16.
 */
(function () {
	'use strict';

	angular
		.module('restaurant.special-offers')
		.factory('addSpecialOffersService', addSpecialOffersService);

	addSpecialOffersService.$inject = ['dataService', '$q', '_'];

	/* @ngInject */
	function addSpecialOffersService(dataService, $q, _) {
		var service = {
			getSpecialOffers: getSpecialOffers,
			createSpecialOffer: createSpecialOffer,
		};
		return service;

		// ***************************************************************

		function getSpecialOffers() {
			return dataService.getSpecialOffers();
		}
		function createSpecialOffer(data, callback) {
			return dataService.createSpecialOffer(data, callback);
		}
	}
})();
