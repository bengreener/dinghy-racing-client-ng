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

import { useState } from 'react';
import SignUpForm from './SignUpForm';
import CurrentEntries from './CurrentEntries';

function SignUpConsole({ race, model, controller }) {
    const [selectedEntry, setSelectedEntry] = useState();
    
    function handleEntrySelected(entry) {
        setSelectedEntry(entry);
    }

    return (
        <div className='sign-up-console w3-container console'>
            <h1>{race.name}</h1>
            <SignUpForm race={race} model={model} entry={selectedEntry} onCreateCompetitor={controller.createCompetitor} 
                onCreateDinghy={controller.createDinghy} onSignUp={controller.signUpToRace} onUpdate={controller.updateEntry} onEmbeddedSignUp={controller.signUpToEmbeddedRace} 
                onWithdrawEmbeddedSignUp={controller.withdrawEmbeddedSignUp} />
            <h3>Signed-up</h3>
            <CurrentEntries race={race} model={model} onEntrySelected={handleEntrySelected} onWithdrawEntry={controller.withdrawEntry} />
        </div>
    )
}

export default SignUpConsole;