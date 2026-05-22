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

class SynchronousEntry{
    #entry;
    #dinghy;
    #helm;
    #race;
    #laps;
    #signedUp;
    #crew;

    /**
     * 
     * @param {Entry} entry 
     * @param {SynchronousDinghy} dinghy 
     * @param {Competitor} helm 
     * @param {DirectRace} race 
     * @param {Collection<Lap>} laps 
     * @param {SignedUp} signedUp to the race
     * @param {Competitor} [crew]
     */
    constructor(entry, dinghy, helm, race, laps, signedUp, crew) {
        this.#entry = entry;
        this.#dinghy = dinghy;
        this.#helm = helm;
        this.#race = race;
        this.#laps = laps;
        this.#signedUp = signedUp;
        this.#crew = crew;
    }

    get crew() {
        return this.#crew;
    }
    
    get dinghy() {
        return this.#dinghy;
    }

    get entry() {
        return this.#entry;
    }

    get finishedRace() {
        return this.#entry.finishedRace;
    }

    get helm() {
        return this.#helm;
    }

    get laps() {
        return this.#laps;
    }

    get metadata() {
        return this.#entry.metadata;
    }

    get onLastLap() {
        return this.#entry.onLastLap;
    }

    get position() {
        // return this.#position;
        return this.#signedUp.position;
    }

    get race() {
        return this.#race;
    }

    get scoringAbbreviation() {
        return this.#entry.scoringAbbreviation;
    }

    get signedUp() {
        return this.#signedUp;
    }

    /**
     * @returns {Integer}
     */
    get sumOfLapTimes() {
        return this.#entry.sumOfLapTimes;
    }

    get url() {
        return this.#entry.url;
    }

    /**
     * Register a callback for when the entry is updated
     * @param {Function} callback 
     */
    registerEntryUpdateCallback(callback) {
        this.#entry.registerEntryUpdateCallback(callback);
    }

    /**
     * Register a callback for when the entry is deleted
     * @param {Function} callback 
     */
    registerEntryDeletionCallback(callback) {
        this.#entry.registerEntryDeletionCallback(callback);
    }

    /**
     * Unregister a callback for when this entry is updated
     * @param {Function} callback
     */
    unregisterEntryUpdateCallback(callback) {
        this.#entry.unregisterEntryUpdateCallback(callback);
    }

    /**
     * Unregister a callback for when this entry is deleted
     * @param {Function} callback
     */
    unregisterEntryDeletionCallback(callback) {
        this.#entry.unregisterEntryDeletionCallback(callback);
    }
}

export default SynchronousEntry;