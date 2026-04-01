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
import { useEffect, useRef, useState } from 'react';
import RaceType from '../model/race-type';
import StartType from '../model/start-type';

function CreateRace({ model, onCreate }) {
    const [raceInput, setRaceInput] = React.useState(() => {
        return {name: '', 'plannedStartTime': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * - 1000).toISOString().substring(0, 16), 'duration': 2700000, 'plannedLaps': 5, fleet: null, type: RaceType.FLEET, startType: StartType.CSCCLUBSTART}
    });
    const [fleetMap, setFleetMap] = React.useState(new Map());
    const [fleetOptions, setFleetOptions] = React.useState([]);
    const [message, setMessage] = useState('');
    const raceNameInputRef = useRef(null);

    const clear = React.useCallback(() => {
        setRaceInput({name: '', 'plannedStartTime': new Date(Date.now() + 60 * new Date().getTimezoneOffset() * - 1000).toISOString().substring(0, 16), 'duration': 2700000, 'plannedLaps': 5, fleet: null, type: RaceType.FLEET, startType: StartType.CSCCLUBSTART});
        setMessage('');
        raceNameInputRef.current.focus();
    }, []);

    useEffect(() => {
        let cancel = false;
        if (!cancel) {
            model.getFleets().then(result => {
                // build fleet options
                let options = [];
                let map = new Map();
                // set a blank option for default and to clear input fields
                options.push(<option key='blank' value={null}></option> );
                // set fleets
                result.entities.forEach(fleet => {
                    options.push(<option key={fleet.name} value={fleet.name}>{fleet.name}</option>);
                    map.set(fleet.name, fleet);
                });
                setFleetMap(map);
                setFleetOptions(options);
            }).catch((error) => {
                setMessage('Unable to load fleets\n' + error.message);
            });
        }
        
        return () => {
            cancel = true;
        }
    }, [model]);
    
    async function handleCreate(event) {
        event.preventDefault();
        if (onCreate) {
            try {
                await onCreate(raceInput.name, new Date(raceInput.plannedStartTime), raceInput.fleet, raceInput.duration, raceInput.plannedLaps, raceInput.type, raceInput.startType);
                clear();
            }
            catch (error) {
                setMessage(error.message);
            }
        }
    }

    function handleChange({target}) {
        if (target.name === 'fleet') {
            if (target.value === '') {
                setRaceInput({...raceInput, 'fleet': null});
            } else {
                setRaceInput({...raceInput, 'fleet': fleetMap.get(target.value)});
            }
        }
        else if (target.name === 'duration') {
            setRaceInput({...raceInput, [target.name]: target.value * 60000});
        }
        else if (target.name === 'plannedLaps') {
            setRaceInput({...raceInput, [target.name]: Number(target.value)});
        }
        else {
            setRaceInput({...raceInput, [target.name]: target.value});
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
                    <input id='race-name-input' ref={raceNameInputRef} name='name' className='w3-half' type='text' onChange={handleChange} value={raceInput.name} autoFocus />
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-time-input' className='w3-col m2' >Start Time</label>
                    <input id='race-time-input' name='plannedStartTime' className='w3-half' type='datetime-local' onChange={handleChange} value={raceInput.plannedStartTime} />
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-duration-input' className='w3-col m2' >Duration</label>
                    <input id='race-duration-input' name='duration' className='w3-half' type='number' onChange={handleChange} value={raceInput.duration / 60000} />
                    </div>
                <div className='w3-row'>
                    <label htmlFor='race-laps-input' className='w3-col m2' >Laps</label>
                    <input id='race-laps-input' name='plannedLaps' className='w3-half' type='number' min='1' onChange={handleChange} value={raceInput.plannedLaps ? raceInput.plannedLaps : ''} />
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-fleet-select' className='w3-col m2' >Fleet</label>
                    <select id='race-fleet-select' name='fleet' className='w3-half' multiple={false} onChange={handleChange} value={raceInput.fleet ? raceInput.fleet.name : ''} >{fleetOptions}</select>
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-type-select' className='w3-col m2' >Type</label>
                    <select id='race-type-select' name='type' className='w3-half' multiple={false} onChange={handleChange} value={raceInput.type} >
                        <option value='FLEET'>Fleet</option>
                        <option value='PURSUIT'>Pursuit</option>
                    </select>
                </div>
                <div className='w3-row'>
                    <label htmlFor='race-start-type-select' className='w3-col m2' >Start Sequence</label>
                    <select id='race-start-type-select' name='startType' className='w3-half' multiple={false} onChange={handleChange} value={raceInput.startType} >
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