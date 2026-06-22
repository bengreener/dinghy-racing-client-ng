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
import Clock from '../model/clock';

/**
 * Provide a form to get the duration of a race postponement
 * Time is set in 5 minute intervals with an initial value of 30 minutes
 * @param {Object} props
 * @param {DirectRace} props.race to postpone
 * @param {PostponeRaceForm~postponeRace} props.onPostpone called when postpone button clicked
 * @param {ModalDialog~closeDialog} props.closeParent call this to close a dialog containing this form
 * @returns {HTMLFormElement}
 */
 function PostponeRaceForm({race, onPostpone, closeParent}) {
    const [newStartTime, setNewStartTime] = useState(race.currentStartTime);

    function handleChange({ target }) {
        if (target.value != "") {
            const timeArray = target.value.split(':');
            // some time input controls may not return seconds component
            const date = new Date(newStartTime.getFullYear(), newStartTime.getMonth(), newStartTime.getDate(), Number.parseInt(timeArray[0]), Number.parseInt(timeArray[1]), Number.parseInt(timeArray[2] ?? 0));
            setNewStartTime(date);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        onPostpone(race, newStartTime.valueOf() - race.plannedStartTime.valueOf());
        if (closeParent) {
            closeParent();
        }
    }

    return(
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='planned-start-time'>Planned Start Time</label>
                <input id='planned-start-time' value={Clock.formatTime(race.plannedStartTime.valueOf())} disabled />
            </div>
            <div>
                <label htmlFor='current-start-time'>Current Start Time</label>
                <input id='current-start-time' value={Clock.formatTime(race.currentStartTime.valueOf())} disabled />
            </div>
            <div>
                <label htmlFor='new-start-time' >New Start Time</label>
                <input id='new-start-time' type='time' name='new-start-time' min={Clock.formatTime(race.plannedStartTime.valueOf())} step='1' value={Clock.formatTime(newStartTime.valueOf())} onChange={handleChange} autoFocus />
            </div>
            <div>
                {closeParent ? <button type='button' onClick={closeParent}>Cancel</button> : null}
                <button type='submit' >Postpone</button>
            </div>
        </form>
    )
}

export default PostponeRaceForm;

/**
 * Action to take when PostponeRaceDialog postpone button clicked
 * @callback PostponeRaceForm~postponeRace
 * @param {DirectRace} race to postpone
 * @param {Number} duration in milliseconds, by which to delay the race
 */