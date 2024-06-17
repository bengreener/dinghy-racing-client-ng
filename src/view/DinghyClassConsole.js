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

import { useCallback, useContext, useEffect, useState, } from 'react';
import ModelContext from './ModelContext';
import DinghyRacingModel from '../model/dinghy-racing-model';
import ControllerContext from './ControllerContext';

/**
 * Get information required to create a new dinghy class
 * @returns {HTMLDivElement}
 */
function DinghyClassConsole() {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [dinghyClassMap, setDinghyClassMap] = useState(new Map());
    const [selectedDinghyClass, setSelectedDinghyClass] = useState();
    const [dinghyClass, setDinghyClass] = useState({...DinghyRacingModel.dinghyClassTemplate(), portsmouthNumber: 1000});
    const [message, setMessage] = useState('');
    const [dinghyClassUpdateRequestAt, setDinghyClassUpdateRequestAt] = useState(Date.now());

    const handleDinghyClassUpdate = useCallback(() => {
        setDinghyClassUpdateRequestAt(Date.now());
    }, []);
    
    const clear = useCallback(() => {
        setDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), portsmouthNumber: 1000});
        setSelectedDinghyClass(null);
        setMessage('');
    }, []);

    // get dinghy classes
    useEffect(() => {
        let ignoreFetch = false; // set to true if DinghyClassConsole rerendered before fetch completes to avoid using out of date result
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
    }, [model, dinghyClassUpdateRequestAt]);

    // register on update callbacks for dinghyClasses
    useEffect(() => {
        const races = Array.from(dinghyClassMap.values());
        races.forEach(dinghyClass => {
            model.registerDinghyClassUpdateCallback(dinghyClass.url, handleDinghyClassUpdate);
        });
        // cleanup before effect runs and before form close
        return () => {
            races.forEach(dinghyClass => {
                model.unregisterDinghyClassUpdateCallback(dinghyClass.url, handleDinghyClassUpdate);
            });
        }
    }, [model, dinghyClassMap, handleDinghyClassUpdate]);

    async function createDinghyClass() {
        const result = await controller.createDinghyClass(dinghyClass);
        if (result.success) {
            clear();
        }
        else {
            setMessage(result.message);
        }
    }

    async function updateDinghyClass() {
        const result = await controller.updateDinghyClass(selectedDinghyClass, dinghyClass.name, dinghyClass.crewSize, dinghyClass.portsmouthNumber);
        if (result.success) {
            clear();
        }
        else {
            setMessage(result.message);
        }
    }

    function handleCreate(event) {
        event.preventDefault();
        createDinghyClass(dinghyClass);
    }

    function handleUpdate(event) {
        event.preventDefault();
        updateDinghyClass(dinghyClass);
    }

    function handleDinghyClassRowClick({ currentTarget }) {
        const dinghyClass = {...dinghyClassMap.get(currentTarget.id)};
        setSelectedDinghyClass(dinghyClass);
        // portsmouthNumber should be a numeric value greater than 0
        if (!dinghyClass.portsmouthNumber) {
            dinghyClass.portsmouthNumber = 1000;
        }
        setDinghyClass(dinghyClass);
        setMessage('');
    };

    function handleChange({target}) {
        if (target.name === 'crewSize' || target.name === 'portsmouthNumber') {
            setDinghyClass({...dinghyClass, [target.name]: Number(target.value)});
        }
        else {
            setDinghyClass({...dinghyClass, [target.name]: target.value});    
        }
    }

    function dinghyClassRows() {
        const rows = [];
        dinghyClassMap.forEach((dinghyClass, key) => {
            rows.push(<tr key={key} id={key} onClick={handleDinghyClassRowClick} >
                <td id={dinghyClass.name} >{dinghyClass.name}</td>
                <td id={dinghyClass.crewSize} >{dinghyClass.crewSize}</td>
                <td id={dinghyClass.portsmouthNumber} >{dinghyClass.portsmouthNumber}</td>
            </tr>);
        });
        return rows;
    };

    return (
        <div className="console">
            <h1>Dinghy Classes</h1>
            <p id="dinghy-class-console-message" className={!message ? "hidden" : ""}>{message}</p>
            <form action="" method="get">
                <label htmlFor="dinghy-class-input">Class Name</label>
                <input id="dinghy-class-input" name="name" type="text" onChange={handleChange} value={dinghyClass.name} />
                <label htmlFor="crew-size-input">Crew Size</label>
                <input id="crew-size-input" name="crewSize" type="number" min="1" onChange={handleChange} value={dinghyClass.crewSize} />
                <label htmlFor="portsmouth-number-input">Portsmouth Number</label>
                <input id="portsmouth-number-input" name="portsmouthNumber" type="number" onChange={handleChange} value={dinghyClass.portsmouthNumber} />
                <output id="dinghy-class-message-output" />
                {selectedDinghyClass ? <button id="dinghy-class-update-button" type="button" onClick={handleUpdate} >Update</button> : <button id="dinghy-class-create-button" type="button" onClick={handleCreate}>Create</button>}
                <button id="dinghy-class-cancel-button" type="button" onClick={clear}>Cancel</button>
            </form>
            <div className="scrollable">
                <table>
                    <thead>
                        <tr>
                            <th>Dinghy Class</th>
                            <th>Crew Size</th>
                            <th>Portsmouth Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dinghyClassRows()}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DinghyClassConsole;