var currentTime = new Date().getTime();

// factory returns the form field data
disclosure.factory('formSearchFactory', ['$http', 'documentResultFormatFactory',
function ($http, documentResultFormatFactory) {
    // I need to wrap this up into exactly what elastic want.
    var results = {};
    results.formatted = [];
    results.lastSearch = '';
    results.returnedLength = 0;
    var item = {
        'queryText': ''
    }

    var lastSearched = [];
    results.rerunSearch = function(pageNum, pageSize, sort, direction){
        results.addSearchCriteria(lastSearched, null, pageNum, pageSize, sort, direction);
    }

    //Need this to convert to lookup list expected by backend
    results.mapToLookupList = function(multiSelectObj){
      var lookupList = undefined;
      if(multiSelectObj.multiple){
        lookupList = [];
        multiSelectObj.multiple.item.forEach(function (selectObj){
          var group = results.findGroup(selectObj.group, lookupList);
          group.lookup.push(selectObj.value);
        });
      }
      return lookupList;
    }

    //Find the group for a groupname in a lookup list
    results.findGroup = function(groupName, lookupList){
        var group;
        lookupList.forEach(function(lookupObj){
            if(lookupObj.lookupTerm == groupName){
                group = lookupObj;
            }
        });

        if(group){
            //If a group existed then return it
            return group;
        }else{
            //Otherwise make a new group
            var newGroup = {'lookupTerm' : groupName, 'lookup': []};
            lookupList.push(newGroup);
            return newGroup;
        }
    }

    results.addSearchCriteria = function (searchFields, callback, pageNum, pageSize, sort, direction) {

        //0 - searchText
        //1 - wildcard selections
        //2 - namecuts selections
        //3 - fuzzy selections
        lastSearched = searchFields;
        item = {};
        item.queryText = searchFields[0].value;

        item.filter = {};
        item.filter.createdBy = searchFields[4].value;
        item.filter.createdByDes = searchFields[5].value;
        item.filter.createdDatetime = makeDateString(searchFields[6].value, searchFields[7].value);
        item.filter.modifiedBy = searchFields[8].value;
        item.filter.modifiedByDes = searchFields[9].value;
        item.filter.modifiedDatetime = makeDateString(searchFields[10].value, searchFields[11].value);
        item.filter.contentType = searchFields[12].value;
        // item.filter.structuredReference = searchFields[13].value;
        item.filter.informationType = searchFields[14].value;
        item.filter.documentTypes = searchFields[15].value;
        item.filter.topicType = searchFields[16].value;
        item.filter.fileType = searchFields[17].value;
        item.filter.theme = searchFields[18].value;
        item.filter.businessArea = searchFields[19].value;
        item.filter.fileDateCreated = makeDateString(searchFields[20].value, searchFields[21].value);
        item.filter.lobDocType = searchFields[22].value;
        item.filter.lobDocSubtype = searchFields[23].value;
        item.filter.publishedBy = searchFields[24].value;
        item.filter.publishedByDes = searchFields[25].value;
        item.filter.publishedDatetime = makeDateString(searchFields[26].value, searchFields[27].value);
        item.filter.messageSentDate = makeDateString(searchFields[28].value, searchFields[29].value);
        item.filter.messageReceivedDate = makeDateString(searchFields[30].value, searchFields[31].value);
        item.filter.source = searchFields[32].value;

        function makeDateString (dateOne, dateTwo) {
            if((dateOne != '') && (dateTwo != '')) {
                var formattedDate = {
                    "from": formatDate(dateOne[0]),
                    "to": formatDate(dateTwo[0])
                };
                return formattedDate;
            } else {
                return;
            }
        }

        function formatDate(dateStr) {
            //assumes dd-mm-yyyy
            var split = dateStr.split("-");
            return split[2] + "-" + split[1] + "-" + split[0];
        }

        item.expansions = {};
        item.expansions.wildcards = results.mapToLookupList(searchFields[1]);
        item.expansions.namecuts = results.mapToLookupList(searchFields[2]);
        item.expansions.fuzzies = results.mapToLookupList(searchFields[3]);

        // Calculate the offset for the page
        if(pageNum && pageSize){
            item.offset = ((pageNum - 1) * pageSize);
            item.limit = pageSize;
        }

        //
        if(sort && direction){
              item.orderBy = sort;
              item.orderDirection = direction;
        }

        results.lastSearch = item;
        results.postRequest(results.lastSearch);
    }

    // seperated from search object build to allow passing of already formatted saved searches.
    results.postRequest = function (searchObject) {
        var url = '/ds-svc/documents' + '?time' + currentTime;
        var request = $http({
            method: "post",
            url: url,
            data: searchObject
        });

        request.success(function(response) {
            debugger;
            // handles all error messages and shows error, else drop in
            if(response.errorMessage.length == 0) {

                results.returnedResults = [];
                results.returnedResults.push(response.payload.results);
                results.totalHits = response.payload['totalCount'];
                results.formatted = documentResultFormatFactory.formatResults(results.returnedResults[0].map(function(res){return res.result}));
                results.returnedLength = results.returnedResults[0].length;

                if(results.returnedLength == 0){
                    filters.showFilters();
                    notifications.show(notifications.settings.noSearchResults, 'error');
                }else{
                    filters.hideFilters();
                }
            } else {
                notifications.show(response.errorMessage, 'error');
            }
        }).error(function(response) {
            console.log('error');
        });
    }

    return results;
}]);

// factory returns the main search input text
disclosure.factory('formSearchInputFactory', function () {
    var searchBoxText = {};
    searchBoxText.title;

    searchBoxText.addSearchTerm = function (searchText) {
        searchBoxText.title = searchText;
    }

    return searchBoxText;
});

// factory returns the fuzziness
disclosure.factory('lookupFactory', ['$http', function ($http) {
    var lookups = {};
    lookups.list = {};
    var selects = [];
    var i = 0;

    angular.forEach(angular.element('#filters .multi'), function(value, key){
        var item = angular.element(value);
        selects.push(item);
    });
    var lastLookupText = "";

    lookups.isSameasLastSearch = function(queryText){
      return queryText == lastLookupText;
    }

    lookups.wildcardExpansions;
    lookups.getWildcardExpansions = function (queryText) {
        lastLookupText = queryText;
        var url = '/ds-svc/documents/wildcard/' + '?text=' +queryText;
        lookups.wildcardExpansions = [];
        //Send request
        $http.get(url).success(function(response){
            //For each lookup object in response
            lookups.wildcardExpansions = lookups.formatExpansions(response.data);

            if(response.warningMessage){
                notifications.show(response.warningMessage, 'error');
            }
        }).error(function(response){
            console.log('error');
        });
    }

    lookups.fuzzyExpansions;
    lookups.getFuzzyExpansions = function (queryText) {
        lastLookupText = queryText;
        var url = '/ds-svc/documents/fuzzy/' + '?text=' +queryText;
        lookups.fuzzyExpansions = [];
        //Send request
        $http.get(url).success(function(response){
            console.log(response);

            //For each lookup object in response
            lookups.fuzzyExpansions = lookups.formatExpansions(response);
        }).error(function(response){
            console.log('error');
        });
    }

    lookups.namecutExpansions;
    lookups.getNamecutExpansions = function(queryText){
        lastLookupText = queryText;
        var url = '/ds-svc/documents/namecuts/' + '?text=' +queryText;
        lookups.namecutExpansions = [];
        //Send request
        $http.get(url).success(function(response){
            console.log(response);

            //For each lookup object in response
            lookups.namecutExpansions = lookups.formatExpansions(response);
        }).error(function(response){
            console.log('error');
        });
    }

    lookups.formatExpansions = function (response){
        var formattedExpansions = [];
        //For each lookup object in response
        response.forEach(function(lookupObj){
            //Take the list of expansions for that term
            if(lookupObj.lookup.length == 0) {
                formattedExpansions.push({'value': 'Nothing found', 'disabled': 'true', 'group': lookupObj.lookupTerm});
            } else {
                lookupObj.lookup.forEach(function(expansion){
                    //Populate the expansion list
                    formattedExpansions.push({'value': expansion, 'group': lookupObj.lookupTerm});
                });
            }
        });

        return formattedExpansions;
    }

    lookups.requestLookup = function(folder, id) {

        var url = '/ds-svc/documents/lookup/' + folder;

        $http.get(url).success(function(response) {
            if(response)
              var options = {
                  "folder": folder,
                  "value": response.toString()
              }
            lookups.list[id] = options;

            i++;
            lookups.getFolder(selects[i]);
        }).error(function(response) {
            var options = {
                "folder": "no response",
                "value": "no values returned"
            }
            lookups.list.push(options);

            i++;
            lookups.getFolder(selects[i]);
        });
    }

    lookups.getFolder = function (select) {
        if(i < selects.length) {
            var folder = select.attr('data-folder');
            var id = select.attr('id');
            lookups.requestLookup(folder, id);
        }
    }

    lookups.getFolder(selects[i]);

    return lookups;
}]);


// factory returns the JSON file of the saved searches
disclosure.factory('savedSearchesFactory', ['$http', function ($http) {
    var searches = {};
    searches.list = [];

    // getting the list of saved searches here. Returning this
    // will also return the search object originally used to search in the first
    // place. Clicking on the saved search li will
    searches.saveSearch = function(searchObject){
      //Given a search object, ask the server to save it
       var url = '/ds-svc/tasking/saveSearch' + '?time' + currentTime;
       searchObject.limit = 0;
       var request = $http({
          method: "post",
          url: url,
          data: searchObject
       });

        request.success(function(response) {
            notifications.show(notifications.settings.saveSearchSuccess, 'success');
        }).error(function(response) {
            console.log('error');
            notifications.show(notifications.settings.saveSearchFail, 'error');
        });
    }

    searches.savedSearches = [];

    searches.getSavedSearches = function(){
      var url =  '/ds-svc/tasking/savedSearches' + '?time' + currentTime;
        var request = $http({
            method: "GET",
            url: url
        });

        request.success(function(response) {
            //response is the SearchQuery object that the backend stores this searchObject as
            searches.savedSearches = response;
        }).error(function(response) {
            console.log('error');
        });
    }
    return searches;
}]);

// factory returns the saved search results to populate the table
disclosure.factory('savedSearchDetailFactory' ,['$http', 'documentResultFormatFactory', function($http,documentResultFormatFactory){
   var details = {};

   details.result = {
       'query': ''
   };
   details.lastSearchedID = '';

   details.getSavedSearchDetails = function(savedSearchID, pageNumber, pageSize){

    var offset = 0;
    var limit = 0;
    if(pageNumber && pageSize) {
        offset = ((pageNumber - 1) * pageSize);
        limit = pageSize;
    }

    details.lastSearchedID = savedSearchID;
    var url = '/ds-svc/tasking/getSavedSearch/' + savedSearchID + '/?limit=' + limit + '&offset=' + offset;
        var request = $http({
            method: "GET",
            url: url
        });

        request.success(function(response) {
            debugger;
            //response is the SearchQuery object that the backend stores this searchObject as
            var documentsOnly = response.searchItems.map(function(result){return result.document});
            details.result = documentResultFormatFactory.formatResults(documentsOnly);
            details.resultCount = response.resultCount;
            details.result.query = response.query;
        }).error(function(response) {
            console.log('error');
        });
   }

   return details;
}]);

// factory returns team members with all their current data
disclosure.factory('getTeamMembersFactory', function ($http) {

    var teamMembers = {};
    teamMembers.list = [];

    teamMembers.getMembers = function () {
        var url = '/ds-svc/user/appusers' + '?time' + currentTime;
        var request = $http({
            method: "GET",
            url: url
        });

        request.success(function(response){
            teamMembers.list = response;
            dragDrop.settings.memberCount = response.length;
        }).error(function(response){
            console.log('error');
        });
    }

    return teamMembers;
});

// factory to return the progress of the current search
disclosure.factory('getAvailableMembers', ['$http', function ($http) {

    var availableMembers = {};
    availableMembers.list = '';

    availableMembers.get = function (searchId) {
        var url = '/ds-svc/tasking/availableUsers/' + searchId + '?time' + currentTime;
        var request = $http({
            method: "GET",
            url: url
        });

        request.success(function (response) {
            availableMembers.list = response;
        }).error(function(response){
            console.log('error');
        });
    }

    return availableMembers;
}]);

// factory saves the added members for the saved search
disclosure.factory('commitMembersFactory', function ($http) {

    var batchDetails = {};
    batchDetails.list = '';

    batchDetails.commit = function (addedMembers) {
        var url = '/ds-svc/tasking/allocateWorkPreview' + '?time' + currentTime;
        var request = $http({
            method: "POST",
            url: url,
            data: addedMembers
        });

        request.success(function(response){
            batchDetails.list = response;
        }).error(function(response){
            console.log('error');
        });
    }

    return batchDetails;
});

// factory pushes the selected members and saves them in the database
disclosure.factory('pushMembersFactory', function ($http) {

    var pushBatchDetails = {};
    pushBatchDetails.status = false;

    pushBatchDetails.push = function (addedMembers) {
        var url = '/ds-svc/tasking/allocateWorkAuto' + '?time' + currentTime;
        var request = $http({
            method: "POST",
            url: url,
            data: addedMembers
        });

        request.success(function(response){
            pushBatchDetails.status = true;
        }).error(function(response){
            console.log('error');
            notifications.show(notifications.settings.batchError, 'error');
        });
    }

    return pushBatchDetails;
});

// factory to return the progress of the current search
disclosure.factory('searchProgressFactory', ['$http', function ($http) {

    var progress = {};
    progress.list = '';

    progress.get = function (searchId) {
        var url = '/ds-svc/tasking/getSavedSearchProgress/' + searchId + '?time' + currentTime;
        var request = $http({
            method: "GET",
            url: url
        });

        request.success(function (response) {
            progress.list = response;
        }).error(function(response){
            console.log('error');
        });
    }

    return progress;
}]);

// factory to re-allocate the work of a given user to members of the team
disclosure.factory('reAllocateWorkFactory', ['$http', function ($http) {

    var reAllocation = {};
    reAllocation.status = 0;

    reAllocation.push = function (teamBundle) {
        var url = '/ds-svc/tasking/reassignToTeam' + '?time' + currentTime;
        var request = $http({
            method: "POST",
            url: url,
            data: teamBundle
        });

        request.success(function (response) {
             //needs to run a function every time there is a success and as there
            //  is no response data...
            console.log('1');
            reAllocation.status++;
        }).error(function(response){
            console.log('error');
        });
    }

    return reAllocation;
}]);

// factory returns the preview document
disclosure.factory('previewFactory', ['$http', function ($http) {
    var preview = {};
    preview.documentTitle = '';
    preview.documentFields = '';
    preview.documentContent = '';
    preview.taskId = '';
    preview.lastSearch = '';
    preview.status = '';
    preview.currentTask = '';

    preview.getPreview = function (documentId, lastFormattedSearch, status, taskId, task) {
        preview.taskId = taskId;
        preview.lastSearch = lastFormattedSearch;
        preview.status = status;
        preview.task = task;
        var url = '/ds-svc/documents/document/preview' + '?docId=' + documentId;
        var request = $http({
            method: "post",
            url: url,
            data: lastFormattedSearch
        });

        request.success(function(response) {

            preview.documentTitle = response.documentTitle;
            preview.documentFields = response;
            preview.documentContent = response.content;
            preview.formatPreview();
        }).error(function(){
            console.log('error');
        });
    }

    preview.formatPreview = function () {
        for(var key in preview.documentFields) {
            if(preview.documentFields.hasOwnProperty(key)) {
                if(preview.documentFields[key] == null || preview.documentFields['content'] || preview.documentFields['documentTitle']) {
                    delete preview.documentFields[key];
                }
            }
        }
    }

    return preview;
}]);

// factory returns current user
disclosure.factory('getUserFactory', function ($http) {

    var user = {};
    user.current = '';
    user.Id = '';

    var url = '/ds-svc/user' + '?time' + currentTime;

    $http.get(url).success(function(response){
        user.current = response.displayName;
        user.Id = response.userId;
    }).error(function(response){
        console.log('error');
    });

    user.isManager = false;

    var managerUrl = window.location.protocol + '//' + window.location.host + '/ds-svc/user/isManager'
    $http.get(managerUrl).success(function(response){
        user.isManager = response;
    }).error(function(response){
        console.log('error');
    });

    return user;
});

disclosure.factory('assignmentsFactory', function($http){

    var assignments = {};
    assignments.results = [];
    assignments.currentStatus = '';

    var url = '/ds-svc/tasking/myAssignments' + '?time' + currentTime;
    assignments.getMyAssignments = function (){
        $http.get(url).success(function(response){
            // console.log(response);
            assignments.results = response;
        }).error(function(response){
            console.log('error');
        });
    }

    assignments.changeStatus = function(newStatus, taskId, successCallback, errorCallback){
        var request = $http({
            method: "post",
            url: window.location.protocol + '//' + window.location.host + '/ds-svc/tasking/changeStatus',
            data: {'reviewStatus' : newStatus, 'taskId' : taskId}
        });

        request.success(function(response) {
            assignments.currentStatus = newStatus;
            // successCallback();
        }).error(function(){
            notifications.show("Unable to update this task",'error');
            // errorCallback();
        });
    }

    return assignments;
})

//Provides factory for formatting results
disclosure.factory('documentResultFormatFactory', ['$filter', function($filter){
    var formatter = {};

    formatter.formatSingleResult = function(document){
        // returns '17:19:03 16-11-2015' (example) to all date fields.
        function formatDate(date) {
            date = $filter('date')(date, 'HH:mm:ss dd-MM-yyyy');
            return date;
        }

        var row = {
            'Title': document.documentTitle,
            'informationType': document.informationType,
            'contentType': document.contentType,
            'displayItemName': document.displayItemName,
            'authorityVersionNumber': document.authorityVersionNum,
            'intelligenceUrn': document.intelligenceUrn,
            'status': document.status,
            'onHold': document.onHold,
            'lobDocType': document.lobDocType,
            'lobDocSubtype': document.lobDocSubtype,

            'createdBy': document.createdBy,
            'createdByDes': document.createdByDes,
            'createdDatetime': document.createdDatetime ? formatDate(document.createdDatetime) : '',
            'modifiedBy': document.modifiedBy,
            'modifiedByDes': document.modifiedByDes,
            'modifiedDatetime': document.modifiedDatetime ?  formatDate(document.modifiedDatetime) : '',
            'publishedBy': document.publishedBy,
            'publishedByDes': document.publishedByDes,
            'publishedDatetime': document.publishedDatetime ? formatDate(document.publishedDatetime) : '',

            'fileTitle': document.fileTitle,
            'fileType': document.fileType,
            'businessUrn': document.businessUrn,
            'fileUrn': document.fileUrn,
            'enterpriseKeywords': document.enterpriseKeywords,
            'codewords': document.codewords,
            'topicType': document.topicType,
            'theme': document.theme,
            'businessArea': document.businessArea,
            'fileDateCreated': document.fileDateCreated,
            'containerInternalName': document.containerInternalName,

            'linkworksDescription': document.linkworksDescription,
            'linkworksFilingArea': document.linkworksFilingArea,
            'source': document.source,

            'messageTo': document.messageTo,
            'messageFrom': document.messageFrom,
            'messageSentDate': document.messageSentDate ? formatDate(document.messageSentDate) : '',
            'messageReceivedDate': document.messageReceivedDate ? formatDate(document.messageReceivedDate) : '',

            'documentLinks': {
                'url': document.url,
                'preview': document.documentId
            }
        }
        return row;
    }
    //Given raw list of documents
    formatter.formatResults = function(results){
        formatted = [];

        if(results.resultCount != 0) {
            results.forEach(function(document){
                var row = formatter.formatSingleResult(document);
                formatted.push(row);
            });
        } else {
            notifications.show(notifications.settings.noSearchResults, 'error');
        }
        return formatted;
    }

    return formatter;
}]);
