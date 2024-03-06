import { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import SelectSession from './SelectSession';

/**
 * Select races to download results for.
 */
function DownloadRacesForm() {
    const model = useContext(ModelContext);
    const [sessionStart, setSessionStart] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000));
    const [sessionEnd, setSessionEnd] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));
    const [races, setRaces] = useState([]);
    // const [message, setMessage] = useState(''); // feedback to user

    function handlesessionStartInputChange(date) {
        setSessionStart(date);
    }

    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceConsole rerendered before fetch completes to avoid using out of date result
        model.getRacesBetweenTimes(sessionStart, sessionEnd).then(result => {
            if (!ignoreFetch && !result.success) {
                // setMessage('Unable to load races\n' + result.message);
            }
            else if (!ignoreFetch) {
                setRaces(result.domainObject);
            }
        });

        return () => {
            ignoreFetch = true;
            // setMessage('');
        }
    }, [model, sessionStart, sessionEnd]);

    return (
        <div>
            <h1>Download Races</h1>
            <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} onSessionStartChange={handlesessionStartInputChange} />
            {/* <p id="race-console-message" className={!message ? "hidden" : ""}>{message}</p> */}
        </div>
    );
}

export default DownloadRacesForm;