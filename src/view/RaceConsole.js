import React from 'react';
import { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import ControllerContext from './ControllerContext';

function RaceConsole() {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [selectedRace, setSelectedRace] = useState('');
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
                options.push(<option key={''}></option>)
                result.domainObject.forEach(race => {
                    options.push(<option key={race.name + race.time.toISOString()}>{race.name}</option>);
                    map.set(race.name, race)
                });
                setRaceOptions(options);
                setRaceMap(map);
            }
        });
    }, [model]);

    function handleRaceSelect(event) {
        event.preventDefault();
        setSelectedRace(event.target.value);
    }

    function handleStartRaceClick() {
        controller.startRace(raceMap.get(selectedRace));
    }

    return (
        <>
            <label htmlFor="race-select">Select Race</label>
            <select id="race-select" name="race" onChange={handleRaceSelect}>{raceOptions}</select>
            <p id="race-console-message">{message}</p>
            <button id="race-start-button" onClick={handleStartRaceClick}>Start Race</button>
        </>
    );
}

export default RaceConsole;