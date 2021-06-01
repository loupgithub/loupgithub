//@target indesign

//@include "SwatchBooklets_helpers/runtime.jsx"

main();

function main() {
    
    do {
        SWBL.initScript();

        var csvFile = SWBL.selectCSV();
        if (! csvFile) {
            // User cancelled. Bail out
            break;
        }

        var config = SWBL.parseCSV(csvFile);
        if (! config) {
            alert(SWBL.C.ALERT_BAD_DATA);
            break;
        }

        var document = SWBL.openTemplate(csvFile);
        if (! document) {
            alert(SWBL.C.ALERT_NO_TEMPLATE);
            break;
        }
    
    
    }
    while (false);

}
