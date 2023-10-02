import React, { useEffect, useRef } from 'react';

function LapView({value, editable = false, keyup, focusout}) {
    const textInputRef = useRef(null);
    const inner = <input ref={textInputRef} type='number' defaultValue={value} onKeyUp={keyup} onBlur={focusout}/>;

    useEffect(() => {
        if (editable) {
            textInputRef.current.focus();
        }
    });

    return (
        editable ? <td>{inner}</td> : <td>{value}</td>  
    );
}

export default LapView;