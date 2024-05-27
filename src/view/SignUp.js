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
    const [competitorMap, setCompetitorMap] = useState(new Map());
    const [competitorOptions, setCompetitorOptions] = useState([]);
    const [dinghyClassMap, setDinghyClassMap] = useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = useState([]);
    const [dinghyMap, setDinghyMap] = useState(new Map());
    const [dinghyOptions, setDinghyOptions] = useState([]);
    const entryMap = useRef(new Map());
    const [entriesTable, setEntriesTable] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const helmInput = useRef(null);
    const dinghyClassSelect = useRef(null);
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    }, []);

    const clear = React.useCallback(() => {
        setHelmName('');
        setCrewName('');
        setSailNumber('');
        setDinghyClassName('');
        showMessage('');
        setSelectedEntry(null);
        if (race.dinghyClass) {
            helmInput.current.focus();
        }
        else {
            dinghyClassSelect.current.focus();
        }
    }, [race.dinghyClass]);

    const handleEntryRowClick = useCallback(({ currentTarget }) => {
        const entry = entryMap.current.get(currentTarget.id);
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
        showMessage('');
    }, [race]);

    // register on update callback for race
    useEffect(() => {
        model.registerRaceUpdateCallback(race.url, handleRaceUpdate);
        // cleanup before effect runs and before form close
        return () => {
            model.unregisterRaceUpdateCallback(race.url, handleRaceUpdate);
        }
    }, [model, race, handleRaceUpdate]);

    // get competitors
    useEffect(() => {
        let ignoreFetch = false; // set to true if SignUp rerendered before fetch completes to avoid using out of date result
        model.getCompetitors().then((result) => {
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
                showMessage('Unable to load competitors\n' + result.message);
            }
        });

        return () => {
            ignoreFetch = true;
        }
    }, [model]);

    // get dinghy classes
    useEffect(() => {
        let ignoreFetch = false; // set to true if SignUp rerendered before fetch completes to avoid using out of date result
        model.getDinghyClasses().then(result => {
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
                showMessage('Unable to load dinghy classes\n' + result.message);
            }
        });
    }, [model]);

    // get dinghies
    useEffect(() => {
        let ignoreFetch = false; // set to true if SignUp rerendered before fetch completes to avoid using out of date result
        let dinghyClass = race.dinghyClass;
        if (!dinghyClass && dinghyClassMap.has(dinghyClassName)) {
            dinghyClass = dinghyClassMap.get(dinghyClassName);
        }
        model.getDinghies(dinghyClass).then(result => {
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
                showMessage('Unable to load dinghies\n' + result.message);
            }
        })

        return () => {
            ignoreFetch = true;
        }
    }, [model, race.dinghyClass, dinghyClassName, dinghyClassMap]);

    // build entries table
    useEffect(() => {
        let ignoreFetch = false; // set to true if SignUp rerendered before fetch completes to avoid using out of date result
        model.getEntriesByRace(race).then(result => {
            if (result.success) {
                // populate entries map
                const map = new Map();
                result.domainObject.map(entry => map.set(entry.url, entry));
                entryMap.current = map; // tried using setState but was failing tests with entryMap === null even when entriesTable populated; entriesMap is nt a visual element so useRef may be a better fit anyway
                // build table rows
                const rows = result.domainObject.map(entry => {
                    return <tr key={entry.helm.name} id={entry.url} onClick={handleEntryRowClick} >
                        <td key={'helm'}>{entry.helm.name}</td>
                        <td key={'sailNumber'}>{entry.dinghy.sailNumber}</td>
                        <td key={'dinghyClass'}>{entry.dinghy.dinghyClass.name}</td>
                        {(!race.dinghyClass || race.dinghyClass.crewSize > 1) ? <td key={'crew'}>{entry.crew ? entry.crew.name : ''}</td> : null}
                    </tr>
                });
                setEntriesTable(<table>
                    <thead>
                        <tr>
                            <th key="helm">Helm</th>
                            <th key="sailNumber">Sail Number</th>
                            <th key="dinghyClass">Class</th>
                            {(!race.dinghyClass || race.dinghyClass.crewSize > 1) ? <th key="crew">Crew</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                    </table>);
            }
            else {
                showMessage('Unable to load race entries\n' + result.message);
            }
        });

        return () => {
            ignoreFetch = true;
        }
    }, [race, model, handleEntryRowClick, racesUpdateRequestAt]);
    
    // if error display message 
    useEffect(() => {
        if (result && result.success) {
            clear();
        }
        if (result && !result.success) {
            showMessage(result.message);
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

    async function handleEntryUpdateButtonClick(event) {
        event.preventDefault();        
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

    function dinghyClassInput(race) {
        let dinghyClassInput = null;    
        if (!race.dinghyClass) {
            dinghyClassInput = (
                <>
                    <label htmlFor="dinghy-class-select">Dinghy Class</label>
                    <select id="dinghy-class-select" ref={dinghyClassSelect} name="dinghyClass" multiple={false} onChange={handleChange} value={dinghyClassName} autoFocus >{dinghyClassOptions}</select>
                </>
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
                <>
                    <label htmlFor="helm-input">Helm's Name</label>
                    <input id="helm-input" ref={helmInput} name="helm" list="competitor-datalist" onChange={handleChange} value={helmName} autoFocus />
                </>
            )
        }
        else {
            return (
                <>
                    <label htmlFor="helm-input">Helm's Name</label>
                    <input id="helm-input" ref={helmInput} name="helm" list="competitor-datalist" onChange={handleChange} value={helmName} />
                </>
            )
        }
    }

    function buildCrewInput() {
        let crewInput = (
            <>
                <label htmlFor="crew-input">Crew's Name</label>
                <input id="crew-input" name="crew" list="competitor-datalist" onChange={handleChange} value={crewName} disabled />
            </>
        );
        if (dinghyClassHasCrew) {
            crewInput = (
                <>
                    <label htmlFor="crew-input">Crew's Name</label>
                    <input id="crew-input" name="crew" list="competitor-datalist" onChange={handleChange} value={crewName} />
                </>
            );
        }
        return crewInput;
    }

    function showMessage(message) {
        const output = document.getElementById('entry-message-output');
        output.value = message;
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

    return (
        <form className="sign-up-form" action="" method="get">
            <h1>{race.name}</h1>
            <datalist id="competitor-datalist">{competitorOptions}</datalist>
            <div>
            {dinghyClassInput(race)}
            {buildHelmInput()}
            {buildCrewInput()}
            <datalist id="dinghy-datalist">{dinghyOptions}</datalist>
            <label htmlFor="sail-number-input">Sail Number</label>
            <input id="sail-number-input" name="sailNumber" list="dinghy-datalist" onChange={handleChange} value={sailNumber} />
            <output id="entry-message-output" />
            <button id="entry-update-button" type="button" onClick={handleEntryUpdateButtonClick} >{getButtonText()}</button>
            {selectedEntry ? <button id="canel-button" type="button" onClick={clear} >Cancel</button> : null}
            </div>
            <h3>Signed-up</h3>
            <div className="scrollable">
                {entriesTable}
            </div>
        </form>
    )
}

export default SignUp;

