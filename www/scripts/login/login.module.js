(function () {
	'use strict';

	angular
		.module('restaurant.login', [
			'ionic',
			'ngCordova',
			'restaurant.common',
			'ngCordovaOauth'
		])
		.config(function ($stateProvider) {
			$stateProvider
				.state('login', {
					url: '/login',
					templateUrl: 'scripts/login/login.html',
					controller: 'LoginController as lc'
				})
				.state('cookies', {
					url: '/cookies',
					templateUrl: 'scripts/login/cookies.html',
					controller: 'LoginController as lc'
				})
				.state('terms', {
					url: '/terms',
					templateUrl: 'scripts/login/terms.html',
					controller: 'LoginController as lc'
				})
				.state('privacy', {
					url: '/privacy',
					templateUrl: 'scripts/login/privacy.html',
					controller: 'LoginController as lc'
				})
		})
})();
