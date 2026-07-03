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
 * @param {DirectRace} props.race to update
 * @param {Number} props.minLaps The minimum number of laps that can be set; default is 1
 * @param {Number} props.maxLaps The maximum number of laps that can be set; default is 100
 * @param {Number} props.initialValue to display for new laps value; default is minLaps
 * @param {ShortenCouraseForm~updateLaps} props.onUpdate called when update button clicked
 * @param {ModalDialog~closeDialog} props.closeParent call this to close a dialog containing this form
 * @returns {HTMLFormElement}
 */
function AdjustCourseForm({ race, minLaps = 1, maxLaps, initialValue, onUpdate, closeParent}) {
    const [laps, setLaps] = useState(initialValue ? initialValue : minLaps);
    const [message, setMessage] = useState('');

    /**
     * Update the number of laps displayed
     * @param {Integer} inputLaps
     */
    function updateLaps(laps) {
        let newLaps = laps;
        if (newLaps < 0) {
            setMessage('Cannot adjust course to less than 1 lap.');
            newLaps = 0;
        }
        else if (newLaps === 0) {
            setMessage('Cannot adjust course to less than 1 lap.');
        }
        else if (newLaps < minLaps) {
            newLaps = minLaps;
            setMessage(`Cannot adjust course to less than ${minLaps} laps.`);
        }
        else if (newLaps > maxLaps) {
            newLaps = maxLaps;
            setMessage(`Cannot adjust course to more than ${maxLaps} laps.`);
        }
        else {
            setMessage('');
        }
        setLaps(newLaps);
    }

    function handleChange({ target }) {
        if (target.value === '') {
            updateLaps(0);
        }
        const inputValue = Number.parseInt(target.value);
        if (!Number.isNaN(inputValue)) {
            updateLaps(inputValue);
        }
    }

    function handleKeyUp(event) {
        if (event.key === 'ArrowUp') {
            updateLaps(laps + 1);
        }
        else if (event.key === 'ArrowDown') {
            updateLaps(laps - 1);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (laps >= minLaps && (maxLaps ? laps <= maxLaps : true)) {
            onUpdate(race, Number(laps));
            if (closeParent) {
                closeParent();
            }
        }
    }

    return (
        <form className={'adjust-course-form w3-container'} onSubmit={handleSubmit}>
            <div className={'w3-row'}>
                <div className={'w3-row'}>
                    <label className={'w3-half'} htmlFor={'current-laps-output'}>Current Laps</label>
                    <output className={'w3-half w3-center'} id={'current-laps-output'}>{race.plannedLaps}</output>
                </div>
                <div className={'w3-row'}>
                    <label className={'w3-half'} htmlFor='set-laps-input'>New Laps</label>
                    <input className={'w3-half w3-center'} id='set-laps-input' name='laps' type='text' value={laps} onKeyUp={handleKeyUp} onChange={handleChange} autoFocus/>
                </div>
                <div className={'w3-row'}>
                    <button className={'w3-half w3-btn w3-border w3-pale-blue w3-hover-blue'} type='button' onClick={() => updateLaps(laps - 1)} disabled={laps <= minLaps} >-1 Lap</button>
                    <button className={'w3-half w3-btn w3-border w3-pale-blue w3-hover-blue'} type='button' onClick={() => updateLaps(laps + 1)} disabled={laps >= maxLaps} >+1 Lap</button>
                </div>
            </div>
            <div>
                {message ? <p className={'console-error-message'}>{message}</p> : null}
            </div>
            <div className={'w3-row w3-right'}>
                {closeParent ? <button className={'w3-btn w3-border w3-border-white bgis-pale-amber w3-hover-amber'} type='button' onClick={closeParent}>Cancel</button> : null}
                <button className={'w3-btn w3-border w3-border-white w3-pale-green w3-hover-green'} type='submit' >Update Laps</button>
            </div>
        </form>
    )
}

export default AdjustCourseForm;

/**
 * Action to take when AdjustCourseForm update laps button clicked
 * @callback ShortenCouraseForm~updateLaps
 * @param {DirectRace} race to update
 * @param {Number} laps to set as new number of planned laps
 */