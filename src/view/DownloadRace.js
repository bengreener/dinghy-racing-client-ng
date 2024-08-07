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

import { useState } from 'react';
import NameFormat from '../controller/name-format';

/**
 * Provide an interface to support downloading race results
 * @param {Object} props
 * @param {Race} props.race
 * @param {DownloadRace~downloadFunction} props.downloadFunction
 * @returns 
 */
function DownloadRace({ race, downloadFunction }) {
    const [selectedNameFormat, setSelectedNameFormat] = useState(NameFormat.FIRSTNAMESURNAME);

    function handleOptionChange({ target }) {
        setSelectedNameFormat(target.value);
    }

    function handleDownloadButtonClick() {
        if (downloadFunction) {
            downloadFunction(race, {nameFormat: selectedNameFormat});
        }
    }

    return (
        <div>
            <label>{race.name}</label>
            <label>{race.dinghyClass ? race.dinghyClass.name : ''}</label>
            <output id={'race-start-' + race.name.replace(/ /g, '-').toLowerCase()}>
                {new Intl.DateTimeFormat(navigator.language, {dateStyle: 'medium', timeStyle: 'medium', hour12: false}).format(race.plannedStartTime)}
            </output>
            <fieldset>
                <legend>Choose Name Format</legend>
                {/** name of radio buttons in a group needs to be unique among all radio button groups on page; for example multiple DownloadRace componenent */}
                <input id={race.name + '-' + race.plannedStartTime.toISOString() + '-firstname-surname'} name={race.name + '-' + race.plannedStartTime.toISOString() + '-name-format'} type="radio" value={NameFormat.FIRSTNAMESURNAME} checked={selectedNameFormat === NameFormat.FIRSTNAMESURNAME} onChange={handleOptionChange} />
                <label htmlFor={race.name + '-' + race.plannedStartTime.toISOString() + '-firstname-surname'}>Firstname Surname</label>
                <input id={race.name + '-' + race.plannedStartTime.toISOString() + '-surname-firstname'} name={race.name + '-' + race.plannedStartTime.toISOString() + '-name-format'} type="radio" value={NameFormat.SURNAMEFIRSTNAME} checked={selectedNameFormat === NameFormat.SURNAMEFIRSTNAME} onChange={handleOptionChange} />
                <label htmlFor={race.name + '-' + race.plannedStartTime.toISOString() + '-surname-firstname'}>Surname, Firstname</label>
            </fieldset>
            <button id="race-result-download-button" onClick={handleDownloadButtonClick} >Download Results</button>
        </div>
    );
}

export default DownloadRace;

/**
 * Action to take when AdjustCourseForm update laps button clicked
 * @callback DownloadRace~downloadFunction
 * @param {Race} race to download
 * @param {DownloadOptions} options to configure download file
 */