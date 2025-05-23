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

import { useContext, useCallback, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import ControllerContext from './ControllerContext';
import SelectSession from './SelectSession';
import DownloadRace from './DownloadRace';

/**
 * Select races to download results for.
 */
function DownloadRacesForm() {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [sessionStart, setSessionStart] = useState(() => {
        const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
        sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
        return sessionStart;
    });
    const [sessionEnd, setSessionEnd] = useState(() => {
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 75600000); // create as 18:00 UTC intially
        sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        return sessionEnd;
    });
    const [races, setRaces] = useState([]);
    const [message, setMessage] = useState(''); // feedback to user

    const handleRaceResultDownloadClick = useCallback((race, options) => {
        controller.downloadRaceResults(race, options).then(result => {
            if (!result.success) {
                setMessage('Unable to download results\n' + result.message);
            }
        });
    }, [controller]);

    function handlesessionStartInputChange(date) {
        setSessionStart(date);
    }

    function handlesessionEndInputChange(date) {
        setSessionEnd(date);
    }

    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceConsole rerendered before fetch completes to avoid using out of date result
        model.getRacesBetweenTimes(sessionStart, sessionEnd).then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load races\n' + result.message);
            }
            else if (!ignoreFetch) {
                setRaces(result.domainObject);
            }
        });

        return () => {
            ignoreFetch = true;
            setMessage('');
        }
    }, [model, sessionStart, sessionEnd]);

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    return (
        <div className='w3-container console' >
            <h1>Download Races</h1>
            <form className='w3-container' action='' method='get'>
                <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} onSessionEndChange={handlesessionEndInputChange} />
            </form>
            <p className={userMessageClasses()}>{message}</p>
            <div className='scrollable'>
                {races.map(race => <DownloadRace key={race.name+race.plannedStartTime.toISOString()} race={race} downloadFunction={handleRaceResultDownloadClick} />)}
            </div>
        </div>
    );
}

export default DownloadRacesForm;