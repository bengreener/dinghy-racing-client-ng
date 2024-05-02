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
import StartSignals from './start-signals';

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
    it('does not provide an indicator to prepare for a race start state change', () => {
        // const races = [ {...raceScorpionA}, {...raceGraduateA} ];
        jest.setSystemTime(new Date('2021-10-14T10:19:59Z'));
    
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const prepare = startSequence.getPrepareForRaceStartStateChange();

        expect(prepare).toEqual(false);
    });
    it('does not provide an indicator for a race start state change', () => {
        // const races = [ {...raceScorpionA}, {...raceGraduateA} ];
        jest.setSystemTime(new Date('2021-10-14T10:19:58Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const start = startSequence.getRaceStartStateChange();
        expect(start).toEqual(false);
    });
});

describe('when 10 minutes before start of first race', () => {
    it('warning flag for 1st race is raised other flags lowered and show correct time to change', () => {
        // const races = [ {...raceScorpionA}, {...raceGraduateA} ];
        jest.setSystemTime(new Date('2021-10-14T10:20:00Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);

        const flags = startSequence.getFlags();

        expect(flags.length).toBe(3);
        expect(flags[0]).toEqual({ name: 'Scorpion A Warning', state: FlagState.RAISED, timeToChange: -600000 });
        expect(flags[1]).toEqual({ name: 'Blue Peter', state: FlagState.LOWERED, timeToChange: -300000 });
        expect(flags[2]).toEqual({ name: 'Graduate A Warning', state: FlagState.LOWERED, timeToChange: -300000 });
    });
    it('provides an indicator for a race start state change', () => {
        // const races = [ {...raceScorpionA}, {...raceGraduateA} ];
        jest.setSystemTime(new Date('2021-10-14T10:20:00Z'));
    
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        const start = startSequence.getRaceStartStateChange();
        expect(start).toEqual(true);
    });
});

describe('when 5 minutes before start of first race', () => {
    it('all flags raised and show correct time to change', () => {
        // const races = [ {...raceScorpionA}, {...raceGraduateA} ];
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
        // const races = [ {...raceScorpionA}, {...raceGraduateA} ];
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
        // const races = [ {...raceScorpionA}, {...raceGraduateA} ];
        const tickCallbackSpy = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const startSequence = new StartSequence(races, model);
        startSequence.startClock();
        startSequence.addTickHandler(tickCallbackSpy);

        jest.advanceTimersByTime(1000);
        expect(tickCallbackSpy).toHaveBeenCalled();
    });
    it('updates the remote model when the state of a race in the start sequence changes', () => {
        // const races = [ {...raceScorpionA}, {...raceGraduateA} ];
        jest.setSystemTime(new Date('2021-10-14T10:29:59Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
        const startSequence = new StartSequence(races, model);
        startSequence.startClock();

        jest.advanceTimersByTime(1000);
        expect(updateRaceStartSequenceStateSpy).toHaveBeenCalled();
    });
    describe('when ticks to 1 minute before a race start state change', () => {
        it('calls prepare for race start state change callback', () => {
            const races =[{...raceScorpionA, startSequenceState: 'WARNINGSIGNAL'}, {...raceGraduateA}];
            jest.setSystemTime(new Date('2021-10-14T10:23:59Z'));
            const prepareForRaceStartStateChangeCallbackSpy = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            startSequence.startClock();
            startSequence.addPrepareForRaceStartStateChangeHandler(prepareForRaceStartStateChangeCallbackSpy);

            jest.advanceTimersByTime(1000);
            expect(prepareForRaceStartStateChangeCallbackSpy).toHaveBeenCalled();
        });
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
            const races = [{...raceScorpionA, startSequenceState: StartSignals.WARNINGSIGNAL}, {...raceGraduateA}];
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
        it('calls race start state change callback', () => {
            jest.setSystemTime(new Date('2021-10-14T10:24:59Z'));
            const raceStartStateChangeCallbackSpy = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const startSequence = new StartSequence(races, model);
            startSequence.addRaceStartStateChangeHandler(raceStartStateChangeCallbackSpy);
            startSequence.startClock();

            jest.advanceTimersByTime(1000);
            expect(raceStartStateChangeCallbackSpy).toHaveBeenCalled();
        });
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
    // const races = [ {...raceScorpionA}, {...raceGraduateA} ];
    jest.setSystemTime(new Date('2021-10-14T10:19:59Z'));

    const expectedActions = [
        { time: new Date('2021-10-14T10:20:00Z'), description: 'Raise warning flag for Scorpion A' },
        { time: new Date('2021-10-14T10:30:00Z'), description: 'Lower warning flag for Scorpion A' },
        { time: new Date('2021-10-14T10:25:00Z'), description: 'Raise warning flag for Graduate A' },
        { time: new Date('2021-10-14T10:35:00Z'), description: 'Lower warning flag for Graduate A' },
        { time: new Date('2021-10-14T10:25:00Z'), description: 'Raise Blue Peter' },
        { time: new Date('2021-10-14T10:35:00Z'), description: 'Lower Blue Peter' }
    ];
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const startSequence = new StartSequence(races, model);
    const actions = startSequence.getActions();

    expect(actions).toEqual(expectedActions);
});

it('returns the races included in the race session', () => {
    // const raceA = {...raceScorpionA};
    // const raceB = {...raceGraduateA};
    // const races = [ raceA, raceB ];
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const startSequence = new StartSequence(races, model);
    const returnedRaces = startSequence.getRaces();

    expect(returnedRaces).toEqual(races);
});