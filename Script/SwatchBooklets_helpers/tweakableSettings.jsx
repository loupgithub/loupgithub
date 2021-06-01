//
// Tweakable Settings
//

// Don't use 'var SWBL' - some engines call this within a non-global scope
// if using var we end up defining this in the wrong scope

if ("undefined" == typeof SWBL) {
    SWBL = {};
}

if (! SWBL.S) {
    SWBL.S = {}; // stash global settings here
}

SWBL.S.LOG_LEVEL                     = SWBL.C.LOG_NONE;

SWBL.S.LOG_TO_ESTK_CONSOLE           = false;
SWBL.S.LOG_TO_FILEPATH               = undefined; // file path or undefined
SWBL.S.LOG_ENTRY_EXIT                = true;

/* Add any global settings, defaults... here */
