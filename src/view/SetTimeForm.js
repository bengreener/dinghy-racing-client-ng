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

let formatOptions = {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
};

const timeFormat = new Intl.DateTimeFormat('en-GB', formatOptions);

/**
 * Get a time value from the user
 * @param {Object} props
 * @param {SetTimeForm~setTime} props.setTime callback to set time
 * @param {ModalDialog~closeDialog} [props.closeParent] call this to close a dialog containing this form
 */
function SetTimeForm({ setTime, closeParent }) {
    const [timeString, setTimeString] = useState(timeFormat.format(Date.now()));

    function convertTimeStringToDate(timeString) {
        const timeArray = timeString.split(':'); // hh:mm[:ss]
        const day = Math.floor(Date.now() / 86400000) * 86400000;
        const hours = timeArray[0] * 3600000;
        const minutes = timeArray[1] * 60000;
        const seconds = timeArray[2] ? timeArray[2] * 1000 : 0;
        return new Date(day + hours + minutes + seconds);
    }

    function handleChange({ target }) {
        const newTime = target.value ? target.value : 0;
        setTimeString(newTime);
    }

    function handleSetTimeButtonClick(event) {
        event.preventDefault();
        setTime(convertTimeStringToDate(timeString));
        if (closeParent) {
            closeParent();
        }
    }

    return (
        <form action='' method='get'>
            <div>
                <label htmlFor="input-time" >Enter time:</label>
                <input id="input-time" type="time" value={timeString} step="1" onChange={handleChange} />
            </div>
            <div>
                {closeParent ? <button type='button' onClick={closeParent} >Cancel</button> : null}                
                <button type='button' onClick={handleSetTimeButtonClick}>Set Time</button>
            </div>
        </form>
    )
}

export default SetTimeForm;

/**
 * Action to take when Set Time button clicked
 * @callback SetTimeForm~setTime
 * @param {Date} time to set
 */