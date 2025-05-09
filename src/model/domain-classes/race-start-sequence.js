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
import { sortArray } from '../../utilities/array-utilities';
import RaceType from './race-type';
import StartType from './start-type';

class RaceStartSequence {
    _race;
    _flags = [];
    _actions = [];

    constructor(race) {
        this._race = race;
        ({flags: this._flags, actions: this._actions} = this._generateFlags(race));
    }

    /**
     * Return the next race to start on or after time
     * @param {Date} time
     * @returns {Race | null | undefined}
     */
    getNextRaceToStart(time) {
        return this._race.plannedStartTime >= time ? this._race : null;
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
        const actions = [];
        let warningFlagOffsets;
        let preparatoryFlagOffsets;

        switch (race.startType) {
            case StartType.CSCCLUBSTART:
                warningFlagOffsets = {raise: -600000, lower: 0};
                preparatoryFlagOffsets = {raise: -300000, lower: 0};
                break;
            default:
                warningFlagOffsets = {raise: -300000, lower: 0};
                preparatoryFlagOffsets = {raise: -240000, lower: -60000};
        }

        if (race.type === RaceType.FLEET) {
            let warningFlag;
            warningFlag = {name: race.fleet.name + ' Class Flag', role: FlagRole.WARNING, actions: []};
            
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};

            const warningFlagRaiseAction = {flag: warningFlag, time: new Date(race.plannedStartTime.valueOf() + warningFlagOffsets.raise), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const warningFlagLowerAction = {flag: warningFlag, time: new Date(race.plannedStartTime.valueOf() + warningFlagOffsets.lower), afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(race.plannedStartTime.valueOf() + preparatoryFlagOffsets.raise), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date (race.plannedStartTime.valueOf() + preparatoryFlagOffsets.lower), afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            warningFlag.actions.push(warningFlagRaiseAction);
            warningFlag.actions.push(warningFlagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            flags.push(warningFlag);
            flags.push(preparatoryFlag);

            actions.push(warningFlagRaiseAction);
            actions.push(warningFlagLowerAction);
            actions.push(preparatoryFlagRaiseAction);
            actions.push(preparatoryFlagLowerAction);
        }
        else if (race.type === RaceType.PURSUIT) {
            // get dinghy classes of boats signed up to race and sort in PN order
            const sortedDinghyClasses = sortArray(race.dinghyClasses, (dinghyClass => dinghyClass.portsmouthNumber), true);
            // first flag for the race is going to be for the slowest class in the races fleet
            const baseClass = sortArray(race.fleet.dinghyClasses, (dinghyClass => dinghyClass.portsmouthNumber), true)[0];
            if (!sortedDinghyClasses.some(dc => dc.name === baseClass.name)) {
                sortedDinghyClasses.unshift(baseClass);
            };
            const basePN = sortedDinghyClasses[0].portsmouthNumber;
            const baseDuration = race.duration;
            for(let i = 0; i < sortedDinghyClasses.length; i++) {
                if (i === 0) {
                    // setup starting flags for first dinghy class
                    const warningFlag = {name: sortedDinghyClasses[i].name + ' Class Flag', role: FlagRole.WARNING, actions: []};
                    const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};

                    const warningFlagRaiseAction = {flag: warningFlag, time: new Date(race.plannedStartTime.valueOf() + warningFlagOffsets.raise), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
                    const warningFlagLowerAction = {flag: warningFlag, time: new Date(race.plannedStartTime.valueOf() + warningFlagOffsets.lower), afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
                    const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(race.plannedStartTime.valueOf() + preparatoryFlagOffsets.raise), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
                    const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(race.plannedStartTime.valueOf() + preparatoryFlagOffsets.lower), afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

                    warningFlag.actions.push(warningFlagRaiseAction);
                    warningFlag.actions.push(warningFlagLowerAction);
                    preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                    preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                    flags.push(warningFlag);
                    flags.push(preparatoryFlag);

                    actions.push(warningFlagRaiseAction);
                    actions.push(warningFlagLowerAction);
                    actions.push(preparatoryFlagRaiseAction);
                    actions.push(preparatoryFlagLowerAction);
                }
                else {
                    // set up start signals for subsequent dinghy classes
                    const warningFlag = {name: sortedDinghyClasses[i].name + ' Class Flag', role: FlagRole.WARNING, actions: []};

                    let offset = Math.ceil((baseDuration - ((baseDuration * sortedDinghyClasses[i].portsmouthNumber) / basePN)) / 1000) * 1000; // round to the nearest second as this is the precision we are working with

                    const warningFlagRaiseAction = {flag: warningFlag, time: new Date(race.plannedStartTime.valueOf() + offset - 60000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: false, signalRaceStartStateChange: false};
                    const warningFlagLowerAction = {flag: warningFlag, time: new Date(race.plannedStartTime.valueOf() + offset), afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

                    warningFlag.actions.push(warningFlagRaiseAction);
                    warningFlag.actions.push(warningFlagLowerAction);
                    flags.push(warningFlag);

                    actions.push(warningFlagRaiseAction);
                    actions.push(warningFlagLowerAction);
                }
            }
        }
        return {flags: flags, actions: actions};
    }
}

export default RaceStartSequence;