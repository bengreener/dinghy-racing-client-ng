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

import React from 'react';
import Clock from '../model/domain-classes/clock';
import FlagState from '../model/domain-classes/flag-state';

/**
 * Indicates the current state of a flag
 * @param {Object} props
 * @param {Flag} props.flag
 * @returns {HTMLDivElement}
 */
function FlagControl({ flag }) {

    return (
        <div>
            <label htmlFor={'flag-name-output'}>Flag</label>
            <output id='flag-name-output'>{flag.name}</output>
            <label htmlFor={'current-state-output'}>State</label>
            <output id='current-state-output'>{flag.state === FlagState.LOWERED ? 'Lowered' : 'Raised' }</output>
            <label htmlFor={'change-in-output'}>Change In</label>
            <output id='change-in-output'>{Clock.formatDuration(-flag.timeToChange)}</output>
            {/* {audio === 'prepare' ? <audio data-testid='prepare-sound-warning-audio' autoPlay={true} src='./sounds/prepare_alert.mp3' /> : null}
            {audio === 'act' ? <audio data-testid='act-sound-warning-audio' autoPlay={true} src='./sounds/act_alert.mp3' /> : null} */}
        </div>
    )
}

/**
 * @typedef {Object} FlagStateChangeTiming
 * @property {Integer} startTimeOffset duration in milliseconds, before or after, the start time set for the associated clock that flag should be set to this state
 * @property {FlagState} state of flag to be set at this time 
 */

export default FlagControl;