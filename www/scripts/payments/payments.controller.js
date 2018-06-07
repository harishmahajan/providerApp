(function () {
	'use strict';

	angular
		.module('restaurant.payments')
		.controller('PaymentsController', PaymentsController);

	PaymentsController.$inject = ['$state', 'paymentsService', 'loggedInUserData',
		'$ionicLoading', '$cordovaToast', '$localForage', '$timeout', '$ionicListDelegate', '$rootScope', '$window'];

	/* @ngInject */
	function PaymentsController($state, paymentsService, loggedInUserData,
		$ionicLoading, $cordovaToast, $localForage, $timeout, $ionicListDelegate, $rootScope, $window) {

		(function activate() {
			if (!loggedInUserData.data.settings) {
				loggedInUserData.data.settings = {};
			}
			if (!loggedInUserData.data.settings.paymentPreferences) {
				loggedInUserData.data.settings.paymentPreferences = {
					onlinePayments: false,
					paypalEmail: '',
					paypalFee: '',
					socialDiscountSwitch: false,
					socialDiscountPercentage: ''
				}
			}
		})();

		var pc = angular.extend(this, {
			categories: [],
			temp: {},
			paymentPreferences: loggedInUserData.data.settings.paymentPreferences,
			saveChanges: saveChanges,
			detectChange: detectChange,
			oldData: angular.copy(loggedInUserData.data.settings.paymentPreferences)
		});

		// ******************************************************
		function saveChanges() {
			pc.changed=false;
			console.log("saving")
			paymentsService.savePreferences(pc.paymentPreferences).then(function (success) {
				console.log(success, "Successfull")
				loggedInUserData.settings = {};
				loggedInUserData.data.settings.paymentPreferences = pc.paymentPreferences;
				$localForage.setItem('loggedInUser', loggedInUserData.data).then(function () {
					pc.oldData= angular.copy(loggedInUserData.data.settings.paymentPreferences)
					console.log('added data');
					if (window.cordova) {
						//noinspection JSUnresolvedFunction
						cordova.plugins.snackbar('Payment details saved successfully!', 'SHORT', "", function () {

						});
					} else {
						alert("updated");
					}
				}, function (err) {
					console.log(err);
				});
			}, function (err) {
				console.log(err);
			})
		}

		function detectChange(key) {
			// console.log(key)
			var deepDiffMapper = function () {
				return {
					VALUE_CREATED: 'created',
					VALUE_UPDATED: 'updated',
					VALUE_DELETED: 'deleted',
					VALUE_UNCHANGED: 'unchanged',
					map: function (obj1, obj2) {
						if (this.isFunction(obj1) || this.isFunction(obj2)) {
							throw 'Invalid argument. Function given, object expected.';
						}
						if (this.isValue(obj1) || this.isValue(obj2)) {
							return {
								type: this.compareValues(obj1, obj2),
								data: (obj1 === undefined) ? obj2 : obj1
							};
						}

						var diff = {};
						for (var key in obj1) {
							if (this.isFunction(obj1[key])) {
								continue;
							}

							var value2 = undefined;
							if ('undefined' != typeof (obj2[key])) {
								value2 = obj2[key];
							}

							diff[key] = this.map(obj1[key], value2);
						}
						for (var key in obj2) {
							if (this.isFunction(obj2[key]) || ('undefined' != typeof (diff[key]))) {
								continue;
							}

							diff[key] = this.map(undefined, obj2[key]);
						}

						return diff;

					},
					compareValues: function (value1, value2) {
						if (value1 === value2) {
							return this.VALUE_UNCHANGED;
						}
						if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
							return this.VALUE_UNCHANGED;
						}
						if ('undefined' == typeof (value1)) {
							return this.VALUE_CREATED;
						}
						if ('undefined' == typeof (value2)) {
							return this.VALUE_DELETED;
						}

						return this.VALUE_UPDATED;
					},
					isFunction: function (obj) {
						return {}.toString.apply(obj) === '[object Function]';
					},
					isArray: function (obj) {
						return {}.toString.apply(obj) === '[object Array]';
					},
					isDate: function (obj) {
						return {}.toString.apply(obj) === '[object Date]';
					},
					isObject: function (obj) {
						return {}.toString.apply(obj) === '[object Object]';
					},
					isValue: function (obj) {
						return !this.isObject(obj) && !this.isArray(obj);
					}
				}
			}();
			var result = deepDiffMapper.map(pc.oldData[key], pc.paymentPreferences[key]);
			console.log(result);
			if (result.type == "unchanged") {
				pc.changed = false;
			} else {
				pc.changed = true;
			}
		}
	}
})();
