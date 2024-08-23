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
import FlagControl from './FlagControl';
import RaceType from '../model/domain-classes/race-type';
import Clock from '../model/domain-classes/clock';

/**
 * Provide Race Officer with information needed to successfully start races in a session
 * @returns {HTMLDivElement}
 */
function RaceStartConsole () {
    const model = useContext(ModelContext);
    const [races, setRaces] = useState([]);
    const [flagsWithNextAction, setFlagsWithNextAction] = useState([]);
    const [actions, setActions] = useState([]);
    const [message, setMessage] = useState(''); // feedback to user
    const [sessionStart, setSessionStart] = useState(() => {
        const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
        sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
        return sessionStart;
    });
    const [sessionEnd, setSessionEnd] = useState(() => {
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000); // create as 18:00 UTC intially
        sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        return sessionEnd;
    });
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated
    const [audio, setAudio] = useState('none');
    const [raceType, setRaceType] = useState(RaceType.FLEET);
    const startSequence = useRef(null);

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    }, []);

    const handleStartSequenceTick = useCallback(() => {
        setFlagsWithNextAction(startSequence.current.getFlags());
        if (startSequence.current.getRaceStartStateChange()) {
            setAudio('act');
        }
        else if (startSequence.current.getPrepareForRaceStartStateChange()) {
            setAudio('prepare');
        }
        else {
            setAudio('none');
        }
    }, []);

    // get start sequence for selected session
    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceStartConsole rerendered before fetch completes to avoid using out of date result
        model.getStartSequence(new Date(sessionStart), new Date(sessionEnd), raceType).then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load start sequence\n' + result.message);
            }
            else if (!ignoreFetch) {
                startSequence.current = result.domainObject;
                startSequence.current.addTickHandler(handleStartSequenceTick);
                startSequence.current.startClock();
                setRaces(startSequence.current.getRaces());
                setFlagsWithNextAction(startSequence.current.getFlags());
                setActions(startSequence.current.getActions());
                if (startSequence.current.getRaceStartStateChange()) {
                    setAudio('act');
                }
                else if (startSequence.current.getPrepareForRaceStartStateChange()) {
                    setAudio('prepare');
                }
                else {
                    setAudio('none');
                }
            }
            setMessage('');
        });

        return () => {
            ignoreFetch = true;
            if (startSequence.current) {
                startSequence.current.removeTickHandler(handleStartSequenceTick);
                startSequence.current.dispose();
                startSequence.current = null;
            }
        }
    }, [model, sessionStart, sessionEnd, raceType, racesUpdateRequestAt, handleStartSequenceTick]);

    // register on update callbacks for races
    useEffect(() => {
        races.forEach(race => {
            model.registerRaceUpdateCallback(race.url, handleRaceUpdate);
        });
        // cleanup before effect runs and before form close
        return () => {
            races.forEach(race => {
                model.unregisterRaceUpdateCallback(race.url, handleRaceUpdate);
            });
        }
    }, [model, races, handleRaceUpdate])

    function handlesessionStartInputChange(date) {
        setSessionStart(date);
    }

    function handlesessionEndInputChange(date) {
        setSessionEnd(date);
    }

    function handleRaceTypeChange({ target }) {
        setRaceType(RaceType.from(target.value));
    }

    return (
        <div className="race-start-console">
            <div className="select-race">
                <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} onSessionEndChange={handlesessionEndInputChange} />
                <div>
                    <fieldset>
                        <legend>Race Type</legend>
                        <input id="radio-race-type-fleet" name="race-type" type="radio" value="FLEET" onChange={handleRaceTypeChange} defaultChecked="true"/>
                        <label htmlFor="radio-race-type-fleet">Fleet</label>
                        <input id="radio-race-type-pursuit" name="race-type" type="radio" value="PURSUIT" onChange={handleRaceTypeChange} />
                        <label htmlFor="radio-race-type-pursuit">Pursuit</label>
                    </fieldset>
                </div>
            </div>
            <p id="race-console-message" className={!message ? "hidden" : ""}>{message}</p>
            <CollapsableContainer heading={'Flags'}>
                {flagsWithNextAction.map(flag => { return <FlagControl key={flag.flag.name} flag={flag.flag} timeToChange={flag.action ? flag.action.time.valueOf() - Clock.now() : 0} /> })} {/* use Clock.now to get adjusted time when synched to an external clock */}
            </CollapsableContainer>
            <CollapsableContainer heading={'Races'}>
                {races.map(race => {
                    return <RaceHeaderView key={race.name+race.plannedStartTime.toISOString()} race={race} showInRaceData={false} />
                })}
            </CollapsableContainer>
            <ActionListView actions={actions} />
            {audio === 'prepare' ? <audio data-testid='prepare-sound-warning-audio' autoPlay={true} src='./sounds/prepare_alert.mp3' /> : null}
            {audio === 'act' ? <audio data-testid='act-sound-warning-audio' autoPlay={true} src='./sounds/act_alert.mp3' /> : null}
        </div>
    );
};

export default RaceStartConsole;