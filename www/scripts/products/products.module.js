(function () {
	'use strict';

	angular
		.module('restaurant.products', [
			'ionic',
			'ngCordova',
			'LocalStorageModule',
			'restaurant.common',
			'ionic-toast'
		])
		.config(function ($stateProvider) {
			$stateProvider
				.state('app.products', {
					url: '/products/:categoryId?categoryName',
					views: {
						'menuContent': {
							templateUrl: 'scripts/products/products.html',
							controller: 'ProductsController as vm',
							resolve: {
								addNewProduct: function ($ionicModal, $rootScope) {
									return $ionicModal.fromTemplateUrl('scripts/products/addNewProduct.html', {
										scope: $rootScope,
										animation: 'slide-in-up'
									});
								}
							}
						}
					}
				})
				.state('app.featured-product', {
					url: '/products/featured/:productId',
					views: {
						'menuContent': {
							templateUrl: 'scripts/products/product.html',
							controller: 'ProductController as vm'
						}
					}
				})
				.state('app.product', {
					url: '/products/:categoryId/:productId',
					views: {
						'menuContent': {
							templateUrl: 'scripts/products/product.html',
							controller: 'ProductController as vm'
						}
					}
				});

		});

})();
