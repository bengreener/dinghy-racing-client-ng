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

import { httpRootURL, raceHandicapAHAL, raceScorpionAHAL, wsRootURL } from './__mocks__/test-data';
import SessionStartSequence from './session-start-sequence';
import SylphModel from './sylph-model';
import DirectRace from './direct-race';

vi.mock('./sylph-model');
vi.mock('./clock');

const model = new SylphModel(httpRootURL, wsRootURL);

it('returns next race to start', async () => {
    const now = Date.now();
    const handicapStart = new Date(now + 2000).toISOString();
    const scorpionStart = new Date(now + 1000).toISOString();
    const raceHandicap = new DirectRace({...raceHandicapAHAL, plannedStartTime: handicapStart.substring(0, handicapStart.length - 1)}, {version: '"0"'}, model);
    const raceScorpion = new DirectRace({...raceScorpionAHAL, plannedStartTime: scorpionStart.substring(0, scorpionStart.length - 1)}, {version: '"0"'}, model);
    const sessionStartSequence = new SessionStartSequence([raceHandicap, raceScorpion], model.getClock());

    expect(sessionStartSequence.getNextRaceToStart(new Date())).toEqual(raceScorpion);
})