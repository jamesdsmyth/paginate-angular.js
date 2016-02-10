/*
 paginate-angular.js
 James Smyth 2015 www.GITHUBADDRESSHERE
*/
var paginatejs = angular.module('pagination', []);

paginatejs.controller('listController', ['$scope', function($scope) {

    $scope.startList = 0;
    $scope.listLimit = 10; //display 10 items per page. Just change this value to display a different amount.
    $scope.itemsLength = 0;
    $scope.paginationLength = 0;
    $scope.currentPage = 1;
    $scope.disableNext = true;
    $scope.disablePrevious = true;
    $scope.filteredResults = 0;
    $scope.filter = '';

    // dummy list of items so we can do some pagination!
    $scope.items = [
        {
            'title': 'Title 1',
            'savedDate': 1452960608473,
            'status': 'new'
        },
        {
            'title': 'Title 2',
            'savedDate': 1451508996049,
            'status': 'inProgress'
        },
        {
            'title': 'Title 3',
            'savedDate': 1452960608999,
            'status': 'completed'
        },
        {
            'title': 'Title 4',
            'savedDate': 1351938465721,
            'status': 'new'
        },
        {
            'title': 'Title 5',
            'savedDate': 1452960604512,
            'status': 'inProgress'
        },
        {
            'title': 'Title 6',
            'savedDate': 1452960345621,
            'status': 'inProgress'
        },

        {
            'title': 'Title 7',
            'savedDate': 1355421345124,
            'status': 'new'
        },
        {
            'title': 'Title 8',
            'savedDate': 1451508996049,
            'status': 'inProgress'
        },
        {
            'title': 'Title 9',
            'savedDate': 1451508796034,
            'status': 'completed'
        },
        {
            'title': 'Title 10',
            'savedDate': 1451122334455,
            'status': 'inProgress'
        },
        {
            'title': 'Title 11',
            'savedDate': 1452976547895,
            'status': 'inProgress'
        },
        {
            'title': 'Title 12',
            'savedDate': 1452961123456,
            'status': 'completed'
        },
        {
            'title': 'Title 13',
            'savedDate': 1453456789012,
            'status': 'inProgress'
        },
        {
            'title': 'Title 14',
            'savedDate': 1451111111123,
            'status': 'inProgress'
        },
        {
            'title': 'Title 15',
            'savedDate': 1452968765432,
            'status': 'completed'
        },
        {
            'title': 'Title 16',
            'savedDate': 1353456789123,
            'status': 'inProgress'
        },
        {
            'title': 'Title 17',
            'savedDate': 1452233445566,
            'status': 'inProgress'
        },
        {
            'title': 'Title 18',
            'savedDate': 1459876543234,
            'status': 'completed'
        },
        {
            'title': 'Title 19',
            'savedDate': 1351122332211,
            'status': 'completed'
        },
        {
            'title': 'Title 20',
            'savedDate': 1451508997777,
            'status': 'inProgress'
        },
        {
            'title': 'Title 21',
            'savedDate': 1451508799764,
            'status': 'completed'
        },
        {
            'title': 'Title 22',
            'savedDate': 1351124567891,
            'status': 'completed'
        },
        {
            'title': 'Title 23',
            'savedDate': 1351122443312,
            'status': 'inProgress'
        },
        {
            'title': 'Title 24',
            'savedDate': 1452960698765,
            'status': 'completed'
        }
    ];

    $scope.status = [
        {
            value: '',
            label: 'All'
        },
        {
            value: 'new',
            label: 'New'
        },
        {
            value: 'inProgress',
            label: 'In progress'
        },
        {
            value: 'completed',
            label: 'Completed'
        }
    ];

    // additionally if you are getting the items using a http method, you can use this method below.
    // $scope.$watch(function () {
    //     return savedList.results;
    // }, function(newVal, oldVal){
    //     $scope.items = newVal;
    //     $scope.itemsLength = $scope.items.length;
    //     $scope.paginationLength = Math.ceil($scope.itemsLength / $scope.listLimit);
    //
    //     if($scope.paginationLength > 1) {
    //         $scope.disableNext = false;
    //     }
    // });

    $scope.itemsLength = $scope.items.length;
    $scope.paginationLength = Math.ceil($scope.itemsLength / $scope.listLimit);
    if($scope.paginationLength > 1) {
        $scope.disableNext = false;
    }

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

    // $scope.$watch watches for any changes and updates our values if neccessary
    $scope.$watch(function() {
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
}]);

// Status filter that takes the camelCased status and switches it for a more readable value
// This is used like so: {{item.status | statusFilter}}
paginatejs.filter('statusFilter', function () {
    return function (value) {
        var newValue = ''

        switch(value) {
            case 'completed':
                newValue = 'Completed'
                break;
            case 'new':
                newValue = 'New'
                break;
            case 'inProgress':
                newValue = 'In progress'
                break;
        }

        return value = newValue;
    }
});
