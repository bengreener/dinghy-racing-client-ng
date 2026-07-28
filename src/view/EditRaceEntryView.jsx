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

import { useEffect, useState, useRef } from 'react';
import ScoringAbbreviation from './ScoringAbbreviation';
import Clock from '../model/clock';

/**
 * Display the details of a race entry
 * @param {Object} props
 * @param {SynchronousEntry} entry
 * @returns {HTMLTableRowElement}
 */
function EditRaceEntryView({entry}) {
    const [lapCount, setLapCount] = useState(() => entry.laps.totalElements);
    const [sailingTime, setSailingTime] = useState(() => Clock.formatDuration(entry.sumOfLapTimes));
    const [scoringAbbreviation, setScoringAbbreviation] = useState(() => entry.scoringAbbreviation);
    const [disabled, setDisabled] = useState(false);
    const prevVersion = useRef(entry.entry.metadata.version);
    const prevSignedUpVersion = useRef(entry.signedUp.metadata.version);
    let classes = 'edit-race-entry-view w3-row';

    // update record of version and if edit entry view is in a disabled state release it if update complete
    useEffect(() => {
        async function test() {
            return (prevVersion.current !== entry.entry.metadata.version || prevSignedUpVersion.current !== entry.signedUp.metadata.version);
        }
        
        if (disabled) {
            test().then(result => {
                if (result) {
                    setDisabled(false);
                }
            });
        }
        prevVersion.current = entry.entry.metadata.version;
        prevSignedUpVersion.current = entry.signedUp.metadata.version;
    }, [entry, disabled]);

    function handleLapCountChange({target}) {
        if (/\d*/.test(target.value)) {
            updateLapCount(target.value);
        }
    }

    /**
     * Update the lap count
     * @param {Integer} inputLaps
     */
    function updateLapCount(lapCount) {
        let newLapCount = lapCount;
        if (newLapCount < 0) {
            newLapCount = 0;
        }
        if (newLapCount <= entry.race.plannedLaps) {
            setLapCount(newLapCount);
        }        
    }

    function handleLapCountKeyUp(event) {
        if (event.key === 'ArrowUp') {
            updateLapCount(lapCount + 1);
        }
        else if (event.key === 'ArrowDown') {
            updateLapCount(lapCount - 1);
        }
    }

    function handleSailingTimeChange({target}) {
        if (target.value === '' || Clock.validateStringDuration(target.value)) {
            setSailingTime(target.value);
        }
    }

    async function handleScoringAbbreviationSelection({target}) {
        setScoringAbbreviation(target.value);
    }

    if (disabled) {
        if (classes === '') {
            classes = 'edit-race-entry-view w3-row disabled';
        }
        else {
            classes += ' disabled';
        }
    }

    return (
        <div className={classes} >
            <div className='w3-col m2 w3-padding-small bgis-cell w3-border' >
                <output>{entry.dinghy.dinghyClass.name}</output>
            </div>
            <div className='w3-col m1 w3-padding-small bgis-cell w3-right-align w3-border' >
                <output className='sail-number'>{entry.dinghy.sailNumber.slice(0, Math.max(0, entry.dinghy.sailNumber.length - 3))}<b>{entry.dinghy.sailNumber.slice(-3)}</b></output>
            </div>
            <div className='w3-col m2 w3-padding-small bgis-cell w3-border' >
                <output>{entry.helm.name}</output>
            </div>
            <div className='w3-col m1-half w3-padding-small w3-border' >
                <output id={entry.dinghy.dinghyClass.name + '-' + entry.dinghy.sailNumber + '-' + entry.helm.name + '-position'}>{entry.position != null ? entry.position : ' '}</output>
            </div>
            <div className='w3-col m1 w3-padding-small w3-border'>
                <input data-testid={`lap-count-input-${entry.dinghy.dinghyClass.name + '-' + entry.dinghy.sailNumber}`} className='w3-col w3-center' value={lapCount} onChange={handleLapCountChange} onKeyUp={handleLapCountKeyUp} />
            </div>
            <div className='w3-col m1 w3-padding-small w3-border'>
                <input data-testid={`sailing-time-input-${entry.dinghy.dinghyClass.name + '-' + entry.dinghy.sailNumber}`} className='w3-col w3-right-align' type='text' value={sailingTime} onChange={handleSailingTimeChange} />
            </div>
            <div className='w3-col m1 w3-padding-small w3-border'>
                <ScoringAbbreviation key={entry.scoringAbbreviation} value={scoringAbbreviation} onChange={handleScoringAbbreviationSelection} />
            </div>
            <div className='w3-col m1'>
                {lapCount != entry.laps.entities.length || sailingTime != Clock.formatDuration(entry.sumOfLapTimes) || scoringAbbreviation != entry.scoringAbbreviation ? <button className='w3-btn w3-col w3-border bgis-light-blue bgis-hover-dark-blue' type='button'>Update</button> : null}
            </div>
        </div>
    )
}

export default EditRaceEntryView;