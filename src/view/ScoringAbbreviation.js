import { useState } from 'react';

/**
 * Get a scoring abbreviation from a list of scoring abbreviations
 * @param {Object} props
 * @param {string} props.value to set as displayed value
 * @param {eventHandler} props.onChange
 */
function ScoringAbbreviation({value, onChange}) {
    const [scoringAbbreviation, setScoringAbbreviation] = useState(() => value ? value : '');

    function handleChange(event) {
        // setScoringAbbreviation(event.target.value);
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
        <td>
            <select value={scoringAbbreviation} onClick={handleOnClick} onAuxClick={handleAuxClick} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp} onPointerOut={handlePointerOut} onPointerLeave={handlePointerLeave} onPointerCancel={handleCancel} onChange={handleChange} >
                <option></option>
                <option>DNS</option>
            </select>
        </td>
    )
}

export default ScoringAbbreviation;