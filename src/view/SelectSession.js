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

import { useState } from 'react';

/**
 * Select the time window for a set of races.
 * Converts values dates passed as session start and session end times to loval equivalents for display.
 * Converst values entered back into UTC date values when calling onSessionStartChange and onSessionEndChange.
 * @param {Object} props
 * @param {Date} props.sessionStart date
 * @param {Date} props.sessionEnd date
 * @param {SelectSession~onSessionTimeChange} props.onSessionStartChange
 * @param {SelectSession~onSessionTimeChange} props.onSessionEndChange
 */
function SelectSession({ sessionStart, sessionEnd, onSessionStartChange, onSessionEndChange }) {
    const [start, setStart] = useState(() => {
        let localSessionStart;
        if (sessionStart) {
            localSessionStart  = new Date(sessionStart.valueOf()); // as value passed by reference updating sessionStart prop value directly could have side effects (values will be changed on second call under strict mode in development)
            localSessionStart.setMinutes(localSessionStart.getMinutes() - localSessionStart.getTimezoneOffset());
        }
        return localSessionStart ? localSessionStart.toISOString().substring(0, 16) : '';
    });
    const [end, setEnd] = useState(() => {
        let localSessionEnd;
        if (sessionEnd) {
            localSessionEnd = new Date(sessionEnd.valueOf()); // as value passed by reference updating sessionEnd prop value directly could have side effects (values will be changed on second call under strict mode in development)
            localSessionEnd.setMinutes(localSessionEnd.getMinutes() - localSessionEnd.getTimezoneOffset());
        }
        return localSessionEnd ? localSessionEnd.toISOString().substring(0, 16) : '';
    });
    const [message, setMessage] = useState();

    function handleSessionStartChange(event) {
        if (!isNaN(Date.parse(event.target.value))) {
            const newTime = new Date(event.target.value);
            if (end === '' || newTime < new Date(end)) {
                setStart(event.target.value);
                setMessage('');
                if (onSessionStartChange) {
                    onSessionStartChange(newTime);
                }
            }
            else {
                setMessage('Session start must be before session end.')
            }
        }
        else {
            setStart(event.target.value);
            setMessage('');
        }
    }

    function handleSessionEndChange(event) {
        if (!isNaN(Date.parse(event.target.value))) {
            const newTime = new Date(event.target.value);
            if (start === '' || new Date(start) < newTime) {
                setEnd(event.target.value);
                setMessage('');
                if (onSessionEndChange) {
                    onSessionEndChange(newTime);
                }
            }
            else {
                setMessage('Session end must be after session start.')
            }
        }
        else {
            setEnd(event.target.value);
            setMessage('');
        }
    }

    return (
        <div>
            <label htmlFor="select-session-start">Session Start</label>
            <input id="select-session-start" name="sessionStartTime" type="datetime-local" onChange={handleSessionStartChange} value={start} />
            <label htmlFor="select-session-end">Session End</label>
            <input id="select-session-end" name="sessionEndTime" type="datetime-local" onChange={handleSessionEndChange} value={end} />
            <p>{message}</p>
        </div>
    )
}

export default SelectSession;

/**
 * @callback SelectSession~onSessionTimeChange
 * @param {Date} date new time
 */

