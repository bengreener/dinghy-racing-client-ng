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
import RaceType from '../model/domain-classes/race-type';

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
    const prevSumOfLapTimes = useRef(entry.sumOfLapTimes);
    const lapsView = [];
    let classes = 'race-entry-view w3-row w3-border w3-hover-border-blue cursor-pointer preserve-whitespace';

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
                setDisabled(true);
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
        if (prevLapCount.current !== entry.laps.length || prevPosition.current !== entry.position || prevSumOfLapTimes.current !== entry.sumOfLapTimes) {
            setDisabled(false);
            prevLapCount.current = entry.laps.length;
            prevPosition.current = entry.position;
            prevSumOfLapTimes.current = entry.sumOfLapTimes;
        }
    }, [entry]);

    function handleClick(event) {
        if (!editMode && !disabled) {
            if (event.button === 0 && event.ctrlKey) {
                if (removeLap) {
                    setDisabled(true);
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
            // do not enter edit mode if there is no lap time to edit
            if (entry.laps.length > 0) {
                setEditMode(true);
            }
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
                // do not enter edit mode if there is no lap time to edit
                if (entry.laps.length > 0) {
                    setEditMode(true);
                }
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
            setDisabled(true);
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
        const subjectKey = event.dataTransfer.getData('text/html');
        const targetKey = entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name;
        if (onRaceEntryDrop && subjectKey !== targetKey) {
            if (entry.race.type === RaceType.PURSUIT) {
                setDisabled(true);
            }
            onRaceEntryDrop(event.dataTransfer.getData('text/html'), entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name);
        }
    }

    let cumulativeLapTimes = 0;
    if (entry.laps.length === 0) {
        // insert an 'empty' element to expand containing div and align scoring abbreviation to right
        lapsView.push(<div key=' ' className='w3-cell w3-left w3-padding-small'><output> </output></div>);
    }
    else {
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
    }    

    if (entry.scoringAbbreviation === 'DNS') {
        classes += 'did-not-start';
    }
    else if (entry.scoringAbbreviation === 'DSQ') {
        classes += ' disqualified';
    }
    else if (entry.scoringAbbreviation === 'OCS') {
        classes += ' on-course-side';
    }
    else if (entry.scoringAbbreviation === 'RET') {
        classes += ' retired';
    }
    else if (entry.scoringAbbreviation === 'DNC') {
        classes += ' did-not-compete';
    }
    else if (entry.scoringAbbreviation === 'DNF') {
        classes += ' did-not-finish';
    }
    else if (entry.onLastLap) {
        classes += ' on-last-lap';
    }
    else if (entry.finishedRace) {
        classes += ' finished-race';
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
            <div className='w3-col m2 w3-padding-small' >
                <output>{entry.dinghy.dinghyClass.name}</output>
            </div>
            <div className='w3-col m1 w3-padding-small' >
                <output className='sail-number'>{entry.dinghy.sailNumber}</output>
            </div>
            <div className='w3-col m2 w3-padding-small' >
                <output>{entry.helm.name}</output>
            </div>
            <div className='w3-col m1 w3-padding-small' >
                <output id={entry.dinghy.dinghyClass.name + '-' + entry.dinghy.sailNumber + '-' + entry.helm.name + '-position'}>{entry.position != null ? entry.position : ' '}</output>
            </div>
            <div className='w3-col m5 w3-hide-small'>
                <div className='w3-cell-row' >
                    {lapsView}
                </div>
            </div>
            <div className='w3-col m1 w3-padding-small'>
                <ScoringAbbreviation key={entry.scoringAbbreviation} value={entry.scoringAbbreviation} onChange={handleScoringAbbreviationSelection} />
            </div>
        </div>
    )
}

export default RaceEntryView;