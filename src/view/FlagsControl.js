import React from 'react';

/**
 * Provide visual and auditory indicators to assist a Race Officer in controlling the flags used to start a race
 * @param {Object} props
 * @param {Array<Race>} [props.races=[]]
 * @returns {HTMLDivElement}
 */
function FlagsControl({races = []}) {
    const flags = [...races];
    flags.splice(0, 0, {name: 'Blue Peter'});

    return (
        <div>
            {flags.map(race => <p key={race.name}>{race.name}</p>)}
        </div>
    );
}

export default FlagsControl;