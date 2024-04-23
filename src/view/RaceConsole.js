import React from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntriesView from './RaceEntriesView';
import RaceHeaderView from './RaceHeaderView';
import Clock from '../model/domain-classes/clock';
import CollapsableContainer from './CollapsableContainer';
import SelectSession from './SelectSession';

function RaceConsole() {
    const model = useContext(ModelContext);
    const [selectedRaces, setSelectedRaces] = useState([]); // selection of race names made by user
    const [raceOptions, setRaceOptions] = useState([]); // list of names of races names for selection
    const [raceMap, setRaceMap] = useState(new Map()); // map of race names to races
    const [message, setMessage] = useState(''); // feedback to user
    const [sessionStart, setSessionStart] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000));
    const [sessionEnd, setSessionEnd] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    }, []);

    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceConsole rerendered before fetch completes to avoid using out of date result
        model.getRacesBetweenTimes(new Date(sessionStart), new Date(sessionEnd)).then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load races\n' + result.message);
            }
            else if (!ignoreFetch) {
                const map = new Map();
                const options = []; // html option elements
                const optionsRaceNames = []; // just the names of the races to match with previously selected races
                result.domainObject.forEach(race => {
                    race.clock = new Clock(race.plannedStartTime);
                    map.set(race.name, race);
                    options.push(<option key={race.name + race.plannedStartTime.toISOString()}>{race.name}</option>);
                    optionsRaceNames.push(race.name);
                });
                setRaceMap(map);
                setSelectedRaces(s => s.filter(selectedRaceName => optionsRaceNames.includes(selectedRaceName))); // remove any previously selected races that are no longer available from race selectedRaces  
                setRaceOptions(options);
            }
        });

        return () => {
            ignoreFetch = true;
            setMessage('');
        }
    }, [model, sessionStart, sessionEnd, racesUpdateRequestAt]);

    // register on update callbacks for races
    useEffect(() => {
        const races = Array.from(raceMap.values());
        races.forEach(race => {
            model.registerRaceUpdateCallback(race.url, handleRaceUpdate);
        });
        // cleanup before effect runs and before form close
        return () => {
            races.forEach(race => {
                model.unregisterRaceUpdateCallback(race.url, handleRaceUpdate);
            });
        }
    }, [model, raceMap, handleRaceUpdate])

    function handleRaceSelect(event) {
        const options = [...event.target.selectedOptions]; // convert from HTMLCollection to Array; trying to go direct to value results in event.target.selectedOptions.value is not iterable error
        setSelectedRaces(options.map(option => option.value));
    }

    function handlesessionStartInputChange(date) {
        setSessionStart(date);
    }

    function handlesessionEndInputChange(date) {
        setSessionEnd(date);
    }

    return (
        <div className="race-console">
            <div className="select-race">
                <label htmlFor="race-select">Select Race</label>
                <select id="race-select" name="race" multiple={true} onChange={handleRaceSelect} value={selectedRaces}>{raceOptions}</select>
                <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} onSessionEndChange={handlesessionEndInputChange} />
            </div>
            <p id="race-console-message" className={!message ? "hidden" : ""}>{message}</p>
            <CollapsableContainer heading={'Races'}>
                {selectedRaces.map(selectedRace => {
                    const race = raceMap.get(selectedRace);
                    return <RaceHeaderView key={race.name+race.plannedStartTime.toISOString()} race={race} />
                })}
            </CollapsableContainer>
            <RaceEntriesView races={selectedRaces.map(selectedRace => raceMap.get(selectedRace))} />
        </div>
    );
}

export default RaceConsole;