(function () {
	'use strict';

	angular
		.module('restaurant.products')
		.controller('ProductController', ProductController);

	ProductController.$inject = [
		'$scope', '$stateParams', '$state',
		'ionicToast', 'restaurantCartService', '_', 'loggedInUserData', 'productsService', '$localForage',
		'$cordovaToast', '$cordovaImagePicker', '$ionicLoading', '$ionicSlideBoxDelegate', '$timeout', '$rootScope', '$ionicHistory'];

	/* @ngInject */
	function ProductController($scope, $stateParams, $state,
		ionicToast, restaurantCartService, _, loggedInUserData, productsService, $localForage,
		$cordovaToast, $cordovaImagePicker, $ionicLoading, $ionicSlideBoxDelegate, $timeout, $rootScope, $ionicHistory) {

		var vm = angular.extend(this, {
			removeOption: removeOption,
			updateItemPics: updateItemPics,
			addImage: addImage,
			addOption: addOption,
			removeImage: removeImage,
			changedCategory: changedCategory,
			// setSelectedCategory: setSelectedCategory,
			// updatePrices: updatePrices
		});

		(function activate() {
			vm.showSlider = true;
		})();

		// **********************************************
		var productId = $stateParams.productId;
		var firebaseItem;

		console.log(loggedInUserData);
		var key = _.findKey(loggedInUserData.data.menuItems, function (o) {
			return o.title == productId;
		});

		productsService.getMenuItem(key).then(function (data) {
			// console.log("getmenuItem",data);
			firebaseItem = data;
			vm.item.pictures = data.pictures;
			$timeout($ionicSlideBoxDelegate.update(), 1000);
		});

		var tempObj = _.find(loggedInUserData.data.menuItems, function (o) {
			return o.title == productId;
		});
		// console.log(loggedInUserData.data.menuItems);


		vm.currency = loggedInUserData.data.currency;

		// _.each(loggedInUserData.data.categories, function (o) {
		// 	vm.categories.push(o.title);
		// });
		// console.log(vm.categories);

		// vm.item = {};
		vm.item = angular.copy(tempObj);
		var initialCatTitle = vm.item.category;
		var initialItemPrices = vm.item.price;
		// console.log(vm.item);

		vm.categories = angular.copy(loggedInUserData.data.categories);

		vm.item.category = vm.categories[_.findIndex(vm.categories, ["title", initialCatTitle])]
		console.log(vm.item);

		vm.updateItem = function () {
			if (typeof vm.item.title == 'undefined' || vm.item.title == "" || vm.item.title == null) {
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
				// if (!vm.item.pictures || vm.item.pictures.length == 0) {
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
				if (!vm.item.category) {
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
					if (!vm.item.price || vm.item.price.length == 0) {
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
						// updatePrices();						
						if (typeof vm.item.pictures == 'undefined') {
							vm.item.pictures = '';
						}
						if (vm.item.standardOptions) {
							_.each(vm.item.standardOptions, function (n) {
								delete n.$$hashKey;
							})
						}
						if (vm.item.extraOptions) {
							_.each(vm.item.extraOptions, function (n) {
								delete n.$$hashKey;
							})
						}
						if (vm.item.price) {
							_.each(vm.item.price, function (n) {
								delete n.$$hashKey;
							})
						}
						vm.item.category = vm.item.category.title;
						console.log(vm.item);
						// if (vm.item) {
						// 	deleteHash(vm.item);
						// }
						// function deleteHash(obj){
						// 	_.each(obj, function (n) {
						// 		delete n.$$hashKey;
						// 		if(typeof(n=="object")){
						// 			deleteHash(n)
						// 		}
						// 	})
						// }
						_.each(vm.item, function (v, k) {
							tempObj[k] = v;
							firebaseItem[k] = v;
						});
						$localForage.setItem('loggedInUser', loggedInUserData.data);
						// console.log(vm.item);
						console.log(vm.item, loggedInUserData.data);
						// console.log(key);
						productsService.updateItem(loggedInUserData.data.info.userId, key, vm.item);
						if (window.cordova) {
							//noinspection JSUnresolvedFunction
							cordova.plugins.snackbar('Item updated successfully!', 'SHORT', "", function () {

							});
						} else {
							alert("updated");
						}
						$rootScope.selectedCategory = null;
						// $state.go('app.products');
						$ionicHistory.goBack(-1)
					}
				}
			}
		};

		function changedCategory(newCat) {
			console.log(newCat);
			vm.item.price = angular.copy(newCat.varieties)
			if (vm.item.category.title == initialCatTitle)
				vm.item.price = angular.copy(initialItemPrices)
		}

		function removeOption(optionName, optionData) {
			switch (optionName) {
				case 'standard':
					_.remove(vm.item.standardOptions, function (o) {
						return o.name == optionData.name
					});
					break;
				case 'extra':
					_.remove(vm.item.extraOptions, function (o) {
						return o.name == optionData.name
					});
					break;
				case 'price':
					_.remove(vm.item.price, function (o) {
						return o.name == optionData.name
					});
					break;
			}
		}

		function updateItemPics() {
			document.addEventListener("deviceready", getImage, false);
			function getImage() {
				var uploadTask;
				var fileName;
				var imgIndex = 0;
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
							// console.log('Image URI: ' + results[i]);

							getFileContentAsBase64(results[i], function (base64Image) {
								$ionicLoading.show({
									template: 'Uploading Image...'
								});
								var directory = 'products';
								var d = new Date();
								fileName = d.getTime();
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
										// console.log("list", vm.item.pictures);
										var fixer = [];
										_.forEach(vm.item.pictures, function (v) {
											fixer.push(v.split('%2F')[3].split('?')[0]);
											// console.log("fixer",fixer);
										});
										var minFixer = _.min(fixer);
										// console.log("min",minFixer);
										imgIndex = _.findIndex(vm.item.pictures, function (v) {
											// console.log(v);
											return v.split('%2F')[3].split('?')[0] == minFixer
										});
										productsService.deleteFile(loggedInUserData.data.info.userId, minFixer);
										// console.log("ImgIndex",imgIndex);
										vm.item.pictures.splice(imgIndex, 1, uploadTask.snapshot.downloadURL);
										// console.log("afterAdding",vm.item.pictures);
										$ionicSlideBoxDelegate.update();
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
		}

		function addImage() {
			if (window.cordova) {

				var checkPermissionCallback = function (status) {
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

				var permissions = cordova.plugins.permissions;
				permissions.hasPermission(permissions.READ_EXTERNAL_STORAGE, checkPermissionCallback, null);


			}
			else {
				getImage();
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
									if (!vm.item.pictures) {
										vm.item.pictures = [];
									}
									vm.item.pictures.push(uploadTask.snapshot.downloadURL);
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

		function addOption(optionName, optionData) {
			console.log(optionName, optionData);
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
					if (!vm.item.standardOptions) {
						vm.item.standardOptions = [];
					}
					vm.item.standardOptions.push(optionData);
					break;
				case 'extra':
					if (!vm.item.extraOptions) {
						vm.item.extraOptions = [];
					}
					vm.item.extraOptions.push(optionData);
					break;
				case 'price':
					vm.item.price.push(optionData);
					break;
				case 'default':
					break;
			}
			console.log("optionData ", optionData);


		}

		// function setSelectedCategory(cat) {

		// 	$rootScope.selectedCategory = _.filter(loggedInUserData.data.categories, function (n) {
		// 		return n.title == cat;
		// 	})
		// 	console.log(cat);
		// 	console.log($rootScope.selectedCategory);
		// 	// $timeout(function(){
		// 	// 	vm.item.price = vm.selectedCategory.varieties;
		// 	// },10);
		// }

		// setSelectedCategory(vm.item.category);
		// console.log(vm.item.category);

		// function updatePrices() {
		// 	vm.item.price = [];
		// 	_.each($rootScope.selectedCategory[0].varieties, function (n, index) {
		// 		if (!n.value) {
		// 			if (window.cordova) {
		// 				var onConfirm = function () {

		// 				}
		// 				navigator.notification.alert(
		// 					'Please enter prices for all sizes/varieties', // message
		// 					onConfirm,            // callback to invoke with index of button pressed
		// 					'Prices missing',           // title
		// 					'OK'     // buttonLabels
		// 				);
		// 			}
		// 			else {
		// 				alert('Please enter prices for all sizes/varieties');
		// 			}
		// 			return;
		// 		}
		// 		else {
		// 			vm.item.price[index] = {};
		// 			vm.item.price[index].name = angular.copy(n.name);
		// 			vm.item.price[index].value = angular.copy(n.value);
		// 		}
		// 	})



		// 	if (window.cordova) {
		// 		$cordovaToast.showShortCenter('Prices updated');
		// 	}
		// 	else {
		// 		alert('Prices updated');
		// 	}
		// }

		console.log(vm.item);

	}
})();
