/**
 * Write race, entries, and any recorded laps to a CSV file
 * File will be saved via browsers URL file download feature
 * @param {Race} race 
 * @param {Array<Entry>} entries 
 */
function downloadRaceEntriesCSV(race, entries) {
    const link = document.createElement('a');
    return new Promise((resolve, reject) => {
        try {
            const data = new Blob(convertRaceEntriesToCSVArray(race, entries), {'type': 'text/csv'});
            link.href = window.URL.createObjectURL(data);
            link.download = race.name + '.csv';
            link.click();
            resolve({'success': true});
        }
        catch (error) {
            resolve({'success': false, 'message': error.message});
        }
        finally {
            window.URL.revokeObjectURL(link.href);
        }
    });
};

function convertRaceEntriesToCSVArray(race, entries) {
    return entries.map(entry => {
        return race.name + ',' + 
            race.plannedStartTime.toISOString() + ',' + 
            // race.actualStartTime.toISOString() + ',' + 
            race.dinghyClass.name + ',' + 
            entry.helm.name + ',' + 
            entry.dinghy.dinghyClass.name + ',' + 
            entry.laps.length + ',' + 
            entry.laps.reduce((accumulator, currentValue) => {
                return {'time': accumulator.time + currentValue.time};
            }, {'time': 0}).time + '\n';
    });
};

// Functions exposed through this object should only be used in tests that confirm they perform as expected
const functionsForTestingOnly = {
    convertRaceEntriesToCSVArrayFTO: convertRaceEntriesToCSVArray
};

export { downloadRaceEntriesCSV, functionsForTestingOnly };