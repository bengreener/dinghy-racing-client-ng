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

/**
 * 
 * @param {Object} props
 * @param {Array<SynchronousEntry>} props.entries
 * @returns {HTMLTableElement}
 */
function EntriesSummaryTable({ entries }) {
    const entriesSummary = new Map();
    const rows = [];
    let totalEntries = 0;

    entries.forEach(entry => {
        if (entriesSummary.has(entry.dinghy.dinghyClass.name)) {
            entriesSummary.set(entry.dinghy.dinghyClass.name, entriesSummary.get(entry.dinghy.dinghyClass.name) + 1);
        }
        else {
            entriesSummary.set(entry.dinghy.dinghyClass.name, 1);
        }
    });

    // for (const [key, value] of entriesSummary) {
    //     totalEntries += value;
    //     rows.push(<tr key={key} >
    //             <td key={`class-${key}`}>{key}</td>
    //             <td key={`no-entries-${key}`}>{value}</td>
    //         </tr>
    //     );
    // }
    Array.from(entriesSummary.keys()).sort().forEach(key => {
        const value = entriesSummary.get(key);
        totalEntries += value;
        rows.push(<tr key={key} >
            <td key={`class-${key}`}>{key}</td>
            <td key={`no-entries-${key}`}>{value}</td>
        </tr>);
    });

    rows.push(
        <tr key='total' >
            <td key='total-entries'>Total Entries</td>
            <td key='total-sum'>{totalEntries}</td>
        </tr>
    );

    return (
        <table className='entries-summary w3-table w3-striped'>
            <thead>
                <tr>
                    <th key='dinghyClass'>Class</th>
                    <th key='number'># entries</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    );
}

export default EntriesSummaryTable;