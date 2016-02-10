var disclosure = angular.module('disclosureApp', ['ngRoute','ngTable']);

// ie9 fix for the caching bug.
disclosure.config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);

// disclosure routing
disclosure.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/search', {
		templateUrl: 'views/search.html',
		controller: 'searchController as search'
	}).
	when('/search-results', {
		templateUrl: 'views/search-results.html',
		controller: 'resultsController as results'
	}).
    when('/saved-searches', {
		templateUrl: 'views/saved-searches.html',
		controller: 'savedSearchesController as savedSearches'
	}).
	when('/saved-search/:searchId', {
		templateUrl: 'views/saved-search.html',
		controller: 'searchDetailsController as searchDetails'
	}).
	when('/assignments', {
		templateUrl: 'views/assignments.html',
		controller: 'assignmentsController as assignments'
	}).
	when('/assignment/:assignmentId', {
		templateUrl: 'views/assignment.html',
		controller: 'assignmentController as assignment'
	}).
    otherwise('/search', {
        templateUrl: 'views/search.html',
		controller: 'searchController as search'
    });
}]);
