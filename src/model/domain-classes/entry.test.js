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

import Entry from './entry';
import DinghyRacingModel from '../dinghy-racing-model';
import { httpRootURL, wsRootURL, entryChrisMarshallScorpionA1234 } from '../__mocks__/test-data';

vi.mock('../dinghy-racing-model', () => {
    const DinghyRacingModel = vi.fn(function () {
        this.raceUpdateCallbacks = new Map();
        this.registerRaceUpdateCallback = (key, callback) => {
            if (this.raceUpdateCallbacks.has(key)) {
                this.raceUpdateCallbacks.get(key).add(callback);
            }
            else {
                this.raceUpdateCallbacks.set(key, new Set([callback]));
            }
        };
        this.handleRaceUpdate = (message) => {
            if (this.raceUpdateCallbacks.has(message.body)) {
                this.raceUpdateCallbacks.get(message.body).forEach(cb => cb());
            }
        }
    });
    return {
        default: DinghyRacingModel
    }
});

describe('when race associated with entry is changed', () => {
    it('entry refreshes copy of race data', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const newDate = new Date(entryChrisMarshallScorpionA1234.race.plannedStartTime.getTime());
        newDate.setMinutes(45);
        const race_rescheduled = {...entryChrisMarshallScorpionA1234.race, plannedStartTime: newDate};
        const getRaceSpy = vi.fn(() => {
            return Promise.resolve({success: true, domainObject: race_rescheduled});
        });
        DinghyRacingModel.prototype.getRace = getRaceSpy;
        // create local copy of entry based on remote data
        const entry = new Entry(entryChrisMarshallScorpionA1234.race, entryChrisMarshallScorpionA1234.helm, entryChrisMarshallScorpionA1234.crew, entryChrisMarshallScorpionA1234.dinghy, entryChrisMarshallScorpionA1234.laps,
            entryChrisMarshallScorpionA1234.sumOfLapTimes, entryChrisMarshallScorpionA1234.correctedTime, entryChrisMarshallScorpionA1234.onLastLap, entryChrisMarshallScorpionA1234.finishedRace,
            entryChrisMarshallScorpionA1234.scoringAbbreviation, entryChrisMarshallScorpionA1234.position, entryChrisMarshallScorpionA1234.url, entryChrisMarshallScorpionA1234.metadata,
            model
        );
        // trigger event advising watchers of race that race associated with entry has chnaged.
        model.handleRaceUpdate({body: entryChrisMarshallScorpionA1234.race.url});
        // confirm entry has updated copy of race data
        await vi.waitFor(async () => {
            expect(entry.race).toEqual(race_rescheduled);
        });        
        expect(getRaceSpy).toBeCalled();
    });
});
