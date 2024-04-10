import StartSequence from './start_sequence';
import { raceScorpionA, raceGraduateA } from '../__mocks__/test-data';
import FlagState from '../flag-state';

beforeEach(() => {
    jest.useFakeTimers();
})

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe('when there are 2 races', () => {
    const races = [ raceScorpionA, raceGraduateA];

    describe('when 10 minutes 1 second before start of first race', () => {
        it('all flags are lowered and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:19:59Z'));
            // jest.setSystemTime(new Date('2021-10-14T10:24:59Z'));
        
            const startSequence = new StartSequence(races);
            const flags = startSequence.calculateFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.LOWERED, timeToChange: -1000 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.LOWERED, timeToChange: -301000 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.LOWERED, timeToChange: -301000 });
        });
    });

    describe('when 10 minutes before start of first race', () => {
        it('warning flag for 1st race is raised other flags lowered and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:20:00Z'));
            const startSequence = new StartSequence(races);
    
            const flags = startSequence.calculateFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.RAISED, timeToChange: -600000 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.LOWERED, timeToChange: -300000 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.LOWERED, timeToChange: -300000 });
        });
    });

    describe('when 5 minutes before start of first race', () => {
        it('all flags raised and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:25:00Z'));
            const startSequence = new StartSequence(races);
    
            const flags = startSequence.calculateFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.RAISED, timeToChange: -300000 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.RAISED, timeToChange: -600000 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.RAISED, timeToChange: -600000 });
        });
    });

    describe('when 0 minutes before start of first race', () => {
        it('warning flag for 1st race is lowered other flags raised and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:30:00Z'));
            const startSequence = new StartSequence(races);
    
            const flags = startSequence.calculateFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.LOWERED, timeToChange: 0 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.RAISED, timeToChange: -300000 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.RAISED, timeToChange: -300000 });
        });
    });

    describe('when 0 minutes before start of last race', () => {
        it('all flags lowered and show correct time to change', () => {
            jest.setSystemTime(new Date('2021-10-14T10:35:00Z'));
            const startSequence = new StartSequence(races);
    
            const flags = startSequence.calculateFlags();
    
            expect(flags.length).toBe(3);
            expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.LOWERED, timeToChange: 0 });
            expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.LOWERED, timeToChange: 0 });
            expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.LOWERED, timeToChange: 0 });
        });
    });
})
