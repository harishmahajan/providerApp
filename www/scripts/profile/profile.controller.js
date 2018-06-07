(function () {
	'use strict';

	angular
		.module('restaurant.profile')
		.controller('ProfileController', ProfileController);

	ProfileController.$inject = ['$state', 'profileService', '$ionicSlideBoxDelegate',
		'editModal', '$window', '$localForage', 'loggedInUserData', '$cordovaToast',
		'$cordovaImagePicker', '$ionicLoading', '$cordovaNetwork', '$rootScope', '$timeout'];

	/* @ngInject */
	function ProfileController($state, profileService, $ionicSlideBoxDelegate,
		editModal, $window, $localForage, loggedInUserData, $cordovaToast,
		$cordovaImagePicker, $ionicLoading, $cordovaNetwork, $rootScope, $timeout) {
		var vm = angular.extend(this, {
			categories: [],
			products: [],
			postcodes: [],
			showProducts: showProducts,
			showProductDetails: showProductDetails,
			showModal: showModal,
			removeImage: removeImage,
			storeName: '',
			removeLogo: removeLogo,
			getGeoLocation: getGeoLocation
		});

		// ******************************************************
		(function activate() {
			$ionicLoading.show({
				template: 'Loading...'
			});
			loadProducts();
			loadCategories();
			loadBusinessInfo();
			loadCuisines();
			if (window.cordova) {
				var checkPermissions = function () {
					var permissions = cordova.plugins.permissions;
					permissions.hasPermission(permissions.READ_EXTERNAL_STORAGE, checkPermissionCallback, null);

					function checkPermissionCallback(status) {
						if (!status.hasPermission) {
							var errorCallback = function () {
								console.warn('Storage permission is not turned on');
							};

							permissions.requestPermission(
								permissions.READ_EXTERNAL_STORAGE,
								function (status) {
									if (!status.hasPermission) errorCallback();
								},
								errorCallback);
						}
					}
				}
				checkPermissions();
			}
		})();

		$rootScope.showRestaurantImageSlider = true;
		console.log("LoggedInUserData ", loggedInUserData.data);
		vm.devHeight = $window.innerHeight;

		vm.profile = loggedInUserData.data;

		// console.log("profile", vm.profile)
		// console.log("Logo", vm.profile);

		var tempUser = profileService.syncProfileData(loggedInUserData.data.info.userId);

		_.forEach(vm.profile.time, function (v) {
			// console.log(v);
			if (angular.isUndefined(v.opening || v.closing)) {
				v.opening = "";
				v.closing = "";
			}
			if (!angular.isDate(v.opening)) {
				v.opening = new Date(v.opening);
			}
			if (!angular.isDate(v.closing)) {
				v.closing = new Date(v.closing);
			}
		});

		function getGeoLocation() {
			if (window.cordova) {
				// console.log('1');
				if ($cordovaNetwork.isOnline()) {
					cordova.plugins.diagnostic.isLocationAvailable(function (data) {
						if (data == true) {
							$ionicLoading.show({ template: 'Getting your location' });
							navigator.geolocation.getCurrentPosition(function (position) {
								var lat, long;
								lat = position.coords.latitude;
								long = position.coords.longitude;
								editModal.scope.profile.map.origin = { "latitude": lat, "longitude": long };
								$ionicLoading.hide();
								$cordovaToast.showLongBottom('Location updated successfully');
								console.log("Location updated successfully");
							}, function (err) {
								console.log(err);
								$ionicLoading.hide();
								$cordovaToast.showLongBottom('Could not get GPS location');
							},
								{ timeout: 15000, enableHighAccuracy: false })
						}
						else {
							// $cordovaToast.showLongBottom('GPS not on');
							var onConfirm = function (buttonIndex) {
								// alert('You selected button ' + buttonIndex);
								if (buttonIndex == 2) {
									cordova.plugins.diagnostic.switchToLocationSettings();
								}
								else {
									console.log('close');
								}
							};

							navigator.notification.confirm(
								'You need to enable GPS under mobile settings', // message
								onConfirm,            // callback to invoke with index of button pressed
								'Enable GPS',           // title
								['Cancel', 'Ok']     // buttonLabels
							);
						}
					}, function (err) {
						console.log(err);
						$ionicLoading.hide();
					});
				}
				else {
					$cordovaToast.showShortBottom('Action not allowed without internet');
				}

			}
			else {
				alert('Action not allowed without device');
			}
		}

		function loadProducts() {
			profileService.getFeaturedProducts()
				.then(function (products) {
					vm.products = products;
					$ionicSlideBoxDelegate.update();
				});
		}

		function loadCategories() {
			profileService.getFeaturedCategories()
				.then(function (categories) {
					vm.categories = categories;
				});
		}

		function loadCuisines() {
			if (!_.isEmpty(loggedInUserData.data.cuisines)) {
				// console.log('loading user cuisines');
				vm.cuisines = loggedInUserData.data.cuisines
				// console.log(vm.cuisines);
				$ionicLoading.hide();
			}
			else {
				console.log('loading default cuisines');
				profileService.getCuisines()
					.then(function (cuisines) {
						vm.cuisines = angular.copy(cuisines);
						_.each(vm.cuisines, function (c) {
							angular.extend(c, {
								checked: false
							})
						})
						$ionicLoading.hide();
					});
			}
		}

		function loadBusinessInfo() {
			profileService.getBusiness()
				.then(function (businessInfo) {
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

		function addPostcode(postcode) {
			if (!postcode.charge || postcode.charge < 0)
				postcode.charge = 0;
			editModal.scope.profile.postcodes.push(postcode);
			console.log("after adding", editModal.scope.profile.postcodes)
		}

		function removePostcode(postcode) {
			_.remove(editModal.scope.profile.postcodes, function (o) {
				return o == postcode
			});
			console.log("after removing", editModal.scope.profile.postcodes)
		}

		function close() {
			$ionicSlideBoxDelegate.$getByHandle('savedImages').update();
			// $ionicSlideBoxDelegate.$getByHandle('editImages').update();
			editModal.hide();
		}

		function selectRating(number) {
			editModal.scope.profile.fhr = number;
		}

		function applyEdits() {
			console.log(editModal.scope);
			vm.profile = angular.copy(editModal.scope.profile);
			vm.profile['cuisines'] = angular.copy(editModal.scope.em.cuisines);
			vm.profile.profileComplete = 1;
			var err = false;
			// if (typeof vm.profile.postcodes == 'undefined' || vm.profile.postcodes.length == 0) {
			// 	err = true;
			// 	if (window.cordova) {
			// 		var onConfirm = function () {

			// 		};
			// 		navigator.notification.alert(
			// 			'Enter at least one delivery postcode and delivery charge', // message
			// 			onConfirm,            // callback to invoke with index of button pressed
			// 			'Postcode missing',           // title
			// 			'OK'     // buttonLabels
			// 		);
			// 	} else {
			// 		alert("postcode missing");
			// 	}

			// }
			if (!_.includes(vm.profile.serviceType, true)) {
				err = true;
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Enter at least one service type', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Service type missing',           // title
						'OK'     // buttonLabels
					);
				} else {
					alert("Service type missing");
				}
			}
			if (!_.includes(vm.profile.paymentMethod, true)) {
				err = true;
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Enter at least one acceptable payment method', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Acceptable payment method missing',           // title
						'OK'     // buttonLabels
					);
				} else {
					alert("Acceptable payment method missing")
				}
			}
			// if (!_.find(vm.profile.cuisines, function (v) { return v.checked })) {
			// 	err = true;
			// 	if (window.cordova) {
			// 		var onConfirm = function () {

			// 		};
			// 		navigator.notification.alert(
			// 			'Enter at least one cuisine you offer', // message
			// 			onConfirm,            // callback to invoke with index of button pressed
			// 			'Cuisines missing',           // title
			// 			'OK'     // buttonLabels
			// 		);
			// 	} else {
			// 		alert("Cuisines Missing");
			// 	}
			// }
			if (!err) {
				editModal.scope.changed = false;
				profileService.saveProfileChanges(vm.profile, tempUser);
				_.forEach(vm.profile.time, function (v) {
					if (!angular.isDate(v.opening)) {
						v.opening = new Date(v.opening);
					}
					if (!angular.isDate(v.closing)) {
						v.closing = new Date(v.closing);
					}
				});
				// $ionicSlideBoxDelegate.$getByHandle('savedImages').update();
				$localForage.setItem('loggedInUser', vm.profile).then(function () {
					console.log('added data');
					if (window.cordova) {
						//noinspection JSUnresolvedFunction
						cordova.plugins.snackbar('Profile changes saved successfully!', 'SHORT', "", function () {

						});
					} else {
						alert("updated");
					}
				}, function (err) {
					console.log(err);
				});
				profileService.updateStore(vm.profile.info.userId, vm.profile.storeName);
				convertServiceType();
				editModal.hide();
			}
		}

		function showModal() {
			editModal.show();
			var scope = editModal.scope;
			scope.em = {
				close: close,
				applyEdits: applyEdits,
				cuisines: vm.cuisines,
				profile: vm.profile,
				addPostcode: addPostcode,
				removePostcode: removePostcode,
				getPicture: getPicture,
				getGeoLocation: getGeoLocation,
				selectRating: selectRating,
				showSlider: vm.showSlider,
				removeImage: removeImage
			};
			scope.changed = false;
			scope.profile = angular.copy(vm.profile);
			var previousProfile = angular.copy(vm.profile);


			scope.detectChange = function (key, subKey) {
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
				if (subKey)
					var result = deepDiffMapper.map(scope.profile[key][subKey], previousProfile[key][subKey]);
				else
					var result = deepDiffMapper.map(scope.profile[key], previousProfile[key]);
				console.log(result);
				if (result.type == "unchanged") {
					scope.changed = false;
				} else {
					scope.changed = true;
				}
			}
		}

		function onDeviceReady(directory) {
			var uploadTask;
			var uri;
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
							//window.open(base64Image);
							// console.log(base64Image);
							// Then you'll be able to handle the myimage.png file as base64

							uploadTask = profileService.getStorageBusiness(loggedInUserData.data.info.userId, base64Image.split(',')[1], directory, new Date().getTime());
							$ionicLoading.show({
								template: 'Uploading Image...'
							});
							$rootScope.showRestaurantImageSlider = false;

							uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
								function (snapshot) {
									// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
								}, function (error) {
									$ionicLoading.hide();
									switch (error.code) {
										case 'storage/unauthorized':
											$cordovaToast.showShortCenter("User doesn't have permission");
											// User doesn't have permission to access the object
											break;

										case 'storage/canceled':
											$cordovaToast.showShortCenter("User canceled the upload");
											// User canceled the upload
											break;

										case 'storage/unknown':
											$cordovaToast.showShortCenter("Unknown error occurred");
											// Unknown error occurred, inspect error.serverResponse
											break;
									}
								}, function () {

									// Upload completed successfully, now we can get the download URL
									if (directory == 'logo') {
										// loggedInUserData.data.logo = uploadTask.snapshot.downloadURL;
										editModal.scope.profile.logo = uploadTask.snapshot.downloadURL;
									} else {
										if (editModal.scope.profile.imageURL.length != 0) {
											editModal.scope.profile.imageURL.push({ 'name': uploadTask.snapshot.downloadURL });
										}
										else {
											editModal.scope.profile.imageURL = [];
											editModal.scope.profile.imageURL.push({ 'name': uploadTask.snapshot.downloadURL });
										}
										// editModal.scope.profile.imageURL = angular.copy(loggedInUserData.data.imageURL);
										$ionicSlideBoxDelegate.$getByHandle('editImages').update();
										// console.log(loggedInUserData.data.imageURL);
									}
									$rootScope.showRestaurantImageSlider = true;
									editModal.scope.changed = true;
									$ionicLoading.hide();
									$cordovaToast.showShortCenter("Upload Successful..");
								});
						});
					}
				}, function (error) {
					console.log(error);
					$cordovaToast.showShortCenter("Error in opening gallery..");
				});

		}

		function removeImage(image) {
			editModal.scope.changed = true;
			console.log('remove image');
			$rootScope.showRestaurantImageSlider = false;
			editModal.scope.profile.imageURL = _.reject(editModal.scope.profile.imageURL, function (n) {
				return n.name == image.name;
			});
			$ionicSlideBoxDelegate.$getByHandle('savedImages').update();
			$timeout(function () {
				$rootScope.showRestaurantImageSlider = true;
				$ionicSlideBoxDelegate.$getByHandle('editImages').update();
			}, 500);
		}

		function removeLogo() {
			vm.profile.logo = null;
		}

		function getPicture(directory) {
			if (window.cordova) {
				var permissions = cordova.plugins.permissions;
				permissions.hasPermission(permissions.READ_EXTERNAL_STORAGE, checkPermissionCallback, null);

				function checkPermissionCallback(status) {
					if (!status.hasPermission) {
						var errorCallback = function () {
							console.warn('Storage permission is not turned on');
						};

						permissions.requestPermission(
							permissions.READ_EXTERNAL_STORAGE,
							function (status) {
								if (!status.hasPermission) errorCallback();
							},
							errorCallback);
					} else {
						document.addEventListener("deviceready", onDeviceReady(directory), false);
					}
				}
			} else {
				alert('Please Check on Mobile!');
			}
		}

		function convertServiceType() {
			vm.serviceTypeArray = [];
			// console.log(vm.profile.serviceType);
			if (vm.profile.serviceType.homeDelivery) {
				// console.log('1');
				vm.serviceTypeArray.push('Home Delivery');
			}
			if (vm.profile.serviceType.dineIn) {
				// console.log('2');
				vm.serviceTypeArray.push('Dine In');
			}
			if (vm.profile.serviceType.pickUp) {
				// console.log('3');
				vm.serviceTypeArray.push('Take Away');
			}
		}

		convertServiceType();

	}

})();
