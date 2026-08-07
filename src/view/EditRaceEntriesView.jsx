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

import { useCallback, useEffect, useState } from 'react';
import EditRaceEntryView from './EditRaceEntryView';
import Clock from '../model/clock';
import RaceType from '../model/race-type';
import { buildSynchronousEntries } from './synchronous-model/synchronous-model';

function EditRaceEntriesView ({ races, model, controller }) {
    const [entriesMap, setEntriesMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
    const [displayOrder, setDisplayOrder] = useState([]); // holds entriesMap keys in the order they are to be displayed
    const [entriesUpdateRequestAt, setEntriesUpdateRequestAt] = useState(); // time of last request to fetch entries from server. change triggers a new fetch; for instance when server notifies an entry has been updated
    const [displayedValuesMap, setDisplayedValuesMap] = useState(new Map()); // record lap count and time sailed values that have been entered but possibly not updated so
    
    const updateEntries = useCallback(() => {
        setEntriesUpdateRequestAt(Date.now());
    }, []);

    // get entries
    useEffect(() => {
        let cancel = false;
        const entriesMap = new Map();
        buildSynchronousEntries(races).then((entries) => {
            entries.forEach(sEntry => {
                const key = sEntry.dinghy.dinghyClass.name + sEntry.dinghy.sailNumber + sEntry.helm.name + sEntry.entry.metadata.version;
                entriesMap.set(key, sEntry);
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

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
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
                    const aKey = a.dinghy.dinghyClass.name + a.dinghy.sailNumber + a.helm.name + a.entry.metadata.version;
                    const bKey = b.dinghy.dinghyClass.name + b.dinghy.sailNumber + b.helm.name + b.entry.metadata.version;

                    let aLapCount;
                    let aTimeSailed;
                    let bLapCount;
                    let bTimeSailed;
                    if (displayedValuesMap.has(aKey)) {
                        aLapCount = displayedValuesMap.get(aKey).lapCount;
                        if (aLapCount === '') aLapCount = 0; // replace an empty laps sailed value with 0 so entries are sorted correctly based on numeric values
                        aTimeSailed = Clock.convertStringDurationToMilliseconds(displayedValuesMap.get(aKey).timeSailed);
                    }
                    else {
                        aLapCount = a.laps.entities.length;
                        aTimeSailed = a.sumOfLapTimes;
                    }
                    if (displayedValuesMap.has(bKey)) {
                        bLapCount = displayedValuesMap.get(bKey).lapCount;
                        if (bLapCount === '') bLapCount = 0; // replace an empty laps sailed value with 0 so entries are sorted correctly based on numeric values
                        bTimeSailed = Clock.convertStringDurationToMilliseconds(displayedValuesMap.get(bKey).timeSailed);
                    }
                    else {
                        bLapCount = b.laps.entities.length;
                        bTimeSailed = b.sumOfLapTimes;
                    }
                    let aWeighted =  [aLapCount - aWeighting, aTimeSailed];
                    let bWeighted = [bLapCount - bWeighting, bTimeSailed];;

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
        // return an array of entriesMap keys in the order set
        return ordered.map(entry => entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name + entry.entry.metadata.version);
    }

    function getEntriesDisplay() {
        // check if entries to display match entries in display order list (every entry should be mapped to position in displayOrder and every position in displayOrder should locate an entry)
        // if not sort entries into a display order according to the sort order selected
        // running this check here so as not to build dependency on useEffect that fetches entries on sort order; avoid refetching entries from server each time sort order is changed
        // EditRaceEntriesView will resort display order when an entry is updated as the version identifier is included in the key. This is different to the behaviour for RaceEntriesView
        // retaining the check to ensure new entries are displayed in correct position in sot order and removed entries are removed from display order 
        const entriesInDisplayOrder = Array.from(entriesMap.keys()).every(key => displayOrder.includes(key));
        const displayOrderIncludesEntries = displayOrder.every(key => entriesMap.has(key));
        if (!(entriesInDisplayOrder && displayOrderIncludesEntries)) {
            const tempDisplayOrder = sorted(Array.from(entriesMap.values()), sortOrder);
            setDisplayOrder(tempDisplayOrder);
        }

        return displayOrder.map(key => {
            const entry = entriesMap.get(key);
            if (!entry) return null; // allow for display keys that map to a non existent entry after a race is removed from the selection; fixed by next render
            if (entry.race.type === RaceType.FLEET) {
                return <EditRaceEntryView key={key} entry={entry} onSetLapTotal={controller.setLapTotal} 
                    onSetScoringAbbreviation={controller.setScoringAbbreviation} onUpdateDisplayedLapCountAndSailingTime={handleUpdateDisplayedLapCountAndSailingTime} showUserMessage={showChildUserMessage} />
            }
            else {
                return <EditRaceEntryView key={key} entry={entry} onSetLapTotal={controller.setLapTotal}
                    onSetScoringAbbreviation={controller.setScoringAbbreviation} onUpdateDisplayedLapCountAndSailingTime={handleUpdateDisplayedLapCountAndSailingTime} showUserMessage={showChildUserMessage} />
            }
        });
    }

    function showChildUserMessage(message) {
        setMessage(message);
    }

    function sortButtonClick(sortOrder) {
        setDisplayOrder(sorted(Array.from(entriesMap.values()), sortOrder));
        setSortOrder(sortOrder);
    }

    /**
     * @param {String} key of entry in entries map
     * @param {Integer} lapCount
     * @param {String} time The total time sailed to the end of the lap in the format [hh:][mm:]ss
     */
    function handleUpdateDisplayedLapCountAndSailingTime(key, lapCount, time) {
        const displayMap = new Map();
        // copy existing display values to a new array so not adjusting a state object directly
        displayedValuesMap.forEach((value, key) => {
            displayMap.set(key, value);
        });
        // remove records from displayMap that are not in entriesMap
        displayMap.forEach((value, key, map) => {
            if (!entriesMap.has(key)) {
                map.delete(key);
            }
        });
        // update display map
        displayMap.set(key, {lapCount: lapCount, timeSailed: time});
        setDisplayedValuesMap(displayMap);
    }

    return (
        <div className='edit-race-entries-view' >
            <p className={userMessageClasses()}>{message}</p>
            <div className='w3-row w3-padding'>
                <div className='w3-row'>
                    <label className='bgis-bold'>Sort</label>
                </div>                
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-border bgis-light-blue bgis-hover-dark-blue' onClick={() => sortButtonClick('sailNumber')}>By sail number</button>
                </div>
                <div className='w3-col m3' >
                    <button className='w3-btn w3-block w3-border bgis-light-blue bgis-hover-dark-blue' onClick={() => sortButtonClick('classSailNumber')}>By class & sail number</button>
                </div>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-border bgis-light-blue bgis-hover-dark-blue' onClick={() => sortButtonClick('lapTimes')}>By lap times</button>
                </div>
                <div className='w3-col m2'>
                    <button className='w3-btn w3-block w3-border bgis-light-blue bgis-hover-dark-blue' onClick={() => sortButtonClick('position')}>By position</button>
                </div>
            </div>
            <div className='scrollable' >
                <div className='w3-row bgis-sticky-top w3-white'>
                    <div className='w3-col m2 w3-padding-small bgis-cell w3-border' >
                        <label className='bgis-bold'>Class</label>
                    </div>
                    <div className='w3-col m1 w3-padding-small bgis-cell w3-right-align w3-border' >
                        <label className='bgis-bold'>Sail No</label>
                    </div>
                    <div className='w3-col m2 w3-padding-small bgis-cell w3-border' >
                        <label className='bgis-bold'>Helm</label>
                    </div>
                    <div className='w3-col m1-half w3-padding-small w3-border preserve-whitespace' >
                        <label className='bgis-bold'>Pos</label>
                    </div>
                    <div className='w3-col m1 w3-padding-small w3-border'>
                        <label className='bgis-bold'>Laps</label>
                    </div>
                    <div className='w3-col m1 w3-padding-small w3-border'>
                        <label className='bgis-bold'>Time</label>
                    </div>
                    <div className='w3-col m1 w3-padding-small w3-border preserve-whitespace'>
                        <label className='bgis-bold'>S Abbr</label>
                    </div>
                </div>
                {getEntriesDisplay()}
            </div>
        </div>
    )
}

export default EditRaceEntriesView;