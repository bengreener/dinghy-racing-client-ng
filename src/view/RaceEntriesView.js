import React, { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntryView from './RaceEntryView';
import DinghyRacingModel from '../model/dinghy-racing-model';

function RaceEntriesView({race, clock}) {
    const model = useContext(ModelContext);
    const [entriesMap, setEntriesMap] = useState(new Map());
    const [message, setMessage] = useState('');

    // get entries
    useEffect(() => {
        model.getEntriesByRace(race).then(result => {
            if (!result.success) {
                setMessage('Unable to load entries\n' + result.message);
            }
            else {
                const entriesMap = new Map();
                result.domainObject.forEach(entry => {
                    entriesMap.set(entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.competitor.name, entry) ;
                });
                setEntriesMap(entriesMap);
            }
        })
    }, [model, race]);

    function setLap(entry) {
        entriesMap.get(entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.competitor.name).laps.push({...DinghyRacingModel.lapTemplate(), 'number': entry.laps.length + 1, 'time': clock.getElapsedTime()});
    }

    return (
        <table id="race-entries-table">
            <tbody>
            {Array.from(entriesMap.values()).map(entry => <RaceEntryView key={entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.competitor.name} entry={entry} onClick={(setLap)}/>)}
            </tbody>
        </table>
    );
}

export default RaceEntriesView;