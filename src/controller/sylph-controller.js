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

import InvalidParameter from '../errors/invalid-parameter';
import MissingParameter from '../errors/missing-parameter';
import Competitor from '../model/competitor';
import Dinghy from '../model/dinghy';
import DinghyClass from '../model/dinghy-class';
import EmbeddedRace from '../model/embedded-race';
import Entry from '../model/entry';
import Fleet from '../model/fleet';
import Lap from '../model/lap';
import DirectRace from '../model/direct-race';
import DownloadOptions from './download-options';
import { downloadRaceEntriesCSV } from '../utilities/csv-writer'

class SylphController {

    constructor(model) {
        this.model = model;
        this.addLap = this.addLap.bind(this);
        this.createCompetitor = this.createCompetitor.bind(this);
        this.createDinghy = this.createDinghy.bind(this);
        this.createDinghyClass = this.createDinghyClass.bind(this);
        this.createFleet = this.createFleet.bind(this);
        this.createRace = this.createRace.bind(this);
        this.downloadRaceResults = this.downloadRaceResults.bind(this);
        this.postponeRace = this.postponeRace.bind(this);
        this.removeLap = this.removeLap.bind(this);
        this.setScoringAbbreviation = this.setScoringAbbreviation.bind(this);
        this.signUpToRace = this.signUpToRace.bind(this);
        this.signUpToEmbeddedRace = this.signUpToEmbeddedRace.bind(this);
        this.startRace = this.startRace.bind(this);
        this.updateCompetitor = this.updateCompetitor.bind(this);
        this.updateDinghyClass = this.updateDinghyClass.bind(this);
        this.updateEntry = this.updateEntry.bind(this);
        this.updateEntryPosition = this.updateEntryPosition.bind(this);
        this.updateFleet = this.updateFleet.bind(this);
        this.updateLap = this.updateLap.bind(this);
        this.updateRacePlannedLaps =this.updateRacePlannedLaps.bind(this);
        this.withdrawEntry = this.withdrawEntry.bind(this);
        this.withdrawEmbeddedSignUp =this.withdrawEmbeddedSignUp.bind(this);
    }

    /**
     * Add a lap to race entry
     * @param {Entry} entry
     * @param {Number} time The time to sail the lap in milliseconds
     * @returns {Promise<Entry>}
     * @throws {InvalidParameter}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async addLap(entry, time) {
        if (!(entry instanceof Entry)) {
            throw new MissingParameter('An entry is required to add a lap time.')
        }
        if (entry.finishedRace) {
            throw new InvalidParameter('Cannot add a lap to an entry that has finished the race.');
        }
        if (entry.scoringAbbreviation === 'DNS') {
            throw new InvalidParameter('Cannot add a lap to an entry that did not start the race.');
        }
        if (entry.scoringAbbreviation === 'DSQ') {
            throw new InvalidParameter('Cannot add a lap to an entry that has been disqualified from the race.');
        }
        if (entry.scoringAbbreviation === 'RET') {
            throw new InvalidParameter('Cannot add a lap to an entry that has retired from the race.');
        }
        // time can't be null and must be number
        if (isNaN(time)) {
            throw new InvalidParameter('Time must be a number; in milliseconds.');
        }
        // time must be greater than zero
        if (time <= 0) {
            throw new InvalidParameter('Time must be greater than zero.');
        }
        return this.model.addLap(entry, time);
    }
    
    /**
     * Add a new competitor
     * @param {String} name of competitor to add
     * @returns {Promise<Competitor>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async createCompetitor(name) {
        if (!name) {
            throw new MissingParameter('Name is required for a new competitor.');
        }
        return this.model.createCompetitor(name);
    }

    /**
     * Add a new dinghy
     * @param {String} sailNumber
     * @param {DinghyClass} dinghyClass
     * @returns {Promise<Dinghy>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async createDinghy(sailNumber, dinghyClass) {
        if (!sailNumber) {
            throw new MissingParameter('A sail number is required for a new dinghy.');
        }
        if (!(dinghyClass instanceof DinghyClass)) {
            throw new MissingParameter('A dinghy class is required for a new dinghy.');
        }
        return this.model.createDinghy(sailNumber, dinghyClass);
    }

    /**
     * Create a new dinghy class
     * @param {String} name of dinghy class
     * @param {Integer} crewSize
     * @param {Integer} portsmouthNumber
     * @param {String} [externalName]
     * @returns {Promise<DinghyClass>}
     * @throws {InvalidParameter}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async createDinghyClass(name, crewSize, portsmouthNumber, externalName = null) {
        if (!name) {
            throw new MissingParameter('A name is required for a new dinghy class.');
        }
        if (!(Number.isInteger(crewSize) && crewSize > 0)) {
            throw new InvalidParameter('Crew size must be a positive whole number.');
        }
        if (!(Number.isInteger(portsmouthNumber) && portsmouthNumber > 0)) {
            throw new InvalidParameter('Portsmouth number must be a positve whole number.');
        }
        return this.model.createDinghyClass(name, crewSize, portsmouthNumber, externalName);
    }

    /**
     * Create a new fleet
     * @param {String} name
     * @param {Array<DinghyClass} dinghyClasses
     * @returns {Promise<Fleet>}
     * @throws {InvalidParameter}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async createFleet(name, dinghyClasses) {
        if (!name) {
            throw new MissingParameter('A name for the fleet is required.');
        }
        if (!dinghyClasses && !(Array.isArray(dinghyClasses))) {
            throw new MissingParameter('An array of dinghy classes is required to create a new fleet.');
        }
        if (!dinghyClasses.every(element => element instanceof DinghyClass)) {
            throw new InvalidParameter('An array of dinghy classes is required to create a new fleet.');
        }
        return this.model.createFleet(name, dinghyClasses);
    }

    /**
     * Create a new race
     * @param {String} name
     * @param {Date} plannedStartTime
     * @param {Fleet} fleet
     * @param {Integer} duration in milliseconds
     * @param {Integer} plannedLaps
     * @param {RaceType} type
     * @param {StartType} startType
     * @returns {Promise<DirectRace>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async createRace(name, plannedStartTime, fleet, duration, plannedLaps, type, startType) {
        if (!name) {
            throw new MissingParameter('A name for the rece is required.');
        }
        if (!plannedStartTime || !(plannedStartTime instanceof Date)) {
            throw new MissingParameter('A planned start tme for the race is required.');
        }
        if (!(fleet instanceof Fleet)) {
            throw new MissingParameter('A fleet for the race is required.');
        }
        if (!duration || !(Number.isInteger(duration))) {
            throw new MissingParameter('A duration for the race class is required.');
        }
        if (!plannedLaps || !(Number.isInteger(plannedLaps))) {
            throw new MissingParameter('A number of planned laps for the race is required.');
        }
        if (!type) {
            throw new MissingParameter('A race type for the race is required.');
        }
        if (!startType) {
            throw new MissingParameter('A start type for the race is required.');
        }
        return this.model.createRace(name, plannedStartTime, fleet, duration, plannedLaps, type, startType);
    }

    /**
     * Download a file containing the results for race
     * @param {DirectRace} race to donwload results for
     * @param {DownloadOptions} [options]
     * @return {Promise<Boolean>}
     */
    async downloadRaceResults(race, options) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!(race instanceof DirectRace)) {
            throw new MissingParameter('Please provide a race to download.');
        }
        const result = await this.model.getEntriesByRace(race);
        return downloadRaceEntriesCSV(race, result.entities, options);
    }

    /**
     * Postpone a race
     * @param {race} race to postpone
     * @param {Number} duration, in milliseconds, by which to delay the race
     */
    async postponeRace(race, duration) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!(race instanceof DirectRace)) {
            throw new MissingParameter('A race to postpone is required.');
        }
        if (!(Number.isInteger(duration))) {
            throw new InvalidParameter('Duration must be a number.');
        }
        if (race.leadEntryLapsSailed > 0) {
            throw new Error('Cannot postpone start after an entry has sailed a lap.');
        }
        const fleet = await race.getFleet();
        return this.model.updateRace(race, race.name, new Date(race.plannedStartTime.getTime() + duration), fleet, race.duration, race.plannedLaps, race.type, race.startType);
    }

    /**
     * Remove a lap from a race entry
     * @param {Entry} entry
     * @param {Lap} lap The lap to remove
     * @returns {Promise<Entry>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async removeLap(entry, lap) {
        if (!entry || !(entry instanceof Entry)) {
            throw new Error('A valid entry is required to remove a lap.');
        }
        // time can't be null and must be number
        if (!lap || !(lap instanceof Lap)) {
            throw new Error('A lap to remove is required.');   
        }
        return this.model.removeLap(entry, lap);
    }

    /**
     * Set scoring abbreviation for entry
     * @param {Entry} entry
     * @param {String} scoringAbbreviation
     * @returns {Promise<Entry>}
     */
    async setScoringAbbreviation(entry, scoringAbbreviation) {
        if (!(entry instanceof Entry)) {
            throw new MissingParameter('An entry is required to set a scoring abbreviation.')
        }
        if (scoringAbbreviation && scoringAbbreviation.length !== 3) {
            throw new InvalidParameter('Scoring abbreviation must be 3 characters long.');
        }
        // if scoring abbreviation is an empty string pass null to model or will fail validation on REST server
        return this.model.setScoringAbbreviation(entry, scoringAbbreviation ? scoringAbbreviation.toUpperCase() : null);
    }

    /**
     * Sign up to a race
     * @param {DirectRace} race DirectRace to sign up to
     * @param {Competitor} helm Competitor signing up to helm dinghy
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @param {Competitor} [crew] Competitor who will crew dinghy
     * @returns {Promise<DirectRace>}
     * @throws {MissingParameter}
     * @throws {InvalidParameter}
     * @throws {Error}
     */
    async signUpToRace(race, helm, dinghy, crew) {
        if (!(race instanceof DirectRace)) {
            throw new MissingParameter('A race is required for a new race entry.');
        }
        if (!(helm instanceof Competitor)) {
            throw new MissingParameter('A helm is required for a new race entry.');
        }
        if (!(dinghy instanceof Dinghy)) {
            throw new MissingParameter('A dinghy is required for a new race entry.');
        }
        if (crew && !(crew instanceof Competitor)) {
            throw new InvalidParameter('Crew must be a competitor.');
        }
        if (!crew) {
            // check if dinghy class requires a crew
            const dinghyClass = await dinghy.getDinghyClass();
            if (dinghyClass.crewSize > 1) {
                throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
            }
        }
        return this.model.signUpToRace(race, helm, dinghy, crew);
    }

    /**
     * Sign up to an embedded race
     * Embedded race and entry must exist
     * @param {EmbeddedRace} embeddedrace to enter
     * @param {Entry} entry to a direct race to sign up with
     * @returns {Promise<EmbeddedRace>}
     * @throws {Error}
     */
    async signUpToEmbeddedRace(embeddedRace, entry) {
        if (!(embeddedRace instanceof EmbeddedRace)) {
            throw new MissingParameter('An embedded race is required for a new embedded race entry.');
        }
        if (!(entry instanceof Entry)) {
            throw new MissingParameter('An entry in a race is required to sign up to an embedded race.');
        }
        return this.model.signUpToEmbeddedRace(embeddedRace, entry);
    }

    /**
     * Start a race
     * @param {DirectRace} race to start
     * @return {Promise<DirectRace>}
     */
    async startRace(race) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!(race instanceof DirectRace)) {
            throw new MissingParameter('A race to start is required.');
        }
        const fleet = await race.getFleet();
        return this.model.updateRace(race, race.name, new Date(), fleet, race.duration, race.plannedLaps, race.type, race.startType);
    }

    /**
     * Update an exisiting competitor
     * @param {Competitor} competitor
     * @param {String} name new value for competitors name
     * @returns {Promise<Competitor>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async updateCompetitor(competitor, name) {
        if (!competitor || !(competitor instanceof Competitor)) {
            throw new MissingParameter('A competitor to update is required.');
        }
        if (!name) {
            throw new MissingParameter('A name is required to update a competitor.');
        }
        return this.model.updateCompetitor(competitor, name);
    }

    /**
     * Update a dinghy class
     * @param {DinghyClass} dinghyClass to update
     * @param {String} name
     * @param {Integer} crewSize
     * @param {Integer} portsmouthNumber
     * @param {String} [externalName]
     * @returns {Promise<DinghyClass>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async updateDinghyClass(dinghyClass, name, crewSize, portsmouthNumber, externalName = null) {
        if (!dinghyClass || !(dinghyClass instanceof DinghyClass)) {
            throw new MissingParameter('A dinghy class to update is required.');
        }
        if (!name) {
            throw new MissingParameter('A name is required for a new dinghy class.');
        }
        if (!(Number.isInteger(crewSize) && crewSize > 0)) {
            throw new InvalidParameter('Crew size must be a positive whole number.');
        }
        if (!(Number.isInteger(portsmouthNumber) && portsmouthNumber > 0)) {
            throw new InvalidParameter('Portsmouth number must be a positve whole number.');
        }
        return this.model.updateDinghyClass(dinghyClass, name, crewSize, portsmouthNumber, externalName);
    }

    /**
     * Update the last lap time recorded for an entry in a race
     * @param {Entry} entry
     * @param {Number | String} time The total time sailed to the end of the lap in milliseconds or a string in the format [hh:][mm:]ss
     * @returns {Promise<Entry>}
     * @throws {InvalidParameter}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async updateLap(entry, time) {
        if (!entry || !(entry instanceof Entry)) {
            throw new MissingParameter('An entry to update is required.')
        }
        if (!time || (Number.isInteger(time) && time <= 0)) {
            throw new MissingParameter('A time greater than zero is needed to update the lap.');
        }
        let timeInMilliseconds = 0;
        // if time is a string convert to number of milliseconds
        if (!Number.isInteger(time)) {
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
                throw new InvalidParameter('Time must be a number, in milliseconds, or a string value in the format [hh:][mm:]ss.');
            }
        }
        else {
            timeInMilliseconds = time;
        }
        const resultsArray = await Promise.all([entry.getDirectRace(), entry.getLaps()]);
        const race = resultsArray[0];
        const laps = resultsArray[1];
        // time must be less than or equal to elapsed time of race
        if (timeInMilliseconds > race.getElapsedTime()) {
            throw new InvalidParameter('Time should be less than or equal to the elapsed time of the race.');
        }
        return this.model.updateLap(entry, this.#calculateLapTime(timeInMilliseconds, laps.entities.toSpliced(laps.entities.length -1, 1)));
    }

    /**
     * Update an entry to a race
     * Supplied entry, helm, dinghy, and crew must exist
     * On success returns a result containing the updated entry
     * @param {Entry} entry Entry to update
     * @param {Competitor} helm Competitor entering race as the helm
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @param {Competitor} [crew] Competitor entering race as the crew
     * @returns {Promise<Entry>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async updateEntry(entry, helm, dinghy, crew = null) {
        if (!entry || !(entry instanceof Entry)) {
            throw new MissingParameter('An entry to update is required.');
        }
        if (!helm || !(helm instanceof Competitor)) {
            throw new MissingParameter('A helm is required to sign up to a race.');
        }
        if (!dinghy || !(dinghy instanceof Dinghy)) {
            throw new MissingParameter('A dinghy is required to sign up to a race.');
        }
        if (crew && !(crew instanceof Competitor)) {
            throw new InvalidParameter('Crew must be a competitor.');
        }
        if (!crew) {
            // check if dinghy class requires a crew
            const dinghyClass = await dinghy.getDinghyClass();
            if (dinghyClass.crewSize > 1) {
                throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
            }
        }
        return this.model.updateEntry(entry, helm, dinghy, crew);
    }

    /**
     * Update the position of an entry in a race
     * @param {Entry} entry
     * @param {Integer} newPosition
     * @returns {Promise<Entry>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async updateEntryPosition(entry, newPosition) {
        if (!(entry instanceof Entry)) {
            throw new MissingParameter('An entry to update is required.');
        }
        if (!Number.isInteger(newPosition) || newPosition <= 0) {
            throw new InvalidParameter('A numeric new position greater than 0 is required to update an entry position.');
        }
        const race = await entry.getDirectRace();
        return this.model.updateEntryPosition(race, entry, newPosition);
    }

    /**
     * Update a fleet with dinghy classes
     * @param {fleet} fleet to be updated
     * @param {String} name of updated fleet
     * @param {Array<DinghyClass>} dinghyclasses in updated fleet
     * @returns {Promise<Fleet>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async updateFleet(fleet, name, dinghyClasses) {
        if (!fleet || !(fleet instanceof Fleet)) {
            throw new MissingParameter('A fleet is required to update.');
        }
        if (!name) {
            throw new MissingParameter('A name is required for the updated fleet.');
        }
        if (!dinghyClasses || !(dinghyClasses instanceof Array)) {
            throw new MissingParameter('A collection of dinghy classes are required for the updated fleet.');
        }
        return this.model.updateFleet(fleet, name, dinghyClasses);
    }

    /**
     * Update the start sequence state of a race
     * @param {DirectRace} race to start
     * @param {Integer} plannedLaps new value for the number of laps to be completed
     * @return {Promise<DirectRace>}
     */
    async updateRacePlannedLaps(race, plannedLaps) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!(race instanceof DirectRace)) {
            throw new MissingParameter('A race to update is required.');
        }
        if (!(Number.isInteger(plannedLaps)) || !(plannedLaps > 0)) {
            throw new InvalidParameter('Number of laps must be a whole number greater than zero.')
        }
        const fleet = await race.getFleet();
        return this.model.updateRace(race, race.name, race.plannedStartTime, fleet, race.duration, plannedLaps, race.type, race.startType);
    }

    /**
     * Withdraw an entry to a race
     * @param {Entry} entry to withdraw
     * @returns {Promise<Boolean>}
     * @throws {MissingParameter}
     * @throws {Error}
     */
    async withdrawEntry(entry) {
        if (!(entry instanceof Entry)) {
            throw new MissingParameter('An entry to withdraw is required.');
        }
        return this.model.withdrawEntry(entry);
    }

    /**
     * Withdraw a sign up to the embedded race for the entry
     * @param {EmbeddedRace} embeddedRace
     * @param {Entry} entry
     * @returns {Boolean}
     * @throws {MissingParameter}
     */
    async withdrawEmbeddedSignUp(embeddedRace, entry) {
        if (!(embeddedRace instanceof EmbeddedRace)) {
            throw new MissingParameter('An EmbeddedRace is required to withdraw from.');
        }
        if (!(entry instanceof Entry)) {
            throw new MissingParameter('An entry to withdraw from the embedded race is required.');
        }
        const signUp = await this.model.getSignedUpToRaceForEntry(embeddedRace, entry);
        return this.model.withdrawEmbeddedSignUp(signUp);
    }

    /**
     * Calculate a lap time from elapsed time and previous lap times
     * @param {Number} elapsedTime in milliseconds
     * @param {Array<Number>} laps array of lap times in milliseconds
     * @returns {Number}
     */
    #calculateLapTime(elapsedTime, laps) {
        const lapTimes = laps.reduce((accumulator, initialValue) => {
            return accumulator + initialValue.time;
        }, 0);
        return elapsedTime - lapTimes;
    }
}

export default SylphController;