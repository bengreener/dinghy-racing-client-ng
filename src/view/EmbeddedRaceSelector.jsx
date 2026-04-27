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

import EmbeddedRace from '../model/embedded-race';

/**
 * @param {Object} props
 * @param {EmbeddedRace} props.embeddedRace
 * @param {boolean} props.raceSelected
 * @param {Function} props.onChange
 * @returns {HTMLDivElement}
 */
function EmbeddedRaceSelector({ embeddedRace, raceSelected, onChange }) {

    function handleChange(event) {
        event.preventDefault();
        onChange(embeddedRace);
    }

    return (
        <div>
            <label htmlFor={embeddedRace.name + '-checkbox'}>{embeddedRace.name}</label>
            <input id={embeddedRace.name + '-checkbox'} type='checkbox' onChange={handleChange} checked={raceSelected} />
        </div>
    )
}

export default EmbeddedRaceSelector;