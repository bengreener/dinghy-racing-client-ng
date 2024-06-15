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
import DinghyRacingModel from '../model/dinghy-racing-model';

/**
 * Get information required to create a new dinghy class
 * @param {DinghyClassConsole~createDinghyClass} createDinghyClass
 */
function DinghyClassConsole({ createDinghyClass }) {
    const [dinghyClass, setDinghyClass] = React.useState({...DinghyRacingModel.dinghyClassTemplate(), portsmouthNumber: 1000});
    const [result, setResult] = React.useState({message: ''});
    
    const clear = React.useCallback(() => {
        setDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), portsmouthNumber: 1000});
        showMessage('');
    }, []);

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
        setResult(await createDinghyClass(dinghyClass));
    }

    function handleChange({target}) {
        if (target.name === 'crewSize' || target.name === 'portsmouthNumber') {
            setDinghyClass({...dinghyClass, [target.name]: Number(target.value)});
        }
        else {
            setDinghyClass({...dinghyClass, [target.name]: target.value});    
        }
    }

    function showMessage(message) {
        const output = document.getElementById('dinghy-class-message-output');
        output.value = message;
    }

    return (
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
    )
}

export default DinghyClassConsole;

/**
 * Method to create dinghy class when create dinghy class button clicked
 * @callback async DinghyClassConsole~createDinghyClass
 * @param {DinghyClass} dinghyClass to create
 */