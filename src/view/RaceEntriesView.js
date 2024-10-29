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

import React, { useCallback, useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntryView from './RaceEntryView';
import { sortArray } from '../utilities/array-utilities';
import ControllerContext from './ControllerContext';

/**
 * Display race entries
 * @param {Object} props
 * @param {Array<Race>} props.raceScorpionA
 * @returns {HTMLDivElement}
 */
function RaceEntriesView({ races }) {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [entriesMap, setEntriesMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
    const [entriesUpdateRequestAt, setEntriesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies an entry has been updated

    const updateEntries = useCallback(() => {
        setEntriesUpdateRequestAt(Date.now());
    }, []);

    // get entries
    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceEntriewView rerendered before fetch completes to avoid using out of date result
        const entriesMap = new Map();
        // build promises
        const promises = races.map(race => {
            if (!race || (!race.name && !race.url)) {
                return Promise.resolve({'success': true, 'domainObject': []});
            }
            return model.getEntriesByRace(race);
        });
        if (!ignoreFetch) {
            Promise.all(promises).then(results => {
                results.forEach(result => {
                    if (!result.success) {
                        setMessage('Unable to load entries\n' + result.message);
                    }
                    else {
                        result.domainObject.forEach(entry => {
                            entriesMap.set(entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name, entry);
                            model.registerEntryUpdateCallback(entry.url, updateEntries);
                        });
                    }
                });
                if (!ignoreFetch) {
                    setEntriesMap(entriesMap);
                }
            });
        };
        // cleanup before effect runs and before form close
        return () => {
            entriesMap.forEach(entry => {
                model.unregisterEntryUpdateCallback(entry.url, updateEntries);
            });
            ignoreFetch = true;
            setMessage(''); // clear any previous message
        }
    }, [model, races, updateEntries, entriesUpdateRequestAt]);

    // return array of entries sorted according to selected sort order
    function sorted() {
        let ordered = [];
        switch (sortOrder) {
            case 'lastThree':
                ordered = sortArray(Array.from(entriesMap.values()), (entry) => {
                    const sn = entry.dinghy.sailNumber;
                    const snEndDigits = sn.substring(sn.length - 3, sn.length);
                    return Number(snEndDigits);
                });
                break;
            case 'classLastThree':
                ordered = sortArray(Array.from(entriesMap.values()), (entry) => {
                    const sn = entry.dinghy.sailNumber;
                    const snEndDigits = sn.substring(sn.length - 3, sn.length);
                    return [entry.dinghy.dinghyClass.name, Number(snEndDigits)];
                });
                break;
            case 'sailNumber':
                ordered = sortArray(Array.from(entriesMap.values()), (entry) => {
                    // some boats have been known to use non-numeric 'sail numbers'
                    return isNaN(entry.dinghy.sailNumber) ? entry.dinghy.sailNumber : Number(entry.dinghy.sailNumber);
                });
                break;
            case 'classSailNumber':
                ordered = sortArray(Array.from(entriesMap.values()), (entry) => {
                    return [entry.dinghy.dinghyClass.name, isNaN(entry.dinghy.sailNumber) ? entry.dinghy.sailNumber : Number(entry.dinghy.sailNumber)];
                });
                break;
            // sort by the sum of all recorded lap times (sub sort by class and sail number to avoid order changing based on order of returned values from server)
            case 'lapTimes':
                ordered = sortArray(Array.from(entriesMap.values()), (entry) => {
                    const weighIfScoringAbbreviation = ['DNS', 'DSQ', 'RET'];
                    const weighting = (entry.finishedRace || weighIfScoringAbbreviation.includes(entry.scoringAbbreviation)) ? Date.now() : 0;
                    return [entry.race.plannedStartTime.getTime() + entry.sumOfLapTimes + weighting, entry.dinghy.dinghyClass.name, isNaN(entry.dinghy.sailNumber) ? entry.dinghy.sailNumber : Number(entry.dinghy.sailNumber)];
                });
                break;
            case 'position':
                ordered = sortArray(Array.from(entriesMap.values()), (entry) => {
                    const weighIfScoringAbbreviation = ['DNS', 'DSQ', 'RET'];
                    let weight = .5;
                    if (weighIfScoringAbbreviation.includes(entry.scoringAbbreviation)) {
                        weight = weight * 2;
                    }
                    return (entry.position && weight === .5) ? entry.position : Date.now() * weight; // if entry doesn't have a position return a large number to put it to the bottom
                });
                break;
            default:
                ordered = sortArray(Array.from(entriesMap.values()), (entry) => {
                    return [entry.dinghy.dinghyClass.name, Number(entry.dinghy.sailNumber)];
                });
        }
        return ordered;
    }

    async function addLap(entry) {
        // if race was referenced by entries wouldn't need to keep looking it up. 
        // fix this in getEntries useEffect by replacing referenced race data from REST with that from races prop 
        const race = races.find((r) => {
            return r.name === entry.race.name && r.plannedStartTime.valueOf() === entry.race.plannedStartTime.valueOf();
        });
        const result = await controller.addLap(entry, race.clock.getElapsedTime());
        if (!result.success) {
            setMessage(result.message);
        }
    }

    async function removeLap(entry) {
        const result = await controller.removeLap(entry, entry.laps[entry.laps.length - 1]);
        if (!result.success) {
            setMessage(result.message);
        }
    }

    async function updateLap(entry, value) {
        const result = await controller.updateLap(entry, value);
        if (!result.success) {
            setMessage(result.message);
        }
    }

    async function setScoringAbbreviation(entry, value) {
        const result = await controller.setScoringAbbreviation(entry, value);
        if (!result.success) {
            setMessage(result.message);
        }
    }

    function getLastEntryPosition() {
        let lowestPosition = 0;
        entriesMap.forEach(entry => {
            if (entry.position > lowestPosition) {
                lowestPosition = entry.position;
            }
        });
        return lowestPosition;
    };

    /**
     * Update the position of an entry in the race
     * @param {Entry} entry 
     * @param {(Integer|PositionConstant)} newPosition 
     */
    async function updateEntryPosition(entry, newPosition) {
        let result;
        if (!newPosition) {
            setMessage('No position to set');
            return;
        }
        switch (newPosition) {
            case PositionConstant.MOVEUPONE:
                if (entry.position != null) {
                    result = await controller.updateEntryPosition(entry, entry.position - 1);
                }
                else {
                    const lastEntryPosition = getLastEntryPosition();
                    result = await controller.updateEntryPosition(entry, lastEntryPosition || 1);
                }
                break;
            case PositionConstant.MOVEDOWNONE:
                if (entry.position != null) {
                    result = await controller.updateEntryPosition(entry, entry.position + 1);
                }
                else {
                    result = await controller.updateEntryPosition(entry, getLastEntryPosition() + 1);
                }
                break;
            default:
                result = await controller.updateEntryPosition(entry, newPosition);
        }
        if (!result.success) {
            setMessage(result.message);
        }
    }

    function onRaceEntryPositionSetByDrag(subjectKey, targetKey) {
        // can only drag entry to a new position when displayed entries are sorted by position
        if (sortOrder !== 'position') {
            setMessage('Entries not sorted by position');
            return;
        }
        const subjectEntry = entriesMap.get(subjectKey);
        const targetEntry = entriesMap.get(targetKey);
        if ((subjectEntry.scoringAbbreviation == null || subjectEntry.scoringAbbreviation === '') && (targetEntry.scoringAbbreviation == null || targetEntry.scoringAbbreviation === '')) {
            // If both entries in same race assign subject position from target position
            if (subjectEntry.race.name === targetEntry.race.name) { // testiing equality directly on races will fail as different objects
                updateEntryPosition(subjectEntry, targetEntry.position);
                return;
            }
            // if entries in different races find first entry below target in same race as subject and use that to assign a position to subject
            else if (subjectEntry.race.name !== targetEntry.race.name) {
                const sortedEntries = sorted();
                for (let i = sortedEntries.findIndex(e => e === targetEntry) + 1; i < sortedEntries.length; i++) {
                    if (subjectEntry.race.name === sortedEntries[i].race.name) { // testiing equality directly on races will fail as different objects
                        updateEntryPosition(subjectEntry, sortedEntries[i].position);
                        return;
                    }
                }
            }
        }
        else {
            setMessage('Cannot change position of an entry with a scoring abbreviation');
            return;
        }
    }

    return (
        <div className='race-entries-view' >
            <p id='race-entries-message' className={!message ? 'hidden' : ''}>{message}</p>
            <div className='w3-row'>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-card' onClick={() => setSortOrder('sailNumber')}>By sail number</button>
                </div>
                <div className='w3-col m3' >
                    <button className='w3-btn w3-block w3-card' onClick={() => setSortOrder('classSailNumber')}>By class & sail number</button>
                </div>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-card' onClick={() => setSortOrder('lastThree')}>By last 3</button>
                </div>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-card' onClick={() => setSortOrder('classLastThree')}>By class & last 3</button>
                </div>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-card' onClick={() => setSortOrder('lapTimes')}>By lap times</button>
                </div>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-card' onClick={() => setSortOrder('position')}>By position</button>
                </div>
            </div>
            <div className='scrollable' >
                {sorted().map(entry => <RaceEntryView key={entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name} entry={entry} addLap={addLap}
                    removeLap={removeLap} updateLap={updateLap} setScoringAbbreviation={setScoringAbbreviation} onRaceEntryDrop={onRaceEntryPositionSetByDrag} />)}
            </div>
        </div>
    );
}

/**
 * Class providng enumeration of constants for use instead of numeric postion value when updating an entries position
 */
class PositionConstant {
    static MOVEUPONE = 'moveUpOne';
    static MOVEDOWNONE = 'moveDownOne';
}

export default RaceEntriesView;
export { PositionConstant };