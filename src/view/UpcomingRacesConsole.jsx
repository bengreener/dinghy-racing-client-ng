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

import { useCallback, useEffect, useState } from 'react';
import SelectSession from './SelectSession';
import RaceTableRow from './RaceTableRow';

/**
 * Show races that are scheduled to be held
 * @param {Object} props
 * @param {SylphModel} props.model
 * @param {ViewUpcomingRaces~showSignUpConsole} props.showSignUpConsole A function that will result in a sign up form for a race being displayed
 * @returns {HTMLElement}
 */
function UpcomingRacesConsole({ model, showSignUpConsole }) {
    const [sessionStart, setSessionStart] = useState(new Date());
    const [sessionEnd, setSessionEnd] = useState(() => {
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 20:00 UTC intially
        sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        return sessionEnd;
    });
    const [raceMap, setRaceMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    }, []);

    function handleRowClick({currentTarget}) {
        if (showSignUpConsole) {
            showSignUpConsole(raceMap.get(currentTarget.id), model);
        }
    }

    useEffect(() => {
        let ignoreFetch = false;
        let races = [];
        if (!ignoreFetch) {
            model.getRacesBetweenTimes(sessionStart, sessionEnd).then(result => {
                    let map = new Map();
                    races = result.entities;
                    races.forEach(race => {
                        map.set(race.url, race);
                        model.registerRaceUpdateCallback(race.url, handleRaceUpdate);
                    });
                    setRaceMap(map);
                    setMessage('');
            }).catch((error) => {
                setMessage('Unable to load races\n' + error.message);
            });
        }

        return () => {
            ignoreFetch = true;
            races.forEach(race => {
                model.unregisterRaceUpdateCallback(race.url);
            });
        }
    }, [model, sessionStart, sessionEnd, racesUpdateRequestAt, handleRaceUpdate])

    function handlesessionStartInputChange(date) {
        setSessionStart(date);
    }

    function handlesessionEndInputChange(date) {
        setSessionEnd(date);
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    return (
        <div className='w3-container console'>
            <h1>Upcoming Races</h1>
            <form className='w3-container'>
                <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} onSessionEndChange={handlesessionEndInputChange} />
            </form>
            <p className={userMessageClasses()}>{message}</p>
            <div className='scrollable'>
                <table className='w3-table w3-striped'>
                    <thead>
                        <tr>
                            <th>Race</th><th>Class</th><th>Start Time</th><th>Type</th><th>Start Type</th>
                        </tr>
                    </thead>
                    <tbody>
                    {Array.from(raceMap.values()).sort((a, b) => {return a.plannedStartTime.getTime() - b.plannedStartTime.getTime()}).map(race => 
                        <RaceTableRow key={race.url} race={race} handleRowClick={handleRowClick} />
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UpcomingRacesConsole;

/**
 * @callback ViewUpcomingRaces~showSignUpConsole
 * @param {DirectRace} race The race to sign up to
 * @param {Model} model
 */