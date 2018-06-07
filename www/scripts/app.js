// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('restaurant', [
	'ionic',
	'ionic.service.core',
	'ionic.service.push',

	'ngCordova',
	'ionic-toast',
	'LocalStorageModule',
	'firebase',

	'config',
	'restaurant.restaurant-cart',
	'restaurant.restaurant-delivery',
	'restaurant.categories',
	'restaurant.payments',
	'restaurant.products',
	'restaurant.map',
	'restaurant.home',
	'restaurant.menu',
	'restaurant.orders',
	'restaurant.login',
	'restaurant.profile',
	'restaurant.add-items',
	'restaurant.custom-menu',
	'restaurant.special-offers',
	'gMaps',
	'LocalForageModule',
	'restaurant.common',
	'base64',
	'ngMessages'
])

	.value('_', window._)

	.run(function ($ionicPlatform, $ionicPopup) {
		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)

			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});
	})

	.config(function ($urlRouterProvider, $ionicConfigProvider) {

		$ionicConfigProvider.views.maxCache(0);
		// $ionicConfigProvider.backButton.text('').icon('ion-android-arrow-left').previousTitleText(false);

		if (ionic.Platform.isAndroid()) {
			$ionicConfigProvider.scrolling.jsScrolling(false);
		}

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise(function ($injector, $location) {
			var state = $injector.get('$state');
			var localForage = $injector.get('$localForage');
			var loggedInUserData = $injector.get('loggedInUserData');
			// console.log('hi')
			localForage.getItem('loggedInUser').then(function (data) {
				if (data != null) {
					console.log('to Orders or Profile');
					loggedInUserData.data = data;
					console.log(loggedInUserData);
					// profile is complete (1)
					if (data.profileComplete == 1)
						state.go('app.orders');
					else	// profile is incomplete (-1) or partially complete (0)
						state.go('app.profile');
				}
				else {
					console.log('to login');
					state.go('login');
				}
				return $location.path();
			})
		});
	});
