import React, { useCallback, useState } from 'react';
import LapView from './LapView';

function RaceEntryView({entry, addLap, removeLap, updateLap}) {
    const [editMode, setEditMode] = useState(false);
    const lapsView = [];
    let classes = 'race-entry-view';

    // gesture tracking variables
    let start = {};
	let end = {};
	let tracking = false;
    let touchTimeoutId = null;
	const thresholdTime = 500;
	const thresholdDistance = 10;
    const longTouchTimeout = 500;
    const handleLastLapCellKeyUp = useCallback((event) => {
        if (event.key === 'Enter') {
            if (updateLap) {
                updateLap(entry, Number(event.target.value));
                setEditMode(false);
            }
        }
        if (event.key === 'Escape') {
            setEditMode(false);
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
                if (!entry.finishedRace && addLap) {
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

    function gestureStart(event) {
        tracking = true;
        /* could use e.timeStamp but apparently it's 'whack' in Fx/Android */
        start.t = new Date().getTime();
        start.x = event.clientX;
        start.y = event.clientY;
        touchTimeoutId = setTimeout(() => {
            if (!editMode) {
                setEditMode(true);
                tracking = false;
            }
        }, longTouchTimeout);
	};

	function gestureMove(event) {
		if (tracking) {
			event.preventDefault();
            if (touchTimeoutId) {
                clearTimeout(touchTimeoutId);
                touchTimeoutId = null;
            }
            end.x = event.clientX;
			end.y = event.clientY;
		}
	}

	function gestureEnd(event) {
        if (tracking) {
            if (touchTimeoutId) {
                clearTimeout(touchTimeoutId);
                touchTimeoutId = null;
            }
            tracking = false;
            var now = new Date().getTime();
            var deltaTime = now - start.t;
            var deltaX = end.x - start.x;
            var deltaY = end.y - start.y;
            /* work out what the movement was */
            if (deltaTime > thresholdTime) {
                /* gesture too slow */
                return;
            } else {
                if ((deltaX > thresholdDistance)&&(Math.abs(deltaY) < thresholdDistance)) {
                    // o.innerHTML = 'swipe right';
                } else if ((-deltaX > thresholdDistance)&&(Math.abs(deltaY) < thresholdDistance)) {
                    removeLap(entry);
                } else if ((deltaY > thresholdDistance)&&(Math.abs(deltaX) < thresholdDistance)) {
                    // o.innerHTML = 'swipe down';
                } else if ((-deltaY > thresholdDistance)&&(Math.abs(deltaX) < thresholdDistance)) {
                    // o.innerHTML = 'swipe up';
                }
            }
        }
	}

    function gestureCancel(event) {
        if (touchTimeoutId) {
            clearTimeout(touchTimeoutId);
            touchTimeoutId = null;
        }
        tracking = false;
    }

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

    if (entry.finishedRace) {
        classes = 'race-entry-view finished-race';
    }
    else if (entry.onLastLap) {
        classes = 'race-entry-view on-last-lap';
    }

    return (
        <tr className={classes} onClick={handleClick} onAuxClick={handleAuxClick} onContextMenu={handleContextMenu}
            onPointerDown={gestureStart} onPointerMove={gestureMove} onPointerUp={gestureEnd} onPointerOut={gestureEnd}
            onPointerLeave={gestureEnd} onPointerCancel={gestureCancel} >
            <th scope='row'>{entry.dinghy.dinghyClass.name + ' ' + entry.dinghy.sailNumber + ' ' + entry.helm.name}</th>
            {lapsView}
            <LapView key='sumOfLapTimes' value={entry.sumOfLapTimes} total={true} editable={false} />
        </tr>
    )
}

export default RaceEntryView;