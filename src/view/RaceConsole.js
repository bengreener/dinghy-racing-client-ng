import React from 'react';
import { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntriesView from './RaceEntriesView';
import RaceHeaderView from './RaceHeaderView';
import Clock from '../model/domain-classes/clock';

function RaceConsole() {
    const model = useContext(ModelContext);
    const now = new Date();
    const [selectedRaces, setSelectedRaces] = useState([]);
    const [raceOptions, setRaceOptions] = useState([]);
    const [raceMap, setRaceMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const [sessionStart, setSessionStart] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30).toISOString().substring(0, 16));
    const [sessionEnd, setSessionEnd] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18).toISOString().substring(0, 16));

    useEffect(() => {
        model.getRacesBetweenTimes(new Date(sessionStart), new Date(sessionEnd)).then(result => {
        // model.getRacesOnOrAfterTime(new Date(sessionStart)).then(result => {
            if (!result.success) {
                setMessage('Unable to load races\n' + result.message);
            }
            else {
                const options = [];
                const map = new Map();
                result.domainObject.forEach(race => {
                    options.push(<option key={race.name + race.plannedStartTime.toISOString()}>{race.name}</option>);
                    map.set(race.name, race);
                });
                setRaceOptions(options);
                setRaceMap(map);
            }
        });
    }, [model, sessionStart, sessionEnd]);

    function handleRaceSelect(event) {
        const etso = event.target.selectedOptions
        event.preventDefault();
        const races = [];
        for (let i = 0; i < etso.length; i++) {
            const race = raceMap.get(etso[i].value);
            if (race) {
                if (!race.clock) {
                    race.clock = new Clock(race.plannedStartTime);
                }
            }
            races.push(race);
        }
        setSelectedRaces(races);
    }

    function handleSelectSessionStartChange({target}) {
        setSessionStart(target.value);
    }

    function handleSelectSessionEndChange({target}) {
        setSessionEnd(target.value);
    }

    return (
        <div className="race-console">
            <div className="select-race">
                <label htmlFor="race-select">Select Race</label>
                <select id="race-select" name="race" multiple={true} onChange={handleRaceSelect}>{raceOptions}</select>
                <label htmlFor="race-select-session-start">Session Start</label>
                <input id="race-select-session-start" name="sessionStartTime" type="datetime-local" onChange={handleSelectSessionStartChange} value={sessionStart} />
                <label htmlFor="race-select-session-end">Session End</label>
                <input id="race-select-session-end" name="sessionEndTime" type="datetime-local" onChange={handleSelectSessionEndChange} value={sessionEnd} />
            </div>
            <p id="race-console-message" className={!message ? "hidden" : ""}>{message}</p>
            {selectedRaces.map(race => <RaceHeaderView key={race.name+race.plannedStartTime.toISOString()} race={race} />)}
            <RaceEntriesView races={selectedRaces} />
        </div>
    );
}

export default RaceConsole;