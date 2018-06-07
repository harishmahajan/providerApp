(function () {
	'use strict';

	angular
		.module('restaurant.products')
		.controller('ProductsController', ProductsController);

	ProductsController.$inject = ['$state', 'productsService', 'loggedInUserData', 'addNewProduct', '$localForage', 'commonService', '$cordovaImagePicker',
		'$ionicLoading', '$ionicSlideBoxDelegate', '$cordovaToast', '$rootScope', '$timeout'];

	/* @ngInject */
	function ProductsController($state, productsService, loggedInUserData, addNewProduct, $localForage, commonService, $cordovaImagePicker,
		$ionicLoading, $ionicSlideBoxDelegate, $cordovaToast, $rootScope, $timeout) {
		var vm = angular.extend(this, {
			products: [],
			showProductDetails: showProductDetails,
			showCart: showCart,
			categoryName: $state.params.categoryName || commonService.categoryName,
			openModal: openModal,
			categories: loggedInUserData.data.categories,
			remove: remove,
		});

		(function activate() {
			loadProducts();
		})();

		// ******************************************************

		function showCart() {
			$state.go('app.restaurant-cart');
		}

		function loadProducts() {
			vm.products = null;
			vm.products = _.filter(loggedInUserData.data.menuItems, function (o) {
				return o.category == vm.categoryName;
			});
			console.log(vm.categoryName, vm.products)
		}

		function showProductDetails(productId) {
			console.log(productId);
			$state.go('app.product', {
				// categoryId: categoryId,
				productId: productId
			});
		}

		function openModal() {

			var scope = addNewProduct.scope;
			scope.pcm = {
				closeModal: closeModal,
				addOption: addOption,
				removeOption: removeOption,
				add: add,
				profile: vm.profile,
				addImage: addImage,
				removeImage: removeImage,
				updatePricesNew: updatePricesNew,
				categories: angular.copy(vm.categories),
				standard: {},
				extra: {},
			};
			scope.newItem = {
				standardOptions: [],
				extraOptions: [],
				price: [],
				pictures: [],
				isFeatured: true,
				businessId: loggedInUserData.data.info.userId,
				category: {},
				title: "",
				body: ""
			};

			scope.pcm.categories = angular.copy(loggedInUserData.data.categories);
			scope.newItem.category = scope.pcm.categories[_.findIndex(scope.pcm.categories, ["title", vm.categoryName])]
			addNewProduct.show();

			function closeModal() {
				addNewProduct.hide();
			}

			function addImage() {
				if (window.cordova) {
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
							document.addEventListener("deviceready", getImage(), false);
						}
					}
				} else {
					alert("Web is not supported");
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
								$rootScope.showProductImageSlider = false;
								uploadTask = productsService.getStorageBusiness(loggedInUserData.data.info.userId, base64Image.split(',')[1], directory, fileName);

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
										scope.newItem.pictures.push(uploadTask.snapshot.downloadURL);
										console.log(uploadTask.snapshot.downloadURL);
										$ionicSlideBoxDelegate.update();
										$rootScope.showProductImageSlider = true;
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
				console.log(image)
				$rootScope.showProductImageSlider = false;
				scope.newItem.pictures = _.reject(scope.newItem.pictures, function (n) {
					return n == image;
				})
				console.log(scope.newItem.pictures)
				$ionicSlideBoxDelegate.update();
				$timeout(function () {
					$rootScope.showProductImageSlider = true;
					$ionicSlideBoxDelegate.$getByHandle('productImages').update();
				}, 500);
			}

			function updatePricesNew() {
				scope.newItem.price = [];
				var error;
				_.each(scope.newItem.category.varieties, function (n, index) {
					if (!n.value) {
						error = true;
					}
					else {
						scope.newItem.price[index] = {};
						scope.newItem.price[index].name = angular.copy(n.name);
						scope.newItem.price[index].value = angular.copy(n.value);
						console.log(scope.newItem);
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
				// else {
				// 	if (window.cordova) {
				// 		$cordovaToast.showShortCenter('Prices updated');
				// 	}
				// 	else {
				// 		alert('Prices updated');
				// 	}
				// }

			}

			function add() {
				console.log(scope.newItem);
				// if (!scope.newItem.pictures || scope.newItem.pictures.length == 0) {
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
				if (!scope.newItem.category) {
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
					updatePricesNew();
					if (!scope.newItem.price || scope.newItem.price.length == 0) {
						// if (window.cordova) {
						// 	var onConfirm = function () {

						// 	}
						// 	navigator.notification.alert(
						// 		'Add at least one price option', // message
						// 		onConfirm,            // callback to invoke with index of button pressed
						// 		'Price missing',           // title
						// 		'OK'     // buttonLabels
						// 	);
						// }
						// else {
						// 	alert('Add at least one price option');
						// }
					}
					else {
						scope.newItem.category = scope.newItem.category.title || "";
						productsService.getMenuItems()
							.$add(scope.newItem)
							.then(function (data) {
								if (window.cordova) {
									//noinspection JSUnresolvedFunction
									cordova.plugins.snackbar('Item added successfully!', 'SHORT', "", function () {

									});
								} else {
									alert("updated");
								}
								console.log(data.getKey());
								loggedInUserData.data.menuItems[data.getKey()] = angular.copy(scope.newItem);
								$localForage.setItem('loggedInUser', loggedInUserData.data).then(function () {
									loadProducts();
									console.log(loggedInUserData.data.menuItems)
								})
							});
						addNewProduct.hide();
					}
				}
			}

			function addOption(optionName, optionData) {
				var optionData = angular.copy(optionData);
				console.log(optionName, optionData)

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
					var err = 0;
					if (optionData.selected == null || typeof optionData.selected == 'undefined') {
						optionData.selected = false;
					}
					if (optionData.radioMandatory == null || typeof optionData.radioMandatory == 'undefined') {
						optionData.radioMandatory = false;
					}
					if (optionData.desc == null || typeof optionData.desc == 'undefined') {
						optionData.desc = "";
					}
					if (optionName == "extra") {
						if (!optionData.value) {
							if (window.cordova) {
								var onConfirm = function () {

								}
								navigator.notification.alert(
									'Enter a price for the extra option', // message
									onConfirm,            // callback to invoke with index of button pressed
									'Price missing',           // title
									'OK'     // buttonLabels
								);
							}
							else { alert('Price missing') }
							err++;
						}
					}
					if (optionData.type == null || typeof optionData.type == 'undefined') {
						// optionData.type = 'toggle';
						if (window.cordova) {
							var onConfirm = function () {

							}
							navigator.notification.alert(
								'Select a type for the option', // message
								onConfirm,            // callback to invoke with index of button pressed
								'Option type missing',           // title
								'OK'     // buttonLabels
							);
						}
						else { alert('Select a type for the option') }
						err++;
					}
					if (err === 0) {
						console.log(optionName, optionData)
						pushData(optionName, optionData);
					}
				}
			}

			function pushData(optionName, optionData) {

				switch (optionName) {
					case 'standard':
						scope.newItem.standardOptions.push(optionData);
						Object.keys(scope.pcm.standard).forEach(function (key) {
							delete scope.pcm.standard[key];
						});
						break;
					case 'extra':
						scope.newItem.extraOptions.push(optionData);
						Object.keys(scope.pcm.extra).forEach(function (key) {
							delete scope.pcm.extra[key];
						});
						break;
					case 'price':
						scope.newItem.price.push(optionData);
						break;
					case 'default':
						break;
				}
				console.log("optionData ", optionData);
			}

			function removeOption(optionName, optionData) {
				switch (optionName) {
					case 'standard':
						_.remove(scope.newItem.standardOptions, function (o) {
							return o.name == optionData.name
						});
						break;
					case 'extra':
						_.remove(scope.newItem.extraOptions, function (o) {
							return o.name == optionData.name
						});
						break;
					case 'price':
						_.remove(scope.newItem.price, function (o) {
							return o.name == optionData.name
						});
						break;
				}
			}
		}

		function remove(itemName) {
			var menuKey = _.findKey(loggedInUserData.data.menuItems, function (o) { return o.title == itemName.title })
			if (window.cordova) {
				var onConfirm = function (buttonIndex) {
					if (buttonIndex == 1) {
						productsService.deleteMenuItem(menuKey)
							.then(function () {
								delete loggedInUserData.data.menuItems[menuKey];
								$localForage.setItem('loggedInUser', loggedInUserData.data)
									.then(function (data) {
										loadProducts();
									})
							});
					}
				};
				navigator.notification.confirm(
					'Are you sure you want to delete this Item?', // message
					onConfirm,            // callback to invoke with index of button pressed
					'Delete Item!',           // title
					['Yes', 'Cancel']     // buttonLabels
				);
			}
			else {
				var r = confirm('Are you sure you want to delete this Item?');
				if (r == true) {
					productsService.deleteMenuItem(menuKey)
						.then(function () {
							delete loggedInUserData.data.menuItems[menuKey];
							$localForage.setItem('loggedInUser', loggedInUserData.data)
								.then(function (data) {
									loadProducts();
								})
						});
				}
			}
		}
	}
})();
