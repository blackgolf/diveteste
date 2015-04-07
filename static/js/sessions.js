angular.module('conference.sessions', ['ngResource', 'conference.config', 'conference.push'])

// Routes
.config(function($stateProvider) {
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

.factory('Session', function($resource, SERVER_PATH) {
    return $resource(SERVER_PATH + '/sessions/:sessionId');
})

.controller('SessionListCtrl', function($ionicScrollDelegate, $rootScope, $timeout, $scope, $http, Session, PHP_SERVER, SERVER_PATH, getMeetup) {
    $scope.sessions = [];
    $scope.eventLoading = true;
    var reHTML = function(string) {
            return string;
        },
        page = 0,
        loadPage = function() {
            getMeetup
                .getEvent(page)
                .then(function(data) {
                    if (data) {
                        $scope.sessions = $rootScope.events;
                        angular.forEach($scope.sessions, function(session, index) {
                            session.description = reHTML(session.description);
                            var bgImg = getImage(session.description);
                            if (bgImg) {
                                session.photo_url = getImage(session.description);
                            } else {
                                session.backgroundColor = randomColor(0, index % 3);
                            }
                        });
                        page++;
                        $scope.eventLoading = false;
                    } else {
                        $timeout(function() {
                            loadPage();
                        }, 200);
                    }
                });
        },
        getImage = function(string) {
            var tempArr = string.split('<img');
            if (tempArr[1]) {
                tempArr2 = tempArr[1].split('src="');
                tempArr3 = tempArr2[1].split('"');
                return tempArr3[0];
            } else {
                return;
                // return SERVER_PATH + '/pics/' + ['017', 'Color-Check_09_12-1024x455', 'Color-Check_12-1024x455', 'Color-Check_14-1024x455', 'Color-Check_18-1024x455'][Math.floor(Math.random() * 5)] + '.jpg';
            }
        };
    loadPage();
    var startY, endY, moveY, now, down = false,
        move = [],
        dHeight = 240,
        calculateSwipe = function() {
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
                        if (gap / timegap < -0.3) {
                            detailFull();
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
        detailMove = function() {
            if ($scope.barHeight + startY - moveY > $(window).innerHeight()) {
                detailFull();
            }
            $scope.detailCSS = ($scope.barHeight + startY - moveY) + 'px';
            $scope.detailContentCSS = contentHeight(startY - moveY);
            if ($scope.barHeight + startY - moveY > $(window).innerHeight() - 15) {
                if ($scope.plusCSS !== '22px') {
                    $('.floatingContainer').removeClass('notransition');
                }
                $scope.plusCSS = '22px';
            } else {
                $('.floatingContainer').addClass('notransition');
                $scope.plusCSS = plusBottom(startY - moveY);
            };
            $scope.$apply();
        },
        detailFull = function() {
            moveY = $scope.barHeight + startY - $(window).innerHeight();
            $scope.plusCSS = '22px';
            $scope.detailFull = true;
            detailMove();
        },
        detailClose = function() {
            $scope.noDetail = true;
            $scope.detailCSS = 0;
            $scope.plusCSS = '22px';
            $scope.detailShown = false;
            calculateSize();
            checkScrollOver();
        },
        checkScrollOver = function() {
            if ($ionicScrollDelegate.getScrollPosition()) {
                var top = $ionicScrollDelegate.getScrollPosition().top,
                    bottom = $('ion-content>.scroll').height() - $('ion-content').height() - dHeight;
                if (top > bottom) {
                    $ionicScrollDelegate.scrollBottom(true);
                }
            }
        },
        contentHeight = function(gap) {
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
        plusBottom = function(gap) {
            if (!gap) {
                gap = 0;
            }
            $scope.plusBottom = ($scope.barHeight - 28 + gap);
            return $scope.plusBottom + 'px'
        },
        calculateSize = function() {
            if (window.innerHeight < 480) {
                $scope.barHeight = 80;
                $scope.landScape = true;
            } else {
                $scope.barHeight = dHeight;
                $scope.landScape = false;
            }
        },
        randomColor = function(scheme, index) {
            var schemeList = [
                    [
                        [40, 155, 184],
                        [241, 131, 116],
                        [32, 165, 126]
                    ]
                ],
                i = scheme /* ? scheme : Math.floor(Math.random() * schemeList.length)*/ ,
                j = index /* ? index : Math.floor(Math.random() * schemeList[i].length)*/ ;
            return 'rgba(' + schemeList[i][j][0] + ',' + schemeList[i][j][1] + ',' + schemeList[i][j][2] + ',' + 1 + ')';
        };
    detailClose();

    $scope.changeSession = function(session) {
        var access_token = localStorage.getItem('access_token');
        $scope.members = [];
        if ($scope.detailSession === session && $scope.detailShown) {
            $('#toolbar').removeClass('notransition');
            $('.floatingContainer').removeClass('notransition');
            detailClose();
        } else {
			$scope.members = session.members;        	
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

    $(function() {
        $('.subActionButton').hover(function() {
            $(this).find('.floatingText').addClass('show');
        }, function() {
            $(this).find('.floatingText').removeClass('show');
        });

        $('.actionButton').hover(function() {
            $(this).find('.floatingText').addClass('show');
        }, function() {
            $(this).find('.floatingText').removeClass('show');
        });

        $('#toolbar').on('touchstart', function(e) {
            down = true;
            $(this).addClass('notransition');
            $('.floatingContainer').addClass('notransition');
        });

        $('#toolbar').on('mousedown', function(e) {
            down = true;
            $('#toolbar').addClass('notransition');
            $('.floatingContainer').addClass('notransition');
        });

        $('ion-pane .item-thumbnail-left').on('touchmove', function(e) {
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
                $scope.detailFull = false;
                detailMove();
            }
        });

        $('ion-pane .item-thumbnail-left').on('mousemove', function(e) {
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
                $scope.detailFull = false;
                detailMove();
            }
        });

        $('#toolbar').on('touchend', function(e) {
            if (down) {
                endY = e.originalEvent.changedTouches[0].clientY;
                calculateSwipe();
            }
        });

        $('#toolbar').on('mouseup', function(e) {
            if (down) {
                endY = e.originalEvent.clientY;
                calculateSwipe();
            }
        });

        $(window).on('resize', function() {
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

.controller('SessionCtrl', function($scope, $stateParams, Session, SERVER_PATH) {
    $scope.serverPath = SERVER_PATH;
    $scope.session = Session.get({
        sessionId: $stateParams.sessionId
    });

    $scope.push = function(event) {
        Notification.push({
            message: "Check out this session: " + $scope.session.title
        });
    }

    $scope.share = function(event) {
        openFB.api({
            method: 'POST',
            path: '/me/feed',
            params: {
                message: "I'll be attending: '" + $scope.session.title + "' by " +
                    $scope.session.speaker
            },
            success: function() {
                alert('The session was shared on Facebook');
            },
            error: function() {
                alert('An error occurred while sharing this session on Facebook');
            }
        });
    };

});
