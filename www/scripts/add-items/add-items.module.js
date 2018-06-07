(function() {
	'use strict';

	angular
		.module('restaurant.add-items', [
			'ionic',
			'ngCordova',
			'LocalStorageModule',
			'restaurant.common',
			'ionic-toast'
		])
		.config(function($stateProvider) {
			$stateProvider
				.state('app.add-items', {
					url: '/add-items',
					views: {
						'menuContent': {
							templateUrl: 'scripts/add-items/add-items.html',
							controller: 'AdditemsController as vm',
							resolve: {
								addNewItem: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/add-items/addNewItem.html', {
										scope: $rootScope,
										animation: 'slide-in-up'
									});
								}
							}
						}
					}
				})
		});
})();
