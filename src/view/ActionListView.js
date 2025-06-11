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

import React, { useCallback, useEffect, useState } from 'react';
import Clock from '../model/domain-classes/clock';
import FlagState from '../model/domain-classes/flag-state';

/**
 * Provide a list, withing timings, of the actions that need to be completed to start the races
 * @param {Object} props
 * @param {Array<Signals>} props.signals that determine the actions to be displayed
 * @param {Clock} props.clock clock to use to time actions
 * @returns {HTMLDivElement}
 */
function ActionListView({ signals, clock }) {
    const [timestamp, setTimestamp] = useState(clock.getTimeToSecondPrecision().valueOf()); // use Clock.now to get adjusted time when synched to an external clock

    const handleTick = useCallback(() => {
        setTimestamp(clock.getTimeToSecondPrecision().valueOf());
    }, [clock]);

    useEffect(() => {
        clock.addTickHandler(handleTick);

        return (() => {
            clock.removeTickHandler(handleTick);
        })
    }, [clock, handleTick]);

    const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();
    let formatOptions = {
        timeZone: resolvedOptions.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const timeFormat = new Intl.DateTimeFormat(resolvedOptions.locale, formatOptions);

    // create race start actions list
    const actionsDescriptionsMap = new Map();
    signals.sort((a, b) => a.time.valueOf() - b.time.valueOf());
    signals.forEach((signal) => {
        let description = signal.meaning;
        if (description) {
            description += '. ';
        }
        if (signal?.visualSignal?.flagsState === FlagState.RAISED) {
            description += 'Raise ' + signal.visualSignal.flags.map(flag => flag.name).join(' + ') + '.';
        }
        else if (signal?.visualSignal?.flagsState === FlagState.LOWERED) {
            description += 'Lower ' + signal.visualSignal.flags.map(flag => flag.name).join(' + ') + '.';
        }
        if (signal?.soundSignal) {
            if (description) {
                description += ' ';
            }
            description += 'Sound: ' + signal.soundSignal.description + '.';
        }
        if (actionsDescriptionsMap.has(signal.time.valueOf())) {
            const oldDescription = actionsDescriptionsMap.get(signal.time.valueOf());
            actionsDescriptionsMap.set(signal.time.valueOf(), oldDescription + '\n' + description);
        }
        else {
            actionsDescriptionsMap.set(signal.time.valueOf(), description);
        }
    });

    const actionRows = []
    actionsDescriptionsMap.forEach((actionDescription, timekey) => {
        if (timekey >= timestamp) {
            const countdown = Math.max(timekey - timestamp, 0);
            actionRows.push(<tr key={timekey}>
                <td key='time'>
                    {timeFormat.format(new Date(timekey))}
                </td>
                <td key='action'className='preserve-whitespace'>
                    {actionDescription}
                </td>
                <td key='countdown'>
                    {Clock.formatDuration(countdown, false, true)}
                </td>
            </tr>);
        }
    });

    return (
        <div className='action-list-view'>
            <h1>Action List</h1>
            <div className='scrollable'>
                <table className='w3-table w3-striped'>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Action</th>
                            <th>Countdown</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actionRows}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ActionListView;