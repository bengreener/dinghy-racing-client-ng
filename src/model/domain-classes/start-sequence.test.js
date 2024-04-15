import StartSequence from './start-sequence';
import { httpRootURL, wsRootURL, raceScorpionA, raceGraduateA } from '../__mocks__/test-data';
import FlagState from './flag-state';
import DinghyRacingModel from '../dinghy-racing-model';

beforeEach(() => {
    jest.useFakeTimers();
})

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe('when there are 2 races', () => {
    const races = [ raceScorpionA, raceGraduateA ];

    describe('when 10 minutes 1 second before start of first race', () => {
        it('all flags are lowered and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:19:59Z'));
        
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            const flags = startSequence.getFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.LOWERED, timeToChange: -1000 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.LOWERED, timeToChange: -301000 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.LOWERED, timeToChange: -301000 });
        });
    });

    describe('when 10 minutes before start of first race', () => {
        it('warning flag for 1st race is raised other flags lowered and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:20:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
    
            const flags = startSequence.getFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.RAISED, timeToChange: -600000 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.LOWERED, timeToChange: -300000 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.LOWERED, timeToChange: -300000 });
        });
    });

    describe('when 5 minutes before start of first race', () => {
        it('all flags raised and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:25:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
    
            const flags = startSequence.getFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.RAISED, timeToChange: -300000 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.RAISED, timeToChange: -600000 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.RAISED, timeToChange: -600000 });
        });
    });

    describe('when 0 minutes before start of first race', () => {
        it('warning flag for 1st race is lowered other flags raised and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:30:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
    
            const flags = startSequence.getFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.LOWERED, timeToChange: 0 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.RAISED, timeToChange: -300000 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.RAISED, timeToChange: -300000 });
        });
    });

    describe('when 0 minutes before start of last race', () => {
        it('all flags lowered and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:35:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
    
            const flags = startSequence.getFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.LOWERED, timeToChange: 0 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.LOWERED, timeToChange: 0 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.LOWERED, timeToChange: 0 });
        });
    });

    describe('when time passes', () => {
        it('calls tick event callback', () => {
            const tickCallbackSpy = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            startSequence.addTickHandler(tickCallbackSpy);

            jest.advanceTimersByTime(1000);
            expect(tickCallbackSpy).toHaveBeenCalled();
        });
        it('updates the remote model when the state of a race in the start sequence changes', () => {
            jest.setSystemTime(new Date('2021-10-14T10:29:59Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
            const startSequence = new StartSequence(races, model);

            jest.advanceTimersByTime(1000);
            expect(updateRaceStartSequenceStateSpy).toHaveBeenCalled();
        });
    });

    it('returns list of actions for the 2 races', () => {
        jest.setSystemTime(new Date('2021-10-14T10:19:59Z'));
    
        const expectedActions = [
            { time: new Date('2021-10-14T10:20:00Z'), description: 'Raise warning flag for Scorpion A' },
            { time: new Date('2021-10-14T10:30:00Z'), description: 'Lower warning flag for Scorpion A' },
            { time: new Date('2021-10-14T10:25:00Z'), description: 'Raise warning flag for Graduate A' },
            { time: new Date('2021-10-14T10:35:00Z'), description: 'Lower warning flag for Graduate A' },
            { time: new Date('2021-10-14T10:25:00Z'), description: 'Raise blue peter' },
            { time: new Date('2021-10-14T10:35:00Z'), description: 'Lower blue peter' }
        ];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const actions = startSequence.getActions();

        expect(actions).toEqual(expectedActions);
    });

    it('returns the races included in the race session', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const returnedRaces = startSequence.getRaces();

        expect(returnedRaces).toEqual([ raceScorpionA, raceGraduateA ]);
    });
});


