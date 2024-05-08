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

import { useCallback, useState } from 'react';

/**
 * Provide a form to get the new number of laps that will be sailed when a course is shortened
 * @param {Object} props
 * @param {Number} props.maxLaps The maximum number of Laps that can be set; default is 100
 * @returns {HTMLFormElement}
 */
function ShortenCourseForm({ maxLaps = 100 }) {
    const [laps, setLaps] = useState(0);

    const handleChange = useCallback(({ target }) => {
        if (target.value <= maxLaps) {
            setLaps(target.value);
        }
    });

    return (
        <form action='' method='get'>
            <div>
                <label htmlFor='set-laps-input'>Set Laps</label>
                <input id='set-laps-input' type='number' max={maxLaps.toString()} value={laps} onChange={handleChange} />
            </div>
            <div>
                <button type='button'>Update Laps</button>
            </div>
        </form>
    )
}

export default ShortenCourseForm;