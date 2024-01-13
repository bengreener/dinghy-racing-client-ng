import React, { useCallback, useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntryView from './RaceEntryView';
import { sortArray } from '../utilities/array-utilities';
import ControllerContext from './ControllerContext';

function RaceEntriesView({ races }) {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [entriesMap, setEntriesMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies an entry has been updated

    const updateEntries = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    });

    // get entries
    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceEntriewView rerendered before fetch completes to avoid using out of date result
        const entriesMap = new Map();
        // build promises
        const promises = races.map(race => {
            if (!ignoreFetch && !race || (!race.name && !race.url)) {
                return Promise.resolve({'success': true, 'domainObject': []});
            }
            else if (!ignoreFetch) {
                return model.getEntriesByRace(race);
            }
        });
        Promise.all(promises).then(results => {
            results.forEach(result => {
                if (!ignoreFetch && !result.success) {
                    setMessage('Unable to load entries\n' + result.message);
                }
                else if (!ignoreFetch) {
                    result.domainObject.forEach(entry => {
                        entriesMap.set(entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name, entry);
                    });
                }
            });
            if (!ignoreFetch) {
                setEntriesMap(entriesMap);
            }
        });

        return () => {
            ignoreFetch = true;
            setMessage(''); // clear any previous message
        }
    }, [model, races, racesUpdateRequestAt]);

    // return array of entries sorted according to selected sort order
    function sorted() {
        let ordered = [];
        switch (sortOrder) {
            case 'default':
                ordered = Array.from(entriesMap.values());
                break;
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
            // sort by the sum of all recorded lap times
            case 'lapTimes':
                ordered = sortArray(Array.from(entriesMap.values()), (entry) => {
                    const totalTime = entry.laps.reduce((accumulator, initialValue) => {
                        const sum =  accumulator + initialValue.time;
                        return sum;
                    }, 0);
                    return totalTime;
                });
                break;
            default:
                ordered = Array.from(entriesMap.values());
        }
        return ordered;
    }

    async function addLap(entry) {
        // if race was referenced by entries wouldn't need to keep looking it up. 
        // fix this in getEntries useEffect by replacing referenced race data from REST with that from races prop 
        const race = races.find((r) => {
            return r.name === entry.race.name && r.plannedStartTime.valueOf() === entry.race.plannedStartTime.valueOf();
        });
        const lapTime = calculateLapTime(race.clock.getElapsedTime(), entry.laps);
        const result = await controller.addLap(entry, lapTime);
        if (!result.success) {
            setMessage(result.message);
        }
        else {
            updateEntries();
        }
    }

    async function removeLap(entry) {
        const result = await controller.removeLap(entry, entry.laps[entry.laps.length - 1]);
        if (!result.success) {
            setMessage(result.message);
        }
        else {
            updateEntries();
        }
    }

    async function updateLap(entry, value) {
        const result = await controller.updateLap(entry, value);
        if (!result.success) {
            setMessage(result.message);
        }
        else {
            updateEntries();
        }
    }

    function calculateLapTime(elapsedTime, laps) {
        const lapTimes = laps.reduce((accumulator, initialValue) => {
            return accumulator + initialValue.time;
        }, 0);
        return elapsedTime - lapTimes;
    }

    return (
        <div className="race-entries-view">
            <p id="race-entries-message" className={!message ? "hidden" : ""}>{message}</p>
            <div>
                <button onClick={() => setSortOrder('default')}>Default</button>
                <button onClick={() => setSortOrder('lastThree')}>By last 3</button>
                <button onClick={() => setSortOrder('classLastThree')}>By class & last 3</button>
                <button onClick={() => setSortOrder('lapTimes')}>By lap times</button>
            </div>
            <div className="scrollable">
                <table id="race-entries-table">
                    <tbody>
                    {sorted().map(entry => <RaceEntryView key={entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name} entry={entry} addLap={addLap} removeLap={removeLap} updateLap={updateLap}/>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RaceEntriesView;