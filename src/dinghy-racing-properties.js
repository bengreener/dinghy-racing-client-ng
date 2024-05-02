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
 * Get a Promise that resolves to the properties for connection to the web service and web socket service of a Dinghy Racing server
 * @param {string} resource URL of the server that will provide the properties
 * @returns {Promise<Object>}
 */
async function getDinghyRacingProperties(resource) {
    const response =  await fetch(resource, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, cache: 'no-store'});
    return response.json();
}

export default getDinghyRacingProperties;