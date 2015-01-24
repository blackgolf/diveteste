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

.controller('SessionListCtrl', function ($ionicScrollDelegate, $scope, $timeout, Session, SERVER_PATH) {
	var startX, endX, moveX, startY, endY, moveY, now, down = false,
		topCss, bottomCss, leftCss, rightCss, leftSpace, rightSpace, topSpace, bottomSpace,
		move = [],
		// Check if the device is portrait (true) or landscape (false)
		portrait = function () {
			if (window.innerHeight > window.innerWidth) {
				return true;
			}
			return false;
		},
		// User mouse/finger position and speed to calculate the event, it can be "swipe left/right : up/down"
		calculateSwipe = function () {
			var widthSpace = window.innerWidth - $('#toolbar').width() - 32,
				heightSpace = window.innerHeight - $('#toolbar').height();
			if ($('#toolbar').css('top')) {
				topCss = $('#toolbar').css('top').split('px')[0];
			}
			if ($('#toolbar').css('bottom')) {
				bottomCss = $('#toolbar').css('bottom').split('px')[0];
			}
			if ($('#toolbar').css('left')) {
				leftCss = $('#toolbar').css('left').split('px')[0];
			}
			if ($('#toolbar').css('right')) {
				rightCss = $('#toolbar').css('right').split('px')[0];
			}
			if (Number(topCss)) {
				topSpace = Number(topCss);
				bottomSpace = heightSpace - topSpace;
			}
			if (Number(bottomCss)) {
				bottomSpace = Number(bottomCss);
				topSpace = heightSpace - bottomSpace;
			}
			if (Number(leftCss)) {
				leftSpace = Number(leftCss);
				rightSpace = widthSpace - leftSpace;
			}
			if (Number(rightCss)) {
				rightSpace = Number(rightCss);
				leftSpace = widthSpace - rightSpace;
			}
			for (i = 0; i < move.length; i++) {
				if (move[move.length - 1].t - move[i].t < 500) {
					var xOrient, yOrient, yGap = move[move.length - 1].y - move[i].y,
						xGap = move[move.length - 1].x - move[i].x,
						timeGap = move[move.length - 1].t - move[i].t;
					if (timeGap > 0) {
						if (xGap / timeGap > 0.05) {
							// right
							xOrient = 1;
						} else if (xGap / timeGap < -0.05) {
							// left
							xOrient = -1;
						} else {
							xOrient = 0;
						}
						if (yGap / timeGap > 0.05) {
							// down
							yOrient = 1;
						} else if (yGap / timeGap < -0.05) {
							// up
							yOrient = -1;
						} else {
							yOrient = 0;
						}
						swipe(xOrient, yOrient);
					}
					break;
				}
			}
			down = false;
			startX = undefined;
			startY = undefined;
			move = [];
			$('#toolbar').removeClass('notransition');
			$('.floatingContainer').removeClass('notransition');
		},
		// Restore, close detail area base on the mouse/finger event
		swipe = function (xOrient, yOrient) {
			switch ($scope.stick) {
			case 'top':
				switch (yOrient) {
				case -1:
					detailClose();
					checkScrollOut();
					break;
				default:
					if ($scope.stick === 'top' && bottomSpace < 0) {
						$scope.stick = 'bottom';
					}
					detailOpen();
					break;
				}
				break;
			case 'bottom':
				switch (yOrient) {
				case 1:
					detailClose();
					checkScrollOut();
					break;
				default:
					if ($scope.stick === 'bottom' && topSpace < 44) {
						$scope.stick = 'top';
					}
					detailOpen();
					break;
				}
				break;
			case 'left':
				switch (xOrient) {
				case -1:
					detailClose();
					checkScrollOut();
					break;
				default:
					if ($scope.stick === 'left' && rightSpace < 0) {
						$scope.stick = 'right';
					}
					detailOpen();
					break;
				}
				break;
			case 'right':
				switch (xOrient) {
				case 1:
					detailClose();
					checkScrollOut();
					break;
				default:
					if ($scope.stick === 'right' && leftSpace < 0) {
						$scope.stick = 'left';
					}
					detailOpen();
					break;
				}
				break;
			}
			$scope.$apply();
		},
		// Move, resize the detail area when mouse/finger move
		detailMove = function () {
			switch ($scope.stick) {
			case 'top':
				$scope.detailArea = {
					'height': '285px',
					'width': '100%',
					'top': (44 + moveY - startY) + 'px',
					'right': 'auto',
					'bottom': 'auto',
					'left': 'auto',
					'padding-top': 0
				};
				$scope.plusPosition = {
					'top': (354 + moveY - startY) + 'px',
					'right': '22px',
					'bottom': 'auto',
					'left': 'auto'
				};
				break;
			case 'bottom':
				$scope.detailArea = {
					'height': '285px',
					'width': '100%',
					'top': 'auto',
					'right': 'auto',
					'bottom': (startY - moveY) + 'px',
					'left': 'auto',
					'padding-top': 0
				};
				$scope.plusPosition = {
					'top': 'auto',
					'right': '22px',
					'bottom': (259 - moveY + startY) + 'px',
					'left': 'auto'
				};
				break;
			case 'left':
				$scope.detailArea = {
					'height': '100%',
					'width': '320px',
					'top': 'auto',
					'right': 'auto',
					'bottom': 'auto',
					'left': (moveX - startX) + 'px',
					'padding-top': '44px'
				};
				$scope.plusPosition = {
					'top': 'auto',
					'right': 'auto',
					'bottom': '22px',
					'left': (348 + moveX - startX) + 'px'
				};
				break;
			case 'right':
				$scope.detailArea = {
					'height': '100%',
					'width': '320px',
					'top': 'auto',
					'right': (startX - moveX) + 'px',
					'bottom': 'auto',
					'left': 'auto',
					'padding-top': '44px'
				};
				$scope.plusPosition = {
					'top': 'auto',
					'right': (294 - moveX + startX) + 'px',
					'bottom': '22px',
					'left': 'auto'
				};
				break;
			}
			$scope.$apply();
		},
		// Close the detail area
		detailClose = function () {
			$scope.noDetail = true;
			switch ($scope.stick) {
			case 'top':
				$scope.detailArea = {
					'height': '285px',
					'width': '100%',
					'top': '-241px',
					'right': 'auto',
					'bottom': 'auto',
					'left': 'auto',
					'padding-top': 0
				};
				$scope.plusPosition = {
					'top': '122px',
					'right': '22px',
					'bottom': 'auto',
					'left': 'auto'
				};
				break;
			case 'bottom':
				$scope.detailArea = {
					'height': '285px',
					'width': '100%',
					'top': 'auto',
					'right': 'auto',
					'bottom': '-285px',
					'left': 'auto',
					'padding-top': 0
				};
				$scope.plusPosition = {
					'top': 'auto',
					'right': '22px',
					'bottom': '22px',
					'left': 'auto'
				};
				break;
			case 'left':
				$scope.detailArea = {
					'height': '100%',
					'width': '320px',
					'top': 'auto',
					'right': 'auto',
					'bottom': 'auto',
					'left': '-320px',
					'padding-top': '44px'
				};
				$scope.plusPosition = {
					'top': 'auto',
					'right': 'auto',
					'bottom': '22px',
					'left': '68px'
				};
				break;
			case 'right':
				$scope.detailArea = {
					'height': '100%',
					'width': '320px',
					'top': 'auto',
					'right': '-320px',
					'bottom': 'auto',
					'left': 'auto',
					'padding-top': '44px'
				};
				$scope.plusPosition = {
					'top': 'auto',
					'right': '22px',
					'bottom': '22px',
					'left': 'auto'
				};
				break;
			}
			$scope.detailShown = false;
		},
		// Open the detail area
		detailOpen = function () {
			switch ($scope.stick) {
			case 'top':
				$scope.detailArea = {
					'height': '285px',
					'width': '100%',
					'top': '44px',
					'right': 'auto',
					'bottom': 'auto',
					'left': 'auto',
					'padding-top': 0
				};
				$scope.plusPosition = {
					'top': '354px',
					'right': '22px',
					'bottom': 'auto',
					'left': 'auto'
				};
				break;
			case 'bottom':
				$scope.detailArea = {
					'height': '285px',
					'width': '100%',
					'top': 'auto',
					'right': 'auto',
					'bottom': 0,
					'left': 'auto',
					'padding-top': 0
				};
				$scope.plusPosition = {
					'top': 'auto',
					'right': '22px',
					'bottom': '259px',
					'left': 'auto'
				};
				break;
			case 'left':
				$scope.detailArea = {
					'height': '100%',
					'width': '320px',
					'top': 'auto',
					'right': 'auto',
					'bottom': 'auto',
					'left': 0,
					'padding-top': '44px'
				};
				$scope.plusPosition = {
					'top': 'auto',
					'right': 'auto',
					'bottom': '22px',
					'left': '348px'
				};
				break;
			case 'right':
				$scope.detailArea = {
					'height': '100%',
					'width': '320px',
					'top': 'auto',
					'right': 0,
					'bottom': 'auto',
					'left': 'auto',
					'padding-top': '44px'
				};
				$scope.plusPosition = {
					'top': 'auto',
					'right': '294px',
					'bottom': '22px',
					'left': 'auto'
				};
				break;
			}
		},
		// Check if the content is scroll out of the screen (happen when the detail area is opened, the content area is scrolled to top/bottom, then the detail area is closed)
		checkScrollOut = function () {
			var top = $ionicScrollDelegate.getScrollPosition().top,
				bottom = $('ion-content>.scroll').height() - $('ion-content').height() - 285;
			if (top > bottom) {
				$ionicScrollDelegate.scrollBottom(true);
			}
		},
		// Action when the detail area is touched/pressed
		detailEventDown = function () {
			down = true;
			$('#toolbar').addClass('notransition');
			$('.floatingContainer').addClass('notransition');
		},
		// Action when the detail area is being dragged
		detailEventMove = function (e) {
			if (startX === undefined) {
				startX = moveX;
				startY = moveY;
			}
			move.push({
				x: moveX,
				y: moveY,
				t: e.timeStamp
			});
			detailMove();
		};
	$scope.detailArea = {
		'height': 0,
		'width': 0,
		'top': 'auto',
		'right': 'auto',
		'bottom': 'auto',
		'left': 'auto'
	};
	$scope.plusPosition = {
		'top': 'auto',
		'right': 'auto',
		'bottom': 'auto',
		'left': 'auto'
	};
	if (portrait()) {
		$scope.stick = 'bottom';
	} else {
		$scope.stick = 'right';
	}
	detailClose();
	$scope.serverPath = SERVER_PATH;
	$scope.sessions = Session.query();
	$scope.sessions.$promise.then(function () {
		$scope.detailSession = $scope.sessions[0];
	});
	$scope.toolbarheight = 285;
	$scope.changeSession = function (session) {
		if ($scope.detailSession === session && $scope.detailShown) {
			$('#toolbar').removeClass('notransition');
			$('.floatingContainer').removeClass('notransition');
			detailClose();
			checkScrollOut();
		} else {
			$scope.noDetail = false;
			$scope.detailSession = session;
			$scope.detailShown = true;
			detailOpen();
		}
	};

	$(function () {
		// Plus button group events
		(function () {
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
		}).call(this);

		// Detail area mouse/finger events
		$('#toolbar').on('touchstart', function (e) {
			detailEventDown();
		});

		$('#toolbar').on('mousedown', function (e) {
			detailEventDown();
		});

		$('ion-pane').on('touchmove', function (e) {
			if (down) {
				moveX = e.originalEvent.changedTouches[0].clientX;
				moveY = e.originalEvent.changedTouches[0].clientY;
				detailEventMove(e);
			}
		});

		$('ion-pane').on('mousemove', function (e) {
			if (down) {
				moveX = e.originalEvent.clientX;
				moveY = e.originalEvent.clientY;
				detailEventMove(e);
			}
		});

		$('#toolbar').on('touchend', function (e) {
			if (down) {
				endX = e.originalEvent.changedTouches[0].clientX;
				endY = e.originalEvent.changedTouches[0].clientY;
				calculateSwipe();
			}
		});

		$('#toolbar').on('mouseup', function (e) {
			if (down) {
				endX = e.originalEvent.clientX;
				endY = e.originalEvent.clientY;
				calculateSwipe();
			}
		});

		$(window).on("resize", function (event) {
			if (!$scope.detailShown) {
				$('#toolbar').addClass('notransition');
				$('.floatingContainer').addClass('notransition');
				detailClose();
				$('#toolbar').removeClass('notransition');
				$('.floatingContainer').removeClass('notransition');
			} else {
				detailOpen();
				checkScrollOut();
			}
			$timeout(function () {
				$('#toolbar').hide();
				if (portrait()) {
					$scope.stick = 'bottom';
				} else {
					$scope.stick = 'right';
				}
				detailClose();
				$timeout(function () {
					$('#toolbar').show();
				});
			}, 300);
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