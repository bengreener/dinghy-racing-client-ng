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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Clock from '../model/domain-classes/clock';

/**
 * Display the value of a lap and provide the ability edit the value
 * @param {Object} props
 * @param {Number} props.value Lap time to display
 * @param {boolean} props.total The value provided represents a total, sum of, lap times
 * @param {boolean} props.editable True if value can be changed by user
 * @param {eventHandler} props.keyup Called when props.editable === true and keyup event occurs
 * @param {eventHandler} props.focusout Called when props.editable === true and focus leaves the control
 * @returns 
 */
function LapView({value, total, editable = false, keyup, focusout}) {
    const handleChange = useCallback(({ target }) => {
        if (/(^\d*(?:(?=:)|$)):?((?<=:)[0-5]?\d(?:(?=:)|$))?:?((?<=:)[0-5]?\d(?=$))?$/.test(target.value)) {
            setEditValue(target.value);
        }
    }, []);

    const [editValue, setEditValue] = useState(Clock.formatDuration(value));
    const textInputRef = useRef(null);
    const inner = <input ref={textInputRef} type='text' value={editValue} onChange={handleChange} onKeyUp={keyup} onBlur={focusout}/>;
    const classes = total ? 'total' : null;

    useEffect(() => {
        if (editable) {
            textInputRef.current.focus();
        }
    });

    return (
        editable ? <td className={classes} >{inner}</td> : <td className={classes} >{Clock.formatDuration(value)}</td>
    );
}

export default LapView;