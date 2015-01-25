angular.module('conference', ['ionic', 'conference.sessions', 'conference.speakers', 'conference.profiles'])

.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

.config(function ($stateProvider, $urlRouterProvider) {

	$stateProvider

	.state('app', {
		url: "/app",
		abstract: true,
		templateUrl: "templates/menu.html",
		controller: 'AppCtrl'
	})


	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/sessions');
})

.controller('AppCtrl', function ($scope, $http, $ionicModal, $ionicScrollDelegate, $timeout) {
	function getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
	}
	var code = getURLParameter('code');
	if (code) {
		$http.jsonp('https://secure.meetup.com/oauth2/access?client_id=5gefnsti32oruqceedbl0q0jag&client_secret=ake993sske7re8q4a7qk05si0l&grant_type=authorization_code&redirect_uri=http://128.199.146.12:5000/&code=' + code, {}).
		success(function (data, status, headers, config) {
			console.log(data);
			// this callback will be called asynchronously
			// when the response is available
		}).
		error(function (data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	}

	// Form data for the login modal
	$scope.loginData = {};

	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function (modal) {
		$scope.modal = modal;
	});

	// Triggered in the login modal to close it
	$scope.closeLogin = function () {
		$scope.modal.hide();
	},

	// Open the login modal
	$scope.login = function () {
		$scope.modal.show();
	};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function () {
		console.log('Login', $scope.loginData);
		alert("Only the Facebook login is implemented in this sample app.");
		$scope.closeLogin();
	};

	$scope.fbLogin = function () {
		openFB.login(
			function (response) {
				if (response.status === 'connected') {
					console.log('Facebook login succeeded');
					$scope.closeLogin();
				} else {
					alert('Facebook login failed');
				}
			}, {
				scope: 'email,publish_actions'
			});
	};

	$scope.meetupLogin = function () {
		window.location.href = 'https://secure.meetup.com/oauth2/authorize?client_id=5gefnsti32oruqceedbl0q0jag&response_type=code&redirect_uri=http://128.199.146.12:5000/';
		// window.location.href = 'https://secure.meetup.com/oauth2/authorize?client_id=5gefnsti32oruqceedbl0q0jag&response_type=code&redirect_uri=http://localhost:5000/';
	};

	$(document).ready(function () {
		var menu = $(".menu > img");
		var arrow = $(".arrow > img");
		var heart = $(".heart > img");
		var add = $(".add > img");
		var search = $(".search > img");
		var download = $(".download > img");
		var trash = $(".trash > img");


		$(".toggle").on('click', function () {
			$.each([menu, arrow], function () {
				this.toggleClass('out');
			});
			$.each([heart, add, search, download, trash], function () {
				this.toggleClass('hide');
			});
			$(this).addClass('anim').delay(800).queue(function (next) {
				$(this).removeClass('anim');
				next()
			});
		});
	});
});