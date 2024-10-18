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
import ControllerContext from './ControllerContext';

/**
 * Display a list of competitors and enable editing of the details for a selected competitor
 * @param {Object} props
 * @returns {HTMLDivElement}
 */
function CompetitorsConsole() {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [competitorsMap, setCompetitorsMap] = useState(new Map());
    const [selectedCompetitor, setSelectedCompetitor] = useState();
    const [competitorName, setCompetitorName] = useState();
    const [message, setMessage] = useState('');
    const [competitorUpdateRequestAt, setCompetitorUpdateRequestAt] = useState(Date.now());

    // get competitors
    useEffect(() => {
        let ignoreFetch = false; // set to true if CompetitorsConsole rerendered before fetch completes to avoid using out of date result
        model.getCompetitors().then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load competitors\n' + result.message);
            }
            else if (!ignoreFetch) {
                const map = new Map();
                result.domainObject.forEach(competitor => {
                    map.set(competitor.url, competitor);
                });
                setCompetitorsMap(map);
            }
        });
        // cleanup before effect runs and before form close
        return () => {
            ignoreFetch = true;
            setMessage(''); // clear any previous message
        }
    }, [model, competitorUpdateRequestAt])

    async function updateCompetitor(competitor, name) {
        const result = await controller.updateCompetitor(competitor, name);
        if (result.success) {
            clearSelectedCompetitor();
            setCompetitorUpdateRequestAt(Date.now());
        }
        else {
            setMessage(result.message);
        }
    }

    function clearSelectedCompetitor() {
        setSelectedCompetitor(null);
        setCompetitorName('');
        setMessage('');
    }

    function handleCompetitorRowClick({ currentTarget }) {
        const competitor = competitorsMap.get(currentTarget.id);
        setSelectedCompetitor(competitor);
        setCompetitorName(competitor.name);
        setMessage('');
    };

    function handleNameChange( { target }) {
        setCompetitorName(target.value);
    }

    function handleUpdateButtonClick() {
        updateCompetitor(selectedCompetitor, competitorName);
    }

    function competitorRows() {
        const rows = [];
        competitorsMap.forEach((competitor, key) => {
            rows.push(<tr key={key} id={key} className='clickable-table-row' onClick={handleCompetitorRowClick} ><td>{competitor.name}</td></tr>);
        });
        return rows;
    };

    return (
        <div className='w3-container console'>
            <h1>Competitors</h1>
            {selectedCompetitor ? <form className='w3-container' action='' method='post'>
                <div className='w3-row'>
                    <label htmlFor='name-input' className='w3-col m2' >Name</label>
                    <input id='name-input' type='text' name='name' className='w3-half' value={competitorName} onChange={handleNameChange} />
                </div>
                <div className='w3-row'>
                    <div className='w3-col m8' >
                        <button className='w3-right' type='button' onClick={handleUpdateButtonClick} >Update</button>
                        <button className='w3-right' type='button' onClick={clearSelectedCompetitor} >Cancel</button>
                    </div>
                </div>
            </form> : null}
            <p id='competitor-console-message' className={!message ? 'hidden' : ''}>{message}</p>
            <div className='scrollable'>
                <table className='w3-table' >
                    <thead>
                        <tr>
                            <th>Competitors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {competitorRows()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CompetitorsConsole;