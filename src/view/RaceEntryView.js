import React from 'react';

function RaceEntryView({entry}) {
    return (
        <tr>
            <td>{entry.dinghy.dinghyClass.name + ' ' + entry.dinghy.sailNumber + ' ' + entry.competitor.name}</td>
        </tr>
    )
}

export default RaceEntryView;