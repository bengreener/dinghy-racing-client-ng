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

/** Class representing an Entry in a Race. */
class Entry {
    /**
     * Create an entry.
     * @param {Race} race The race entered
     * @param {Competitor} helm The competitor entering the race as helm
     * @param {Competitor} crew The copetitor entering the race as crew
     * @param {Dinghy} dinghy The dinghy that will be sailed in the race
     * @param {Array<Lap>} laps The laps for this entry in the race
     * @param {Integer} sumOfLapTimes
     * @param {Integer} correctedTime
     * @param {boolean} onLastLap
     * @param {boolean} finishedRace
     * @param {String} scoringAbbreviation records the scoring abbreviation that identifies an adjustment required to an entries scoring for the race 
     * @param {Integer} position of the entry in the race
     * @param {String} url The URL to the remote resource
     * @param {Metadata} metadata
     */
    constructor(race, helm, crew, dinghy, laps, sumOfLapTimes, correctedTime, onLastLap, finishedRace, scoringAbbreviation, position, url, metadata) {
        this.race = race;
        this.helm = helm;
        this.crew = crew;
        this.dinghy = dinghy;
        this.laps = laps;
        this.sumOfLapTimes = sumOfLapTimes;
        this.correctedTime = correctedTime;
        this.onLastLap = onLastLap;
        this.finishedRace = finishedRace;
        this.scoringAbbreviation = scoringAbbreviation;
        this.position = position;
        this.url = url;
        this.metadata = metadata;
    }
}

export default Entry;