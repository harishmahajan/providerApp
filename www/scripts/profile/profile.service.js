(function () {
	'use strict';

	angular
		.module('restaurant.profile')
		.factory('profileService', profileService)
		.filter('capitalize', capitalize)
	profileService.$inject = ['dataService', '$firebaseObject'];

	/* @ngInject */
	function profileService(dataService, $firebaseObject) {
		var service = {
			getFeaturedCategories: getFeaturedCategories,
			getFeaturedProducts: getFeaturedProducts,
			getBusiness: dataService.getBusiness,
			getCuisines: getCuisines,
			syncProfileData: syncProfileData,
			saveProfileChanges: saveProfileChanges,
			getStorageBusiness: getStorageBusiness,
			updateStore: updateStore
		};
		return service;

		// ***************************************************************

		function getFeaturedCategories() {
			return dataService.getFeaturedCategories();
		}

		function getCuisines() {
			return dataService.getCuisines();
		}

		function getFeaturedProducts() {
			return dataService.getFeaturedProducts();
		}

		function syncProfileData(userId) {
			return dataService.syncProfileData(userId);
		}

		function saveProfileChanges(copyDataObj, firebaseObj) {
			return dataService.saveProfileChanges(copyDataObj, firebaseObj);
		}

		function getStorageBusiness(businessId, imageData, directory, name) {
			return dataService.getStorageBusiness(businessId, imageData, directory, name)
		}

		function updateStore(businessId, name) {
			return dataService.updateStore(businessId, name)
		}


	}

	function capitalize() {
		return function (input, all) {
			return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}) : '';
		}
	}

})();
