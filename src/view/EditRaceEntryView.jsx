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
function EditRaceEntryView({entry, onSetLapTotal, onSetScoringAbbreviation, showUserMessage}) {
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
        checkLapsTotalAndScoringAbbreviation(entry, newLapCount, sailingTime, scoringAbbreviation);
    }

    function handleLapCountKeyUp(event) {
        const oldLapCount = lapCount ? Number.parseInt(lapCount) : 0;
        if (event.key === 'ArrowUp') {
            updateLapCount(oldLapCount + 1);
        }
        else if (event.key === 'ArrowDown') {
            updateLapCount(oldLapCount - 1);
        }
    }

    function handleSailingTimeChange({target}) {
        if (target.value === '' || Clock.validateStringDuration(target.value)) {
            setSailingTime(target.value);
        }
        checkLapsTotalAndScoringAbbreviation(entry, lapCount, target.value, scoringAbbreviation);
    }

    async function handleUpdateClick() {
        if (!disabled) {
            let result;
            try {
                if (onSetScoringAbbreviation && scoringAbbreviation != entry.scoringAbbreviation) {
                    setDisabled(true);
                    result = await onSetScoringAbbreviation(entry.entry, scoringAbbreviation);
                }
                else if (onSetLapTotal && (Number.parseInt(lapCount) != entry.laps.entities.length || sailingTime != Clock.formatDuration(entry.sumOfLapTimes))) {
                    setDisabled(true);
                    result = await onSetLapTotal(entry.entry, Number.parseInt(lapCount), sailingTime);
                }
                if (!result) {
                    setDisabled(false);
                }
            }
            catch(error) {
                setDisabled(false);
                if (showUserMessage) {
                    showUserMessage(error.message);
                }
            }
        }
    }

    function handleCancelClick() {
        setLapCount(entry.laps.totalElements);
        setSailingTime(Clock.formatDuration(entry.sumOfLapTimes));
        setScoringAbbreviation(entry.scoringAbbreviation);
        showUserMessage('');
    }

    async function handleScoringAbbreviationSelection({target}) {
        setScoringAbbreviation(target.value);
        checkLapsTotalAndScoringAbbreviation(entry, lapCount, sailingTime, target.value);
    }

    function checkLapsTotalAndScoringAbbreviation(entry, lapCount, sailingTime, scoringAbbreviation) {
        if (showUserMessage) {
            if ((lapCount != entry.laps.entities.length || sailingTime != Clock.formatDuration(entry.sumOfLapTimes)) && scoringAbbreviation != entry.scoringAbbreviation) {
                showUserMessage('Updating an entry with a change to scoring abbreviation will ignore changes to laps and time sailed.')
            }
            else {
                showUserMessage('');
            }
        }
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
        <div data-testid={entry.dinghy.dinghyClass.name + entry.dinghy.sailNumber + entry.helm.name} className={classes} >
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
            <div className='w3-col m2'>
                {
                    lapCount != entry.laps.entities.length || sailingTime != Clock.formatDuration(entry.sumOfLapTimes) || scoringAbbreviation != entry.scoringAbbreviation ? 
                    <>
                        <button className='w3-btn w3-col m6 w3-border w3-light-green w3-hover-green' type='button' onClick={handleUpdateClick} >Update</button>
                        <button className='w3-btn w3-col m6 w3-border bgis-pale-amber w3-hover-amber' type='button' onClick={handleCancelClick} >Cancel</button>
                    </>
                     : null
                }
            </div>
        </div>
    )
}

export default EditRaceEntryView;