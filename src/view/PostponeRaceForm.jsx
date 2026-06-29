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

    /**
     * Set new start time to current new start time plus duration
     * @param {Integer} duration in milliseconds 
     */
    function handleAddDuration(duration) {
        const nstMilliseconds = newStartTime.getTime() + duration;
        const nstDate = new Date(nstMilliseconds);
        if (nstDate >= race.plannedStartTime) {
            setNewStartTime(nstDate);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        onPostpone(race, newStartTime.getTime() - race.plannedStartTime.getTime());
        if (closeParent) {
            closeParent();
        }
    }

    return(
        <form className={'postpone-race-form w3-container'} onSubmit={handleSubmit}>
            <div className={'w3-half'}>
                <div className={'w3-row'}>
                    <label className={'w3-half'} htmlFor='planned-start-time'>Planned Start Time</label>
                    <output className={'w3-half w3-center'} id='planned-start-time' >{Clock.formatTime(race.plannedStartTime.getTime())}</output>
                </div>
                <div className={'w3-row'}>
                    <label className={'w3-half'} htmlFor='current-start-time'>Current Start Time</label>
                    <output className={'w3-half w3-center'} id='current-start-time'>{Clock.formatTime(race.currentStartTime.getTime())}</output>
                </div>
                <div className={'w3-row'}>
                    <label className={'w3-half'} htmlFor='new-start-time'>New Start Time</label>
                    <input className={'w3-half w3-center'} id='new-start-time' type='time' name='new-start-time' min={Clock.formatTime(race.plannedStartTime.getTime())} step='1' value={Clock.formatTime(newStartTime.getTime())} onChange={handleChange} autoFocus />
                </div>
            </div>
            <div className={'w3-half'}>
                <div className={'w3-row'}>
                    <button className={'w3-half w3-btn w3-border w3-pale-blue w3-hover-blue'} type='button' onClick={() => handleAddDuration(-60000)} disabled={newStartTime.getTime() - 60000 < race.plannedStartTime.getTime()}>-1 minute</button>
                    <button className={'w3-half w3-btn w3-border w3-pale-blue w3-hover-blue'} type='button' onClick={() => handleAddDuration(60000)}>+1 minute</button>
                </div>
                <div className={'w3-row'}>
                    <button className={'w3-half w3-btn w3-border w3-pale-blue w3-hover-blue'} type='button' onClick={() => handleAddDuration(-300000)} disabled={newStartTime.getTime() - 300000 < race.plannedStartTime.getTime()}>-5 minutes</button>
                    <button className={'w3-half w3-btn w3-border w3-pale-blue w3-hover-blue'} type='button' onClick={() => handleAddDuration(300000)}>+5 minutes</button>
                </div>
                <div className={'w3-row'}>
                    <button className={'w3-half w3-btn w3-border w3-pale-blue w3-hover-blue'} type='button' onClick={() => handleAddDuration(-600000)} disabled={newStartTime.getTime() - 600000 < race.plannedStartTime.getTime()}>-10 minutes</button>
                    <button className={'w3-half w3-btn w3-border w3-pale-blue w3-hover-blue'} type='button' onClick={() => handleAddDuration(600000)}>+10 minutes</button>
                </div>
            </div>
            <div className={'w3-row w3-right-align'}>
                {closeParent ? <button className={'w3-btn w3-border w3-border-amber w3-hover-amber'} type='button' onClick={closeParent}>Cancel</button> : null}
                <button type='submit' className={'w3-btn w3-border w3-border-blue w3-hover-blue'} >Set New Time</button>
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