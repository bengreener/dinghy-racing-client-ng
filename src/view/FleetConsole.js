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

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ModelContext from './ModelContext';
import DinghyRacingModel from '../model/dinghy-racing-model';
import ControllerContext from './ControllerContext';

/**
 * 
 * @returns 
 */
function FleetConsole() {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [fleet, setFleet] = useState(DinghyRacingModel.fleetTemplate());
    const [dinghyClassMap, setDinghyClassMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const fleetNameInputRef = useRef(null);

    const clear = useCallback(() => {
        setFleet(DinghyRacingModel.fleetTemplate());
        fleetNameInputRef.current.focus();
        setMessage('');
    }, []);

    useEffect(() => {
        let ignoreFetch = false;
        model.getDinghyClasses().then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load dinghy classes\n' + result.message);
            }
            else if (!ignoreFetch) {
                const map = new Map();
                result.domainObject.forEach(dinghyClass => {
                    map.set(dinghyClass.url, dinghyClass);
                });
                setDinghyClassMap(map);
            }
        });
        // cleanup before effect runs and before form close
        return () => {
            ignoreFetch = true;
            setMessage(''); // clear any previous message
        }
    }, [model]);

    async function createFleet(fleet) {
        const result = await controller.createFleet(fleet);
        if (result.success) {
            clear();
        }
        else {
            setMessage(result.message);
        }
    }

    function handleChange({ target }) {
        setFleet({...fleet, name: target.value});
    }

    function handleDinghyClassSelect(event) {
        const options = [...event.target.selectedOptions]; // convert from HTMLCollection to Array; trying to go direct to value results in event.target.selectedOptions.value is not iterable error
        const selectedDinghyClasses = options.map(option => dinghyClassMap.get(option.value));
        setFleet({...fleet, dinghyClasses: selectedDinghyClasses});
    }

    function handleCreateButtonClick(event) {
        event.preventDefault();
        createFleet(fleet);
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    return(
        <div>
            <h1>Fleets</h1>
            <form className='w3-container' action='' method='post'>
                <div className='w3-row'>
                    <label htmlFor='name-input' className='w3-col m2' >Fleet Name</label>
                    <input id='name-input' ref={fleetNameInputRef} name='name' className='w3-half' type='text' value={fleet.name} onChange={handleChange} autoFocus />
                </div>
                <div className='w3-row'>
                    <div className='w3-col m8' >
                        <button className='w3-right' type='button' onClick={handleCreateButtonClick} >Create</button>
                        <button className='w3-right' type='button' onClick={clear} >Cancel</button>
                    </div>
                </div>
            </form>
            <p className={userMessageClasses()}>{message}</p>
            <div>
                <label htmlFor='dinghy-class-select'>Select Dinghy Class</label>
                <select id='dinghy-class-select' multiple={true} onChange={handleDinghyClassSelect} value={fleet.dinghyClasses.map(dc => dc.url)} >
                    {Array.from(dinghyClassMap.values()).map((dinghyClass) => { return (<option key={dinghyClass.url} value={dinghyClass.url}>{dinghyClass.name}</option>)})}
                </select>
            </div>
        </div>
    );
}

export default FleetConsole;