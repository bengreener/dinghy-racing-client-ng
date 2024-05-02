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

/**
 * Select races to download results for.
 */
function DownloadRacesForm() {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [sessionStart, setSessionStart] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000));
    const [sessionEnd, setSessionEnd] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));
    const [races, setRaces] = useState([]);
    const [message, setMessage] = useState(''); // feedback to user

    const handleRaceResultDownloadClick = useCallback((race) => {
        controller.downloadRaceResults(race).then(result => {
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

    return (
        <div>
            <h1>Download Races</h1>
            <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} onSessionEndChange={handlesessionEndInputChange} />
            <p id="download-races-message" className={!message ? "hidden" : ""}>{message}</p>
            {races.map(race => {return (
                <div key={race.name+race.plannedStartTime.toISOString()} >
                    <label>{race.name}</label>
                    <label>{race.dinghyClass ? race.dinghyClass.name : ''}</label>
                    <label htmlFor={'race-start-' + race.name.replace(/ /g, '-').toLowerCase()} >Start Time</label>
                    <output id={'race-start-' + race.name.replace(/ /g, '-').toLowerCase()}>{new Intl.DateTimeFormat(navigator.language, {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                        hour12: false
                    }).format(race.plannedStartTime)}</output>
                    <button id="race-result-download-button" onClick={() => handleRaceResultDownloadClick(race)}>Download Results</button>
                </div>
            )})}
        </div>
    );
}

export default DownloadRacesForm;