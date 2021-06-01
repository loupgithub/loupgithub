// Don't use 'var SWBL' - some engines call this within a non-global scope
// if using var we end up defining this in the wrong scope

if ("undefined" == typeof SWBL) {
    SWBL = {};
}

if (! SWBL.C) {
    SWBL.C = {}; // stash constants here   
}

SWBL.C.DIRNAME_PREFERENCES  = "swatch-booklets";
SWBL.C.FILENAME_PREFERENCES = "swatch-booklets-preferences.json";

SWBL.C.LOG_NONE                      = 0;
SWBL.C.LOG_ERROR                     = 1;
SWBL.C.LOG_WARN                      = 2;
SWBL.C.LOG_NOTE                      = 3;
SWBL.C.LOG_TRACE                     = 4;

/* Add any global constants */
