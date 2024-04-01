import React, { useEffect, useState } from 'react';
import Clock from '../model/domain-classes/clock';

/**
 * Indicates the current state of a flag
 * @param {Object} props
 * @param {string} props.name of the flag
 * @param {Clock} props.clock to use to time state changes
 * @param {Array<FlagStateChangeTiming>} flagStateChangeTimings for raising and lowering the flag
 * @returns {HTMLDivElement}
 */
function FlagControl({ name, clock, flagStateChangeTimings }) {
    const [currentState, setCurrentState] = useState(FlagState.LOWERED);

    function calculateState() {
        const elapsedTime = clock.getElapsedTime();
        let finalState = FlagState.LOWERED;
        flagStateChangeTimings.forEach(flagStateChange => {
            if (elapsedTime > flagStateChange.startTimeOffset) {
                finalState = flagStateChange.state;
            }
        });
        setCurrentState(finalState);
    }

    useEffect(() => {
        calculateState();
    }, []);

    return (
        <div>
            <label htmlFor={'flag-name-output'}>Flag</label>
            <output id='flag-name-output'>{name}</output>
            <label htmlFor={'current-state-output'}>State</label>
            <output id='current-state-output'>{currentState === FlagState.LOWERED ? 'Lowered' : 'Raised' }</output>
        </div>
    )
}

/**
 * @typedef {Object} FlagStateChangeTiming
 * @property {integer} startTimeOffset duration in milliseconds, before or after, the start time set for the associated clock that flag should be set to this state
 * @property {FlagState} state of flag to be set at this time 
 */

/**
 * Class providng enumeration of Flag State options
 */
class FlagState {
    static RAISED = 'raised';
    static LOWERED = 'lowered';
}

export default FlagControl;
export { FlagState };
