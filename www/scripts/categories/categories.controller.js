(function () {
	'use strict';

	angular
		.module('restaurant.categories')
		.controller('CategoriesController', CategoriesController);

	CategoriesController.$inject = ['$state', 'categoriesService', 'addNewCategory', 'editCategory', 'loggedInUserData',
		'$ionicLoading', '$cordovaToast', '$localForage', '$timeout', '$ionicListDelegate', '$rootScope', '$window', 'Icons', 'commonService'];

	/* @ngInject */
	function CategoriesController($state, categoriesService, addNewCategory, editCategory, loggedInUserData,
		$ionicLoading, $cordovaToast, $localForage, $timeout, $ionicListDelegate, $rootScope, $window, Icons, commonService) {
		var vm = angular.extend(this, {
			categories: [],
			showProducts: showProducts,
			addNewCategoryModal: addNewCategoryModal,
			category: {},
			removeCategory: removeCategory,
			editCategoryModal: editCategoryModal,
			selectIcon: selectIcon,
			createHappyHour: createHappyHour,
			temp: {}
		});

		(function activate() {
			loadCategories();
		})();

		// ******************************************************

		var categoryThumb = "";
		var tempUser = categoriesService.syncProfileData(loggedInUserData.data.info.userId);
		vm.profile = loggedInUserData.data;

		var devH = $window.innerHeight;
		var devW = $window.innerWidth;
		vm.smallModal = { 'top': 0 + 'px', 'height': devH + 'px', 'width': devW + 'px', 'left': 0 + 'px' };

		function close() {
			addNewCategory.hide();
			editCategory.hide();
			vm.category = {};
		}

		function loadCategories() {
			vm.categories = categoriesService.all();
		}

		function showProducts(category) {
			console.log(category);
			commonService.categoryName = category.title;
			$state.go('app.products', {
				// categoryId: category.guid,
				categoryName: category.title
			});
		}

		// function hasReadPermission() {
		// 	window.imagePicker.hasReadPermission(
		// 		function(result) {
		// 			// if this is 'false' you probably want to call 'requestReadPermission' now
		// 			console.log("has read permission ",result);
		// 		}
		// 	)
		// }
		//
		// function requestReadPermission() {
		// 	// no callbacks required as this opens a popup which returns async
		// 	console.log("requesting");
		// 	window.imagePicker.requestReadPermission();
		// }
		//
		// if(!hasReadPermission()){
		// 	requestReadPermission();
		// }
		vm.iconArray = Icons.data;

		function addNewCategoryModal() {
			var scope = addNewCategory.scope;
			$rootScope.varieties = [];
			scope.vm = {
				applyEdits: applyEdits,
				close: close,
				profile: vm.profile,
				addCategory: addCategory,
				category: vm.category,
				getPictureOfCategory: getPictureOfCategory,
				smallModal: vm.smallModal,
				iconArray: vm.iconArray,
				selectIcon: vm.selectIcon,
				selectThisIcon: selectThisIcon,
				saveNewVariety: saveNewVariety,
				removeVariety: removeVariety
				// addImage: addImage
			};
			addNewCategory.show();
		}

		function selectIcon(index) {
			$rootScope.selectedIcon = index;
			console.log($rootScope.selectedIcon);
			console.log(index);
		}

		function editCategoryModal(category) {
			console.log(category);
			$ionicListDelegate.closeOptionButtons();
			var scope = editCategory.scope;
			scope.oldCategory = angular.copy(category);
			scope.selectedCategory = angular.copy(category);
			// scope.selectedCategory = angular.copy(category);

			console.log(scope.selectedCategory);
			if (category.varieties) {
				$rootScope.varieties = category.varieties;
			}
			else {
				$rootScope.varieties = [];
			}

			scope.vme = {
				applyEdits: applyEdits,
				close: close,
				profile: vm.profile,
				category: vm.category,
				temp: vm.temp,
				editSelectedCategory: editSelectedCategory,
				editPictureOfCategory: getPictureOfCategory,
				showPictureOptions: showPictureOptions,
				smallModal: vm.smallModal,
				iconArray: vm.iconArray,
				selectIcon: vm.selectIcon,
				selectThisIcon: selectThisIcon,
				saveNewVariety: saveNewVariety,
				removeVariety: removeVariety
				// addImage: 			addImage
			};
			$rootScope.categoryThumb = category.thumb;
			editCategory.show();
		}

		function removeVariety(variety) {
			$rootScope.varieties = _.reject($rootScope.varieties, function (n) {
				return n.name == variety;
			});
		}

		function saveNewVariety(variety) {
			var obj = { 'name': variety };
			$rootScope.varieties.push(obj);
			console.log($rootScope.varieties);
		}

		function selectThisIcon() {
			vm.category.thumb = false;
			$rootScope.categoryThumb = vm.iconArray[$rootScope.selectedIcon].url;
			categoryThumb = vm.iconArray[$rootScope.selectedIcon].url;

			$rootScope.selectedIcon = null;
			console.log(vm.category.thumb);
		}

		function removeCategory(category) {
			if (window.cordova) {
				var onConfirm = function (buttonIndex) {
					if (buttonIndex == 1) {
						$ionicListDelegate.closeOptionButtons();
						_.remove(vm.profile.categories, function (o) {
							return o.title == category
						});
						// console.log("after removing",vm.profile.categories);
						$localForage.setItem('loggedInUser', loggedInUserData.data).then(function () {
							// console.log('added data', loggedInUserData.data);
						}, function (err) {
							console.log(err);
						});
						categoriesService.saveProfileChanges(vm.profile, tempUser);
					}
				};
				navigator.notification.confirm(
					'Are you sure you want to delete this category and all its items?', // message
					onConfirm,            // callback to invoke with index of button pressed
					'Delete Category !',           // title
					['Yes', 'Cancel']     // buttonLabels
				);
			}
			else {
				var r = confirm('Are you sure you want to delete this category and all its items?');
				if (r == true) {
					$ionicListDelegate.closeOptionButtons();
					_.remove(vm.profile.categories, function (o) {
						return o.title == category
					});
					// console.log("after removing",vm.profile.categories);
					$localForage.setItem('loggedInUser', loggedInUserData.data).then(function () {
						// console.log('added data', loggedInUserData.data);
					}, function (err) {
						console.log(err);
					});
					categoriesService.saveProfileChanges(vm.profile, tempUser);
				}
			}
		}

		function addCategory(category) {
			if ($rootScope.varieties.length == 0) {
				if (window.cordova) {
					var onConfirm = function () {

					};
					navigator.notification.alert(
						'Add at least one variety in the category. E.g. 10" pizza, 1/4lb burger', // message
						onConfirm,            // callback to invoke with index of button pressed
						'Variety missing',           // title
						'OK'     // buttonLabels
					);
				}
				else {
					alert('Add at least one variety in the category. E.g. 10" pizza, 1/4lb burger');
				}
				return;
			}
			else {
				if (category.selected == null || typeof category.selected == 'undefined') {
					category.selected = true;
				}
				category.thumb = categoryThumb;
				vm.profile.categories.push(category);
				console.log($rootScope.varieties);
				vm.category.varieties = [];
				_.each($rootScope.varieties, function (item) {
					vm.category.varieties.push(item);
				});
				$rootScope.varieties = [];
				vm.category = {};
				applyEdits();
			}
		}

		function editSelectedCategory(category) {
			var category = angular.copy(category);
			if (category.selected == null || typeof category.selected == 'undefined') {
				category.selected = false;
			}

			if (categoryThumb != null && categoryThumb != "") {
				editCategory.scope.selectedCategory.thumb = categoryThumb;
			}
			console.log($rootScope.varieties);
			editCategory.scope.selectedCategory.varieties = [];
			_.each($rootScope.varieties, function (item) {
				editCategory.scope.selectedCategory.varieties.push(item);
			});
			$rootScope.varieties = [];
			// console.log(vm.category);
			// console.log(vm.profile);
			// console.log("categoryThumb ", categoryThumb);
			// applyEdits();
			console.log(editCategory.scope.selectedCategory);
			saveCategory(editCategory.scope.selectedCategory);
		}

		function getPictureOfCategory() {

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
					document.addEventListener("deviceready", getPicture, false);
				}
			}
		}

		function getPicture() {
			var uploadTask;
			var fileName;

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

			var options = {
				maximumImagesCount: 1,
				width: 800,
				height: 800,
				quality: 80
			};
			window.imagePicker.getPictures(
				function (results) {
					for (var i = 0; i < results.length; i++) {
						// console.log('Image URI: ' + results[i]);
						getFileContentAsBase64(results[i], function (base64Image) {
							$ionicLoading.show({
								template: 'Uploading Image...'
							});
							var directory = 'categories';
							var d = new Date();
							fileName = d.getTime();
							uploadTask = categoriesService.getStorageBusiness(loggedInUserData.data.info.userId, base64Image.split(',')[1], directory, fileName);

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
									categoryThumb = uploadTask.snapshot.downloadURL;
									vm.category.thumb = categoryThumb;

									// var element = document.getElementById("categoryImage");
									// element.parentNode.removeChild(element);
									// var div = document.createElement("div");
									// div.id="categoryImage";
									//
									// document.getElementById("categoryImageContainer").appendChild(div);
									//
									// document.getElementById("categoryImage").style.height = 250+"px";
									// document.getElementById("categoryImage").style.width= "auto";
									//
									// var elem = document.createElement("img");
									// document.getElementById("categoryImageContainer").appendChild(elem);
									// elem.setAttribute("src", uploadTask.snapshot.downloadURL);
									$rootScope.categoryThumb = false;
									$rootScope.categoryThumb = uploadTask.snapshot.downloadURL;
									$ionicLoading.hide();
									$cordovaToast.showShortBottom("Upload Successful..");
								});
						});
					}
				}, function (error) {
					console.log('Error: ' + error);
					$cordovaToast.showShortCenter("Error in opening gallery..");
				}, options
			);
		}

		function applyEdits() {
			$localForage.setItem('loggedInUser', loggedInUserData.data).then(function () {
				console.log('added data', loggedInUserData.data);
			}, function (err) {
				console.log(err);
			});
			console.log(vm.profile);
			categoriesService.saveProfileChanges(vm.profile, tempUser);
			if (window.cordova) {
				//noinspection JSUnresolvedFunction
				cordova.plugins.snackbar('Category added successfully!', 'SHORT', "", function () {

				});
			} else {
				alert("updated");
			}
			vm.category = {};
			$rootScope.$broadcast('category: modified');			
			addNewCategory.hide();
		}

		function saveCategory(newCategory) {
			var oldCat = angular.copy(editCategory.scope.oldCategory);
			_.forEach(loggedInUserData.data.menuItems, function (item) {
				if (item.category == oldCat.title) {
					item.category = newCategory.title;
				}
			})
			loggedInUserData.data.categories[_.findIndex(loggedInUserData.data.categories, ["title", oldCat.title])] = newCategory;
			$localForage.setItem('loggedInUser', loggedInUserData.data).then(function () {
				console.log('added data', loggedInUserData.data);
			}, function (err) {
				console.log(err);
			});
			categoriesService.saveProfileChanges(loggedInUserData.data, tempUser);
			if (window.cordova) {
				//noinspection JSUnresolvedFunction
				cordova.plugins.snackbar('Category updated successfully!', 'SHORT', "", function () {

				});
			} else {
				alert("updated");
			}
			$rootScope.$broadcast('category: modified');
			editCategory.hide();
			editCategory.scope.selectedCategory = {};
		}

		function showPictureOptions() {
			vm.pictureOptions = true;
			$timeout(function () {
				vm.pictureOptions = false;
			}, 5000)
		}

		function createHappyHour(cat) {
			var item = [];
			if (_.isObject(cat)) {
				item[0] = cat;
			} else {
				item = cat;
			}
			commonService.catHH = item;
			$state.go('app.special-offers');
		}

	}
})();
