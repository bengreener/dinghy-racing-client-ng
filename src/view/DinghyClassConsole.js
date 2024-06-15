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
    const [dinghyClass, setDinghyClass] = useState({...DinghyRacingModel.dinghyClassTemplate(), portsmouthNumber: 1000});
    const [message, setMessage] = useState('');
    
    const clear = useCallback(() => {
        setDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), portsmouthNumber: 1000});
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
    }, [model])

    async function createDinghyClass() {
        const result = await controller.createDinghyClass(dinghyClass);
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

    function handleChange({target}) {
        if (target.name === 'crewSize' || target.name === 'portsmouthNumber') {
            setDinghyClass({...dinghyClass, [target.name]: Number(target.value)});
        }
        else {
            setDinghyClass({...dinghyClass, [target.name]: target.value});    
        }
    }

    return (
        <div className="dinghy-class-console">
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
                <button id="dinghy-class-create-button" type="button" onClick={handleCreate}>Create</button>
            </form>
        </div>
    )
}

export default DinghyClassConsole;