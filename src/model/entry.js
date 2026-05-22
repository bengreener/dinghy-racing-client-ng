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

import EmbeddedRace from './embedded-race';
import Entity from './entity';
import DirectRace from './direct-race';

class Entry extends Entity {

    constructor(hal, metadata, model) {
        super(hal, metadata, model);
    }

    get finishedRace() {
        return this.hal.finishedRace;
    }

    get onLastLap() {
        return this.hal.onLastLap;
    }

    get scoringAbbreviation() {
        return this.hal.scoringAbbreviation;
    }

    /**
     * @returns {Integer}
     */
    get sumOfLapTimes() {
        return this.model.convertISO8601DurationToMilliseconds(this.hal.sumOfLapTimes);
    }

    async getCorrectedTimeInDirectRace() {
        const signedUp = await this.getSignedUpToDirectRace();
        return signedUp.correctedTime;
    }

    async getCrew() {
        try {
            return await this.model.getCompetitor(this.hal._links.crew.href);
        }
        catch (error) {
            if (error.message.trim() === 'HTTP Error: 404') {
                // many entries will not have a crew
                return null;
            }
            throw error;
        }
    }

    async getDinghy() {
        return this.model.getDinghy(this.hal._links.dinghy.href);
    }

    /**
     * Get the direct race the entry is signed up to.
     * Each entry can signup to one direct race and any number of other races embedded in that direct race.
     * @returns {Promise<DirectRace>}
     */
    async getDirectRace() {
        // get signedup
        const signedUpTo = await this.model.getSignedUpTo(this.hal._links.signedUpTo.href);
        const races = await Promise.all(signedUpTo.entities.map((signedUp) => signedUp.getRace()));

        return races.find((race) => /directRaces/.test(race.url));
    }

    /**
     * Get a collection of the embedded races the entry is signed up to
     * @returns {Promise<Array<EmbeddedRace>>}
     */
    async getEmbeddedRaces() {
        // get signedup
        const signedUpTo = await this.model.getSignedUpTo(this.hal._links.signedUpTo.href);
        const races = await Promise.all(signedUpTo.entities.map((signedUp) => signedUp.getRace()));

        return races.filter((race) => /embeddedRaces/.test(race.url));
    }

    async getHelm() {
        return this.model.getCompetitor(this.hal._links.helm.href);
    }

    async getLaps() {
        return this.model.getLaps(this.hal._links.laps.href);
    }

    async getPositionInDirectRace() {
        const signedUp = await this.getSignedUpToDirectRace();
        return signedUp.position;
    }

    async getSignedUpToDirectRace() {
        const signedUpTo = await this.model.getSignedUpTo(this.hal._links.signedUpTo.href);
        const races = await Promise.all(signedUpTo.entities.map((signedUp) => signedUp.getRace()));

        return signedUpTo.entities[races.findIndex((race) => /directRaces/.test(race.url))];
    }

    /**
     * Register a callback for when the entry is updated
     * @param {Function} callback 
     */
    registerEntryUpdateCallback(callback) {
        this.model.registerEntryUpdateCallback(this.url, callback);
    }

    /**
     * Register a callback for when the entry is deleted
     * @param {Function} callback 
     */
    registerEntryDeletionCallback(callback) {
        this.model.registerEntryDeletionCallback(this.url, callback);
    }

    /**
     * Unregister a callback for when this entry is updated
     * @param {Function} callback
     */
    unregisterEntryUpdateCallback(callback) {
        this.model.unregisterEntryUpdateCallback(this.url, callback);
    }

    /**
     * Unregister a callback for when this entry is updated
     * @param {Function} callback
     */
    unregisterEntryDeletionCallback(callback) {
        this.model.unregisterEntryDeletionCallback(this.url, callback);
    }
}

export default Entry;