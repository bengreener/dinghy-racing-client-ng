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
class StartType {
    static CSCCLUBSTART = 'CSCCLUBSTART';
    static RRS26 = 'RRS26';

    /**
     * Return a StartType stage value based on the supplied string
     * @param {String} startType
     */
    static from(type) {
        const lowerType = type?.toUpperCase();
        switch (lowerType) {
            case 'CSCCLUBSTART':
                return StartType.CSCCLUBSTART;
            case 'RRS26':
                return StartType.RRS26;
            default:
                return null;
        }
    }
}

export default StartType;