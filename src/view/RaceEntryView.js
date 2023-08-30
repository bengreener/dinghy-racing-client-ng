import React from 'react';

function RaceEntryView({entry, addLap, removeLap}) {

    function handleClick(event) {
        if (event.ctrlKey) {
            if (removeLap) {
                removeLap(entry);
            }    
        }
        else {
            if (addLap) {
                addLap(entry);
            }
        }
    }

    return (
        <tr onClick={handleClick}>
            <td>{entry.dinghy.dinghyClass.name + ' ' + entry.dinghy.sailNumber + ' ' + entry.competitor.name}</td>
            {entry.laps.map(lap => <td key={lap.number} >{lap.time}</td>)}
        </tr>
    )
}

export default RaceEntryView;