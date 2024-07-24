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
import { PositionConstant } from './RaceEntriesView';

/**
 * Display the details of a race entry
 * @param {Object} props
 * @param {Function} props.addLap
 * @param {function} props.removeLap
 * @param {function} props.updateLap
 * @param {function} props.setScoringAbbreviation
 * @param {function} props.updatePosition
 * @returns {HTMLTableRowElement}
 */
function RaceEntryView({entry, addLap, removeLap, updateLap, setScoringAbbreviation, updatePosition}) {
    const [editMode, setEditMode] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const prevLapCount = useRef(entry.laps.length);
    const prevPosition = useRef(entry.position);
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

    function handlePositionUpClick(event) {
        event.stopPropagation();
        event.preventDefault();
        if (updatePosition) {
            setDisabled(true);
            if (entry.position == null ) {
                updatePosition(entry, PositionConstant.MOVEUPONE);    
            }
            else {
                updatePosition(entry, entry.position - 1);
            }
        }
    }

    function handlePositionDownClick(event) {
        event.stopPropagation();
        event.preventDefault();
        if (updatePosition) {
            setDisabled(true);
            if (entry.position == null ) {
                updatePosition(entry, PositionConstant.MOVEDOWNONE);    
            }
            else {
                updatePosition(entry, entry.position + 1);
            }
        }
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
        classes = 'race-entry-view did-not-start';
    }
    else if (entry.scoringAbbreviation === 'DSQ') {
        classes = 'race-entry-view disqualified';
    }
    else if (entry.scoringAbbreviation === 'RET') {
        classes = 'race-entry-view retired';
    }
    else if (entry.onLastLap) {
        classes = 'race-entry-view on-last-lap';
    }
    else if (entry.finishedRace) {
        classes = 'race-entry-view finished-race';
    }
    if (disabled) {
        if (classes === '') {
            classes = 'disabled';
        }
        else {
            classes += ' disabled';
        }
    }

    return (
        <tr className={classes} onClick={handleClick} onAuxClick={handleAuxClick} onContextMenu={handleContextMenu}
            onPointerDown={gestureStart} onPointerMove={gestureMove} onPointerUp={gestureEnd} onPointerOut={gestureEnd}
            onPointerLeave={gestureEnd} onPointerCancel={gestureCancel} >
            <th scope='row'>{entry.dinghy.dinghyClass.name}</th>
            <th className='sail-number' scope='row'>{entry.dinghy.sailNumber}</th>
            <th scope='row'>{entry.helm.name}</th>
            <th scope='row'>{entry.position}</th>
            {lapsView}
            <ScoringAbbreviation key={entry.scoringAbbreviation} value={entry.scoringAbbreviation} onChange={handleScoringAbbreviationSelection} />
            <td><button type="button" onClick={handlePositionUpClick}>Position Up</button></td>
            <td><button type="button" onClick={handlePositionDownClick}>Position Down</button></td>
        </tr>
    )
}

export default RaceEntryView;