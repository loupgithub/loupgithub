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

            var document = SWBL.openTemplate(csvFile);
            if (! document) {
                alert(SWBL.C.ALERT_NO_TEMPLATE);
                break;
            }
        
            SWBL.injectData(document, config);
        }
        catch (err) {
            alert("Unexpected internal error " + err);
        }
    }
    while (false);
}

