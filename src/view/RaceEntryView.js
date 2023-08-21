import React, { useState } from 'react';

function RaceEntryView({entry, onClick}) {
    const [laps, setLaps] = useState([]);

    function handleClick(event) {
        if (onClick) {
            onClick(entry);
            // onClick is expected to update the entries laps information
            setLaps([...entry.laps]);
        }
    }

    return (
        <tr onClick={handleClick}>
            <td>{entry.dinghy.dinghyClass.name + ' ' + entry.dinghy.sailNumber + ' ' + entry.competitor.name}</td>
            {laps.map(lap => <td key={lap.number} >{lap.time}</td>)}
        </tr>
    )
}

export default RaceEntryView;