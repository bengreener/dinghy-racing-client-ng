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

import { useEffect, useState } from 'react';
import { buildSynchronousDinghy } from './synchronous-model/synchronous-model';

function PreviousEntries({ sailNumber, dinghyClasses, model, onSelectPreviousEntry }) {
    const [loading, setLoading] = useState(true);
    const [previousEntriesMap, setPreviousEntriesMap] = useState(new Map());

    useEffect(() => {
        const updatePreviousEntries = async () => {
            const peMap = new Map();
            try {
                if (sailNumber != "") {
                    const dinghyResults = await Promise.allSettled(dinghyClasses.map(dinghyClass => {return model.getDinghyBySailNumberAndDinghyClass(sailNumber, dinghyClass)}));
                    // filter out results where no dinghy found with sail number in class
                    const filteredDinghies = dinghyResults.filter(result => result.status === 'fulfilled').map(result => result.value);
                    const synchronousDinghies = await Promise.all(filteredDinghies.map(dinghy => {
                        return buildSynchronousDinghy(dinghy);
                    }));
                    const crewCollections = await Promise.all(filteredDinghies.map(dinghy => dinghy.getCrews()));
                    for (let i = 0; i < synchronousDinghies.length; i++) {
                        for (const crew of crewCollections[i].entities) {
                            peMap.set(synchronousDinghies[i].url + crew.helm.url + crew?.mate?.url, {dinghy: synchronousDinghies[i], dinghyClass: synchronousDinghies[i].dinghyClass, crew: crew});
                        }
                    }    
                }
            }
            catch(error) {
                console.error(error.message, error);
            }
            return peMap;
        }

        let cancel = false;
        updatePreviousEntries().then(resultMap => {
            setLoading(false);
            if (!cancel) {
                setPreviousEntriesMap(resultMap);
            }
        });

        return(() => {
            cancel = true;
            setLoading(false);
        });
    }, [sailNumber, dinghyClasses, model]);

    function handleRowClick({ currentTarget }) {
        if (onSelectPreviousEntry) {
            onSelectPreviousEntry(previousEntriesMap.get(currentTarget.id));
        }
    }

    function previousEntriesRows() {
        const rows = [];
        previousEntriesMap.forEach((value, key) => {
            rows.push(
                <tr key={key} id={key} className='clickable-table-row' onClick={handleRowClick} >
                    <td key={value.dinghyClass.url}>{value.dinghyClass.name}</td>
                    <td key={value.crew.helm.name}>{value.crew.helm.name}</td>
                    <td key={value.crew?.mate?.name}>{value.crew?.mate?.name}</td>
                </tr>
            );
        });
        return rows;
    }

    if (loading) {
        return (
            <div className='small-loader'></div>
        )
    }
    
    return (
        <div data-testid='previous-entries'>
            <table className='w3-table w3-striped'>
                <thead>
                <tr>
                    <th>Class</th>
                    <th>Helm</th>
                    <th>Crew</th>
                </tr>
                </thead>
                <tbody>
                    {previousEntriesRows()}
                </tbody>
            </table>
        </div>
    )
}

export default PreviousEntries;