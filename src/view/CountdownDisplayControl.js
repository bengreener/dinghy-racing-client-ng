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

import Clock from '../model/domain-classes/clock';

/**
 * Display a formatted time and a message
 * @param {Object} prop
 * @param {Integer} prop.time
 * @param {String} prop.message
 */
function CountdownDisplayControl({ title, time, message }) {

    return (
        <div className='countdown-display-control' >
            <h3>{title}</h3>
            <p className='clock-display'>{Clock.formatDuration(time)}</p>
            <p>{message}</p>    
        </div>
    )
}

export default CountdownDisplayControl;