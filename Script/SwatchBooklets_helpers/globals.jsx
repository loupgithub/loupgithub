// Don't use 'var SWBL' - some engines call this within a non-global scope
// if using var we end up defining this in the wrong scope

if ("undefined" == typeof SWBL) {
    SWBL = {};
}

if (! SWBL.C) {
    SWBL.C = {}; // stash constants here   
}

SWBL.C.DIRNAME_PREFERENCES             = "swatch-booklets";
SWBL.C.FILENAME_PREFERENCES            = "swatch-booklets-preferences.json";
SWBL.C.FILENAME_TEMPLATE               = "template.indt";
SWBL.C.FILENAME_CSV_MAP                = "mapCSVToTemplate.json";
SWBL.C.LOG_NONE                        = 0;
SWBL.C.LOG_ERROR                       = 1;
SWBL.C.LOG_WARN                        = 2;
SWBL.C.LOG_NOTE                        = 3;
SWBL.C.LOG_TRACE                       = 4;

SWBL.C.CHAR_COMMENT_LINE               = '#'; // Prefix for comment lines in csv and txt files

SWBL.C.PROMPT_OPEN_DATA_FILE           = "Please select a comma-separated text file";
SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED = [ 'csv', 'txt' ]; // Always use lowercase here
SWBL.C.ALERT_BAD_DATA                  = "Failed to parse CSV file. Aborting";
SWBL.C.ALERT_NO_TEMPLATE               = "Could not find template in same folder as CSV file"

SWBL.C.LOWERCASE_LABEL_COLORGROUP      = "colorgroup";
SWBL.C.LOWERCASE_LABEL_COLORPAGE       = "colorpage";
SWBL.C.LOWERCASE_LABEL_FIELD           = "field"; // label is whatever field name
SWBL.C.LOWERCASE_LABEL_SWATCH          = "swatch"; // label is swatch_1, swatch_2,...
SWBL.C.LOWERCASE_LABEL_INDEXED_FIELD   = "idx"; // label is whatever field name with idx- e.g. a_1, L_2, cyan_3,...

SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP  = "colorgroup";
SWBL.C.LOWERCASE_FIELDNAME_COLORNAME   = "colorname";
SWBL.C.LOWERCASE_FIELDNAME_COLORSPACE  = "colorspace";
SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE   = "colorpage";

SWBL.C.LOWERCASE_FIELDNAME_CYAN        = "cyan";
SWBL.C.LOWERCASE_FIELDNAME_RED         = "red";
SWBL.C.LOWERCASE_FIELDNAME_L           = "l";

SWBL.C.LOWERCASE_FIELDNAME_MAGENTA     = "magenta";
SWBL.C.LOWERCASE_FIELDNAME_GREEN       = "green";
SWBL.C.LOWERCASE_FIELDNAME_A           = "a";

SWBL.C.LOWERCASE_FIELDNAME_YELLOW      = "yellow";
SWBL.C.LOWERCASE_FIELDNAME_BLUE        = "blue";
SWBL.C.LOWERCASE_FIELDNAME_B           = "b";

SWBL.C.LOWERCASE_FIELDNAME_BLACK       = "black";

SWBL.C.LOWERCASE_COLORSPACE_CMYK       = "cmyk";
SWBL.C.LOWERCASE_COLORSPACE_RGB        = "rgb";
SWBL.C.LOWERCASE_COLORSPACE_LAB        = "lab";

SWBL.C.LOWERCASE_COLORSPACE_MULTIPLE   = "multiple";

SWBL.C.SET_LOWERCASE_COLORSPACE         = {};
SWBL.C.SET_LOWERCASE_COLORSPACE[SWBL.C.LOWERCASE_COLORSPACE_CMYK] = true;
SWBL.C.SET_LOWERCASE_COLORSPACE[SWBL.C.LOWERCASE_COLORSPACE_RGB]  = true;
SWBL.C.SET_LOWERCASE_COLORSPACE[SWBL.C.LOWERCASE_COLORSPACE_LAB]  = true;

// States for CSV scanner
SWBL.C.CSV_STATE_IDLE                  = 0;
SWBL.C.CSV_STATE_DONE                  = 1;
SWBL.C.CSV_STATE_SEEN_1ST_QUOTE        = 2;
SWBL.C.CSV_STATE_SEEN_2ND_QUOTE        = 3;
SWBL.C.CSV_STATE_UNQUOTED_FIELD        = 4;
SWBL.C.CSV_STATE_ESCAPED               = 5;
SWBL.C.CSV_STATE_AWAITING_COMMA        = 6;



/* Add any global constants */
