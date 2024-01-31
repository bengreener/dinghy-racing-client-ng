import React, { useState } from 'react';

/**
 * A container for race headers.
 * Provide show/ hide feature for contained headers
 */
function RaceHeaderContainer({ children }) {
    const [showChildren, setShowChildren] = useState(true);


    function handleToggleChildrenButtonClick(event) {
        setShowChildren(s => !s);
    }

    return (
        <>
        <button id='toggle-children-button' type='button' onClick={handleToggleChildrenButtonClick}>{showChildren ? 'Hide' : 'Show'}</button>
            {showChildren ? children : null}
        </>
    )
}

export default RaceHeaderContainer;