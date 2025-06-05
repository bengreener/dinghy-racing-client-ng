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
    _prepareForRaceStartSignalHandlers = new Map();
    _makeRaceStartSignalHandlers = new Map();

    /**
     * Create a new instance of SessionStartSequence
     * @param {Array<Race>} races
     */
    constructor(races, clock) {
        this.prepareForRaceStartSignalHandler = this.prepareForRaceStartSignalHandler.bind(this);
        this.makeRaceStartSignalHandler = this.makeRaceStartSignalHandler.bind(this);
        this._races = races;
        this._raceStartSequences = races.map(race => {
            const rss = new RaceStartSequence(race, clock);
            rss.addPrepareForRaceStartSignalHandler(this.prepareForRaceStartSignalHandler);
            rss.addMakeRaceStartSignalHandler(this.makeRaceStartSignalHandler);
            return rss;
        });
        this._signals = this._generateSignals(this._raceStartSequences);
    }

    prepareForRaceStartSignalHandler() {
        if (this._prepareForRaceStartSignalHandlers.size > 0) {
            this._prepareForRaceStartSignalHandlers.forEach(callback => callback());
        }
    }

    makeRaceStartSignalHandler() {
        if (this._makeRaceStartSignalHandlers.size > 0) {
            this._makeRaceStartSignalHandlers.forEach(callback => callback());
        }
    }

    /**
     * Add a function to handle prepareForRaceStartSignal events
     * @param {callback} callback
     */
    addPrepareForRaceStartSignalHandler(callback) {
        this._prepareForRaceStartSignalHandlers.set(callback, callback);
    }

    /**
     * Remove a function handling prepareForRaceStartSignal events
     */
    removePrepareForRaceStartSignalHandler(callback) {
        this._prepareForRaceStartSignalHandlers.delete(callback);
    }

    /**
     * Add a function to handle makeRaceStartSignal events
     * @param {callback} callback
     */
    addMakeRaceStartSignalHandler(callback) {
        this._makeRaceStartSignalHandlers.set(callback, callback);
    }

    /**
     * Remove a function handling makeRaceStartSignal events
     */
    removeMakeRaceStartSignalHandler(callback) {
        this._makeRaceStartSignalHandlers.delete(callback);
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
                // sort array in ascending order by signal.time and remove signals where visual signals conflict (raise and lower same visual signal at same time)
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
                for (let i = 0; i < signals.length - 1; i++) {
                    // remove signals that use the same visual signal and occur at the same time but, have conflicting flag states
                    if (signals[i].time.valueOf() === signals[i + 1].time.valueOf()) {
                        const timestamp = signals[i].time.valueOf();
                        const raiseSignals = signals.filter(signal => signal.visualSignal.flagsState === FlagState.RAISED && signal.time.valueOf() === timestamp);
                        const lowerSignals = signals.filter(signal => signal.visualSignal.flagsState === FlagState.LOWERED && signal.time.valueOf() === timestamp);
                        if (raiseSignals.length === lowerSignals.length) {
                            // all signals cancel out, remove them all (this is the expected result)
                            signals.splice(i, raiseSignals.length + lowerSignals.length);
                            i--;
                        }
                        else if (raiseSignals.length > lowerSignals.length) {
                            // more raise than lower signals, raise signal (should this ever happen?)
                            signals.splice(i, raiseSignals.length + lowerSignals.length, raiseSignals[0]);
                        }
                        else if (raiseSignals.length < lowerSignals.length) {
                            // more lower signals than raise signals, lower signal (should this ever happen?)
                            signals.splice(i, raiseSignals.length + lowerSignals.length, lowerSignals[0]);
                        }
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

    /**
     * Clean up resources used by RaceStartSequence
     */
    dispose() {
        this._raceStartSequences.forEach(rss => {
            rss.removePrepareForRaceStartSignalHandler(this.prepareForRaceStartSignalHandler);
            rss.removeMakeRaceStartSignalHandler(this.makeRaceStartSignalHandler);
            rss.dispose();
        });
    }
}

export default SessionStartSequence;