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

// import { useEffect, useState } from 'react';

/**
 * 
 * @param {Object} props
 * @param {SynchronousEntry} props.entry 
 * @param {Boolean} props.showCrew 
 * @param {Function} props.onSelected 
 * @param {Function} props.onWithdraw
 * @returns 
 */
function EntryTableRow({entry, showCrew, onSelected, onWithdraw}) {

    function handleRowClick(event) {
        event.preventDefault();
        event.stopPropagation();
        if (onSelected) {
            onSelected(entry);
        }        
    }

    function handleWithdrawEntryButtonClick(event) {
        event.preventDefault();
        event.stopPropagation();
        if (onWithdraw) {
            onWithdraw(entry);
        }
    };

    return (
        <tr onClick={handleRowClick} >
            <td>{entry.helm.name}</td>
            <td>{entry.dinghy.sailNumber}</td>
            <td>{entry.dinghy.dinghyClass.name}</td>
            {showCrew ? <td>{entry.crew?.name}</td> : null}
            <td key='onWithdraw-button'><button id={entry.url} className='embedded' type='button' onClick={handleWithdrawEntryButtonClick}>X</button></td>
        </tr>
    )
}

export default EntryTableRow;