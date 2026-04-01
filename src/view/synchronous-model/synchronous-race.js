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

import SynchronousEntry from './synchronous-entry';
import SynchronousFleet from './synchronous-fleet';

class SynchronousRace {
    #race;
    #fleet;
    #entries;

    /**
     * 
     * @param {Race} race 
     * @param {SynchronousFleet} fleet 
     * @param {Array<SynchronousEntry>} entries 
     */
    constructor(race, fleet, entries) {
        this.#race = race;
        this.#fleet = fleet;
        this.#entries = entries;
    }

    get entries() {
        return this.#entries;
    }

    get fleet() {
        return this.#fleet;
    }

    get includesCrewedDinghies() {
        return this.#fleet.includesCrewedDinghies;
    }

    get race() {
        return this.#race;
    }


}

export default SynchronousRace;