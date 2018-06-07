(function() {
	'use strict';

	angular
		.module('restaurant.menu', [
			'ionic'
		])
		.config(function($stateProvider) {
			$stateProvider
				.state('app', {
					url: '/app',
					abstract: true,
					templateUrl: 'scripts/menu/menu.html',
					controller: 'MenuController as vm',
					resolve: {
						categories: function(menuService) {
							return menuService.getCategoriesMenuItem();
						},
						customerModal: function($ionicModal, $rootScope) {
							return $ionicModal.fromTemplateUrl('scripts/orders/customers.html', {
								scope: $rootScope,
								animation: 'slide-in-up'
							});
						}
					}
				});
		});
})();
