import { useState } from 'react';
import SelectSession from './SelectSession';

/**
 * Select races to download results for.
 */
function DownloadRacesForm() {
    const [sessionStart, setSessionStart] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000));
    const [sessionEnd, setSessionEnd] = useState(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));

    return (
        <div>
            <h1>Download Races</h1>
            <SelectSession sessionStart={sessionStart} sessionEnd={sessionEnd} />
        </div>
    );
}

export default DownloadRacesForm;