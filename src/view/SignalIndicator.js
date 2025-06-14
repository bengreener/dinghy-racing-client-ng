/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

import { useCallback, useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import Clock from '../model/domain-classes/clock';
import FlagState from '../model/domain-classes/flag-state';

/**
 * Display information about a signal, or signals where the same flags are used, in starting a race or session of races
 * @param {Object} props
 * @param {Array<Signal>} [props.signals]
 * @returns {HTMLDivElement}
 */
function SignalIndicator({ signals }) {
    const model = useContext(ModelContext);
    const [time, setTime] = useState(model.getClock().getTimeToSecondPrecision());

    const tickHandler = useCallback(() => {
        setTime(model.getClock().getTimeToSecondPrecision());
    }, [model]);

    //set tick handler
    useEffect(() => {
        model.getClock().addTickHandler(tickHandler);

        return(() => {
            model.getClock().removeTickHandler(tickHandler);
        })
    }, [model, tickHandler]);

    const flags = signals[0]?.visualSignal.flags;
    const lastSignal = signals.findLast(signal => signal.time <= time); // only works when there are no more than 2 signals
    const nextSignal = signals.find(signal => signal.time > time);
    const timeToChange = () => {
        if (lastSignal?.time.valueOf() === time.valueOf()) {
            return 0;
        }
        else if (nextSignal) {
            return nextSignal.time.valueOf() - time.valueOf();
        }
        else {
            return 0;
        }
    }

    return (
        <div className='signal-indicator w3-row'>
            <div className='w3-col s4 m3 w3-cell-row'>
                <label htmlFor={'flag-name-output'} className='w3-cell' >Flag</label>
                <output id='flag-name-output' className='w3-cell' >{flags.map(flag => flag.name).join(" ")}</output>
            </div>
            <div className='w3-col s4 m2 w3-cell-row'>
                <label htmlFor={'current-state-output'} className='w3-cell' >State</label>
                <output id='current-state-output' className='w3-cell' >{lastSignal?.visualSignal.flagsState === FlagState.RAISED ? 'Raised' : 'Lowered' }</output>
            </div>
            <div className='w3-col s4 m2 w3-cell-row'>
                <label htmlFor={'change-in-output'} className='w3-cell' >Change In</label>
                <output id='change-in-output' className='w3-cell' >{Clock.formatDuration(timeToChange(), false, true)}</output>
            </div>
        </div>
    )
}

export default SignalIndicator;