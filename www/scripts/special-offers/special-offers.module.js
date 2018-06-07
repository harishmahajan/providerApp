/**
 * Created by anubhavshrimal on 02/10/16.
 */
(function() {
	'use strict';

	angular
		.module('restaurant.special-offers', [
			'ionic',
			'ngCordova',
			'LocalStorageModule',
			'restaurant.common',
			'ionic-toast',
			'restaurant.categories'
		])
		.config(function($stateProvider) {
			$stateProvider
				.state('app.special-offers', {
					url: '/special-offers',
					views: {
						'menuContent': {
							templateUrl: 'scripts/special-offers/special-offers.html',
							controller: 'specialOffersController as hh',
							resolve: {
								addNewItem: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/special-offers/addNewOfferModal.html', {
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
