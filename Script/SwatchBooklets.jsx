//@target indesign

//@include "SwatchBooklets_helpers/runtime.jsx"

main();

function main() {
    
    do {

        try {

            SWBL.initScript();

            var csvFile = SWBL.selectCSV();
            if (! csvFile) {
                // User cancelled. Bail out
                break;
            }

            var csvMap = SWBL.readCSVMap(csvFile);
        
            var config = SWBL.parseCSV(csvFile, csvMap);
            if (! config) {
                alert(SWBL.C.ALERT_BAD_DATA);
                break;
            }

            var recordCount = SWBL.getRecordCount(config);
            if (! recordCount) {
                alert(SWBL.C.ALERT_BAD_DATA);
                break;
            }

            var document = SWBL.openTemplate(csvFile);
            if (! document) {
                alert(SWBL.C.ALERT_NO_TEMPLATE);
                break;
            }
        
            var fieldsToProcessSet = {};
            fieldsSetToProcess[SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP] = true;
            fieldsSetToProcess[SWBL.C.LOWERCASE_FIELDNAME_COLORNAME] = true;
            fieldsSetToProcess[SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE] = true;

            var curSpreadIdx = 0;
            var curSpread = undefined;
            var curRecordOnSpreadIdx = 0;     
            for (var recordIdx = 0; recordIdx < recordCount; recordIdx++) {
                while (curSpreadIdx >= document.spreads.length) {
                    document.spreads.lastSpread().duplicate();
                    curSpread = undefined;
                }
                if (curSpread == undefined) {
                    curSpread = document.spreads.item(curSpreadIdx);
                }
                
            }
        }
        catch (err) {
            alert("Unexpected internal error " + err);
        }
    }
    while (false);

}
