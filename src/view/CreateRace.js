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
import { useContext, useRef, useState } from 'react';
import DinghyRacingModel from '../model/dinghy-racing-model';
import ModelContext from './ModelContext';
import RaceType from '../model/domain-classes/race-type';
import StartType from '../model/domain-classes/start-type';

function CreateRace({ onCreate }) {
    const model = useContext(ModelContext);
    const [race, setRace] = React.useState({...DinghyRacingModel.raceTemplate(), 'plannedStartTime': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * -1000).toISOString().substring(0, 16), 'duration': 2700000, 'plannedLaps': 5, type: RaceType.FLEET, startType: StartType.CSCCLUBSTART});
    const [result, setResult] = React.useState({'message': ''});
    const [fleetMap, setFleetMap] = React.useState(new Map());
    const [fleetOptions, setFleetOptions] = React.useState([]);
    const [message, setMessage] = useState('');
    const raceNameInputRef = useRef(null);

    const clear = React.useCallback(() => {
        setRace({...DinghyRacingModel.raceTemplate(), 'plannedStartTime': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * -1000).toISOString().substring(0, 16), 'duration': 2700000, 'plannedLaps': 5, type: RaceType.FLEET, startType: StartType.CSCCLUBSTART});
        setMessage('');
        raceNameInputRef.current.focus();
    }, []);

    React.useEffect(() => {
        model.getFleets().then(result => {
            if (result.success) {
                // build fleet options
                let options = [];
                let map = new Map();
                // set a blank option for default and to clear input fields
			    options.push(<option key='blank' value={null}></option> );
                // set fleets
                result.domainObject.forEach(fleet => {
                    options.push(<option key={fleet.name} value={fleet.name}>{fleet.name}</option>);
                    map.set(fleet.name, fleet);
                });
                setFleetMap(map);
                setFleetOptions(options);
            }
            else {
                setMessage('Unable to load fleets\n' + result.message);
            }
        });
    }, [model]);

    React.useEffect(() => {
        if (result && result.success) {
            clear();
        }
        if (result && !result.success) {
            setMessage(result.message);
        }
    }, [result, clear]);

    async function handleCreate(event) {
        event.preventDefault();
        const newRace = {...race, 'plannedStartTime': new Date(race.plannedStartTime)};
        setResult(await onCreate(newRace));
    }

    function handleChange({target}) {
        if (target.name === 'fleet') {
            if (target.value === '') {
                setRace({...race, 'fleet': DinghyRacingModel.fleetTemplate()});
            } else {
                setRace({...race, 'fleet': fleetMap.get(target.value)});
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

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    return (
        <div className='w3-container console' >
            <h1>Create Race</h1>
            <form className='w3-container' action='' method='post'>
                <div className='w3-row'>
                    <label htmlFor='race-name-input' className='w3-col m2' >Race Name</label>
                    <input id='race-name-input' ref={raceNameInputRef} name='name' className='w3-half' type='text' onChange={handleChange} value={race.name} autoFocus />
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-time-input' className='w3-col m2' >Start Time</label>
                    <input id='race-time-input' name='plannedStartTime' className='w3-half' type='datetime-local' onChange={handleChange} value={race.plannedStartTime} />
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-duration-input' className='w3-col m2' >Duration</label>
                    <input id='race-duration-input' name='duration' className='w3-half' type='number' onChange={handleChange} value={race.duration / 60000} />
                    </div>
                <div className='w3-row'>
                    <label htmlFor='race-laps-input' className='w3-col m2' >Laps</label>
                    <input id='race-laps-input' name='plannedLaps' className='w3-half' type='number' min='1' onChange={handleChange} value={race.plannedLaps ? race.plannedLaps : ''} />
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-fleet-select' className='w3-col m2' >Fleet</label>
                    <select id='race-fleet-select' name='fleet' className='w3-half' multiple={false} onChange={handleChange} value={race.fleet ? race.fleet.name : ''} >{fleetOptions}</select>
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-type-select' className='w3-col m2' >Type</label>
                    <select id='race-type-select' name='type' className='w3-half' multiple={false} onChange={handleChange} value={race.type} >
                        <option value='FLEET'>Fleet</option>
                        <option value='PURSUIT'>Pursuit</option>
                    </select>
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-start-type-select' className='w3-col m2' >Start Sequence</label>
                    <select id='race-start-type-select' name='startType' className='w3-half' multiple={false} onChange={handleChange} value={race.startType} >
                        <option value='CSCCLUBSTART'>10-5-GO</option>
                        <option value='RRS26'>5-4-1-GO</option>
                    </select>
                </div>
                <div className='w3-row'>
                    <div className='w3-col m8' >
                        <button id='race-create-button' className='w3-right' type='button' onClick={handleCreate}>Create</button>
                    </div>
                </div>
            </form>
            <p className={userMessageClasses()}>{message}</p>
        </div>
    );
}

export default CreateRace;