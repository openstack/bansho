'use strict';

angular.module('adagios.view.dashboard', ['ngRoute',
                                          'adagios.tactical',
                                          'adagios.table',
                                          'adagios.live'
                                         ])

    .value('dashboardConfig', {})

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'DashboardCtrl'
        });
    }])

    .controller('DashboardCtrl', ['$scope', '$timeout', 'dashboardConfig', 'getServices', function ($scope, $timeout, dashboardConfig, getServices) {

        var fields = ['state'],
            filters = {'isnot' : { 'state' : ['0'] }},
            filters2 = {'isnot' : { 'state' : ['2'] }},
            apiName = 'hosts';

        $scope.dashboardTitle = dashboardConfig.title;
        $scope.dashboardCellsText = dashboardConfig.cellsText.join();
        $scope.dashboardCellsName = dashboardConfig.cellsName.join();
        $scope.dashboardApiName = dashboardConfig.apiName;
        $scope.dashboardFilters = dashboardConfig.filters;
        $scope.dashboardIsWrappable = dashboardConfig.isWrappable;
        $scope.dashboardNoRepeatCell = dashboardConfig.noRepeatCell;
        $scope.dashboardRefreshInterval = dashboardConfig.refreshInterval;

        $scope.filters2 = filters2;
        

        getServices(fields, filters, apiName)
            .success(function (data) {
                $scope.nbHostProblems = data.length;
            });

        $timeout(function() { console.log("CHANGE"); $scope.dashboardFilters = $scope.filters2; }, 5000);

    }])

    .run(['readConfig', 'dashboardConfig', function (readConfig, dashboardConfig) {
        dashboardConfig.title = readConfig.data.dashboardConfig.title;
        dashboardConfig.cellsText = readConfig.data.dashboardConfig.cells.text;
        dashboardConfig.cellsName = readConfig.data.dashboardConfig.cells.name;
        dashboardConfig.apiName = readConfig.data.dashboardConfig.apiName;
        dashboardConfig.filters = readConfig.data.dashboardConfig.filters;
        dashboardConfig.isWrappable = readConfig.data.dashboardConfig.isWrappable;
        dashboardConfig.noRepeatCell = readConfig.data.dashboardConfig.noRepeatCell;
        dashboardConfig.refreshInterval = readConfig.data.dashboardConfig.refreshInterval;
    }]);
