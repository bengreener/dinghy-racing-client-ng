/**
 * Get a scoring abbreviation from a list of scoring abbreviations
 * @param {Object} props
 * @param {string} props.value to set as displayed value
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
        <td>
            <select value={sc} onClick={handleOnClick} onAuxClick={handleAuxClick} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp} onPointerOut={handlePointerOut} onPointerLeave={handlePointerLeave} onPointerCancel={handleCancel} onChange={handleChange} >
                <option></option>
                <option>DNS</option>
                <option>RET</option>
            </select>
        </td>
    )
}

export default ScoringAbbreviation;