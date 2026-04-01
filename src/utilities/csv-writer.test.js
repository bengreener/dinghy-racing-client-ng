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

import SylphModel from '../model/sylph-model';
import { downloadRaceEntriesCSV, functionsForTestingOnly } from './csv-writer';
import Collection from '../model/collection';
import Competitor from '../model/competitor';
import Dinghy from '../model/dinghy';
import DinghyClass from '../model/dinghy-class';
import Entry from '../model/entry';
import Fleet from '../model/fleet';
import Lap from '../model/lap';
import NameFormat from '../controller/name-format';
import Race from '../model/race';
import RaceType from '../model/race-type';
import  { 
    httpRootURL, wsRootURL,
    entryChrisMarshall1234ScorpionAHAL, entryJillMyer826CometAHAL, entrySarahPascal6745ScorpionAHAL,
    raceCometAHAL, raceHandicapAHAL, racePursuitAHAL, raceScorpionAHAL,
    fleetScorpionHAL,
    dinghyClassScorpionHAL,
    competitorChrisMarshallHAL,
    competitorSarahPascalHAL,
    competitorLouScrewHAL,
    competitorJillMyerHAL,
    dinghy1234HAL,
    dinghy6745HAL
} from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

beforeEach(() => {
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
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
    const entryChrisMarshall = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
    const entrySarahPascal = new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"'}, model);
    vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
    vi.spyOn(entrySarahPascal, 'getPositionInDirectRace').mockImplementation(async () => {return 2});
    vi.spyOn(entryChrisMarshall, 'getLaps').mockImplementation(async () =>{return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0})});
    vi.spyOn(entrySarahPascal, 'getLaps').mockImplementation(async () => {return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0})});
    const promise = downloadRaceEntriesCSV(race, [entryChrisMarshall, entrySarahPascal]);
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toEqual(true);
});

it('throws an error on failure and provides a message explaining the cause', async () => {
    // JSDom will generate an error in the console when the test is run as a warning against navigating URLs during tests.
    // I don't know how to block this but, don't believe it is an issue here.
    // Error: Not implemented: navigation (except hash changes)
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => {throw new Error('Oops!')}),
        revokeObjectURL: vi.fn()
    });
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
    const entryChrisMarshall = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
    const entrySarahPascal = new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"'}, model);
    vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
    vi.spyOn(entrySarahPascal, 'getPositionInDirectRace').mockImplementation(async () => {return 2});
    vi.spyOn(entryChrisMarshall, 'getLaps').mockImplementation(async () =>{return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0})});
    vi.spyOn(entrySarahPascal, 'getLaps').mockImplementation(async () => {return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0})});
    await expect(() => downloadRaceEntriesCSV(race, [entryChrisMarshall, entrySarahPascal])).rejects.toThrowError('Oops!');
});

describe('when race is for fleet that includes dinghy classes with crew', () => {
    it('provides a header row that includes crew name header', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshall = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const entrySarahPascal = new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
        vi.spyOn(entrySarahPascal, 'getPositionInDirectRace').mockImplementation(async () => {return 2});

        const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryChrisMarshall, entrySarahPascal], true);
        const header = records[0];
    
        expect(header).toEqual('HelmName,CrewName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n');
    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshall = new Entry({...entryChrisMarshall1234ScorpionAHAL, sumOfLapTimes: 'PT45M53S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
        const entrySarahPascal = new Entry({...entrySarahPascal6745ScorpionAHAL, sumOfLapTimes: 'PT48M0S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
        vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
        vi.spyOn(entrySarahPascal, 'getPositionInDirectRace').mockImplementation(async () => {return 2});
        vi.spyOn(entryChrisMarshall, 'getLaps').mockImplementation(async () =>{return new Collection([
            new Lap(1, 923000, {version: '"0"'}, model),
            new Lap(2, 896000, {version: '"0"'}, model),
            new Lap(3, 934000, {version: '"0"'}, model)
        ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});
        vi.spyOn(entrySarahPascal, 'getLaps').mockImplementation(async () => {return new Collection([
            new Lap(1, 970000, {version: '"0"'}, model),
            new Lap(2, 947000, {version: '"0"'}, model),
            new Lap(3, 963000, {version: '"0"'}, model)
        ], {size: 20,totalElements: 0, totalPages: 0,number: 0})});

        const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryChrisMarshall, entrySarahPascal], true);

        expect(records.slice(1)).toEqual([
            'Chris Marshall,Lou Screw,1234,SCORPION,1,2753,3,,1043,0\n',
            'Sarah Pascal,Owain Davies,6745,SCORPION,2,2880,3,,1043,0\n'
        ]);
    });
});

describe('when race is for fleet that includes only dinghy classes without crew', () => {
    it('provides a header row without crew name header', async () => {const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new Race(raceCometAHAL, {version: '"0"'}, model);
        const entryJillMyer = new Entry(entryJillMyer826CometAHAL, {version: '"0"'}, model);
        vi.spyOn(entryJillMyer, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});

        const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryJillMyer], false);
        const header = records[0];
    
        expect(header).toEqual('HelmName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n');
    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new Race(raceCometAHAL, {version: '"0"'}, model);
        const entryJillMyer = new Entry({...entryJillMyer826CometAHAL, sumOfLapTimes: 'PT0M3S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
        vi.spyOn(entryJillMyer, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
        vi.spyOn(entryJillMyer, 'getLaps').mockImplementation(async () =>{return new Collection([
            new Lap(1, 1000, {version: '"0"'}, model),
            new Lap(2, 1100, {version: '"0"'}, model),
            new Lap(3, 1200, {version: '"0"'}, model)
        ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});

        const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryJillMyer], false);

        expect(records.slice(1)).toEqual([
            'Jill Myer,826,Comet,1,3,3,,1210,0\n'
        ]);
    });
});

describe('when race is a handicap race', () => {
    it('provides a header row that includes crew name header', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
        const entryChrisMarshall = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const entryJillMyer = new Entry(entryJillMyer826CometAHAL, {version: '"0"'}, model);
        vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
        vi.spyOn(entryJillMyer, 'getPositionInDirectRace').mockImplementation(async () => {return 2});

        const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryChrisMarshall, entryJillMyer], true);
        const header = records[0];
    
        expect(header).toEqual('HelmName,CrewName,SailNo,Class,Place,Elapsed,Laps,Code,RaceRating,Corrected\n');
    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
        const entryChrisMarshall = new Entry({...entryChrisMarshall1234ScorpionAHAL, sumOfLapTimes: 'PT52M57S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
        const entryJillMyer = new Entry({...entryJillMyer826CometAHAL, sumOfLapTimes: 'PT1H2M1S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
        vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
        vi.spyOn(entryJillMyer, 'getPositionInDirectRace').mockImplementation(async () => {return 2});
        vi.spyOn(entryChrisMarshall, 'getLaps').mockImplementation(async () =>{return new Collection([
            new Lap(1, 975000, {version: '"0"'}, model),
            new Lap(2, 956000, {version: '"0"'}, model),
            new Lap(3, 1246000, {version: '"0"'}, model)
        ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});
        vi.spyOn(entryJillMyer, 'getLaps').mockImplementation(async () =>{return new Collection([
            new Lap(1, 1340000, {version: '"0"'}, model),
            new Lap(2, 1019000, {version: '"0"'}, model),
            new Lap(3, 1362000, {version: '"0"'}, model)
        ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});

        const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryChrisMarshall, entryJillMyer], true);
        
        expect(records.slice(1)).toEqual([
            'Chris Marshall,Lou Screw,1234,SCORPION,1,3177,3,,1043,0\n',
            'Jill Myer,,826,Comet,2,3721,3,,1210,0\n'
        ]);
    });
});

describe('when an entry has a scoring abbreviation set', () => {
    it('converts race entry data to an array of comma seperated value data with one row per entry in race including scoring abbreviation', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshall = new Entry({...entryChrisMarshall1234ScorpionAHAL, sumOfLapTimes: 'PT3S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
        const entrySarahPascal = new Entry({...entrySarahPascal6745ScorpionAHAL, sumOfLapTimes: 'PT0S', correctedTime: 'PT0M0S', scoringAbbreviation: 'DNS'}, {version: '"0"'}, model);
        vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
        vi.spyOn(entrySarahPascal, 'getPositionInDirectRace').mockImplementation(async () => {return 2});
        vi.spyOn(entryChrisMarshall, 'getLaps').mockImplementation(async () =>{return new Collection([
            new Lap(1, 1000, {version: '"0"'}, model),
            new Lap(2, 1100, {version: '"0"'}, model),
            new Lap(3, 9120034000, {version: '"0"'}, model)
        ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});
        vi.spyOn(entrySarahPascal, 'getLaps').mockImplementation(async () => {return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0})});

        const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryChrisMarshall, entrySarahPascal], true);

        expect(records.slice(1)).toEqual([
            'Chris Marshall,Lou Screw,1234,SCORPION,1,3,3,,1043,0\n',
            'Sarah Pascal,Owain Davies,6745,SCORPION,,0,0,DNS,1043,0\n'
        ]);
    
    });
});

describe('when download options are provided', () => {
    describe('when name format option provided is firstname surname', () => {
        it('outputs name as firstname surname', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const entryChrisMarshall = new Entry({...entryChrisMarshall1234ScorpionAHAL, sumOfLapTimes: 'PT45M53S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
            const entrySarahPascal = new Entry({...entrySarahPascal6745ScorpionAHAL, sumOfLapTimes: 'PT48M0S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
            vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
            vi.spyOn(entrySarahPascal, 'getPositionInDirectRace').mockImplementation(async () => {return 2});
            vi.spyOn(entryChrisMarshall, 'getLaps').mockImplementation(async () =>{return new Collection([
                new Lap(1, 923000, {version: '"0"'}, model),
                new Lap(2, 896000, {version: '"0"'}, model),
                new Lap(3, 934000, {version: '"0"'}, model)
            ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});
            vi.spyOn(entrySarahPascal, 'getLaps').mockImplementation(async () => {return new Collection([
                new Lap(1, 970000, {version: '"0"'}, model),
                new Lap(2, 947000, {version: '"0"'}, model),
                new Lap(3, 963000, {version: '"0"'}, model)
            ], {size: 20,totalElements: 0, totalPages: 0,number: 0})});

            const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryChrisMarshall, entrySarahPascal], true, {nameFormat: NameFormat.FIRSTNAMESURNAME});

            expect(records.slice(1)).toEqual([
                'Chris Marshall,Lou Screw,1234,SCORPION,1,2753,3,,1043,0\n',
                'Sarah Pascal,Owain Davies,6745,SCORPION,2,2880,3,,1043,0\n'
            ]);
        });
    });
    describe('when name format option provided is surname firstname', () => {
        it('outputs name as surname, firstname and wraps in quotation marks', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const entryChrisMarshall = new Entry({...entryChrisMarshall1234ScorpionAHAL, sumOfLapTimes: 'PT45M53S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
            const entrySarahPascal = new Entry({...entrySarahPascal6745ScorpionAHAL, sumOfLapTimes: 'PT48M0S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
            vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
            vi.spyOn(entrySarahPascal, 'getPositionInDirectRace').mockImplementation(async () => {return 2});
            vi.spyOn(entryChrisMarshall, 'getLaps').mockImplementation(async () =>{return new Collection([
                new Lap(1, 923000, {version: '"0"'}, model),
                new Lap(2, 896000, {version: '"0"'}, model),
                new Lap(3, 934000, {version: '"0"'}, model)
            ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});
            vi.spyOn(entrySarahPascal, 'getLaps').mockImplementation(async () => {return new Collection([
                new Lap(1, 970000, {version: '"0"'}, model),
                new Lap(2, 947000, {version: '"0"'}, model),
                new Lap(3, 963000, {version: '"0"'}, model)
            ], {size: 20,totalElements: 0, totalPages: 0,number: 0})});

            const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryChrisMarshall, entrySarahPascal], true, {nameFormat: NameFormat.SURNAMEFIRSTNAME});

            expect(records.slice(1)).toEqual([
                '"Marshall, Chris","Screw, Lou",1234,SCORPION,1,2753,3,,1043,0\n',
                '"Pascal, Sarah","Davies, Owain",6745,SCORPION,2,2880,3,,1043,0\n'
            ]);
        });
    });
});

describe('when race is a pursuit race', () => {
    it('provides a header row that does not includes elapsed, laps, or corrected headers', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new Race(racePursuitAHAL, {version: '"0"'}, model);
        const entryChrisMarshall = new Entry({...entryChrisMarshall1234ScorpionAHAL, sumOfLapTimes: 'PT45M53S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
        vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
        vi.spyOn(entryChrisMarshall, 'getLaps').mockImplementation(async () =>{return new Collection([
            new Lap(1, 923000, {version: '"0"'}, model),
            new Lap(2, 896000, {version: '"0"'}, model),
            new Lap(3, 934000, {version: '"0"'}, model)
        ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});
        const entryJillMyer = new Entry({...entryJillMyer826CometAHAL, sumOfLapTimes: 'PT0M3S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
        vi.spyOn(entryJillMyer, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
        vi.spyOn(entryJillMyer, 'getLaps').mockImplementation(async () =>{return new Collection([
            new Lap(1, 1000, {version: '"0"'}, model),
            new Lap(2, 1100, {version: '"0"'}, model),
            new Lap(3, 1200, {version: '"0"'}, model)
        ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});

        const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryChrisMarshall, entryJillMyer], true);
        expect(records[0]).not.toContain('Elapsed');
        expect(records[0]).not.toContain('Laps');
        expect(records[0]).not.toContain('Corrected');

    });
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new Race(racePursuitAHAL, {version: '"0"'}, model);
        const entryChrisMarshall = new Entry({...entryChrisMarshall1234ScorpionAHAL, sumOfLapTimes: 'PT45M53S', correctedTime: 'PT0M0S'}, {version: '"0"'}, model);
        vi.spyOn(entryChrisMarshall, 'getPositionInDirectRace').mockImplementation(async () =>{return 1});
        vi.spyOn(entryChrisMarshall, 'getLaps').mockImplementation(async () =>{return new Collection([
            new Lap(1, 923000, {version: '"0"'}, model),
            new Lap(2, 896000, {version: '"0"'}, model),
            new Lap(3, 934000, {version: '"0"'}, model)
        ], {size: 20,totalElements: 3, totalPages: 0,number: 0})});

        const records = await functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(race, [entryChrisMarshall], true);
        expect(records.slice(1)).toEqual([
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