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

function createHeader(race) {
    if (!race.dinghyClass || race.dinghyClass.crewSize > 1) {
        return 'HelmName, CrewName, SailNo, Class, Elapsed, Laps, Code\n';
    }
    return 'HelmName, SailNo, Class, Elapsed, Laps, Code\n';
}

function convertRaceEntriesToCSVArray(race, entries) {
    let data = [];
    data.push(createHeader(race));
    data = data.concat(entries.map(entry => {
        let record = '';
        record += entry.helm.name + ',';
        if (!race.dinghyClass || race.dinghyClass.crewSize > 1) {
            record += entry.crew ? entry.crew.name + ',' : ',';
        }
        record += entry.dinghy.sailNumber + ',';
        record += entry.dinghy.dinghyClass.name + ',';
        record += Math.round(entry.sumOfLapTimes / 1000) + ',';
        record += entry.laps.length + ',';
        record += (entry.scoringAbbreviation ? entry.scoringAbbreviation : '') + '\n';
        return record;
    }));
    return data;
};

// Functions exposed through this object should only be used in tests that confirm they perform as expected
const functionsForTestingOnly = {
    convertRaceEntriesToCSVArrayFTO: convertRaceEntriesToCSVArray
};

export { downloadRaceEntriesCSV, functionsForTestingOnly };