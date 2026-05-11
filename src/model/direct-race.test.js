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

import DirectRace from './direct-race';
import SylphModel from './sylph-model';
import { httpRootURL, wsRootURL, raceScorpionAHAL } from './__mocks__/test-data';

vi.mock('./sylph-model');
vi.mock('./clock');

const model = new SylphModel(httpRootURL, wsRootURL);

describe('when there is no lead entry', () => {
    it('returns 0 for leadEntryLapsSailed', () => {
        const directRace = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);

        expect(directRace.leadEntryLapsSailed).toBe(0);
    });
    it('returns null for leadEntryLastLapTime', () => {
        const directRace = new DirectRace({...raceScorpionAHAL, leadEntry: null}, {version: '"0"'}, model);

        expect(directRace.leadEntryLastLapTime).toBeNull();
    });
})