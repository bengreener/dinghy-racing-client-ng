/**
 * Get a scoring abbreviation from a list of scoring abbreviations
 * @param {eventHandler} onChange
 */
function ScoringAbbreviation({onChange}) {

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
            <select onClick={handleOnClick} onAuxClick={handleAuxClick} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} 
                onPointerUp={handlePointerUp} onPointerOut={handlePointerOut} onPointerLeave={handlePointerLeave} onPointerCancel={handleCancel} onChange={onChange} >
                <option></option>
                <option>DNS</option>
            </select>
        </td>
    )
}

export default ScoringAbbreviation;