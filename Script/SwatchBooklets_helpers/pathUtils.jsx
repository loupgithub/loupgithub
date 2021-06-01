// Don't use 'var SWBL' - some engines call this within a non-global scope
// if using var we end up defining this in the wrong scope

if ("undefined" == typeof SWBL) {
    SWBL = {};
}

if (! SWBL.path) {
	SWBL.path = {};
}

SWBL.path.basename = function basename(filepath, separator) {
    
    var endSegment;

    SWBL.logEntry(arguments);

    if (! separator) {
        separator = SWBL.path.SEPARATOR;
    }

    // toString() handles cases where filepath is an ExtendScript File/Folder object
    var splitPath = filepath.toString().split(separator);
    do {
        endSegment = splitPath.pop();   
    }
    while (splitPath.length > 0 && endSegment == "");

    SWBL.logExit(arguments);

    return endSegment;
};

SWBL.path.dirname = function dirname(filepath, separator) {
    
    var retVal;

    SWBL.logEntry(arguments);

    if (! separator) {
        separator = SWBL.path.SEPARATOR;
    }

    // toString() handles cases where filepath is an ExtendScript File/Folder object
    var splitPath = filepath.toString().split(separator);
    do {
        var endSegment = splitPath.pop();   
    }
    while (splitPath.length > 0 && endSegment == "");

    retVal = splitPath.join(separator);

    SWBL.logExit(arguments);

    return retVal;
};

SWBL.path.filenameExtension = function filenameExtension(filepath) {
    
    var retVal;

    SWBL.logEntry(arguments);

    var splitName = SWBL.path.basename(filepath).split(".");
    var extension = "";
    if (splitName.length > 1) {
        extension = splitName.pop();
    }

    retVal = extension.toLowerCase();

    SWBL.logExit(arguments);

    return retVal;
};

SWBL.path.exists = function exists(filepath) {

    var retVal;

    SWBL.logEntry(arguments);

    var f = File(filepath);
    retVal = f.exists;

    SWBL.logExit(arguments);

    return retVal;
};

SWBL.path.isDir = function isDir(folderPath) {

    var retVal;

    SWBL.logEntry(arguments);
    
    // This casts to a File instead of a Folder if the
    // path references a file

    var folder = Folder(folderPath);

    retVal = (folder instanceof Folder);

    SWBL.logExit(arguments);

    return retVal;
};

SWBL.path.mkdir = function mkdir(folderPath, separator) {

    var success = false;

    SWBL.logEntry(arguments);

    do {
        try {
            if (! folderPath) {
                SWBL.logError(arguments, "no folderPath");
                break;
            }

            if (SWBL.path.exists(folderPath)) {
                success = true;
                break;
            }

            var parentFolderPath = SWBL.path.dirname(folderPath, separator);
            success = SWBL.path.mkdir(parentFolderPath, separator);
            if (! success) {
                SWBL.logError(arguments, "cannot create parent folder");
                break;
            }

            var folder = Folder(folderPath);
            folder.create();
            success = folder.exists;
        }
        catch (err) {
            SWBL.logError(arguments, "throws" + err);       
        }
    }
    while (false);

    SWBL.logExit(arguments);
    
    return success;
};
