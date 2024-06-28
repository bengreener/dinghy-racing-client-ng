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
import { sortArray } from '../../utilities/array-utilities';

class SessionStartSequence {
    _raceStartSequences;
    _actions = [];

    /**
     * Create a new instance of SessionStartSequence
     * @param {Array<Race>} races
     */
    constructor(races, model) {
        this._raceStartSequences = races.map(race => new RaceStartSequence(race, model));
        this._actions = this._generateActions();
    }

    /**
     * Get all flags for this session with their state at the specified time
     * @param {Date} time
     * @returns {Array<Flag>}
     */
    getFlagsAtTime(time) {
        const flags = this._raceStartSequences.flatMap(rss => rss.getFlagsAtTime(time));
        // consolidate flags with the same name
        // raised status has precedence
        const consolidatedFlags = [];
        flags.forEach(flag => {
            if (!consolidatedFlags.some(element => element.name === flag.name)) { // only process new flags
                const newFlag = {...flag};
                for (let i = 0; i < flags.length; i++) {
                    if (newFlag.name === flags[i].name) {
                        if (newFlag.state === FlagState.RAISED || flags[i].state === FlagState.RAISED) {
                            newFlag.state = FlagState.RAISED;
                        }
                    }
                }
                consolidatedFlags.push(newFlag);
            }
        });
        return consolidatedFlags;
    }

    /**
     * Get the flags required to start the race with the next action that needs to be performed for that flag
     * Objects returned have a property flag of type Flag and a property action of type Action
     * @param {Date} time
     * @returns {Array<Object>}
     */
    getFlagsAtTimeWithNextAction(time) {
        const flagsWithNextAction = this.getFlagsAtTime(time).map(flag => {
            const futureActions = [];
            this._actions.forEach(action => {
                if (action.flag.name === flag.name && action.time > time) {
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

    _generateActions() {
        const actions = this._raceStartSequences.flatMap(rss => rss.getActions());
        // consolidate actions the same flag
        // First action with raised after State and last action with lowered after state
        const consolidatedActions = [];
        actions.forEach(action => {
            if (!consolidatedActions.some(element => element.flag.name === action.flag.name && element.afterState === action.afterState)) { // only process new actions
                const newAction = {...action};
                for (let i = 0; i < actions.length; i++) {
                    if (newAction.flag.name === actions[i].flag.name && newAction.afterState === actions[i].afterState) {
                        if (newAction.afterState === FlagState.RAISED) {
                            if (actions[i].time < newAction.time) {
                                newAction.time = actions[i].time;
                            }
                        }
                        if (newAction.afterState === FlagState.LOWERED) {
                            if (actions[i].time > newAction.time) {
                                newAction.time = actions[i].time;
                            }
                        }
                    }
                }
                consolidatedActions.push(newAction);
            }
        });
        return consolidatedActions;
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