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

import React from 'react';
import { useContext, useRef } from 'react';
import DinghyRacingModel from '../model/dinghy-racing-model';
import ModelContext from './ModelContext';
import RaceType from '../model/domain-classes/race-type';
import StartType from '../model/domain-classes/start-type';

function CreateRace({ onCreate }) {
    const model = useContext(ModelContext);
    const [race, setRace] = React.useState({...DinghyRacingModel.raceTemplate(), 'plannedStartTime': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * -1000).toISOString().substring(0, 16), 'duration': 2700000, 'plannedLaps': 5, type: RaceType.FLEET, startType: StartType.CSCCLUBSTART});
    const [result, setResult] = React.useState({'message': ''});
    const [dinghyClassMap, setDinghyClassMap] = React.useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = React.useState([]);
    const raceNameInputRef = useRef(null);

    const clear = React.useCallback(() => {
        setRace({...DinghyRacingModel.raceTemplate(), 'plannedStartTime': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * -1000).toISOString().substring(0, 16), 'duration': 2700000, 'plannedLaps': 5, type: RaceType.FLEET, startType: StartType.CSCCLUBSTART});
        showMessage('');
        raceNameInputRef.current.focus();
    }, []);

    React.useEffect(() => {
        model.getDinghyClasses().then(result => {
            if (result.success) {
                // build dinghy class options
                let options = [];
                let map = new Map();
                // set handicap options
                options.push(<option key="handicap" value={null}></option> );
                // set dinghy classes
                result.domainObject.forEach(dinghyClass => {
                    options.push(<option key={dinghyClass.name} value={dinghyClass.name}>{dinghyClass.name}</option>);
                    map.set(dinghyClass.name, dinghyClass);
                });
                setDinghyClassMap(map);
                setDinghyClassOptions(options);
            }
            else {
                showMessage('Unable to load dinghy classes\n' + result.message);
            }
        });

    }, [model]);

    React.useEffect(() => {
        if (result && result.success) {
            clear();
        }
        if (result && !result.success) {
            showMessage(result.message);
        }
    }, [result, clear]);

    async function handleCreate(event) {
        event.preventDefault();
        const domainRace = {...race, 'plannedStartTime': new Date(race.plannedStartTime)};
        setResult(await onCreate(domainRace));
    }

    function handleChange({target}) {
        if (target.name === 'dinghyClass') {
            if (target.value === '') {
                setRace({...race, 'dinghyClass': DinghyRacingModel.dinghyClassTemplate()});
            } else {
                setRace({...race, 'dinghyClass': dinghyClassMap.get(target.value)});
            }
        }
        else if (target.name === 'duration') {
            setRace({...race, [target.name]: target.value * 60000});
        }
        else if (target.name === 'plannedLaps') {
            setRace({...race, [target.name]: Number(target.value)});
        }
        else {
            setRace({...race, [target.name]: target.value});
        }
    }

    function showMessage(message) {
        const output = document.getElementById('race-message-output');
        output.value = message;
    }

    return (
        <form action="" method="post">
            <label htmlFor="race-name-input">Race Name</label>
            <input id="race-name-input" ref={raceNameInputRef} name="name" type="text" onChange={handleChange} value={race.name} autoFocus />
            <label htmlFor="race-time-input">Race Time</label>
            <input id="race-time-input" name="plannedStartTime" type="datetime-local" onChange={handleChange} value={race.plannedStartTime} />
            <label htmlFor="race-duration-input">Duration</label>
            <input id="race-duration-input" name="duration" type="number" onChange={handleChange} value={race.duration / 60000} />
            <label htmlFor="race-laps-input">Laps</label>
            <input id="race-laps-input" name="plannedLaps" type="number" min="1" onChange={handleChange} value={race.plannedLaps ? race.plannedLaps : ''} />
            <label htmlFor="race-class-select">Race Class</label>
            <select id="race-class-select" name="dinghyClass" multiple={false} onChange={handleChange} value={race.dinghyClass ? race.dinghyClass.name : ''} >{dinghyClassOptions}</select>
            <label htmlFor="race-type-select">Type</label>
            <select id="race-type-select" name="type" multiple={false} onChange={handleChange} value={race.type} >
                <option value="FLEET">Fleet</option>
                <option value="PURSUIT">Pursuit</option>
            </select>
            <label htmlFor="race-start-type-select">Start Type</label>
            <select id="race-start-type-select" name="startType" multiple={false} onChange={handleChange} value={race.startType} >
                <option value="CSCCLUBSTART">10-5-GO</option>
                <option value="RRS26">5-4-1-GO</option>
            </select>
            <output id="race-message-output" />
            <button id="race-create-button" type="button" onClick={handleCreate}>Create</button>
        </form>
    );
}

export default CreateRace;