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
import RaceType from '../model/race-type';
import Clock from '../model/clock';
import DownloadOptions from '../controller/download-options';

/**
 * Write race, entries, and any recorded laps to a CSV file
 * File will be saved via browsers URL file download feature
 * @param {DirectRace} race
 * @param {Array<Entry>} entries
 * @param {DownloadOptions} [options]
 * @returns {Promise<Boolean>}
 */
async function downloadRaceEntriesCSV(race, entries, options) {
    const fleet = await race.getFleet();
    const dinghyClasses = await fleet.getDinghyClasses();
    const includeCrew = (dinghyClasses.entities.length === 0 || dinghyClasses.entities.some(dinghyClass => dinghyClass.crewSize > 1));
    const link = document.createElement('a');

    let result = false;
    try {
        // const records = await convertRaceEntriesToCSVArray(race, dinghyClasses.entities, entries, includeCrew, options);
        const records = await convertRaceEntriesToCSVArray(race, entries, includeCrew, options);
        const data = new Blob(records, {'type': 'text/csv'});
        if (supportsFileSystemAccess()) {
            // Show the file save dialog.
            const handle = await window.showSaveFilePicker({ suggestedName: race.name + '.csv', types: [{description: 'CSV file', accept: {'text/csv': ['.csv']}}] });
            // Write the blob to the file.
            const writable = await handle.createWritable();
            await writable.write(data);
            await writable.close();
            result = {'success': true};
        }
        else {
            link.href = window.URL.createObjectURL(data);
            link.download = race.name + '.csv';
            link.click();
            result = true;
        }
    }
    catch (error) {
        if (error.name !== 'AbortError') {
            console.error(error.message, error);
            throw error;
        }
    }
    finally {
        window.URL.revokeObjectURL(link.href);
    }
    return result;
};

/**
 * Create header record for csv file
 * @param {DirectRace} race 
 * @param {Boolean} includeCrew
 * @returns {String}
 */
function createHeader(race, includeCrew) {
    switch (race.type) {
        case RaceType.PURSUIT:
            if (includeCrew) {
                return 'HelmName,CrewName,SailNo,Class,Place,Code,RaceRating\n';
            }
            return 'HelmName,SailNo,Class,Place,Code,RaceRating\n';
        default:
            if (includeCrew) {
                return 'HelmName,CrewName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n';
            }
            return 'HelmName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n';
    }
}

// async function convertRaceEntriesToCSVArray(race, dinghyClasses, entries, includeCrew, options) {
async function convertRaceEntriesToCSVArray(race, entries, includeCrew, options) {
    let data = [];
    data.push(createHeader(race, includeCrew));
    const records = await Promise.all(entries.map(entry => {return buildRecord(race, entry, includeCrew, options)}));
    data = data.concat(records);
    return data;
};

async function buildRecord(race, entry, includeCrew, options) {
    const helm = await entry.getHelm();
    const dinghy = await entry.getDinghy();
    const dinghyClass = await dinghy.getDinghyClass();
    const signedUp = await race.getSignedUpToForEntry(entry);
    const position = signedUp.position;
    const correctedTime = signedUp.correctedTime;
    const laps = await entry.getLaps();
    let crew;
    if (includeCrew && dinghyClass.crewSize > 1) {
        crew = await entry.getCrew();
    }

    let record = '';
    switch (options?.nameFormat) {
        case NameFormat.SURNAMEFIRSTNAME:
            record += '"' + _firstnameSurnameToSurnameFirstname(helm.name) + '",';
            if (includeCrew) {
                record += crew ? '"' + _firstnameSurnameToSurnameFirstname(crew.name) + '",' : ',';
            }
            break;
        default:
            record += helm.name + ',';
            if (includeCrew) {
                record += crew ? crew.name + ',' : ',';
            }
    }
    record += dinghy.sailNumber + ',';
    record += ((dinghyClass.externalName == null || dinghyClass.externalName === '') ? dinghyClass.name : dinghyClass.externalName) + ',';
    record += (entry.scoringAbbreviation ? '' : position) + ',';
    if (race.type !== RaceType.PURSUIT) {
        record += Clock.formatDurationAsSeconds(entry.sumOfLapTimes) + ',';
        record += laps.entities.length + ',';
    }
    record += (entry.scoringAbbreviation ? entry.scoringAbbreviation : '') + ',';
    if (race.type !== RaceType.PURSUIT) {
        record += (dinghyClass.portsmouthNumber ? dinghyClass.portsmouthNumber : '') + ',';
        record += Clock.formatDurationAsSeconds(correctedTime) + '\n';
    }
    else {
        record += (dinghyClass.portsmouthNumber ? dinghyClass.portsmouthNumber : '') + '\n';
    }
    
    return record;
}

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