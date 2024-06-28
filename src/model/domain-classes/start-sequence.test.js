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

import StartSequence from './start-sequence';
import { httpRootURL, wsRootURL, raceScorpionA, raceGraduateA } from '../__mocks__/test-data';
import FlagState from './flag-state';
import DinghyRacingModel from '../dinghy-racing-model';
import StartSignal from './start-signal';
import FlagRole from './flag-role';

beforeEach(() => {success: true
    jest.useFakeTimers();
})

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

const races = [ raceScorpionA, raceGraduateA ];

describe('when 11 minutes before start of first race', () => {
    it('provides an indicator to prepare for a race start state change', async () => {
        jest.setSystemTime(new Date('2021-10-14T10:19:00Z'));
    
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const prepare = startSequence.getPrepareForRaceStartStateChange();

        expect(prepare).toEqual(true);
    });
});

describe('when 10 minutes 1 second before start of first race', () => {
    it('all flags are lowered', () => {
        jest.setSystemTime(new Date('2021-10-14T10:19:59Z'));
    
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const flags = startSequence.getFlags();

        expect(flags.length).toBe(3);
        expect(flags[0]).toEqual({flag: { name: 'Scorpion Class Flag', state: FlagState.LOWERED, role: FlagRole.WARNING}, action: {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED}});
        expect(flags[1]).toEqual({flag: { name: 'Blue Peter', state: FlagState.LOWERED, role: FlagRole.PREPARATORY}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED}});
        expect(flags[2]).toEqual({flag: { name: 'Graduate Class Flag', state: FlagState.LOWERED, role: FlagRole.WARNING}, action: {flag: {name: 'Graduate Class Flag', role: FlagRole.WARNING}, time: new Date(raceGraduateA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED}});
    });
    it('does not provide an indicator to prepare for a race start state change', () => {
        jest.setSystemTime(new Date('2021-10-14T10:19:59Z'));
    
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const prepare = startSequence.getPrepareForRaceStartStateChange();

        expect(prepare).toEqual(false);
    });
    it('does not provide an indicator for a race start state change', () => {
        jest.setSystemTime(new Date('2021-10-14T10:19:58Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const start = startSequence.getRaceStartStateChange();
        expect(start).toEqual(false);
    });
});

describe('when 10 minutes before start of first race', () => {
    it('warning flag for 1st race is raised other flags lowered', () => {
        jest.setSystemTime(new Date('2021-10-14T10:20:00Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);

        const flags = startSequence.getFlags();

        expect(flags.length).toBe(3);
        expect(flags[0]).toEqual({flag: { name: 'Scorpion Class Flag', state: FlagState.RAISED, role: FlagRole.WARNING}, action: {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED}});
        expect(flags[1]).toEqual({flag: { name: 'Blue Peter', state: FlagState.LOWERED, role: FlagRole.PREPARATORY}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED}});
        expect(flags[2]).toEqual({flag: { name: 'Graduate Class Flag', state: FlagState.LOWERED, role: FlagRole.WARNING}, action: {flag: {name: 'Graduate Class Flag', role: FlagRole.WARNING}, time: new Date(raceGraduateA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED}});
    });
    it('provides an indicator for a race start state change', () => {
        jest.setSystemTime(new Date('2021-10-14T10:20:00Z'));
    
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const start = startSequence.getRaceStartStateChange();
        expect(start).toEqual(true);
    });
});

describe('when 5 minutes before start of first race', () => {
    it('all flags raised', () => {
        jest.setSystemTime(new Date('2021-10-14T10:25:00Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);

        const flags = startSequence.getFlags();

        expect(flags.length).toBe(3);
        expect(flags[0]).toEqual({flag: { name: 'Scorpion Class Flag', state: FlagState.RAISED, role: FlagRole.WARNING}, action: {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED}});
        expect(flags[1]).toEqual({flag: { name: 'Blue Peter', state: FlagState.RAISED, role: FlagRole.PREPARATORY}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: raceGraduateA.plannedStartTime, afterState: FlagState.LOWERED}});
        expect(flags[2]).toEqual({flag: { name: 'Graduate Class Flag', state: FlagState.RAISED, role: FlagRole.WARNING}, action: {flag: {name: 'Graduate Class Flag', role: FlagRole.WARNING}, time: raceGraduateA.plannedStartTime, afterState: FlagState.LOWERED}});
    });
});

describe('when 0 minutes before start of first race', () => {
    it('warning flag for 1st race is lowered other flags raised', () => {
        jest.setSystemTime(new Date('2021-10-14T10:30:00Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);

        const flags = startSequence.getFlags();

        expect(flags.length).toBe(3);
        expect(flags[0]).toEqual({flag: { name: 'Scorpion Class Flag', state: FlagState.LOWERED, role: FlagRole.WARNING}, action: undefined});
        expect(flags[1]).toEqual({flag: { name: 'Blue Peter', state: FlagState.RAISED, role: FlagRole.PREPARATORY}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: raceGraduateA.plannedStartTime, afterState: FlagState.LOWERED}});
        expect(flags[2]).toEqual({flag: { name: 'Graduate Class Flag', state: FlagState.RAISED, role: FlagRole.WARNING}, action: {flag: {name: 'Graduate Class Flag', role: FlagRole.WARNING}, time: raceGraduateA.plannedStartTime, afterState: FlagState.LOWERED}});
    });
});

describe('when 0 minutes before start of last race', () => {
    it('all flags lowered', () => {
        jest.setSystemTime(new Date('2021-10-14T10:35:00Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);

        const flags = startSequence.getFlags();

        expect(flags.length).toBe(3);
        expect(flags[0]).toEqual({flag: { name: 'Scorpion Class Flag', state: FlagState.LOWERED, role: FlagRole.WARNING}, action: undefined});
        expect(flags[1]).toEqual({flag: { name: 'Blue Peter', state: FlagState.LOWERED, role: FlagRole.PREPARATORY}, action: undefined});
        expect(flags[2]).toEqual({flag: { name: 'Graduate Class Flag', state: FlagState.LOWERED, role: FlagRole.WARNING}, action: undefined});
    });
});

describe('when time passes', () => {
    it('calls tick event callback', () => {
        const tickCallbackSpy = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        startSequence.startClock();
        startSequence.addTickHandler(tickCallbackSpy);

        jest.advanceTimersByTime(1000);
        expect(tickCallbackSpy).toHaveBeenCalled();
    });
    it('updates the remote model when the state of a race in the start sequence changes', () => {
        jest.setSystemTime(new Date('2021-10-14T10:29:59Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
        const startSequence = new StartSequence(races, model);
        startSequence.startClock();

        jest.advanceTimersByTime(1000);
        expect(updateRaceStartSequenceStateSpy).toHaveBeenCalled();
    });
    describe('when ticks to 1 minute before a race start state change', () => {
        it('prepare for race state start change flag is true', async () => {
            jest.setSystemTime(new Date('2021-10-14T10:23:59Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            startSequence.startClock();

            expect(startSequence.getPrepareForRaceStartStateChange()).toBeFalsy();
            jest.advanceTimersByTime(1000);
            expect(startSequence.getPrepareForRaceStartStateChange()).toBeTruthy();
        });
        it('race state start change flag is false', async () => {
            const races = [{...raceScorpionA, startSequenceState: StartSignal.WARNINGSIGNAL}, {...raceGraduateA}];
            jest.setSystemTime(new Date('2021-10-14T10:23:59Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            startSequence.startClock();

            jest.advanceTimersByTime(1000);
            expect(startSequence.getRaceStartStateChange()).toBeFalsy();
        });
    });
    describe('when ticks to 59 seconds before a race start state change', () => {
        it('prepare for race state start change flag is false', async () => {
            jest.setSystemTime(new Date('2021-10-14T10:24:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            startSequence.startClock();

            expect(startSequence.getPrepareForRaceStartStateChange()).toBeTruthy();
            jest.advanceTimersByTime(1000);
            expect(startSequence.getPrepareForRaceStartStateChange()).toBeFalsy();
        });
    });
    describe('when ticks to a race start state change', () => {
        it('race state start change flag is true', async () => {
            const races =[{...raceScorpionA, startSequenceState: 'WARNINGSIGNAL'}, {...raceGraduateA}];
            jest.setSystemTime(new Date('2021-10-14T10:24:59Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            startSequence.startClock();

            expect(startSequence.getRaceStartStateChange()).toBeFalsy();
            jest.advanceTimersByTime(1000);
            expect(startSequence.getRaceStartStateChange()).toBeTruthy();
        });
        it('prepare for race state start change flag is false', async () => {
            jest.setSystemTime(new Date('2021-10-14T10:24:59Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            startSequence.startClock();

            jest.advanceTimersByTime(1000);
            expect(startSequence.getPrepareForRaceStartStateChange()).toBeFalsy();
        });
    })
    describe('when ticks to 1 second after a race start state change', () => {
        it('race state start change flag is true', async () => {
            const races =[{...raceScorpionA, startSequenceState: 'PREPARATORYSIGNAL'}, {...raceGraduateA, startSequenceState: 'WARNINGSIGNAL'}];
            jest.setSystemTime(new Date('2021-10-14T10:25:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            startSequence.startClock();

            expect(startSequence.getRaceStartStateChange()).toBeTruthy();
            jest.advanceTimersByTime(1000);
            expect(startSequence.getRaceStartStateChange()).toBeFalsy();
        });
    })
});

it('returns list of actions for the 2 races', () => {
    jest.setSystemTime(new Date('2021-10-14T10:19:59Z'));

    const expectedActions = [
        { flag: { name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: new Date('2021-10-14T10:20:00Z'), afterState: FlagState.RAISED },
        { flag: { name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: new Date('2021-10-14T10:30:00Z'), afterState: FlagState.LOWERED },
        { flag: { name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date('2021-10-14T10:25:00Z'), afterState: FlagState.RAISED },
        { flag: { name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date('2021-10-14T10:35:00Z'), afterState: FlagState.LOWERED },
        { flag: { name: 'Graduate Class Flag', role: FlagRole.WARNING}, time: new Date('2021-10-14T10:25:00Z'), afterState: FlagState.RAISED },
        { flag: { name: 'Graduate Class Flag', role: FlagRole.WARNING}, time: new Date('2021-10-14T10:35:00Z'), afterState: FlagState.LOWERED }
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

    expect(returnedRaces).toEqual(races);
});