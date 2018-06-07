(function() {
	'use strict';

	angular
		.module('restaurant.payments', [
			'ionic'
		])
		.config(function($stateProvider) {
			$stateProvider
				.state('app.payments', {
					url: '/payments',
					views: {
						'menuContent': {
							templateUrl: 'scripts/payments/payments.html',
							controller: 'PaymentsController as pc'
						}
					}
				});

		});

})();
