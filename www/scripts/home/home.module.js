(function() {
	'use strict';

	angular
		.module('restaurant.home', [
			'ionic',
			'ngCordova',
			'restaurant.common'
		])
		.config(function($stateProvider) {
			$stateProvider
				.state('app.home', {
					url: '/home/:orderId',
					views: {
						'menuContent': {
							templateUrl: 'scripts/home/home.html',
							controller: 'HomeController as vm'
						}
					},
					resolve: {
						// getOrders: function ($localForage) {
						// 	return $localForage.getItem('orders')
						// 		.then(function (data) {
						// 			return data;
						// 		})
						// }
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
				});
		});
})();
