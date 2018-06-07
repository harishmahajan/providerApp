(function() {
	'use strict';

	angular
		.module('restaurant.profile', [
			'ionic',
			'ngCordova',
			'restaurant.common'
		])
		.config(function($stateProvider) {
			$stateProvider
				.state('app.profile', {
					url: '/profile',
					views: {
						'menuContent': {
							templateUrl: 'scripts/profile/profile.html',
							controller: 'ProfileController as vm',
							resolve: {
								editModal: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/profile/modal.html', {
										scope: $rootScope,
										animation: 'slide-in-up'
									});
								}
							}
						}
					}
				});
		});
})();
