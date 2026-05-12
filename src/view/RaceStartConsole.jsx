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

import { useCallback, useEffect, useMemo, useState } from 'react';
import RaceType from '../model/race-type';
import CollapsableContainer from './CollapsableContainer';
import CountdownDisplayControl from './CountdownDisplayControl';
import SelectSession from './SelectSession';
import SignalsPanel from './SignalsPanel';
import RaceHeaderView from './RaceHeaderView';
import ActionListView from './ActionListView';
import { storageAvailable } from '../utilities/storage-utilities';
import { SortOrder } from '../model/sylph-model';

/**
 * Provide DirectRace Officer with information needed to successfully start races in a session
 * @returns {HTMLDivElement}
 */
function RaceStartConsole ({ model, controller }) {
    const sessionStorageAvailable = useMemo(() => storageAvailable('sessionStorage'), []);

    const [raceMap, setRaceMap] = useState(new Map()); // map of race names to races
    const [sessionStart, setSessionStart] = useState(() => {
        let sessionStart;
        if (sessionStorageAvailable) {
            const storedValue = sessionStorage.getItem('sessionStart');
            if (storedValue) {
                sessionStart = new Date(storedValue);
            }
        }
        if (!sessionStart) {
            sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
            sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
        }
        return sessionStart;
    });
    const [sessionEnd, setSessionEnd] = useState(() => {
        let sessionEnd;
        if (sessionStorageAvailable) {
            const storedValue = sessionStorage.getItem('sessionEnd');
            if (storedValue) {
                sessionEnd = new Date(storedValue);
            }
        }
        if (!sessionEnd) {
            sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 20:00 UTC intially
            sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        }
        return sessionEnd;
    });
    const [raceType, setRaceType] = useState(() => {
        let raceType;
        if (sessionStorageAvailable) {
            const storedValue = sessionStorage.getItem('raceType');
            if (storedValue) {
                raceType = RaceType.from(storedValue);
            }
        }
        if (!raceType) {
            raceType = RaceType.FLEET;
        }
        return raceType;
    });
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState();
    const [fleetUpdateRequestAt, setFleetUpdateRequestAt] = useState();
    const [signals, setSignals] = useState([]);
    const [timestamp, setTimestamp] = useState(model.getClock().getTime());
    const [selectedRaces, setSelectedRaces] = useState([]);
    const [sessionStartSequence, setSessionStartSequence] = useState();
    const [message, setMessage] = useState(''); // feedback to user
    const [prepareAudioRef] = useState(new Audio('./sounds/prepare_alert.mp3'));
    const [actAudioRef] = useState(new Audio('./sounds/act_alert.mp3'));
    
    const handleClockTick = useCallback(() => {
        setTimestamp(model.getClock().getTimeToSecondPrecision());
    }, [model]);

    const handleFleetUpdate = useCallback(() => {
        setFleetUpdateRequestAt(model.getClock().getTime());
    }, [model]);

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(model.getClock().getTime());
    }, [model]);

    const prepareForRaceSignalHandler = useCallback(() => {
        prepareAudioRef.play();
    }, [prepareAudioRef]);

    const makeRaceStartSignalHandler = useCallback(() => {
        actAudioRef.play();
    }, [actAudioRef]);

    // get races for selected session
    useEffect(() => {
        let cancel = false;

        if (!cancel) {
            model.getDirectRacesBetweenTimesForType(new Date(sessionStart), new Date(sessionEnd), raceType, null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING}).then(raceCollection => {
                const map = new Map();
                raceCollection.entities.map(race => {
                    map.set(race.name, race);
                });
                setRaceMap(map);
                // setSelectedRaces(Array.from(map.values()).map(race => race.name));
                const optionsRaceNames = Array.from(map.values()).map(race => race.name);
                setSelectedRaces(s => {
                    const updatedSelection = s.filter(selectedRaceName => {
                        return optionsRaceNames.includes(selectedRaceName);
                    });
                    if (optionsRaceNames.length === 0) {
                        // no races selected
                        return [];
                    }
                    // has selection changed?
                    if (updatedSelection.length > 0 && !(updatedSelection.length === s.length)) {
                        // some races in previous selection but, not all
                        return updatedSelection;
                    }
                    if (updatedSelection.length === 0) {
                        // all races are new
                        return optionsRaceNames;
                    }
                    // optionsRaceNames.length > 0 && selection.length > 0 && selection.length === s.length
                    // selection the same as before (don't change selection)
                    return s;
                });
            }).catch((error) => {
                setMessage(error.message);
            });
        }

        return (() => {
            cancel = true;
        });
    }, [model, raceType, racesUpdateRequestAt, sessionEnd, sessionStart]);

    // Setup session start sequence
    useEffect(() => {
        let cancel = false;
        let startSequence;
        
        if (!cancel) {
            startSequence = model.getStartSequence(
                selectedRaces.map((raceName) => {
                    return raceMap.get(raceName);
                })
            );
            startSequence.addPrepareForRaceStartSignalHandler(prepareForRaceSignalHandler);
            startSequence.addMakeRaceStartSignalHandler(makeRaceStartSignalHandler);
            startSequence.getSignals().then((signals) => {
                setSessionStartSequence(startSequence);
                setSignals(signals);
                setMessage('');
            }).catch((error) => {
                console.error(error);
                setMessage(error.message, error);
            });
        }

        return(() => {
            cancel = true;
            startSequence.removePrepareForRaceStartSignalHandler(prepareForRaceSignalHandler);
            startSequence.removeMakeRaceStartSignalHandler(makeRaceStartSignalHandler);
            startSequence?.dispose();
        })
    },[model, fleetUpdateRequestAt, makeRaceStartSignalHandler, prepareForRaceSignalHandler, raceMap, selectedRaces])
    
    // register for clock ticks
    useEffect(() => {
        model.getClock().addTickHandler(handleClockTick);

        return () => {
            model.getClock().removeTickHandler(handleClockTick);
        }
    }, [model, handleClockTick]);

    // register on update callbacks for races
    useEffect(() => {
        const races = Array.from(raceMap.values());
        races.forEach(race => {
            model.registerRaceUpdateCallback(race.url, handleRaceUpdate);
        });
        // cleanup before effect runs and before form close
        return () => {
            races.forEach(race => {
                model.unregisterRaceUpdateCallback(race.url, handleRaceUpdate);
            });
        }
    }, [model, raceMap, handleRaceUpdate])

    // register on update callbacks for fleet
    useEffect(() => {
        let fleets = [];
        Promise.all(Array.from(raceMap.values().map(race => race.getFleet()))).then((result) => {
            fleets = result;
            fleets.forEach(fleet => model.registerFleetUpdateCallback(fleet.url, handleFleetUpdate));
        });
        // cleanup before effect runs and before form close
        return () => {
            fleets.forEach(fleet => {
                model.unregisterFleetUpdateCallback(fleet.url, handleFleetUpdate);
            });
        }
    }, [model, raceMap, handleFleetUpdate])

    function handleSessionStartInputChange(date) {
        if (sessionStorageAvailable) {
            sessionStorage.setItem('sessionStart', date.toISOString());
        }
        setSessionStart(date);
    }

    function handleSessionEndInputChange(date) {
        if (sessionStorageAvailable) {
            sessionStorage.setItem('sessionEnd', date.toISOString());
        }
        setSessionEnd(date);
    }

    function handleRaceTypeChange({ target }) {
        if (sessionStorageAvailable) {
            sessionStorage.setItem('raceType', target.value);
        }
        setRaceType(RaceType.from(target.value));
    }

    function handleRaceSelect(event) {
        const options = [...event.target.selectedOptions]; // convert from HTMLCollection to Array; trying to go direct to value results in event.target.selectedOptions.value is not iterable error
        setSelectedRaces(options.map(option => option.value));
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    function buildStartCountdown() {
        // const nextRaceToStart = model.getStartSequence(selectedRaces.map(raceName => raceMap.get(raceName))).getNextRaceToStart(new Date(timestamp));
        const nextRaceToStart = sessionStartSequence?.getNextRaceToStart(new Date(timestamp));
        let countdown;
        if (nextRaceToStart) {
            const timeLeft = nextRaceToStart.plannedStartTime.getTime() - model.getClock().getTimeToSecondPrecision();
            const playAudio = timeLeft <= 10000 && timeLeft > 0;
            countdown = <CountdownDisplayControl title={'Start Countdown'} message={nextRaceToStart.name} time={timeLeft} beep={playAudio} />;
        }
        else {
            countdown = <CountdownDisplayControl title={'Start Countdown'} message={''} time={0} />;
        }
        return (
            <CollapsableContainer heading={'Start Countdown'}>
                {countdown}
            </CollapsableContainer>
        )
    }

    return (
        <div className='w3-container console'>
            <CollapsableContainer heading={'Start Races'}>
                <form className='w3-container' >
                    <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handleSessionStartInputChange} onSessionEndChange={handleSessionEndInputChange} />
                    <div className='w3-row'>
                        <fieldset className='w3-third' >
                            <legend>DirectRace Type</legend>
                            <div className='w3-cell-row'>
                                <div className='w3-cell'>
                                    <input id='radio-race-type-fleet' name='race-type' type='radio' value='FLEET' onChange={handleRaceTypeChange} checked={raceType === RaceType.FLEET} />
                                    <label htmlFor='radio-race-type-fleet'>Fleet</label>
                                </div>
                                <div className='w3-cell'>
                                    <input id='radio-race-type-pursuit' name='race-type' type='radio' value='PURSUIT' onChange={handleRaceTypeChange} checked={raceType === RaceType.PURSUIT}/>
                                    <label htmlFor='radio-race-type-pursuit'>Pursuit</label>
                                </div>
                            </div>
                        </fieldset>
                    <label htmlFor='race-select' className='w3-left w3-col' >Select DirectRace</label>
                    <select id='race-select' name='race' multiple={true} className='w3-col w3-third' onChange={handleRaceSelect} value={selectedRaces}>
                        {Array.from(raceMap.values()).map(race => <option key={race.name + race.plannedStartTime.toISOString()} value={race.name} >{race.name}</option>)}
                    </select>
                    </div>
                </form>
                <p className={userMessageClasses()}>{message}</p>
            </CollapsableContainer>
            {buildStartCountdown()}
            <div className='scrollable'>
                <CollapsableContainer heading={'Flags'}>
                    <SignalsPanel signals={signals} clock={model.getClock()} />
                </CollapsableContainer>
                <CollapsableContainer heading={'Races'}>
                    {selectedRaces.map(raceName => raceMap.get(raceName)).toSorted((a, b) => a.plannedStartTime - b.plannedStartTime).map(race => {
                        return <RaceHeaderView key={race.name+race.plannedStartTime.toISOString()} race={race} model={model} controller={controller} showInRaceData={false} />
                    })}
                </CollapsableContainer>
                <ActionListView signals={signals} clock={model.getClock()} />
            </div>
        </div>
    )
}

export default RaceStartConsole;