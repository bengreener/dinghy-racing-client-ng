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

import FlagState from './flag-state';
import { sortArray } from '../../utilities/array-utilities';
import RaceType from './race-type';
import StartType from './start-type';
import Signal from './signal';

class RaceStartSequence {
    _race;
    _signals = [];

    constructor(race) {
        this._race = race;
        this._signals = this._generateSignals(race);
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
     * Get all signals for this race start
     * @returns {Array<Signal>}
     */
    getSignals() {
        return this._signals;
    }

    /**
     * Identify signals required to start race
     * @param {Race} race 
     * @returns {Array<Signal}
     */
    _generateSignals(race) {
        const signals = [];
        let classSignalOffsets;
        let preparatorySignalOffsets;
        let preparatorySignalLowerMeaning;
        let preparatorySignalLowerSoundSignal;

        switch (race.startType) {
            case StartType.CSCCLUBSTART:
                classSignalOffsets = {raise: -600000, lower: 0};
                preparatorySignalOffsets = {raise: -300000, lower: 0};
                preparatorySignalLowerMeaning = 'Start sequence finished';
                preparatorySignalLowerSoundSignal = null;
                break;
            default:
                classSignalOffsets = {raise: -300000, lower: 0};
                preparatorySignalOffsets = {raise: -240000, lower: -60000};
                preparatorySignalLowerMeaning = 'One minute';
                preparatorySignalLowerSoundSignal = {description: 'One long'};
        }

        // if (race.type === RaceType.FLEET) {
            const warningFlag = {name: race.fleet.name + ' Class Flag'};
            const preparatoryFlag = {name: 'Blue Peter'};

            signals.push({meaning: 'Warning signal', time: new Date(race.plannedStartTime.valueOf() + classSignalOffsets.raise), soundSignal: {description: 'One'}, visualSignal: {flags: [warningFlag], flagsState: FlagState.RAISED}});
            signals.push({meaning: 'Preparatory signal', time: new Date(race.plannedStartTime.valueOf() + preparatorySignalOffsets.raise), soundSignal: {description: 'One'}, visualSignal: {flags: [preparatoryFlag], flagsState: FlagState.RAISED}});
            signals.push({meaning: preparatorySignalLowerMeaning, time: new Date(race.plannedStartTime.valueOf() + preparatorySignalOffsets.lower), soundSignal: preparatorySignalLowerSoundSignal, visualSignal: {flags: [preparatoryFlag], flagsState: FlagState.LOWERED}});
            signals.push({meaning: 'Starting signal', time: new Date(race.plannedStartTime.valueOf()), soundSignal: {description: 'One'}, visualSignal: {flags: [warningFlag], flagsState: FlagState.LOWERED}});
        // }
        if (race.type === RaceType.PURSUIT) {
            // get dinghy classes of boats signed up to race and sort in PN order
            const sortedDinghyClasses = sortArray(race.dinghyClasses, (dinghyClass => dinghyClass.portsmouthNumber), true);
            // first flag for the race is going to be for the slowest class in the races fleet
            const baseClass = sortArray(race.fleet.dinghyClasses, (dinghyClass => dinghyClass.portsmouthNumber), true)[0];
            if (!sortedDinghyClasses.some(dc => dc.name === baseClass.name)) {
                sortedDinghyClasses.unshift(baseClass);
            };
            const basePN = sortedDinghyClasses[0].portsmouthNumber;
            const baseDuration = race.duration;
            for(let i = 1; i < sortedDinghyClasses.length; i++) {
                // set up start signals for subsequent dinghy classes
                let offset = Math.ceil((baseDuration - ((baseDuration * sortedDinghyClasses[i].portsmouthNumber) / basePN)) / 1000) * 1000; // round to the nearest second as this is the precision we are working with

                signals.push({meaning: sortedDinghyClasses[i].name + ' start', time: new Date(race.plannedStartTime.valueOf() + offset), soundSignal: {description: 'One'}});
            }
        }
        return signals;
    }
}

export default RaceStartSequence;