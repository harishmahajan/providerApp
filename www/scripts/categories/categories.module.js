(function() {
	'use strict';

	angular
		.module('restaurant.categories', [
			'ionic'
		])
		.config(function($stateProvider) {
			$stateProvider
				.state('app.categories', {
					url: '/categories',
					views: {
						'menuContent': {
							templateUrl: 'scripts/categories/categories.html',
							controller: 'CategoriesController as vm',
							resolve: {
								addNewCategory: function($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/categories/addNewCategory.html', {
										scope: $rootScope,
										animation: 'slide-in-up'
									});
								},
								editCategory: function ($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/categories/editCategory.html', {
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
