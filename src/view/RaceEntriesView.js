import React, { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntryView from './RaceEntryView';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { sortArray } from '../utilities/array-utilities';

function RaceEntriesView({ races }) {
    const model = useContext(ModelContext);
    const [entriesMap, setEntriesMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const [sortOrder, setSortOrder] = useState('default');

    // get entries
    useEffect(() => {
        const entriesMap = new Map();
        // build promises
        const promises = races.map(race => {
            if (!race || (!race.name && !race.url)) {
                return Promise.resolve({'success': true, 'domainObject': new Map()});
            }
            else {
                return model.getEntriesByRace(race);
            }
        });
        Promise.all(promises).then(results => {
            results.forEach(result => {
                if (!result.success) {
                    setMessage('Unable to load entries\n' + result.message);
                }
                else {
                    result.domainObject.forEach(entry => {
                        entriesMap.set(entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.competitor.name, entry);
                    });
                }
            });
            setEntriesMap(entriesMap);
        });
    }, [model, races]);

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
            default:
                ordered = Array.from(entriesMap.values());
        }
        return ordered;
    }

    function setLap(entry) {
        // if race was referenced by entries wouldn't need to keep looking it up. fix this in getEntries useEffect by replacing referenced race data from REST with that from races prop 
        const race = races.find((r) => {
            return r.name === entry.race.name && r.plannedStartTime.valueOf() === entry.race.plannedStartTime.valueOf();
        });
        entriesMap.get(entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.competitor.name).laps.push({...DinghyRacingModel.lapTemplate(), 'number': entry.laps.length + 1, 'time': race.clock.getElapsedTime()});
    }

    return (
        <>
        <p id="race-console-message">{message}</p>
        <button onClick={() => setSortOrder('default')}>Default</button>
        <button onClick={() => setSortOrder('lastThree')}>By last 3</button>
        <table id="race-entries-table">
            <tbody>
            {sorted().map(entry => <RaceEntryView key={entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.competitor.name} entry={entry} onClick={(setLap)}/>)}
            </tbody>
        </table>
        </>
    );
}

export default RaceEntriesView;