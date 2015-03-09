angular.module('conference', ['ionic', 'conference.sessions', 'conference.speakers', 'conference.profiles', 'angularMoment'])

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

.factory('Meetup', function ($resource, SERVER_PATH) {
	return $resource(SERVER_PATH + '/auth/meetup/:code', {
		code: '@code'
	});
})

.factory('getMeetup', function($http, $q, $timeout, PHP_SERVER, MEETUP_KEY, CLIENT_PATH) {
    return {
        meetupLogin: function () {
            window.location.href = 'https://secure.meetup.com/oauth2/authorize?client_id=' + MEETUP_KEY + '&response_type=code&redirect_uri=' + CLIENT_PATH;
        },
        removeBasic: function () {
            localStorage.removeItem('authenticated');
            localStorage.removeItem('access_token');
            localStorage.removeItem('expires');
            localStorage.removeItem('meetupProfile');
            localStorage.removeItem('refresh_token');
            auth = null;
            access_token = null;
        },
        getBasic: function(){
            var _self = this,
                def = $q.defer(),
                auth = localStorage.getItem('authenticated'),
                access_token = localStorage.getItem('access_token'),
                current = Number(moment().format('x')),
                expires = localStorage.getItem('expires')*1000;
            if (auth) {
                if (current > expires) {
                    _self.removeBasic();
                }
                if (!access_token || access_token=='undefined') {
                    $http.get(PHP_SERVER + '/?code=' + auth)
                        .success(function (data, status, headers, config) {
                            if (data.access_token) {
                                localStorage.setItem('access_token', data.access_token);
                                localStorage.setItem('refresh_token', data.refresh_token);
                                localStorage.setItem('expires', data.expires);
                                localStorage.setItem('meetupProfile', JSON.stringify(data.response.results[0]));
                            } else {
                                _self.removeBasic();
                                _self.getBasic();
                            }
                            def.resolve();
                        })
                        .error(function (data, status, headers, config) {
                            def.resolve();
                        });
                }
            } else {
                _self.meetupLogin();
            }
            return def.promise;
        },
        getEvent: function(page){
            var _self = this,
                def = $q.defer(),
                access_token = localStorage.getItem('access_token');
            if (access_token) {
                $http.get(PHP_SERVER + '/api.php?api=/2/events&params=member_id:self,page:' + 20 + ',offset:' + page * 20 + '&access_token=' + access_token).
                    success(function (data, status, headers, config) {
                        def.resolve(data);
                    }).
                    error(function (data, status, headers, config) {
                        def.resolve();
                    });
            } else {
                def.resolve();
            }
            return def.promise;
        }
    }
})

.controller('AppCtrl', function ($rootScope, $scope, $http, $resource, $ionicModal, $ionicScrollDelegate, $timeout, Meetup, getMeetup, CLIENT_PATH, MEETUP_KEY, MEETUP_SECRET, PHP_SERVER, SERVER_PATH) {
	function getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
	};
	var page= 0,
        code = getURLParameter('code');
	if (code) {
        localStorage.setItem('authenticated', code);
        $timeout(function () {
            window.location.href = CLIENT_PATH;
        });
    } else {
        getMeetup.getBasic();
    }

	// Form data for the login modal
	$scope.loginData = {};

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