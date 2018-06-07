(function() {
	'use strict';

	angular
		.module('restaurant.home')
		.controller('HomeController', HomeController);

	HomeController.$inject = ['$state', 'homeService', '$ionicSlideBoxDelegate', 'getOrders', '$stateParams', '$localForage', '$http',
	'loggedInUserData'];

	/* @ngInject */
	function HomeController($state, homeService, $ionicSlideBoxDelegate, getOrders, $stateParams, $localForage, $http, loggedInUserData) {
		var vm = angular.extend(this, {
			categories: [],
			products: [],
			showProducts: showProducts,
			showProductDetails: showProductDetails,
			storeName: ''
		});

		(function activate() {
			loadProducts();
			loadCategories();
			loadBusinessInfo();
		})();

		// ******************************************************

		var orders = getOrders;
		// console.log(getOrders);

		var orderId = $stateParams.orderId;

		vm.order = _.find(orders, function (o) {
			return o.orderId == orderId;
		});

		vm.groupedItems = _.groupBy(vm.order.items, 'details.category');
		console.log(vm.order.items);

		vm.orderComplete = function () {

			var deviceToken;
			var serviceMessage='';
			switch(vm.order.serviceType){
				case 'Home Delivery':
					serviceMessage = 'Your order will be delivered soon.';
					break;
				case 'Eat-in':
					serviceMessage = '';
					break;
				case 'Take Away':
					serviceMessage = 'You can pick your order up.';
					break;
			}
			homeService.getDeviceTokenOfCustomer(vm.order.userId).then(function (data1) {
				console.log("data1",data1);
				deviceToken = data1.device_token;
				var dataAlert = {
					"title": "Order Ready",
					"body": "Your order "+orderId+" is ready. "+serviceMessage,
					"state":"app.orders",
					"orderId":orderId,
					"status": "Completed"
				}
				var data = {
					"to": deviceToken,
					"priority": "high",
					"content_available": true,
					notification: {
						"title": "Order Ready",
						"body": "Order Ready. Your order "+orderId+" is ready. "+serviceMessage,
						"sound": "default",
						"click_action":"FCM_PLUGIN_ACTIVITY",
						"icon": "fcm_push_icon"
					},
					"data": dataAlert
				};
				var url = "https://fcm.googleapis.com/fcm/send";
				$http.post(url, data,
					{
						headers: {
							'Content-Type': 'application/json',
							"Authorization": "key=AIzaSyDY34h5qNWXQFAHvRUY-T-lC9UoiP6745M"          // serverKey
						}
					}
				).then(function (data) {
					console.log(data);
				}).catch(function (err) {
					console.log(err);
				});
			});

			console.log(orders);
			 var index = _.findIndex(orders, function (o) {
				console.log(o.orderId);
				return o.orderId == orderId
			});
			orders[index].status = "Completed";
			console.log(orders);
			$localForage.setItem('orders', orders)
				.then(function () {
					$state.go('app.orders')
				});
		};

		vm.orderAttended = function () {
			var deviceToken;

			homeService.getDeviceTokenOfCustomer(vm.order.userId).then(function (data1) {
				console.log("data1",data1);
				deviceToken = data1.device_token;
				var dataAlert = {
					"title": "Order Received",
					"body": "Your order "+orderId+" is received by "+loggedInUserData.data.storeName+". You will be notified once the order is ready.",
					"state":"app.orders",
					"orderId":orderId,
					"status": "Processing"
				}
				var data = {
					"to": deviceToken,
					"priority": "high",
					"content_available": true,
					notification: {
						"title": "Order Received",
						"body": "Order Processing. Your order "+orderId+" is received by "+loggedInUserData.data.storeName+". You will be notified once the order is ready.",
						"sound": "default",
						"click_action":"FCM_PLUGIN_ACTIVITY",
						"icon": "fcm_push_icon"
					},
					"data": dataAlert
				};
				var url = "https://fcm.googleapis.com/fcm/send";
				$http.post(url, data,
					{
						headers: {
							'Content-Type': 'application/json',
							"Authorization": "key=AIzaSyDY34h5qNWXQFAHvRUY-T-lC9UoiP6745M"          // serverKey
						}
					}
				).then(function (data) {
					console.log(data);
				}).catch(function (err) {
					console.log(err);
				});
			});

			var index = _.findIndex(orders, function (o) {
				console.log(o.orderId);
				return o.orderId == orderId
			});
			orders[index].status = "Processing";
			console.log(orders);
			$localForage.setItem('orders', orders)
				.then(function () {
					$state.go('app.orders')
				});
		}

		vm.alertBeforeCancel = function(){
			function onPrompt(results) {
				if(results.buttonIndex==1 && results.input1){
					vm.cancelOrder(results.input1);
				}
			}

			navigator.notification.prompt(
				'Please enter the reason for order cancellation',  // message
				onPrompt,                  // callback to invoke
				'Cancel Order',            // title
				['Cancel Order','Keep Order']      // buttonLabels
			);
		}

		vm.cancelOrder = function(cancelReason){
			var deviceToken;


			homeService.getDeviceTokenOfCustomer(vm.order.userId).then(function (data1) {
				console.log("data1",data1);
				deviceToken = data1.device_token;
				var dataAlert = {
					"title": "Order Cancelled",
					"body": "Your order "+orderId+" was cancelled by "+loggedInUserData.data.storeName+". Inconvenience is regretted.",
					"state":"app.orders",
					"orderId":orderId,
					"status": "Cancelled",
					"message": cancelReason
				}
				var data = {
					"to": deviceToken,
					"priority": "high",
					"content_available": true,
					notification: {
						"title": "Order Cancelled",
						"body": "Order Cancelled. Your order "+orderId+" was cancelled by "+loggedInUserData.data.storeName+". Inconvenience is regretted.",
						"sound": "default",
						"click_action":"FCM_PLUGIN_ACTIVITY",
						"icon": "fcm_push_icon"
					},
					"data": dataAlert
				};
				var url = "https://fcm.googleapis.com/fcm/send";
				$http.post(url, data,
					{
						headers: {
							'Content-Type': 'application/json',
							"Authorization": "key=AIzaSyDY34h5qNWXQFAHvRUY-T-lC9UoiP6745M"          // serverKey
						}
					}
				).then(function (data) {
					console.log(data);
				}).catch(function (err) {
					console.log(err);
				});
			});

			var index = _.findIndex(orders, function (o) {
				console.log(o.orderId);
				return o.orderId == orderId
			});
			orders[index].status = "Cancelled";
			console.log(orders);
			$localForage.setItem('orders', orders)
				.then(function () {
					$state.go('app.orders')
				});
		}

		vm.requestReview =function(){
			var deviceToken;

			homeService.getDeviceTokenOfCustomer(vm.order.userId).then(function (data1) {
				console.log("data1",data1);
				deviceToken = data1.device_token;
				var dataAlert = {
					"title": "Review Order",
					"body": "Your order "+orderId+" is complete. Let us know how was your order.",
					"state":"app.orders",
					"orderId":orderId,
					"status":"Pending Review"
				}
				var data = {
					"to": deviceToken,
					"priority": "high",
					"content_available": true,
					notification: {
						"title": "Review Order",
						"body": "Order Completed. Your order "+orderId+" is complete. Let us know how was your order.",
						"sound": "default",
						"click_action":"FCM_PLUGIN_ACTIVITY",
						"icon": "fcm_push_icon"
					},
					"data": dataAlert
				};
				var url = "https://fcm.googleapis.com/fcm/send";
				$http.post(url, data,
					{
						headers: {
							'Content-Type': 'application/json',
							"Authorization": "key=AIzaSyDY34h5qNWXQFAHvRUY-T-lC9UoiP6745M"          // serverKey
						}
					}
				).then(function (data) {
					console.log(data);
				}).catch(function (err) {
					console.log(err);
				});
			});

			if(vm.order.status=='Completed') {
				var index = _.findIndex(orders, function (o) {
					console.log(o.orderId);
					return o.orderId == orderId
				});
				orders[index].status = "Pending Review";
				console.log(orders);
			}
			$localForage.setItem('orders', orders)
				.then(function () {
					$state.go('app.orders')
				});
		}

		function loadProducts() {
			homeService.getFeaturedProducts()
				.then(function(products) {
					vm.products = products;
					$ionicSlideBoxDelegate.update();
				});
		}

		function loadCategories() {
			homeService.getFeaturedCategories()
				.then(function(categories) {
					vm.categories = categories;
				});
		}

		function loadBusinessInfo() {
			homeService.getBusiness()
				.then(function(businessInfo) {
					vm.storeName = businessInfo.storeName;
				});
		}

		function showProductDetails(product) {
			$state.go('app.featured-product', {
				productId: product.guid
			});
		}

		function showProducts(category) {
			$state.go('app.products', {
				categoryId: category.guid,
				categoryName: category.title
			});
		}
	}
})();
