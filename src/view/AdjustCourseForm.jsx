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
 * Provide a form to get the new number of laps that will be sailed when a course is shortened
 * @param {Object} props
 * @param {Race} props.race to update
 * @param {Number} props.minLaps The minimum number of laps that can be set; default is 1
 * @param {Number} props.maxLaps The maximum number of laps that can be set; default is 100
 * @param {Number} props.initialValue to display for new laps value; default is minLaps
 * @param {ShortenCouraseForm~updateLaps} props.onUpdate called when update button clicked
 * @param {ModalDialog~closeDialog} props.closeParent call this to close a dialog containing this form
 * @returns {HTMLFormElement}
 */
function AdjustCourseForm({ race, minLaps = 1, maxLaps = 100, initialValue, onUpdate, closeParent}) {
    const [laps, setLaps] = useState(initialValue ? initialValue : minLaps);

    function handleChange({ target }) {
        if (target.value >= minLaps && target.value <= maxLaps) {
            setLaps(target.value);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        onUpdate(race, Number(laps));
        if (closeParent) {
            closeParent();
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='set-laps-input'>Set Laps</label>
                <input id='set-laps-input' name='laps' type='number' min={minLaps.toString()} max={maxLaps.toString()} value={laps} onChange={handleChange} autoFocus/>
            </div>
            <div>
                {closeParent ? <button type='button' onClick={closeParent}>Cancel</button> : null}
                <button type='submit' >Update Laps</button>
            </div>
        </form>
    )
}

export default AdjustCourseForm;

/**
 * Action to take when AdjustCourseForm update laps button clicked
 * @callback ShortenCouraseForm~updateLaps
 * @param {Race} race to update
 * @param {Number} laps to set as new number of planned laps
 */