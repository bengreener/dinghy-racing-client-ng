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

import React, { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import SelectSession from './SelectSession';

/**
 * Show races that are scheduled to be held
 * @param {Object} props
 * @param {ViewUpcomingRaces~showSignUpForm} props.showSignUpForm A function that will result in a sign up form for a race being displayed
 * @returns {HTMLElement}
 */
function ViewUpcomingRaces({ showSignUpForm = false }) {
    const model = useContext(ModelContext);
    const [sessionStart, setSessionStart] = useState(new Date());
    const [sessionEnd, setSessionEnd] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));
    const [raceMap, setRaceMap] = useState(new Map());  
    const [message, setMessage] = useState('');

    function handleRowClick({currentTarget}) {
        if (showSignUpForm) {
            showSignUpForm(raceMap.get(currentTarget.id));
        }
    }

    useEffect(() => {
        model.getRacesBetweenTimes(new Date(sessionStart), new Date(sessionEnd)).then(result => {
            if (result.success) {
                let map = new Map();
                const races = result.domainObject;
                races.forEach(race => {
                    map.set(race.url, race);
                });
                setRaceMap(map);
            }
            else {
                setMessage('Unable to load races\n' + result.message);
            }
        });
    }, [model, sessionStart, sessionEnd])

    function handlesessionStartInputChange(date) {
        setSessionStart(date);
    }

    function handlesessionEndInputChange(date) {
        setSessionEnd(date);
    }

    return (
        <div className="upcoming-races">
            <h1>Upcoming Races</h1>
            <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} onSessionEndChange={handlesessionEndInputChange} />
            <p id="view-upcoming-races-message" className={!message ? "hidden" : ""}>{message}</p>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Race</th><th>Class</th><th>Start Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from(raceMap.values()).map(race => <tr key={race.url} id={race.url} onClick={handleRowClick}><td>{race.name}</td><td>{race.dinghyClass ? race.dinghyClass.name : ''}</td><td>{race.plannedStartTime.toLocaleString()}</td></tr>)}
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