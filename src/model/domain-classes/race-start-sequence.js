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
import RaceType from './race-type';

class RaceStartSequence {
    _race;
    _flags = [];
    _actions = [];
    _model;

    constructor(race, model) {
        this._race = race;
        this._model = model;
        ({flags: this._flags, actions: this._actions} = this._generateFlags(race));
    }

    /**
     * Get all flags for this race start
     * @returns {Array<Flag>}
     */
    getFlags() {
        return this._flags;
    }

    /**
     * Get all flags for this race start with their state at the specified time
     * Calculation is to a precison of 1 second and picks up actions that fall within the second.
     * So a time value of 456 will pick up flags with an action.time in the range 0-999
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
     * Calculation is to a precison of 1 second and picks up actions that fall within the second.
     * So a time value of 456 will pick up flags with an action.time in the range 0-999
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
     * Get the actions required to start the race
     * @returns {Array<Action>}
     */
    getActions() {
        return this._actions;
    }

    /**
     * Identify flags and corresponding actions required to start race  
     * Returns an object with two properties flags, an array of flags, and actions, an array of actions
     * @param {Race} race 
     * @returns {Object}
     */
    _generateFlags(race) {
        const flags = [];
        const actions = []
        let warningFlag;
        if (race.dinghyClass) {
            warningFlag = {name: race.dinghyClass.name + ' Class Flag', role: FlagRole.WARNING, actions: []};
        }
        else {
            warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, actions: []};
        }
        const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};

        const warningFlagRaiseAction = {flag: warningFlag, time: new Date(race.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
        const warningFlagLowerAction = {flag: warningFlag, time: race.plannedStartTime, afterState: FlagState.LOWERED};
        const preparatotyFlagRaiseAction = {flag: preparatoryFlag, time: new Date(race.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
        const preparatotyFlagLowerAction = {flag: preparatoryFlag, time: race.plannedStartTime, afterState: FlagState.LOWERED};

        warningFlag.actions.push(warningFlagRaiseAction);
        warningFlag.actions.push(warningFlagLowerAction);
        preparatoryFlag.actions.push(preparatotyFlagRaiseAction);
        preparatoryFlag.actions.push(preparatotyFlagLowerAction);
        flags.push(warningFlag);
        flags.push(preparatoryFlag);

        actions.push({flag: warningFlag, time: new Date(race.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED});
        actions.push({flag: warningFlag, time: race.plannedStartTime, afterState: FlagState.LOWERED});
        actions.push({flag: preparatoryFlag, time: new Date(race.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED});
        actions.push({flag: preparatoryFlag, time: race.plannedStartTime, afterState: FlagState.LOWERED});

        return {flags: flags, actions: actions};
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