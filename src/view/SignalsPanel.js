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

import FlagState from '../model/domain-classes/flag-state';
import { useState } from 'react';
import SignalIndicator from './SignalIndicator';

/**
 * Display information about the signals used to start a race or session of races
 * @param {Object} props
 * @param {Array<Signal>} [props.signals]
 * @returns {HTMLDivElement}
 */
function SignalPanel({ signals = [] }) {
    // const orderedSignals = signals.filter(signal => signal.visualSignal).sort((a, b) => a.time.valueOf() - b.time.valueOf());

    // build a map with keyed by flags used and with an order based on timing of first signal using the flags
    const flagsMap = new Map();
    signals.filter(signal => signal.visualSignal).sort((a, b) => a.time.valueOf() - b.time.valueOf()).forEach(signal => {
        // generate a key to avoid issues with matching by reference
        const generateFlagsKey = (flags) => {
            const flagNames = flags.map(flag => flag.name);
            flagNames.sort();
            return flagNames.join('');
        }
        // build map
        const flagsKey = generateFlagsKey(signal.visualSignal.flags);
        if (flagsMap.has(flagsKey)) {
            flagsMap.get(flagsKey).push(signal);
        }
        else {
            flagsMap.set(flagsKey, [signal]);
        }
    });
    

    // group signals by flags used

    return (
        <div>
            {/* {orderedSignals.map(signal => <SignalIndicator key={Math.random()} signals={[signal]} />)} */}
            {Array.from(flagsMap.values()).map(signals => <SignalIndicator key={Math.random()} signals={signals} />)}
        </div>
    );
}

export default SignalPanel;