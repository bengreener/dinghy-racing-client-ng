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

import DinghyRacingModel from '../dinghy-racing-model';

/** Class representing an association between an Entry and a Race */
class SignedUp {
    constructor(race, entry, model) {
        this.race = race;
        this.entry = entry;
        this.model = model;
        this._handleRaceUpdate = this._handleRaceUpdate.bind(this);
        model?.registerRaceUpdateCallback(race.url, this._handleRaceUpdate);
    }

    async _handleRaceUpdate() {
        const result = await this.model.getRace(this.race.url);
        if (result.success) {
            this.race = result.domainObject;
        }
    }
}

export default SignedUp;