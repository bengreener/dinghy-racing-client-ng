import React from 'react';
import Clock from '../model/domain-classes/clock';

/**
 * Provide a list, withing timings, of the actions that need to be completed to start the races
 * @param {Object} props
 * @param {Array<Action>} actions to display
 * @returns {HTMLDivElement}
 */
function ActionListView({ actions }) {

    let formatOptions = {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const timeFormat = new Intl.DateTimeFormat('en-GB', formatOptions);

    const actionRows = actions.map(action =>
        <tr key={action.time}>
            <td key='time'>
                {timeFormat.format(action.time)}
            </td>
            <td key='action'>
                {action.description}
            </td>
            <td key='countdown'>
                {Clock.formatDuration(Math.abs(Date.now() - action.time.valueOf()))}
            </td>
        </tr>
    );

    return (
        <div>
            <h1>Action List</h1>
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
    )
}

export default ActionListView;