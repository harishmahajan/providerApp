/**
 * Created by anubhavshrimal on 02/10/16.
 */
(function () {
	'use strict';

	angular
		.module('restaurant.special-offers')
		.controller('specialOffersController', specialOffersController);

	specialOffersController.$inject = ['$state', 'addSpecialOffersService', '_', 'addNewItem', 'loggedInUserData', '$cordovaToast', '$localForage', 'commonService', '$ionicPopup',
		'$ionicLoading', '$ionicHistory', '$timeout', '$scope'];

	/* @ngInject */
	function specialOffersController($state, addSpecialOffersService, _, addNewItem, loggedInUserData, $cordovaToast, $localForage, commonService, $ionicPopup,
		$ionicLoading, $ionicHistory, $timeout, $scope) {

		var hh = angular.extend(this, {
			category: "Category",
			offersType: [],
			selectedOfferType: selectedOfferType,
			offerSelected: false,
			percentDiscount: '',
			menuItems: [],
			duration: [
				{
					'id': '1',
					'title': 'One Day',
				},
				{
					'id': '2',
					'title': 'One Week',
				},
				{
					'id': '3',
					'title': 'Until Further Action',
				},
				{
					'id': '4',
					'title': 'Advanced',
				}
			],
			selectedCondition: null,
			selectedItem: {},
			ordersAbove: null,
			apply: apply,
			offerActive: false,
			prevOffer: {},
			offerType: "",
			deactivateOffer: deactivateOffer,
		});

		var catOffers = [
			{
				'id': '1',
				'title': 'Percentage Discount',
			},
			{
				'id': '2',
				'title': 'Buy One Get One Free',
			},
			{
				'id': '3',
				'title': 'Buy One Get One Half Price',
			},
		], menuOffers = [
			{
				'id': '4',
				'title': 'Orders Over Percent Discount',
			}
		];
		var offerId = null;
		var daysCondition = {};
		var record = {
			'type': '',
			'percentDiscount': 0,
			'selectedItem': {},
			'ordersAbove': 0,
			'selectedCondition': '',
			'daysCondition': {},
			'timeCondition': {},
		};

		(function activate() {
			addSpecialOffersService.getSpecialOffers().then(function (prevOffer) {
				hh.offerActive = activeCheck(prevOffer);
				if (hh.offerActive) {
					if (typeof (prevOffer.daysCondition.start) != "object" || typeof (prevOffer.daysCondition.end) != "object") {
						prevOffer.daysCondition.start = new Date(prevOffer.daysCondition.start);
						prevOffer.daysCondition.end = new Date(prevOffer.daysCondition.end);
					}
					_.forEach(prevOffer.timeCondition, function (day) {
						if (day.selected) {
							day.start = new Date(day.start)
							day.end = new Date(day.end)
						}
					})
					hh.showPreviousOffer = true;
					hh.prevOffer = angular.copy(prevOffer);
				}
			});

			hh.category = commonService.catHH[0].title || 'All Categories';
			if (hh.category == 'All Categories') {
				hh.offersType = menuOffers;
			} else {
				hh.offersType = catOffers
			}
		})();

		// ********************************************************************

		function selectedOfferType(type) {
			hh.offerSelected = true;
			offerId = type;
			hh.menuItems = [];
			_.forEach(loggedInUserData.data.menuItems, function (val) {
				if (hh.category == val.category)
					hh.menuItems.push(val);
			});
		}

		function apply() {
			// $ionicLoading.show({
			// 	template: 'Loading...',
			// 	hideOnStateChange: true,
			// });
			switch (offerId) {
				case '1':
					// console.log(hh.percentDiscount,hh.selectedItem,hh.selectedCondition, hh.timeCondition);
					percentDisc();
					break;
				case '2':
					// console.log(hh.selectedCondition, hh.timeCondition);
					bogo();
					break;
				case '3':
					// console.log(hh.selectedCondition, hh.timeCondition);
					bogh();
					break;
				case '4':
					// console.log(hh.percentDiscount,hh.ordersAbove, hh.selectedCondition, hh.timeCondition);
					oAbove();
					break;
			}
		}

		function percentDisc() {
			var error = validate(hh.percentDiscount, hh.selectedItem, true, hh.selectedCondition, hh.timeCondition);
			if (error.count === 0) {
				console.log("All Good");
				$state.go('app.categories');
				record.type = 'Percentage Discount';
				record.percentDiscount = hh.percentDiscount;
				record.selectedItem = hh.selectedItem;
				record.selectedCondition = hh.selectedCondition;
				if (hh.selectedCondition == 4)
					record.timeCondition = hh.timeCondition;
				else
					record.daysCondition = daysCondition;
				if (!hh.offerActive) {
					createRecord(record);
				}
				else {
					if (window.cordova) {
						var onConfirm = function (buttonIndex) {
							if (buttonIndex == 1) {
								createRecord(record);
							}
						};
						navigator.notification.confirm(
							'Are you sure you want to expire the previous offer and activate the new offer?', // message
							onConfirm,            // callback to invoke with index of button pressed
							'A happy hour is already active!',           // title
							['Yes', 'Cancel']     // buttonLabels
						);
					}
					else {
						var r = confirm('A happy hour is already active. This will expire the previous offer and activate new offer');
						if (r == true) {
							createRecord(record);
						}
					}
				}
			} else {
				console.log("Not Good")
			}
		}

		function bogo() {
			var error = validate(true, true, true, hh.selectedCondition, hh.timeCondition);
			if (error.count === 0) {
				console.log("All Good");
				record.type = 'Buy One Get One Free';
				record.selectedCondition = hh.selectedCondition;
				if (hh.selectedCondition == 4)
					record.timeCondition = hh.timeCondition;
				else
					record.daysCondition = daysCondition;
				record.selectedItem = hh.selectedItem;
				if (!hh.offerActive) {
					createRecord(record);
				}
				else {
					if (window.cordova) {
						var onConfirm = function (buttonIndex) {
							if (buttonIndex == 1) {
								createRecord(record);
							}
						};
						navigator.notification.confirm(
							'Are you sure you want to expire the previous offer and activate the new offer?', // message
							onConfirm,            // callback to invoke with index of button pressed
							'A happy hour is already active!',           // title
							['Yes', 'Cancel']     // buttonLabels
						);
					}
					else {
						var r = confirm('A happy hour is already active. This will expire the previous offer and activate new offer');
						if (r == true) {
							createRecord(record);
						}
					}
				}
			} else {
				console.log("Not Good")
			}
		}

		function bogh() {
			var error = validate(true, true, true, hh.selectedCondition, hh.timeCondition);
			if (error.count === 0) {
				console.log("All Good");
				record.type = 'Buy One Get One Half Price';
				record.selectedCondition = hh.selectedCondition;
				if (hh.selectedCondition == 4)
					record.timeCondition = hh.timeCondition;
				else
					record.daysCondition = daysCondition;
				record.selectedItem = hh.selectedItem;
				if (!hh.offerActive) {
					createRecord(record);
				}
				else {
					if (window.cordova) {
						var onConfirm = function (buttonIndex) {
							if (buttonIndex == 1) {
								createRecord(record);
							}
						};
						navigator.notification.confirm(
							'Are you sure you want to expire the previous offer and activate the new offer?', // message
							onConfirm,            // callback to invoke with index of button pressed
							'A happy hour is already active!',           // title
							['Yes', 'Cancel']     // buttonLabels
						);
					}
					else {
						var r = confirm('A happy hour is already active. This will expire the previous offer and activate new offer');
						if (r == true) {
							createRecord(record);
						}
					}
				}
			} else {
				console.log("Not Good")
			}
		}

		function oAbove() {
			var error = validate(hh.percentDiscount, true, hh.ordersAbove, hh.selectedCondition, hh.timeCondition);
			if (error.count === 0) {
				console.log("All Good");
				record.type = 'Orders Over Percent Discount';
				record.percentDiscount = hh.percentDiscount;
				record.ordersAbove = hh.ordersAbove;
				record.selectedCondition = hh.selectedCondition;
				record.selectedItem = {
					category: 'All Categories',
					title: 'all'
				};
				if (hh.selectedCondition == 4)
					record.timeCondition = hh.timeCondition;
				else
					record.daysCondition = daysCondition;
				if (!hh.offerActive) {
					createRecord(record);
				}
				else {
					if (window.cordova) {
						var onConfirm = function (buttonIndex) {
							if (buttonIndex == 1) {
								createRecord(record);
							}
						};
						navigator.notification.confirm(
							'Are you sure you want to expire the previous offer and activate the new offer?', // message
							onConfirm,            // callback to invoke with index of button pressed
							'A happy hour is already active!',           // title
							['Yes', 'Cancel']     // buttonLabels
						);
					}
					else {
						var r = confirm('A happy hour is already active. This will expire the previous offer and activate new offer');
						if (r == true) {
							createRecord(record);
						}
					}
				}
			} else {
				console.log("Not Good")
			}
		}

		function validate(percent, selItem, ordersAbove, selCondition, timeCondition) {
			var error = {
				count: 0,
				code: "Okay"
			};
			if (!percent) {
				error.count++;
				var percentErr = $ionicPopup.alert({
					title: 'Select Discount Percentage!',
					// template: 'It might taste good'
				});
				percentErr.then(function (res) {
				});
			}
			if (!selItem || !selItem.category) {
				hh.selectedItem = {
					category: hh.category,
					title: 'all'
				};
			}
			if (!ordersAbove) {
				error.count++;
				var alertPopup = $ionicPopup.alert({
					title: 'Enter Order Above Field!',
					// template: 'It might taste good'
				});
				alertPopup.then(function (res) {
				});
			}
			if (!selCondition) {
				error.count++;
				var selPopup = $ionicPopup.alert({
					title: 'Select a duration!',
					// template: 'It might taste good'
				});
				selPopup.then(function (res) {
				});
			}
			switch (selCondition) {
				case '1':
					daysCondition.start = new Date();
					daysCondition.end = new Date(new Date().setTime(new Date().getTime() + 1 * 86400000));
					break;
				case '2':
					daysCondition.start = new Date();
					daysCondition.end = new Date(new Date().setTime(new Date().getTime() + 7 * 86400000));
					break;
				case '3':
					daysCondition.start = new Date();
					daysCondition.end = new Date(new Date().setTime(new Date().getTime() + 9999 * 86400000));
					break;
				case '4':
					var startCount = 0, endCount = 0, timingGood = false;
					if (!timeCondition) {
						error.count++;
						var timePopup = $ionicPopup.alert({
							title: 'Select time and day conditions!',
						});
						timePopup.then(function (res) {
						});
					}
					else {
						_.forEach(timeCondition, function (v) {
							if (_.isDate(v.start)) {
								startCount++;
							}
							if (_.isDate(v.end)) {
								endCount++;
							}
							if (v.start && v.end) {
								timingGood = true;
							}
						});
						if (startCount == 0 && endCount == 0 || !timingGood) {
							error.count++;
							error.code = "Invalid Day/Time Selection"
							var day = $ionicPopup.alert({
								title: error.code,
								// template: 'It might taste good'
							});
							day.then(function (res) {
							});
						}
					}
					break;
			}
			if (!timeCondition) {
				hh.timeCondition = {};
			}
			return error;
		}

		function createRecord(data) {
			$ionicHistory.goBack(-2);
			console.log(data);
			addSpecialOffersService.createSpecialOffer(data, function (onComplete) {
				hh.offerActive = true;
				if (window.cordova) {
					//noinspection JSUnresolvedFunction
					cordova.plugins.snackbar('Offer activated successfully!', 'SHORT', "", function () {

					});
				}
			});
			_.each(data.timeCondition, function (v) {
				v.start = new Date(v.start);
				v.end = new Date(v.end);
			})
		}

		function activeCheck(offer) {
			var check = {};
			var offerActive = false;
			switch (offer.selectedCondition) {
				case "1":
					checkStatus();
					break;
				case '2':
					checkStatus();
					break;
				case '3':
					checkStatus();
					break;
				case '4':
					checkCondition4();
					break;
				default:
					offerActive = false;
			}
			function checkStatus() {
				check.start = new Date(offer.daysCondition.start);
				check.end = new Date(offer.daysCondition.end);
				var currentTime = new Date();
				if (check.start < currentTime < check.end) {
					offerActive = true
				}
			}
			function checkCondition4() {

				// var today = (new Date()).getDay();
				// var yester;
				// switch (today) {
				// 	case 0:
				// 		today = 'sun';
				// 		yester = 'sat';
				// 		break;
				// 	case 1:
				// 		today = 'mon';
				// 		yester = 'sun';
				// 		break;
				// 	case 2:
				// 		today = 'tue';
				// 		yester = 'mon';
				// 		break;
				// 	case 3:
				// 		today = 'wed';
				// 		yester = 'tue';
				// 		break;
				// 	case 4:
				// 		today = 'thu';
				// 		yester = 'wed';
				// 		break;
				// 	case 5:
				// 		today = 'fri';
				// 		yester = 'thu';
				// 		break;
				// 	case 6:
				// 		today = 'sat';
				// 		yester = 'fri';
				// 		break;
				// }

				// //if yesterday was a normal or overflowing day
				// if (offer.timeCondition[yester]) {
				// 	console.log("End Time", new Date(offer.timeCondition[yester].end).getHours());
				// 	console.log("Start Time", new Date(offer.timeCondition[yester].start).getHours());
				// 	if (new Date(offer.timeCondition[yester].end).getHours() > new Date(offer.timeCondition[yester].start).getHours()) {
				// 		offer.timeCondition[today].doubleDay = false;
				// 	}
				// 	else {
				// 		offer.timeCondition[today].doubleDay = true;
				// 		offer.timeCondition[today].openTimeY = offer.timeCondition[yester].start;
				// 		offer.timeCondition[today].closeTimeY = offer.timeCondition[yester].end;
				// 	}
				// } else {
				// 	offer.timeCondition[today].doubleDay = false;
				// }
				// if (new Date(offer.timeCondition[today].end).getHours() > new Date(offer.timeCondition[today].start).getHours()) {
				// 	offer.timeCondition[today].sameDayClosing = true;
				// }
				// else {
				// 	offer.timeCondition[today].sameDayClosing = false;
				// }

				// //today - normal, yesterday - normal
				// if (offer.timeCondition[today].sameDayClosing && !offer.timeCondition[today].doubleDay) {
				// 	console.log('case 1');
				// 	if (isOpen(offer.timeCondition[today].start, offer.timeCondition[today].end, 0)) {
				// 		// console.log('true');
				// 		offerActive = true;
				// 	}
				// 	else {
				// 		// console.log('false');
				// 		offerActive = false;
				// 	}
				// }
				// //today - overflow, yesterday - normal
				// else if (!offer.timeCondition[today].sameDayClosing && !offer.timeCondition[today].doubleDay) {
				// 	console.log('case 2');
				// 	if (isOpen(offer.timeCondition[today].start, 24, 0)) {
				// 		// console.log('true');
				// 		offerActive = true;
				// 	}
				// 	else {
				// 		// console.log('false');
				// 		offerActive = false;
				// 	}
				// }
				// //today - overflow, yesterday - overflow
				// else if (offer.timeCondition[yester] && !offer.timeCondition[today].sameDayClosing && offer.timeCondition[today].doubleDay) {
				// 	console.log('case 3');
				// 	if (isOpen(offer.timeCondition[today].start, 24, offer.timeCondition[yester].end)) {
				// 		// console.log('true');
				// 		offerActive = true;
				// 	}
				// 	else {
				// 		// console.log('false');
				// 		offerActive = false;
				// 	}
				// }
				// //today - normal, yesterday - overflow
				// else if (offer.timeCondition[yester] && offer.timeCondition[today].sameDayClosing && offer.timeCondition[today].doubleDay) {
				// 	console.log('case 4');
				// 	if (isOpen(offer.timeCondition[today].start, offer.timeCondition[today].end, offer.timeCondition[yester].end)) {
				// 		// console.log('true');
				// 		offerActive = true;
				// 	}
				// 	else {
				// 		// console.log('false');
				// 		offerActive = false;
				// 	}
				// }
				// // })

				// function isOpen(opening, closing, closingY) {
				// 	console.log(opening, closing, closingY);
				// 	var openingHours = new Date(opening).getHours();
				// 	var openingMinutes = new Date(opening).getMinutes();
				// 	var openingTime = openingHours * 60 + openingMinutes;
				// 	// console.log(openingHours);
				// 	// console.log(openingMinutes);
				// 	// console.log(openingTime);

				// 	if (typeof closing == 'object') {
				// 		var closingHours = new Date(closing).getHours();
				// 		var closingMinutes = new Date(closing).getMinutes();
				// 		var closingTime = closingHours * 60 + closingMinutes;
				// 		// console.log(closingHours);
				// 		// console.log(closingMinutes);
				// 		// console.log(closingTime);
				// 	}
				// 	else {
				// 		closingTime = 24 * 60;
				// 	}

				// 	var currentHours = new Date().getHours();
				// 	var currentMinutes = new Date().getMinutes();
				// 	var currentTime = currentHours * 60 + currentMinutes;
				// 	// console.log(currentHours);
				// 	// console.log(currentMinutes);
				// 	// console.log(currentTime);

				// 	if (typeof closingY == 'object') {
				// 		var closingHoursY = new Date(closingY).getHours();
				// 		var closingMinutesY = new Date(closingY).getMinutes();
				// 		var closingTimeY = closingHoursY * 60 + closingMinutesY;
				// 		// console.log(closingHoursY);
				// 		// console.log(closingMinutesY);
				// 		// console.log(closingTimeY);
				// 	}
				// 	else {
				// 		closingTimeY = 0;
				// 	}

				// 	//if current time is between today's opening closing(or midnight)
				// 	// OR
				// 	// if current time is between midnight and yesterday's closing
				// 	console.log(currentTime, closingTime, openingTime, closingTimeY)

				// 	if ((currentTime < closingTime && currentTime > openingTime) || currentTime < closingTimeY) {
				// 		return true;
				// 	}
				// }

				// console.log("Final", offer.timeCondition, offerActive)
				offerActive = true;
			}
			return offerActive;
		}

		function deactivateOffer() {
			if (window.cordova) {
				var onConfirm = function (buttonIndex) {
					if (buttonIndex == 1) {
						addSpecialOffersService.createSpecialOffer(record, function (onComplete) {
							$timeout(function () {
								hh.offerActive = false;
								if (window.cordova) {
									//noinspection JSUnresolvedFunction
									cordova.plugins.snackbar('Offer deactivated successfully!', 'SHORT', "", function () {

									});
								}
							}, 100)
						});
					}
				};
				navigator.notification.confirm(
					'Are you sure you want to expire this offer?', // message
					onConfirm,            // callback to invoke with index of button pressed
					'Deactivate Happy Hour!',           // title
					['Yes', 'Cancel']     // buttonLabels
				);
			}
			else {
				var r = confirm('Are you sure you want to expire this offer?');
				if (r == true) {
					addSpecialOffersService.createSpecialOffer(record, function (onComplete) {
						$timeout(function () {
							hh.offerActive = false;
							if (window.cordova) {
								//noinspection JSUnresolvedFunction
								cordova.plugins.snackbar('Offer deactivated successfully!', 'SHORT', "", function () {

								});
							}
						}, 100)
					});
				}
			}
		}

		$scope.$on('category: modified', function() {
			console.log("Check for consistency")
		});
	}
})();
