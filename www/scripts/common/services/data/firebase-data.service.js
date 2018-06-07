(function () {
	'use strict';

	angular
		.module('restaurant.common')
		.factory('db', ['ENV', function (ENV) {
			firebase.initializeApp(ENV.firebaseConfig);
			return firebase.database().ref()
		}])

		.factory('dbStorage', ['ENV', function (ENV) {
			return firebase.storage().ref()
		}])

		.factory('Icons', function () {
			return { data: [] }
		})

		.factory('firebaseDataService', firebaseDataService)

		.factory('loggedInUserData', function () {
			return {
				data: {
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
					"customers": [],
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
					"min": "",
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
					"offers": [],
					"menuOnline": false,
					"specialOffers": [],
					"speciality": "",
					"storeName": "",
					"phone": "",
					"device_token": "",
					"time": {
						"mon": {
							"opening": new Date("Wed Mar 25 2015 16:00:00 GMT+0000 (W. Europe Standard Time)"),
							"closing": new Date("Wed Mar 25 2015 00:00:00 GMT+0000 (W. Europe Standard Time)"),
							"selected": false
						},
						"tue": {
							"opening": new Date("Wed Mar 25 2015 16:00:00 GMT+0000 (W. Europe Standard Time)"),
							"closing": new Date("Wed Mar 25 2015 00:00:00 GMT+0000 (W. Europe Standard Time)"),
							"selected": false
						},
						"wed": {
							"opening": new Date("Wed Mar 25 2015 16:00:00 GMT+0000 (W. Europe Standard Time)"),
							"closing": new Date("Wed Mar 25 2015 00:00:00 GMT+0000 (W. Europe Standard Time)"),
							"selected": false
						},
						"thu": {
							"opening": new Date("Wed Mar 25 2015 16:00:00 GMT+0000 (W. Europe Standard Time)"),
							"closing": new Date("Wed Mar 25 2015 00:00:00 GMT+0000 (W. Europe Standard Time)"),
							"selected": false
						},
						"fri": {
							"opening": new Date("Wed Mar 25 2015 16:00:00 GMT+0000 (W. Europe Standard Time)"),
							"closing": new Date("Wed Mar 25 2015 00:00:00 GMT+0000 (W. Europe Standard Time)"),
							"selected": false
						},
						"sat": {
							"opening": new Date("Wed Mar 25 2015 16:00:00 GMT+0000 (W. Europe Standard Time)"),
							"closing": new Date("Wed Mar 25 2015 00:00:00 GMT+0000 (W. Europe Standard Time)"),
							"selected": false
						},
						"sun": {
							"opening": new Date("Wed Mar 25 2015 16:00:00 GMT+0000 (W. Europe Standard Time)"),
							"closing": new Date("Wed Mar 25 2015 00:00:00 GMT+0000 (W. Europe Standard Time)"),
							"selected": false
						}
					}
				}
			};
		})

		.service('UserService', function () {
			// For the purpose of this example I will store user data on ionic local storage but you should save it on a database
			var setUser = function (user_data) {
				window.localStorage.starter_facebook_user = JSON.stringify(user_data);
			};

			var getUser = function () {
				return JSON.parse(window.localStorage.starter_facebook_user || '{}');
			};

			return {
				getUser: getUser,
				setUser: setUser
			};
		})

		.factory('commonService', function () {
			return {};
		});


	firebaseDataService.$inject = ['_', 'db', '$firebaseArray', '$firebaseObject', 'loggedInUserData', 'dbStorage'];

	/* @ngInject */
	function firebaseDataService(_, db, $firebaseArray, $firebaseObject, loggedInUserData, dbStorage) {
		var service = {
			getCategories: getCategories,
			getCustomers: getCustomers,
			getProducts: getProducts,
			getProduct: getProduct,
			getFeaturedCategories: getFeaturedCategories,
			getFeaturedProducts: getFeaturedProducts,
			getFeaturedProduct: getFeaturedProduct,
			getBusiness: getBusiness,
			getArticles: getArticles,
			getArticle: getArticle,
			getCuisines: getCuisines,
			syncProfileData: syncProfileData,
			saveProfileChanges: saveProfileChanges,
			getMenuItems: getMenuItems,
			getMenuItem: getMenuItem,
			deleteMenuItem: deleteMenuItem,
			getMenuOffers: getMenuOffers,
			getSpecialOffers: getSpecialOffers,
			getStorageBusiness: getStorageBusiness,
			updateToken: updateToken,
			getDeviceTokenOfCustomer: getDeviceTokenOfCustomer,
			updateStore: updateStore,
			deleteFile: deleteFile,
			updateMenuStatus: updateMenuStatus,
			updateMenuItem: updateMenuItem,
			getIcons: getIcons,
			getIconUrls: getIconUrls,
			updateMealDeals: updateMealDeals,
			updateSpecialOffers: updateSpecialOffers,
			savePreferences: savePreferences,
			createSpecialOffer: createSpecialOffer,
		};
		return service;

		// ***********************************************************

		function getArticles() {
			var query = db.child('news');
			return $firebaseArray(query).$loaded().then(initArray);
		}

		function getArticle(articleId) {
			var query = db.child('news/' + articleId);
			return $firebaseObject(query).$loaded().then(initItem);
		}

		function getCategories() {
			var query = db.child('categories');
			return $firebaseArray(query).$loaded().then(initArray);
		}

		function getCustomers() {
			console.log('getCutomers');
			var query = db.child('customers');
			return $firebaseArray(query).$loaded().then(initArray);
		}

		function getIcons() {
			console.log('getIcons');
			var query = db.child('icons');
			return $firebaseArray(query).$loaded().then(initArray);
		}

		function getProducts(categoryGuid) {
			var query = db.child('menuItems').orderByChild('category').equalTo(categoryGuid);
			return $firebaseArray(query).$loaded().then(initArray);
		}

		function getProduct(categoryGuid, productGuid) {
			var query = db.child('menuItems/' + productGuid);
			return $firebaseObject(query).$loaded().then(initItem);
		}

		function getFeaturedCategories() {
			var query = db.child('categories').orderByChild('featured').equalTo(true);
			return $firebaseArray(query).$loaded().then(initArray);
		}

		function getCuisines() {
			var query = db.child('cuisines');
			return $firebaseArray(query).$loaded().then(initArray);
		}

		function getFeaturedProducts() {
			var query = db.child('menuItems').orderByChild('isFeatured').equalTo(true);
			return $firebaseArray(query).$loaded().then(initArray);
		}

		function getFeaturedProduct(productGuid) {
			return getProduct(null, productGuid);
		}

		function getBusiness() {
			var query = db.child('business');
			return $firebaseObject(query).$loaded().then(initItem);
		}

		function initItem(item) {
			return angular.extend({}, item, {
				guid: item.$id
			});
		}

		function initArray(array) {
			return _.map(array, initItem);
		}

		function syncProfileData(userId) {
			// create a reference to the database node where we will store our data
			var ref = firebase.database().ref("business");
			var profileRef = ref.child(userId);

			// return it as a synchronized object
			return $firebaseObject(profileRef);
		}

		function saveProfileChanges(copyDataObj, firebaseObj) {
			_.forEach(copyDataObj.time, function (v) {
				v.opening += "";
				v.closing += "";
			});
			_.each(copyDataObj, function (v, k) {
				if (v == undefined) {
					v = "";
				}
				firebaseObj[k] = v;
			});
			// _.each(copyDataObj, function (v,k) {
			// 	firebaseObj[k] = v;
			// });
			// console.log(firebaseObj);
			return firebaseObj.$save();
		}

		function getMenuItems() {
			var ref = firebase.database().ref('business/' + loggedInUserData.data.info.userId + '/menuItems');
			return $firebaseArray(ref)
		}

		function getMenuItem(key) {
			var ref = firebase.database().ref("business");
			var query = ref.child(loggedInUserData.data.info.userId + '/menuItems/' + key);
			return $firebaseObject(query).$loaded();
		}

		function deleteMenuItem(key) {
			return firebase.database().ref('business/' + loggedInUserData.data.info.userId + '/menuItems/' + key)
				.remove()
		}
		function getMenuOffers() {
			var ref = firebase.database().ref("business");
			var menuItems = ref.child(loggedInUserData.data.info.userId + '/offers');
			return $firebaseArray(menuItems);
		}

		function getSpecialOffers() {
			var ref = firebase.database().ref("business");
			var menuItems = ref.child(loggedInUserData.data.info.userId + '/specialOffers');
			return $firebaseObject(menuItems).$loaded();
		}

		function getStorageBusiness(businessId, imageData, directory, name) {
			return dbStorage.child('business/' + businessId + '/' + directory + '/' + name).putString(imageData, 'base64')
		}

		function getIconUrls(iconArray) {
			_.each(iconArray, function (n) {
				dbStorage.child('common/placeholders/' + n.name).getDownloadURL().then(function (url) {
					n.url = url;
				})
			});
			return iconArray;
		}

		function deleteFile(businessId, name) {
			var ref = dbStorage.child('business/' + businessId + '/' + 'products' + '/' + name).delete().then(function () {
				// File deleted successfully
				console.log("file Deleted");
			}).catch(function (error) {
				// Uh-oh, an error occurred!
			});
		}

		function updateToken(userId, token) {
			var ref = db.child('/business/' + userId);
			return ref.update({ device_token: token });
		}

		function getDeviceTokenOfCustomer(userId) {
			var ref = db.child('/customers/' + userId);
			return $firebaseObject(ref).$loaded();
		}

		function updateStore(businessId, storeName) {
			var ref = db.child('/rating/' + businessId);
			ref.update({ 'provider': storeName });
		}

		function updateMenuStatus(businessId, status) {
			// console.log("insideUpdate", businessId, status);
			var ref = db.child('/business/' + businessId);
			return ref.update({ menuOnline: status })
		}

		function updateMenuItem(businessId, itemId, item) {
			// console.log("insideUpdate", businessId, status);
			var ref = db.child('/business/' + businessId + '/menuItems/' + itemId);
			return ref.update(item);
		}

		function updateMealDeals(businessId, item) {
			// console.log("insideUpdate", businessId, status);
			var ref = db.child('/business/' + businessId + '/offers');
			return ref.update(item);
		}

		function updateSpecialOffers(businessId, item) {
			// console.log("insideUpdate", businessId, status);
			var ref = db.child('/business/' + businessId + '/specialOffers');
			return ref.update(item);
		}
		function savePreferences(data) {
			var ref = db.child('/business/' + loggedInUserData.data.info.userId + '/settings/paymentPreferences');
			return ref.update(data)
		}
		function createSpecialOffer(data, callback) {
			data.daysCondition.start += "";
			data.daysCondition.end += "";
			_.each(data.timeCondition, function (v) {
				v.start += "";
				v.end += "";
			});
			Object.keys(data.selectedItem).forEach(function (key) {
				if (key === "$$hashKey") {
					delete data.selectedItem[key];
				}
			});

			var ref = db.child('/business/' + loggedInUserData.data.info.userId + '/specialOffers/');
			return ref.update(data, callback)
		}
	}
})();
