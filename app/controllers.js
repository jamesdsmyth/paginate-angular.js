// search controller (search)
disclosure.controller('searchController', ['$scope', '$location', 'getUserFactory', 'formSearchFactory', 'formSearchInputFactory', 'lookupFactory',
function ($scope, $location, getUserFactory, formSearchFactory, formSearchInputFactory, lookupFactory) {

    // checking if not a manager and if not, redirect to assignments page
    $scope.$watch(function(){
        return getUserFactory.isManager;
    }, function(newVal, oldVal){
        if(newVal != oldVal) {
            $scope.isManager = newVal;
            if($scope.isManager == false) {
                window.location = '#assignments';
            }
        }
    });

    // pulling in the data from the search
    var t = this; // only because 'this' will not work within the for loop
    t.searchFields = [];

    angular.forEach(angular.element('.search-form-field'), function (value, key){
        var item = angular.element(value);
        var objectName = item.attr('id');
        var formField = {
            field: objectName,
            value: []
        }

        t.searchFields.push(formField);
    });

    $scope.fullList;

    $scope.wildcardExpansions = lookupFactory.wildcardExpansions;
    $scope.populateWildcards = function () {
        if(!lookupFactory.isSameasLastSearch(t.searchFields[0].value)){
            lookupFactory.getWildcardExpansions(t.searchFields[0].value);
        }
    }

    $scope.fuzzyExpansions = lookupFactory.fuzzyExpansions;
    $scope.populateFuzzies = function () {
        if(!lookupFactory.isSameasLastSearch(t.searchFields[0].value)){
            lookupFactory.getFuzzyExpansions(t.searchFields[0].value);
        }
    }

    $scope.namecutExpansions = lookupFactory.namecutExpansions;
    $scope.populateNamecuts = function () {
        if(!lookupFactory.isSameasLastSearch(t.searchFields[0].value)){
            lookupFactory.getNamecutExpansions(t.searchFields[0].value);
        }
    }

    this.addFormData = function () {
        formSearchFactory.addSearchCriteria(t.searchFields, null, 1, 100);
        formSearchInputFactory.addSearchTerm(t.searchFields[0].value);
    }

    // clears form data by resetting all value arrays in the searchFields object
    this.clearFormData = function () {
        for(i = 0; i < t.searchFields.length; i++) {
            t.searchFields[i].value = [];
        }
    }

    $scope.$watch(function(){
        return lookupFactory.fuzzyExpansions;
    }, function(newVal, oldVal){
        $scope.fuzzyExpansions = newVal;
    });

    $scope.$watch(function(){
        return lookupFactory.wildcardExpansions;
    }, function(newVal, oldVal){
        $scope.wildcardExpansions = newVal;
    });

    $scope.$watch(function(){
        return lookupFactory.namecutExpansions;
    }, function(newVal, oldVal){
        $scope.namecutExpansions = newVal;
    });

    $scope.$watch(function () {
        return lookupFactory.list;
    }, function (newVal, oldVal){
        $scope.fullList = newVal;
    });

    $scope.lookupsReturned;

    datepickers.init();
    filters.init();
}]);

// saved searches controller (savedSearches)
disclosure.controller('savedSearchesController', ['$scope', 'savedSearchesFactory', 'savedSearchDetailFactory', 'getUserFactory','filterSavedList',
function($scope, savedSearchesFactory, savedSearchDetailFactory, getUserFactory, filterSavedList) {

    // checking if not a manager and if not, redirect to assignments page
    $scope.$watch(function(){
        return getUserFactory.isManager;
    }, function(newVal, oldVal){
        if(newVal != oldVal) {
            $scope.isManager = newVal;
            if(newVal == false) {
                window.location = '#assignments';
            }
        }
    });

    //Initialisation to populate savedSearches
    $scope.savedSearches = [];
    $scope.status = filterSavedList;
    $scope.filter = '';

    $scope.startList = 0;
    $scope.listLimit = 10;
    $scope.itemsLength = 0;
    $scope.paginationLength = 0;
    $scope.currentPage = 1;
    $scope.disableNext = true;
    $scope.disablePrevious = true;
    $scope.filteredResults = 0;

    $scope.$watch(function () {
        return savedSearchesFactory.savedSearches;
    }, function(newVal, oldVal) {
        $scope.savedSearches = newVal;

        $scope.itemsLength = newVal.length;
        $scope.paginationLength = Math.ceil($scope.itemsLength / $scope.listLimit);

        if($scope.paginationLength > 1) {
            $scope.disableNext = false;
        }
    });

    // ng-click previous page link
    $scope.previousPage = function () {
        $scope.startList = $scope.startList - $scope.listLimit;

        if($scope.startList <= 0) {
            $scope.startList = 0;
            $scope.disablePrevious = true;
        }
        $scope.disableNext = false;
        $scope.currentPage--;
    }

    // ng-click next page link
    $scope.nextPage = function () {
        $scope.startList = $scope.startList + $scope.listLimit;

        if(($scope.itemsLength - $scope.startList) <= $scope.listLimit) {
            $scope.disableNext = true;
        }
        $scope.disablePrevious = false;
        $scope.currentPage++;
    }

    // ng-change the dropdown. The resets where we start the ng-repeat
    // from so it will start to list from position 0 and page 1.
    $scope.resetPagination = function () {
        $scope.startList = 0;
        $scope.currentPage = 1;
    }

    // once the directive tells us the last list item is loaded,
    // we drop in and edit the scope variables
    $scope.$on('lastItemInTheList', function (scope, attrs) {
        $scope.itemsLength = $scope.filteredResults.length;
        console.log($scope.itemsLength);
        $scope.paginationLength = Math.ceil($scope.itemsLength / $scope.listLimit);

        if($scope.currentPage == $scope.paginationLength) {
            $scope.disableNext = true;
        } else {
            $scope.disableNext = false;
        }

        if($scope.currentPage == 1 || ($scope.paginationLength == 1)) {
            $scope.disablePrevious = true;
        } else {
            $scope.disablePrevious = false;
        }
    });

    var init = function () {
        savedSearchesFactory.getSavedSearches();
    }

    $scope.getDate = function (item) {
        return new Date(item.savedDate);
    }

    init();
}]);

// individual search details page
disclosure.controller('searchDetailsController', ['$scope', 'getUserFactory', 'savedSearchesFactory', 'formSearchFactory','tableHeadings', '$routeParams', 'savedSearchDetailFactory', 'searchProgressFactory',
function($scope, getUserFactory, savedSearchesFactory, formSearchFactory, tableHeadings, $routeParams, savedSearchDetailFactory, searchProgressFactory) {

    // checking if not a manager and if not, redirect to assignments page
    $scope.$watch(function(){
        return getUserFactory.isManager;
    }, function(newVal, oldVal){
        $scope.isManager = newVal;
        if($scope.isManager == false) {
            window.location = '#assignments';
        }
    });

    $scope.results = {};
    $scope.resultFields = tableHeadings;
    $scope.queryId;
    var pageSize = 100;

    var init = function(){
        $scope.queryId  = $routeParams.searchId;
        savedSearchDetailFactory.getSavedSearchDetails($scope.queryId, 1, pageSize);
    }

    init();
    toggleContainers.init();
    dragDrop.init();
}]);

// header controller (header)
disclosure.controller('headerController', ['$scope', 'getUserFactory',
function ($scope, getUserFactory) {
    $scope.date = new Date();

    $scope.$watch(function(){
        return getUserFactory.current;
    }, function(newVal, oldVal){
        $scope.username = newVal;
    });

    $scope.$watch(function(){
        return getUserFactory.isManager;
    }, function(newVal, oldVal){
        $scope.isManager = newVal;
    });
}]);

// navigation controller (nav)
disclosure.controller('navigationController', ['$scope', '$location', 'getUserFactory',
function ($scope, $location, getUserFactory) {
    $scope.getClass = function (path) {
        if ($location.path().substr(0, path.length) === path) {
            return 'active';
        } else {
            return '';
        }
    }

    $scope.isManager = getUserFactory.isManager;

    $scope.$watch(function(){
        return getUserFactory.isManager;
    }, function(newVal, oldVal){
        $scope.isManager = newVal;
    });
}]);

disclosure.controller('assignmentsController', ['$scope','assignmentsFactory', 'filterSavedList',
function($scope, assignmentsFactory,filterSavedList) {

    $scope.assignments = assignmentsFactory.results;
    $scope.filter = '';
    $scope.status = filterSavedList;

    $scope.startList = 0;
    $scope.listLimit = 10;
    $scope.itemsLength = 0;
    $scope.paginationLength = 0;
    $scope.currentPage = 1;
    $scope.disableNext = true;
    $scope.disablePrevious = true;
    $scope.filteredResults = 0;

    $scope.$watch(function () {
        return assignmentsFactory.results;
    }, function(newVal, oldVal){
        $scope.assignments = newVal;
        $scope.itemsLength = newVal.length;
        $scope.paginationLength = Math.ceil($scope.itemsLength / $scope.listLimit);

        if($scope.paginationLength > 1) {
            $scope.disableNext = false;
        }
    });

    // ng-click previous page link
    $scope.previousPage = function () {
        $scope.startList = $scope.startList - $scope.listLimit;

        if($scope.startList <= 0) {
            $scope.startList = 0;
            $scope.disablePrevious = true;
        }
        $scope.disableNext = false;
        $scope.currentPage--;
    }

    // ng-click next page link
    $scope.nextPage = function () {
        $scope.startList = $scope.startList + $scope.listLimit;

        if(($scope.itemsLength - $scope.startList) <= $scope.listLimit) {
            $scope.disableNext = true;
        }
        $scope.disablePrevious = false;
        $scope.currentPage++;
    }

    // ng-change the dropdown. The resets where we start the ng-repeat
    // from so it will start to list from position 0 and page 1.
    $scope.resetPagination = function () {
        $scope.startList = 0;
        $scope.currentPage = 1;
    }

    // once the directive tells us the last list item is loaded,
    // we drop in and edit the scope variables
    $scope.$on('lastItemInTheList', function (scope, attrs) {
        $scope.itemsLength = $scope.filteredResults.length;
        $scope.paginationLength = Math.ceil($scope.itemsLength / $scope.listLimit);

        if($scope.currentPage == $scope.paginationLength) {
            $scope.disableNext = true;
        } else {
            $scope.disableNext = false;
        }

        if($scope.currentPage == 1 || ($scope.paginationLength == 1)) {
            $scope.disablePrevious = true;
        } else {
            $scope.disablePrevious = false;
        }
    });

    var init = function(){
        assignmentsFactory.getMyAssignments();
    }

    init();
}]);

disclosure.controller('assignmentController', ['$scope', '$sce', 'assignmentsFactory', '$routeParams', 'tableHeadings', 'previewFactory', 'formSearchFactory', 'documentResultFormatFactory', 'workOptions', 'tableOptions', 'columnOptionsOne', 'columnOptionsTwo', 'columnOptionsThree', 'columnOptionsFour', 'columnOptionsFive', 'formSearchInputFactory',
    function($scope, $sce, assignmentsFactory, $routeParams, tableHeadings, previewFactory, formSearchFactory, documentResultFormatFactory, workOptions, tableOptions, columnOptionsOne, columnOptionsTwo, columnOptionsThree, columnOptionsFour, columnOptionsFive, formSearchInputFactory){

    $scope.assignments = assignmentsFactory.results;
    $scope.resultFields = tableHeadings.slice();
    $scope.resultFields.push({'metaId':'reviewStatus' , 'heading': 'Review Status'});
    $scope.previewSearchText = '';

    var init = function(){
        assignmentsFactory.getMyAssignments();
    }

    $scope.workOptions = workOptions;
    // $scope.currentSelection = "";
    $scope.tableSizes = tableOptions;
    $scope.hiddenColumns = columnOptions;

    $scope.$watch(function(){
        return assignmentsFactory.results;
    }, function(newVal, oldVal){
        if(newVal != oldVal) {
            $scope.assignments = newVal;
            $scope.assignId  = $routeParams.assignmentId;
            $scope.assignment = newVal.filter(function(assign){return assign.assignmentId == $scope.assignId});

            if($scope.assignment.length > 0){
                $scope.results = documentResultFormatFactory.formatResults($scope.assignment[0].taskItems.map(function(task){return task.document}));
                $scope.resultsCount = $scope.results.length;
                $scope.tasks = $scope.assignment[0].taskItems.map(function(task){return {'status': task.status, 'taskId': task.taskId, 'document': documentResultFormatFactory.formatSingleResult(task.document)}});
                $scope.previewSearchText = $scope.assignment[0].originalQuery.queryText;
            }else{
                console.log("This task does not exist");
            }
        }
    });

    // change event fired when user changes the status of the document in the preview
    $scope.changeStatus = function(reviewStatus, taskid, success, failure){
        assignmentsFactory.changeStatus(reviewStatus, taskid, success, failure);
    }

    //watching when the preview status changes, we update the table status for that row
    $scope.$watch(function(){
        return assignmentsFactory.currentStatus;
    }, function (newVal, oldVal) {
        if(newVal) {
            $scope.currentSelection = newVal;
        }
    });

    $scope.$watch(function(){
        return previewFactory.task;
    }, function (newVal, oldVal) {
        if(newVal != oldVal) {
            $scope.currentTask = newVal;
        }
    });

    // call preview to initiate and call factory to get data
    $scope.callPreview = function (task) {
        previewFactory.getPreview(task.document.documentLinks.preview, $scope.assignment[0].originalQuery, task.status, task.taskId);
        $scope.currentTask = task;
        $scope.currentTask.status = task.status;
        previewDocument.build(function () {
            previewDocument.populateStatus($scope.currentTask.status);
        });
    }
    init();
}]);
