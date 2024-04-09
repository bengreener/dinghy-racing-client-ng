import React from 'react';
import FlagControl from './FlagControl';
import Clock from '../model/domain-classes/clock';
import FlagState from '../model/flag-state';


/**
 * Provide visual and auditory indicators to assist a Race Officer in controlling the flags used to start a race
 * @param {Object} props
 * @param {Array<Race>} [props.races=[]] sorted by start time earliest to latest
 * @returns {HTMLDivElement}
 */
function FlagsControl({races = []}) {
    const flags = races.map(race => {return { name: race.name + ' Warning', clock: new Clock(race.plannedStartTime), flagStateChangeTimings: [ {startTimeOffset: -600000, state: FlagState.RAISED}, {startTimeOffset: 0, state: FlagState.LOWERED} ] }});

    if (races.length > 0) {
        const firstRaceStart = races[0].plannedStartTime;
        const lastRaceStart = races[races.length -1].plannedStartTime;
        flags.splice(1, 0, {name: 'Blue Peter', clock: new Clock(firstRaceStart), flagStateChangeTimings: [{startTimeOffset: -300000, state: FlagState.RAISED}, {startTimeOffset: lastRaceStart.valueOf() - firstRaceStart.valueOf(), state: FlagState.LOWERED}] });
    }

    return (
        <div>
            {flags.map(flag => { return <FlagControl key={flag.name} name={flag.name} clock={flag.clock} flagStateChangeTimings={flag.flagStateChangeTimings} /> })}
        </div>
    );
}

export default FlagsControl;