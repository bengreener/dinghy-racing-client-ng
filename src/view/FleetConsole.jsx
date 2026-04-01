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

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 
 * @returns 
 */
function FleetConsole({ model, controller }) {
    const [fleetInput, setFleetInput] = useState({name: '', dinghyClasses: []});
    const [selectedFleet, setSelectedFleet] = useState();
    const [fleetMap, setFleetMap] = useState(new Map());
    const [dinghyClassMap, setDinghyClassMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const fleetNameInputRef = useRef(null);
    const [updatingFleet, setUpdatingFleet] = useState(false);
    const [fleetUpdateRequestAt, setFleetUpdateRequestAt] = useState();

    const handleFleetUpdate = useCallback(() => {
        setFleetUpdateRequestAt(Date.now());
    }, []);

    const clear = useCallback(() => {
        setFleetInput({name: '', dinghyClasses: []});
        setUpdatingFleet(false);
        fleetNameInputRef.current.focus();
        setMessage('');
    }, []);

    // register on creation callback for fleets
    useEffect(() => {
        model.registerFleetCreationCallback(handleFleetUpdate);
        // cleanup before effect runs and before form close
        return () => {
            model.unregisterFleetCreationCallback(handleFleetUpdate);
        }
    }, [model, handleFleetUpdate]);

    // register on update callbacks for fleets
    useEffect(() => {
        const fleets = Array.from(fleetMap.values());
        fleets.forEach(fleet => {
            model.registerFleetUpdateCallback(fleet.url, handleFleetUpdate);
        });
        // cleanup before effect runs and before form close
        return () => {
            fleets.forEach(fleet => {
                model.unregisterFleetUpdateCallback(fleet.url, handleFleetUpdate);
            });
        }
    }, [model, fleetMap, handleFleetUpdate]);

    // get fleets
    useEffect(() => {
        let ignoreFetch = false;
        if (!ignoreFetch) {
            model.getFleets().then(result => {
                const map = new Map();
                result.entities.forEach(fleet => {
                    map.set(fleet.url, fleet);
                });
                setFleetMap(map);
            }).catch((error) => {
                setMessage('Unable to load fleets\n' + error.message);
            })
        }
        // cleanup before effect runs and before form close
        return () => {
            ignoreFetch = true;
            setMessage(''); // clear any previous message
        }
    }, [model, fleetUpdateRequestAt]);

    // get dinghy classes
    useEffect(() => {
        let cancel = false;
        if (!cancel)
        model.getDinghyClasses().then(result => {
            const map = new Map();
            result.entities.forEach(dinghyClass => {
                map.set(dinghyClass.url, dinghyClass);
            });
            setDinghyClassMap(map);
        }).catch((error) => {
            setMessage('Unable to load dinghy classes\n' + error.message);
        });
        // cleanup before effect runs and before form close
        return () => {
            cancel = true;
            setMessage(''); // clear any previous message
        }
    }, [model]);

    async function createFleet(name, dinghyClasses) {
        try {
            await controller.createFleet(name, dinghyClasses);
            clear();
        }
        catch (error) {
            setMessage(error.message);
        }
    }

    async function updateFleet(fleet, name, dinghyClasses) {
        try {
            await controller.updateFleet(fleet, name, dinghyClasses);
            clear();
        }
        catch (error) {
            setMessage(error.message);
        }
    }

    function handleChange({ target }) {
        setFleetInput({...fleetInput, name: target.value});
    }

    function handleDinghyClassSelect(event) {
        const options = [...event.target.selectedOptions]; // convert from HTMLCollection to Array; trying to go direct to value results in event.target.selectedOptions.value is not iterable error
        const selectedDinghyClasses = options.map(option => dinghyClassMap.get(option.value));
        setFleetInput({...fleetInput, dinghyClasses: selectedDinghyClasses});
    }

    function handleCreateButtonClick(event) {
        event.preventDefault();
        createFleet(fleetInput.name, fleetInput.dinghyClasses);
    }

    function handleUpdateButtonClick(event) {
        event.preventDefault();
        updateFleet(selectedFleet, fleetInput.name, fleetInput.dinghyClasses);
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    function fleetRows() {
        return Array.from(fleetMap.values()).map(fleet => {return (
            <tr onClick={handleFleetRowClick} id={fleet.url} key={fleet.url} >
                <td>{fleet.name}</td>
            </tr>
        )});
    }

    async function handleFleetRowClick({ currentTarget }) {
        const fleet = fleetMap.get(currentTarget.id);
        const dinghyClasses = await fleet.getDinghyClasses();
        setSelectedFleet(fleet);
        setFleetInput({name: fleet.name, dinghyClasses: dinghyClasses.entities});
        setUpdatingFleet(true);
        fleetNameInputRef.current.focus();
        setMessage('');
    }

    return(
        <div className='w3-container console '>
            <h1>Fleets</h1>
            <form className='w3-container' action='' method='post'>
                <div className='w3-row'>
                    <label htmlFor='name-input' className='w3-col m2' >Fleet Name</label>
                    <input id='name-input' ref={fleetNameInputRef} name='name' className='w3-half' type='text' value={fleetInput.name} onChange={handleChange} autoFocus />
                    <label htmlFor='dinghy-class-select' className='w3-left w3-col' >Select Dinghy Class</label>
                    <select id='dinghy-class-select' name='dinghy-classes' multiple={true} className='w3-col w3-third' onChange={handleDinghyClassSelect} value={fleetInput.dinghyClasses.map(dc => dc.url)} >
                        {Array.from(dinghyClassMap.values()).map((dinghyClass) => {return (<option key={dinghyClass.url} value={dinghyClass.url}>{dinghyClass.name}</option>)})}
                </select>
                </div>
                <div className='w3-row'>
                    <div className='w3-col m8' >
                        {!updatingFleet ? <button className='w3-right' type='button' onClick={handleCreateButtonClick} >Create</button> : <button className='w3-right' type='button' onClick={handleUpdateButtonClick} >Update</button>}
                        <button className='w3-right' type='button' onClick={clear} >Cancel</button>
                    </div>
                </div>
            </form>
            <p className={userMessageClasses()}>{message}</p>
            <div className='scrollable'>
                <table className='w3-table w3-striped'>
                    <thead>
                        <tr>
                            <th>Fleet Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fleetRows()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FleetConsole;