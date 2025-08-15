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

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntriesView from './RaceEntriesView';
import RaceHeaderView from './RaceHeaderView';
import CollapsableContainer from './CollapsableContainer';
import SelectSession from './SelectSession';
import RaceType from '../model/domain-classes/race-type';
import { storageAvailable } from '../utilities/storage-utilities';

function RaceConsole() {
    const model = useContext(ModelContext);
    const sessionStorageAvailable = useMemo(() => storageAvailable('sessionStorage'), []);
    const [selectedRaces, setSelectedRaces] = useState([]); // selection of race names made by user
    const [raceOptions, setRaceOptions] = useState([]); // list of names of races names for selection
    const [raceMap, setRaceMap] = useState(new Map()); // map of race names to races
    const [message, setMessage] = useState(''); // feedback to user
    const [sessionStart, setSessionStart] = useState(() => {
            let sessionStart;
            if (sessionStorageAvailable) {
                const storedValue = sessionStorage.getItem('sessionStart');
                if (storedValue) {
                    sessionStart = new Date(storedValue);
                }
            }
            if (!sessionStart) {
                sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
                sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
            }
            return sessionStart;
        });
        const [sessionEnd, setSessionEnd] = useState(() => {
            let sessionEnd;
            if (sessionStorageAvailable) {
                const storedValue = sessionStorage.getItem('sessionEnd');
                if (storedValue) {
                    sessionEnd = new Date(storedValue);
                }
            }
            if (!sessionEnd) {
                sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 20:00 UTC intially
                sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
            }
            return sessionEnd;
        });
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated
    const [raceType, setRaceType] = useState(RaceType.FLEET);

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    }, []);

    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceConsole rerendered before fetch completes to avoid using out of date result
        model.getRacesBetweenTimesForType(new Date(sessionStart), new Date(sessionEnd), raceType).then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load races\n' + result.message);
            }
            else if (!ignoreFetch) {
                const map = new Map();
                const options = []; // html option elements
                const optionsRaceNames = []; // just the names of the races to match with previously selected races
                result.domainObject.forEach(race => {
                    race.clock = model.getClock();
                    map.set(race.name, race);
                    options.push(<option key={race.name + race.plannedStartTime.toISOString()} value={race.name} >{race.name}</option>);
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
    }, [model, sessionStart, sessionEnd, raceType, racesUpdateRequestAt]);

    // register on update callbacks for races
    useEffect(() => {
        const races = Array.from(raceMap.values());
        races.forEach(race => {
            model.registerRaceUpdateCallback(race.url, handleRaceUpdate);
            // need to update available races so when selected they include the lap information for the lead entry
            model.registerRaceEntryLapsUpdateCallback(race.url, handleRaceUpdate); // refetch all races to avoid writing new code to fetch details for a single race and inserting it into raceMap
        });
        // cleanup before effect runs and before form close
        return () => {
            races.forEach(race => {
                model.unregisterRaceUpdateCallback(race.url, handleRaceUpdate);
                model.unregisterRaceEntryLapsUpdateCallback(race.url, handleRaceUpdate);
            });
        }
    }, [model, raceMap, handleRaceUpdate]);

    function handleRaceSelect(event) {
        const options = [...event.target.selectedOptions]; // convert from HTMLCollection to Array; trying to go direct to value results in event.target.selectedOptions.value is not iterable error
        setSelectedRaces(options.map(option => option.value));
    }

    function handlesessionStartInputChange(date) {
        if (sessionStorageAvailable) {
            sessionStorage.setItem('sessionStart', date.toISOString());
        }
        setSessionStart(date);
    }

    function handlesessionEndInputChange(date) {
        if (sessionStorageAvailable) {
            sessionStorage.setItem('sessionEnd', date.toISOString());
        }
        setSessionEnd(date);
    }

    function handleRaceTypeChange({ target }) {
        setRaceType(RaceType.from(target.value));
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    return (
        <div className='w3-container console'>
            <CollapsableContainer heading={'Select Races'}>
                <form className='w3-container' >
                    <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} onSessionEndChange={handlesessionEndInputChange} />
                    <div className='w3-row'>
                        <fieldset className='w3-third' >
                            <legend>Race Type:</legend>
                            <div className='w3-cell-row'>
                                <div className='w3-cell'>
                                    <input id='radio-race-type-fleet' name='race-type' type='radio' value='FLEET' onChange={handleRaceTypeChange} defaultChecked='true'/>
                                    <label htmlFor='radio-race-type-fleet'>Fleet</label>
                                </div>
                                <div className='w3-cell'>
                                    <input id='radio-race-type-pursuit' name='race-type' type='radio' value='PURSUIT' onChange={handleRaceTypeChange} />
                                    <label htmlFor='radio-race-type-pursuit'>Pursuit</label>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <label htmlFor='race-select' className='w3-left w3-col' >Select Race</label>
                    <select id='race-select' name='race' multiple={true} className='w3-col w3-third' onChange={handleRaceSelect} value={selectedRaces}>{raceOptions}</select>
                </form>
                <p className={userMessageClasses()}>{message}</p>
            </CollapsableContainer>
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