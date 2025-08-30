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
import  { raceScorpionA, raceCometA, raceHandicapA, entriesScorpionA, racePursuitA, entriesCometA, entriesHandicapA, entriesPursuitA } from '../model/__mocks__/test-data';
import NameFormat from '../controller/name-format';

vi.mock('../model/domain-classes/clock');

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

// Testing requires coding of createObjectURL that would probably invalidate test
it.skip('writes race entry data to a file', async () => {
    // ??
});

it('returns a promise indicating success', async () => {
    // JSDom will generate an error in the console when the test is run as a warning against navigating URLs during tests.
    // I don't know how to block this but, don't believe it is an issue here.
    // Error: Not implemented: navigation (except hash changes)
    vi.stubGlobal('URL', {
        createObjectURL: vi.fn(),
        revokeObjectURL: vi.fn()
    });
    const promise = downloadRaceEntriesCSV(raceScorpionA, entriesScorpionA);
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toEqual({'success': true});
});

it('returns a promise indicating failure and providing a message with the cause', async () => {
    // JSDom will generate an error in the console when the test is run as a warning against navigating URLs during tests.
    // I don't know how to block this but, don't believe it is an issue here.
    // Error: Not implemented: navigation (except hash changes)
    vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => {throw new Error('Oops!')}),
        revokeObjectURL: vi.fn()
    });
    const promise = downloadRaceEntriesCSV(raceScorpionA, entriesScorpionA);
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toEqual({'success': false, 'message': 'Oops!'});
});

describe('when race is for fleet that includes dinghy classes with crew', () => {
    it('provides a header row that includes crew name header', () => {
        const entriesScorpionA_with_laps = [{...entriesScorpionA[0]}, {...entriesScorpionA[1]}];
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 1010}, {'number': 2, 'time': 1110}, {'number': 3, 'time': 1210}];
        entriesScorpionA_with_laps[0].sumOfLapTimes =  3300;
        entriesScorpionA_with_laps[1].sumOfLapTimes =  3330;
        entriesScorpionA_with_laps[0].position = 1;
        entriesScorpionA_with_laps[1].position = 2;
        const header = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps)[0];
    
        expect(header).toEqual('HelmName,CrewName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n');
    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesScorpionA_with_laps = [{...entriesScorpionA[0]}, {...entriesScorpionA[1]}];
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 923000}, {'number': 2, 'time': 896000}, {'number': 3, 'time': 934000}];
        entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 970000}, {'number': 2, 'time': 947000}, {'number': 3, 'time': 963000}];
        entriesScorpionA_with_laps[0].sumOfLapTimes =  2753000;
        entriesScorpionA_with_laps[1].sumOfLapTimes =  2880000;
        entriesScorpionA_with_laps[0].position = 1;
        entriesScorpionA_with_laps[1].position = 2;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps);
        expect(data.slice(1)).toEqual([
            'Chris Marshall,Lou Screw,1234,SCORPION,1,2753,3,,1043,0\n',
            'Sarah Pascal,Owain Davies,6745,SCORPION,2,2880,3,,1043,0\n'
        ]);
    });
});

describe('when race is for fleet that includes only dinghy classes without crew', () => {
    it('provides a header row without crew name header', () => {
        const entriesCometA_with_laps = entriesCometA;
        entriesCometA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesCometA_with_laps[0].sumOfLapTimes =  3300;
        const header = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceCometA, entriesCometA_with_laps)[0];
    
        expect(header).toEqual('HelmName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n');
    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesCometA_with_laps = entriesCometA;
        entriesCometA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesCometA_with_laps[0].sumOfLapTimes =  3300;
        entriesCometA_with_laps[0].position = 1;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceCometA, entriesCometA_with_laps);
        expect(data.slice(1)).toEqual([
            'Jill Myer,826,Comet,1,3,3,,1210,0\n'
        ]);
    });
});

describe('when race is a handicap race', () => {
    it('provides a header row that includes crew name header', () => {
        const entriesScorpionA_with_laps = [{...entriesScorpionA[0]}, {...entriesScorpionA[1]}];
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 1010}, {'number': 2, 'time': 1110}, {'number': 3, 'time': 1210}];
        entriesScorpionA_with_laps[0].sumOfLapTimes =  3300;
        entriesScorpionA_with_laps[1].sumOfLapTimes =  3330;
        entriesScorpionA_with_laps[0].position =  1;
        entriesScorpionA_with_laps[1].position =  2;
        const header = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps)[0];
    
        expect(header).toEqual('HelmName,CrewName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n');
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
            'Chris Marshall,Lou Screw,1234,SCORPION,1,3177,3,,1043,0\n',
            'Jill Myer,,826,Comet,2,3721,3,,1210,0\n'
        ]);
    });
});

describe('when an entry has a scoring abbreviation set', () => {
    it('converts race entry data to an array of comma seperated value data with one row per entry in race including scoring abbreviation', () => {
        const entriesScorpionA_with_laps = [{...entriesScorpionA[0]}, {...entriesScorpionA[1]}];
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesScorpionA_with_laps[0].sumOfLapTimes =  3300;
        entriesScorpionA_with_laps[1].laps = [];
        entriesScorpionA_with_laps[1].sumOfLapTimes =  0;
        entriesScorpionA_with_laps[1].scoringAbbreviation = 'DNS';
        entriesScorpionA_with_laps[0].position =  1;
        entriesScorpionA_with_laps[1].position =  2;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps);
        expect(data.slice(1)).toEqual([
            'Chris Marshall,Lou Screw,1234,SCORPION,1,3,3,,1043,0\n',
            'Sarah Pascal,Owain Davies,6745,SCORPION,,0,0,DNS,1043,0\n'
        ]);
    });
});

describe('when download options are provided', () => {
    describe('when name format option provided is firstname surname', () => {
        it('outputs name as firstname surname', () => {
            const entriesScorpionA_with_laps = [{...entriesScorpionA[0]}, {...entriesScorpionA[1]}];
            entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 923000}, {'number': 2, 'time': 896000}, {'number': 3, 'time': 934000}];
            entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 970000}, {'number': 2, 'time': 947000}, {'number': 3, 'time': 963000}];
            entriesScorpionA_with_laps[0].sumOfLapTimes =  2753000;
            entriesScorpionA_with_laps[1].sumOfLapTimes =  2880000;
            entriesScorpionA_with_laps[0].position = 1;
            entriesScorpionA_with_laps[1].position = 2;
            const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps, {nameFormat: NameFormat.FIRSTNAMESURNAME});
            expect(data.slice(1)).toEqual([
                'Chris Marshall,Lou Screw,1234,SCORPION,1,2753,3,,1043,0\n',
                'Sarah Pascal,Owain Davies,6745,SCORPION,2,2880,3,,1043,0\n'
            ]);
        });
    });
    describe('when name format option provided is surname firstname', () => {
        it('outputs name as surname, firstname and wraps in quotation marks', () => {
            const entriesScorpionA_with_laps = [{...entriesScorpionA[0]}, {...entriesScorpionA[1]}];
            entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 923000}, {'number': 2, 'time': 896000}, {'number': 3, 'time': 934000}];
            entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 970000}, {'number': 2, 'time': 947000}, {'number': 3, 'time': 963000}];
            entriesScorpionA_with_laps[0].sumOfLapTimes =  2753000;
            entriesScorpionA_with_laps[1].sumOfLapTimes =  2880000;
            entriesScorpionA_with_laps[0].position = 1;
            entriesScorpionA_with_laps[1].position = 2;
            const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps, {nameFormat: NameFormat.SURNAMEFIRSTNAME});
            expect(data.slice(1)).toEqual([
                '"Marshall, Chris","Screw, Lou",1234,SCORPION,1,2753,3,,1043,0\n',
                '"Pascal, Sarah","Davies, Owain",6745,SCORPION,2,2880,3,,1043,0\n'
            ]);
        });
    });
});

describe('when race is a pursuit race', () => {
    it('provides a header row that does not includes elapsed, laps, or corrected headers', () => {
        const entriesPursuitA_with_laps = [{...entriesPursuitA[0]}];
        entriesPursuitA_with_laps[0].laps = [{'number': 1, 'time': 923000}, {'number': 2, 'time': 896000}, {'number': 3, 'time': 934000}];
        entriesPursuitA_with_laps[0].sumOfLapTimes =  2753000;
        entriesPursuitA_with_laps[0].position = 1;
        const header = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(racePursuitA, entriesPursuitA_with_laps)[0];
    
        expect(header).not.toContain('Elapsed');
        expect(header).not.toContain('Laps');
        expect(header).not.toContain('Corrected');
    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesPursuitA_with_laps = [{...entriesPursuitA[0]}];
        entriesPursuitA_with_laps[0].laps = [{'number': 1, 'time': 923000}, {'number': 2, 'time': 896000}, {'number': 3, 'time': 934000}];
        entriesPursuitA_with_laps[0].sumOfLapTimes =  2753000;
        entriesPursuitA_with_laps[0].position = 1;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(racePursuitA, entriesPursuitA_with_laps);
        expect(data.slice(1)).toEqual([
            'Chris Marshall,Lou Screw,1234,SCORPION,1,,1043\n'
        ]);
    });
});

it.skip('it displays a save file dialog', async () => {
    // do not know how to test this
});

it.skip('it saves the file with the name provided by the save file dialog', async () => {
    // do not know how to test this
});

it.skip('it saves the file in the location selected by the save file dialog', async () => {
    // do not know how to test this
});