// round the percentage down to 1 decimal point
disclosure.filter('percentageRoundedFilter', function () {
    return function (field) {
        var roundedPercentage = 0;
        roundedPercentage = field.toFixed(3)*100;
        return Math.floor(roundedPercentage);
    }
});

// list the selected wildcards, namecuts, fuzzyness in the input field
// this is needed because the each value is in its own object not all in one.
disclosure.filter('fieldValueString', function () {
    return function (field) {
        var fieldString = [];

        if(field) {
            for(i = 0; i < field.length; i++) {
                fieldString.push(field[i].value);
            }
        }

        var formattedString = fieldString.join(', ');

        return field = formattedString;
    }
});

disclosure.filter('statusFilter', function () {
    return function (value) {
        var newValue = ''

        switch(value) {
            case 'COMPLETED':
                newValue = 'Completed'
                break;
            case 'NEW':
                newValue = 'Not started'
                break;
            case 'STARTED':
                newValue = 'In progress'
                break;
        }

        return value = newValue;
    }
});

// a filter to return the field name without camel casing
disclosure.filter('previewFieldFilter', function () {
    return function (field) {
        var newField = null;
        switch (field) {
            case 'accessGroups':
                newField = 'Access groups';
                break;
            case 'andGroups':
                newField = 'And groups';
                break;
            case 'authorityVersionNum':
                newField = 'Authority version number';
                break;
            case 'businessArea':
                newField = 'Business area';
                break;
            case 'businessUrn':
                newField = 'Business urn';
                break;
            case 'containerInternalName':
                newField = 'Container internal name';
                break;
            case 'containers':
                newField = 'Containers';
                break;
            case 'contentType':
                newField = 'Content type';
                break;
            case 'codewords':
                newField = 'Codewords';
                break;
            case 'createdBy':
                newField = 'Created by';
                break;
            case 'createdByDes':
                newField = 'Created by designation';
                break;
            case 'createdDatetime':
                newField = 'Creation date';
                break;
            case 'displayItemName':
                newField = 'Display item name';
                break;
            case 'documentId':
                newField = 'Document ID';
                break;
            case 'documentTitle':
                newField = 'Document title';
                break;
            case 'documentType':
                newField = 'Document type';
                break;
            case 'enterpriseKeywords':
                newField = 'Enterprise keywords';
                break;
            case 'fileDateCreated':
                newField = 'File date created';
                break;
            case 'fileTitle':
                newField = 'File title';
                break;
            case 'fileType':
                newField = 'File type';
                break;
            case 'fileUrn':
                newField = 'File urn';
                break;
            case 'filingArea':
                newField = 'Filing area';
                break;
            case 'informationType':
                newField = 'Information type';
                break;
            case 'intelligenceUrn':
                newField = 'Intelligence urn';
                break;
            case 'linkworksDescription':
                newField = 'Linkworks description';
                break;
            case 'linkworksFilingArea':
                newField = 'Linkworks filing area';
                break;
            case 'lobDocType':
                newField = 'Loc doctype';
                break;
            case 'lobDocSubtype':
                newField = 'Loc sub doctype';
                break;
            case 'messageFrom':
                newField = 'Message from';
                break;
            case 'messageSentDate':
                newField = 'Message sent date';
                break;
            case 'messageReceivedDate':
                newField = 'Message received date';
                break;
            case 'messageTo':
                newField = 'Message to';
                break;
            case 'modifiedBy':
                newField = 'Modified by';
                break;
            case 'modifiedByDes':
                newField = 'Modified by designation';
                break;
            case 'modifiedDatetime':
                newField = 'Modified date';
                break;
            case 'modifiedTime':
                newField = 'Modified time';
                break;
            case 'nationalCaveats':
                newField = 'National caveats';
                break;
            case 'onHold':
                newField = 'On hold';
                break;
            case 'orGroups':
                newField = 'Or groups';
                break;
            case 'permittedOrganisations':
                newField = 'Permitted organisations';
                break;
            case 'publishedBy':
                newField = 'Published by';
                break;
            case 'publishedByDes':
                newField = 'Published by designation';
                break;
            case 'publishedDatetime':
                newField = 'Published date';
                break;
            case 'securityClassification':
                newField = 'Security classification';
                break;
            case 'source':
                newField = 'Source';
                break;
            case 'status':
                newField = 'Status';
                break;
            case 'structuredReference':
                newField = 'Structured reference';
                break;
            case 'theme':
                newField = 'Theme';
                break;
            case 'topicType':
                newField = 'Topic type';
                break;
            case 'url':
                newField = 'Url';
                break;
        }

        return field = newField
    }
});
