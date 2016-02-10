// directive to allocate and reallocate team members
disclosure.directive('allocateTeamMembers', function () {
    return {
        restrict: "EA",
        templateUrl: "templates/allocate-team.html",
        controller: ['$scope', 'getTeamMembersFactory', 'commitMembersFactory', 'savedSearchDetailFactory', 'pushMembersFactory', 'searchProgressFactory', 'reAllocateWorkFactory', 'getAvailableMembers',
        function($scope, getTeamMembersFactory, commitMembersFactory, savedSearchDetailFactory, pushMembersFactory, searchProgressFactory, reAllocateWorkFactory, getAvailableMembers) {
            $scope.teamMembers = '';
            $scope.availableMembers = '';
            $scope.savedSearchId = $scope.queryId;
            $scope.resultsCount = savedSearchDetailFactory.resultCount;
            $scope.addedMemberCount = 0;
            $scope.averageBatch = 0;
            $scope.inProgress = false;
            $scope.teamProgress ='';
            getTeamMembersFactory.getMembers();

            // if members have been assigned we will show that panel only
            searchProgressFactory.get($scope.savedSearchId);

            $scope.$watch(function(){
                return searchProgressFactory.list;
            }, function(newVal, oldVal){
                 if(newVal != oldVal){
                    if(newVal.assignments[0].assignee != null) {
                        $scope.inProgress = true;
                        $scope.teamProgress = newVal.assignments;
                        $scope.addedMemberCount = newVal.assignments.length;
                        $scope.percentageComplete = newVal.completionPercent;
                    }
                 }
            });

            $scope.$watch(function(){
                return pushMembersFactory.status;
            }, function(newVal, oldVal){
                if(newVal != oldVal){
                    setTimeout(function(){
                        searchProgressFactory.get($scope.savedSearchId);
                        notifications.show(notifications.settings.pluralMembersAdded, 'success');
                    }, 1500);
                }
            });

            $scope.$watch(function(){
                return pushMembersFactory.status;
            }, function(newVal, oldVal){
                if(newVal == true){
                    $scope.inProgress = newVal;
                    searchProgressFactory.get($scope.savedSearchId);
                }
            });

            $scope.$watch(function(){
                return getTeamMembersFactory.list;
            }, function(newVal, oldVal){
                if(newVal != oldVal){
                    $scope.teamMembers = newVal;
                }
            });

            $scope.$watch(function(){
                return savedSearchDetailFactory.resultCount;
            }, function (newVal, oldVal){
                if(newVal) {
                    $scope.resultsCount = newVal;
                }
            });

            $scope.membersBatch = '';
            $scope.$watch(function(){
                return commitMembersFactory.list;
            }, function (newVal, oldVal){
                if(newVal != oldVal) {
                    $scope.membersBatch = newVal;
                }
            });

            // add members here to be saved to the db
            $scope.addedMembersBundle = {
                "savedSearchId": $scope.savedSearchId,
                "users": []
            };

            // on 'next' we count the checked boxes make a json call to get row details.
            $scope.addMembers = function () {
                angular.forEach(angular.element('.team-member input:checkbox:checked'), function (value, key) {
                    var item = angular.element(value);
                    var objectName = item.attr('id');

                    $scope.addedMembersBundle.users.push(objectName)
                    $scope.addedMemberCount++;
                });

                $scope.averageBatch = Math.floor(parseInt($scope.resultsCount) / parseInt($scope.addedMemberCount));
                commitMembersFactory.commit($scope.addedMembersBundle);
            }

            $scope.pushMembers = function () {
                pushMembersFactory.push($scope.addedMembersBundle, $scope.savedSearchId);
            }

            // add a member to the right hand side of the list
            $scope.selectMember = function ($event) {
                dragDrop.settings.draggedMember = $($event.target); // now a jquery object
                dragDrop.addMember();
            }

            // remove a member from the right hand side of the list
            $scope.removeMember = function ($event) {
                dragDrop.removeMember($($event.target)); // passing a jquery object
            }

            // resets the members count and added members list,
            // therefore displaying the initial add members page.
            $scope.editMembers = function () {
                $scope.addedMemberCount = 0;
                $scope.addedMembersBundle.users = [];
            }

            // re-allocates the users work to whoever is selected
            $scope.reAllocateWork = function () {

                // add members to take on re-allocated work
                var reAllocateWorkBundle = {
                    "assignmentId": $scope.reassignMember.assignmentId,
                    "users": []
                };
                angular.forEach(angular.element('.reallocate input:checkbox:checked'), function (value, key) {
                    var item = angular.element(value);
                    var objectName = item.attr('id');
                    reAllocateWorkBundle.users.push(objectName)
                });

                reAllocateWorkFactory.push(reAllocateWorkBundle);
            }

            $scope.$watch(function(){
                return reAllocateWorkFactory.status;
            }, function(newVal, oldVal){
                if(newVal != oldVal){
                    workReAllocated();
                }
            });

            $scope.$watch(function(){
                return getAvailableMembers.list;
            }, function(newVal, oldVal){
                $scope.availableMembers = getAvailableMembers.list;
            });

            // hides lightbox, shows success and unchecks list when members are re-allocated
            var workReAllocated = function () {
                setTimeout(function(){
                    searchProgressFactory.get($scope.savedSearchId);
                    notifications.show(notifications.settings.batchReassigned, 'success');
                    lightbox.hide();
                    angular.forEach(angular.element('.reallocate input:checkbox'), function (value, key){
                        angular.element(value).removeAttr('checked');
                    });
                }, 1500);
            }

            // re-allocate member after the original member has been assigned
            $scope.reassignMember = '';
            $scope.reallocateWorkLightbox = function (member) {
                $scope.reassignMember = member;
                getAvailableMembers.get($scope.savedSearchId);
                lightbox.build();
            }

            // re-allocate member after the original member has been assigned
            $scope.closeReallocateWorkLightbox = function () {
                lightbox.hide();
            }

            toggleContainers.init();
            dragDrop.init();
        }]
    }
});

//directive for a generic paginated table
disclosure.directive('paginatedTable', function () {
    return {
        restrict: "EA",
        scope: {
            sortFn: '&', // Function to sort the table
            pageFn: '&', // Function to get a page for the table
            previewFn: '&', // Function to preview content for the table
            dataset: '=',
            headings: '=',
            resultsCount: '=',
            taskset: '=',
            updateTaskFn: '&',
            reviewOptions: '=',
            assignmentEnabled: '='
        },
        templateUrl: "templates/paginated-table.html",
        controller: ['$scope', 'ngTableParams', 'rowsDisplayed', 'assignmentsFactory',
        function($scope, ngTableParams, rowsDisplayed, assignmentsFactory){

            console.log($scope.reviewOptions);
            console.log("TASKSET" + $scope.taskset);
            //Dataset
            //For sorting
            $scope.lastSortedField = "";
            $scope.sortAsc = false;

            //For pagination
            $scope.pageNum = 1;
            $scope.pageMax = 100;
            $scope.pageSize = 100;
            $scope.pageOptions = rowsDisplayed;
            $scope.rowStart = 1;
            $scope.rowEnd = 100;

            $scope.tableParams = new ngTableParams({}, { dataset: $scope.formattedResults});

            $scope.getPage = function(pageNumber, pageSize){
                savedSearchDetailFactory.getSavedSearchDetails($scope.searchId, pageNumber, pageSize);
            }

            $scope.changeStatus = function(reviewStatus, taskid){
                $scope.updateTaskFn()(reviewStatus, taskid,
                function(){
                   console.log("success");
                },
                function(){
                    console.log("failed to update " + taskid);
                });
            }

            $scope.sort = function(field) {

                toggleColumns.showAll();

                //dataset should be bound so should update automatically
                if($scope.sortFn()){
                    if(field === $scope.lastSortedField){
                        // if we click on the same field then reverse the direction
                        $scope.sortAsc = !$scope.sortAsc;
                    }else{
                        // reset sorting to ascending
                        $scope.sortAsc = true;
                    }

                    $scope.lastSortedField = field;
                    $scope.sortFn()($scope.pageNum, $scope.pageSize, field, $scope.sortAsc ? 'asc' : 'desc');
                }
            }

            $scope.getClass = function (fieldName) {
                return (fieldName == $scope.lastSortedField) ? ($scope.sortAsc ? 'asc' : 'desc') : '';
            }

            $scope.callPreview = function (previewButton) {
                $scope.previewFn()(previewButton);
            }

            $scope.$watch('pageNum', function (newVal, oldVal){
                console.log("Changed page  to " + newVal);
                if(newVal != oldVal) {
                    $scope.pageFn()(newVal, $scope.pageSize);
                }
            });

            $scope.$watch('resultsCount',
            function (newVal, oldVal){
                if(newVal) {
                    $scope.resultsCount = newVal;
                    $scope.pageMax = ($scope.pageSize == 0 ? 1 :  Math.ceil($scope.resultsCount / $scope.pageSize));
                }
            });

             $scope.$watch('pageSize', function(newVal, oldVal){
                console.log(newVal);
                if(newVal != oldVal) {
                    $scope.pageNum = 1;
                    $scope.pageFn()($scope.pageNum, newVal);
                    $scope.pageMax = (newVal == 0 ? 1 : Math.ceil($scope.resultsCount / newVal));
                }
            });
        }]
    }
})

// directive for the search results table
disclosure.directive('resultsTable', function () {
    return {
        restrict: "EA",
        scope:{
            sortFn: '&',
            pageFn: '&',
            dataset: '='
        },
        templateUrl: "templates/results-table.html",
        controller: ['$scope', '$sce', 'formSearchFactory', 'formSearchInputFactory', 'previewFactory', 'tableHeadings', 'ngTableParams', 'savedSearchesFactory',
        function($scope, $sce, formSearchFactory, formSearchInputFactory, previewFactory, tableHeadings, ngTableParams, savedSearchesFactory){
            $scope.formattedResults = formSearchFactory.formatted;
        	$scope.resultFields = tableHeadings;
            $scope.resultsCount = formSearchFactory.totalHits;
            $scope.rowStart = 1;
            $scope.rowEnd = 100;
            $scope.lastFormattedSearch = formSearchFactory.lastSearch; // last formatted search sent off to elastic
            var tempPageNumber = 1;
            var tempPageSize = 100;

            $scope.sortResults = function(pageNumber, pageSize, field, direction){
                formSearchFactory.rerunSearch(pageNumber, pageSize, field, direction);
            }

            $scope.getPage = function(pageNumber, pageSize){

                tempPageNumber = pageNumber;
                tempPageSize = pageSize;

                formSearchFactory.rerunSearch(pageNumber, pageSize);
            }

            $scope.saveSearch = function(){
                if(formSearchFactory.lastSearch){
                    savedSearchesFactory.saveSearch(formSearchFactory.lastSearch);
                }else{
                    console.log("Nothing to save");
                    notifications.show(notifications.settings.saveSearchNoChange, 'error');
                }
            }

            $scope.$watch(function(){
                return formSearchFactory.totalHits;
            }, function (newVal, oldVal){
                if(newVal) {
                    $scope.resultsCount = newVal;
                }
            });

            $scope.$watch(function(){
                return formSearchFactory.formatted;
            }, function (newVal, oldVal){
                if(newVal != oldVal) {
                    $scope.formattedResults = newVal;
                    $scope.rowStart = ((tempPageNumber - 1) * tempPageSize) + 1;
                    $scope.rowEnd = tempPageNumber * tempPageSize;
                    if($scope.rowEnd > $scope.resultsCount) {
                        $scope.rowEnd = $scope.resultsCount;
                    }
                    debugger;
                } else {
                    $scope.formattedResults = [];
                }
            });

            $scope.callPreview = function (preview) {
                var documentId = preview;
                previewFactory.getPreview(documentId, formSearchFactory.lastSearch);
                previewDocument.build();
            }
        }],
        link: function (scope, iElement, iAttrs) {}
    }
});

disclosure.directive('savedSearchResultsTable', function () {
    return {
        restrict: "EA",
        scope:{
            searchId: '='
        },
        templateUrl: "templates/saved-search-table.html",
        controller: ['$scope', '$sce', 'savedSearchDetailFactory', 'searchProgressFactory', 'previewFactory', 'tableHeadings', 'savedSearchesFactory', 'formSearchFactory', 'formSearchInputFactory', 'getUserFactory',
        function($scope, $sce, savedSearchDetailFactory, searchProgressFactory, previewFactory, tableHeadings, savedSearchesFactory, formSearchFactory, formSearchInputFactory, getUserFactory){

            $scope.formattedResults = savedSearchDetailFactory.result;
            $scope.resultFields = tableHeadings;
            $scope.resultsCount = savedSearchDetailFactory.resultCount;
            $scope.rowStart = 1;
            $scope.rowEnd = 100;
            $scope.userId = getUserFactory.Id;
            $scope.sortResults = undefined;
            var tempPageNumber = 1;
            var tempPageSize = 100;

            $scope.getPage = function(pageNumber, pageSize){
                tempPageNumber = pageNumber;
                tempPageSize = pageSize;
                savedSearchDetailFactory.getSavedSearchDetails($scope.searchId, pageNumber, pageSize);
            }

            // export search link to pdf
            $scope.exportSearch = function () {
                window.open(window.location.protocol + '//' + window.location.host + '/ds-svc/tasking/publish/' + $scope.searchId);
            }

            // get the percentage to show export button when 100
            $scope.$watch(function(){
                return searchProgressFactory.list;
            }, function(newVal, oldVal){
                 if(newVal != oldVal){
                    $scope.percentageComplete = newVal.completionPercent;
                 }
            });

            $scope.$watch(function(){
                return savedSearchDetailFactory.resultCount;
            }, function (newVal, oldVal){
                if(newVal) {
                    $scope.resultsCount = newVal;
                    debugger;
                }
            });

            $scope.$watch(function(){
                return savedSearchDetailFactory.result;
            }, function (newVal, oldVal){
                if(newVal != oldVal) {
                    $scope.formattedResults = newVal;
                    $scope.rowStart = ((tempPageNumber - 1) * tempPageSize) + 1;
                    $scope.rowEnd = tempPageNumber * tempPageSize;
                    if($scope.rowEnd > $scope.resultsCount) {
                        $scope.rowEnd = $scope.resultsCount;
                    }
                }
            });

            $scope.$watch('pageSize', function(newVal, oldVal){
                console.log(newVal);
                if(newVal != oldVal) {
                    $scope.pageNum = 1;
                    $scope.pageMax = (newVal == 0 ? 1 : Math.ceil($scope.resultsCount / newVal));
                }
            });

            $scope.callPreview = function (preview) {
                var documentId = preview;
                previewFactory.getPreview(documentId, $scope.formattedResults.query);
                previewDocument.build();
            }
        }],
        link: function (scope, iElement, iAttrs) {}
    }
});

disclosure.directive('toggleTableColumns', function () {
    return {
        restrict: "EA",
        templateUrl: "templates/toggleTableColumns.html",
        controller: ["$scope", "assignmentsFactory", "tableOptions", "columnOptionsOne", "columnOptionsTwo", "columnOptionsThree", "columnOptionsFour", "formSearchFactory", "columnOptionsFive",
        function ($scope, assignmentsFactory, tableOptions, columnOptionsOne, columnOptionsTwo, columnOptionsThree, columnOptionsFour, formSearchFactory, columnOptionsFive ) {
            $scope.tableSizes = tableOptions;
            $scope.hiddenColumns = columnOptions;

            $scope.tableSizeOne = true;
            $scope.tableSizeTwo = true;
            $scope.tableSizeThree = true;
            $scope.tableSizeFour = true;
            $scope.tableSizeFive = true;

            $scope.toggleTable = function (group) {
                var value = '';
                var groupSet = '';

                switch(group) {
                case 1:
                    toggleColumns.toggle($scope.tableSizeOne, columnOptionsOne);
                    break;
                case 2:
                    toggleColumns.toggle($scope.tableSizeTwo, columnOptionsTwo);
                    break;
                case 3:
                    toggleColumns.toggle($scope.tableSizeThree, columnOptionsThree);
                    break;
                case 4:
                    toggleColumns.toggle($scope.tableSizeFour, columnOptionsFour);
                    break;
                case 5:
                    toggleColumns.toggle($scope.tableSizeFive, columnOptionsFive);
                    break;
                }
            }

            $scope.refreshColumns = function () {
                setTimeout(function () {
                    var columnGroups = 5;
                    for(var i = 1; i <= columnGroups; i++) {
                        console.log(i);
                        $scope.toggleTable(i);
                    }
                }, 500);
            };

            // if either below are updated, the columns will updated
            // and hide if already set
            $scope.$watch(function(){
                return formSearchFactory.formatted;
            }, function (newVal, oldVal){
                if(newVal != oldVal) {
                    $scope.refreshColumns();
                }
            });

            $scope.$watch(function(){
                return assignmentsFactory.results;
            }, function (newVal, oldVal){
                if(newVal != oldVal) {
                    $scope.refreshColumns();
                }
            });
        }]
    }
});

disclosure.directive('previewDocument', function () {
    return {
        restrict: "EA",
        templateUrl: "templates/preview.html",
        controller: ["$scope", "previewFactory", "formSearchFactory", "$sce", "savedSearchDetailFactory", "assignmentsFactory",
        function ($scope, previewFactory, formSearchFactory, $sce, savedSearchDetailFactory, assignmentsFactory) {

            $scope.hidePreview = false;
            $scope.documentTitle = '';
            $scope.documentFields = '';
            $scope.documentContent = '';
            $scope.taskId = '';
            $scope.lastSearch = '';
            $scope.status = '';
            var previewLoaded = false;

            $scope.$watch(function(){
                return previewFactory.lastSearch;
            }, function (newVal, oldVal) {
                if(newVal != oldVal) {
                    $scope.lastSearch = newVal;
                    $scope.previewSearchText = $scope.lastSearch.queryText;
                }
            });

            $scope.$watch(function(){
                return previewFactory.documentTitle;
            }, function (newVal, oldVal) {
                if(newVal != oldVal) {
                    if(newVal != ''){
                        var a = newVal.toString();
                        $scope.documentTitle = $sce.trustAsHtml(a);
                    }
                }
            });

            $scope.$watch(function(){
                return previewFactory.documentFields;
            }, function (newVal, oldVal) {
                if(newVal != oldVal) {
                    $scope.documentFields = newVal;
                }
            });

            $scope.$watch(function(){
                return previewFactory.taskId;
            }, function (newVal, oldVal) {
                if(newVal != oldVal) {
                    $scope.taskId = newVal;
                }
            });

            $scope.$watch(function(){
                return previewFactory.documentContent;
            }, function (newVal, oldVal) {
                if(newVal != ''){
                    var a = newVal.toString();
                    $scope.documentContent = $sce.trustAsHtml(a);
                    $scope.hidePreview = false;
                }

                if(previewLoaded == false) {
                    previewDocument.init();
                    previewLoaded = true;
                }

                previewDocument.setup();
            });

            // watch the status as this needs to change all the time
            $scope.$watch(function(){
                return previewFactory.status;
            }, function (newVal, oldVal) {
                if(newVal != oldVal) {
                    console.log('previewFactory updated ' + newVal);

                    $('.preview-status option').removeAttr('selected');
                    $('.preview-status option[value="string:' + newVal + '"]').attr('selected', true);

                    $scope.status = newVal;
                    // console.log('status is ' + $scope.status);
                }
            });

            // using jquery to get the next tr preview data id to then load in new preview
            $scope.nextDocument = function () {
                $scope.hidePreview = true;
                var nextRow = $('tr.current-row').next('tr');

                if(nextRow.length > 0) {
                    $('tr').removeClass('current-row');
                    nextRow.addClass('current-row');

                    var previewDoc = nextRow.find('.preview-document');
                    var documentId = previewDoc.attr('data-preview');

                    if($scope.assignments) {
                        var status = previewDoc.attr('data-status');
                        var fullTask = JSON.parse(previewDoc.attr('data-taskFull'));
                        $scope.taskId = previewDoc.attr('data-task');
                        previewFactory.getPreview(documentId, $scope.lastSearch, status, $scope.taskId, fullTask);
                        previewDocument.populateStatus(status); // jquery hack to change the status.
                    }else {
                        previewFactory.getPreview(documentId, $scope.lastSearch);
                    }
                }

                if(nextRow.next('tr').length === 0) {
                    $scope.hidePreview = true;
                }
            }

            // change event fired when user changes the status of the document in the preview
            // slight hack needed to set the value on the table dropdown as cannot reach it.
            $scope.changeStatusDropdown = function(reviewStatus){
                assignmentsFactory.changeStatus(reviewStatus, $scope.taskId);
            }

            // closing preview and resetting variables
            $scope.closePreview = function () {
                if($scope.assignments) {
                    toggleColumns.showAll();
                    assignmentsFactory.getMyAssignments();
                }

                previewDocument.close();
                $scope.hidePreview = false;
            }
        }]
    }
});

// onLastItem - gets ran every time ng-repeat item is rendered,
// and if last item it calls a function using scope.$emit();
disclosure.directive('onLastItem', function ($timeout) {
    return function (scope, element, attrs) {
        if(scope.$last)
            console.log(scope.$last);
            scope.$emit('lastItemInTheList', element, attrs);
    }
});
