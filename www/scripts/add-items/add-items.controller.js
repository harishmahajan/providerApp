(function () {
	'use strict';

	angular
		.module('restaurant.add-items')
		.controller('AdditemsController', AdditemsController);

	AdditemsController.$inject = ['$state', 'additemsService', '_', 'addNewItem', 'loggedInUserData',
		'$cordovaToast', '$localForage', '$cordovaImagePicker', '$ionicLoading', '$ionicListDelegate',
		'$ionicSlideBoxDelegate', '$timeout', '$rootScope', 'categoriesService'];

	/* @ngInj*/
	function AdditemsController($state, additemsService, _, addNewItem, loggedInUserData,
								$cordovaToast, $localForage, $cordovaImagePicker, $ionicLoading, $ionicListDelegate,
								$ionicSlideBoxDelegate, $timeout, $rootScope, categoriesService) {

		var vm = angular.extend(this, {
			categories: loggedInUserData.data.categories,
			selectedCategory: 'All',
			sortBy: 'name',
			item: {},
			addNewItemModal: addNewItemModal,
			showItemsOfCategory: showItemsOfCategory,
			remove: remove,
			duplicateItem: duplicateItem,
			removeImage: removeImage
		});

		(function activate() {
			vm.showSlider = true;
		})();

		// ********************************************************************

		vm.profile = loggedInUserData.data;

		console.log('user profile', vm.profile);
		var newItem = {
			standardOptions: [],
			extraOptions: [],
			price: [],
			pictures: [],
			isFeatured: true,
			businessId: loggedInUserData.data.info.userId
		};

		var menuItems = additemsService.getMenuItems();

		vm.menuItems = vm.profile.menuItems;

		if (!_.isEmpty(vm.menuItems)) {
			vm.menuItemsLength = Object.keys(vm.menuItems).length;
		}
		else {
			vm.menuItemsLength = 0;
		}

		function showItemsOfCategory(category) {
			if (category == 'all') {
				vm.menuItems = vm.profile.menuItems;
			}
			else {
				vm.menuItems = _.filter(vm.profile.menuItems, function (o) {
					return o.category == category;
				});
			}

			if (!_.isEmpty(vm.menuItems)) {
				vm.menuItemsLength = Object.keys(vm.menuItems).length;
			}
			else {
				vm.menuItemsLength = 0;
			}
		}

		function closeModal() {
			addNewItem.hide();
		}

		function add() {
			console.log(newItem);
			if (typeof newItem.title == 'undefined' || newItem.title == "" || newItem.title == null) {
				if (window.cordova) {
					var onConfirm = function () {

					}
					navigator.notification.alert(
						'Enter the name of item', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Item name missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Enter the name of item');
				}
			}
			else {
				// if (!newItem.pictures || newItem.pictures.length == 0) {
				// 	var onConfirm = function () {
				//
				// 	}
				// 	navigator.notification.alert(
				// 		'Upload at least one image for the item', // message
				// 		onConfirm,            // callback to invoke with index of button pressed
				// 		'Image missing',           // title
				// 		'OK'     // buttonLabels
				// 	);
				// }
				// else {
				if (!newItem.category) {
					if (window.cordova) {
						var onConfirm = function () {

						}
						navigator.notification.alert(
							'Select a category for this item', // message
							onConfirm,            // callback to invoke with index of button pressed
							'Category missing',           // title
							'OK'     // buttonLabels
						);
					}
					else {
						alert('Select a category for this item');
					}
				}
				else {
					console.log(newItem);
					if (!newItem.price || newItem.price.length == 0) {
						if (window.cordova) {
							var onConfirm = function () {

							}
							navigator.notification.alert(
								'Add at least one price option', // message
								onConfirm,            // callback to invoke with index of button pressed
								'Price missing',           // title
								'OK'     // buttonLabels
							);
						}
						else {
							alert('Add at least one price option');
						}
					}
					else {
						menuItems.$add(newItem)
							.then(function (data) {
								console.log(data.getKey());
								loggedInUserData.data.menuItems[data.getKey()] = newItem;
								$localForage.setItem('loggedInUser', loggedInUserData.data);
								vm.menuItemsLength = Object.keys(vm.profile.menuItems).length;
								$rootScope.selectedCategory = null;
							});
						addNewItem.hide();
					}
				}

			}
		}

		function remove(itemData) {
			var itemName = _.find(menuItems, function (o) {
				return o.title == itemData.title;
			})

			console.log(itemName);
			$ionicListDelegate.closeOptionButtons();
			menuItems.$remove(itemName)
				.then(function () {
					delete loggedInUserData.data.menuItems[itemName.$id];
					$localForage.setItem('loggedInUser', loggedInUserData.data);
					vm.menuItemsLength = Object.keys(vm.profile.menuItems).length;
				});
		}

		function duplicateItem(item) {
			console.log(item);
			$ionicListDelegate.closeOptionButtons();
			menuItems.$add(item)
				.then(function (data) {
					console.log(data.getKey());
					loggedInUserData.data.menuItems[data.getKey()] = item;
					$localForage.setItem('loggedInUser', loggedInUserData.data);
					vm.menuItemsLength = Object.keys(vm.profile.menuItems).length;
				}, function (err) {
					console.log(err);
				})
		}

		function addOption(optionName, optionData) {
			if (!optionData || !optionData.name) {
				if (window.cordova) {
					var onConfirm = function () {

					}
					navigator.notification.alert(
						'Enter a name for the option', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Name missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Enter a name for the option');
				}
			}
			else {
				if (optionData.name == null || typeof optionData.name == 'undefined') {
					if (window.cordova) {
						var onConfirm = function () {

						}
						navigator.notification.alert(
							'Enter a name for the option', // message
							onConfirm,            // callback to invoke with index of button pressed
							'Name missing',           // title
							'OK'     // buttonLabels
						);
					}
					else {
						alert('Enter a name for the option');
					}
				}
				else {
					if (optionData.selected == null || typeof optionData.selected == 'undefined') {
						optionData.selected = false;
					}
					if (optionData.type == null || typeof optionData.type == 'undefined') {
						optionData.type = 'toggle';
					}
					if (optionData.radioMandatory == null || typeof optionData.radioMandatory == 'undefined') {
						optionData.radioMandatory = false;
					}
					if (optionData.desc == null || typeof optionData.desc == 'undefined') {
						optionData.desc = "";
					}
					pushData(optionName, optionData);
				}
			}

		}

		function pushData(optionName, optionData) {
			switch (optionName) {
				case 'standard':
					newItem.standardOptions.push(optionData);
					break;
				case 'extra':
					newItem.extraOptions.push(optionData);
					break;
				case 'price':
					newItem.price.push(optionData);
					break;
				case 'default':
					break;
			}
			console.log("optionData ", optionData);
		}

		function removeOption(optionName, optionData) {
			switch (optionName) {
				case 'standard':
					_.remove(newItem.standardOptions, function (o) {
						return o.name == optionData.name
					});
					break;
				case 'extra':
					_.remove(newItem.extraOptions, function (o) {
						return o.name == optionData.name
					});
					break;
				case 'price':
					_.remove(newItem.price, function (o) {
						return o.name == optionData.name
					});
					break;
			}
		}

		function addNewItemModal() {
			vm.categories = categoriesService.all();

			if (vm.categories.length == 0) {
				if (window.cordova) {

					var onConfirm = function () {

					};
					navigator.notification.alert(
						'You need to have at least one category to add new item to. Please add a category and then add menu items', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Category missing',           // title
						'OK'     // buttonLabels
					);
				}
				else{
					alert("You need to have at least one category to add new item to. Please add a category and then add menu items");
				}
				return;
			}

			var scope = addNewItem.scope;
			newItem = {
				standardOptions: [],
				extraOptions: [],
				price: [],
				pictures: [],
				isFeatured: true
			};
			console.log(vm.profile);
			scope.vm = {
				add: add,
				item: newItem,
				profile: vm.profile,
				addOption: addOption,
				removeOption: removeOption,
				addImage: addImage,
				closeModal: closeModal,
				updatePricesNew: updatePricesNew,
				setCategory: setCategory
			};
			addNewItem.show();
		}

		function addImage() {
			var permissions = cordova.plugins.permissions;
			permissions.hasPermission(permissions.READ_EXTERNAL_STORAGE, checkPermissionCallback, null);

			function checkPermissionCallback(status) {
				if (!status.hasPermission) {
					var errorCallback = function () {
						console.warn('Camera permission is not turned on');
					};

					permissions.requestPermission(
						permissions.READ_EXTERNAL_STORAGE,
						function (status) {
							if (!status.hasPermission) errorCallback();
						},
						errorCallback);
				} else {
					document.addEventListener("deviceready", getImage, false);
				}
			}
		}

		function getImage() {
			var uploadTask;
			var fileName;
			var options = {
				maximumImagesCount: 1,
				width: 800,
				height: 800,
				quality: 80
			};

			function getFileContentAsBase64(path, callback) {
				window.resolveLocalFileSystemURL(path, gotFile, fail);

				function fail(e) {
					alert('Cannot found requested file');
				}

				function gotFile(fileEntry) {
					fileEntry.file(function (file) {
						var reader = new FileReader();
						reader.onloadend = function (e) {
							var content = this.result;
							callback(content);
						};
						// The most important point, use the readAsDatURL Method from the file plugin
						reader.readAsDataURL(file);
					});
				}
			}

			$cordovaImagePicker.getPictures(options)
				.then(function (results) {
					for (var i = 0; i < results.length; i++) {
						console.log('Image URI: ' + results[i]);

						getFileContentAsBase64(results[i], function (base64Image) {
							$ionicLoading.show({
								template: 'Uploading Image...'
							});
							var d = new Date();
							var directory = 'products';
							fileName = d.getTime();
							vm.showSlider = false;
							uploadTask = additemsService.getStorageBusiness(loggedInUserData.data.info.userId, base64Image.split(',')[1], directory, fileName);

							uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
								function (snapshot) {
									// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
								}, function (error) {
									$ionicLoading.hide();
									$cordovaToast.showShortCenter("Error in uploading..");
									// switch (error.code) {
									// 	case 'storage/unauthorized':
									// 		// User doesn't have permission to access the object
									// 		break;
									//
									// 	case 'storage/canceled':
									// 		// User canceled the upload
									// 		break;
									//
									// 	case 'storage/unknown':
									// 		// Unknown error occurred, inspect error.serverResponse
									// 		break;
									// }
								}, function () {
									// Upload completed successfully, now we can get the download URL
									newItem.pictures.push(uploadTask.snapshot.downloadURL);
									console.log(uploadTask.snapshot.downloadURL);
									$ionicSlideBoxDelegate.update();
									vm.showSlider = true;
									$ionicLoading.hide();


									$cordovaToast.showShortBottom("Upload Successful..");
								});
						});
					}
				}, function (error) {
					console.log(error);
					$cordovaToast.showShortCenter("Error in opening gallery..");
				});
		}

		function removeImage(image) {
			vm.showSlider = false;
			vm.item.pictures = _.reject(vm.item.pictures, function (n) {
				return n == image;
			})
			$ionicSlideBoxDelegate.update();
			vm.showSlider = true;
		}

		function setCategory(cat) {

			console.log(cat);
			console.log(loggedInUserData.data.categories);
			$rootScope.selectedCategory = _.filter(loggedInUserData.data.categories, function (n) {
				return n.title == cat;
			})
			console.log(cat);
			console.log($rootScope.selectedCategory);
		}

		function updatePricesNew() {
			newItem.price = [];
			var error;
			_.each($rootScope.selectedCategory[0].varieties, function (n, index) {
				if (!n.value) {
					error = true;
				}
				else {
					newItem.price[index] = {};
					newItem.price[index].name = angular.copy(n.name);
					newItem.price[index].value = angular.copy(n.value);
					console.log(newItem);
				}
			})

			if (error) {
				if (window.cordova) {
					var onConfirm = function () {

					}
					navigator.notification.alert(
						'Please enter prices for all sizes/varieties', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Prices missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Please enter prices for all sizes/varieties');
				}
			}
			else {
				if (window.cordova) {
					$cordovaToast.showShortCenter('Prices updated');
				}
				else {
					alert('Prices updated');
				}
			}

		}
	}
})();
