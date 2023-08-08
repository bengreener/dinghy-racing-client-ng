import React from 'react';
import { useContext, useEffect, useState } from 'react';
import DinghyRacingModel from '../model/dinghy-racing-model';
import ModelContext from './ModelContext';

function RaceConsole() {
    const model = useContext(ModelContext);
    const [raceMap, setRaceMap] = useState(new Map());
    const [message, setMessage] = useState('');

    useEffect(() => {
        model.getRacesOnOrAfterTime(new Date()).then(result => {
            if (!result.success) {
                setMessage('Unable to load races\n' + result.message);
            }
            else {
                const map = new Map();
                result.domainObject.forEach(race => map.set(race.name, race));
                setRaceMap(map);
            }
        });
    }, [model]);

    return (
        <>
            <label htmlFor="race-select">Select Race</label>
            <select id="race-select" name="race">{Array.from(raceMap.keys()).map(key => <option key={key}>{key}</option>)}</select>
            <p id="race-console-message">{message}</p>
        </>
    );
}

export default RaceConsole;