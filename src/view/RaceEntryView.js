import React, { useCallback, useState } from 'react';
import LapView from './LapView';

function RaceEntryView({entry, addLap, removeLap, updateLap}) {
    const [editMode, setEditMode] = useState(false);

    const handleLastLapCellKeyUp = useCallback((event) => {
        if (event.key === 'Enter') {
            if (updateLap) {
                updateLap(entry, Number(event.target.value));
                setEditMode(false);
            }
        }
    }, [entry, updateLap]);

    const handleLastLapCellFocusOut = useCallback((event) => {
        setEditMode(false);
    }, []);

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
            setEditMode(true);
        }
    }

    // disable context menu
    function handleContextMenu(event) {
        event.preventDefault();
    }

    const lapsView = [];

    for (let i = 0; i < entry.laps.length; i++) {
        const lap = entry.laps[i];
        let lapView;
        if (i === (entry.laps.length - 1)) {
            if (editMode) {
                lapView = <LapView key={lap.number} value={lap.time} editable={true} keyup={handleLastLapCellKeyUp} focusout={handleLastLapCellFocusOut} />    
            }
            else {
                lapView = <LapView key={lap.number} value={lap.time} editable={false} />
            }
        }
        else {
            lapView = <LapView key={lap.number} value={lap.time} editable={false} />
        }
        lapsView.push(lapView);
    }

    return (
        <tr className="race-entry-view" onClick={handleClick} onAuxClick={handleAuxClick} onContextMenu={handleContextMenu}>
            <td>{entry.dinghy.dinghyClass.name + ' ' + entry.dinghy.sailNumber + ' ' + entry.competitor.name}</td>
            {lapsView}
        </tr>
    )
}

export default RaceEntryView;