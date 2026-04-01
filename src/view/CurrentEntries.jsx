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

import { useCallback, useEffect, useState } from 'react';
import EntriesSummary from './EntriesSummary';
import EntryTableRow from './EntryTableRow';
import { buildSynchronousEntries, buildSynchronousRace } from './synchronous-model/synchronous-model';

/**
 * 
 * @param {Object} props
 * @param {Race} props.race
 * @param {Function} onEntrySelected
 * @returns {HTMLDivElement}
 */
function CurrentEntries({ race, onEntrySelected, onWithdrawEntry }) {
    const [entriesMap, setEntriesMap] = useState(new Map());
    const [synchRace, setSynchRace] = useState();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [raceUpdateTime, setRaceUpdateTime] = useState();

    const handleRaceUpdate = useCallback(() => {
        setRaceUpdateTime(Date.now());
    }, []);

    const handleEntryUpdate = useCallback(() => {
        setRaceUpdateTime(Date.now());
    }, []);

    // setup entries
    useEffect(() => {
        let cancel = false;
        if (!cancel) {
            const synchRacePromise = buildSynchronousRace(race);
            const bsePromise = buildSynchronousEntries([race]).then(entries => {
                const eMap = new Map();
                entries.map(entry => {
                    eMap.set(entry.url, entry);
                });
                return eMap;
            });
            Promise.all([synchRacePromise, bsePromise]).then(results => {
                setSynchRace(results[0]);
                setEntriesMap(results[1]);
            }).catch((error) => {
                console.error(error.message, error);
                if (error.message.trim() === 'HTTP Error: 404') {
                    setMessage('');
                }
                else {
                    setMessage(error.message);
                }
            }).finally(() => {
                setLoading(false);
            });
        }
        return () => {
            cancel = true;
        }
    }, [race, raceUpdateTime]);

    // register for race updates
    useEffect(() => {
        race.registerEntryCreationCallback(handleEntryUpdate);
        race.registerRaceUpdateCallback(handleRaceUpdate);

        return(() => {
            race.unregisterEntryCreationCallback(handleEntryUpdate);
            race.unregisterRaceUpdateCallback(handleRaceUpdate);
        });
    }, [race, handleEntryUpdate, handleRaceUpdate]);

    // register for entry updates
    useEffect(() => {
        entriesMap.forEach(entry => {
            entry.registerEntryDeletionCallback(handleEntryUpdate);
            entry.registerEntryUpdateCallback(handleEntryUpdate);
        });

        return(() => {
            entriesMap.forEach(entry => {
                entry.unregisterEntryDeletionCallback(handleEntryUpdate);
                entry.unregisterEntryUpdateCallback(handleEntryUpdate);
            });
        })
    }, [entriesMap, handleEntryUpdate]);

    function getRows() {
        // build table rows
        const rows = Array.from(entriesMap.values()).map(entry => {
            return <EntryTableRow key={entry.url} entry={entry} showCrew={(!race.dinghyClass || race.dinghyClass.crewSize > 1) } onSelected={handleSelected} onWithdraw={handleWithdraw} />
        });
        return rows;
    }

    /**
     * 
     * @param {SynchronousEntry} entry 
     */
    function handleSelected(entry) {
        if (onEntrySelected) {
            onEntrySelected(entry.entry);
        }
    }

    /**
     * 
     * @param {SynchronousEntry} entry 
     */
    function handleWithdraw(entry) {
        if (onWithdrawEntry) {
            onWithdrawEntry(entry.entry);
        }
    }

    if (loading) {
        return (
            <div className='loader' ></div>
        )
    }

    return (
        <div>
            <p>{message}</p>
            <table className='current-entries w3-table w3-striped'>
                <thead>
                    <tr>
                        <th key='helm'>Helm</th>
                        <th key='sailNumber'>Sail Number</th>
                        <th key='dinghyClass'>Class</th>
                        {synchRace.includesCrewedDinghies ? <th key='crew'>Crew</th> : null}
                        <th key='withdrawEntry-button'></th>
                    </tr>
                </thead>
                <tbody>
                    {getRows()}
                </tbody>
            </table>
            <h4>Summary</h4>
            <EntriesSummary entries={Array.from(entriesMap.values())} />
        </div>        
    )
}

export default CurrentEntries;