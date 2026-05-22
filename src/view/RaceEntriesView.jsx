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

// import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useCallback, useEffect, useState } from 'react';
import RaceEntryView from './RaceEntryView';
import RaceType from '../model/race-type';
import { buildSynchronousEntries } from './synchronous-model/synchronous-model';
import SynchronousEntry from './synchronous-model/synchronous-entry';

/**
 * Display race entries
 * @param {Object} props
 * @param {Array<DirectRace>} props.races
 * @returns {HTMLDivElement}
 */
function RaceEntriesView({ races, controller, model }) {
    const [entriesMap, setEntriesMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
    const [entriesUpdateRequestAt, setEntriesUpdateRequestAt] = useState(); // time of last request to fetch entries from server. change triggers a new fetch; for instance when server notifies an entry has been updated
    const [displayOrder, setDisplayOrder] = useState([]); // holds entriesMap keys in the order they are to be displayed
    const [fastGroup, setFastGroup] = useState([]); // holds the entriesMap keys of entries that have been fast grouped

    const updateEntries = useCallback(() => {
        setEntriesUpdateRequestAt(Date.now());
    }, []);

    // get entries
    useEffect(() => {
        let cancel = false;
        const entriesMap = new Map();
        buildSynchronousEntries(races).then((entries) => {
            entries.forEach(sEntry => {
                entriesMap.set(sEntry.dinghy.dinghyClass.name + sEntry.dinghy.sailNumber + sEntry.helm.name, sEntry);
                const cumulativeLapTimes = sEntry.laps.entities.reduce((previous, current) => previous + current.time, 0);
                if (sEntry.sumOfLapTimes != cumulativeLapTimes) {
                    console.debug(`Entry sumOfLapTimes  not equal to cumulativeLapTimes, entry, ${sEntry.url}, sumOfLapTimes, ${sEntry.sumOfLapTimes}, cumulativeLapTime, ${cumulativeLapTimes}`);
                }
            });
            if (!cancel) {
                setEntriesMap(entriesMap);
                setMessage('');
            }
        }).catch((error) => {
            if (!cancel) {
                console.error(error.message, error);
                setMessage('Unable to load entries\n' + error.message);
            }
        });

        return (() => {
            cancel = true;
        })
    }, [entriesUpdateRequestAt, model, races]);

    // register entries update callbacks
    useEffect(() => {
        entriesMap.forEach(entry => {
            entry.registerEntryUpdateCallback(updateEntries);
        });

        return () => {
            entriesMap.forEach(entry => {
                entry.unregisterEntryUpdateCallback(updateEntries);
            });
        }
    }, [entriesMap, updateEntries]);

    function handleRefreshClick() {
        setEntriesUpdateRequestAt(Date.now());
    }
	
    // return array of entry keys sorted according to selected sort order
    function sorted(entries, order) {
        let ordered = [];
        switch (order) {
            case 'sailNumber':
                ordered = entries.sort((a, b) => {
                    const sailNumberA = Number.isNaN(a.dinghy.sailNumber) ? a.dinghy.sailNumber : Number(a.dinghy.sailNumber);
                    const sailNumberB = Number.isNaN(b.dinghy.sailNumber) ? b.dinghy.sailNumber : Number(b.dinghy.sailNumber);
                    if (sailNumberA < sailNumberB) {
                        return -1;
                    }
                    if (sailNumberA > sailNumberB) {
                        return 1;
                    }
                    return 0;
                });
                break;
            case 'classSailNumber':
                ordered = entries.sort((a, b) => {
                    const sailNumberA = Number.isNaN(a.dinghy.sailNumber) ? a.dinghy.sailNumber : Number(a.dinghy.sailNumber);
                    const sailNumberB = Number.isNaN(b.dinghy.sailNumber) ? b.dinghy.sailNumber : Number(b.dinghy.sailNumber);
                    
                    if (a.dinghy.dinghyClass.name < b.dinghy.dinghyClass.name) {
                        return -1;
                    }
                    else if (a.dinghy.dinghyClass.name > b.dinghy.dinghyClass.name) {
                        return 1;
                    }
                    if (sailNumberA < sailNumberB) {
                        return -1;
                    }
                    if (sailNumberA > sailNumberB) {
                        return 1;
                    }
                    return 0;
                });
                break;
            // sort by number of laps and then by time to complete last lap
            case 'lapTimes':
                ordered = entries.sort((a, b) => {
                    const aWeighting = (a.scoringAbbreviation == null || a.scoringAbbreviation === '') ? 0 : Date.now();
                    const bWeighting = (b.scoringAbbreviation == null || b.scoringAbbreviation === '') ? 0 : Date.now();
                    let aWeighted = [a.laps.entities.length - aWeighting, a.sumOfLapTimes];
                    let bWeighted = [b.laps.entities.length - bWeighting, b.sumOfLapTimes];
                    
                    // if b has sailed more laps than a then b is the faster boat
                    if (aWeighted[0] < bWeighted[0]) {
                        return 1;
                    }
                    // if a has sailed more laps than b then a is the faster boat
                    else if (aWeighted[0] > bWeighted[0]) {
                        return -1;
                    }
                    // if a lap time is less than b lap times then a is the faster boat
                    if (aWeighted[1] < bWeighted[1]) {
                        return -1;
                    }
                    // if a lap time is greater than b lap time then b is the faster boat
                    else if (aWeighted[1] > bWeighted[1]) {
                        return 1;
                    }
                    return 0; // both boats took the same amount of time to sail the same number of laps
                });
                break;
            case 'position':
                ordered = entries.sort((a, b) => {
                    let aWeight = .5;
                    let bWeight = .5;
                    if (!(a.scoringAbbreviation == null || a.scoringAbbreviation === '')) {
                        aWeight = aWeight * 2;
                    }
                    if (!(b.scoringAbbreviation == null || b.scoringAbbreviation === '')) {
                        bWeight = bWeight * 2;
                    }
                    let aWeighted = (a.position && aWeight === .5) ? a.position : Date.now() * aWeight; // if entry doesn't have a position return a large number to put it to the bottom
                    let bWeighted = (b.position && bWeight === .5) ? b.position : Date.now() * bWeight; // if entry doesn't have a position return a large number to put it to the bottom
                    return aWeighted - bWeighted;
                });
                break;
            case 'forecast':
                ordered = entries.sort((a, b) => {
                    let aWeight = 1;
                    let bWeight = 1;
                    if (!(a.scoringAbbreviation == null || a.scoringAbbreviation === '')) {
                        aWeight = aWeight * 2;
                    }
                    if (!(b.scoringAbbreviation == null || b.scoringAbbreviation === '')) {
                        bWeight = bWeight * 2;
                    }
                    const aLastLapTime = a.sumOfLapTimes ? a.sumOfLapTimes : 0;
                    const bLastLapTime = b.sumOfLapTimes ? b.sumOfLapTimes : 0;
                    let aWeighted = (a.race.plannedStartTime.getTime() + aLastLapTime + ((a.race.duration / a.race.plannedLaps) * a.dinghy.dinghyClass.portsmouthNumber / 1000)) * aWeight;
                    let bWeighted = (b.race.plannedStartTime.getTime() + bLastLapTime + ((b.race.duration / b.race.plannedLaps) * b.dinghy.dinghyClass.portsmouthNumber / 1000)) * bWeight;
                    
                    if (aWeighted < bWeighted) {
                        return -1;
                    }
                    else if (aWeighted > bWeighted) {
                        return 1;
                    }
                    return 0;
                });
                break;
            default:
                ordered = entries.sort((a, b) => {
                    const snEndDigitsA = a.dinghy.sailNumber.substring(a.dinghy.sailNumber.length - 3, a.dinghy.sailNumber.length);
                    const snEndDigitsB = b.dinghy.sailNumber.substring(b.dinghy.sailNumber.length - 3, b.dinghy.sailNumber.length);
                    const sailNumberA = Number.isNaN(snEndDigitsA) ? snEndDigitsA : Number(snEndDigitsA);
                    const sailNumberB = Number.isNaN(snEndDigitsB) ? snEndDigitsB : Number(snEndDigitsB);
                    
                    if (a.dinghy.dinghyClass.name < b.dinghy.dinghyClass.name) {
                        return -1;
                    }
                    else if (a.dinghy.dinghyClass.name > b.dinghy.dinghyClass.name) {
                        return 1;
                    }
                    if (sailNumberA < sailNumberB) {
                        return -1;
                    }
                    if (sailNumberA > sailNumberB) {
                        return 1;
                    }
                    return 0;
                });
        }
        return ordered.map(entry => entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name);
    }

    /**
     * Add a lap to an entry in a race
     * @param {SynchronousEntry} entry
     */
    async function addLap(entry) {
        const lapTimes = entry.laps.entities.reduce((accumulator, initialValue) => {
            return accumulator + initialValue.time;
        }, 0);
        try {
            await controller.addLap(entry.entry, entry.race.clock.getElapsedTime(entry.race.plannedStartTime) - lapTimes);
            return true;
        }
        catch (error) {
            console.error(error.message, error);
            setMessage(error.message);
            return false;
        }
    }

    /**
     * 
     * @param {SynchronousEntry} entry 
     * @returns {Boolean}
     */
    async function removeLap(entry) {
        try {
            await controller.removeLap(entry.entry, entry.laps.entities[entry.laps.entities.length - 1]);
            return true;
        }
        catch (error) {
            setMessage(error.message);
            return false
        }
    }

    /**
     * 
     * @param {SynchronousEntry} entry 
     * @param {Number | String} value 
     * @returns {Boolean}
     */
    async function updateLap(entry, value) {
        try {
            await controller.updateLap(entry.entry, value);
            return true;
        }
        catch (error) {
            console.error(error.message, error);
            setMessage(error.message);
            return false;
        }
    }

    /**
     * Add a scoring abbreviation to an entry in a race
     * @param {SynchronousEntry} entry
     * @param {String} value scoring abbreviation to set
     * @returns {Boolean}
     * @throws {Error}
     */
    async function setScoringAbbreviation(entry, value) {
        try {
            await controller.setScoringAbbreviation(entry.entry, value);
            return true;
        }
        catch (error) {
            console.error(error.message, error);
            setMessage(error.message);
            return false;
        }
    }

    function showChildUserMessage(message) {
        setMessage(message);
    }

    function onFastGroup(entryKey) {
        const entry = entriesMap.get(entryKey);
        if (entry.scoringAbbreviation == null || entry.scoringAbbreviation === '') {
            if (fastGroup.includes(entryKey)) {
                // remove entry from fastGroup and current position in display order
                setFastGroup(fastGroup.toSpliced(fastGroup.indexOf(entryKey), 1));
                const newDisplayOrder = displayOrder.toSpliced(displayOrder.indexOf(entryKey), 1);
                // move entry to new position in display order
                setDisplayOrder(newDisplayOrder); // getEntriesDisplay will put entry back where it should be based on the current sort
            }
            else {
                // remove entry from it current position in display order
                const subjectIndex = displayOrder.indexOf(entryKey);
                const newDisplayOrder = displayOrder.toSpliced(subjectIndex, 1);
                // insert subject in new position in display order
                newDisplayOrder.splice(fastGroup.length, 0, entryKey);
                setFastGroup(fastGroup.toSpliced(fastGroup.length, 0, entryKey));
                setDisplayOrder(newDisplayOrder);
            }
        }
        else {
            setMessage('Cannot fast group an entry with a scoring abbreviation');
        }
    };

    /**
     * Update the position of an entry in the race
     * @param {Entry} entry 
     * @param {(Integer | PositionConstant)} position 
     * @returns {Promise<Boolean>}
     */
    async function updateEntryPosition(entry, position) {
        if (!position) {
            setMessage('No position to set');
            return false;
        }
        try {
            await controller.updateEntryPosition(entry.entry, position);
            setMessage('');
            return true;
        }
        catch (error) {
            setMessage(error.message);
            return false;
        }
    }

    /**
     * 
     * @param {String} subjectKey 
     * @param {String} targetKey 
     * @returns {Promise<Boolean>}
     */
    async function handleRaceEntryDrop(subjectKey, targetKey) {
        const subjectEntry = entriesMap.get(subjectKey);
        const targetEntry = entriesMap.get(targetKey);
        let newDisplayOrder = [];
        let newFastGroup = [];

        if ((subjectEntry.scoringAbbreviation == null || subjectEntry.scoringAbbreviation === '') && (targetEntry.scoringAbbreviation == null || targetEntry.scoringAbbreviation === '')) {
            // adjust fast group
            if (fastGroup.includes(subjectKey) && !fastGroup.includes(targetKey)) {
                // remove subject from fast group
                newFastGroup = fastGroup.toSpliced(fastGroup.indexOf(subjectKey), 1);
            }
            else if (!fastGroup.includes(subjectKey) && fastGroup.includes(targetKey)) {
                // add subject to fastGroup
                newFastGroup = fastGroup.toSpliced(Math.max(0, fastGroup.indexOf(targetKey)), 0, subjectKey);
            }
            else if (fastGroup.includes(subjectKey) && fastGroup.includes(targetKey)) {
                // remove subject from it current position in fast group
                newFastGroup = fastGroup.toSpliced(fastGroup.indexOf(subjectKey), 1);
                // insert subject in new position in fast group
                newFastGroup.splice(Math.max(0, fastGroup.indexOf(targetKey)), 0, subjectKey);
            }
            // adjust display order
            // remove subject from it current position in display order
            newDisplayOrder = displayOrder.toSpliced(displayOrder.indexOf(subjectKey), 1);
            // insert subject in new position in display order
            newDisplayOrder.splice(Math.max(0, displayOrder.indexOf(targetKey)), 0, subjectKey);
            // set new display order
            setFastGroup(newFastGroup);
            setDisplayOrder(newDisplayOrder);
            // If race type is pursuit and both entries in same race assign subject position from target position
            if (subjectEntry.race.type === RaceType.PURSUIT && subjectEntry.race.name === targetEntry.race.name) { // testiing equality directly on races will fail as different objects
                return updateEntryPosition(subjectEntry, targetEntry.position);
            }
        }
        else {
            setMessage('Cannot change position of an entry with a scoring abbreviation');
            return false;
        }
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    function getEntriesDisplay() {
        // check if entries to display match entries in display order list (every entry should be mapped to position in displayOrder and every position in displayOrder should locate an entry)
        // if not sort entries into a display order according to the sort order selected
        // running this check here so as not to build dependency on useEffect that fetches entries on sort order; avoid refetching entries from server each time sort order is changed
        const entriesInDisplayOrder = Array.from(entriesMap.keys()).every(key => displayOrder.includes(key));
        const displayOrderIncludesEntries = displayOrder.every(key => entriesMap.has(key));
        if (!(entriesInDisplayOrder && displayOrderIncludesEntries)) {
            const tempDisplayOrder = sorted(Array.from(entriesMap.values()), sortOrder);
            // ensure fast group containes only entries still included in selected races
            const tempFastGroup = [];
            fastGroup.forEach((entryKey) => {
                if (tempDisplayOrder.includes(entryKey)) {
                    tempFastGroup.push(entryKey);
                }
            });
            tempFastGroup.forEach((entryKey) => {
                if (tempDisplayOrder.includes(entryKey)) {
                    tempDisplayOrder.splice(tempDisplayOrder.indexOf(entryKey), 1);
                    tempDisplayOrder.splice(tempFastGroup.indexOf(entryKey), 0, entryKey);
                }
            });
            setFastGroup(tempFastGroup);
            setDisplayOrder(tempDisplayOrder);
        }

        return displayOrder.map(key => {
            const entry = entriesMap.get(key);
            if (!entry) return null; // allow for display keys that map to a non existent entry after a race is removed from the selection; fixed by next render
            if (entry.race.type === RaceType.FLEET) {
                return <RaceEntryView key={key} entry={entry} addLap={addLap}
                    removeLap={removeLap} updateLap={updateLap} setScoringAbbreviation={setScoringAbbreviation} onRaceEntryDrop={handleRaceEntryDrop} onFastGroup={onFastGroup} inFastGroup={fastGroup.includes(key)} showUserMessage={showChildUserMessage} />
            }
            else {
                return <RaceEntryView key={key} entry={entry} addLap={addLap}
                    removeLap={removeLap} updateLap={updateLap} setScoringAbbreviation={setScoringAbbreviation} onRaceEntryDrop={handleRaceEntryDrop} />
            }
        });
    }

    function sortButtonClick(sortOrder) {
        setFastGroup([]);
        setDisplayOrder(sorted(Array.from(entriesMap.values()), sortOrder));
        setSortOrder(sortOrder);
    }

    return (
        <div className='race-entries-view' >
            <p className={userMessageClasses()}>{message}</p>
            <div className='w3-row'>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-card' onClick={() => sortButtonClick('sailNumber')}>By sail number</button>
                </div>
                <div className='w3-col m3' >
                    <button className='w3-btn w3-block w3-card' onClick={() => sortButtonClick('classSailNumber')}>By class & sail number</button>
                </div>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-card' onClick={() => sortButtonClick('lapTimes')}>By lap times</button>
                </div>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-card' onClick={() => sortButtonClick('position')}>By position</button>
                </div>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-card' onClick={() => sortButtonClick('forecast')}>By forecast</button>
                </div>
                <div className='w3-col m1'>
                    <button className='w3-btn w3-block w3-card' title='refresh' onClick={handleRefreshClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" height=".9em" viewBox="0 -960 960 960" width=".9em" fill="#5f6368"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
                    </button>
                </div>
            </div>
            <div className='scrollable' >
                {getEntriesDisplay()}
            </div>
        </div>
    );
}

export default RaceEntriesView;