// Don't use 'var SWBL' - some engines call this within a non-global scope
// if using var we end up defining this in the wrong scope

if ("undefined" == typeof SWBL) {
    SWBL = {};
}

SWBL.analyzeSpread = function analyzeSpread(in_spread) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {

        try {

            if (! (in_spread instanceof Spread)) {
                SWBL.logError(arguments, "need in_spread");
                break;
            }

            var spreadData = {};
            spreadData.fields = {};
            //
            // by root -> by typeIdx -> .indexedRepeatedItems -> by recordIdx -> by repeated element
            // If without recordIdx:
            // by root -> by typeIdx -> .nonIndexedRepeatedItems -> by repeated element
            //

            var allPageItems = in_spread.allPageItems.slice(0);
            for (var pageItemIdx = 0; pageItemIdx < allPageItems.length; pageItemIdx++) {
                do {
                    try {
                        var pageItem = allPageItems[pageItemIdx];

                        var pageItemId = pageItem.id;

                        var scriptLabel = SWBL.trim(pageItem.label);
                        if (! scriptLabel) {
                            break;
                        }

                        var parsedScriptLabel = SWBL.parseScriptLabel(scriptLabel);
                        if (! parsedScriptLabel) {
                            break;
                        }

                        if (parsedScriptLabel.type == SWBL.C.LOWERCASE_LABEL_SWATCH) {
                            pageItem.fillColor = "None";
                        }
                        else if (pageItem instanceof TextFrame) {
                            pageItem.parentStory.contents = "";
                        }

                        var pageItemInfo = {
                            id: pageItem.id,
                            root: parsedScriptLabel.root,
                            name: parsedScriptLabel.name,
                            typeIdx: parsedScriptLabel.typeIdx,
                            recordIdx: parsedScriptLabel.recordIdx
                        };

                        var pageItemsByTypeIdx = spreadData.fields[parsedScriptLabel.root];
                        if (! pageItemsByTypeIdx) {
                            pageItemsByTypeIdx = [];
                            spreadData.fields[parsedScriptLabel.root] = pageItemsByTypeIdx;
                        }

                        var pageItemsByRecordIdx = pageItemsByTypeIdx[parsedScriptLabel.typeIdx];
                        if (! pageItemsByRecordIdx) {
                            pageItemsByRecordIdx = {
                                nonIndexedRepeatedItems: undefined,
                                indexedRepeatedItems: []
                            };
                            pageItemsByTypeIdx[parsedScriptLabel.typeIdx] = pageItemsByRecordIdx;
                        }

                        if (parsedScriptLabel.recordIdx === undefined) {
                            var repeatedPageItems = pageItemsByRecordIdx.nonIndexedRepeatedItems;
                            if (! repeatedPageItems) {
                                repeatedPageItems = [];
                                pageItemsByRecordIdx.nonIndexedRepeatedItems = repeatedPageItems;
                            }
                        }
                        else {
                            var repeatedPageItems = pageItemsByRecordIdx.indexedRepeatedItems[parsedScriptLabel.recordIdx];
                            if (! repeatedPageItems) {
                                repeatedPageItems = [];
                                pageItemsByRecordIdx.indexedRepeatedItems[parsedScriptLabel.recordIdx] = repeatedPageItems;
                            }

                        }

                        repeatedPageItems.push(pageItemInfo);

                        if (
                            pageItemsByRecordIdx.minRecordIdx === undefined 
                        || 
                            pageItemsByRecordIdx.minRecordIdx > parsedScriptLabel.recordIdx
                        ) {
                            pageItemsByRecordIdx.minRecordIdx = parsedScriptLabel.recordIdx;
                        }

                        if (
                            pageItemsByRecordIdx.maxRecordIdx === undefined 
                        || 
                            pageItemsByRecordIdx.maxRecordIdx < parsedScriptLabel.recordIdx
                        ) {
                            pageItemsByRecordIdx.maxRecordIdx = parsedScriptLabel.recordIdx;
                        }

                        if (
                            spreadData.minRecordIdx === undefined 
                        || 
                            spreadData.minRecordIdx > parsedScriptLabel.recordIdx
                        ) {
                            spreadData.minRecordIdx = parsedScriptLabel.recordIdx;
                        }

                        if (
                            spreadData.maxRecordIdx === undefined 
                        || 
                            spreadData.maxRecordIdx < parsedScriptLabel.recordIdx
                        ) {
                            spreadData.maxRecordIdx = parsedScriptLabel.recordIdx;
                        }

                        if (
                            spreadData.maxTypeIdx === undefined 
                        || 
                            spreadData.maxTypeIdx < parsedScriptLabel.typeIdx
                        ) {
                            spreadData.maxTypeIdx = parsedScriptLabel.typeIdx;
                        }

                    }
                    catch (err) {
                        SWBL.logError(arguments, "page item throws " + err);
                    }
                }
                while (false);
            }

            retVal = spreadData;

        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.csvLineSplit = function csvLineSplit(in_csvLine) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {

        try {

            if (! in_csvLine) {
                SWBL.logError(arguments, "need in_csvLine");
                break;
            }

            var charPos = 0;
            var fields = [];
            var state = SWBL.C.CSV_STATE_IDLE;
            var curField = "";
            var curUnquotedSpaces = "";
            while (charPos < in_csvLine.length) {
                var c = in_csvLine.charAt(charPos);
                charPos++;
                switch (state) {
                    case SWBL.C.CSV_STATE_IDLE:
                        if (c == ' ' || c == '\t') {
                            state = SWBL.C.CSV_STATE_IDLE; // retain same state
                        }
                        else if (c == ',') {
                            // an empty field
                            fields.push("");
                            state = SWBL.C.CSV_STATE_IDLE; // retain same state
                        }
                        else if (c == '"') {
                            state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE;                            
                        }
                        else {
                            curField += c;
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD;
                        }
                        break;
                    case SWBL.C.CSV_STATE_UNQUOTED_FIELD:
                        if (c == ',') {
                            // end of unquoted field
                            fields.push(curField);
                            curField = "";
                            curUnquotedSpaces = "";
                            state = SWBL.C.CSV_STATE_IDLE;
                        }
                        else if (c == ' ' || c == '\t') {
                            curUnquotedSpaces += c;
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD; // retain same state
                        }
                        else {
                            curField += curUnquotedSpaces + c;
                            curUnquotedSpaces = "";
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD; // retain same state
                        }
                        break;
                    case SWBL.C.CSV_STATE_SEEN_1ST_QUOTE:
                        if (c == '\\') {
                            state = SWBL.C.CSV_STATE_ESCAPED;
                        }
                        else if (c == '"') {
                            state = SWBL.C.CSV_STATE_SEEN_2ND_QUOTE;
                        }
                        else {
                            curField += c;
                            state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE; // retain same state
                        }
                        break;
                    case SWBL.C.CSV_STATE_ESCAPED:
                        curField += c;
                        state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE;
                        break;
                    case SWBL.C.CSV_STATE_SEEN_2ND_QUOTE:
                        if (c == '"') { // Allow double-up double quote inside quotes to be seen as an escaped quote
                            curField += c;
                            state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE; // retain same state
                        }
                        else if (c == ' ' || c == '\t') {
                            state = SWBL.C.CSV_STATE_AWAITING_COMMA;
                        }
                        else if (c == ',') { 
                            fields.push(curField);
                            curField = "";
                            state = SWBL.C.CSV_STATE_IDLE;
                        }
                        else {
                            fields.push(curField);
                            curField = "";
                            curField += c;
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD;
                        }
                        break;
                    case SWBL.C.CSV_STATE_AWAITING_COMMA:
                        if (c == ',') { 
                            fields.push(curField);
                            curField = "";
                            state = SWBL.C.CSV_STATE_IDLE;
                        }
                        else if (c == ' ' || c == '\t') {
                            state = SWBL.C.CSV_STATE_AWAITING_COMMA; // retain same state
                        }
                        else if (c == '"') {
                            // Assume the comma was missing, and pretend there was one
                            fields.push(curField);
                            curField = "";
                            state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE;                            
                        }
                        else {
                            fields.push(curField);
                            curField = "";
                            curField += c;
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD;
                        }
                        break;
                }
            }
            if (state != SWBL.C.CSV_STATE_IDLE) {
                fields.push(curField);
            }

            retVal = fields;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.getFieldValue = function getFieldValue(in_config, in_fieldName, in_csvRecord) {

    var retVal = "";

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_config) {
                SWBL.logError(arguments, "need in_config");
                break;
            }

            if (! in_fieldName) {
                SWBL.logError(arguments, "need in_fieldName");
                break;
            }

            if (! in_csvRecord) {
                SWBL.logError(arguments, "need in_csvRecord");
                break;
            }

            var fieldIdx = undefined;
            var fieldNameLowerCase = in_fieldName.toLowerCase();

            if (! (fieldNameLowerCase in in_config.lowerCasedFieldSet)) {
                break;
            }

            var fieldIdx = in_config.lowerCasedFieldSet[fieldNameLowerCase];
            if (fieldIdx === undefined) {
                SWBL.logError(arguments, "Unknown field " + in_fieldName);
                break;
            }

            if (fieldIdx < 0 || fieldIdx >= in_csvRecord.length) {
                break;
            }

            retVal = in_csvRecord[fieldIdx];

            if (in_config.csvMap.rounding) {
                var normalizedFieldName = SWBL.getNormalizedFieldName(in_fieldName);
                if (normalizedFieldName in in_config.csvMap.rounding) {
                    var digits = parseInt(in_config.csvMap.rounding[normalizedFieldName], 10);
                    var value = parseFloat(retVal);
                    var shifter = digits;
                    while (shifter > 0) {
                        value = value * 10;
                        shifter--;
                    }
                    value = Math.floor(value + 0.5) + "";
                    if (digits > 0) {
                        value = value.substr(0,value.length - digits) + "." + value.substr(value.length - digits);
                    }
                    retVal = value;
                }
            }
      
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.getFieldValueByRecordIdx = function getFieldValueByRecordIdx(in_config, in_fieldName, in_recordIdx) {

    var retVal = "";

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_config) {
                SWBL.logError(arguments, "need in_config");
                break;
            }

            if (! in_fieldName) {
                SWBL.logError(arguments, "need in_fieldName");
                break;
            }

            if (in_recordIdx === undefined) {
                SWBL.logError(arguments, "need in_recordIdx");
                break;
            }

            if (in_recordIdx < 0 || in_recordIdx >= in_config.data.length) {
                break;
            }

            var csvRecord = in_config.data[in_recordIdx];

            retVal = SWBL.getFieldValue(in_config, in_fieldName, csvRecord);
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.getRecordCount = function getRecordCount(in_config) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_config) {
                SWBL.logError(arguments, "need in_config");
                break;
            }

            retVal = in_config.data.length;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.getNormalizedFieldName = function getNormali(in_fieldName) {

    var retVal = in_fieldName;

    SWBL.logEntry(arguments);

    do {

        try {

            var fieldName = in_fieldName.toLowerCase();
            var rootName = fieldName.replace(SWBL.REGEXP_EXTRACT_ROOT, "$1");
            var typeIdx = fieldName.replace(SWBL.REGEXP_EXTRACT_TYPEINDEX,"$1");
            if (typeIdx) {
                typeIdx = parseInt(typeIdx, 10);
                if (typeIdx == NaN || typeIdx < 0) {
                    typeIdx = "";
                    rootName = fieldName;
                }
            }
            if (! typeIdx) {
                typeIdx = 1;
            }

            retVal = rootName + typeIdx;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.injectData = function injectData(io_document, in_config) {

    var success = false;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! (io_document instanceof Document)) {
                SWBL.logError(arguments, "need io_document");
                break;
            }
            
            if (! in_config) {
                SWBL.logError(arguments, "need in_config");
                break;
            }

            var recordCount = SWBL.getRecordCount(in_config);
            if (! recordCount) {
                SWBL.logError(arguments, "0 records");
                break;
            }

            var spreadState = {};
            spreadState.spreadIdx = 0;
            spreadState.recordsUsedOnSpread = 0;
            spreadState.recordIdx = undefined;
            spreadState.spread = undefined;
            spreadState.colorGroup = undefined;
            spreadState.recordCountToProcess = recordCount;
            spreadState.recordIdx = 0;

            success = true;

            while (spreadState.recordCountToProcess > 0) {

                success = SWBL.injectField(io_document, in_config, spreadState, SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP);
                if (! success) {
                    break;
                }

                success = SWBL.injectField(io_document, in_config, spreadState, SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE);
                if (! success) {
                    break;
                }

                for (var lowerCaseFieldName in in_config.lowerCasedFieldSet) {
                    if (lowerCaseFieldName) {
                        success = SWBL.injectField(io_document, in_config, spreadState, lowerCaseFieldName);
                        if (! success) {
                            break;
                        }
                    }
                }
                if (! success) {
                    break;
                }

                for (var typeIdx = 1; typeIdx <= spreadState.spreadInfo.maxTypeIdx; typeIdx++) {
                    success = SWBL.injectField(io_document, in_config, spreadState, SWBL.C.LOWERCASE_LABEL_SWATCH + typeIdx);
                    if (! success) {
                        break;
                    }
                }
                if (! success) {
                    break;
                }

                spreadState.recordsUsedOnSpread++;
                spreadState.recordCountToProcess--;
                spreadState.recordIdx++;
            }

        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
            success = false;
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return success;
}

SWBL.injectField = function injectField(io_document, in_config, io_spreadState, in_lowerCaseFieldName) {

    var success = false;

    SWBL.logEntry(arguments);

    do {

        try {

            if (! (io_document instanceof Document)) {
                SWBL.logError(arguments, "need io_document");
                break;
            }
            
            if (! in_config) {
                SWBL.logError(arguments, "need in_config");
                break;
            }

            if (! io_spreadState) {
                SWBL.logError(arguments, "need io_spreadState");
                break;
            }

            if (! in_lowerCaseFieldName) {
                SWBL.logError(arguments, "need in_lowerCaseFieldName");
                break;
            }

            var rootName = in_lowerCaseFieldName.replace(SWBL.REGEXP_EXTRACT_ROOT, "$1");
            var typeIdx = in_lowerCaseFieldName.replace(SWBL.REGEXP_EXTRACT_TYPEINDEX,"$1");
            if (typeIdx) {
                typeIdx = parseInt(typeIdx, 10);
            }

            if (io_spreadState.initialized) {

                var skippedRecords = 0;
                if (io_spreadState.colorGroupRecordIdx != io_spreadState.recordIdx) {
                    io_spreadState.colorGroupRecordIdx = io_spreadState.recordIdx;
                    var colorGroup = SWBL.getFieldValueByRecordIdx(in_config, SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP, io_spreadState.recordIdx);
                    if (colorGroup != io_spreadState.colorGroup) {
                        io_spreadState.colorGroup = colorGroup;
                        var groupSkippedRecords = io_spreadState.spreadRecordCount - io_spreadState.recordsUsedOnSpread;
                        if (groupSkippedRecords > skippedRecords) {
                            skippedRecords = groupSkippedRecords;
                        }
                    }
                }

                if (io_spreadState.colorPageRecordIdx != io_spreadState.recordIdx) {
                    io_spreadState.colorPageRecordIdx = io_spreadState.recordIdx;
                    var colorPage = SWBL.getFieldValueByRecordIdx(in_config, SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE, io_spreadState.recordIdx);
                    if (colorPage != "") {
                        if (colorPage != io_spreadState.colorPage) {
                            io_spreadState.colorPage = colorPage;
                            var pageSkippedRecords = io_spreadState.spreadRecordCount - io_spreadState.recordsUsedOnSpread;
                            if (pageSkippedRecords > skippedRecords) {
                                skippedRecords = pageSkippedRecords;
                            }
                        }
                    }
                }

                io_spreadState.recordsUsedOnSpread += skippedRecords;

                if (io_spreadState.recordsUsedOnSpread >= io_spreadState.spreadRecordCount) {
                    io_spreadState.spreadIdx++;
                    io_spreadState.spread = undefined;
                    io_spreadState.recordsUsedOnSpread = 0;
                    io_spreadState.maxRecordIdx = undefined;
                    io_spreadState.initializedColorPage = undefined;
                }
            }

            if (io_spreadState.spreadIdx >= io_document.spreads.length) {
                var needNewSection = false;
                if (io_spreadState.colorPage) {
                    var colorPage = parseInt(io_spreadState.colorPage, 10);
                    var lastSpread = io_document.spreads.lastItem();
                    var lastPage = lastSpread.pages.firstItem();
                    var lastPageNumber = parseInt(lastPage.name);
                    if (colorPage != lastPageNumber + 1) {
                        needNewSection = true;
                    }
                }
                while (io_spreadState.spreadIdx >= io_document.spreads.length) {
                    io_document.spreads.lastItem().duplicate();
                }
                if (needNewSection) {
                    lastSpread = io_document.spreads.lastItem();
                    lastPage = lastSpread.pages.firstItem();
                    var newSection = io_document.sections.add(lastPage);
                    newSection.continueNumbering = false;
                }           
            }

            if (io_spreadState.spread == undefined) {

                io_spreadState.spread = io_document.spreads.item(io_spreadState.spreadIdx);
                var spreadInfo = SWBL.analyzeSpread(io_spreadState.spread);

                if (! spreadInfo) {
                    SWBL.logError(arguments, "need spreadInfo");
                    success = false;
                    break;
                }

                io_spreadState.spreadInfo = spreadInfo;
                for (var typeIdx = 1; typeIdx <= spreadInfo.maxTypeIdx; typeIdx++) {
                    for (var scanRootName in spreadInfo.fields) {
                        var rootInfo = spreadInfo.fields[scanRootName];
                        if (typeIdx in rootInfo) {
                            var fieldInfo = rootInfo[typeIdx];
                            if (fieldInfo.minRecordIdx != 0) {
                                for (var missingMinIdx = 0; missingMinIdx < fieldInfo.minRecordIdx; missingMinIdx++) {
                                    SWBL.logWarning(arguments, "Spread is missing " + scanRootName + typeIdx + "_" + (missingMinIdx+1));
                                }
                            }
                            if (io_spreadState.maxRecordIdx === undefined) {
                                io_spreadState.maxRecordIdx = fieldInfo.maxRecordIdx;
                                io_spreadState.maxRecordIdxIsForField = scanRootName + typeIdx;
                            }
                            else {
                                if (io_spreadState.maxRecordIdx != fieldInfo.maxRecordIdx) {
                                    SWBL.logWarning(arguments, "Spread has incorrect number of occurrences for certain fields: " + io_spreadState.maxRecordIdxIsForField + " vs. " + scanRootName + typeIdx);
                                }
                                if (io_spreadState.maxRecordIdx < fieldInfo.maxRecordIdx) {
                                    io_spreadState.maxRecordIdx = fieldInfo.maxRecordIdx;
                                }
                            }
                        }
                    }

                }

                io_spreadState.spreadRecordCount = spreadInfo.maxRecordIdx + 1;

                if (! io_spreadState.initialized) {
                    io_spreadState.initialized = true;

                    io_spreadState.colorGroupRecordIdx = io_spreadState.recordIdx;
                    io_spreadState.colorGroup = SWBL.getFieldValueByRecordIdx(in_config, SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP, io_spreadState.recordIdx);

                    io_spreadState.colorPageRecordIdx = io_spreadState.recordIdx;
                    io_spreadState.colorPage = SWBL.getFieldValueByRecordIdx(in_config, SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE, io_spreadState.recordIdx);
                }

                if (io_spreadState.initializedColorPage === undefined) {
                    io_spreadState.initializedColorPage = io_spreadState.colorPage;
                    var page = io_spreadState.spread.pages.firstItem();
                    var pageName = page.name;
                    if (io_spreadState.colorPage && pageName != io_spreadState.colorPage) {
                       var section = page.appliedSection;
                       section.sectionPrefix = "";
                       section.pageNumberStart = parseInt(io_spreadState.colorPage, 10);
                    }
                }

            }

            success = true;

            var curSpreadEntryIdx = io_spreadState.recordsUsedOnSpread;

            if (rootName == SWBL.C.LOWERCASE_LABEL_SWATCH) {
                var swatchPageItemInfoLists = undefined;
                var spreadInfo;
                var spreadInfoFields;
                var swatchFields;
                var swatchField;
                var swatchRepeatedItems;
                if (
                    (spreadInfo = io_spreadState.spreadInfo)
                &&
                    (spreadInfoFields = spreadInfo.fields)
                &&
                    (swatchFields = spreadInfoFields[SWBL.C.LOWERCASE_LABEL_SWATCH])
                &&
                    (swatchField = swatchFields[typeIdx])
                &&
                    (swatchRepeatedItems = swatchField.indexedRepeatedItems)
                ) {
                    swatchPageItemInfoLists = swatchRepeatedItems[curSpreadEntryIdx];
                    for (var swatchPageItemIdx = 0; swatchPageItemIdx < swatchPageItemInfoLists.length; swatchPageItemIdx++) {
                        var swatchPageItemInfo = swatchPageItemInfoLists[swatchPageItemIdx];
                        var swatchPageItem = io_spreadState.spread.pageItems.itemByID(swatchPageItemInfo.id);
                        // Upcast from PageItem to more specific class
                        swatchPageItem = swatchPageItem.getElements()[0];
                        var rawRecord = in_config.data[io_spreadState.recordIdx];
                        var record = rawRecord.colorDataByTypeIdx[typeIdx];
                        var colorSpace = record.colorSpace;
                        var color = undefined;
                        if (io_spreadState.recordIdx < in_config.data.length) {
                            switch (colorSpace) {
                                case SWBL.C.LOWERCASE_COLORSPACE_CMYK:
                                    color = io_document.colors.add({
                                        model: ColorModel.PROCESS,
                                        space: ColorSpace.CMYK,
                                        colorValue: [ record.cyan, record.magenta, record.yellow, record.black ]
                                    });
                                    break;
                                case SWBL.C.LOWERCASE_COLORSPACE_RGB:
                                    color = io_document.colors.add({
                                        model: ColorModel.PROCESS,
                                        space: ColorSpace.RGB,
                                        colorValue: [ record.red, record.green, record.blue ]
                                    });
                                    break;
                                case SWBL.C.LOWERCASE_COLORSPACE_LAB:
                                    color = io_document.colors.add({
                                        model: ColorModel.PROCESS,
                                        space: ColorSpace.LAB,
                                        colorValue: [ record.L, record.a, record.b ]
                                    });
                                    break;
                            }
                        }
                        if (color) {
                            swatchPageItem.fillColor = color;
                        }
                        else {
                            swatchPageItem.fillColor = "None";
                        }
                    }
                }
                break;
            }

            var pageItemsForRootInfo = io_spreadState.spreadInfo.fields[rootName];
            if (! pageItemsForRootInfo) {
                break;
            }
            
            var pageItemsForFieldInfo = pageItemsForRootInfo[typeIdx];
            if (! pageItemsForFieldInfo || ! pageItemsForFieldInfo.indexedRepeatedItems) {
                break;
            }

            var pageItemInfoList = pageItemsForFieldInfo.indexedRepeatedItems[curSpreadEntryIdx];
            if (! pageItemInfoList) {
                SWBL.logWarning(arguments, "Spread is missing " + in_lowerCaseFieldName + "_" + (curSpreadEntryIdx + 1));
                break;
            }

            for (var pageItemIdx = 0; pageItemIdx < pageItemInfoList.length; pageItemIdx++) {
                var pageItemInfo = pageItemInfoList[pageItemIdx];
                var pageItem = io_spreadState.spread.pageItems.itemByID(pageItemInfo.id);
                // Upcast from PageItem to more specific class
                pageItem = pageItem.getElements()[0];
                if (pageItem instanceof TextFrame) {

                    var parentStory = pageItem.parentStory;

                    var fieldValue = SWBL.getFieldValueByRecordIdx(in_config, in_lowerCaseFieldName, io_spreadState.recordIdx);
                    if (! fieldValue) {
                        fieldValue = "";
                    }

                    parentStory.insertionPoints.item(0).contents = fieldValue;
                }
            }
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
            success = false;
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return success;
}

SWBL.openTemplate = function openTemplate(in_csvFile) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_csvFile) {
                SWBL.logError(arguments, "need in_csvFile");
                break;
            }

            if (! (in_csvFile instanceof File)) {
                SWBL.logError(arguments, "need in_csvFile to be a File");
                break;
            }

            if (! in_csvFile.exists) {
                SWBL.logError(arguments, "in_csvFile does not exist");
                break;
            }

            var parentFolder = in_csvFile.parent;
            var templateFile = File(parentFolder + "/" + SWBL.C.FILENAME_TEMPLATE);
            if (! templateFile.exists) {
                SWBL.logError(arguments, "templateFile does not exist");
                break;
            }

            var document = app.open(templateFile);

            retVal = document;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.parseCSV = function parseCSV(in_csvFile, in_optionalCSVMap) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_csvFile) {
                SWBL.logError(arguments, "need in_csvFile");
                break;
            }

            if (! (in_csvFile instanceof File)) {
                SWBL.logError(arguments, "need in_csvFile to be a File");
                break;
            }

            if (! in_csvFile.exists) {
                SWBL.logError(arguments, "in_csvFile does not exist");
                break;
            }

            in_csvFile.encoding = "UTF-8";
            in_csvFile.open("r");
            var csvText = in_csvFile.read();
            in_csvFile.close();

            // Try CR+LF, then try CR, then try LF for line endings
            // to allow Windows, old Mac and new Mac text files
            var csvLines = csvText.split("\015\012");
            if (csvLines.length <= 1) {
                var csvLines = csvText.split("\015");
                if (csvLines.length <= 1) {
                    var csvLines = csvText.split("\012");
                }
            }

            var parsedData = undefined;
            for (var csvLineIdx = 0; csvLineIdx < csvLines.length; csvLineIdx++) {
                var csvLine = SWBL.trim(csvLines[csvLineIdx]);
                if (csvLine != "" && csvLine.charAt(0) != SWBL.C.CHAR_COMMENT_LINE) {
                    var csvFields = SWBL.csvLineSplit(csvLine);
                    if (! parsedData) {    
                        // First data line are column headers                
                        if (csvFields && csvFields.length >= 1) {
                            parsedData = {};
                            parsedData.fieldList = csvFields;
                            parsedData.lowerCasedFieldSet = {};
                            parsedData.data = [];
                            for (var fieldIdx = 0; fieldIdx < csvFields.length; fieldIdx++) {
                                var lowerCaseFieldName = csvFields[fieldIdx].toLowerCase();
                                if (
                                    in_optionalCSVMap 
                                && 
                                    in_optionalCSVMap.fieldMapCSVToInternal
                                && 
                                    in_optionalCSVMap.fieldMapCSVToInternal[lowerCaseFieldName]
                                ) {
                                    lowerCaseFieldName = in_optionalCSVMap.fieldMapCSVToInternal[lowerCaseFieldName]
                                }

                                var normalizedFieldName = SWBL.getNormalizedFieldName(lowerCaseFieldName);
                                parsedData.lowerCasedFieldSet[normalizedFieldName] = fieldIdx;
                            }
                        }
                    }
                    else {
                        parsedData.data.push(csvFields);
                    }
                }
            }

            var success = SWBL.processConfig(parsedData, in_optionalCSVMap);
            if (! success) {
                SWBL.logError(arguments, "failed to process parsedData");
                break;
            }

            retVal = parsedData;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.REGEXP_EXTRACT_ROOT = /^([^_]*?)(\d*)(_.*)?$/;
SWBL.REGEXP_EXTRACT_TYPEINDEX = /^[^_]*?(\d*)(_.*)?$/;
SWBL.REGEXP_EXTRACT_RECORDINDEX = /^[^_]*_(\d*)$/;

SWBL.parseScriptLabel = function parseScriptLabel(in_label) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {

        try {

            if (! in_label) {
                SWBL.logError(arguments, "need in_label");
                break;
            }

            var label = SWBL.trim(in_label.toLowerCase());

            // Labels are of the form 
            //
            //   swatch
            //   colorpage
            //   colorgroup
            //   name
            // 
            //   Labels can have two indices appended to them.
            //
            //   A name can be followed immediately by a numerical index (e.g. when showing two
            //   color swatches per record - we can have swatch1 and swatch2)
            //  
            //   A name without numerical suffix is handled the same as '1' - e.g. 'swatch' === 'swatch1'
            // 
            //   Additionally, they can be followed by an underscore and an record number index
            //
            //   name_idx (e.g. swatch_3, swatch2_3, name2_3 would be elements that correspond to the
            //   third record on the page).
            // 
            //   In short: the first index is attached to the label (no separator) and the second index
            //   is prefixed with an underscore
            //
            //   Both idx in the script label are 1-based
            // 


            var rootName = label.replace(SWBL.REGEXP_EXTRACT_ROOT,"$1");
            if (! rootName) {
                break;
            }
            var itemName = rootName;

            var typeIdx = label.replace(SWBL.REGEXP_EXTRACT_TYPEINDEX,"$1");
            if (typeIdx) {
                var numTypeIdx = parseInt(typeIdx, 10);
                if (numTypeIdx == NaN || numTypeIdx < 1) {
                    itemName += typeIdx;
                    typeIdx = "";
                }
                else {
                    typeIdx = numTypeIdx;
                }
            }
            if (! typeIdx) {
                typeIdx = 1;
            }
            itemName += typeIdx;

            var recordIdx = label.replace(SWBL.REGEXP_EXTRACT_RECORDINDEX,"$1");

            if (! recordIdx) {

                if (itemName == SWBL.C.LOWERCASE_LABEL_COLORGROUP) {
                    retVal = {
                        type: SWBL.C.LOWERCASE_LABEL_COLORGROUP,
                        root: rootName,
                        name: itemName,
                        typeIdx: typeIdx
                    };
                    break;
                }

                if (itemName == SWBL.C.LOWERCASE_LABEL_COLORPAGE) {
                    retVal = {
                        type: SWBL.C.LOWERCASE_LABEL_COLORPAGE,
                        root: rootName,
                        name: itemName,
                        typeIdx: typeIdx
                    };
                    break;
                }

                retVal = {
                    type: SWBL.C.LOWERCASE_LABEL_FIELD,
                    root: rootName,
                    name: itemName,
                    typeIdx: typeIdx
                };                
                break;
            }

            recordIdx = parseInt(recordIdx, 10);
            if (recordIdx == NaN || recordIdx < 1) {
                break;
            }

            // Swap 1-based index with 0-based index
            recordIdx--;

            if (rootName == SWBL.C.LOWERCASE_LABEL_SWATCH) {
                retVal = {
                    type: SWBL.C.LOWERCASE_LABEL_SWATCH,
                    root: rootName,
                    name: itemName,
                    typeIdx: typeIdx,
                    recordIdx: recordIdx
                };
                break;
            }

            retVal = {
                type: SWBL.C.LOWERCASE_LABEL_INDEXED_FIELD,
                root: rootName,
                name: itemName,
                typeIdx: typeIdx,
                recordIdx: recordIdx
            };

            break;

        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.processConfig = function processConfig(io_config, in_optionalCSVMap) {

    var success = false;

    SWBL.logEntry(arguments);

    do {
        try {
            if (! io_config) {
                SWBL.logError(arguments, "need io_config");
                break;
            }

            if (! io_config.lowerCasedFieldSet) {
                SWBL.logError(arguments, "need io_config.lowerCasedFieldSet");
                break;
            }

            if (
            !   (            
                    (SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP in io_config.lowerCasedFieldSet)
                ||
                    (in_optionalCSVMap && (SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP in in_optionalCSVMap.fieldMapInternalToDefault))
                ) 
            ) {
                SWBL.logError(arguments, "need field " + SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP);
                break;
            }

            if (
            !   (            
                    (SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE in io_config.lowerCasedFieldSet)
                ||
                    (in_optionalCSVMap && (SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE in in_optionalCSVMap.fieldMapInternalToDefault))
                ) 
            ) {
                SWBL.logError(arguments, "need field " + SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE);
                break;
            }


            var colorGroupFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP];
            var colorPageFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE];

            if (! io_config.data) {
                SWBL.logError(arguments, "no color data");
                break;
            }

            if (io_config.data.length <= 0) {
                SWBL.logError(arguments, "no color data");
                break;
            }

            success = true;   

            var typeIdx = 1;

            do {         

                var colorNameFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORNAME + typeIdx];
                var colorSpaceFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORSPACE + typeIdx];

                var cyanFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_CYAN + typeIdx];
                var magentaFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_MAGENTA + typeIdx];
                var yellowFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_YELLOW + typeIdx];
                var blackFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_BLACK + typeIdx];

                var redFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_RED + typeIdx];
                var greenFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_GREEN + typeIdx];
                var blueFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_BLUE + typeIdx];

                var lFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_L + typeIdx];
                var aFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_A + typeIdx];
                var bFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_B + typeIdx];

                io_config.csvMap = in_optionalCSVMap;

                var typeIsPresent = false;
                var allColorsForTypeAreOK = true;

                for (var colorIdx = 0; colorIdx < io_config.data.length; colorIdx++) {

                    do {

                        var colorIsOK = true;

                        var colorRecord = io_config.data[colorIdx];

                        var colorDataByTypeIdx = colorRecord.colorDataByTypeIdx;
                        if (! colorDataByTypeIdx) {
                            colorDataByTypeIdx = [];
                            colorRecord.colorDataByTypeIdx = colorDataByTypeIdx;
                        }

                        var colorName = colorRecord[colorNameFieldIdx];
                        if (in_optionalCSVMap && colorName === undefined) {
                            colorName = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_COLORNAME + typeIdx];
                        }
                        var colorSpace = colorRecord[colorSpaceFieldIdx];
                        if (in_optionalCSVMap && colorSpace === undefined) {
                            colorSpace = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_COLORSPACE + typeIdx];
                        }

                        if (! colorSpace && ! colorName) {
                            break;
                        }

                        colorIsOK = false;
                        typeIsPresent = true;

                        var colorData = {};

                        if (! colorSpace) {
                            SWBL.logError(arguments, "missing colorspace" + typeIdx + " for color #" + (colorIdx + 1));
                            break;
                        }
                        var lowercaseColorSpace = colorSpace.toLowerCase();                        
                        if (! (lowercaseColorSpace in SWBL.C.SET_LOWERCASE_COLORSPACE)) {
                            SWBL.logError(arguments, "unexpected colorspace" + typeIdx + " for color #" + (colorIdx + 1));
                            break;
                        }

                        if (! colorName) {
                            SWBL.logError(arguments, "missing colorname" + typeIdx + " for color #" + (colorIdx + 1));
                            break;
                        }

                        if (typeIdx == 1) {

                            var colorGroup = colorRecord[colorGroupFieldIdx];
                            if (in_optionalCSVMap && colorGroup === undefined) {
                                colorGroup = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP];
                            }

                            if (colorGroup === undefined) {
                                SWBL.logError(arguments, "missing color group for color #" + (colorIdx + 1));
                                break;
                            }

                            if (io_config.colorGroup === undefined) {
                                io_config.colorGroup = colorGroup;
                            }
                            else if (io_config.colorGroup != null && io_config.colorGroup != colorGroup) {
                                // If multiple color groups in CSV, set config-level colorGroup to null - 
                                // the data is only usable on a per-individual-color basis.
                                io_config.colorGroup = null; 
                            }

                            var colorPage = colorRecord[colorPageFieldIdx];
                            if (in_optionalCSVMap && colorPage === undefined) {
                                colorPage = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE];
                            }

                            if (colorPage === undefined) {
                                SWBL.logError(arguments, "no color page for color #" + (colorIdx + 1));
                                break;
                            }

                            if (io_config.colorPage === undefined) {
                                io_config.colorPage = colorPage;
                            }
                            else if (io_config.colorPage != null && io_config.colorPage != colorPage) {
                                // If multiple color pages in CSV, set config-level colorPage to null - 
                                // the data is only usable on a per-individual-color basis.
                                io_config.colorPage = null; 
                            }

                        }

                        switch (lowercaseColorSpace) {

                            default:
                                SWBL.logError(arguments, "unexpected color type for color #" + (colorIdx + 1));
                                break;
                            
                            case SWBL.C.LOWERCASE_COLORSPACE_RGB:

                                colorIsOK = true;

                                var red = colorRecord[redFieldIdx];
                                if (in_optionalCSVMap && red === undefined) {
                                    red = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_RED + typeIdx];
                                }
                                if (red === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no red" + typeIdx + " for color #" + (colorIdx + 1));
                                }

                                var green = colorRecord[greenFieldIdx];
                                if (in_optionalCSVMap && green === undefined) {
                                    green = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_GREEN + typeIdx];
                                }
                                if (green === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no green" + typeIdx + " for color #" + (colorIdx + 1));
                                }

                                var blue = colorRecord[blueFieldIdx];
                                if (in_optionalCSVMap && blue === undefined) {
                                    blue = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_BLUE + typeIdx];
                                }
                                if (blue === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no blue" + typeIdx + " for color #" + (colorIdx + 1));
                                }

                                if (colorIsOK) {
                                    
                                    red = parseInt(red, 10);
                                    green = parseInt(green, 10);
                                    blue = parseInt(blue, 10);

                                    colorData.colorSpace = SWBL.C.LOWERCASE_COLORSPACE_RGB;
                                    colorRecord.colorGroup = colorGroup;
                                    colorRecord.colorPage = colorPage;

                                    colorData.red = red;
                                    colorData.green = green;
                                    colorData.blue = blue;
                                }
                                break;

                            case SWBL.C.LOWERCASE_COLORSPACE_LAB:

                                colorIsOK = true;

                                var L = colorRecord[lFieldIdx];
                                if (in_optionalCSVMap && L === undefined) {
                                    L = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_L + typeIdx];
                                }
                                if (L === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no L" + typeIdx + " value for color #" + (colorIdx + 1));
                                }

                                var a = colorRecord[aFieldIdx];
                                if (in_optionalCSVMap && a === undefined) {
                                    a = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_A + typeIdx];
                                }
                                if (a === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no a" + typeIdx + " value for color #" + (colorIdx + 1));
                                }

                                var b = colorRecord[bFieldIdx];
                                if (in_optionalCSVMap && b === undefined) {
                                    b = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_B + typeIdx];
                                }
                                if (b === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no b" + typeIdx + " value for color #" + (colorIdx + 1));
                                }

                                if (colorIsOK) {
                                    
                                    L = parseFloat(L);
                                    a = parseFloat(a);
                                    b = parseFloat(b);

                                    colorData.colorSpace = SWBL.C.LOWERCASE_COLORSPACE_LAB;
                                    colorRecord.colorGroup = colorGroup;
                                    colorRecord.colorPage = colorPage;

                                    colorData.L = L;
                                    colorData.a = a;
                                    colorData.b = b;
                                }
                                break;

                            case SWBL.C.LOWERCASE_COLORSPACE_CMYK:
                            
                                colorIsOK = true;

                                var cyan = colorRecord[cyanFieldIdx];
                                if (in_optionalCSVMap && cyan === undefined) {
                                    cyan = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_CYAN + typeIdx];
                                }
                                if (cyan === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no cyan" + typeIdx + " for color #" + (colorIdx + 1));
                                }

                                var magenta = colorRecord[magentaFieldIdx];
                                if (in_optionalCSVMap && magenta === undefined) {
                                    magenta = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_MAGENTA + typeIdx];
                                }
                                if (magenta === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no magenta" + typeIdx + " for color #" + (colorIdx + 1));
                                }

                                var yellow = colorRecord[yellowFieldIdx];
                                if (in_optionalCSVMap && yellow === undefined) {
                                    yellow = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_YELLOW + typeIdx];
                                }
                                if (yellow === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no yellow" + typeIdx + " for color #" + (colorIdx + 1));
                                }

                                var black = colorRecord[blackFieldIdx];
                                if (in_optionalCSVMap && black === undefined) {
                                    black = in_optionalCSVMap.fieldMapInternalToDefault[SWBL.C.LOWERCASE_FIELDNAME_BLACK + typeIdx];
                                }
                                if (black === undefined) {
                                    colorIsOK = false;
                                    SWBL.logError(arguments, "no black" + typeIdx + " for color #" + (colorIdx + 1));
                                }

                                if (colorIsOK) {
                                    
                                    cyan = parseInt(cyan, 10);
                                    magenta = parseInt(magenta, 10);
                                    yellow = parseInt(yellow, 10);
                                    black = parseInt(black, 10);

                                    colorData.colorSpace = SWBL.C.LOWERCASE_COLORSPACE_CMYK;
                                    colorRecord.colorGroup = colorGroup;
                                    colorRecord.colorPage = colorPage;

                                    colorData.cyan = cyan;
                                    colorData.magenta = magenta;
                                    colorData.yellow = yellow;
                                    colorData.black = black;
                                }
                                break;
                        }

                        if (colorIsOK) {
                            colorDataByTypeIdx[typeIdx] = colorData;
                        }
                        else {
                            allColorsForTypeAreOK = false;
                        }
                    }
                    while (false);
                }

                typeIdx++;
            }
            while (typeIsPresent && allColorsForTypeAreOK);

            success = typeIdx > 1 && allColorsForTypeAreOK;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
            success = false;
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return success;
}

SWBL.readCSVMap = function readCSVMap(in_csvFile) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_csvFile) {
                SWBL.logError(arguments, "need in_csvFile");
                break;
            }

            if (! (in_csvFile instanceof File)) {
                SWBL.logError(arguments, "need in_csvFile to be a File");
                break;
            }

            if (! in_csvFile.exists) {
                SWBL.logError(arguments, "in_csvFile does not exist");
                break;
            }

            var parentFolder = in_csvFile.parent;
            var csvMapFile = File(parentFolder + "/" + SWBL.C.FILENAME_CSV_MAP);
            if (! csvMapFile.exists) {
                SWBL.logError(arguments, "csvMapFile does not exist");
                break;
            }

            csvMapFile.open("r");
            csvMapFile.encoding = "UTF-8";
            var csvMapText = csvMapFile.read();
            csvMapFile.close();

            var csvMap = JSON.parse(csvMapText);
            if (! csvMap) {
                break;
            }

            if (csvMap.rounding) {
                var rounding = csvMap.rounding;
                csvMap.rounding = {};
                for (var fieldName in rounding) {
                    var normalizedFieldName = SWBL.getNormalizedFieldName(fieldName);
                    csvMap.rounding[normalizedFieldName] = rounding[fieldName];
                }
            }

            // Add lowercase-only fields (e.g. add 'fieldnamemap' to csvMap
            // even if input data is spelled 'fieldNamemap' or 'FielNameMap')

            var topLevelFieldNames = [];
            for (var topLevelFieldName in csvMap) {
                topLevelFieldNames.push(topLevelFieldName);
            }

            for (var topLevelFieldIdx = 0; topLevelFieldIdx < topLevelFieldNames.length; topLevelFieldIdx++) {
                var topLevelFieldName = topLevelFieldNames[topLevelFieldIdx];
                csvMap[topLevelFieldName.toLowerCase()] = csvMap[topLevelFieldName];
            }

            // Build the maps

            csvMap.fieldMapCSVToInternal = {};

            csvMap.fieldMapInternalToDefault = {};

            if (csvMap.fieldnamemap) {
                for (var fieldName in csvMap.fieldnamemap) {
                    var csvFieldName = csvMap.fieldnamemap[fieldName];
                    var internalFieldName = fieldName.toLowerCase();
                    csvMap.fieldMapCSVToInternal[csvFieldName.toLowerCase()] = internalFieldName;
                }
            }

            if (csvMap.fielddefaults) {
                for (var fieldName in csvMap.fielddefaults) {
                    var internalFieldName = fieldName.toLowerCase();
                    csvMap.fieldMapInternalToDefault[internalFieldName] = csvMap.fielddefaults[fieldName];
                }
            }

            retVal = csvMap;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.selectCSV = function selectCSV() {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (SWBL.isMac) {

                var fileNameExtensionSet = {};
                for (var extensionIdx = 0; extensionIdx < SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED.length; extensionIdx++) {
                    fileNameExtensionSet[SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED[extensionIdx]] = true;
                }

                var dataFile = 
                    File.openDialog(
                        SWBL.C.PROMPT_OPEN_DATA_FILE,
                        function(in_fileToCheck) {
                            var isFileSelectable = false;
                            var extensionToCheck = SWBL.path.filenameExtension(in_fileToCheck).toLowerCase();
                            if (in_fileToCheck instanceof Folder) {
                                isFileSelectable = true;
                            }
                            else if (fileNameExtensionSet[extensionToCheck]) {
                                isFileSelectable = true;
                            }
                            return isFileSelectable;
                        }
                    );
            }
            else {

                var fileNameExtensionFilter = "";

                for (var extensionIdx = 0; extensionIdx < SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED.length; extensionIdx++) {
                    if (extensionIdx > 0) {
                        fileNameExtensionFilter += ";"
                    }
                    fileNameExtensionFilter += SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED[extensionIdx] + ":*." + SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED[extensionIdx];
                }

                var dataFile = 
                    File.openDialog(
                        SWBL.C.PROMPT_OPEN_DATA_FILE,
                        fileNameExtensionFilter
                    );
            }

            retVal = dataFile;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}