import React, { useContext, useEffect, useState } from 'react';
import ModelContext from './ModelContext';
import RaceEntryView from './RaceEntryView';

function RaceEntriesView({race}) {
    const model = useContext(ModelContext);
    const [entries, setEntries] = useState([]);
    const [message, setMessage] = useState('');

    // get entries
    useEffect(() => {
        model.getEntriesByRace(race).then(result => {
            if (!result.success) {
                setMessage('Unable to load entries\n' + result.message);
            }
            else {
                setEntries(result.domainObject);
            }
        })
    })

    return (
        <table id="race-entries-table">
            <tbody>
            {entries.map(entry => <RaceEntryView entry={entry} />)}
            </tbody>
        </table>
    );
}

export default RaceEntriesView;