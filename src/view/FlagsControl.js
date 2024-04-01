import React from 'react';
import FlagControl from './FlagControl';
import Clock from '../model/domain-classes/clock';
import { FlagState } from './FlagControl';


/**
 * Provide visual and auditory indicators to assist a Race Officer in controlling the flags used to start a race
 * @param {Object} props
 * @param {Array<Race>} [props.races=[]]
 * @returns {HTMLDivElement}
 */
function FlagsControl({races = []}) {
    const flags = [...races];
    flags.splice(1, 0, {name: 'Blue Peter', plannedStartTime: new Date(flags[0].plannedStartTime + 300000)});

    const flagStateChanges = new Map(flags.map(flag => [
        flag.name, [ {startTimeOffset: -600000, state: FlagState.RAISED}, {startTimeOffset: 0, state: FlagState.LOWERED} ]
    ]));

    return (
        <div>
            {flags.map(flag => {
                    return <FlagControl key={flag.name} name={flag.name} clock={new Clock(flag.plannedStartTime)} flagStateChangeTimings={flagStateChanges.get(flag.name)} />
                }
            )}
        </div>
    );
}

export default FlagsControl;