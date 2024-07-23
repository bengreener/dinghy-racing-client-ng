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

/**
 * Write race, entries, and any recorded laps to a CSV file
 * File will be saved via browsers URL file download feature
 * @param {Race} race 
 * @param {Array<Entry>} entries
 * @param {import('../controller/download-options').DownloadOptions} [options]
 */
function downloadRaceEntriesCSV(race, entries, options) {
    const link = document.createElement('a');
    return new Promise((resolve, reject) => {
        try {
            const data = new Blob(convertRaceEntriesToCSVArray(race, entries, options), {'type': 'text/csv'});
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
        return 'HelmName,CrewName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating\n';
    }
    return 'HelmName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating\n';
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
                if (!race.dinghyClass || race.dinghyClass.crewSize > 1) {
                    record += entry.crew ? entry.crew.name + ',' : ',';
                }
        }
        record += entry.dinghy.sailNumber + ',';
        record += entry.dinghy.dinghyClass.name + ',';
        record += entry.position + ',';
        record += Math.round(entry.sumOfLapTimes / 1000) + ',';
        record += entry.laps.length + ',';
        record += (entry.scoringAbbreviation ? entry.scoringAbbreviation : '') + ',';
        record += (entry.dinghy.dinghyClass.portsmouthNumber ? entry.dinghy.dinghyClass.portsmouthNumber : '') + '\n';
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

// Functions exposed through this object should only be used in tests that confirm they perform as expected
const functionsForTestingOnly = {
    convertRaceEntriesToCSVArrayFTO: convertRaceEntriesToCSVArray
};

export { downloadRaceEntriesCSV, functionsForTestingOnly };