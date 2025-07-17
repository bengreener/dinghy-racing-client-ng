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
 * Provide a form to get the duration of a race postponement
 * Time is set in 5 minute intervals with an initial value of 30 minutes
 * @param {Object} props
 * @param {Race} props.race to postpone
 * @param {PostponeRaceForm~postponeRace} props.onPostpone called when postpone button clicked
 * @param {ModalDialog~closeDialog} props.closeParent call this to close a dialog containing this form
 * @returns {HTMLFormElement}
 */
 function PostponeRaceForm({race, onPostpone, closeParent}) {
    const [duration, setDuration] = useState(30);

    function handleChange({ target }) {
        if (target.value >= 0) {
            setDuration(target.value);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        onPostpone(race, duration * 60 * 1000);
        if (closeParent) {
            closeParent();
        }
    }

    return(
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='delay-input'>Delay</label>
                <input id='delay-input' type='number' name='delay' min='0' step='5' value={duration} onChange={handleChange} autoFocus />
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
 * @param {Race} race to postpone
 * @param {Number} duration in milliseconds, by which to delay the race
 */