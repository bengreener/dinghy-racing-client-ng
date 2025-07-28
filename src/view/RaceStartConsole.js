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
import ModelContext from './ModelContext';
import SelectSession from './SelectSession';
import RaceHeaderView from './RaceHeaderView';
import ActionListView from './ActionListView';
import CollapsableContainer from './CollapsableContainer';
import SignalPanel from './SignalsPanel';
import RaceType from '../model/domain-classes/race-type';
import CountdownDisplayControl from './CountdownDisplayControl';
import { SortOrder } from '../model/dinghy-racing-model';

/**
 * Provide Race Officer with information needed to successfully start races in a session
 * @returns {HTMLDivElement}
 */
function RaceStartConsole () {
    const model = useContext(ModelContext);
    const [selectedRaces, setSelectedRaces] = useState([]); // selection of race names made by user
    const [raceMap, setRaceMap] = useState(new Map()); // map of race names to races
    const [message, setMessage] = useState(''); // feedback to user
    const [sessionStart, setSessionStart] = useState(() => {
        const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
        sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
        return sessionStart;
    });
    const [sessionEnd, setSessionEnd] = useState(() => {
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 20:00 UTC intially
        sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        return sessionEnd;
    });
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated
    const [fleetUpdateRequestAt, setFleetUpdateRequestAt] = useState(Date.now()); // time of last request to fetch fleet from server. change triggers calculation of a new start sequence
    const [raceType, setRaceType] = useState(RaceType.FLEET);
    const [signals, setSignals] = useState([]);
    const [timestamp, setTimestamp] = useState(Date.now());
    const sessionStartSequence = useRef(null);
    const prepareAudioRef = useRef(null);
    if (prepareAudioRef.current === null) {
        prepareAudioRef.current = new Audio('./sounds/prepare_alert.mp3');
    }
    const actAudioRef = useRef(null);
    if (actAudioRef.current === null) {
        actAudioRef.current = new Audio('./sounds/act_alert.mp3');
    }
    const audioContext = useRef(null);
    if (audioContext.current === null) {
        audioContext.current = new AudioContext();
    }
    const actTrack = useRef(null);
    if (actTrack === null && audioContext != null && actAudioRef != null) {
        actTrack.current = audioContext.createMediaElementSource(actAudioRef.current);
        actTrack.current(audioContext.current.destination);
    }
    const prepareTrack = useRef(null);
    if (prepareTrack === null && audioContext != null && prepareAudioRef != null) {
        prepareTrack.current = audioContext.createMediaElementSource(prepareAudioRef.current);
        prepareTrack.current(audioContext.current.destination);
    }

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    }, []);

    const handleFleetUpdate = useCallback(() => {
        setFleetUpdateRequestAt(Date.now());
    }, []);

    const prepareForRaceSignalHandler = useCallback(() => {
        prepareAudioRef.current.play();
    }, []);

    const makeRaceStartSignalHandler = useCallback(() => {
        actAudioRef.current.play();
    }, []);

    const handleClockTick = useCallback(() => {
        setTimestamp(model.getClock().getTimeToSecondPrecision());
    }, [model]);

    // get races for selected session
    useEffect(() => {
        let ignoreFetch = false;
        model.getRacesBetweenTimesForType(new Date(sessionStart), new Date(sessionEnd), raceType, null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING}).then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load races\n' + result.message);
            }
            else if (!ignoreFetch) {
                const map = new Map();
                const options = []; // html option elements
                const optionsRaceNames = []; // just the names of the races to match with previously selected races
                result.domainObject.forEach(race => {
                    race.clock = model.getClock();
                    map.set(race.name, race);
                    options.push(<option key={race.name + race.plannedStartTime.toISOString()} value={race.name} >{race.name}</option>);
                    optionsRaceNames.push(race.name);
                });
                setRaceMap(map);
                if (selectedRaces.length === 0) {
                    // if no races selected then select all the races as default
                    setSelectedRaces(optionsRaceNames);
                }
                else {
                    setSelectedRaces(s => s.filter(selectedRaceName => optionsRaceNames.includes(selectedRaceName))); // remove any previously selected races that are no longer available from race selectedRaces
                }
            }
        });

        return () => {
            ignoreFetch = true;
            setMessage('');
        }
    }, [model, sessionStart, sessionEnd, raceType, racesUpdateRequestAt, selectedRaces.length]);

    // Setup session start sequence
    useEffect(() => {
        let ignoreFetch = false;
        model.getStartSequence(selectedRaces.map(raceName => raceMap.get(raceName)), raceType).then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load start sequence\n' + result.message);
            }
            else if (!ignoreFetch) {
                sessionStartSequence.current = result.domainObject;
                sessionStartSequence.current.addPrepareForRaceStartSignalHandler(prepareForRaceSignalHandler);
                sessionStartSequence.current.addMakeRaceStartSignalHandler(makeRaceStartSignalHandler);
                setSignals(sessionStartSequence.current.getSignals());
                setMessage('');
            }
        });

        return () => {
            ignoreFetch = true;
            if (sessionStartSequence.current) {
                sessionStartSequence.current.removePrepareForRaceStartSignalHandler(prepareForRaceSignalHandler);
                sessionStartSequence.current.removeMakeRaceStartSignalHandler(makeRaceStartSignalHandler);
                sessionStartSequence.current.dispose();
            }
    }
    }, [model, selectedRaces, raceType, raceMap, racesUpdateRequestAt, fleetUpdateRequestAt, sessionStartSequence, makeRaceStartSignalHandler, prepareForRaceSignalHandler]);

    // register for DinghyRacingModel clock ticks
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
        const races = Array.from(raceMap.values());
        races.forEach(race => {
            model.registerFleetUpdateCallback(race.fleet.url, handleFleetUpdate);
        });
        // cleanup before effect runs and before form close
        return () => {
            races.forEach(race => {
                model.unregisterFleetUpdateCallback(race.fleet.url, handleFleetUpdate);
            });
        }
    }, [model, raceMap, handleFleetUpdate])

    function handleRaceSelect(event) {
        const options = [...event.target.selectedOptions]; // convert from HTMLCollection to Array; trying to go direct to value results in event.target.selectedOptions.value is not iterable error
        setSelectedRaces(options.map(option => option.value));
    }

    function handleSessionStartInputChange(date) {
        setSessionStart(date);
    }

    function handleSessionEndInputChange(date) {
        setSessionEnd(date);
    }

    function handleRaceTypeChange({ target }) {
        setRaceType(RaceType.from(target.value));
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    function buildStartCountdown() {
        if (sessionStartSequence.current) {
            const nextRaceToStart = sessionStartSequence.current.getNextRaceToStart(new Date(timestamp));
            let countdown;
            if (nextRaceToStart) {
                const timeLeft = nextRaceToStart.plannedStartTime.valueOf() - model.getClock().getTimeToSecondPrecision();
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
    }

    return (
        <div className='w3-container console'>
            <CollapsableContainer heading={'Start Races'}>
                <form className='w3-container' >
                    <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handleSessionStartInputChange} onSessionEndChange={handleSessionEndInputChange} />
                    <div className='w3-row'>
                        <fieldset className='w3-third' >
                            <legend>Race Type</legend>
                            <div className='w3-cell-row'>
                                <div className='w3-cell'>
                                    <input id='radio-race-type-fleet' name='race-type' type='radio' value='FLEET' onChange={handleRaceTypeChange} defaultChecked='true'/>
                                    <label htmlFor='radio-race-type-fleet'>Fleet</label>
                                </div>
                                <div className='w3-cell'>
                                    <input id='radio-race-type-pursuit' name='race-type' type='radio' value='PURSUIT' onChange={handleRaceTypeChange} />
                                    <label htmlFor='radio-race-type-pursuit'>Pursuit</label>
                                </div>
                            </div>
                        </fieldset>
                    <label htmlFor='race-select' className='w3-left w3-col' >Select Race</label>
                    <select id='race-select' name='race' multiple={true} className='w3-col w3-third' onChange={handleRaceSelect} value={selectedRaces}>{Array.from(raceMap.values()).map(race => <option key={race.name + race.plannedStartTime.toISOString()} value={race.name} >{race.name}</option>)}</select>
                    </div>
                </form>
                <p className={userMessageClasses()}>{message}</p>
            </CollapsableContainer>
            {buildStartCountdown()}
            <div className='scrollable'>
            <CollapsableContainer heading={'Flags'}>
                <SignalPanel signals={signals} />
            </CollapsableContainer>
            <CollapsableContainer heading={'Races'}>
                {selectedRaces.map(raceName => {
                    const race = raceMap.get(raceName);
                    return <RaceHeaderView key={race.name+race.plannedStartTime.toISOString()} race={race} showInRaceData={false} />
                })}
            </CollapsableContainer>
            <ActionListView signals={signals} clock={model.getClock()} />
            </div>
        </div>
    );
};

export default RaceStartConsole;