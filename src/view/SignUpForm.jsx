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
import PreviousEntries from './PreviousEntries';
import CurrentEntries from './CurrentEntries';
import EmbeddedRacesPanel from './EmbeddedRacesPanel';
import EmbeddedRace from '../model/embedded-race';

function SignUpForm({ race, model, entry, onCreateCompetitor, onCreateDinghy, onSignUp, onUpdate, onEmbeddedSignUp, onWithdrawEmbeddedSignUp }) {
    const [competitorMap, setCompetitorMap] = useState(new Map());
    const [competitorOptions, setCompetitorOptions] = useState([]);
    const [crewName, setCrewName] = useState('');
    const [competitorUpdateAt, setCompetitorUpdateAt] = useState();
    const [dinghyUpdateAt, setDinghyUpdateAt] = useState();
    const [dinghyClassUpdateAt, setDinghyClassUpdateAt] = useState();
    const [dinghyMap, setDinghyMap] = useState(new Map());
    const [dinghyOptions, setDinghyOptions] = useState([]);
    const [dinghyClassMap, setDinghyClassMap] = useState(new Map());
    const [dinghyClassOptions, setDinghyClassOptions] = useState([]);
    const [dinghyClassName, setDinghyClassName] = useState('');
    const [embeddedRaces, setEmbeddedRaces]  = useState([]);
    const [fleet, setFleet] = useState();
    const [fleetUpdateAt, setFleetUpdateAt] = useState();
    const [helmName, setHelmName] = useState('');
    const [message, setMessage] = useState(''); // feedback to user
    const [sailNumber, setSailNumber] = useState('');
    const [selectedEmbeddedRaces, setSelectedEmbeddedRaces] = useState([]);
    const initalEmbeddedRaceSelection = useRef([]);

    const helmInput = useRef(null);
    const dinghyClassSelect = useRef(null);

    const handleCompetitorUpdate = useCallback(() => {
        setCompetitorUpdateAt(Date.now());
    }, []);

    const handleDinghyUpdate = useCallback(() => {
        setDinghyUpdateAt(Date.now());
    }, []);

    const handleDinghyClassUpdate = useCallback(() => {
        setDinghyClassUpdateAt(Date.now());
    }, []);

    const handleFleetUpdate = useCallback(() => {
        setFleetUpdateAt(Date.now());
    }, []);

    // get competitors
    useEffect(() => {
        let cancel = false;
        if (!cancel) {
            model.getCompetitors().then(competitors => {
                const map = new Map();
                const options = [];

                const sortedCompetitors = competitors.entities.toSorted((a, b) => {return a.name.localeCompare(b.name)});
                sortedCompetitors.forEach(competitor => {
                    map.set(competitor.name, competitor);
                    options.push(<option key={competitor.name} value={competitor.name}>{competitor.name}</option>);
                });
                setCompetitorMap(map);
                setCompetitorOptions(options);
            })
        }
        return () => { cancel = true; }
    }, [model, competitorUpdateAt])

    // get fleet for race
    useEffect(() => {
        let cancel = false;
        if (!cancel) {
            race.getFleet().then(fleet => setFleet(fleet));
        }
        
        return () => { cancel = true; }
    }, [race])

    // get dinghy classes for fleet
    useEffect(() => {
        let cancel = false;
        if (fleet && !cancel) {
            fleet.getDinghyClasses().then(dinghyClasses => {
                const map = new Map();
                const options = [];

                const sortedDinghyClasses = dinghyClasses.entities.toSorted((a, b) => {return a.name.localeCompare(b.name)});
                
                options.push(<option key ={''} value={''}></option>);
                sortedDinghyClasses.forEach(dinghyClass => {
                    map.set(dinghyClass.name, dinghyClass);
                    options.push(<option key={dinghyClass.name} value={dinghyClass.name}>{dinghyClass.name}</option>);
                });
                setDinghyClassMap(map);
                setDinghyClassOptions(options);
                if (map.size === 1) {
                    setDinghyClassName(map.values().next().value.name);
                }
            });
        }

        return () => { cancel = true; }
    }, [fleet, dinghyClassUpdateAt, fleetUpdateAt])

    // get dinghies
    useEffect(() => {
        let cancel = false;
        if (dinghyClassName && dinghyClassMap.size > 0 && !cancel) {
            model.getDinghiesInDinghyClass(dinghyClassMap.get(dinghyClassName)).then((dinghies) => {
                const map = new Map();
                const options = [];

                const sortedDinghies = dinghies.entities.toSorted((a, b) => {return a.sailNumber.localeCompare(b.sailNumber)});

                options.push(<option key ={''} value={''}></option>);
                sortedDinghies.forEach(dinghy => {
                    map.set(dinghy.sailNumber, dinghy);
                    options.push(<option key={dinghy.sailNumber} value={dinghy.sailNumber}>{dinghy.sailNumber}</option>);
                });
                setDinghyMap(map);
                setDinghyOptions(options);
            });
        }

        return () => { cancel = true; }
    }, [dinghyClassMap, dinghyClassName, model, dinghyUpdateAt])

    // get embedded races
    useEffect(() => {
        let cancel = false;
        race.getEmbeddedRaces().then(embeddedCollection => {
            if (!cancel) {
                setEmbeddedRaces(embeddedCollection.entities);
            }
        });

        return () => { cancel = true; }
    }, [race]);

    // if existing entry provided get entry details
    useEffect(() => {
        const getAll = async (entry) => {
            try {
                const resultArray = await Promise.all([entry.getHelm(), entry.getDinghy(), entry.getCrew(), entry.getEmbeddedRaces()]);
                const dinghyClass = await resultArray[1].getDinghyClass();
                if (dinghyClass.crewSize > 1 && !resultArray[3]) {
                    throw new Error('Entry should have a crew but no crew found.');
                }
                resultArray.splice(2, 0, dinghyClass);
                return resultArray;
            }
            catch (error) {
                console.error(error.message);
                setMessage(error.message);
            }
        }

        let cancel = false;
        if (entry) {
            getAll(entry).then(([helm, dinghy, dinghyClass, crew, embeddedRaces]) => {
                if (!cancel) {
                    setDinghyClassName(dinghyClass.name);
                    setHelmName(helm.name);
                    setSailNumber(dinghy.sailNumber);
                    setCrewName(crew ? crew.name : '');
                    setSelectedEmbeddedRaces(embeddedRaces);
                    initalEmbeddedRaceSelection.current = embeddedRaces;
                }
            });
        }
        
        return (() => {
            cancel = true;
        });
    }, [entry]);

    // register for competitor creation updates
    useEffect(() => {
        model.registerCompetitorCreationCallback(handleCompetitorUpdate);

        return(() => {
            model.unregisterCompetitorCreationCallback(handleCompetitorUpdate);
        });
    }, [model, handleCompetitorUpdate]);

    // register for dinghy creation updates
    useEffect(() => {
        model.registerDinghyCreationCallback(handleDinghyUpdate);

        return(() => {
            model.unregisterDinghyCreationCallback(handleDinghyUpdate);
        });
    }, [model, handleDinghyUpdate]);

    // register for dinghy class creation updates
    useEffect(() => {
        model.registerDinghyClassCreationCallback(handleDinghyClassUpdate);

        return(() => {
            model.unregisterDinghyClassCreationCallback(handleDinghyClassUpdate);
        });
    }, [model, handleDinghyClassUpdate]);

    // register for fleet updates
    useEffect(() => {
        if (fleet) {
            model.registerFleetUpdateCallback(fleet.url, handleFleetUpdate);
        }

        return(() => {
            if (fleet) {
                model.unregisterFleetUpdateCallback(fleet.url, handleFleetUpdate);
            }
        });
    }, [fleet, model, handleFleetUpdate]);

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

    function handleEntryUpdateButtonClick(event) {
        event.preventDefault();
        updateEntry();
    }

    /**
     * Handle a change of embedded races selection in EmbeddedRacesPanel
     * @param {Array<EmbeddedRace>} selectedRaces 
     */
    function handleEmbeddedRaceSelectionChanged(selectedRaces) {
        setSelectedEmbeddedRaces(selectedRaces);
    }
    
    function handleSelectPreviousEntry(entry) {
        // const previousEntry = previousEntriesMap.get(currentTarget.id);
        setHelmName(entry.crew.helm.name);
        if (entry.crew.mate) {
            setCrewName(entry.crew.mate.name);
        } 
        else {
            setCrewName('');
        };
        if(!race.dinghyClass) {
            setDinghyClassName(entry.dinghy.dinghyClass.name);
        }
        setSailNumber(entry.dinghy.sailNumber);
        if (dinghyClassMap.size === 1) {
            helmInput.current.focus();
        }
        else {
            dinghyClassSelect.current.focus();
        }
        setMessage('');
    }

    async function updateEntry() {
        // get helm, dinghy, and crew (may require network requests)
        const promises = [];
        try {
            if (competitorMap.has(helmName)) {
                promises.push(competitorMap.get(helmName));
            }
            else {
                promises.push(onCreateCompetitor(helmName));
            }
            if (dinghyMap.has(sailNumber)) {
                promises.push(dinghyMap.get(sailNumber));
            }
            else {
                promises.push(onCreateDinghy(sailNumber, dinghyClassMap.get(dinghyClassName)));
            }
            if (crewName) {
                if (competitorMap.has(crewName)) {
                    promises.push(competitorMap.get(crewName));
                }
                else {
                    promises.push(onCreateCompetitor(crewName));
                }
            }
            const results = await Promise.all(promises);
            if (promises.length === 2) {
                if (entry) {
                    await onUpdate(entry, results[0], results[1]);
                }
                else {
                    await onSignUp(race, results[0], results[1]);
                }
            }
            if (promises.length === 3) {
                if (entry) {
                    await onUpdate(entry, results[0], results[1], results[2]);
                }
                else {
                    await onSignUp(race, results[0], results[1], results[2]);
                }
            }
            // handle embedded races
            if (embeddedRaceSelectionChanged()) {
                // selected embedded races has changed
                let localEntry;
                if (entry) {
                    localEntry = entry;
                }
                else {
                    localEntry = await model.getEntryByRaceAndDinghy(race, results[1]);
                }
                const initialSelectedEmbeddedRaceNames = initalEmbeddedRaceSelection.current.map(iser => iser.name);
                const selectedEmbeddedRaceNames = selectedEmbeddedRaces.map(ser => ser.name);
                // get races to withdraw from; previously but no longer selected                
                const withdrawArray = initalEmbeddedRaceSelection.current.filter(iser => !(selectedEmbeddedRaceNames.includes(iser.name)));
                // get races to sign up to; not previously selected but, now selected
                const signUpArray = selectedEmbeddedRaces.filter(ser => !(initialSelectedEmbeddedRaceNames.includes(ser.name)));
                const embeddedWithdrawals = withdrawArray.map(embeddedRace => onWithdrawEmbeddedSignUp(embeddedRace, localEntry));
                const embeddedSignUps = signUpArray.map(embeddedRace => onEmbeddedSignUp(embeddedRace, localEntry));
                await Promise.all(embeddedSignUps.toSpliced(embeddedSignUps.length, 0, ...embeddedWithdrawals));
            }
            clear();
        }
        catch (error) {
            console.error(error.message, error);
            // If entry is a duplicate remove id values from error message as they confuse competitors
            let userMessage = error.message;
            if (/HTTP Error: 409.+(\d+)-(\d+)-(\d+).+/.test(userMessage)) {
                userMessage = userMessage.replace(/ '([0-9]{1,2})-([0-9]{1,2})-([0-9]{1,2})' /, ' ');
            }
            setMessage(userMessage);
        }
    }

    const clear = useCallback(() => {
        setHelmName('');
        setCrewName('');
        setSailNumber('');
        setDinghyClassName('');
        setMessage('');
        setSelectedEmbeddedRaces([]);
        // setSelectedEntry(null);
        if (dinghyClassMap.size === 1) {
            setDinghyClassName(dinghyClassMap.values().next().value.name);
        }
        else {
            dinghyClassSelect.current.focus();
        }
    }, [dinghyClassMap]);

    function dinghyClassInput() {
        let dinghyClassInput = null;    
        if (dinghyClassMap.size !== 1) {
            dinghyClassInput = (
                <div className='w3-row'>
                    <label htmlFor='dinghy-class-select' className='w3-col m2' >Dinghy Class</label>
                    <select id='dinghy-class-select' ref={dinghyClassSelect} name='dinghyClass' className='w3-half' multiple={false} onChange={handleChange} value={dinghyClassName} autoFocus >{dinghyClassOptions}</select>
                </div>
            );
        }
        return dinghyClassInput;
    }

    function buildHelmInput() {
        if (dinghyClassMap.size === 1) {
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
        if (dinghyClassHasCrew()) {
            return (
                <div className='w3-row'>
                    <label htmlFor='crew-input' className='w3-col m2' >Crew's Name</label>
                    <input id='crew-input' name='crew' className='w3-half' list='competitor-datalist' onChange={handleChange} value={crewName} />
                </div>
            );
        }
        return null;
    }

    function getButtonText() {
        let prefix = '';
            if (!competitorMap.has(helmName) && (crewName !== '' && crewName != null && !competitorMap.has(crewName)) && !dinghyMap.has(sailNumber)) {
                prefix = 'Add helm & crew & dinghy & ';
            }
            else if (!competitorMap.has(helmName) && !dinghyMap.has(sailNumber)) {
                prefix = 'Add helm & dinghy & ';
            }
            else if ((crewName !== '' && crewName != null && !competitorMap.has(crewName)) && !dinghyMap.has(sailNumber)) {
                prefix = 'Add crew & dinghy & ';
            }
            else if (!competitorMap.has(helmName) && (crewName !== '' && crewName != null && !competitorMap.has(crewName))) {
                prefix = 'Add helm & crew & ';
            }
            else if (!competitorMap.has(helmName)) {
                prefix = 'Add helm & ';
            }
            else if ((crewName !== '' && crewName != null && !competitorMap.has(crewName))) {
                return 'Add crew & sign-up';
            }
            else if (!dinghyMap.has(sailNumber)) {
                prefix = 'Add dinghy & ';
            }
            if (entry) {
                return prefix + 'Update';
            }
            return prefix + 'Sign-up';
    }

    function dinghyClassHasCrew() {
        if (dinghyClassName && dinghyClassMap.size > 0) {
            return dinghyClassMap.get(dinghyClassName).crewSize > 1;
        }
        return Array.from(dinghyClassMap.values()).some(dinghyClass => dinghyClass.crewSize > 1);
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    function embeddedRaceSelectionChanged() {
        const intitalEmbeddedRaceNames = initalEmbeddedRaceSelection.current.map(er => er.name);
        const currentEmbeddedRaceNames = selectedEmbeddedRaces.map(er => er.name);
        return !(intitalEmbeddedRaceNames.length === currentEmbeddedRaceNames.length && intitalEmbeddedRaceNames.every(name => currentEmbeddedRaceNames.includes(name)));
    }

    return (
        <form className='w3-container' action='' method='get'>
            <datalist id='competitor-datalist'>{competitorOptions}</datalist>
            <datalist id='dinghy-datalist'>{dinghyOptions}</datalist>
            {dinghyClassInput(race)}
            {buildHelmInput()}
            {buildCrewInput()}
            <div className='w3-row'>
                <label htmlFor='sail-number-input' className='w3-col m2' >Sail Number</label>
                <input id='sail-number-input' name='sailNumber' className='w3-half' list='dinghy-datalist' onChange={handleChange} value={sailNumber} />
            </div>
            <EmbeddedRacesPanel embeddedRaces={embeddedRaces} selectedRaces={selectedEmbeddedRaces} onRaceSelectionChanged={handleEmbeddedRaceSelectionChanged} />
            <div className='w3-row' >
                <div className='w3-col m8' >
                    <button id='entry-update-button' className='w3-right' type='button' onClick={handleEntryUpdateButtonClick} >{getButtonText()}</button>
                    {<button id='cancel-button' className='w3-right' type='button' onClick={clear} >Cancel</button>}
                </div>
            </div>
            {/* TODO: if dinghy class selected pass only selected dinghyclass */}
            <PreviousEntries sailNumber={sailNumber} dinghyClasses={dinghyClassName ? [dinghyClassMap.get(dinghyClassName)] : Array.from(dinghyClassMap.values())} model={model} onSelectPreviousEntry={handleSelectPreviousEntry} />
            <p className={userMessageClasses()}>{message}</p>
        </form>
    )
}

export default SignUpForm;