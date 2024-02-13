import React, { useEffect, useRef } from 'react';
import Clock from '../model/domain-classes/clock';

/**
 * 
 * @param {Object} props
 * @param {Number} props.value Lap time to display
 * @param {boolean} props.total The value provided represents a total, sum of, lap times
 * @param {boolean} props.editable True if value can be changed by user
 * @param {eventHandler} props.keyup Called when props.editable === true and keyup event occurs
 * @param {eventHandler} props.focusout Called when props.editable === true and focus leaves the control
 * @returns 
 */
function LapView({value, total, editable = false, keyup, focusout}) {
    const textInputRef = useRef(null);
    const inner = <input ref={textInputRef} type='number' defaultValue={value} onKeyUp={keyup} onBlur={focusout}/>;
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