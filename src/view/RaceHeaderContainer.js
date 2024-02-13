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
        <div id='race-header-container'>
        <h3>
            Race Headers
            <button id='toggle-children-button' className='embedded' type='button' title={showChildren ? 'Hide' : 'Show'} onClick={handleToggleChildrenButtonClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
					<path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                </svg>
            </button>
        </h3>
        {showChildren ? children : null}
        </div>
    )
}

export default RaceHeaderContainer;