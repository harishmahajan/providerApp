(function () {
	'use strict';

	angular
		.module('restaurant.login')
		.controller('LoginController', LoginController);

	LoginController.$inject = ['$state', '$ionicSlideBoxDelegate', '$window', '$localForage',
		'$q', '$rootScope', '$ionicLoading', 'UserService', 'dataService',
		'$cordovaOauth', '$cordovaToast', 'loggedInUserData', '$http', '$ionicPopup', '$scope', '$ionicHistory'];

	/* @ngInject */
	function LoginController($state, $ionicSlideBoxDelegate, $window, $localForage,
		$q, $rootScope, $ionicLoading, UserService, dataService,
		$cordovaOauth, $cordovaToast, loggedInUserData, $http, $ionicPopup, $scope, $ionicHistory) {
		var lc = angular.extend(this, {
			categories: [],
			products: [],
			storeName: ''
		});

		var devHeight = $window.innerHeight;
		lc.fullHeight = { 'height': devHeight - 144 + 'px' }
		lc.title = { 'height': 100 + 'px' }

		// ******************************************************
		function saveProfileChanges(copyObj, objId) {
			return dataService.syncProfileData(objId).$loaded()
				.then(function (userData) {
					$ionicLoading.show({
						template: 'Saving profile ...'
					});
					if (userData.info == null) {
						dataService.saveProfileChanges(copyObj, userData);
					}
					else {
						_.each(loggedInUserData.data, function (v, k) {
							if (userData[k] != null) {
								loggedInUserData.data[k] = userData[k];
							}
						})
					}

					$localForage.setItem('loggedInUser', loggedInUserData.data)
						.then(function () {
							$ionicLoading.hide();
							$state.go('app.profile');
							$ionicHistory.nextViewOptions({
								disableBack: true
							});
						}, function (err) {
							console.log(err);
						});
				});
		}

		var loggedInUser = loggedInUserData.data;
		console.log(loggedInUserData);
		var login = {};

		// this function gets invoked when 'Login with Google' button is clicked
		lc.googleSignIn = function () {
			var result1 = {};
			$ionicLoading.show({
				template: 'Signing in ...'
			});
			$cordovaOauth.google("311291036868-491asqf8bigpav2vscoiejd72hu4uc3f.apps.googleusercontent.com", ["email", "profile"])
				.then(function (result) {
					console.log(result);
					result1 = result;
				}, function (error) {
					console.log(error);
				})
				.then(function () {
					var config = {
						headers: {
							'Authorization': 'Bearer ' + result1.access_token
						}
					};
					$http.get('https://www.googleapis.com/oauth2/v2/userinfo', config).then(function (data) {

						loggedInUser.info = {
							'email': data.data.email,
							'userId': data.data.id,
							'name': data.data.name
						};

						loggedInUserData.data = loggedInUser;
						saveProfileChanges(loggedInUser, loggedInUser.info.userId);

					}, function (err) {
						$ionicLoading.hide();
						$cordovaToast.showShortBottom('Error in connection');
					})
				});
		};
		// This method is to get the user profile info from the facebook api
		var getFacebookProfileInfo = function (authResponse) {
			var info = $q.defer();

			facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
				function (response) {

					info.resolve(response);
				},
				function (response) {
					info.reject(response);
				}
			);
			return info.promise;
		};

		// This is the success callback from the login method
		var fbLoginSuccess = function (response) {
			console.dir(response);
			if (!response.authResponse) {
				fbLoginError("Cannot find the authResponse");
				return;
			}

			var authResponse = response.authResponse;

			getFacebookProfileInfo(authResponse)
				.then(function (profileInfo) {

					console.log('after login')
					console.dir(profileInfo)

					UserService.setUser({
						authResponse: authResponse.authResponse,
						userID: profileInfo.id,
						name: profileInfo.name,
						email: profileInfo.email
					});

					loggedInUser.info = {
						'email': profileInfo.email,
						'userId': profileInfo.id,
						'name': profileInfo.name
					};

					loggedInUserData.data = loggedInUser;
					saveProfileChanges(loggedInUser, loggedInUser.info.userId);

				}, function (err) {
					$ionicLoading.hide();
				});
		};

		// This is the fail callback from the login method
		var fbLoginError = function (error) {
			// $cordovaToast.showShortBottom('Error in connection');
			$ionicLoading.hide();
		};

		//This method is executed when the user press the "Login with facebook" button
		lc.facebookSignIn = function () {
			$ionicLoading.show({
				template: 'Signing in ...'
			});
			facebookConnectPlugin.getLoginStatus(function (success) {
				if (success.status === 'connected') {

					// The user is logged in and has authenticated your app, and response.authResponse supplies
					// the user's ID, a valid access token, a signed request, and the time the access token
					// and signed request each expire

					// Check if we have our user saved
					login.user = UserService.getUser('facebook');

					if (!login.user.userID) {
						getFacebookProfileInfo(success.authResponse)
							.then(function (profileInfo) {
								UserService.setUser({
									authResponse: success.authResponse,
									userID: profileInfo.id,
									name: profileInfo.name,
									email: profileInfo.email
								});

								loggedInUser.info = {
									'email': profileInfo.email,
									'userId': profileInfo.id,
									'name': profileInfo.name
								};

								loggedInUserData.data = loggedInUser;
								saveProfileChanges(loggedInUser, loggedInUser.info.userId);

							}, function (fail) {
								// Fail get profile info
								// 								$cordovaToast.showShortBottom('Error in connection');
							});
					}
					else {
						loggedInUser.info = {
							'email': login.user.email,
							'userId': login.user.userID,
							'name': login.user.name
						};

						loggedInUserData.data = loggedInUser;
						saveProfileChanges(loggedInUser, loggedInUser.info.userId);

					}
				}
				else {
					// If (success.status === 'not_authorized') the user is logged in to Facebook,
					// but has not authenticated your app
					// Else the person is not logged into Facebook,
					// so we're not sure if they are logged into this app or not.

					// Ask the permissions you need. You can learn more about
					// FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
					facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
				}
			});
		};

		lc.fakeSignIn = function () {
			loggedInUser.info = {
				'email': "batman22@gmail.com",
				'userId': "9999666",
				'name': "Green Arrow"
			};

			loggedInUserData.data = loggedInUser;
			// console.log(loggedInUser);
			// console.log(loggedInUserData);
			saveProfileChanges(loggedInUser, loggedInUser.info.userId);
		};

		lc.emailSignIn = function () {
			$ionicLoading.show({
				template: 'Signing in ...'
			});
			var signInDetails = {
				email: lc.user.email,
				password: lc.user.password
			};

			firebase.auth().signInWithEmailAndPassword(signInDetails.email, signInDetails.password).then(function (response) {
				var user = firebase.auth().currentUser;

				if (user != null) {
					if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
						loggedInUser.info = {
							'email': user.email,
							'userId': user.uid,
							'name': user.displayName
						};
					}
					else {
						loggedInUser.info = {
							'email': user.email,
							'userId': user.uid,
							'name': user.displayName
						};
					}

				}
				// loggedInUserData.data = loggedInUser;
				console.log(loggedInUser);
				$ionicLoading.hide();
				saveProfileChanges(loggedInUser, loggedInUser.info.userId);

			}, function (error) {
				$ionicLoading.hide();
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				console.log(errorCode, errorMessage);
			});
			// });
		}

		lc.createAccount = function () {
			createPopup();
		};

		var createPopup = function () {
			var scope = $scope.$new();
			scope.data = {};
			var myPopup = $ionicPopup.show({
				templateUrl: 'scripts/login/createAccount.html',
				title: 'Create a new account',
				subTitle: 'Signup',
				scope: scope,
				buttons: [{
					text: 'Cancel',
					onTap: function (e) {
						scope.data.canceled = true;
						return scope.data;
					}
				}, {
					text: '<b>Sign Up</b>',
					type: 'button-positive',
					onTap: function (e) {
						var email = scope.data.email;
						var password = scope.data.password;
						var password2 = scope.data.password2;
						var name = scope.data.name;
						if (!checkValidName(name)) {
							createAlert('Name invalid', 'Name should be at least 3 characters long');
							e.preventDefault();
							return;
						}
						if (!checkValidEmail(email)) {
							createAlert('Incorrect E-mail', 'Enter correct email');
							e.preventDefault();
							return;
						}
						if (!checkValidPassword(password)) {
							createAlert('Password invalid', 'Password should be at least 6 characters long');
							e.preventDefault();
							return;
						}
						else if (!password || !password2 || password != password2) {
							e.preventDefault();
						} else {
							$ionicLoading.show({
								template: 'Creating your account...'
							});
							var createUserId = function () {
								var info = $q.defer();
								firebase.auth().createUserWithEmailAndPassword(email, password).then(function (response) {
									info.resolve(response);
								},
									function (error) {
										info.reject(error);
									}
								);
								return info.promise;
							};
							createUserId().then(function () {
								var user = firebase.auth().currentUser;

								user.updateProfile({
									displayName: scope.data.name,
									imageURL: "https://dl.dropbox.com/s/4tdz2fuzfcr29t6/avatar.png?dl=1"
								}).then(function () {
									console.log("Update Successful");
									// Update successful.
									if (user != null) {
										loggedInUser.info = {
											'email': user.email,
											'userId': user.uid,
											'name': user.displayName
										};
										loggedInUserData.data = loggedInUser;
										saveProfileChanges(loggedInUser, loggedInUser.info.userId);
										myPopup.close();
										return scope.data;
									} else {
										console.log("user is null");
									}
								}, function (error) {
									console.log("Account Created but update was unsuccessful", error);
									// An error happened.
								});
							}, function (error) {
								// Handle Errors here.
								var errorCode = error.code;
								var errorMessage = error.message;
								console.log("ErrorCode: ", errorCode);
								console.log("ErrorMessage: ", errorMessage);
								// ...
								$ionicLoading.hide();
								alert(errorMessage);
							});
							console.log("Okay")
							e.preventDefault();
						}
					}
				}]
			});
			myPopup.then(function () {
				$ionicLoading.hide();
			});
		};


		function checkValidEmail(x) {
			console.log(x);
			if (x) {
				var atpos = x.indexOf("@");
				var dotpos = x.lastIndexOf(".");
				if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= x.length) {
					// alert("Not a valid e-mail address");
					return false;
				}
				else {
					return true;
				}
			}
			else {
				return false;
			}
		}

		function checkValidName(x) {
			if (x) {
				if (x.length < 3) {
					return false;
				}
				else {
					return true;
				}
			}
			else {
				return false;
			}
		}

		function checkValidPassword(x) {
			if (x) {
				if (x.length < 6) {
					return false;
				}
				else {
					return true;
				}
			}
			else {
				return false;
			}
		}

		function createAlert(title, message) {
			if (window.cordova) {
				var onConfirm = function () {

				};
				navigator.notification.alert(
					message, // message
					onConfirm,            // callback to invoke with index of button pressed
					title,           // title
					'OK'     // buttonLabels
				);
			}
			else {
				alert(message);
			}
		}
	}
})();
