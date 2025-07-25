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

import Clock from '../domain-classes/__mocks__/clock';
import SessionStartSequence from '../domain-classes/session-start-sequence';

class DinghyRacingModel {
    httpRootURL;
    wsRootURL;
    stompClient;
    raceUpdateCallbacks = new Map(); // each key identifies an array of callbacks for the entry identified by the URI used as the key
    raceEntryLapsUpdateCallbacks = new Map();
    entryUpdateCallbacks = new Map(); // each key identifies an array of callbacks for the entry identified by the URI used as the key
    competitorCreationCallbacks = new Set();
    dinghyCreationCallbacks = new Set();
    dinghyClassCreationCallbacks = new Set();
    dinghyClassUpdateCallbacks = new Map();
    fleetCreationCallbacks = new Set();
    fleetUpdateCallbacks = new Map();
    clock = new Clock();

    /**
     * Provide a blank competitor template
     * @returns {Competitor}
     */
    static competitorTemplate() {
        return {name: '', url: ''};
    }

    /**
     * Provide a blank dinghy class template
     * @returns {DinghyClass}
     */
    static dinghyClassTemplate() {
        return {name: '', crewSize: 1, portsmouthNumber: 1000, externalName: '', url: ''};
    }

    /**
     * Provide a blank dinghy template
     * @returns {Dinghy}
     */
    static dinghyTemplate() {
        return {sailNumber: '', dinghyClass: DinghyRacingModel.dinghyClassTemplate(), url: ''};
    }

    /**
     * Provide a blank race template
     * @returns {Race}
     */
    static raceTemplate() {
        return {name: '', plannedStartTime: null, dinghyClass: DinghyRacingModel.dinghyClassTemplate(), duration: 0, plannedLaps: null, lapForecast: null, 
            lastLapTime: null, averageLapTime: null, clock: null, url: ''};
    }

    /**
     * Provide a blank entry template
     */
    static entryTemplate() {
        return {race: DinghyRacingModel.raceTemplate(), helm: DinghyRacingModel.competitorTemplate(), crew: null, 
        dinghy: DinghyRacingModel.dinghyTemplate(), laps: [], sumOfLapTimes: 0, onLastLap: false, url: ''};
    }

    /**
     * Provide a blank lap template
     */
    static lapTemplate() {
        return {number: null, time: 0};
    }

    /**
     * Provide a blank fleet template
     */
    static fleetTemplate() {
        return {name: '', dinghyClasses: [], url: ''};
    }

    constructor(httpRootURL, wsRootURL) {
        this.handleCompetitorCreation = this.handleCompetitorCreation.bind(this);
        this.handleDinghyCreation = this.handleDinghyCreation.bind(this);
        this.handleRaceUpdate = this.handleRaceUpdate.bind(this);
        this.handleRaceEntryLapsUpdate = this.handleRaceEntryLapsUpdate.bind(this);
        this.handleEntryUpdate = this.handleEntryUpdate.bind(this);
        this.handleDinghyClassCreation = this.handleDinghyClassCreation.bind(this);
        this.handleDinghyClassUpdate = this.handleDinghyClassUpdate.bind(this);
        this.handleFleetCreation = this.handleFleetCreation.bind(this);
        this.handleFleetUpdate = this.handleFleetUpdate.bind(this);
        this.getStartSequence = this.getStartSequence.bind(this);
        if (!httpRootURL) {
            throw new Error('An HTTP root URL is required when creating an instance of DinghyRacingModel');
        }
        if (!wsRootURL) {
            throw new Error('A WebSocket root URL is required when creating an instance of DinghyRacingModel');
        }
        this.httpRootURL = httpRootURL;
        this.wsRootURL = wsRootURL;
        this.clock.start();
    }

    registerCompetitorCreationCallback(callback) {
        this.competitorCreationCallbacks.add(callback);
    }

    unregisterCompetitorCreationCallback(callback) {
        this.competitorCreationCallbacks.delete(callback);
    }

    handleCompetitorCreation(message) {
        this.competitorCreationCallbacks.forEach(cb => cb());
    }

    registerDinghyCreationCallback(callback) {
        this.dinghyCreationCallbacks.add(callback);
    }

    unregisterDinghyCreationCallback(callback) {
        this.dinghyCreationCallbacks.delete(callback);
    }

    handleDinghyCreation(message) {
        this.dinghyCreationCallbacks.forEach(cb => cb());
    }

    registerRaceUpdateCallback(key, callback) {
        if (this.raceUpdateCallbacks.has(key)) {
            this.raceUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.raceUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    unregisterRaceUpdateCallback(key, callback) {
        if (this.raceUpdateCallbacks.has(key)) {
            this.raceUpdateCallbacks.get(key).delete(callback);
        }
    }

    handleRaceUpdate(message) {
        if (this.raceUpdateCallbacks.has(message.body)) {
            this.raceUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    registerRaceEntryLapsUpdateCallback(key, callback) {
        if (this.raceEntryLapsUpdateCallbacks.has(key)) {
            this.raceEntryLapsUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.raceEntryLapsUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    unregisterRaceEntryLapsUpdateCallback(key, callback) {
        if (this.raceEntryLapsUpdateCallbacks.has(key)) {
            this.raceEntryLapsUpdateCallbacks.get(key).delete(callback);
        }
    }

    handleRaceEntryLapsUpdate(message) {
        if (this.raceEntryLapsUpdateCallbacks.has(message.body)) {
            this.raceEntryLapsUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    registerEntryUpdateCallback(key, callback) {
        if (this.entryUpdateCallbacks.has(key)) {
            this.entryUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.entryUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    unregisterEntryUpdateCallback(key, callback) {
        if (this.entryUpdateCallbacks.has(key)) {
            this.entryUpdateCallbacks.get(key).delete(callback);
        }
    }

    handleEntryUpdate(message) {
        if (this.entryUpdateCallbacks.has(message.body)) {
            this.entryUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    registerDinghyClassCreationCallback(callback) {
        this.dinghyClassCreationCallbacks.add(callback);
    }

    unregisterDinghyClassCreationCallback(callback) {
        this.dinghyClassCreationCallbacks.delete(callback);
    }

    handleDinghyClassCreation(message) {
        this.dinghyClassCreationCallbacks.forEach(cb => cb());
    }
    
    registerDinghyClassUpdateCallback(key, callback) {
        if (this.dinghyClassUpdateCallbacks.has(key)) {
            this.dinghyClassUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.dinghyClassUpdateCallbacks.set(key, new Set([callback]));
        }
    }
    
    unregisterDinghyClassUpdateCallback(key, callback) {
        if (this.dinghyClassUpdateCallbacks.has(key)) {
            this.dinghyClassUpdateCallbacks.get(key).delete(callback);
        }
    }
    
    handleDinghyClassUpdate(message) {
        if (this.dinghyClassUpdateCallbacks.has(message.body)) {
            this.dinghyClassUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    registerFleetCreationCallback(callback) {
        this.fleetCreationCallbacks.add(callback);
    }

    unregisterFleetCreationCallback(callback) {
        this.fleetCreationCallbacks.delete(callback);
    }

    handleFleetCreation(message) {
        this.fleetCreationCallbacks.forEach(cb => cb());
    }
    
    registerFleetUpdateCallback(key, callback) {
        if (this.fleetUpdateCallbacks.has(key)) {
            this.fleetUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.fleetUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    unregisterFleetUpdateCallback(key, callback) {
        if (this.fleetUpdateCallbacks.has(key)) {
            this.fleetUpdateCallbacks.get(key).delete(callback);
        }
    }

    handleFleetUpdate(message) {
        if (this.fleetUpdateCallbacks.has(message.body)) {
            this.fleetUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    async addLap(entry, time) {
        return null;
    }
    
    async removeLap(entry, lap) {
        return null;
    }

    async updateLap(entry, time) {
        return null;
    }

    async createCompetitor(competitor) {
        return null;
    }

    async updateCompetitor(competitor, name) {
        return null;
    }

    async createDinghy(dinghy) {
        return null;
    }

    async createDinghyClass(dinghyClass) {
        return null;
    }

    async updateDinghyClass(dinghyClass, name, crewSize, portsmouthNumber) {
        return null;
    }

    async createFleet(fleet) {
        return null;
    }

    async getFleet(url) {
        return null;
    }

    async getFleets(url) {
        return null;
    }

    async updateFleet(fleet) {
        return null;
    }

    async createEntry(race, helm, dinghy) {
        return null;
    }

    async updateEntry(entry, helm, dinghy, crew = null) {
        return null;
    }

    async withdrawEntry(entry) {
        return null;
    }

    async updateEntryPosition(entry, newPosition) {
        return null;
    }

    async createRace(race) {
        return null;
    }

    async getCompetitor(url) {
        return null;
    }

    async getCompetitors() {
        return Promise.resolve({success: true, domainObject: []});
    }

    async getCompetitorByName(name) {
        return null;
    }

    async getCrewsByDinghy(dinghy) {
        return Promise.resolve({success: true, domainObject: []});
    }

    getClock() {
        return this.clock;
    }

    async getDinghy(url) {
        return null;
    }

    async getDinghies(dinghyClass) {
        return null;
    }

    async getDinghiesBySailNumber(sailNumber, page, size) {
        return Promise.resolve({success: true, domainObject: []});
    }

    async getDinghyBySailNumberAndDinghyClass(sailNumber, dinghyClass) {
        return null;
    }

    async getDinghyClass(url) {
        return null;
    }

    async getDinghyClassByName(name) {
        return null;
    }

    async getSlowestDinghyClass() {
        return null;
    }

    async getDinghyClasses() {
        return null;
    }

    async getDinghyClassesByUrl() {
        return null;
    }

    async getEntriesByRace(race) {
        return Promise.resolve({'success': true, 'domainObject': []});
    }

    async getLaps(url) {
        return null;
    }

    async getRace(url) {
        return null;
    }

    async getRacesOnOrAfterTime(startTime) {
        return null;
    }

    async getRacesBetweenTimes(startTime, endTime) {
        return Promise.resolve({success: true, domainObject: []});
    }
    
    async getRacesBetweenTimesForType(startTime, endTime, type, page, size, sortParameters) {
        return Promise.resolve({success: true, domainObject: []});
    }

    async getRaceByNameAndPlannedStartTime(name, time) {
        return null;
    }

    async updateRacePlannedLaps(race, plannedLaps) {
        return null;
    }

    async getStartSequence(races, type) {
        return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(races, this.clock)});
    }

    async startRace(race, startTime) {
        return null;
    }

    async create(urlPathSegment, object) {
        return null;
    }

    async read(resource) {
        return null;
    }

    async update(resource, object) {
        return null;
    }

    convertISO8601DurationToMilliseconds(duration) {
        const match = /(^|\+)[Pp][Tt](\+?(\d+)[Hh])?(\+?(\d+)[Mm])?(\+?(\d+([.,]\d+)?)[Ss])?$/.exec(duration);
        // check id duration is a valid ISO 801 duration format
        if (!match) {
            throw new TypeError('Duration not in expected format or range. ISO 8601 format, positive time values only expected.');
        }
        // get hour component (group 3)
        const hourMS = match[3] ? match[3] * 3600000 : 0;
        // get minute component (group 5)
        const minuteMS = match[5] ? match[5] * 60000 : 0;
        // get second component (group 7)
        const secondDuration = /,/.test(match[7]) ? match[7].replace(',', '.') : match[7];
        const secondMS =  secondDuration ? secondDuration * 1000 : 0;

        return hourMS + minuteMS + secondMS;
    }
}

/**
 * Class providng enumeration of SortOrder options for SortObject type
 */
class SortOrder {
    static ASCENDING = 'ASC';
    static DESCENDING = 'DESC';
}

export default DinghyRacingModel;
export { SortOrder };