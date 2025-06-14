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

class RaceStartSequence {
    _race;
    _signals = [];
    _prepareForRaceStartSignalHandlers = new Map();
    _makeRaceStartSignalHandlers = new Map();
    _clock;

    constructor(race, clock) {
        this.tickHandler = this.tickHandler.bind(this);
        this.prepareForRaceStartSignal = this.prepareForRaceStartSignal.bind(this);
        this.makeRaceStartSignal = this.makeRaceStartSignal.bind(this);
        this._race = race;
        this._signals = this._generateSignals(race);
        this._clock = clock;
        clock.addTickHandler(this.tickHandler);
    }

    tickHandler() {
        const timeToSecondPrecision = this._clock.getTimeToSecondPrecision();
        this.prepareForRaceStartSignal(timeToSecondPrecision);
        this.makeRaceStartSignal(timeToSecondPrecision);
    }

    prepareForRaceStartSignal(time) {
        const signalTime = new Date(time.valueOf() + 60000);
        if (this._prepareForRaceStartSignalHandlers.size > 0 && this._signals.some(signal => signal.time.getTime() === signalTime.getTime())) {
            this._prepareForRaceStartSignalHandlers.forEach(callback => callback());
        }
    }

    makeRaceStartSignal(time) {
        if (this._makeRaceStartSignalHandlers.size > 0 && this._signals.some(signal => signal.time.getTime() === time.getTime())) {
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

        const warningFlag = {name: race.fleet.name + ' Class Flag'};
        const preparatoryFlag = {name: 'Blue Peter'};

        signals.push({meaning: 'Warning signal', time: new Date(race.plannedStartTime.valueOf() + classSignalOffsets.raise), soundSignal: {description: 'One'}, visualSignal: {flags: [warningFlag], flagsState: FlagState.RAISED}});
        signals.push({meaning: 'Preparatory signal', time: new Date(race.plannedStartTime.valueOf() + preparatorySignalOffsets.raise), soundSignal: {description: 'One'}, visualSignal: {flags: [preparatoryFlag], flagsState: FlagState.RAISED}});
        signals.push({meaning: preparatorySignalLowerMeaning, time: new Date(race.plannedStartTime.valueOf() + preparatorySignalOffsets.lower), soundSignal: preparatorySignalLowerSoundSignal, visualSignal: {flags: [preparatoryFlag], flagsState: FlagState.LOWERED}});
        signals.push({meaning: 'Starting signal', time: new Date(race.plannedStartTime.valueOf()), soundSignal: {description: 'One'}, visualSignal: {flags: [warningFlag], flagsState: FlagState.LOWERED}});
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

    /**
     * Clean up resources used by RaceStartSequence
     */
    dispose() {
        this._clock.removeTickHandler(this.tickHandler);
    }
}

export default RaceStartSequence;