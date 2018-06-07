(function () {
	'use strict';

	angular
		.module('restaurant.menu')
		.controller('MenuController', MenuController);

	MenuController.$inject = ['categories', 'customerModal', '$http', 'loggedInUserData', 'dataService', '$scope',
		'$localForage', '$ionicSideMenuDelegate', '$state', 'localStorageService', '$cordovaToast', 'Icons', '$timeout', 'UserService', 'commonService'];

	/* @ngInject */
	function MenuController(categories, customerModal, $http, loggedInUserData, dataService, $scope, $localForage,
							$ionicSideMenuDelegate, $state, localStorageService, $cordovaToast, Icons, $timeout, UserService, commonService) {
		var vm = angular.extend(this, {
			categories: categories,
			logout: logout,
			closeApp: closeApp,
			onChange: onChange,
			getIcons: getIcons,
			getIconUrls: getIconUrls,
			showCustomers: showCustomers,
			menuOnline: loggedInUserData.data.menuOnline
		});

		function onChange() {
			var error = "";
			var flag = 0;
			if (vm.menuOnline) {
				if (!loggedInUserData.data.categories || loggedInUserData.data.categories.length == 0) {
					error = "Add at least one category";
					if (window.cordova) {
						var onConfirm1 = function () {
							vm.menuOnline = false;
							// vm.goOnline = {
							// 	'checked':false,
							// 	'text':''
							// }
						};
						navigator.notification.alert(
							'Add at least an item and a category', // message
							onConfirm1,            // callback to invoke with index of button pressed
							'Categories missing',           // title
							'OK'     // buttonLabels
						);
					}
					else {
						alert('Add at least an item and a category');
					}
					vm.menuOnline = false;
					console.log(error);
					return;
				}
				// _.each(loggedInUserData.data.menuItems,function (val, key) {
				// 	// console.log(val);
				// 	if(!val.category){
				// 		console.log(val.title+" has no category");
				// 	}
				// });
				_.each(loggedInUserData.data.categories, function (value, key) {
					// console.log(value.title);
					value.itemCount = 0;
					_.each(loggedInUserData.data.menuItems, function (val) {
						// console.log(val);
						if (val.category == value.title) {
							value.itemCount++;
						}
					});
					if (!value.itemCount) {
						if (window.cordova) {
							var onConfirm2 = function () {
								vm.menuOnline = false;
							};
							navigator.notification.alert(
								'Add at least one item for this category', // message
								onConfirm2,            // callback to invoke with index of button pressed
								value.title + ' has no items',           // title
								'OK'     // buttonLabels
							);
						}
						else {
							alert('Add at least one item for this category');
						}
						console.log(value.title + " has no items");
						flag++;
					}
				});
				console.log(flag);
				if (flag) {
					vm.menuOnline = false;
				}
				else {
					vm.menuOnline = true;
					dataService.updateMenuStatus(loggedInUserData.data.info.userId, vm.menuOnline)
						.then(function () {
							loggedInUserData.data.menuOnline = vm.menuOnline;
							$localForage.setItem('loggedInUser', loggedInUserData.data);
							// console.log(vm.menuOnline);
						})
				}
				// console.log("insideIf");
			}
			else {
				if (window.cordova) {
					var onConfirm3 = function (buttonIndex) {

						if (buttonIndex == 1) {
							vm.menuOnline = false;
							dataService.updateMenuStatus(loggedInUserData.data.info.userId, vm.menuOnline)
								.then(function () {
									loggedInUserData.data.menuOnline = vm.menuOnline;
									$localForage.setItem('loggedInUser', loggedInUserData.data);
									// console.log(vm.menuOnline);
								})
						}
						else {
							console.log('cancelled');
							$timeout(function () {
								vm.menuOnline = true;
							}, 200)
						}
					};
					navigator.notification.confirm(
						'If you go offline, customers will not be able to see your restaurant in search results. Are you sure you want to go offline?', // message
						onConfirm3,            // callback to invoke with index of button pressed
						'Go offline !',           // title
						['Yes', 'Cancel']     // buttonLabels
					);
				}
				else {
					var r = confirm('If you go offline, customers will not be able to see your restaurant in search results. Are you sure you want to go offline?');
					if (r == true) {
						vm.menuOnline = false;
						dataService.updateMenuStatus(loggedInUserData.data.info.userId, vm.menuOnline)
							.then(function () {
								loggedInUserData.data.menuOnline = vm.menuOnline;
								$localForage.setItem('loggedInUser', loggedInUserData.data);
								// console.log(vm.menuOnline);
							})
					} else {
						console.log('cancelled');
						$timeout(function () {
							vm.menuOnline = true;
						}, 200)
					}
				}


			}
		}

		if (window.cordova) {
			FCMPlugin.getToken(
				function (token) {
					console.log(token);
					if (token != null) {
						$scope.device_token = token;
						$scope.$broadcast('token updated');
					}
				},
				function (err) {
					console.log('error retrieving token: ' + err);
				}
			);
		}

		$scope.$on('token updated', function () {
			if (loggedInUserData.data.info.userId) {
				dataService.updateToken(loggedInUserData.data.info.userId, $scope.device_token)
					.then(function () {
						loggedInUserData.data.device_token = $scope.device_token;
						$localForage.setItem('loggedInUser', loggedInUserData.data);
					})

			}
		});
		// var data = {
		// 	"to": "erVW-lp8atU:APA91bEonneyoJJOuroZxTfdXkBh_v4WfrTh1-MpL6pHYrMFpSObTWkzpEu9DrFFU6QqatN2CpF8pnMk5PSJnNgsi8inOEZK6s41ybIHjXtAnT5wqsuEQkL_HufDfhbk3UF6dniw-q9a",
		// 	"priority": "high",
		// 	notification: {
		// 		"title": "New Order Received",
		// 		"body": "hello beta kkrh",
		// 		"sound": "default",
		// 		"icon": "fcm_push_icon"
		// 	}
		// };
		// var url = "https://fcm.googleapis.com/fcm/send";
		// $http.post(url, data,
		// 	{
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 			"Authorization": "key=AIzaSyDY34h5qNWXQFAHvRUY-T-lC9UoiP6745M"          // serverKey
		// 		}
		// 	}
		// ).then(function (data) {
		// 	console.log(data);
		// }).catch(function (err) {
		// 	console.log(err);
		// });

		function logout() {
			// vm.status.id=0;
			$ionicSideMenuDelegate.toggleLeft();
			localStorageService.clearAll();
			$localForage.clear();
			// localStorageService.remove('loggedInUser');
			// Object.keys(loggedInUserData).forEach(function (key) {
			// 	delete loggedInUserData[key];
			// });
			Object.keys(loggedInUserData.data).forEach(function (key) {
					delete loggedInUserData.data[key];
			});
			Object.keys(commonService).forEach(function (key) {
					delete commonService[key];
			});
			Object.keys(UserService).forEach(function (key) {
					delete UserService[key];
			});
			loggedInUserData.data = {};
			loggedInUserData.data = {
				"address": {
					door: "",
					line1: "",
					line2: "",
					line3: "",
					city: "",
					postcode: ""
				},
				"allergyDisclaimer": "",
				"addInfo": "",
				"categories": [],
				"cuisines": [],
				"desc": "",
				"fhr": 0,
				"info": {},
				"imageURL": [],
				"logo": "",
				"map": {
					zoomLevel: 15,
					origin: {
						latitude: "",
						longitude: ""
					}
				},
				"min":"",
				"minOrder": "",
				"menuItems": {},
				"pictures": [],
				"paymentMethod": {
					"card": false,
					"cash": false,
					"paypal": false
				},
				"currency": "£",
				"postcodes": [],
				"profileComplete": -1,
				"rating": "",
				"serviceType": {
					"dineIn": false,
					"homeDelivery": false,
					"pickUp": false
				},
				"offers": {},
				"menuOnline": false,
				"speciality": "",
				"storeName": "",
				"phone": "",
				"device_token": "",
				"time": {
					"mon": {
						"opening": "",
						"closing": "",
						"selected": false
					},
					"tue": {
						"opening": "",
						"closing": "",
						"selected": false
					},
					"wed": {
						"opening": "",
						"closing": "",
						"selected": false
					},
					"thu": {
						"opening": "",
						"closing": "",
						"selected": false
					},
					"fri": {
						"opening": "",
						"closing": "",
						"selected": false
					},
					"sat": {
						"opening": "",
						"closing": "",
						"selected": false
					},
					"sun": {
						"opening": "",
						"closing": "",
						"selected": false
					}
				}
			};
			console.log("All Local Data cleared");
			if (window.cordova) {
				facebookConnectPlugin.logout(function () {
					console.log("fb sign out successful");
				}, function (fail) {
					console.log(fail);
				});
			}
			firebase.auth().signOut().then(function () {
				// Sign-out successful.
				console.log("Email Sign-out successful.");
				console.log(loggedInUserData);
				$state.go('login');
				if (window.cordova) {
					$cordovaToast.showLongBottom('Logged out successfully');
				}
				else {
					console.log('Logged out successfully');
				}
			}, function (error) {
				// An error happened.
				console.log("An error happened.", error);
			});

		}

		function closeApp() {
			ionic.Platform.exitApp();
			console.log("app closed");
		}

		function getIconUrls(iconArray) {
			Icons.data = dataService.getIconUrls(iconArray);
			console.log(Icons);
		}

		function getIcons() {
			dataService.getIcons()
				.then(function (icons) {
					Icons.data = icons;
					console.log(Icons.data);
					getIconUrls(Icons.data);
				});
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

		getIcons();
	}
})();
