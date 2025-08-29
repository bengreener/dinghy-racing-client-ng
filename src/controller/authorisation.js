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

class Authorisation {

    /**
     * Get roles assigned to current user/ principal
     * @returns {Promise<Array<String>>} roles assigned to current user/ principal
     */
    async getRoles() {
        let json;
        let roles;

        const resource = window.location.origin + window.location.pathname + 'authentication/roles';
        let response;
        try {
            response = await fetch(resource, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, cache: 'no-store'});
            json = await response.json();
            roles = json.roles ? json.roles : [];
        }
        catch (error) {
            console.error(`Failed to fetch roles: ${error.message}`);
            roles = [];
        }
        return Promise.resolve(roles);
    }
}

export default Authorisation;