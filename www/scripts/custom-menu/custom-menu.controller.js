/**
 * Created by anubhavshrimal on 02/10/16.
 */
(function () {
	'use strict';

	angular
		.module('restaurant.custom-menu')
		.controller('CustomMenuContoller', CustomMenuContoller);

	CustomMenuContoller.$inject = ['$state', 'addOffersService', '_', 'addNewItem', 'editItem', 'addSpecialItem', 'editSpecialItem',
		'loggedInUserData', '$cordovaToast',
		'$localForage', '$ionicListDelegate', '$rootScope', '$ionicPopup', '$scope', '$stateParams'];

	/* @ngInject */
	function CustomMenuContoller($state, addOffersService, _, addNewItem, editItem, addSpecialItem, editSpecialItem,
								 loggedInUserData, $cordovaToast,
								 $localForage, $ionicListDelegate, $rootScope, $ionicPopup, $scope, $stateParams) {

		var vm = angular.extend(this, {
			addNewItemModal: addNewItemModal,
			remove: remove,
			showItems: showItems,
			showCategories: showCategories,
			openSorter: openSorter,
			editItemModal: editItemModal,
			addSpecialItemModal: addSpecialItemModal,
			editSpecialItemModal: editSpecialItemModal,
			removeSpecial: removeSpecial,
			showHideTimeBox: showHideTimeBox,
			showHideAmountBox: showHideAmountBox,
			showHideTypeBox: showHideTypeBox
		});

		(function activate() {
		})();

		// ********************************************************************
		vm.specialOfferPage = false;
		vm.pageTitle = 'Meal Deals';
		if ($stateParams.special == 'true') {
			vm.specialOfferPage = true;
			vm.pageTitle = 'Special Offers';
		}


		vm.profile = loggedInUserData.data;
		console.log(vm.profile);
		$rootScope.showItmBox = true;
		var restrictionPopup;

		var newItem = {
			selected: false
		};

		function showCategories() {
			$rootScope.showItmBox = false;
			console.log(vm.showItmBox);
		}

		function showItems() {
			$rootScope.showItmBox = true;
			console.log(vm.showItmBox);
		}

		var menuOffers = addOffersService.getMenuOffers();
		var menuSpecialOffers = addOffersService.getSpecialOffers();

		vm.offers = loggedInUserData.data.offers;
		vm.specialOffers = loggedInUserData.data.specialOffers;

		function convertTimeToObject() {
			console.log(typeof vm.specialOffers);
			_.each(vm.specialOffers, function (n) {
				if (n.conditionName == 'time') {
					if(n.conditionOptions) {
						n.conditionOptions.a = new Date(n.conditionOptions.a);
						n.conditionOptions.b = new Date(n.conditionOptions.b);
					}
				}
			});
		}

		convertTimeToObject();

		if (!_.isEmpty(vm.offers)) {
			vm.offersLength = Object.keys(vm.offers).length;
		}
		else {
			vm.offersLength = 0;
		}

		if (!_.isEmpty(vm.specialOffers)) {
			vm.specialOffersLength = Object.keys(vm.specialOffers).length;
		}
		else {
			vm.specialOffersLength = 0;
		}

		$rootScope.currentMealDeal = [];

		function addSizeToMealDealItem(item, price, status) {
			_.each(item.price, function (n) {
				if (n.checked && n.name != price.name) {
					n.checked = false;
				}
			})
			console.log(item);
			console.log(price);
			console.log(status);
			var index = _.findIndex($rootScope.currentMealDeal, function (n) {
				return n.title == item.title;
			})
			if (status) {
				$rootScope.currentMealDeal[index].offerPrice = price.name;
			}
			else {
				$rootScope.currentMealDeal[index].offerPrice = '';
			}
			console.log($rootScope.currentMealDeal);

		}

		function addQuantityToMealDealItem(quantity, item) {

			console.log(item);
			console.log(quantity);

			var index = _.findIndex($rootScope.currentMealDeal, function (n) {
				return n.title == item.title;
			})
			console.log(index);
			if (quantity) {
				console.log('if');
				$rootScope.currentMealDeal[index].quantity = quantity;
			}
			else {
				console.log('else');
				$rootScope.currentMealDeal[index].quantity = 1;
			}
			console.log($rootScope.currentMealDeal);

		}

		function addVarietyToMealDealItem(item, variety, status) {
			_.each(item.variety, function (n) {
				if (n.checked && n != variety) {
					n.checked = false;
				}
			})
			console.log(item);
			console.log(variety);
			console.log(status);
			var index = _.findIndex($rootScope.currentMealDeal, function (n) {
				return n.title == item.title;
			})
			if (status) {
				$rootScope.currentMealDeal[index].variety = variety;
			}
			else {
				$rootScope.currentMealDeal[index].variety = '';
			}
			console.log($rootScope.currentMealDeal);

		}

		function addToMealDeal(item, status) {
			if (status) {
				$rootScope.currentMealDeal.push(item);
				console.log($rootScope.currentMealDeal);
			}
			else {
				$rootScope.currentMealDeal = _.reject($rootScope.currentMealDeal, function (n) {
					return n.title == item.title;
				})
			}
		}

		function addCategoryToMealDeal(item, status) {

			if (status) {
				$rootScope.currentMealDeal.push(item);
				console.log($rootScope.currentMealDeal);
			}
			else {
				$rootScope.currentMealDeal = _.reject($rootScope.currentMealDeal, function (n) {
					return n.title == item.title;
				})
			}
		}

		function add() {

			// Check for empty meal deal
			if ($rootScope.currentMealDeal.length == 0) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Select at least one item for the meal deal', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Items missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Select at least one item for the meal deal');
				}
				return;
			}

			// Check for price
			if (!newItem.price) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please enter the price for this meal deal', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Price missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please enter the price for this meal deal');
				}
				return;
			}

			// Check for offer name
			if (!newItem.name || newItem.name.trim() == '') {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please enter a name for this meal deal', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Name missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please enter a name for this meal deal');
				}
				return;
			}

			newItem.id = Math.floor((new Date().getTime()) / 1000);
			// newItem.buyItems = _.filter(items, function(val){
			// 	return val.checked == true;
			// });
			console.log(newItem);
			console.log($rootScope.currentMealDeal);
			newItem.buyItems = $rootScope.currentMealDeal;
			if (vm.condition) {
				newItem.condition = vm.condition;
			}
			console.log(newItem);
			menuOffers.$add(newItem)
				.then(function (data) {
					console.log("data....",data);
					console.log(loggedInUserData);
					loggedInUserData.data.offers[data.key] = newItem;
					$localForage.setItem('loggedInUser', loggedInUserData.data);
					vm.offersLength = Object.keys(vm.offers).length;
					addNewItem.hide();
					$rootScope.currentMealDeal = [];
					_.each(vm.profile.categories, function (n) {
						delete n.checkedCat;
					})
					_.each(vm.profile.menuItems, function (n) {
						delete n.checked;
						_.each(n.price, function (o) {
							delete o.checked;
						})
					})
					vm.item = {};
					vm.items = []
				});

		}

		function addSpecial() {
			if ($rootScope.currentMealDeal.length == 0) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Select at least one item for the special offer', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Items missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Select at least one item for the special offer');
				}
				return;
			}
			if (!newItem.price) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please enter the price for this special offer', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Price missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please enter the price for this special offer');
				}
				return;
			}

			if (!newItem.name || newItem.name.trim() == '') {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please enter a name for this special offer', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Name missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please enter a name for this special offer');
				}
				return;
			}

			console.log(vm.condition);
			if (!$rootScope.condition) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please select a special condition for the offer. If you don\'t want to provide a special condition, you can create a meal deal instead', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Condition missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please select a special condition for the offer. If you don\'t want to provide a special condition, you can create a meal deal instead')
				}
				return;
			}


			newItem.id = Math.floor((new Date().getTime()) / 1000);
			// newItem.buyItems = _.filter(items, function(val){
			// 	return val.checked == true;
			// });
			console.log(newItem);
			console.log($rootScope.currentMealDeal);
			newItem.buyItems = $rootScope.currentMealDeal;
			if (vm.condition) {
				newItem.condition = vm.condition;
			}
			console.log(newItem);
			//Add special conditions of the offer
			newItem.conditionName = $rootScope.condition;
			if (newItem.conditionName == 'time') {
				newItem.conditionOptions = {
					'a': $rootScope.specialCondition.a.toString(),
					'b': $rootScope.specialCondition.b.toString()
				}
			}
			else {
				newItem.conditionOptions = $rootScope.specialCondition;
			}
			console.log(newItem.conditionOptions);
			menuSpecialOffers.$add(newItem)
				.then(function (data) {
					console.log(data);
					loggedInUserData.data.specialOffers[data.key] = newItem;
					console.log(loggedInUserData);
					$localForage.setItem('loggedInUser', loggedInUserData.data);
					vm.specialOffersLength = Object.keys(vm.profile.specialOffers).length;
					convertTimeToObject();
					addSpecialItem.hide();
					$rootScope.currentMealDeal = [];
					$rootScope.specialCondition = {};
					$rootScope.condition = null;
					_.each(vm.profile.categories, function (n) {
						delete n.checkedCat;
					})
					_.each(vm.profile.menuItems, function (n) {
						delete n.checked;
						_.each(n.price, function (o) {
							delete o.checked;
						})
					})
					vm.item = {};
					//vm.items = []
				});


		}

		function edit() {
			if ($rootScope.currentMealDeal.length == 0) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Select at least one item for a meal deal', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Items missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Select at least one item for a meal deal');
				}
				return;

			}

			if (!newItem.price) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please enter the price for this meal deal', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Price missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please enter the price for this meal deal');
				}
				return;
			}


			if (!newItem.name || newItem.name.trim() == '') {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please enter a name for this meal deal', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Name missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please enter a name for this meal deal');
				}
				return;
			}
			// newItem.id = Math.floor((new Date().getTime()) / 1000);
			// newItem.buyItems = _.filter(items, function(val){
			// 	return val.checked == true;
			// });
			console.log(newItem);
			console.log($rootScope.currentMealDeal);
			newItem.buyItems = $rootScope.currentMealDeal;
			if (vm.condition) {
				newItem.condition = vm.condition;
			}
			_.each(newItem.buyItems, function (n) {
				delete n.$$hashKey;
				if (n.price) {
					_.each(n.price, function (o) {
						delete o.$$hashKey;
					})
				}
				if (n.variety) {
					delete n.variety.$$hashKey;
				}
				if (n.varieties) {
					_.each(n.varieties, function (o) {
						delete o.$$hashKey;
					})
				}
			})
			console.log(newItem);


			console.log(vm.offers);
			var updateIndex = _.findKey(vm.offers, function (offer) {
				return offer.id == newItem.id;
			});

			if (updateIndex != -1) {
				// vm.offers = angular.copy(vm.offers);

				vm.offers[updateIndex] = angular.copy(newItem);
				_.each(vm.offers, function (n) {
					_.each(n.buyItems, function (o) {
						delete o.$$hashKey;
					})
				})
				console.log(vm.offers);

				console.log(loggedInUserData.data.info);
				addOffersService.updateMealDeals(loggedInUserData.data.info.userId, vm.offers);

				$localForage.setItem('loggedInUser', loggedInUserData.data);
				editItem.hide();
				$rootScope.currentMealDeal = [];
				_.each(vm.profile.categories, function (n) {
					delete n.checkedCat;
				})
				_.each(vm.profile.menuItems, function (n) {
					delete n.checked;
					_.each(n.price, function (o) {
						delete o.checked;
					})
				})
			}


		}

		function editSpecial() {
			if ($rootScope.currentMealDeal.length == 0) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Select at least one item for a special offer', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Items missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Select at least one item for a special offer');
				}
				return;
			}

			if (!newItem.price) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please enter the price for this special offer', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Price missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please enter the price for this special offer');
				}
				return;
			}

			if (!newItem.name || newItem.name.trim() == '') {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please enter a name for this special offer', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Name missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please enter a name for this special offer');
				}
				return;
			}

			if (!$rootScope.condition) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Please select a special condition for the offer. If you don\'t want to provide a special condition, you can create a meal deal instead', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Condition missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please select a special condition for the offer. If you don\'t want to provide a special condition, you can create a meal deal instead')
				}
				return;
			}


			// newItem.id = Math.floor((new Date().getTime()) / 1000);
			// newItem.buyItems = _.filter(items, function(val){
			// 	return val.checked == true;
			// });


			console.log(newItem);
			console.log($rootScope.currentMealDeal);
			newItem.buyItems = $rootScope.currentMealDeal;
			if ($rootScope.condition) {
				newItem.conditionName = $rootScope.condition;
				newItem.conditionOptions = $rootScope.specialCondition;
			}
			_.each(newItem.buyItems, function (n) {
				delete n.$$hashKey;
				if (n.price) {
					_.each(n.price, function (o) {
						delete o.$$hashKey;
					})
				}
				if (n.variety) {
					delete n.variety.$$hashKey;
				}
				if (n.varieties) {
					_.each(n.varieties, function (o) {
						delete o.$$hashKey;
					})
				}
			})
			console.log(newItem);

			console.log(vm.specialOffers);
			var updateIndex = _.findKey(vm.specialOffers, function (offer) {
				return offer.id == newItem.id;
			})

			if (updateIndex != -1) {
				// vm.specialOffers = angular.copy(vm.specialOffers);

				vm.specialOffers[updateIndex] = newItem;

				_.each(vm.specialOffers, function (n) {
					_.each(n.buyItems, function (o) {
						delete o.$$hashKey;
					})
				})
				console.log(vm.specialOffers);

				console.log(loggedInUserData.data.info);
				addOffersService.updateSpecialOffers(loggedInUserData.data.info.userId, vm.specialOffers);

				$localForage.setItem('loggedInUser', loggedInUserData.data);
				editSpecialItem.hide();
				$rootScope.currentMealDeal = [];
				_.each(vm.profile.categories, function (n) {
					delete n.checkedCat;
				})
				_.each(vm.profile.menuItems, function (n) {
					delete n.checked;
					_.each(n.price, function (o) {
						delete o.checked;
					})
				})
			}


		}

		function close() {
			addNewItem.hide();
			$rootScope.currentMealDeal =[];
		}

		function closeSpecial() {
			addSpecialItem.hide();
			$rootScope.currentMealDeal =[];
		}

		function closeEdit() {
			editItem.hide();
			$rootScope.currentMealDeal =[];
		}

		function closeEditSpecial() {
			editSpecialItem.hide();
			$rootScope.currentMealDeal =[];
			console.log(vm.specialOffers);
		}

		function remove(offerData) {
			console.log(offerData);
			var offerName = _.find(menuOffers, function (o) {
				return o.id == offerData.id;
			})

			console.log(offerName);
			$ionicListDelegate.closeOptionButtons();
			menuOffers.$remove(offerName)
				.then(function () {
					delete loggedInUserData.data.offers[offerName.$id];
					$localForage.setItem('loggedInUser', loggedInUserData.data);
					vm.offersLength = Object.keys(vm.profile.offers).length;
					console.log(loggedInUserData.data.offers)
				})
		}

		function removeSpecial(offerData) {
			console.log(offerData);
			var offerName = _.find(menuSpecialOffers, function (o) {
				return o.id == offerData.id;
			})

			console.log(offerName);
			$ionicListDelegate.closeOptionButtons();
			menuSpecialOffers.$remove(offerName)
				.then(function () {
					delete loggedInUserData.data.specialOffers[offerName.$id];
					$localForage.setItem('loggedInUser', loggedInUserData.data);
					vm.specialOffersLength = Object.keys(vm.profile.specialOffers).length;
					console.log(loggedInUserData.data.specialOffers)
				})
		}

		function addNewItemModal() {
			var scope = addNewItem.scope;
			newItem = {
				type: "mealDeal",
				selected: false,
				buyItems: [],
				id: ''
			};
			_.each(vm.profile.menuItems, function (n) {
				delete n.checked;
				_.each(n.price, function (o) {
					delete o.checked;
				})
			})
			_.each(vm.profile.categories, function (n) {
				delete n.checkedCat;
				delete n.varietySelected;
				if (n.variety) {
					delete n.variety.checked;
				}
			})
			$rootScope.currentMealDeal = [];
			vm.condition = '';
			// console.log(vm.profile);
			scope.vm = {
				add: add,
				close: close,
				item: newItem,
				items: vm.profile.menuItems,
				cats: vm.profile.categories,
				profile: vm.profile,
				showCat: vm.showCategories,
				showItms: vm.showItems,
				addToMealDeal: addToMealDeal,
				addCategoryToMealDeal: addCategoryToMealDeal,
				addSizeToMealDealItem: addSizeToMealDealItem,
				addVarietyToMealDealItem: addVarietyToMealDealItem,
				addQuantityToMealDealItem: addQuantityToMealDealItem,
				applyCondition: applyCondition
			};
			addNewItem.show();
		}

		function editItemModal(deal) {
			var scope = editItem.scope;

			_.each(vm.profile.menuItems, function (n) {
				delete n.checked;
				_.each(n.price, function (o) {
					delete o.checked;
				})
			})
			_.each(vm.profile.categories, function (n) {
				delete n.checkedCat;
				delete n.varietySelected;
				if (n.variety) {
					delete n.variety.checked;
				}
			})
			newItem = {
				type: deal.type,
				selected: deal.selected,
				buyItems: deal,
				id: deal.id,
				name: deal.name,
				price: deal.price
			};
			$rootScope.currentMealDeal = [];
			$rootScope.currentMealDeal = angular.copy(deal.buyItems);
			vm.condition = deal.condition;
			if (vm.condition) {
				vm.conditionStatus = true;
			}

			console.log($rootScope.currentMealDeal);


			//preselect items, sizes and quantity
			_.each($rootScope.currentMealDeal, function (n) {
				if (n.price) {
					var index = _.findKey(vm.profile.menuItems, function (o) {
						return o.title == n.title;
					})
					console.log(index);
					if (index != -1) {
						console.log(index);
						console.log(vm.profile.menuItems[index]);
						vm.profile.menuItems[index].checked = true;
						_.each(vm.profile.menuItems[index].price, function (p) {
							if (p.name == n.offerPrice) {
								p.checked = true;
							}
						})

						vm.profile.menuItems[index].priceSelected = true;
						vm.profile.menuItems[index].quantity = n.quantity;
					}

				}
				else {
					var index = _.findIndex(vm.profile.categories, function (o) {
						return o.title == n.title;
					})
					console.log(index);
					if (index != -1) {
						console.log(index);
						console.log(vm.profile.categories[index]);
						vm.profile.categories[index].checkedCat = true;
						_.each(vm.profile.categories[index].varieties, function (p) {
							if (p.name == n.variety.name) {
								p.checked = true;
							}
						})

						vm.profile.categories[index].varietySelected = true;
						vm.profile.categories[index].quantityCat = n.quantityCat;
					}
				}
			})


			// console.log(vm.profile);
			scope.vme = {
				edit: edit,
				closeEdit: closeEdit,
				item: newItem,
				items: vm.profile.menuItems,
				cats: vm.profile.categories,
				showCat: vm.showCategories,
				showItms: vm.showItems,
				addToMealDeal: addToMealDeal,
				addCategoryToMealDeal: addCategoryToMealDeal,
				addSizeToMealDealItem: addSizeToMealDealItem,
				addVarietyToMealDealItem: addVarietyToMealDealItem,
				addQuantityToMealDealItem: addQuantityToMealDealItem,
				applyCondition: applyCondition,
				condition: vm.condition,
				conditionStatus: vm.conditionStatus
			};
			editItem.show();
		}

		function applyCondition(status) {
			// if (status) {
			openSorter();
			// }
			// else {
			// 	$rootScope.condition = null;
			// }
		}

		function openSorter() {
			var scope = $scope.$new();
			restrictionPopup = $ionicPopup.alert({
				title: 'Enter Special Condition',
				templateUrl: 'scripts/custom-menu/condition.html',
				scope: scope
			});

			restrictionPopup.then(function (res) {
				if (vm.timeCondition) {
					$rootScope.condition = 'time';
					$rootScope.specialCondition = {'a': vm.timeConditionOpen, 'b': vm.timeConditionClose};
					console.log(vm.timeConditionOpen);
					console.log(vm.timeConditionClose);
				}
				else if (vm.typeCondition) {
					$rootScope.condition = 'type';
					if (vm.typeConditionOption == 'homeDelivery') {
						$rootScope.specialCondition = {'a': 'Home Delivery', 'b': ''};
					}
					else if (vm.typeConditionOption == 'pickUp') {
						$rootScope.specialCondition = {'a': 'Pick Up', 'b': ''};
					}
					else {
						$rootScope.specialCondition = {'a': 'Dine In', 'b': ''};
					}
				}
				else if (vm.amountCondition) {
					$rootScope.condition = 'amount';
					$rootScope.specialCondition = {'a': vm.amountConditionAmount, 'b': ''};
				}
				else {
					$rootScope.condition = false;
				}
			});
		}

		function addSpecialItemModal() {
			var scope = addSpecialItem.scope;
			newItem = {
				type: "special",
				selected: false,
				buyItems: [],
				id: ''
			};
			_.each(vm.profile.menuItems, function (n) {
				delete n.checked;
				_.each(n.price, function (o) {
					delete o.checked;
				})
			})
			_.each(vm.profile.categories, function (n) {
				delete n.checkedCat;
				delete n.varietySelected;
				if (n.variety) {
					delete n.variety.checked;
				}
			})
			$rootScope.currentMealDeal = [];
			vm.condition = '';
			// console.log(vm.profile);
			scope.vm = {
				add: addSpecial,
				close: closeSpecial,
				item: newItem,
				items: vm.profile.menuItems,
				cats: vm.profile.categories,
				profile: vm.profile,
				showCat: vm.showCategories,
				showItms: vm.showItems,
				addToMealDeal: addToMealDeal,
				addCategoryToMealDeal: addCategoryToMealDeal,
				addSizeToMealDealItem: addSizeToMealDealItem,
				addVarietyToMealDealItem: addVarietyToMealDealItem,
				addQuantityToMealDealItem: addQuantityToMealDealItem,
				applyCondition: applyCondition
			};
			addSpecialItem.show();
		}

		function editSpecialItemModal(deal) {
			console.log(deal);
			var scope = editSpecialItem.scope;

			_.each(vm.profile.menuItems, function (n) {
				delete n.checked;
				_.each(n.price, function (o) {
					delete o.checked;
				})
			})
			_.each(vm.profile.categories, function (n) {
				delete n.checkedCat;
				delete n.varietySelected;
				if (n.variety) {
					delete n.variety.checked;
				}
			})
			newItem = {
				type: deal.type,
				selected: deal.selected,
				buyItems: deal,
				id: deal.id,
				name: deal.name,
				price: deal.price
			};
			$rootScope.currentMealDeal = [];
			$rootScope.currentMealDeal = angular.copy(deal.buyItems);
			$rootScope.condition = angular.copy(deal.conditionName);
			$rootScope.specialCondition = angular.copy(deal.conditionOptions);
			if (vm.condition) {
				vm.conditionStatus = true;
			}

			console.log($rootScope.currentMealDeal);


			//preselect items, sizes and quantity
			_.each($rootScope.currentMealDeal, function (n) {
				if (n.price) {
					var index = _.findKey(vm.profile.menuItems, function (o) {
						return o.title == n.title;
					})
					console.log(index);
					if (index != -1) {
						console.log(index);
						console.log(vm.profile.menuItems[index]);
						vm.profile.menuItems[index].checked = true;
						_.each(vm.profile.menuItems[index].price, function (p) {
							if (p.name == n.offerPrice) {
								p.checked = true;
							}
						})

						vm.profile.menuItems[index].priceSelected = true;
						vm.profile.menuItems[index].quantity = n.quantity;
					}

				}
				else {
					var index = _.findIndex(vm.profile.categories, function (o) {
						return o.title == n.title;
					})
					console.log(index);
					if (index != -1) {
						console.log(index);
						console.log(vm.profile.categories[index]);
						vm.profile.categories[index].checkedCat = true;
						_.each(vm.profile.categories[index].varieties, function (p) {
							if (p.name == n.variety.name) {
								p.checked = true;
							}
						})

						vm.profile.categories[index].varietySelected = true;
						vm.profile.categories[index].quantityCat = n.quantityCat;
					}
				}
			})


			// console.log(vm.profile);
			scope.vme = {
				edit: editSpecial,
				closeEdit: closeEditSpecial,
				item: newItem,
				items: vm.profile.menuItems,
				cats: vm.profile.categories,
				showCat: vm.showCategories,
				showItms: vm.showItems,
				addToMealDeal: addToMealDeal,
				addCategoryToMealDeal: addCategoryToMealDeal,
				addSizeToMealDealItem: addSizeToMealDealItem,
				addVarietyToMealDealItem: addVarietyToMealDealItem,
				addQuantityToMealDealItem: addQuantityToMealDealItem,
				applyCondition: applyCondition,
				condition: vm.condition,
				conditionStatus: vm.conditionStatus
			};
			editSpecialItem.show();
		}

		function showHideTypeBox() {
			vm.amountCondition = false;
			vm.timeCondition = false;
			if (!vm.typeCondition) {
				vm.typeConditionOption = null;
			}
			// vm.typeCondition = !vm.typeCondition
		}

		function showHideAmountBox() {
			vm.typeCondition = false;
			vm.timeCondition = false;
			if (!vm.amountCondition) {
				vm.amountConditionAmount = null;
			}
			// vm.amountCondition = !vm.amountCondition
		}

		function showHideTimeBox() {
			vm.typeCondition = false;
			vm.amountCondition = false;

			if (!vm.timeCondition) {
				console.log('if');
				vm.timeConditionOpen = null;
				vm.timeConditionClose = null;
			}
			// vm.timeCondition = !vm.timeCondition
		}
	}
})();
