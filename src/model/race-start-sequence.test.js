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

import { afterAll, afterEach, beforeAll } from 'vitest';
import SylphModel from './sylph-model';
import DirectRace from './direct-race';
import RaceStartSequence from './race-start-sequence';
import { httpRootURL, raceScorpionAHAL, wsRootURL } from './__mocks__/test-data';

vi.mock('./sylph-model');
vi.mock('./clock');

const model = new SylphModel(httpRootURL, wsRootURL);

beforeAll(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.runAllTimers();
    vi.clearAllMocks(); 
});

afterAll(() => {
    vi.useRealTimers();
});

describe('when now is after planned start time and before current start time', () => {
    it('race is shown identified as due to start', () => {
        vi.setSystemTime(new Date('2021-10-14T10:32:00Z'));

        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT5M'}, {version: '"0"'}, model);
        const rss = new RaceStartSequence(race, model.getClock());
    
        expect(rss.getNextRaceToStart(new Date())).toBe(race);
    });
});

describe('when now is after current start time', () => {
    it('race is not shown as due to start', () => {
        vi.setSystemTime(new Date('2021-10-14T10:40:00Z'));

        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT5M'}, {version: '"0"'}, model);
        const rss = new RaceStartSequence(race, model.getClock());
    
        expect(rss.getNextRaceToStart(new Date())).toBeNull();
    });
});