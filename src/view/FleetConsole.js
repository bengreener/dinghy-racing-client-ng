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

import { useContext, useEffect, useState } from 'react';
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

    function handleChange({ target }) {
        setFleet({...fleet, name: target.value});
    }

    function handleCreateButtonClick(event) {
        event.preventDefault();
        controller.createFleet(fleet);
    }

    return(
        <div>
            <h1>Fleets</h1>
            <form className='w3-container' action='' method='post'>
                <div className='w3-row'>
                    <label htmlFor='name-input' className='w3-col m2' >Fleet Name</label>
                    <input id='name-input' name='name' className='w3-half' type='text' value={fleet.name} onChange={handleChange} autoFocus />
                </div>
                <div className='w3-row'>
                    <div className='w3-col m8' >
                        <button className='w3-right' type='button' onClick={handleCreateButtonClick} >Create</button>
                        <button className='w3-right' type='button' >Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default FleetConsole;