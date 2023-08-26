import React from 'react';
import { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntriesView from './RaceEntriesView';
import RaceHeaderView from './RaceHeaderView';
import Clock from '../model/domain-classes/clock';

function RaceConsole() {
    const model = useContext(ModelContext);
    const [selectedRaces, setSelectedRaces] = useState([]);
    const [raceOptions, setRaceOptions] = useState([]);
    const [raceMap, setRaceMap] = useState(new Map());
    const [message, setMessage] = useState('');

    useEffect(() => {
        model.getRacesOnOrAfterTime(new Date()).then(result => {
            if (!result.success) {
                setMessage('Unable to load races\n' + result.message);
            }
            else {
                const options = [];
                const map = new Map();
                // options.push(<option key={''}></option>);
                result.domainObject.forEach(race => {
                    options.push(<option key={race.name + race.plannedStartTime.toISOString()}>{race.name}</option>);
                    map.set(race.name, race);
                });
                setRaceOptions(options);
                setRaceMap(map);
            }
        });
    }, [model]);

    function handleRaceSelect(event) {
        const etso = event.target.selectedOptions
        event.preventDefault();
        const races = [];
        for (let i = 0; i < etso.length; i++) {
            const race = raceMap.get(etso[i].value);
            if (race) {
                if (!race.clock) {
                    race.clock = new Clock();
                }
            }
            races.push(race);
        }
        setSelectedRaces(races);
    }

    return (
        <>
            <label htmlFor="race-select">Select Race</label>
            <select id="race-select" name="race" multiple={true} onChange={handleRaceSelect}>{raceOptions}</select>
            {selectedRaces.map(race => <RaceHeaderView race={race} />)}
            <p id="race-console-message">{message}</p>
            <RaceEntriesView races={selectedRaces} />
        </>
    );
}

export default RaceConsole;