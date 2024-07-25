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

/**
 * Class providng enumeration of race type options
 */
class RaceType {
    static FLEET = 'FLEET';
    static PURSUIT = 'PURSUIT';

    /**
     * Return a RaceType value based on the supplied string
     * @param {String} raceType
     */
    static from(type) {
        const upperType = type?.toUpperCase();
        switch (upperType) {
            case 'FLEET':
                return RaceType.FLEET;
            case 'PURSUIT':
                return RaceType.PURSUIT;
            default:
                return null;
        }
    }
}

export default RaceType;