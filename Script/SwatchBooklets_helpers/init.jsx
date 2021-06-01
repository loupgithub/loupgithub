// Don't use 'var SWBL' - some engines call this within a non-global scope
// if using var we end up defining this in the wrong scope

if ("undefined" == typeof SWBL) {
    SWBL = {};
}

if (SWBL.checkMac()) {
    SWBL.path.SEPARATOR = "/";
    SWBL.isMac = true;
    SWBL.isWindows = false;
}
else {
    SWBL.path.SEPARATOR = "\\";
    SWBL.isMac = false;
    SWBL.isWindows = true;
}

if (! SWBL.dirs) {
    SWBL.dirs = {};
}

