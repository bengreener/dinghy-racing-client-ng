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

import React, { useCallback, useEffect, useState, useRef } from 'react';
import LapView from './LapView';
import ScoringAbbreviation from './ScoringAbbreviation';

/**
 * Display the details of a race entry
 * @param {Object} props
 * @param {Function} props.addLap
 * @param {function} props.removeLap
 * @param {function} props.updateLap
 * @param {function} props.setScoringAbbreviation
 * @param {function} props.onRaceEntryDrop
 * @returns {HTMLTableRowElement}
 */
function RaceEntryView({entry, addLap, removeLap, updateLap, setScoringAbbreviation, onRaceEntryDrop}) {
    const [editMode, setEditMode] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const prevLapCount = useRef(entry.laps.length);
    const prevPosition = useRef(entry.position);
    const lapsView = [];
    let classes = 'race-entry-view w3-row';

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
                updateLap(entry, event.target.value);
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

    useEffect(() => {
        if (prevLapCount.current !== entry.laps.length || prevPosition !== entry.position) {
            setDisabled(false);
            prevLapCount.current = entry.laps.length;
        }
    }, [entry]);

    function handleClick(event) {
        if (!editMode && !disabled) {
            if (event.button === 0 && event.ctrlKey) {
                if (removeLap) {
                    removeLap(entry);
                }    
            }
            else if (event.button === 0) {
                if (!entry.finishedRace && !entry.scoringAbbreviation && entry.race.plannedStartTime < new Date()  && addLap) {
                    setDisabled(true);
                    addLap(entry);
                }
            }
        }        
    }

    function handleAuxClick(event) {
        if (!editMode && !disabled) {
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
            if (!editMode && !disabled) {
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

    function handleScoringAbbreviationSelection(event) {
        if (setScoringAbbreviation) {
            setScoringAbbreviation(entry, event.target.value);
        }
    }

    function dragStartHandler(event) {
        event.dataTransfer.setData('text/html', entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name);
        event.dataTransfer.dropEffect = 'move';
    }

    function dragOverHandler(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function dropHandler(event) {
        event.preventDefault();
        if (onRaceEntryDrop) {
            onRaceEntryDrop(event.dataTransfer.getData('text/html'), entry.position);
        }
    }

    let cumulativeLapTimes = 0;
    for (let i = 0; i < entry.laps.length; i++) {
        const lap = entry.laps[i];
        cumulativeLapTimes += lap.time;
        let lapView;
        if (i === (entry.laps.length - 1)) {
            if (editMode) {
                lapView = <LapView key={lap.number} value={cumulativeLapTimes} editable={true} keyup={handleLastLapCellKeyUp} focusout={handleLastLapCellFocusOut} />
            }
            else {
                lapView = <LapView key={lap.number} value={cumulativeLapTimes} editable={false} />
            }
        }
        else {
            lapView = <LapView key={lap.number} value={cumulativeLapTimes} editable={false} />
        }
        lapsView.push(lapView);
    }

    if (entry.scoringAbbreviation === 'DNS') {
        classes = 'race-entry-view w3-row did-not-start';
    }
    else if (entry.scoringAbbreviation === 'DSQ') {
        classes = 'race-entry-view w3-row disqualified';
    }
    else if (entry.scoringAbbreviation === 'RET') {
        classes = 'race-entry-view w3-row retired';
    }
    else if (entry.onLastLap) {
        classes = 'race-entry-view w3-row on-last-lap';
    }
    else if (entry.finishedRace) {
        classes = 'race-entry-view w3-row finished-race';
    }
    if (disabled) {
        if (classes === '') {
            classes = 'race-entry-view w3-row disabled';
        }
        else {
            classes += ' disabled';
        }
    }

    return (
        <div className={classes} onClick={handleClick} onAuxClick={handleAuxClick} onContextMenu={handleContextMenu}
            onPointerDown={gestureStart} onPointerMove={gestureMove} onPointerUp={gestureEnd} onPointerOut={gestureEnd}
            onPointerLeave={gestureEnd} onPointerCancel={gestureCancel} onDragStart={dragStartHandler} onDragOver={dragOverHandler} onDrop={dropHandler} draggable >
            <div className='w3-col m2' >
                <output>{entry.dinghy.dinghyClass.name}</output>
            </div>
            <div className='w3-col m1' >
                <output className='sail-number'>{entry.dinghy.sailNumber}</output>
            </div>
            <div className='w3-col m2' >
                <output>{entry.helm.name}</output>
            </div>
            <div className='w3-col m1' >
                <output id={entry.dinghy.dinghyClass.name + '-' + entry.dinghy.sailNumber + '-' + entry.helm.name + '-position'}>{entry.position}</output>
            </div>
            <div className='w3-col m5 w3-hide-small'>
                <div className='w3-cell-row'>
                    {lapsView}
                </div>
            </div>
            <div className='w3-col m1'>
                <ScoringAbbreviation key={entry.scoringAbbreviation} value={entry.scoringAbbreviation} onChange={handleScoringAbbreviationSelection} />
            </div>
        </div>
    )
}

export default RaceEntryView;