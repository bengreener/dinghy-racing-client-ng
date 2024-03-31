import React, { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import SelectSession from './SelectSession';
import Clock from '../model/domain-classes/clock';
import SortOrder from '../model/dinghy-racing-model';
import FlagsControl from './FlagsControl';

function RaceStartConsole () {
    const model = useContext(ModelContext);
    const [raceArray, setRaceArray] = useState([]);
    const [message, setMessage] = useState(''); // feedback to user
    const [sessionStart, setSessionStart] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000));
    const [sessionEnd, setSessionEnd] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));

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
    // }, [model, sessionStart, sessionEnd, racesUpdateRequestAt]);
}, [model, sessionStart, sessionEnd]);

    function handlesessionStartInputChange(date) {
        setSessionStart(date);
    }

    function handlesessionEndInputChange(date) {
        setSessionEnd(date);
    }

    return (
        <div className="race-console">
            <div className="select-race">
                <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} onSessionEndChange={handlesessionEndInputChange} />
                <FlagsControl races={raceArray} />
            <p id="race-console-message" className={!message ? "hidden" : ""}>{message}</p>
            </div>
        </div>
    );
};

export default RaceStartConsole;