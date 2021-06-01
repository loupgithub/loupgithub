var dreamweaver;
var app;

var SWBL;
if (! SWBL) {
    SWBL = {};
}

SWBL.LOG_CRITICAL_ERRORS = false;

SWBL.relativeFilePathsToLoad = [
    "SwatchBooklets_helpers/json2.jsx",
    "SwatchBooklets_helpers/globals.jsx",
    "SwatchBooklets_helpers/tweakableSettings.jsx",
    "SwatchBooklets_helpers/utils.jsx",
    "SwatchBooklets_helpers/pathUtils.jsx",
    "SwatchBooklets_helpers/init.jsx",
    "SwatchBooklets_helpers/swbl.jsx"
];

SWBL.errorBeforeLoggingAvailable = function(error) {

    if (SWBL.logError) {
        SWBL.logError(error);
    }
    else if (SWBL.LOG_CRITICAL_ERRORS) {

        try {

            var f = File(Folder.desktop + "/criticalErrors.log");
            f.open("a");
            f.writeln(error);
            f.close();

        }
        catch (err) {

            try {
                console.log(error);
            }
            catch (err) {   
            }

        }
    }
}

if (dreamweaver) {

    SWBL.loadScript = function(extensionDir, scriptPath) {
        try {
            var fullPath = extensionDir + scriptPath;
            var script = DWfile.read(fullPath);
            eval(script);
        }
        catch (err) {           
            SWBL.errorBeforeLoggingAvailable("runtime.jsx loadScript throws " + err + " for " + fullPath);  
        }
    }

}
else {

    SWBL.loadScript = function(extensionDir, scriptPath) {
        try {
            var fullPath = extensionDir + scriptPath;
            var file = File(fullPath);
            file.open("r");
            var script = file.read();
            file.close();
            eval(script);
        }
        catch (err) {           
            SWBL.errorBeforeLoggingAvailable("runtime.jsx loadScript throws " + err + " for " + fullPath);  
        }
    }

}

SWBL.initScript = function initScript() {

    var scriptDir = File($.fileName).parent.parent + "/";

    for (var idx = 0; idx < SWBL.relativeFilePathsToLoad.length; idx++) {
        var filePath = SWBL.relativeFilePathsToLoad[idx];
        SWBL.loadScript(scriptDir, filePath);
    }

}

