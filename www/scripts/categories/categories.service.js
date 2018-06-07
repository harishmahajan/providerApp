(function() {
	'use strict';

	angular
		.module('restaurant.categories')
		.factory('categoriesService', categoriesService);

	categoriesService.$inject = ['dataService', 'loggedInUserData'];

	/* @ngInject */
	function categoriesService(dataService, loggedInUserData) {
		var service = {
			all: all,
			syncProfileData: syncProfileData,
			saveProfileChanges: saveProfileChanges,
			getStorageBusiness: getStorageBusiness,
		};
		return service;

		// ******************************************************************

		function all() {
			// return dataService.getCategories();
			return loggedInUserData.data.categories;
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
	}
})();
