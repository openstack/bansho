'use strict';

angular.module('adagios.view.singleTable', ['ngRoute',
                                            'adagios.tactical.status_overview',
                                            'adagios.tactical.current_health',
                                            'adagios.tactical.top_alert_producers',
                                            'adagios.table'
                                           ])

    .value('singleTableConfig', {})

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/singleTable', {
            templateUrl: 'single_table/single_table.html',
            controller: 'SingleTableCtrl'
        });
    }])

    .controller('SingleTableCtrl', ['$scope', '$routeParams', 'singleTableConfig', 'tableConfig',
        function ($scope, $routeParams, singleTableConfig, tableConfig) {
            var viewName = "";

            tableConfig.index = 0;

            if (!!$routeParams.view) {
                viewName = $routeParams.view;
            } else {
                throw new Error("ERROR : 'view' GET parameter must be the custom view name");
            }

            function TableConfig(config) {
                this.title = config.title;
                this.CellsText = config.cells.text.join();
                this.CellsName = config.cells.name.join();
                this.ApiName = config.apiName;
                this.Filters = config.filters;
                this.IsWrappable = config.isWrappable;
                this.NoRepeatCell = config.noRepeatCell;
            }

            $scope.tableConfig = new TableConfig(singleTableConfig[viewName].components[0].config);

            $scope.singleTableTitle = singleTableConfig[viewName].title;
            $scope.singleTableRefreshInterval = singleTableConfig[viewName].refreshInterval;
        }])

    .run(['readConfig', 'singleTableConfig', function (readConfig, singleTableConfig) {
        var viewsConfig = readConfig.data;

        angular.forEach(viewsConfig, function (config, view) {
            if (config.template === "singleTable") {
                singleTableConfig[view] = config;
            }
        });
    }]);
