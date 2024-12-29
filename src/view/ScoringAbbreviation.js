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

/**
 * Get a scoring abbreviation from a list of scoring abbreviations
 * @param {Object} props
 * @param {String} props.value to set as displayed value
 * @param {eventHandler} props.onChange
 */
function ScoringAbbreviation({value = '', onChange}) {
    const sc = value ? value : ''; // replace nulls with empty string to avoid `value` prop on `select` should not be null warning.

    function handleChange(event) {
        onChange(event);
    }

    function handleOnClick(event) {
        event.stopPropagation();
    }

    function handleAuxClick(event) {
        event.stopPropagation();
    }

    function handlePointerDown(event) {
        event.stopPropagation();
    }

    function handlePointerMove(event) {
        event.stopPropagation();
    }

    function handlePointerUp(event) {
        event.stopPropagation();
    }

    function handlePointerOut(event) {
        event.stopPropagation();
    }

    function handlePointerLeave(event) {
        event.stopPropagation();
    }

    function handleCancel(event) {
        event.stopPropagation();
    }

    return (
        <select value={sc} onClick={handleOnClick} onAuxClick={handleAuxClick} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp} onPointerOut={handlePointerOut} onPointerLeave={handlePointerLeave} onPointerCancel={handleCancel} onChange={handleChange} >
            <option></option>
            <option>DNC</option>
            <option>DNS</option>
            <option>DSQ</option>
            <option>RET</option>
        </select>
    )
}

export default ScoringAbbreviation;