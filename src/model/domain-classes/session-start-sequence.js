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
    _raceStartSequences = [];
    _flags = [];
    _actions = [];

    /**
     * Create a new instance of SessionStartSequence
     * @param {Array<Race>} races
     */
    constructor(races, model) {
        this._raceStartSequences = races.map(race => new RaceStartSequence(race, model));
        // this._actions = this._generateActions();
        ({flags: this._flags, actions: this._actions} = this._generateFlags(this._raceStartSequences));
    }

    /**
     * Get all flags for this race start
     * @returns {Array<Flag>}
     */
    getFlags() {
        return this._flags;
    }

    /**
     * Get all flags for this session with their state at the specified time
     * @param {Date} time
     * @returns {Array<Flag>}
     */
    getFlagsAtTime(time) {
        const truncatedTime = Math.trunc(time.valueOf() / 1000) * 1000;
        const flagsWithState = this._flags.map(flag => {
            const fws = flag;
            const actions = sortArray(fws.actions, action => action.time);
            switch (actions[0].afterState) {
                case FlagState.LOWERED:
                    fws.state = FlagState.RAISED;
                    break;
                default:
                    fws.state = FlagState.LOWERED;
            }
            for(const action of actions) {
                if (Math.trunc(action.time.valueOf() / 1000) * 1000 <= truncatedTime ) { // round off to containing second to identify actions occurring within that second
                    fws.state = action.afterState;
                }
                else {
                    break;
                }
            }
            return fws;
        });
        return flagsWithState;
    }

    /**
     * Get the flags required to start the race with the next action that needs to be performed for that flag
     * Objects returned have a property flag of type Flag and a property action of type Action
     * @param {Date} time
     * @returns {Array<Object>}
     */
    getFlagsAtTimeWithNextAction(time) {
        const truncatedTime = Math.trunc(time.valueOf() / 1000) * 1000;
        const flagsWithNextAction = this.getFlagsAtTime(time).map(flag => {
            const futureActions = [];
            this._actions.forEach(action => {
                if (action.flag.name === flag.name && Math.trunc(action.time.valueOf() / 1000) * 1000 > truncatedTime) { // round off to containing second to identify actions occurring within that second
                    futureActions.push(action);
                }
            });
            return {flag: flag, action: sortArray(futureActions, (action) => action.time)[0]};
        });
        return flagsWithNextAction;
    }

    /**
     * Get the actions required to start races in the session
     * @returns {Array<Action>}
     */
    getActions() {
        return this._actions;
    }

    /**
     * Identify flags and corresponding actions required to start race  
     * Returns an object with two properties flags, an array of flags, and actions, an array of actions
     * @param {Array<RaceStartSequence} raceStartSequences 
     * @returns {Object}
     */
    _generateFlags() {
        const flags = this._raceStartSequences.flatMap(rss => rss.getFlags());
        const actions = this._raceStartSequences.flatMap(rss => rss.getActions());
        // warning flags should be specific to each race
        // the preparatrory flag needs to use the earliest raise action and the last lower action from all race sessions
        // also want all warning flag actions to reference the same instance of flag (doesn't matter which one ;-))
        const newFlags = [];
        const newActions = [];
        let preparatoryFlag;
        let firstPreparatoryFlagRaise;
        let lastPreparatoryFlagLower;
        flags.forEach(flag => {
            switch (flag.role) {
                case FlagRole.PREPARATORY:
                    if (!preparatoryFlag) {
                        // preparatoryFlag = {...flag, actions: []};
                        preparatoryFlag = flag;
                        preparatoryFlag.actions = [];
                        newFlags.push(preparatoryFlag);
                    }
                    break;
                default:
                    // newFlags.push({...flag});
                    newFlags.push(flag);
            }
        });
        actions.forEach(action => {
            switch (action.flag.role) {
                case FlagRole.PREPARATORY:
                    if (action.afterState === FlagState.RAISED && (!firstPreparatoryFlagRaise || action.time < firstPreparatoryFlagRaise.time)) {
                        // firstPreparatoryFlagRaise = {...action, flag: preparatoryFlag};
                        firstPreparatoryFlagRaise = action;
                        firstPreparatoryFlagRaise.flag = preparatoryFlag;
                    }
                    else if (action.afterState === FlagState.LOWERED && (!lastPreparatoryFlagLower || action.time > lastPreparatoryFlagLower.time)) {
                        // lastPreparatoryFlagLower = {...action, flag: preparatoryFlag};
                        lastPreparatoryFlagLower = action;
                        lastPreparatoryFlagLower.flag = preparatoryFlag;
                    }
                    break;
                default:
                    // newActions.push({...action});
                    newActions.push(action);
            }
        });
        if (firstPreparatoryFlagRaise) {
            preparatoryFlag.actions.push(firstPreparatoryFlagRaise);
            newActions.push(firstPreparatoryFlagRaise);
        }
        if (lastPreparatoryFlagLower) {
            preparatoryFlag.actions.push(lastPreparatoryFlagLower);
            newActions.push(lastPreparatoryFlagLower);
        }
        return {flags: newFlags, actions: newActions};
    }

    /**
     * Update the start status of the races in the underlying model
     * @param {Date} time at which to calculate the start status
     */
    updateRaceState(time) {
        this._raceStartSequences.forEach(rss => rss.updateRaceState(time));
    }
}

export default SessionStartSequence;