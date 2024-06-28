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

import FlagRole from './flag-role';
import FlagState from './flag-state';
import StartSignal from './start-signal';
import { sortArray } from '../../utilities/array-utilities';

class RaceStartSequence {
    _race;
    _flags = [];
    _actions = [];
    _model;

    constructor(race, model) {
        this._race = race;
        this._model = model;
        if (race.dinghyClass) {
            this._flags.push({name: race.dinghyClass.name + ' Class Flag', role: FlagRole.WARNING});
        }
        else {
            this._flags.push({name: 'Club Burgee', role: FlagRole.WARNING});
        }
        this._flags.push({name: 'Blue Peter', role: FlagRole.PREPARATORY});
        this._actions = this._generateActions();
    }

    /**
     * Get all flags for this race start with their state at the specified time
     * @param {Date} time
     * @returns {Array<Flag>}
     */
    getFlagsAtTime(time) {
        const flagsWithState = this._flags.map(flag => {
            let fws = {};
            switch (flag.role) {
                case FlagRole.WARNING:
                    if (time.valueOf() < this._race.plannedStartTime.valueOf() - 600000) {
                        fws = {...flag, state: FlagState.LOWERED};
                        break;
                    }
                    else if (time.valueOf() < this._race.plannedStartTime.valueOf()) {
                        fws = {...flag, state: FlagState.RAISED};
                        break;
                    }
                    else {
                        fws = {...flag, state: FlagState.LOWERED};
                        break;
                    }
                case FlagRole.PREPARATORY:
                    if (time.valueOf() < this._race.plannedStartTime.valueOf() - 300000) {
                        fws = {...flag, state: FlagState.LOWERED};
                        break;
                    }
                    else 
                    if (time.valueOf() < this._race.plannedStartTime.valueOf()) {
                        fws = {...flag, state: FlagState.RAISED};
                        break;
                    }
                    else {
                        fws = {...flag, state: FlagState.LOWERED};
                        break;
                    }
                default:
                    if (time.valueOf() < this._race.plannedStartTime.valueOf() - 600000) {
                        fws = {...flag, state: FlagState.LOWERED};
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
     * Get the actions required to start the race
     * @returns {Array<Action>}
     */
    getActions() {
        return this._actions;
    }

    _generateActions() {
        const actions = [];
        this._flags.forEach(flag => {
            switch (flag.role) {
                case FlagRole.WARNING:
                    actions.push({flag: flag, time: new Date(this._race.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED});
                    actions.push({flag: flag, time: this._race.plannedStartTime, afterState: FlagState.LOWERED});
                    break;
                case FlagRole.PREPARATORY:
                    actions.push({flag: flag, time: new Date(this._race.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED});
                    actions.push({flag: flag, time: this._race.plannedStartTime, afterState: FlagState.LOWERED});
                    break;
                default:
            }
        });
        return actions;
    }

    /**
     * Update the start status of the race in the underlying model
     * @param {Date} time at which to calculate the start status
     */
    updateRaceState(time) {
        if (time.valueOf() === this._race.plannedStartTime.valueOf() - 600000) {
            this._model.updateRaceStartSequenceState(this._race, StartSignal.WARNINGSIGNAL);
        }
        else if (time.valueOf() === this._race.plannedStartTime.valueOf() - 300000) {
            this._model.updateRaceStartSequenceState(this._race, StartSignal.PREPARATORYSIGNAL);
        }
        else if (time.valueOf() === this._race.plannedStartTime.valueOf()) {
            this._model.updateRaceStartSequenceState(this._race, StartSignal.STARTINGSIGNAL);
        }
    }
}

export default RaceStartSequence;