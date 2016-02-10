// values for the number of rows to display each page
disclosure.value('rowsDisplayed', pageOptions = [
    {
        value: 10,
        label: '10'
    },
    {
        value: 25,
        label: '25'
    },
    {
        value: 100,
        label: '100'
    }
]);

// values for the filtering of saved searches and assignments
disclosure.value('filterSavedList', pageOptions = [
    {
        value: '',
        label: 'All'
    },
    {
        value: 'NEW',
        label: 'Not started'
    },
    {
        value: 'STARTED',
        label: 'In progress'
    },
    {
        value: 'COMPLETED',
        label: 'Completed'
    }
]);

disclosure.value('workOptions', workOptions = [
    {
        value: 'UNSET',
        label: 'Not set'
    },
    {
        value: 'NOTRELEVANT',
        label: 'Not relevant'
    },
    {
        value: 'RELEVANT',
        label: 'Relevant'
    }
]);

// table display options
disclosure.value('tableOptions', workOptions = [
    {
        value: 'Hidden'
    },
    {
        value: 'Displayed'
    }
]);

// columnOptions
// columns to hide (indexes below this value)
disclosure.value('columnOptionsOne', columnOptions = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
]);

disclosure.value('columnOptionsTwo', columnOptions = [
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18
]);

disclosure.value('columnOptionsThree', columnOptions = [
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29
]);

disclosure.value('columnOptionsFour', columnOptions = [
    30,
    31,
    32
]);

disclosure.value('columnOptionsFive', columnOptions = [
    33,
    34,
    35,
    36
]);

// values for the table headings
disclosure.value('tableHeadings', columnHeadings = [
    {
        "metaId": "Title",
        "heading": "Title",
        "index": 0
    },
    {
        "metaId": "informationType",
        "heading": "Information type",
        "index": 1
    },
    {
        "metaId": "contentType",
        "heading": "Content type",
        "index": 2
    },
    {
        "metaId": "displayItemName",
        "heading": "Display item name",
        "index": 3
    },
    {
        "metaId": "authorityVersionNumber",
        "heading": "Authority version number",
        "index": 4
    },
    {
        "metaId": "intelligenceUrn",
        "heading": "Intelligence urn",
        "index": 5
    },
    {
        "metaId": "status",
        "heading": "Status",
        "index": 6
    },
    {
        "metaId": "onHold",
        "heading": "On hold",
        "index": 7
    },
    {
        "metaId": "lobDocType",
        "heading": "Lob doctype",
        "index": 8
    },
    {
        "metaId": "lobDocSubtype",
        "heading": "Lob doc subtype",
        "index": 9
    },
    {
        "metaId": "createdBy",
        "heading": "Created by",
        "index": 10
    },
    {
        "metaId": "createdByDes",
        "heading": "Created by designation",
        "index": 11
    },
    {
        "metaId": "createdDatetime",
        "heading": "Creation date",
        "index": 12
    },
    {
        "metaId": "modifiedBy",
        "heading": "Modified by",
        "index": 13
    },
    {
        "metaId": "modifiedByDes",
        "heading": "Modified by designation",
        "index": 14
    },
    {
        "metaId": "modifiedDatetime",
        "heading": "Modified date",
        "index": 15
    },
    {
        "metaId": "publishedBy",
        "heading": "Published by",
        "index": 16
    },
    {
        "metaId": "publishedByDes",
        "heading": "Published by designation",
        "index": 17
    },
    {
        "metaId": "publishedDatetime",
        "heading": "Published date",
        "index": 18
    },
    {
        "metaId": "fileTitle",
        "heading": "File title",
        "index": 19
    },
    {
        "metaId": "fileType",
        "heading": "File type",
        "index": 20
    },
    {
        "metaId": "businessUrn",
        "heading": "Business urn",
        "index": 21
    },
    {
        "metaId": "fileUrn",
        "heading": "File urn",
        "index": 22
    },
    {
        "metaId": "enterpriseKeywords",
        "heading": "Enterprise keywords",
        "index": 23
    },
    {
        "metaId": "codewords",
        "heading": "Codewords",
        "index": 24
    },
    {
        "metaId": "topicType",
        "heading": "Topic type",
        "index": 25
    },
    {
        "metaId": "theme",
        "heading": "Theme",
        "index": 26
    },
    {
        "metaId": "businessArea",
        "heading": "Business area",
        "index": 27
    },
    {
        "metaId": "fileDateCreated",
        "heading": "File date created",
        "index": 28
    },
    {
        "metaId": "containerInternalName",
        "heading": "Container internal name",
        "index": 29
    },
    {
        "metaId": "linkworksDescription",
        "heading": "Linkworks description",
        "index": 30
    },
    {
        "metaId": "linkworksFilingArea",
        "heading": "Linkworks filing area",
        "index": 31
    },
    {
        "metaId": "source",
        "heading": "Source",
        "index": 32
    },
    {
        "metaId": "messageTo",
        "heading": "Message to",
        "index": 33
    },
    {
        "metaId": "messageFrom",
        "heading": "Message from",
        "index": 34
    },
    {
        "metaId": "messageSentDate",
        "heading": "Message sent date",
        "index": 35
    },
    {
        "metaId": "messageReceivedDate",
        "heading": "Message received date",
        "index": 36
    },
    {
        "metaId": "documentLinks",
        "heading": "Document links",
        "index": 37
    }
]);
