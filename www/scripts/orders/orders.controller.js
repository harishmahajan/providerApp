(function () {
	'use strict';

	angular
		.module('restaurant.orders')
		.controller('OrdersController', OrdersController);

	OrdersController.$inject = ['$state', 'ordersService', '$ionicSlideBoxDelegate', 'categoriesService', 'filterModal',
		'customerModal', '$cordovaToast', '$http', '$localForage',
		'getOrders', 'loggedInUserData'];

	/* @ngInject */
	function OrdersController($state, ordersService, $ionicSlideBoxDelegate, categoriesService, filterModal,
		customerModal, $cordovaToast, $http, $localForage,
		getOrders, loggedInUserData) {
		var sc = angular.extend(this, {
			categories: [],
			products: [],
			showProducts: showProducts,
			showProductDetails: showProductDetails,
			showFilter: showFilter,
			showCustomers: showCustomers,
			storeName: '',
			orders: getOrders,
			pendingOrders: getOrders.length
		});

		(function activate() {
			// loadProducts();
			// loadCategories();
			// loadBusinessInfo();
		})();

		// ******************************************************

		function loadProducts() {
			ordersService.getFeaturedProducts()
				.then(function (products) {
					sc.products = products;
					console.log(sc.products);
					$ionicSlideBoxDelegate.update();
				});
		}

		function loadCategories() {
			ordersService.getFeaturedCategories()
				.then(function (categories) {
					sc.categories = categories;
				});
		}

		function loadBusinessInfo() {
			ordersService.getBusiness()
				.then(function (businessInfo) {
					sc.storeName = businessInfo.storeName;
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

		function applyFilters() {
			// sc.selectedStatus = sc.typeFilter;
			console.log(sc.selectedStatus);
			filterModal.hide();
		}

		function setTypeFilter(name) {
			sc.selectedStatus = name;
			console.log(sc.selectedStatus);
		}

		function showFilter() {
			var scope = filterModal.scope;
			scope.sc = {
				applyFilters: applyFilters,
				setTypeFilter: setTypeFilter
			};
			filterModal.show();
		}

		function showCustomers() {
			var scope = customerModal.scope;
			scope.cc = {
				closeCustomerModal: closeCustomerModal,
				customerList: loggedInUserData.data.customers
			};
			customerModal.show();
		}

		function closeCustomerModal() {
			customerModal.hide();
		}

		var deviceToken = "";
		var order = {
			customer: {},
			items: [],
			placedTime: "",
			serviceType: "",
			userId: "",
			completed: false,
			orderId: "",
			finalAmount: ""
		};

		// sc.pendingOrders = 0;

		// sc.orders = [];

		// if(ordersService.allOrders!=null){
		// 	console.log("getOrders", getOrders);
		// 	sc.pendingOrders = ordersService.allOrders.length;
		// 	sc.orders = ordersService.allOrders;
		// } else {
		// 	console.log("else ordersService.allOrders", ordersService.allOrders);
		// }

		function updateCustomerList(pushData) {
			var tempUser = categoriesService.syncProfileData(loggedInUserData.data.info.userId);
			var profile = loggedInUserData.data;
			console.log(pushData);
			console.log(profile);
			if (profile.customers) {
				var customerData = angular.copy(JSON.parse(pushData.customer));
				var existingUser = _.findIndex(profile.customers, function (n) {
					return n.email == angular.copy(JSON.parse(pushData.customer)).email && n.phone == angular.copy(JSON.parse(pushData.customer)).phone;
				})
				console.log(existingUser);
				if (existingUser != -1) {
					console.log(1);
					profile.customers[existingUser].count = profile.customers[existingUser].count + 1;
				}
				else {
					console.log(2);
					customerData.count = 1;
					profile.customers.push(customerData);
				}
			}
			else {
				profile.customers = [];
				var customerData = angular.copy(JSON.parse(pushData.customer));
				customerData.count = 1;
				profile.customers.push(customerData);
			}
			$localForage.setItem('loggedInUser', profile).then(function () {
				console.log('customer data added', profile);
			}, function (err) {
				console.log(err);
			});
			console.log(profile);
			categoriesService.saveProfileChanges(profile, tempUser);

		}

		function updateOrdersArray(data) {
			order.customer = angular.copy(JSON.parse(data.customer));
			order.items = angular.copy(JSON.parse(_.trim(data.items, '"')));
			order.serviceType = data.serviceType;
			order.userId = data.userId;
			order.placedTime = new Date(data.placedTime);
			order.orderId = data.orderId;
			order.finalAmount = data.finalAmount;
			order.status = data.status;
			console.log("order is ", order);

			$localForage.getItem('orders').then(function (orders) {
				console.log("forage orders ", orders);
				if (orders != null) {
					sc.orders = orders;
					if (typeof _.find(orders, function (o) {
						return o.orderId == order.orderId;
					}) == 'undefined') {
						sc.orders.push(order);
						// console.log("sc.orders", sc.orders);
						$localForage.setItem('orders', sc.orders);
						// console.log("data pushed", sc.orders);
					}
				}
				else {
					sc.orders = [];
					sc.orders.push(order);
					$localForage.setItem('orders', sc.orders);
				}
				// console.log("new list", sc.orders);
			});
			if (!sc.pendingOrders) {
				sc.pendingOrders = 1;
			} else {
				sc.pendingOrders++;
			}
		}

		if (window.cordova) {
			FCMPlugin.onNotification(
				function (data) {
					// console.log("parse data.customer",JSON.parse(data.customer));
					// console.log("parse trim",JSON.parse(_.trim(data.items, '"')));
					console.log(data);

					// updateOrdersArray(data);

					if (data.wasTapped) {
						console.log(2);
						updateCustomerList(data);
						updateOrdersArray(data);
						console.log("data added in if", sc.orders);
						// ordersService.getDeviceTokenOfCustomer(data.userId).then(function (data1) {
						// 	console.log("data1",data1);
						// 	deviceToken = data1.device_token;
						// 	var msg = {
						// 		"to": deviceToken,
						// 		"priority": "high",
						// 		notification: {
						// 			"title": "Order Placed",
						// 			"body": "Your order has been received successfully",
						// 			"sound": "default",
						// 			"icon": "fcm_push_icon"
						// 		}
						// 	};
						// 	var url = "https://fcm.googleapis.com/fcm/send";
						// 	$http.post(url, msg,
						// 		{
						// 			headers: {
						// 				'Content-Type': 'application/json',
						// 				"Authorization": "key=AIzaSyDY34h5qNWXQFAHvRUY-T-lC9UoiP6745M"          // serverKey
						// 			}
						// 		}
						// 	).then(function (data) {
						// 		console.log(data);
						// 	}).catch(function (err) {
						// 		console.log(err);
						// 	});
						// });
						//Notification was received on device tray and tapped by the user.
					}
					else {
						console.log(3);
						updateCustomerList(data);
						updateOrdersArray(data);
						console.log("data added in else", data);

						// ordersService.getDeviceTokenOfCustomer(data.userId).then(function (data1) {
						// 	deviceToken = data1.device_token;
						// 	var msg = {
						// 		"to": deviceToken,
						// 		"priority": "high",
						// 		notification: {
						// 			"title": "Order Placed",
						// 			"body": "Your order has been received successfully",
						// 			"sound": "default",
						// 			"icon": "fcm_push_icon"
						// 		}
						// 	};
						// 	var url = "https://fcm.googleapis.com/fcm/send";
						// 	$http.post(url, msg,
						// 		{
						// 			headers: {
						// 				'Content-Type': 'application/json',
						// 				"Authorization": "key=AIzaSyDY34h5qNWXQFAHvRUY-T-lC9UoiP6745M"          // serverKey
						// 			}
						// 		}
						// 	).then(function (data) {
						// 		console.log(data);
						// 	}).catch(function (err) {
						// 		console.log(err);
						// 	});
						// });
						// $cordovaToast.showLongBottom("New Order Arrived!!");
					}
				},
				function (msg) {
					console.log('onNotification callback successfully registered: ' + msg);
				},
				function (err) {
					console.log('Error registering onNotification callback: ' + err);
				}
			);
		}

	}
})();
