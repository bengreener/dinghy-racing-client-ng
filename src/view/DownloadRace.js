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
        <form className='download-race w3-container w3-padding w3-border w3-margin' action='' method='get'>
            <div className='w3-row'>
                <label className='w3-col m3' >{race.name}</label>
                <label className='w3-col m2' >{race.dinghyClass ? race.dinghyClass.name : ''}</label>
                <output id={'race-start-' + race.name.replace(/ /g, '-').toLowerCase()}>
                    {new Intl.DateTimeFormat(navigator.language, {dateStyle: 'medium', timeStyle: 'medium', hour12: false}).format(race.plannedStartTime)}
                </output>
            </div>
            <div className='w3-row'>
                <fieldset className='w3-half' >
                    <legend>Choose Name Format</legend>
                    <div className='w3-cell-row'>
                        {/** name of radio buttons in a group needs to be unique among all radio button groups on page; for example multiple DownloadRace componenent */}
                        <div className='w3-cell'>
                            <input id={race.name + '-' + race.plannedStartTime.toISOString() + '-firstname-surname'} name={race.name + '-' + race.plannedStartTime.toISOString() + '-name-format'} type="radio" value={NameFormat.FIRSTNAMESURNAME} checked={selectedNameFormat === NameFormat.FIRSTNAMESURNAME} onChange={handleOptionChange} />
                            <label htmlFor={race.name + '-' + race.plannedStartTime.toISOString() + '-firstname-surname'}>Firstname Surname</label>
                        </div>
                        <div className='w3-cell'>
                            <input id={race.name + '-' + race.plannedStartTime.toISOString() + '-surname-firstname'} name={race.name + '-' + race.plannedStartTime.toISOString() + '-name-format'} type="radio" value={NameFormat.SURNAMEFIRSTNAME} checked={selectedNameFormat === NameFormat.SURNAMEFIRSTNAME} onChange={handleOptionChange} />
                            <label htmlFor={race.name + '-' + race.plannedStartTime.toISOString() + '-surname-firstname'}>Surname, Firstname</label>
                        </div>
                    </div>
                </fieldset>
            </div>
            <div className='w3-row' >
                <div className='w3-half' >
                    <button id='race-result-download-button' className='w3-right' type='button' onClick={handleDownloadButtonClick} >Download Results</button>
                </div>
            </div>
        </form>
    );
}

export default DownloadRace;

/**
 * Action to take when AdjustCourseForm update laps button clicked
 * @callback DownloadRace~downloadFunction
 * @param {Race} race to download
 * @param {DownloadOptions} options to configure download file
 */