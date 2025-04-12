/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import NameFormat from '../controller/name-format';
import RaceType from '../model/domain-classes/race-type';
import Clock from '../model/domain-classes/clock';

/**
 * Write race, entries, and any recorded laps to a CSV file
 * File will be saved via browsers URL file download feature
 * @param {Race} race 
 * @param {Array<Entry>} entries
 * @param {import('../controller/download-options').DownloadOptions} [options]
 */
function downloadRaceEntriesCSV(race, entries, options) {
    const link = document.createElement('a');
    return new Promise(async (resolve, reject) => {
        try {
            const data = new Blob(convertRaceEntriesToCSVArray(race, entries, options), {'type': 'text/csv'});
            if (supportsFileSystemAccess()) {
                // Show the file save dialog.
                const handle = await window.showSaveFilePicker({ suggestedName: race.name + '.csv', types: [{description: 'CSV file', accept: {'text/csv': ['.csv']}}] });
                // Write the blob to the file.
                const writable = await handle.createWritable();
                await writable.write(data);
                await writable.close();
                resolve({'success': true});
            }
            else {
                link.href = window.URL.createObjectURL(data);
                link.download = race.name + '.csv';
                link.click();
                resolve({'success': true});
            }
        }
        catch (error) {
            if (error.name !== 'AbortError') {
                resolve({'success': false, 'message': error.message});
            }
        }
        finally {
            window.URL.revokeObjectURL(link.href);
        }
    });
};

function createHeader(race) {
    switch (race.type) {
        case RaceType.PURSUIT:
            if (race.fleet.dinghyClasses.length === 0 || race.fleet.dinghyClasses.some(dinghyClass => dinghyClass.crewSize > 1)) {
                return 'HelmName,CrewName,SailNo,Class,Place,Code,RaceRating\n';
            }
            return 'HelmName,SailNo,Class,Place,Code,RaceRating\n';
        default:
            if (race.fleet.dinghyClasses.length === 0 || race.fleet.dinghyClasses.some(dinghyClass => dinghyClass.crewSize > 1)) {
                return 'HelmName,CrewName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n';
            }
            return 'HelmName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n';
    }
}

function convertRaceEntriesToCSVArray(race, entries, options) {
    let data = [];
    data.push(createHeader(race));
    data = data.concat(entries.map(entry => {
        let record = '';
        switch (options?.nameFormat) {
            case NameFormat.SURNAMEFIRSTNAME:
                record += '"' + _firstnameSurnameToSurnameFirstname(entry.helm.name) + '",';
                if (!race.dinghyClass || race.dinghyClass.crewSize > 1) {
                    record += entry.crew ? '"' + _firstnameSurnameToSurnameFirstname(entry.crew.name) + '",' : ',';
                }
                break;
            default:
                record += entry.helm.name + ',';
                if (race.fleet.dinghyClasses.length === 0 || race.fleet.dinghyClasses.some(dinghyClass => dinghyClass.crewSize > 1)) {
                    record += entry.crew ? entry.crew.name + ',' : ',';
                }
        }
        record += entry.dinghy.sailNumber + ',';
        record += ((entry.dinghy.dinghyClass.externalName == null || entry.dinghy.dinghyClass.externalName === '') ? entry.dinghy.dinghyClass.name : entry.dinghy.dinghyClass.externalName) + ',';
        record += (entry.scoringAbbreviation ? '' : entry.position) + ',';
        if (race.type !== RaceType.PURSUIT) {
            record += Clock.formatDurationAsSeconds(entry.sumOfLapTimes) + ',';
            record += entry.laps.length + ',';
        }
        record += (entry.scoringAbbreviation ? entry.scoringAbbreviation : '') + ',';
        if (race.type !== RaceType.PURSUIT) {
            record += (entry.dinghy.dinghyClass.portsmouthNumber ? entry.dinghy.dinghyClass.portsmouthNumber : '') + ',';
            record += Clock.formatDurationAsSeconds(entry.correctedTime) + '\n';
        }
        else {
            record += (entry.dinghy.dinghyClass.portsmouthNumber ? entry.dinghy.dinghyClass.portsmouthNumber : '') + '\n';
        }
        
        return record;
    }));
    return data;
};

function _firstnameSurnameToSurnameFirstname(name) {
    const nameArray = name.trim().split(' ');
    if (nameArray.length > 1) {
        nameArray.unshift(nameArray.pop() + ',');
    }
    const newName = nameArray.join(' ');

    return newName;
}

function supportsFileSystemAccess() {
    // Feature detection. The API needs to be supported and the app not run in an iframe.
    return 'showSaveFilePicker' in window && (() => {
            try {
                return window.self === window.top;
            } catch {
                return false;
            }
        })();
}

// Functions exposed through this object should only be used in tests that confirm they perform as expected
const functionsForTestingOnly = {
    convertRaceEntriesToCSVArrayFTO: convertRaceEntriesToCSVArray
};

export { downloadRaceEntriesCSV, functionsForTestingOnly };