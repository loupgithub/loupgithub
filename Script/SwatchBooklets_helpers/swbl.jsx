// Don't use 'var SWBL' - some engines call this within a non-global scope
// if using var we end up defining this in the wrong scope

if ("undefined" == typeof SWBL) {
    SWBL = {};
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

SWBL.parseCSV = function parseCSV(in_csvFile) {

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
                var csvLine = csvLines[csvLineIdx];
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
                            parsedData.lowerCasedFieldSet[lowerCaseFieldName] = fieldIdx;
                        }
                    }
                }
                else {
                    parsedData.data.push(csvFields);
                }
            }

            var success = SWBL.processConfig(parsedData);
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

SWBL.processConfig = function processConfig(io_config) {

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

            if (! (SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP in io_config.lowerCasedFieldSet)) {
                SWBL.logError(arguments, "need field " + SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP);
                break;
            }

            if (! (SWBL.C.LOWERCASE_FIELDNAME_COLORNAME in io_config.lowerCasedFieldSet)) {
                SWBL.logError(arguments, "need field " + SWBL.C.LOWERCASE_FIELDNAME_COLORNAME);
                break;
            }

            if (! (SWBL.C.LOWERCASE_FIELDNAME_COLORTYPE in io_config.lowerCasedFieldSet)) {
                SWBL.logError(arguments, "need field " + SWBL.C.LOWERCASE_FIELDNAME_COLORTYPE);
                break;
            }

            var colorGroupFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP];
            var colorNameFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORNAME];
            var colorTypeFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORTYPE];

            if (! io_config.data) {
                SWBL.logError(arguments, "no color data");
                break;
            }

            if (io_config.data.length <= 0) {
                SWBL.logError(arguments, "no color data");
                break;
            }

            success = true;

            var cyanFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_CYAN];
            if (cyanFieldIdx === undefined) {
                cyanFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE1];
            }

            var redFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_RED];
            if (redFieldIdx === undefined) {
                redFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE1];
            }

            var magentaFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_MAGENTA];
            if (magentaFieldIdx === undefined) {
                magentaFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE2];
            }

            var greenFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_GREEN];
            if (greenFieldIdx === undefined) {
                greenFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE2];
            }

            var yellowFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_YELLOW];
            if (yellowFieldIdx === undefined) {
                yellowFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE3];
            }

            var blueFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_BLUE];
            if (blueFieldIdx === undefined) {
                blueFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE3];
            }

            var blackFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_BLACK];
            if (blackFieldIdx === undefined) {
                blackFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE4];
            }

            for (var colorIdx = 0; colorIdx < io_config.data.length; colorIdx++) {

                var colorData = io_config.data[colorIdx];

                var colorGroup = colorData[colorGroupFieldIdx];
                var colorName = colorData[colorNameFieldIdx];
                var colorType = colorData[colorTypeFieldIdx];

                var colorIsOK = true;
                if (! colorGroup) {
                    colorIsOK = false;
                    SWBL.logError(arguments, "no color group for color #" + (colorIdx + 1));
                }
                if (! colorName) {
                    colorIsOK = false;
                    SWBL.logError(arguments, "no color name for color #" + (colorIdx + 1));
                }
                if (! colorType) {
                    colorIsOK = false;
                    SWBL.logError(arguments, "no color type for color #" + (colorIdx + 1));
                }
                else {
                    var lowercaseColorType = colorType.toLowerCase();
                    if (! (lowercaseColorType in SWBL.C.SET_LOWERCASE_COLORTYPE)) {
                        colorIsOK = false;
                        SWBL.logError(arguments, "unexpected color type for color #" + (colorIdx + 1));
                    }
                }

                if (colorIsOK) {
                    switch (lowercaseColorType) {

                        default:
                            colorIsOK = false;
                            SWBL.logError(arguments, "unexpected color type for color #" + (colorIdx + 1));
                            break;
                        
                        case SWBL.C.LOWERCASE_COLORTYPE_RGB:

                            var red = colorData[redFieldIdx];
                            if (red === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no red for color #" + (colorIdx + 1));
                            }

                            var green = colorData[greenFieldIdx];
                            if (green === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no green for color #" + (colorIdx + 1));
                            }

                            var blue = colorData[blueFieldIdx];
                            if (blue === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no blue for color #" + (colorIdx + 1));
                            }

                            if (colorIsOK) {
                                
                                red = parseInt(red, 10);
                                green = parseInt(green, 10);
                                blue = parseInt(blue, 10);

                                colorData.colorType = SWBL.C.LOWERCASE_COLORTYPE_RGB;

                                colorData.red = red;
                                colorData.green = green;
                                colorData.blue = blue;
                            }
                            break;
                        case SWBL.C.LOWERCASE_COLORTYPE_CMYK:
                        
                            var cyan = colorData[cyanFieldIdx];
                            if (cyan === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no cyan for color #" + (colorIdx + 1));
                            }

                            var magenta = colorData[magentaFieldIdx];
                            if (magenta === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no magenta for color #" + (colorIdx + 1));
                            }

                            var yellow = colorData[yellowFieldIdx];
                            if (yellow === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no yellow for color #" + (colorIdx + 1));
                            }

                            var black = colorData[blackFieldIdx];
                            if (black === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no black for color #" + (colorIdx + 1));
                            }

                            if (colorIsOK) {
                                
                                cyan = parseInt(cyan, 10);
                                magenta = parseInt(magenta, 10);
                                yellow = parseInt(yellow, 10);
                                black = parseInt(black, 10);

                                colorData.colorType = SWBL.C.LOWERCASE_COLORTYPE_CMYK;

                                colorData.cyan = cyan;
                                colorData.magenta = magenta;
                                colorData.yellow = yellow;
                                colorData.black = black;
                            }
                            break;
                    }
                }

                success = success && colorIsOK;

            }
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return success;
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