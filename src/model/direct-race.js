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

import Entity from './entity';

class DirectRace extends Entity {
    
    constructor(hal, metadata, model) {
        super(hal, metadata, model);
    }

    get leadEntryAverageLapTime() {
        if (this.hal.leadEntry.averageLapTime) {
            return this.model.convertISO8601DurationToMilliseconds(this.hal.leadEntry.averageLapTime);
        }
        return null;
    }

    get clock() {
        return this.model.getClock();
    }
    
    get duration() {
        return this.model.convertISO8601DurationToMilliseconds(this.hal.duration);
    }

    get lapForecast() {
        return this.hal.lapForecast;
    }

    get leadEntryLastLapTime() {
        if (this.hal.leadEntry.lastLapTime) {
            return this.model.convertISO8601DurationToMilliseconds(this.hal.leadEntry.lastLapTime);
        }
        return null;
    }

    get leadEntryLapsSailed() {
        return this.hal.leadEntry.lapsSailed;
    }

    get name() {
        return this.hal.name;
    }

    get plannedLaps() {
        return this.hal.plannedLaps;
    }

    get plannedStartTime() {
        return new Date(this.hal.plannedStartTime + 'Z'); // times from database server should be UTC so specify Z here to avoid treating as a local time when creating date
    }

    get type() {
        return this.hal.type;
    }

    get startType() {
        return this.hal.startType;
    }

    async getDinghyClassesInRace() {
        return this.model.getDinghyClassesInRace(this);
    }

    async getEmbeddedRaces() {
        return this.model.getEmbeddedRacesInRace(this);
    }

    getElapsedTime() {
        return this.model.getClock().getElapsedTime(this.plannedStartTime);
    }

    /**
     * Get entries for a race
     * On success result domain object will be an array of Entry types; {Array<Entry>}
     * @param {DirectRace} race
     * @returns {Promise<Collection<Entry>>}
     * @throws {Error}
     */
    async getEntries() {
        return this.model.getEntriesByRace(this);
    }    

    async getFleet() {
        return this.model.getFleet(this.hal._links.fleet.href);
    }

    /**
     * Register a callback for when a new entry is created
     * @param {Function} callback
     */
    registerEntryCreationCallback(callback) {
        this.model.registerEntryCreationCallback(callback);
    }

    /**
     * Register a callback for when the laps for an entry in the race are updated
     * @param {Function} callback
     */
    registerRaceEntryLapsUpdateCallback(callback) {
        this.model.registerRaceEntryLapsUpdateCallback(this.url, callback);
    }

    /**
     * Register a callback for when the race is updated
     * @param {Function} callback
     */
    registerRaceUpdateCallback(callback) {
        this.model.registerRaceUpdateCallback(this.url, callback);
    }

    /**
     * Unregister a callback for when the laps for an entry in the race are updated
     * @param {Function} callback
     */
    unregisterRaceEntryLapsUpdateCallback(callback) {
        this.model.unregisterRaceEntryLapsUpdateCallback(callback);
    }

    /**
     * Unregister a callback for when a new entry is created
     * @param {Function} callback
     */
    unregisterEntryCreationCallback(callback) {
        this.model.unregisterEntryCreationCallback(callback);
    }

    /**
     * Unregister a callback for when the race is updated
     * @param {Function} callback
     */
    unregisterRaceUpdateCallback(callback) {
        this.model.unregisterRaceUpdateCallback(this.url, callback);
    }
}

export default DirectRace;