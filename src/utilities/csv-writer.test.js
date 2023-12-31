import { downloadRaceEntriesCSV, functionsForTestingOnly } from './csv-writer';
import  { raceScorpionA, raceCometA, raceNoClass, entriesScorpionA, entriesCometA, entriesNoClass } from '../model/__mocks__/test-data';

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
        entriesScorpionA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesScorpionA_with_laps[1].laps = [{'number': 1, 'time': 1010}, {'number': 2, 'time': 1110}, {'number': 3, 'time': 1210}];
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceScorpionA, entriesScorpionA_with_laps);
        expect(data).toEqual(['Scorpion A,2021-10-14T14:10:00.000Z,Scorpion,Chris Marshall,Lou Screw,Scorpion,3,3300\n','Scorpion A,2021-10-14T14:10:00.000Z,Scorpion,Sarah Pascal,Owain Davies,Scorpion,3,3330\n']);
    });
});

describe('when race is for dinghy class without crew', () => {
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesCometA_with_laps = entriesCometA;
        entriesCometA_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceCometA, entriesCometA_with_laps);
        expect(data).toEqual(['Comet A,2021-10-14T10:30:00.000Z,Comet,Jill Myer,Comet,3,3300\n']);
    });
});

describe('when race is a handicap race', () => {
    it('converts race entry data to an array of comma seperated value data with one row per entry in race', () => {
        const entriesNoClass_with_laps = entriesNoClass;
        entriesNoClass_with_laps[0].laps = [{'number': 1, 'time': 1000}, {'number': 2, 'time': 1100}, {'number': 3, 'time': 1200}];
        entriesNoClass_with_laps[1].laps = [{'number': 1, 'time': 1010}, {'number': 2, 'time': 1110}, {'number': 3, 'time': 1210}];
        const data = functionsForTestingOnly.convertRaceEntriesToCSVArrayFTO(raceNoClass, entriesNoClass_with_laps);
        expect(data).toEqual([
            'No Class,2023-02-14T18:26:00.000Z,,Chris Marshall,Lou Screw,Scorpion,3,3300\n',
            'No Class,2023-02-14T18:26:00.000Z,,Jill Myer,,Comet,3,3330\n'
        ]);
    });
});