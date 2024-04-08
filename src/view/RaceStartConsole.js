import React, { useCallback, useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import SelectSession from './SelectSession';
import Clock from '../model/domain-classes/clock';
import SortOrder from '../model/dinghy-racing-model';
import FlagsControl from './FlagsControl';
import RaceHeaderView from './RaceHeaderView';
import ActionListView from './ActionListView';
import { sortArray } from '../utilities/array-utilities';
import CollapsableContainer from './CollapsableContainer';

/**
 * Provide Race Officer with information needed to successfully start races in a session
 * @returns {HTMLDivElement}
 */
function RaceStartConsole () {
    const model = useContext(ModelContext);
    const [raceArray, setRaceArray] = useState([]);
    const [message, setMessage] = useState(''); // feedback to user
    const [sessionStart, setSessionStart] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000));
    const [sessionEnd, setSessionEnd] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));
    const [racesUpdateRequestAt, setRacesUpdateRequestAt] = useState(Date.now()); // time of last request to fetch races from server. change triggers a new fetch; for instance when server notifies a race has been updated

    const handleRaceUpdate = useCallback(() => {
        setRacesUpdateRequestAt(Date.now());
    }, []);

    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceStartConsole rerendered before fetch completes to avoid using out of date result
        model.getRacesBetweenTimes(new Date(sessionStart), new Date(sessionEnd), null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING}).then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load races\n' + result.message);
            }
            else if (!ignoreFetch) {
                result.domainObject.forEach(race => {
                    race.clock = new Clock(race.plannedStartTime);
                });
                setRaceArray(result.domainObject);
            }
        });

        return () => {
            ignoreFetch = true;
            setMessage('');
        }
    }, [model, sessionStart, sessionEnd, racesUpdateRequestAt]);

    // register on update callbacks for races
    useEffect(() => {
        raceArray.forEach(race => {
            model.registerRaceUpdateCallback(race.url, handleRaceUpdate);
        });
        // cleanup before effect runs and before form close
        return () => {
            raceArray.forEach(race => {
                model.unregisterRaceUpdateCallback(race.url, handleRaceUpdate);
            });
        }
    }, [model, raceArray, handleRaceUpdate])

    function handlesessionStartInputChange(date) {
        setSessionStart(date);
    }

    function handlesessionEndInputChange(date) {
        setSessionEnd(date);
    }

    // create race start actions list
    const actionsMap = new Map();
    let actions = [];
    raceArray.forEach(race => {
        // raise warning flag
        actions.push({time: new Date(race.plannedStartTime.valueOf() - 600000), description: 'Raise warning flag for ' + race.name});
        // lower warning flag
        actions.push({time: race.plannedStartTime, description: 'Lower warning flag for ' + race.name});
    })
    if (raceArray.length > 0) {
        // raise blue peter
        actions.push({time: new Date(raceArray[0].plannedStartTime.valueOf() - 300000), description: 'Raise blue peter'});
        // lower blue peter
        actions.push({time: raceArray[raceArray.length - 1].plannedStartTime, description: 'Lower blue peter'});
    }
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
                <FlagsControl races={raceArray} />
            </div>
            <CollapsableContainer heading={'Races'}>
                {raceArray.map(race => {
                    return <RaceHeaderView key={race.name+race.plannedStartTime.toISOString()} race={race} showInRaceData={false} />
                })}
            </CollapsableContainer>
            <ActionListView actions={sortArray(Array.from(actionsMap.values()), (action) => action.time)} />
        </div>
    );
};

export default RaceStartConsole;