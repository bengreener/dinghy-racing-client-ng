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

import React, { useCallback, useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import SelectSession from './SelectSession';
import { toTitleCase } from '../utilities/text-utilities';
import StartType from '../model/domain-classes/start-type';

/**
 * Show races that are scheduled to be held
 * @param {Object} props
 * @param {ViewUpcomingRaces~showSignUpForm} props.showSignUpForm A function that will result in a sign up form for a race being displayed
 * @returns {HTMLElement}
 */
function ViewUpcomingRaces({ showSignUpForm = false }) {
    const model = useContext(ModelContext);
    const [sessionStart, setSessionStart] = useState(new Date());
    const [sessionEnd, setSessionEnd] = useState(() => {
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 20:00 UTC intially
        sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        return sessionEnd;
    });
    const [raceMap, setRaceMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    }, []);

    function handleRowClick({currentTarget}) {
        if (showSignUpForm) {
            showSignUpForm(raceMap.get(currentTarget.id));
        }
    }

    useEffect(() => {
        let ignoreFetch = false;
        let races = [];
        model.getRacesBetweenTimes(sessionStart, sessionEnd).then(result => {
            if (result.success && !ignoreFetch) {
                let map = new Map();
                races = result.domainObject;
                races.forEach(race => {
                    map.set(race.url, race);
                    model.registerRaceUpdateCallback(race.url, handleRaceUpdate);
                });
                setRaceMap(map);
                setMessage('');
            }
            else {
                setMessage('Unable to load races\n' + result.message);
            }
        });

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

    function startTypeDisplayValue(startType) {
        switch (startType) {
            case StartType.CSCCLUBSTART:
                return '10-5-Go';
            case StartType.RRS26:
                return '5-4-1-Go';
            default:
                return '';
        }
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
                            <tr className='clickable-table-row' key={race.url} id={race.url} onClick={handleRowClick} >
                                <td>{race.name}</td>
                                <td>{race.dinghyClass ? race.dinghyClass.name : ''}</td>
                                <td>{race.plannedStartTime.toLocaleString()}</td>
                                <td>{toTitleCase(race.type)}</td>
                                <td>{startTypeDisplayValue(race.startType)}</td>
                            </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ViewUpcomingRaces;

/**
 * @callback ViewUpcomingRaces~showSignUpForm
 * @param {Race} race The race to sign up to
 */