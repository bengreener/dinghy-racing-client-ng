import React, { useEffect, useRef } from 'react';
import Clock from '../model/domain-classes/clock';

function LapView({value, editable = false, keyup, focusout}) {
    const textInputRef = useRef(null);
    const inner = <input ref={textInputRef} type='number' defaultValue={value} onKeyUp={keyup} onBlur={focusout}/>;

    useEffect(() => {
        if (editable) {
            textInputRef.current.focus();
        }
    });

    return (
        editable ? <td>{inner}</td> : <td>{Clock.formatDuration(value)}</td>
    );
}

export default LapView;