import React from 'react';

function RaceEntryView({entry, addLap, removeLap, updateLap}) {
    let editMode = false;

    function handleClick(event) {
        if (!editMode) {
            if (event.button === 0 && event.ctrlKey) {
                if (removeLap) {
                    removeLap(entry);
                }    
            }
            else if (event.button === 0) {
                if (addLap) {
                    addLap(entry);
                }
            }
        }        
    }

    function handleAuxClick(event) {
        if (!editMode) {
            editMode  = true;
            // clear current contents of cell
            const value = event.target.parentElement.lastChild.innerText;
            event.target.parentElement.lastChild.replaceChildren();
            // add an input for amended value
            const input = document.createElement('INPUT');
            input.setAttribute('type', 'number');
            input.setAttribute('value', value);
            input.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    if (updateLap) {
                        updateLap(entry, Number(event.target.value));
                        editMode = false;
                    }
                }
            });
            event.target.parentElement.lastChild.appendChild(input);
        }
    }

    // disable context menu
    function handleContextMenu(event) {
        event.preventDefault();
    }

    return (
        <tr onClick={handleClick} onAuxClick={handleAuxClick} onContextMenu={handleContextMenu}>
            <td>{entry.dinghy.dinghyClass.name + ' ' + entry.dinghy.sailNumber + ' ' + entry.competitor.name}</td>
            {entry.laps.map(lap => <td key={lap.number} >{lap.time}</td>)}
        </tr>
    )
}

export default RaceEntryView;