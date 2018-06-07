/**
 * Created by anubhavshrimal on 02/10/16.
 */
(function() {
	'use strict';

	angular
		.module('restaurant.custom-menu', [
			'ionic',
			'ngCordova',
			'LocalStorageModule',
			'restaurant.common',
			'ionic-toast'
		])
		.config(function($stateProvider) {
			$stateProvider
				.state('app.custom-menu', {
					url: '/custom-menu/:special',
					views: {
						'menuContent': {
							templateUrl: 'scripts/custom-menu/custom-menu.html',
							controller: 'CustomMenuContoller as vm',
							resolve: {
								addNewItem: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/custom-menu/addNewOfferModal.html', {
										scope: $rootScope,
										animation: 'slide-in-up'
									});
								},
								editItem: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/custom-menu/editOfferModal.html', {
										scope: $rootScope,
										animation: 'slide-in-up'
									});
								},
								addSpecialItem: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/custom-menu/addSpecialOfferModal.html', {
										scope: $rootScope,
										animation: 'slide-in-up'
									});
								},
								editSpecialItem: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/custom-menu/editSpecialOfferModal.html', {
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
