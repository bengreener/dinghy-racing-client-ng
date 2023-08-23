import React from 'react';
import { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntriesView from './RaceEntriesView';
import RaceHeaderView from './RaceHeaderView';

function RaceConsole() {
    const model = useContext(ModelContext);
    const [selectedRace, setSelectedRace] = useState();
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
                options.push(<option key={''}></option>);
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
        event.preventDefault();
        const race = raceMap.get(event.target.value);
        setSelectedRace(race);
    }

    return (
        <>
            <label htmlFor="race-select">Select Race</label>
            <select id="race-select" name="race" onChange={handleRaceSelect}>{raceOptions}</select>
            {selectedRace ? <RaceHeaderView race={selectedRace} /> : null }
            <p id="race-console-message">{message}</p>
            <RaceEntriesView races={[selectedRace]} />
        </>
    );
}

export default RaceConsole;