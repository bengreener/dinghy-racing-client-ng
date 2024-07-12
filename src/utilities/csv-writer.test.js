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

import { downloadRaceEntriesCSV, functionsForTestingOnly } from './csv-writer';
import  { raceScorpionA, raceCometA, raceHandicapA, entriesScorpionA, entriesCometA, entriesHandicapA } from '../model/__mocks__/test-data';

// Testing requires coding of createObjectURL that would probably invalidate test
xit('writes race entry data to a file', async () => {
    // ??
});

it('returns a promise indicating success', async () => {
    global.URL.createObjectURL = jest.fn(); // function does not exist in jsdom
    global.URL.revokeObjectURL = jest.fn(); // function does not exist in jsdom
    const promise = downloadRaceEntriesCSV(raceScorpionA, entriesScorpionA);
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toEqual({'success': true});
});

it('returns a promise indicating failure and providing a message with the cause', async () => {
    global.URL.createObjectURL = jest.fn(() => {throw new Error('Oops!')}); // function does not exist in jsdom
    global.URL.revokeObjectURL = jest.fn(); // function does not exist in jsdom
    const promise = downloadRaceEntriesCSV(raceScorpionA, entriesScorpionA);
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toEqual({'success': false, 'message': 'Oops!'});
});

describe('when race is for dinghy class with crew', () => {
    it('provides a header row that includes crew name header', () => {
        const entriesScorpionA_with_laps = entriesScorpionA;
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 1010}, {'number': 2, 'time': 1110}, {'number': 3, 'time': 1210}];
        entriesScorpionA_with_laps[0].sumOfLapTimes =  3300;
        entriesScorpionA_with_laps[1].sumOfLapTimes =  3330;
        entriesScorpionA_with_laps[0].position = 1;
        entriesScorpionA_with_laps[1].position = 2;
        const header = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps)[0];
    
        expect(header).toEqual('HelmName, CrewName, SailNo, Class, Place, Elapsed, Laps, Code\n');
    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesScorpionA_with_laps = entriesScorpionA;
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 923000}, {'number': 2, 'time': 896000}, {'number': 3, 'time': 934000}];
        entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 970000}, {'number': 2, 'time': 947000}, {'number': 3, 'time': 963000}];
        entriesScorpionA_with_laps[0].sumOfLapTimes =  2753000;
        entriesScorpionA_with_laps[1].sumOfLapTimes =  2880000;
        entriesScorpionA_with_laps[0].position = 1;
        entriesScorpionA_with_laps[1].position = 2;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps);
        expect(data.slice(1)).toEqual([
            'Chris Marshall,Lou Screw,1234,Scorpion,1,2753,3,\n',
            'Sarah Pascal,Owain Davies,6745,Scorpion,2,2880,3,\n'
        ]);
    });
});

describe('when race is for dinghy class without crew', () => {
    it('provides a header row that does not include crew name header', () => {
        const entriesCometA_with_laps = entriesCometA;
        entriesCometA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesCometA_with_laps[0].sumOfLapTimes =  3300;
        const header = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceCometA, entriesCometA_with_laps)[0];
    
        expect(header).toEqual('HelmName, SailNo, Class, Place, Elapsed, Laps, Code\n');
    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesCometA_with_laps = entriesCometA;
        entriesCometA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesCometA_with_laps[0].sumOfLapTimes =  3300;
        entriesCometA_with_laps[0].position = 1;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceCometA, entriesCometA_with_laps);
        expect(data.slice(1)).toEqual([
            'Jill Myer,826,Comet,1,3,3,\n'
        ]);
    });
});

describe('when race is a handicap race', () => {
    it('provides a header row that includes crew name header', () => {
        const entriesScorpionA_with_laps = entriesScorpionA;
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 1010}, {'number': 2, 'time': 1110}, {'number': 3, 'time': 1210}];
        entriesScorpionA_with_laps[0].sumOfLapTimes =  3300;
        entriesScorpionA_with_laps[1].sumOfLapTimes =  3330;
        entriesScorpionA_with_laps[0].position =  1;
        entriesScorpionA_with_laps[1].position =  2;
        const header = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps)[0];
    
        expect(header).toEqual('HelmName, CrewName, SailNo, Class, Place, Elapsed, Laps, Code\n');
    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesHandicapA_with_laps = entriesHandicapA;
        entriesHandicapA_with_laps[0].laps = [{'number': 1, 'time': 975000}, {'number': 2, 'time': 956000}, {'number': 3, 'time': 1246000}];
        entriesHandicapA_with_laps[1].laps = [{'number': 1, 'time': 1340000}, {'number': 2, 'time': 1019000}, {'number': 3, 'time': 1362000}];
        entriesHandicapA_with_laps[0].sumOfLapTimes =  3177000;
        entriesHandicapA_with_laps[1].sumOfLapTimes =  3721000;
        entriesHandicapA_with_laps[0].position =  1;
        entriesHandicapA_with_laps[1].position =  2;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceHandicapA, entriesHandicapA_with_laps);
        expect(data.slice(1)).toEqual([
            'Chris Marshall,Lou Screw,1234,Scorpion,1,3177,3,\n',
            'Jill Myer,,826,Comet,2,3721,3,\n'
        ]);
    });
});

describe('when an entry has a scoring abbreviation set', () => {
    it('converts race entry data to an array of comma seperated value data with one row per entry in race including scoring abbreviation', () => {
        const entriesScorpionA_with_laps = entriesScorpionA;
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesScorpionA_with_laps[0].sumOfLapTimes =  3300;
        entriesScorpionA_with_laps[1].laps = [];
        entriesScorpionA_with_laps[1].sumOfLapTimes =  0;
        entriesScorpionA_with_laps[1].scoringAbbreviation = 'DNS';
        entriesScorpionA_with_laps[0].position =  1;
        entriesScorpionA_with_laps[1].position =  2;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps);
        expect(data.slice(1)).toEqual([
            'Chris Marshall,Lou Screw,1234,Scorpion,1,3,3,\n',
            'Sarah Pascal,Owain Davies,6745,Scorpion,2,0,0,DNS\n'
        ]);
    });
});