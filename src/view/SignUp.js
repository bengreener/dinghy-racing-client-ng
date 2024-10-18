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

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ControllerContext from './ControllerContext';
import ModelContext from './ModelContext';

/**
 * Form for signing up to a race
 * @param {Object} props
 * @param {Race} props.race The race to sign up to
 * @returns {HTMLFormElement}
 */
function SignUp({ race }) {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [helmName, setHelmName] = useState('');
    const [crewName, setCrewName] = useState('');
    const [sailNumber, setSailNumber] = useState('');
    const [dinghyClassName, setDinghyClassName] = useState('');
    const [dinghyClassHasCrew, setDinghyClassHasCrew] = useState(false);
    const [result, setResult] = useState({'message': ''});
    const [message, setMessage] = useState(''); // feedback to user
    const [competitorMap, setCompetitorMap] = useState(new Map());
    const [competitorOptions, setCompetitorOptions] = useState([]);
    const [dinghyClassMap, setDinghyClassMap] = useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = useState([]);
    const [dinghyMap, setDinghyMap] = useState(new Map());
    const [dinghyOptions, setDinghyOptions] = useState([]);
    const entriesMap = useRef(new Map());
    const [entriesTable, setEntriesTable] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const helmInput = useRef(null);
    const dinghyClassSelect = useRef(null);
    const [raceUpdateRequestAt, setRaceUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated
    const [entryUpdateRequestAt, setEntryUpdateRequestAt] = useState(Date.now()); // time of last request to fetch an entry from server. change triggers a new fetch; for instance when server notifies an entry has been updated
    const [competitorUpdateRequestAt, setCompetitorUpdateRequestAt] = useState(Date.now());
    const [dinghyUpdateRequestAt, setDinghyUpdateRequestAt] = useState(Date.now());
    const [dinghyClassUpdateRequestAt, setDinghyClassUpdateRequestAt] = useState(Date.now());
    const entriesSummary = useRef(new Map());

    const handleRaceUpdate = useCallback(() => {
        setRaceUpdateRequestAt(Date.now());
    }, []);

    const handleEntryUpdate = useCallback(() => {
        setEntryUpdateRequestAt(Date.now());
    }, []);

    const handleCompetitorUpdate = useCallback(() => {
        setCompetitorUpdateRequestAt(Date.now());
    }, []);

    const handleDinghyUpdate = useCallback(() => {
        setDinghyUpdateRequestAt(Date.now());
    }, []);

    const handleDinghyClassUpdate = useCallback(() => {
        setDinghyClassUpdateRequestAt(Date.now());
    }, []);

    const clear = React.useCallback(() => {
        setHelmName('');
        setCrewName('');
        setSailNumber('');
        setDinghyClassName('');
        setMessage('');
        setSelectedEntry(null);
        if (race.dinghyClass) {
            helmInput.current.focus();
        }
        else {
            dinghyClassSelect.current.focus();
        }
    }, [race.dinghyClass]);

    const handleEntryRowClick = useCallback(({ currentTarget }) => {
        const entry = entriesMap.current.get(currentTarget.id);
        setSelectedEntry(entry);
        setHelmName(entry.helm.name);
        if (entry.crew) {
            setCrewName(entry.crew.name)
        };
        if ((!race.dinghyClass)){
            setDinghyClassName(entry.dinghy.dinghyClass.name);
        }
        setSailNumber(entry.dinghy.sailNumber);
        if (race.dinghyClass) {
            helmInput.current.focus();
        }
        else {
            dinghyClassSelect.current.focus();
        }
        setMessage('');
    }, [race]);

    const withdrawEntry = useCallback(async (entry) => {
        const result = await controller.withdrawEntry(entry);
        if (!result.success) {
            setMessage(result.message);
        }
        else {
            setMessage('');
        }
    }, [controller]);

    const handleWithdrawEntryButtonClick = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        withdrawEntry(entriesMap.current.get(event.target.id));
    }, [withdrawEntry]);

    // register on update callback for race
    useEffect(() => {
        model.registerRaceUpdateCallback(race.url, handleRaceUpdate);
        // cleanup before effect runs and before form close
        return () => {
            model.unregisterRaceUpdateCallback(race.url, handleRaceUpdate);
        }
    }, [model, race, handleRaceUpdate]);

    // register on creation callback for competitors
    useEffect(() => {
        model.registerCompetitorCreationCallback(handleCompetitorUpdate);
        // cleanup before effect runs and before form close
        return () => {
            model.unregisterCompetitorCreationCallback(handleCompetitorUpdate);
        }
    }, [model, handleCompetitorUpdate]);

    // register on creation callback for dinghies
    useEffect(() => {
        model.registerDinghyCreationCallback(handleDinghyUpdate);
        // cleanup before effect runs and before form close
        return () => {
            model.unregisterDinghyCreationCallback(handleDinghyUpdate);
        }
    }, [model, handleDinghyUpdate]);

    // register on creation callback for dinghy classes
    useEffect(() => {
        model.registerDinghyClassCreationCallback(handleDinghyClassUpdate);
        // cleanup before effect runs and before form close
        return () => {
            model.unregisterDinghyClassCreationCallback(handleDinghyClassUpdate);
        }
    }, [model, handleDinghyClassUpdate]);

    // get competitors
    useEffect(() => {
        let ignoreFetch = false; // set to true if SignUp rerendered before fetch completes to avoid using out of date result
        model.getCompetitors().then((result) => {
            if (!ignoreFetch) {
                if (result.success) {
                    const competitorMap = new Map();
                    const options = [];
                    result.domainObject.forEach(competitor => {
                    competitorMap.set(competitor.name, competitor);
                    options.push(<option key={competitor.name} value={competitor.name}>{competitor.name}</option>);
                    });
                    setCompetitorMap(competitorMap);
                    setCompetitorOptions(options);
                }
                else {
                    setMessage('Unable to load competitors\n' + result.message);
                }
            }
        });

        return () => {
            ignoreFetch = true;
        }
    }, [model, competitorUpdateRequestAt]);

    // get dinghy classes
    useEffect(() => {
        let ignoreFetch = false; // set to true if SignUp rerendered before fetch completes to avoid using out of date result
        model.getDinghyClasses().then(result => {
            if (!ignoreFetch) {
                if (result.success) {
                    // build dinghy class options
                    let options = [];
                    let map = new Map();
                    // set handicap options
                    options.push(<option key={''} value={''}></option> );
                    // set dinghy classes
                    result.domainObject.forEach(dinghyClass => {
                        options.push(<option key={dinghyClass.name} value={dinghyClass.name}>{dinghyClass.name}</option>);
                        map.set(dinghyClass.name, dinghyClass);
                    });
                    setDinghyClassMap(map);
                    setDinghyClassOptions(options);
                }
                else {
                    setMessage('Unable to load dinghy classes\n' + result.message);
                }
            }
        });

        return () => {
            ignoreFetch = true;
        }
    }, [model, dinghyClassUpdateRequestAt]);

    // get dinghies
    useEffect(() => {
        let ignoreFetch = false; // set to true if SignUp rerendered before fetch completes to avoid using out of date result
        let dinghyClass = race.dinghyClass;
        if (!dinghyClass && dinghyClassMap.has(dinghyClassName)) {
            dinghyClass = dinghyClassMap.get(dinghyClassName);
        }
        model.getDinghies(dinghyClass).then(result => {
            if (!ignoreFetch) {
                if (result.success) {
                    let options = [];
                    let map = new Map();
                    options.push(<option key={''} value = {''}></option>);
                    result.domainObject.forEach(dinghy => {
                        options.push(<option key={dinghy.dinghyClass.name + dinghy.sailNumber} value={dinghy.sailNumber}>{dinghy.sailNumber}</option>)
                        map.set(dinghy.sailNumber, dinghy);
                    });
                    setDinghyMap(map);
                    setDinghyOptions(options);
                }
                else {
                    setMessage('Unable to load dinghies\n' + result.message);
                }
            }
        });

        return () => {
            ignoreFetch = true;
        }
    }, [model, race.dinghyClass, dinghyClassName, dinghyClassMap, dinghyUpdateRequestAt]);

    // setup entries
    useEffect(() => {
        let ignoreFetch = false; // set to true if SignUp rerendered before fetch completes to avoid using out of date result
        model.getEntriesByRace(race).then(result => {
            entriesSummary.current = new Map();
            if (!ignoreFetch) {
                if (result.success) {
                    // populate entries map and register for updates
                    const map = new Map();
                    result.domainObject.map(entry => {
                        model.registerEntryUpdateCallback(entry.url, handleEntryUpdate);
                        updateEntriesSummary(entry.dinghy.dinghyClass.name);
                        return map.set(entry.url, entry);
                    });
                    entriesMap.current = map; // tried using setState but was failing tests with entriesMap === null even when entriesTable populated; entriesMap is not a visual element so useRef may be a better fit anyway
                    // build table rows
                    const rows = result.domainObject.map(entry => {
                        return <tr key={entry.helm.name} id={entry.url} onClick={handleEntryRowClick} >
                            <td key='helm'>{entry.helm.name}</td>
                            <td key='sailNumber'>{entry.dinghy.sailNumber}</td>
                            <td key='dinghyClass'>{entry.dinghy.dinghyClass.name}</td>
                            {(!race.dinghyClass || race.dinghyClass.crewSize > 1) ? <td key='crew'>{entry.crew ? entry.crew.name : ''}</td> : null}
                            <td key='withdrawEntry-button'><button id={entry.url} className='embedded' type='button' onClick={handleWithdrawEntryButtonClick}>X</button></td>
                        </tr>
                    });
                    setEntriesTable(<table className='w3-table'>
                        <thead>
                            <tr>
                                <th key='helm'>Helm</th>
                                <th key='sailNumber'>Sail Number</th>
                                <th key='dinghyClass'>Class</th>
                                {(!race.dinghyClass || race.dinghyClass.crewSize > 1) ? <th key='crew'>Crew</th> : null}
                                <th key='withdrawEntry-button'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                        </table>);
                }
                else {
                    setMessage('Unable to load race entries\n' + result.message);
                }
            }
        });

        return () => {
            ignoreFetch = true;
            entriesMap.current.forEach(entry => {
                model.unregisterEntryUpdateCallback(entry.url, handleEntryUpdate);
            });
        }
    }, [race, model, handleEntryRowClick, raceUpdateRequestAt, handleWithdrawEntryButtonClick, entryUpdateRequestAt, handleEntryUpdate]);

    // if error display message 
    useEffect(() => {
        if (result && result.success) {
            clear();
        }
        if (result && !result.success) {
            setMessage(result.message);
        }
    }, [result, clear]);

    // check if dinghy class has crew
    useEffect(() => {
        if (race.dinghyClass) {
            setDinghyClassHasCrew(race.dinghyClass.crewSize > 1);
        }
        else if (dinghyClassName) {
            setDinghyClassHasCrew(dinghyClassMap.get(dinghyClassName).crewSize > 1);
        }
        else {
            setDinghyClassHasCrew(false);
        }
    }, [race, dinghyClassName, dinghyClassMap]);
    
    function handleChange({target}) {
        if (target.name === 'sailNumber') {
            setSailNumber(target.value);
        }
        if (target.name === 'helm') {
            setHelmName(target.value);
        }
        if (target.name === 'crew') {
            setCrewName(target.value);
        }
        if (target.name === 'dinghyClass') {
            setDinghyClassName(target.value);
            if (target.value !== '' && dinghyClassMap.get(target.value).crewSize === 1) {
                setCrewName('');
            }
        }
    }

    async function updateEntry() {
        const creationPromises = [];
        // handle creation of 
        if (!competitorMap.has(helmName)) {
            creationPromises.push(controller.createCompetitor({'name': helmName, 'url': ''}));
        }
        else {
            creationPromises.push(Promise.resolve({'success': true}));
        }
        if (!dinghyMap.has(sailNumber)) {
            creationPromises.push(controller.createDinghy({'sailNumber': sailNumber, 'dinghyClass': dinghyClassMap.get(dinghyClassName), 'url': ''}));
        }
        else {
            creationPromises.push(Promise.resolve({'success': true}));
        }
        if (crewName && !competitorMap.has(crewName)) {
            creationPromises.push(controller.createCompetitor({'name': crewName, 'url': ''}));
        }
        else {
            creationPromises.push(Promise.resolve({'success': true}));
        }
        const creationResults = await Promise.all(creationPromises);
        let success = true;
        let message = '';
        creationResults.forEach(result => {
            if (!result.success) {
                if (message) {
                    message += '/n';
                }
                success = result.success;
                message += result.message;
            }
        });
        if (success) {
            const helm = competitorMap.has(helmName) ? competitorMap.get(helmName) : {'name': helmName, 'url': ''};
            const dinghy = dinghyMap.has(sailNumber) ? dinghyMap.get(sailNumber) : {'sailNumber': sailNumber, 'dinghyClass': dinghyClassMap.get(dinghyClassName), 'url': ''};
            const crew = crewName ? (competitorMap.has(crewName) ? competitorMap.get(crewName) : {'name': crewName, 'url': ''}) : null;
            if (!selectedEntry) {
                if (crew) {
                    setResult(await controller.signupToRace(race, helm, dinghy, crew));
                }
                else {
                    setResult(await controller.signupToRace(race, helm, dinghy));
                }
            }
            if (selectedEntry) {
                if (crew) {
                    setResult(await controller.updateEntry(selectedEntry, helm, dinghy, crew));
                }
                else {
                    setResult(await controller.updateEntry(selectedEntry, helm, dinghy));
                }
            }            
        }
        else {
            setResult({'success': false, 'message': message});
        }
    }

    function handleEntryUpdateButtonClick(event) {
        event.preventDefault();
        updateEntry();
    }

    function dinghyClassInput(race) {
        let dinghyClassInput = null;    
        if (!race.dinghyClass) {
            dinghyClassInput = (
                <div className='w3-row'>
                    <label htmlFor='dinghy-class-select' className='w3-col m2' >Dinghy Class</label>
                    <select id='dinghy-class-select' ref={dinghyClassSelect} name='dinghyClass' className='w3-half' multiple={false} onChange={handleChange} value={dinghyClassName} autoFocus >{dinghyClassOptions}</select>
                </div>
            );
        }
        // if race has a specified dinghy class then set for selected dinghy as well
        else if (!dinghyClassName) {
            setDinghyClassName(race.dinghyClass.name);
        }
        return dinghyClassInput;
    }

    function buildHelmInput() {
        if (race.dinghyClass) {
            return (
                <div className='w3-row'>
                    <label htmlFor='helm-input' className='w3-col m2' >Helm's Name</label>
                    <input id='helm-input' ref={helmInput} name='helm' className='w3-half' list='competitor-datalist' onChange={handleChange} value={helmName} autoFocus />
                </div>
            )
        }
        else {
            return (
                <div className='w3-row'>
                    <label htmlFor='helm-input' className='w3-col m2' >Helm's Name</label>
                    <input id='helm-input' ref={helmInput} name='helm' className='w3-half' list='competitor-datalist' onChange={handleChange} value={helmName} />
                </div>
            )
        }
    }

    function buildCrewInput() {
        let crewInput = (
            <div className='w3-row'>
                <label htmlFor='crew-input' className='w3-col m2' >Crew's Name</label>
                <input id='crew-input' name='crew' className='w3-half' list='competitor-datalist' onChange={handleChange} value={crewName} disabled />
            </div>
        );
        if (dinghyClassHasCrew) {
            crewInput = (
                <div className='w3-row'>
                    <label htmlFor='crew-input' className='w3-col m2' >Crew's Name</label>
                    <input id='crew-input' name='crew' className='w3-half' list='competitor-datalist' onChange={handleChange} value={crewName} />
                </div>
            );
        }
        return crewInput;
    }

    function getButtonText() {
        if (!selectedEntry) {
            if (!competitorMap.has(helmName) && (crewName !== '' && crewName != null && !competitorMap.has(crewName)) && !dinghyMap.has(sailNumber)) {
                return 'Add helm & crew & dinghy & sign-up';
            }
            if (!competitorMap.has(helmName) && !dinghyMap.has(sailNumber)) {
                return 'Add helm & dinghy & sign-up';
            }
            if ((crewName !== '' && crewName != null && !competitorMap.has(crewName)) && !dinghyMap.has(sailNumber)) {
                return 'Add crew & dinghy & sign-up';
            }
            if (!competitorMap.has(helmName) && (crewName !== '' && crewName != null && !competitorMap.has(crewName))) {
                return 'Add helm & crew & sign-up';
            }
            if (!competitorMap.has(helmName)) {
                return 'Add helm & sign-up';
            }
            if ((crewName !== '' && crewName != null && !competitorMap.has(crewName))) {
                return 'Add crew & sign-up';
            }
            if (!dinghyMap.has(sailNumber)) {
                return 'Add dinghy & sign-up';
            }
            return 'Sign-up';
        }
        if (selectedEntry) {
            if (!competitorMap.has(helmName) && (crewName !== '' && crewName != null && !competitorMap.has(crewName)) && !dinghyMap.has(sailNumber)) {
                return 'Add helm & crew & dinghy & update';
            }
            if (!competitorMap.has(helmName) && !dinghyMap.has(sailNumber)) {
                return 'Add helm & dinghy & update';
            }
            if ((crewName !== '' && crewName != null && !competitorMap.has(crewName)) && !dinghyMap.has(sailNumber)) {
                return 'Add crew & dinghy & update';
            }
            if (!competitorMap.has(helmName) && (crewName !== '' && crewName != null && !competitorMap.has(crewName))) {
                return 'Add helm & crew & update';
            }
            if (!competitorMap.has(helmName)) {
                return 'Add helm & update';
            }
            if ((crewName !== '' && crewName != null && !competitorMap.has(crewName))) {
                return 'Add crew & update';
            }
            if (!dinghyMap.has(sailNumber)) {
                return 'Add dinghy & update';
            }
            return 'Update';
        }
    }

    function updateEntriesSummary(dinghyClassName) {
        if (entriesSummary.current.has(dinghyClassName)) {
            entriesSummary.current.set(dinghyClassName, entriesSummary.current.get(dinghyClassName) + 1);
        }
        else {
            entriesSummary.current.set(dinghyClassName, 1);
        }
    }

    function entriesSummaryTable() {
        const rows = [];
        let totalEntries = 0;

        for (const [key, value] of entriesSummary.current) {
            totalEntries += value;
            rows.push(<tr key={key} >
                    <td key={`class-${key}`}>{key}</td>
                    <td key={`no-entries-${key}`}>{value}</td>
                </tr>
            );
        }

        rows.push(<tr key='total' >
                <td key='total-entries'>Total Entries</td>
                <td key='total-sum'>{totalEntries}</td>
            </tr>
        );

        return (<table className='sign-up-summary w3-table'>
                <thead>
                    <tr>
                        <th key='dinghyClass'>Class</th>
                        <th key='number'># entries</th>
                    </tr>
                </thead>
                    <tbody>
                        {rows}
                    </tbody>
                    </table>
        );
    };

    return (
        <div className='sign-up w3-container console' >
            <datalist id='competitor-datalist'>{competitorOptions}</datalist>
            <datalist id='dinghy-datalist'>{dinghyOptions}</datalist>
            <h1>{race.name}</h1>
            <form className='w3-container' action='' method='get'>
                {dinghyClassInput(race)}
                {buildHelmInput()}
                {buildCrewInput()}
                <div className='w3-row'>
                    <label htmlFor='sail-number-input' className='w3-col m2' >Sail Number</label>
                    <input id='sail-number-input' name='sailNumber' className='w3-half' list='dinghy-datalist' onChange={handleChange} value={sailNumber} />
                </div>
                <div className='w3-row' >
                    <div className='w3-col m8' >
                        <button id='entry-update-button' className='w3-right' type='button' onClick={handleEntryUpdateButtonClick} >{getButtonText()}</button>
                        {selectedEntry ? <button id='cancel-button' className='w3-right' type='button' onClick={clear} >Cancel</button> : null}
                    </div>
                </div>
            </form>
            <p id='signup-message' className={!message ? 'hidden' : ''}>{message}</p>
            <h3>Signed-up</h3>
            <div className='w3-container scrollable'>
                {entriesTable}
                <h4>Summary</h4>
                    {entriesSummaryTable()}
            </div>
        </div>
    )
}

export default SignUp;

