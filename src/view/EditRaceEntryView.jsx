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
function EditEntryView({entry}) {
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

    // async function handleScoringAbbreviationSelection(event) {
    async function handleScoringAbbreviationSelection() {
        // if (setScoringAbbreviation) {
            setDisabled(true);
        //     const result = await setScoringAbbreviation(entry, event.target.value);
        //     if (!result) {
        //         setDisabled(false);
        //     }
        // }
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
                <output>{entry.laps.totalElements}</output>
            </div>
            <div className='w3-col m1 w3-padding-small w3-border'>
                <output>{Clock.formatDuration(entry.sumOfLapTimes)}</output>
            </div>
            <div className='w3-col m1 w3-padding-small w3-border'>
                <ScoringAbbreviation key={entry.scoringAbbreviation} value={entry.scoringAbbreviation} onChange={handleScoringAbbreviationSelection} />
            </div>
        </div>
    )
}

export default EditEntryView;