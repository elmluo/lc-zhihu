'use strict';

/**
 * @ngdoc overview
 * @name zhihuApp
 * @description
 * # zhihuApp
 *
 * Main module of the application.
 */
(function () {
    angular
        .module('zhihuApp', [
            'ngAnimate',
            'ngAria',
            'ngCookies',
            'ngMessages',
            'ngResource',
            // 'ngRoute',
            'ngSanitize',
            'ngTouch',
            'ui.router'
        ])
        // .config(function ($routeProvider) {
        //   $routeProvider
        //     .when('/', {
        //       templateUrl: 'views/main.html',
        //       controller: 'MainCtrl',
        //       controllerAs: 'main'
        //     })
        //     .otherwise({
        //       redirectTo: '/'
        //     });
        // });
        .config(['$interpolateProvider', '$stateProvider', '$urlRouterProvider', function ($interpolateProvider, $stateProvider, $urlRouterProvider) {
            /**
             * 解决和laraval中{{}}的冲突；
             */
            $interpolateProvider.startSymbol('[[');
            $interpolateProvider.endSymbol(']]');

            /**
             * ur.router实现路由
             */
            $urlRouterProvider.otherwise('/home');
            $stateProvider
                .state('home', { //这个名称用在ui-sref链接页面当中
                    url: '/home',
                    templateUrl: 'views/main.html'
                })
                .state('signup', {
                    url: '/signup',
                    templateUrl: 'views/signup.html',
                    controller: 'SignupController'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: 'views/login.html'
                })
                .state('connect', {
                    url: '/connect',
                    template: '<h1>联系</h1>'
                });
        }])

        /**
         * 用户注册模块儿
         */
        .service('UserService', [function () {
            var me = this;

            /**
             * 可以不去指定数据对象，angular会自动创建,
             * 创建这个对象时为了明确我们这里需要用到,
             * 对于这个数据对象里面的具体键值对，不用创建，在view直接用就可以
             */
            me.signup_data = {};

            me.signup = function () {
                console.log('已发送注册请求');
            }
        }])
        .controller('SignupController', ['$scope', 'UserService', function ($scope, UserService) {
            // 传入service，这样$scope,对应管辖html中都可以使用服务里面定义的方法
            $scope.User = UserService;

        }]);

})();

