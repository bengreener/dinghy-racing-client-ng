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

import { useEffect, useState } from 'react';
import StartType from '../model/start-type';
import { toTitleCase } from '../utilities/text-utilities';

 function RaceTableRow({ race, handleRowClick }) {
    const [loading, setLoading] = useState(true);
    const [fleet, setFleet] = useState();

    useEffect(() => {
        race.getFleet().then(fleet => {
            setFleet(fleet);
            setLoading(false);
        });
    }, [race])

    function startTypeDisplayValue(startType) {
        switch (startType) {
            case StartType.CSCCLUBSTART:
                return '10-5-Go';
            case StartType.RRS26:
                return '5-4-1-Go';
            default:
                return '';
        }
    }

    if (loading) {
        return (
            <tr>
                <td>
                    <div className='small-loader'></div> 
                </td>
                <td></td><td></td><td></td><td></td>
            </tr>
        )
    }
    else {
        return (
            <tr className='clickable-table-row' key={race.url} id={race.url} onClick={handleRowClick} >
                <td>{race.name}</td>
                <td>{fleet.name}</td>
                <td>{race.plannedStartTime.toLocaleString()}</td>
                <td>{toTitleCase(race.type)}</td>
                <td>{startTypeDisplayValue(race.startType)}</td>
            </tr>
        )
    }
 }

 export default RaceTableRow;