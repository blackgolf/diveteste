angular.module('conference.sessions', ['ngResource', 'conference.config', 'conference.push'])

// Routes
.config(function ($stateProvider) {

	$stateProvider

	.state('app.sessions', {
		url: "/sessions",
		views: {
			'menuContent': {
				templateUrl: "templates/sessions.html",
				controller: "SessionListCtrl"
			}
		}
	})

	.state('app.session', {
		url: "/sessions/:sessionId",
		views: {
			'menuContent': {
				templateUrl: "templates/session.html",
				controller: "SessionCtrl"
			}
		}
	})

})

.factory('Session', function ($resource, SERVER_PATH) {
	return $resource(SERVER_PATH + '/sessions/:sessionId');
})

.controller('SessionListCtrl', function ($ionicScrollDelegate, $scope, Session, SERVER_PATH) {
	$scope.serverPath = SERVER_PATH;
	$scope.sessions = Session.query();
	$scope.footerHeight = 0;
	$scope.noDetail = true;
	$scope.firstChange = false;
	$scope.sessions.$promise.then(function () {
		$scope.detailSession = $scope.sessions[0];
	});
	$scope.toolbarheight = 95;
	$scope.changeSession = function (session) {
		if ($scope.detailSession === session && $scope.firstChange) {
			$scope.noDetail = true;
			$scope.footerHeight = 0;
			$scope.plusBottom = '22px';
		} else {
			$scope.noDetail = false;
			$scope.detailSession = session;
			$scope.footerHeight = $scope.toolbarheight * 3 + 'px';
			$scope.plusBottom = ($scope.toolbarheight * 3 - 28) + 'px';
			$scope.firstChange = true;
		}
	};

	var startY, endY, moveY, now, down = false,
		move = [],
		calculateSwipe = function () {
			for (i = 0; i < move.length; i++) {
				if (move[move.length - 1].t - move[i].t < 500) {
					var gap = move[move.length - 1].y - move[i].y;
					var timegap = move[move.length - 1].t - move[i].t;
					if (timegap > 0) {
						if (gap / timegap > 0.05) {
							swipe(1);
						} else {
							swipe(0);
						};
					}
					break;
				}
			}
			down = false;
			startY = undefined;
			move = [];
			$('#toolbar').removeClass('notransition');
			$('.floatingContainer').removeClass('notransition');
		},
		swipe = function (type) {
			switch (type) {
			case 0:
				$scope.footerHeight = $scope.toolbarheight * 3 + 'px';
				$scope.plusBottom = ($scope.toolbarheight * 3 - 28) + 'px';
				break;
			case 1:
				$scope.footerHeight = 0;
				$scope.plusBottom = '22px';
				$scope.noDetail = true;
				break;
			}
			$scope.$apply();
		},
		toolbarMove = function () {
			$scope.footerHeight = ($scope.toolbarheight * 3 - moveY + startY) + 'px';
			$scope.plusBottom = ($scope.toolbarheight * 3 - 28 - moveY + startY) + 'px';
			$scope.$apply();
		};

	$(function () {
		$('.floatingContainer').hover(function () {
			$('.subActionButton').addClass('display');
		}, function () {
			$('.subActionButton').removeClass('display');
		});
		$('.subActionButton').hover(function () {
			$(this).find('.floatingText').addClass('show');
		}, function () {
			$(this).find('.floatingText').removeClass('show');
		});

		$('.actionButton').hover(function () {
			$(this).find('.floatingText').addClass('show');
		}, function () {
			$(this).find('.floatingText').removeClass('show');
		});

		$('#toolbar').on('touchstart', function (e) {
			down = true;
			$(this).addClass('notransition');
			$('.floatingContainer').addClass('notransition');
		});

		$('#toolbar').on('mousedown', function (e) {
			down = true;
			$('#toolbar').addClass('notransition');
			$('.floatingContainer').addClass('notransition');
		});

		$('ion-pane').on('touchmove', function (e) {
			if (down) {
				moveY = e.originalEvent.changedTouches[0].clientY;
				if (startY === undefined) {
					startY = moveY;
				}
				move.push({
					y: moveY,
					t: e.timeStamp
				});
				now = new Date();
				toolbarMove();
			}
		});

		$('ion-pane').on('mousemove', function (e) {
			if (down) {
				moveY = e.originalEvent.clientY;
				if (startY === undefined) {
					startY = moveY;
				}
				move.push({
					y: moveY,
					t: e.timeStamp
				});
				now = new Date();
				toolbarMove();
			}
		});

		$('#toolbar').on('touchend', function (e) {
			if (down) {
				endY = e.originalEvent.changedTouches[0].clientY;
				calculateSwipe();
			}
		});

		$('#toolbar').on('mouseup', function (e) {
			if (down) {
				endY = e.originalEvent.clientY;
				calculateSwipe();
			}
		});
	})
})

.controller('SessionCtrl', function ($scope, $stateParams, Session, SERVER_PATH) {
	$scope.serverPath = SERVER_PATH;
	$scope.session = Session.get({
		sessionId: $stateParams.sessionId
	});

	$scope.push = function (event) {
		Notification.push({
			message: "Check out this session: " + $scope.session.title
		});
	}

	$scope.share = function (event) {
		openFB.api({
			method: 'POST',
			path: '/me/feed',
			params: {
				message: "I'll be attending: '" + $scope.session.title + "' by " +
					$scope.session.speaker
			},
			success: function () {
				alert('The session was shared on Facebook');
			},
			error: function () {
				alert('An error occurred while sharing this session on Facebook');
			}
		});
	};

});