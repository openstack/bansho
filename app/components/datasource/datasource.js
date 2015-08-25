'use strict';

angular.module('bansho.datasource', ['bansho.surveil'])
    .value('tableGlobalConfig', {'cellToFieldsMap': {}, 'cellWrappableField': {}})

    .service('datasource', ['$filter', 'surveilStatus', 'surveilConfig', 'surveilQuery', 'componentsConfig', 'tableGlobalConfig', 'configManager',
        function ($filter, surveilStatus, surveilConfig, surveilQuery, componentsConfig, tableGlobalConfig, configManager) {
            var providerServices = {
                    status: surveilStatus,
                    config: surveilConfig
                },
                config = [],
                data = [],
                filteredData = [],
                listeners = [];

            function notifyDataChanged(datasourceId) {
                angular.forEach(listeners[datasourceId], function (callback) {
                    callback(filteredData[datasourceId], config[datasourceId].isCheckAll);
                });
            }

            function filterData(datasourceId) {
                filteredData[datasourceId] = $filter('filter')(data[datasourceId], config[datasourceId].searchFilter);
                notifyDataChanged(datasourceId);
            }

            function refreshTableData(datasourceId) {
                var conf = config[datasourceId],
                    inputSource = componentsConfig.getInputSource(conf.inputSource),
                    filter = componentsConfig.getFilter(inputSource.filter).filter,
                    promise;

                if (config[datasourceId].queryFilter) {
                    filter = componentsConfig.mergeFilters([config[datasourceId].queryFilter, filter]);
                }

                promise = providerServices[inputSource.provider].getDataFromInputSource([], inputSource, null, {count: false}, conf.queryPaging);

                promise.then(function (newData) {
                    data[datasourceId] = newData;
                    config[datasourceId].isCheckAll = false;
                    filterData(datasourceId);
                }, function (error) {
                    throw new Error('getTableData : Query failed' + error);
                });
            }

            return {
                refreshTableData: refreshTableData,
                addTable: function (datasourceId, conf) {
                    config[datasourceId] = conf;
                    config[datasourceId].requestFields = [];
                    angular.forEach(config[datasourceId].columns, function (cell) {
                        angular.forEach(tableGlobalConfig.cellToFieldsMap[cell], function (_value) {
                            config[datasourceId].requestFields.push(_value);
                        });
                    });

                    if (config[datasourceId].pagingbar) {
                        config[datasourceId].queryPaging = {
                            page: 0,
                            size: configManager.getPagingSize()
                        };
                    }
                },
                getConfig: function (datasourceId) {
                    return config[datasourceId];
                },
                forEachCheckedEntry: function (datasourceId, callbackIsChecked) {
                    angular.forEach(filteredData[datasourceId], function (entry) {
                        if (entry.is_checked) {
                            callbackIsChecked(entry);
                        }
                    });

                    notifyDataChanged(datasourceId);
                },
                registerDataChanged: function (datasourceId, callback) {
                    if (!listeners[datasourceId]) {
                        listeners[datasourceId] = [];
                    }

                    listeners[datasourceId].push(callback);
                },
                isAllCheckedTable: function (datasourceId) {
                    var isAllChecked = true;
                    angular.forEach(filteredData[datasourceId], function (entry) {
                        if (!entry.is_checked) {
                            isAllChecked = false;
                        }
                    });

                    return isAllChecked;
                },
                setAllCheckTable: function (datasourceId, isChecked) {
                    config[datasourceId].isCheckAll = isChecked;
                    angular.forEach(filteredData[datasourceId], function (entry) {
                        entry.is_checked = isChecked;
                    });

                    notifyDataChanged(datasourceId, isChecked);
                },
                setSearchFilter: function (datasourceId, searchFilter) {
                    config[datasourceId].searchFilter = searchFilter;
                    filterData(datasourceId);
                },
                setQueryFilter: function (datasourceId, queryFilter) {
                    config[datasourceId].queryFilter = queryFilter;
                    refreshTableData(datasourceId);
                },
                nextPage: function (datasourceId) {
                    config[datasourceId].queryPaging.page += 1;
                    refreshTableData(datasourceId);
                },
                previousPage: function (datasourceId) {
                    if (config[datasourceId].queryPaging.page > 0) {
                        config[datasourceId].queryPaging.page -= 1;
                        refreshTableData(datasourceId);
                    }
                },
                getPage: function (datasourceId) {
                    return config[datasourceId].queryPaging.page;
                },
                setPageSize: function (datasourceId, pageSize) {
                    config[datasourceId].queryPaging.size = pageSize;
                    refreshTableData(datasourceId);
                },
                getPageSize: function (datasourceId) {
                    return config[datasourceId].queryPaging.size;
                }
            };
        }])

    .service('sharedData', ['templateManager', 'surveilStatus', 'surveilConfig', 'componentsConfig',
        function (templateManager, surveilStatus, surveilConfig, componentsConfig) {
            var providers = {
                    status: surveilStatus,
                    config: surveilConfig
                },
                sharedData = {},
                listeners = {};

            var notifyListeners = function (key) {
                angular.forEach(listeners[key], function (onChange) {
                    onChange(sharedData[key]);
                });
            };

            return {
                getDataFromInputSource: function (source, isCount, keys, onChange) {
                    if (listeners[source + isCount] === undefined) {
                        listeners[source + isCount] = [onChange];

                        var inputSource = componentsConfig.getInputSource(source);

                        providers[inputSource.provider].getDataFromInputSource([], inputSource, keys, {count: isCount})
                            .then(function (newData) {
                                sharedData[source + isCount] = newData;
                                notifyListeners(source + isCount);
                            }, function (error) {
                                throw new Error('getTableData : Query failed' + error);
                            })
                    } else {
                        listeners[source + isCount].push(onChange);
                        notifyListeners(source + isCount);
                    }

                    return sharedData[source + isCount];
                }
            };
        }]);
