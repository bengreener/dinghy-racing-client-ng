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

import React, { useEffect, useState } from 'react';
import Clock from '../model/domain-classes/clock';

/**
 * Provide a list, withing timings, of the actions that need to be completed to start the races
 * @param {Object} props
 * @param {Array<Action>} actions to display
 * @returns {HTMLDivElement}
 */
function ActionListView({ actions }) {
    const [clock] = useState(new Clock(Date.now()));
    const [time, setTime] = useState(new Date());

    function handleTick() {
        setTime(new Date());
    };

    useEffect(() => {
        clock.addTickHandler(handleTick);
        clock.start();
    }, [clock]);

    const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();
    let formatOptions = {
        timeZone: resolvedOptions.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const timeFormat = new Intl.DateTimeFormat(resolvedOptions.locale, formatOptions);

    const actionRows = actions.map(action => {
        const countdown = Math.max(action.time.valueOf() - time, 0);
        return (<tr key={action.time}>
            <td key='time'>
                {timeFormat.format(action.time)}
            </td>
            <td key='action'>
                {action.description}
            </td>
            <td key='countdown'>
                {Clock.formatDuration(countdown)}
            </td>
        </tr>)
    });

    return (
        <div className="action-list-view">
            <h1>Action List</h1>
            <div className="scrollable">
                <table>
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