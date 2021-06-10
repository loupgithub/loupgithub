// Don't use 'var SWBL' - some engines call this within a non-global scope
// if using var we end up defining this in the wrong scope

if ("undefined" == typeof SWBL) {
    SWBL = {};
}

SWBL.startsWith = function startsWith(in_s, in_start) {
    return in_s.substr(0, in_start.length) == in_start;
}

SWBL.endsWith = function endsWith(in_s, in_end) {
    return in_s.substr(- in_end.length) == in_end;
};

SWBL.shallowClone = function shallowClone(obj) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if ("object" != typeof obj) {
                retVal = obj;
                break;
            }

            if (! obj) {
                retVal = obj;
                break;
            }

            var clone;
            if (obj instanceof Array) {
                clone = [];
            }
            else {
                clone = {};        
            }

            for (var x in obj) 
            {
                clone[x] = obj[x];
            }

            retVal = clone;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.deepClone = function deepClone(obj) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {
            
            if ("object" != typeof obj) {
                retVal = obj;
                break;
            }

            if (! obj) {
                retVal = obj;
                break;
            }

            var clone;
            if (obj instanceof Array) {
                clone = [];
            }
            else {
                clone = {};        
            }

            for (var x in obj) 
            {
                var val = obj[x];
                if (typeof val == "object")
                {
                    clone[x] = SWBL.deepClone(val);
                }
                else
                {
                    clone[x] = val;
                }
            }

            retVal = clone;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

// dQ: Wrap a string in double quotes
SWBL.dQ = function(s) {
    return '"' + s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r") + '"';
}

// sQ: Wrap a string in single quotes
SWBL.sQ = function(s) {
    return "'" + s.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g,"\\n").replace(/\r/g,"\\r") + "'";
}

SWBL.logEntry = function(reportingFunctionArguments) {
    if (SWBL.S.LOG_ENTRY_EXIT) {
        SWBL.logTrace(reportingFunctionArguments, "Entry");
    }
}

SWBL.logExit = function(reportingFunctionArguments) {
    if (SWBL.S.LOG_ENTRY_EXIT) {
        SWBL.logTrace(reportingFunctionArguments, "Exit");
    }
}

SWBL.logError = function(reportingFunctionArguments, s) {
    if (SWBL.S.LOG_LEVEL >= SWBL.C.LOG_ERROR) {
        if (! s) {
            s = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        SWBL.logMessage(reportingFunctionArguments, "ERROR  : " + s);
    }
}

SWBL.logWarning = function(reportingFunctionArguments, s) {
    if (SWBL.S.LOG_LEVEL >= SWBL.C.LOG_WARN) {
        if (! s) {
            s = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        SWBL.logMessage(reportingFunctionArguments, "WARNING: " + s);
    }
}

SWBL.logNote = function(reportingFunctionArguments, s) {
    if (SWBL.S.LOG_LEVEL >= SWBL.C.LOG_NOTE) {
        if (! s) {
            s = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        SWBL.logMessage(reportingFunctionArguments, "NOTE   : " + s);
    }
}

SWBL.logTrace = function(reportingFunctionArguments, s) {
    if (SWBL.S.LOG_LEVEL >= SWBL.C.LOG_TRACE) {
        if (! s) {
            s = reportingFunctionArguments;
            reportingFunctionArguments = undefined;
        }
        SWBL.logMessage(reportingFunctionArguments, "TRACE  : " + s);
    }
}

SWBL.REGEXP_TRIM = /^\s*(.*?)\s*$/;

SWBL.trim = function trim(in_s) {    
    return in_s.replace(SWBL.REGEXP_TRIM,"$1");
}

SWBL.checkMac = function checkMac() {
    
    var retVal;

    SWBL.logEntry(arguments);

    retVal = $.os.substr(0,3) == "Mac";

    SWBL.logExit(arguments);
    

    return retVal;
};

SWBL.logMessage = function(reportingFunctionArguments, message) {

    var savedInLogger = SWBL.inLogger;

    do {
        try {

            if (SWBL.inLogger) {
                break;
            }
            
            SWBL.inLogger = true;
            
            var prefix = "";

            if (! message) {

                  message = reportingFunctionArguments;
                  reportingFunctionArguments = undefined;

            }
            else if (reportingFunctionArguments) {

                if ("string" == typeof reportingFunctionArguments) {

                    prefix += reportingFunctionArguments + ": ";
                    
                }
                else {

                    var reportingFunctionName;
                    try {
                        reportingFunctionName = reportingFunctionArguments.callee.toString().match(/function ([^\(]+)/)[1];
                    }
                    catch (err) {
                        reportingFunctionName = "[anonymous function]";
                    }
                    prefix += reportingFunctionName + ": ";

                }
            }
            
            var estkLogLine = prefix + message;
                    
            if (SWBL.S.LOG_TO_ESTK_CONSOLE) {
                $.writeln(estkLogLine); 
            }

        }
        catch (err) {
        }
    }
    while (false);

    SWBL.inLogger = savedInLogger;
}
