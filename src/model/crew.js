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

import Competitor from './competitor';
import Entity from './entity';

class Crew extends Entity {

    constructor(hal, metadata, model) {
        super(hal, metadata, model);
    }

    get helm() {
        return new Competitor(this.hal.helm, null, this.model)
    }

    get mate() {
        if (this.hal.mate) {
            return new Competitor(this.hal.mate, null, this.model)
        }
        return null;
    }
}

export default Crew;