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

import StartSequence from '../model/domain-classes/start-signal';
import { downloadRaceEntriesCSV } from '../utilities/csv-writer'
class DinghyRacingController {

    model;

    constructor(model) {
        if (!model) {
            throw new Error('A dinghy racing model is required when creating an instance of DinghyRacingController');
        }
        this.model = model;
        this.createDinghyClass = this.createDinghyClass.bind(this);
        this.createRace = this.createRace.bind(this);
        this.addLap = this.addLap.bind(this);
        this.postponeRace = this.postponeRace.bind(this);
        this.updateRacePlannedLaps = this.updateRacePlannedLaps.bind(this);
    }

    /**
     * Add a lap to race entry
     * @param {Entry} entry
     * @param {Number} time The total time sailed to the end of the lap in milliseconds
     * @returns {Promise<Result>}
     */
    addLap(entry, time) {
        if (!entry || !entry.url) {
            return Promise.resolve({'success': false, 'message': 'A valid entry is required to add a lap time.'});
        }
        if (entry.finishedRace) {
            return Promise.resolve({'success': false, 'message': 'Cannot add a lap to an entry that has finished the race.'});
        }
        if (entry.scoringAbbreviation === 'DNS') {
            return Promise.resolve({'success': false, 'message': 'Cannot add a lap to an entry that did not start the race.'});
        }
        if (entry.scoringAbbreviation === 'DSQ') {
            return Promise.resolve({'success': false, 'message': 'Cannot add a lap to an entry that has been disqualified from the race.'});
        }
        if (entry.scoringAbbreviation === 'RET') {
            return Promise.resolve({'success': false, 'message': 'Cannot add a lap to an entry that has retired from the race.'});
        }
        // time can't be null and must be number
        if (isNaN(time)) {
            return Promise.resolve({'success': false, 'message': 'Time must be a number; in milliseconds.'});   
        }
        // time must be greater than zero
        if (time <= 0) {
            return Promise.resolve({'success': false, 'message': 'Time must be greater than zero.'});   
        }
        return this.model.addLap(entry, this._calculateLapTime(time, entry.laps));
    }

    /**
     * Remove a lap from a race entry
     * @param {Entry} entry
     * @param {Lap} lap The lap to remove
     * @returns {Promise<Result>}
     */
    removeLap(entry, lap) {
        if (!entry || !entry.url) {
            return Promise.resolve({'success': false, 'message': 'A valid entry is required to remove a lap.'});
        }
        // time can't be null and must be number
        if (!lap) {
            return Promise.resolve({'success': false, 'message': 'A lap to remove is required.'});   
        }
        return this.model.removeLap(entry, lap);
    }

    /**
     * Update the last lap time recorded for an entry in a race
     * @param {Entry} entry
     * @param {Number | String} time The total time sailed to the end of the lap in milliseconds or a string in the format [hh:][mm:]ss
     * @returns {Promise<Result>}
     */
    updateLap(entry, time) {
        let timeInMilliseconds = 0;
        // if time is a string convert to number of milliseconds
        if (typeof time !== 'number') {
            if (/^(\d+:(?=[0-5]?\d:[0-5]?\d))?([0-5]?\d:(?=[0-5]?\d))?([0-5]?\d)$/.test(time)) {
                const timeComponents = /^((?<=^)\d*(?=:[0-5]?\d:))*:?((?<=^|:)[0-5]?\d(?=:))?:?((?<=^|:)[0-5]?\d(?=$))$/.exec(time);
                // get hours
                timeInMilliseconds += isNaN(timeComponents[1]) ? 0 : 3600000 * timeComponents[1];
                // get minutes
                timeInMilliseconds += isNaN(timeComponents[2]) ? 0 : 60000 * timeComponents[2];
                // get seconds
                timeInMilliseconds += isNaN(timeComponents[3]) ? 0 : 1000 * timeComponents[3];
            }
            else {
                return Promise.resolve({'success': false, 'message': 'Time must be a number, in milliseconds, or a string value in the format [hh:][mm:]ss.'});
            }
        }
        else {
            timeInMilliseconds = time;
        }
        if (!entry || !entry.url) {
            return Promise.resolve({'success': false, 'message': 'A valid entry is required to update a lap time.'});
        }
        // time must be greater than zero
        if (timeInMilliseconds <= 0) {
            return Promise.resolve({'success': false, 'message': 'Time must be greater than zero.'});   
        }
        return this.model.updateLap(entry, this._calculateLapTime(timeInMilliseconds, entry.laps.toSpliced(entry.laps.length -1, 1)));
    }

    /**
     * Calculate a lap time from elapsed time and previous lap times
     * @param {Number} elapsedTime in milliseconds
     * @param {Array<Number>} laps array of lap times in milliseconds
     * @returns {Number}
     */
    _calculateLapTime(elapsedTime, laps) {
        const lapTimes = laps.reduce((accumulator, initialValue) => {
            return accumulator + initialValue.time;
        }, 0);
        return elapsedTime - lapTimes;
    }

    /**
     * Set a scoring abbreviation for an entry.
     * If an empty string, undefined, or null is passed for scoringAbbeviation scoring abbreviation for entry will be cleared; set to null.
     * @param {Entry} entry
     * @param {String} scoringAbbreviation three character string, empty string, or null
     */
    setScoringAbbreviation(entry, scoringAbbreviation) {
        let sa = null;
        if (!entry || !entry.url) {
            return Promise.resolve({'success': false, 'message': 'A valid entry is required to set a scoring abbreviation.'});
        }
        if (scoringAbbreviation) {
            if (scoringAbbreviation.length !== 3) {
                return Promise.resolve({'success': false, 'message': 'Scoring abbreviation must be 3 characters long.'});
            }
            else {
                sa = scoringAbbreviation.toUpperCase();
            }
        }
        return this.model.update(entry.url, {'scoringAbbreviation': sa});
    }

    /**
     * Add a new competitor
     * @param {Competitor} competitor to add
     * @returns {Promise<Result>}
     */
    createCompetitor(competitor) {
        if (!competitor || !competitor.name) {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new competitor.'});
        }
        return this.model.createCompetitor(competitor);
    }

    /**
     * Update an exisiting competitor
     * @param {Competitor} competitor to update
     * @param {String} name new value for competitors name
     * @returns {Promise<Result>}
     */
    updateCompetitor(competitor, name) {
        if (!competitor) {
            return Promise.resolve({'success': false, 'message': 'An exisiting competitor to update is required.'});
        }
        if (!name) {
            return Promise.resolve({'success': false, 'message': 'A new name is required for the competitor.'});
        }
        return this.model.updateCompetitor(competitor, name);
    }

    /**
     * Add a new dinghy
     * @param {Dinghy} dinghy
     * @returns {Promise<Result>} 
     */
    createDinghy(dinghy) {
        if (!dinghy || !dinghy.sailNumber) {
            return Promise.resolve({'success': false, 'message': 'A sail number is required for a new dinghy.'});
        }
        if (!dinghy.dinghyClass || !dinghy.dinghyClass.name) {
            return Promise.resolve({'success': false, 'message': 'A dinghy class is required for a new dinghy.'});
        }
        return this.model.createDinghy(dinghy);
    }

    /**
     * Create a new dinghy class
     * @param {DinghyClass} dinghyClass
     * @returns {Promise<Result>}
     */
    createDinghyClass(dinghyClass) {
        if (dinghyClass.name === null || dinghyClass.name === '') {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new dinghy class.'});
        }
        return this.model.createDinghyClass(dinghyClass);
    }

    /**
     * Update an exisiting dinghy class
     * @param {DinghyClass} dinghyClass to update
     * @param {String} name
     * @param {Integer} [crewSize]
     * @param {Integer} [portsmouthNumber]
     * @returns {Promise<Result>}
     */
    updateDinghyClass(dinghyClass, name, crewSize, portsmouthNumber) {
        if (!dinghyClass) {
            return Promise.resolve({'success': false, 'message': 'An exisiting dinghy class to update is required.'});
        }
        if (!name && !crewSize && !portsmouthNumber) {
            return Promise.resolve({'success': false, 'message': 'A new name, crew size, or portsmouth number value is required.'});
        }
        return this.model.updateDinghyClass(dinghyClass, name, crewSize, portsmouthNumber);
    }

    /**
     * Create a new race
     * @param {Race} race
     * @returns {Promise<Result>}
     */
    createRace(race) {
        if (race.name === undefined || race.name === null || race.name === '') {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new race.'});
        }
        if (!(race.plannedStartTime instanceof Date)) {
            return Promise.resolve({'success': false, 'message': 'A time is required for a new race.'});
        }
        if ((race.plannedLaps === undefined || race.plannedLaps === null || race.plannedLaps === '')) {
            return Promise.resolve({'success': false, 'message': 'Planned laps is required for a new race.'});
        }
        return this.model.createRace(race);
    }

    /**
     * Sign up to a race
     * @param {Race} race Race to sign up to
     * @param {Competitor} helm Competitor signing up to helm dinghy
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @param {Competitor} [crew] Competitor who will crew dinghy
     * @returns {Promise<Result>}
     */
    signupToRace(race, helm, dinghy, crew = null) {
        // check valid race, competitor, and dinghy provided
        if (!race.name || race.name === '' || !race.plannedStartTime) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        if (!helm.name || helm.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the helm.'});
        }
        if (!dinghy.sailNumber || dinghy.sailNumber === '' || !dinghy.dinghyClass || !dinghy.dinghyClass.name || dinghy.dinghyClass.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the dinghy.'});
        }
        if (crew && (!crew.name || crew.name === '')) {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the crew.'});
        }
        return this.model.createEntry(race, helm, dinghy, crew);
    }

    /**
     * Update a race entry
     * @param {Entry} entry Entry to update
     * @param {Competitor} helm Competitor signing up to helm dinghy
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @param {Competitor} [crew] Competitor who will crew dinghy
     * @returns {Promise<Result>}
     */
    updateEntry(entry, helm, dinghy, crew = null) {
        // check valid race, competitor, and dinghy provided
        if (!entry.url) {
            return Promise.resolve({'success': false, 'message': 'Please provide an existing race entry.'});
        }
        if (!helm.name || helm.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the helm.'});
        }
        if (!dinghy.sailNumber || dinghy.sailNumber === '' || !dinghy.dinghyClass || !dinghy.dinghyClass.name || dinghy.dinghyClass.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the dinghy.'});
        }
        if (crew && (!crew.name || crew.name === '')) {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the crew.'});
        }
        return this.model.updateEntry(entry, helm, dinghy, crew);
    }

    /**
     * Withdraw an entry to a race
     * @param {Entry} entry to withdraw
     * @returns {Promise<Result>}
     */
    withdrawEntry(entry) {
        if (!entry || !entry.url) {
            return Promise.resolve({success: false, message: 'An entry with a URL is required to withdraw from a race.'});
        }
        return this.model.withdrawEntry(entry);
    }

    /**
     * Update the position of an entry in a race
     * @param {Entry} entry
     * @param {Integer} newPosition
     * @returns {Promise<Result}
     */
    async updateEntryPosition(entry, newPosition) {
        let message = '';
        if (!entry.race.url) {
            message += 'The race URL is required to update an entry position.';
        }
        if (!entry.url) {
            if (message !== '') {
                message += '/n';
            }
            message += 'An entry with a URL is required to update an entry position.';
        }
        if (!newPosition || newPosition <= 0) {
            if (message !== '') {
                message += '/n';
            }
            message += 'A numeric new position greater than 0 is required to update an entry position.';
        }
        if (message !== '') {
            return Promise.resolve({success: false, message: message});
        }
        return this.model.updateEntryPosition(entry, newPosition);
    }

    /**
     * Update the start sequence state of a race
     * @param {Race} race to start
     * @param {StartSequence} stage of the starting sequence reached
     * @return {Promise<Result>}
     */
    updateRaceStartSequenceState(race, stage) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        if (!stage || !Object.keys(StartSequence).includes(stage.toUpperCase())) {
            return Promise.resolve({'success': false, 'message': 'Please provide a valid start sequence stage.'});
        }
        return this.model.updateRaceStartSequenceState(race, stage);
    }

    /**
     * Update the start sequence state of a race
     * @param {Race} race to start
     * @param {Integer} plannedLaps new value for the number of laps to be completed
     * @return {Promise<Result>}
     */
    updateRacePlannedLaps(race, plannedLaps) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        if (!Number.isInteger(plannedLaps)) {
            return Promise.resolve({'success': false, 'message': 'Please provide an integer value for the number of laps.'});
        }
        return this.model.updateRacePlannedLaps(race, plannedLaps);
    }

    /**
     * Start a race
     * @param {Race} race to start
     * @return {Promise<Result>}
     */
    startRace(race) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        return this.model.startRace(race, new Date());
    }

    /**
     * Download a file containing the results for race
     * @param {Race} race to donwload results for
     * @return {Promise<Result>}
     */
    async downloadRaceResults(race) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        const result = await this.model.getEntriesByRace(race);
        if (result.success) {
            return downloadRaceEntriesCSV(race, result.domainObject);
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Postponse a race
     * @param {race} race to postpone
     * @param {Number} duration, in milliseconds, by which to delay the race
     */
    async postponeRace(race, duration) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        if (!race.url) {
            const result = await this.model.getRaceByNameAndPlannedStartTime(race.name, race.plannedStartTime);
            if (result.success) {
                race.url = result.domainObject.url;
            }
            else {
                return Promise.resolve(result);
            }
        }
        const newTime = new Date(race.plannedStartTime.valueOf() + duration);
        return this.model.update(race.url, {'plannedStartTime': newTime});
    }
}

export default DinghyRacingController