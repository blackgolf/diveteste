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
	var startY, endY, moveY, now, down = false,
		move = [],
		calculateSwipe = function () {
			$scope.barHeight += startY - moveY;
			for (i = 0; i < move.length; i++) {
				if (move[move.length - 1].t - move[i].t < 500) {
					var gap = move[move.length - 1].y - move[i].y;
					var timegap = move[move.length - 1].t - move[i].t;
					if (timegap > 0) {
						if (gap / timegap > 0.3) {
							detailClose();
							checkScrollOver();
							$scope.$apply();
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
		detailMove = function () {
			$scope.detailCSS = ($scope.barHeight + startY - moveY) + 'px';
			$scope.detailContentCSS = contentHeight(startY - moveY);
			$scope.plusCSS = plusBottom(startY - moveY);
			$scope.$apply();
		},
		detailClose = function () {
			$scope.noDetail = true;
			$scope.detailCSS = 0;
			$scope.plusCSS = '22px';
			$scope.detailShown = false;
			calculateSize();
			checkScrollOver();
		},
		checkScrollOver = function () {
			if ($ionicScrollDelegate.getScrollPosition()) {
				var top = $ionicScrollDelegate.getScrollPosition().top,
					bottom = $('ion-content>.scroll').height() - $('ion-content').height() - 285;
				if (top > bottom) {
					$ionicScrollDelegate.scrollBottom(true);
				}
			}
		},
		contentHeight = function (gap) {
			if (!gap) {
				gap = 0;
			}
			$scope.detailContentHeight = Math.floor(($scope.barHeight - 185 + gap) / 20) * 20;
			if ($scope.detailContentHeight > 0) {
				return $scope.detailContentHeight + 'px';
			} else {
				return 0;
			}
		},
		plusBottom = function (gap) {
			if (!gap) {
				gap = 0;
			}
			$scope.plusBottom = ($scope.barHeight - 28 + gap);
			return $scope.plusBottom + 'px'
		},
		calculateSize = function () {
			if (window.innerHeight < 480) {
				$scope.barHeight = 80;
				$scope.landScape = true;
			} else {
				$scope.barHeight = 285;
				$scope.landScape = false;
			}
		};
	detailClose();

	$scope.changeSession = function (session) {
		if ($scope.detailSession === session && $scope.detailShown) {
			$('#toolbar').removeClass('notransition');
			$('.floatingContainer').removeClass('notransition');
			detailClose();
		} else {
			$scope.detailSession = session;
			if (!$scope.detailShown) {
				$scope.noDetail = false;
				$scope.detailCSS = $scope.barHeight + 'px';
				$scope.detailContentCSS = contentHeight();
				$scope.plusCSS = plusBottom();
				$scope.detailShown = true;
			}
		}
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
				detailMove();
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
				detailMove();
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

		$(window).on('resize', function () {
			calculateSize();
			if (!$scope.detailShown) {
				$('#toolbar').removeClass('notransition');
				$('.floatingContainer').removeClass('notransition');
				detailClose();
			} else {
				$scope.noDetail = false;
				$scope.detailCSS = $scope.barHeight + 'px';
				$scope.detailContentCSS = contentHeight();
				$scope.plusCSS = plusBottom();
			}
			checkScrollOver();
			$scope.$apply();
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