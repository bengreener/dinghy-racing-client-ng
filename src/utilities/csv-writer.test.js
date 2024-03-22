import { downloadRaceEntriesCSV, functionsForTestingOnly } from './csv-writer';
import  { raceScorpionA, raceCometA, raceHandicapA, entriesScorpionA, entriesCometA, entriesHandicapA } from '../model/__mocks__/test-data';

// Testing requires coding of createObjectURL that would probably invalidate test
it('writes race entry data to a file', async () => {
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
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesScorpionA_with_laps = entriesScorpionA;
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 923000}, {'number': 2, 'time': 896000}, {'number': 3, 'time': 934000}];
        entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 970000}, {'number': 2, 'time': 947000}, {'number': 3, 'time': 963000}];
        entriesScorpionA_with_laps[0].sumOfLapTimes =  2753000;
        entriesScorpionA_with_laps[1].sumOfLapTimes =  2880000;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps);
        expect(data.slice(1)).toEqual(['Scorpion A,2021-10-14T14:10:00.000Z,Scorpion,Chris Marshall,Lou Screw,Scorpion,3,2753,\n',
            'Scorpion A,2021-10-14T14:10:00.000Z,Scorpion,Sarah Pascal,Owain Davies,Scorpion,3,2880,\n']);
    });
});

describe('when race is for dinghy class without crew', () => {
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesCometA_with_laps = entriesCometA;
        entriesCometA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesCometA_with_laps[0].sumOfLapTimes =  3300;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceCometA, entriesCometA_with_laps);
        expect(data.slice(1)).toEqual(['Comet A,2021-10-14T10:40:00.000Z,Comet,Jill Myer,Comet,3,3,\n']);
    });
});

describe('when race is a handicap race', () => {
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesHandicapA_with_laps = entriesHandicapA;
        entriesHandicapA_with_laps[0].laps = [{'number': 1, 'time': 975000}, {'number': 2, 'time': 956000}, {'number': 3, 'time': 1246000}];
        entriesHandicapA_with_laps[1].laps = [{'number': 1, 'time': 1340000}, {'number': 2, 'time': 1019000}, {'number': 3, 'time': 1362000}];
        entriesHandicapA_with_laps[0].sumOfLapTimes =  3177000;
        entriesHandicapA_with_laps[1].sumOfLapTimes =  3721000;
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceHandicapA, entriesHandicapA_with_laps);
        expect(data.slice(1)).toEqual([
            'Handicap A,2023-02-14T18:26:00.000Z,,Chris Marshall,Lou Screw,Scorpion,3,3177,\n',
            'Handicap A,2023-02-14T18:26:00.000Z,,Jill Myer,,Comet,3,3721,\n'
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
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps);
        expect(data.slice(1)).toEqual(['Scorpion A,2021-10-14T14:10:00.000Z,Scorpion,Chris Marshall,Lou Screw,Scorpion,3,3,\n',
            'Scorpion A,2021-10-14T14:10:00.000Z,Scorpion,Sarah Pascal,Owain Davies,Scorpion,0,0,DNS\n']);
    });
});

it('provides a header row', () => {
    const entriesScorpionA_with_laps = entriesScorpionA;
    entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
    entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 1010}, {'number': 2, 'time': 1110}, {'number': 3, 'time': 1210}];
    entriesScorpionA_with_laps[0].sumOfLapTimes =  3300;
    entriesScorpionA_with_laps[1].sumOfLapTimes =  3330;
    const header = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps)[0];

    expect(header).toEqual('HelmName, CrewName, SailNo, Class, Elapsed, Laps, Code');
});