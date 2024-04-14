import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ModelContext from './ModelContext';
import SelectSession from './SelectSession';
import RaceHeaderView from './RaceHeaderView';
import ActionListView from './ActionListView';
import { sortArray } from '../utilities/array-utilities';
import CollapsableContainer from './CollapsableContainer';
import FlagControl from './FlagControl';

/**
 * Provide Race Officer with information needed to successfully start races in a session
 * @returns {HTMLDivElement}
 */
function RaceStartConsole () {
    const model = useContext(ModelContext);
    const [races, setRaces] = useState([]);
    const [flags, setFlags] = useState([]);
    const [actions, setActions] = useState([]);
    const [message, setMessage] = useState(''); // feedback to user
    const [sessionStart, setSessionStart] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000));
    const [sessionEnd, setSessionEnd] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated
    const startSequence = useRef(null);

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    }, []);

    function handleStartSequenceTick() {
        setFlags(startSequence.current.calculateFlags());
    };

    // get races for selected session
    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceStartConsole rerendered before fetch completes to avoid using out of date result
        model.getStartSequence(new Date(sessionStart), new Date(sessionEnd)).then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load start sequence\n' + result.message);
            }
            else if (!ignoreFetch) {
                setRaces(result.domainObject.getRaces());
                setFlags(result.domainObject.calculateFlags());
                setActions(result.domainObject.getActions());
                if (startSequence.current) {
                    startSequence.current.removeTickHandler();
                }
                startSequence.current = result.domainObject;
                startSequence.current.addTickHandler(handleStartSequenceTick);
            }
        });

        return () => {
            ignoreFetch = true;
            setMessage('');
        }
    }, [model, sessionStart, sessionEnd, racesUpdateRequestAt]);

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

    // create race start actions list
    const actionsMap = new Map();
    actions.forEach(action => {
        if (actionsMap.has(action.time.valueOf())) {
            const oldAction = actionsMap.get(action.time.valueOf());
            actionsMap.set(action.time.valueOf(), {...oldAction, description: oldAction.description + '\n' + action.description});
        }
        else {
            actionsMap.set(action.time.valueOf(), action);
        }
    });

    return (
        <div className="race-start-console">
            <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} onSessionEndChange={handlesessionEndInputChange} />
            <p id="race-console-message" className={!message ? "hidden" : ""}>{message}</p>
            <div>
                <h1>Flags</h1>
                {flags.map(flag => { return <FlagControl key={flag.name} flag={flag} /> })}
            </div>
            <CollapsableContainer heading={'Races'}>
                {races.map(race => {
                    return <RaceHeaderView key={race.name+race.plannedStartTime.toISOString()} race={race} showInRaceData={false} />
                })}
            </CollapsableContainer>
            <ActionListView actions={sortArray(Array.from(actionsMap.values()), (action) => action.time)} />
        </div>
    );
};

export default RaceStartConsole;