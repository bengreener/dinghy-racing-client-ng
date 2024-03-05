import { useState } from 'react';

/**
 * Select the time window for a set of races
 * @param {Object} props
 * @param {Date} props.sessionStart date
 * @param {Date} props.sessionEnd date
 * @param {SelectSession~onSessionTimeChange} props.onSessionStartChange
 * @param {SelectSession~onSessionTimeChange} props.onSessionEndChange
 */
function SelectSession({ sessionStart, sessionEnd, onSessionStartChange, onSessionEndChange }) {
    const [start, setStart] = useState(sessionStart ? sessionStart.toISOString().substring(0, 16) : '');
    const [end, setEnd] = useState(sessionEnd ? sessionEnd.toISOString().substring(0, 16) : '');
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

