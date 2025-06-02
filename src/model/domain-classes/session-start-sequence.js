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

import RaceStartSequence from './race-start-sequence';
import FlagState from './flag-state';
import FlagRole from './flag-role';
import { sortArray } from '../../utilities/array-utilities';

class SessionStartSequence {
    _races = [];
    _raceStartSequences = [];
    _signals = [];

    /**
     * Create a new instance of SessionStartSequence
     * @param {Array<Race>} races
     */
    constructor(races) {
        this._races = races;
        this._raceStartSequences = races.map(race => new RaceStartSequence(race));
        this._signals = this._generateSignals(this._raceStartSequences);
    }

    /**
     * Return the next race to start on or after time
     * @param {DateTime} time
     * @returns {Race | null | undefined}
     */
    getNextRaceToStart(time) {
        const upcomingRaces = [];
        this._raceStartSequences.forEach(rss => {
            const race = rss.getNextRaceToStart(time);
            if (race !== null) {
                upcomingRaces.push(race);
            }
        })
        const sorted = upcomingRaces.toSorted((a, b) => a - b);
        return sorted[0];
    }

    /**
     * Get all signals for this session start
     * @returns {Array<Signal>}
     */
    getSignals() {
        return this._signals;
    }

    /**
     * Identify signals required to start races in the session
     * @param {Array<RaceStartSequence>} raceStartSequences
     * @returns {Array<Signal>}
     */
    _generateSignals(raceStartSequences) {
        const sessionSignals = [];
        const flagsMap = new Map();
        // generate a key to avaoid issues with matching by reference
        const generateFlagsKey = (flags) => {
            const flagNames = flags.map(flag => flag.name);
            flagNames.sort();
            return flagNames.join('');
        }
        // collect signals from all races and remove any signals that cannot be made because of conflict with an earlier signal (signals cannot raise flags that are already raised and cannot lower flags that are still required to be raised by another signal)
        raceStartSequences.forEach(rss => {
            rss.getSignals().forEach(signal => {
                // signals with a visual signal need to be checked for conflict between time and flag state for signals using the same flags in the same session
                if (signal.visualSignal) {
                    const flagsKey = generateFlagsKey(signal.visualSignal.flags);
                    if (flagsMap.has(flagsKey)) {
                        flagsMap.get(flagsKey).push(signal);
                    }
                    else {
                        flagsMap.set(flagsKey, [signal]);
                    }
                }
                else {
                    // audio only signals are not expected to conflict
                    sessionSignals.push(signal);
                }
            })
        });
        flagsMap.forEach((signals, key) => {
            if (signals.length > 2) {
                // sort array in ascending order by signal.time and remove conflicting visual signal raise events
                signals.sort((a, b) => {
                    const timeDiff = a.time - b.time;
                    if (timeDiff === 0) {
                        // split a draw
                        if (a.visualSignal.flagsState === FlagState.RAISED) {
                            return -1;
                        }
                        else {
                            return 1;
                        }
                    }
                    return timeDiff;
                });
                for (let i = 0; i < signals.length; i++) {
                    if (signals[i].visualSignal.flagsState === FlagState.RAISED && signals[i + 1].visualSignal.flagsState === FlagState.RAISED) {
                        signals.splice(i + 1, 1);
                    }
                }
                // sort array in descending order by signal.time and remove conflicting visual signal lower events
                signals = signals.sort((a, b) => {
                    const timeDiff = b.time - a.time;
                    if (timeDiff === 0) {
                        // split a draw
                        if (a.visualSignal.flagsState === FlagState.LOWERED) {
                            return -1;
                        }
                        else {
                            return 1;
                        }
                    }
                    return timeDiff;
                });
                for (let i = 0; i < signals.length; i++) {
                    if (signals[i].visualSignal.flagsState === FlagState.LOWERED && signals[i + 1].visualSignal.flagsState === FlagState.LOWERED) {
                        signals.splice(i + 1, 1);
                    }
                }
            }
        });
        // push confirmed signals into session signals list
        flagsMap.forEach(signals => {
            signals.forEach(signal => sessionSignals.push(signal));
        });
        return sessionSignals.sort((a, b) => a.time - b.time);
    }
}

export default SessionStartSequence;