(function() {
	'use strict';

	angular
		.module('restaurant.orders', [
			'ionic',
			'ngCordova',
			'restaurant.common'
		])
		.config(function($stateProvider) {
			$stateProvider
				.state('app.orders', {
					url: '/orders',
					views: {
						'menuContent': {
							templateUrl: 'scripts/orders/orders.html',
							controller: 'OrdersController as sc',
							resolve: {
								filterModal: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/orders/filter.html', {
										scope: $rootScope,
										animation: 'slide-in-up'
									});
								},
								customerModal: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/orders/customers.html', {
										scope: $rootScope,
										animation: 'slide-in-up'
									});
								}
							}
						}
					},
					resolve: {
						getOrders: function ($localForage) {
							return $localForage.getItem('orders').then(function (orders) {
								if(orders!=null){
									console.log("length of orders",orders.length);
									console.log('app loaded in orders', orders);
									return orders;
								}else {
									return [];
								}
							});
						}
					}
				})
		})

		.filter('TypeFilter', function () {
			return function (input, status) {
				if (status) {
					return input.filter(function (item) {

							if (item.status == status) {
								return true;
							}
							else {
								return false;
							}
						}
					)
				}
				else {
					return input;
				}
			}
		})
	;
})();
