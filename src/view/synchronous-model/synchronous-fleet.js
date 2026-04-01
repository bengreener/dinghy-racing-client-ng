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

class SynchronousFleet {
    #dinghyClasses;

    /**
     * 
     * @param {Collection<DinghyClass>} dinghyClasses 
     */
    constructor(dinghyClasses) {
        this.#dinghyClasses = dinghyClasses;
    }

    get dinghyClasses() {
        return this.#dinghyClasses;
    }

    get includesCrewedDinghies() {
        if (this.#dinghyClasses.entities.length > 0) {
            return this.#dinghyClasses.entities.some(dinghyClass => dinghyClass.crewSize > 1);
        }
        return true; // if an open handicap assume includes crewed dinghies
    }
}

export default SynchronousFleet;