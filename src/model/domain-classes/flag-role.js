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
 * Class providing enumeration of flag roles
 */
class FlagRole {
    static WARNING = 'WARNING';
    static PREPARATORY = 'PREPARATORY';

    /**
     * Return a FlagRole value based on the supplied string
     * @param {String} role
     */
    static from(role) {
        const upperRole = role?.toUpperCase();
        switch (upperRole) {
            case 'WARNING':
                return FlagRole.WARNING;
            case 'PREPARATORY':
                return FlagRole.PREPARATORY;
            default:
                return null;
        }
    }
}

export default FlagRole;