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

import RaceStartSequence from './race-start-sequence';
import Clock from './clock';
import { raceScorpionA, raceHandicapA, racePursuitA } from '../__mocks__/test-data';
import { preparatorySignal, scorpionWarningSignal, scorpionStartSignal, scorpionPreparatorySignal, scorpionOneMinuteSignal, endSequenceSignal } from '../__mocks__/test-data';
import FlagState from './flag-state';
import StartType from './start-type';

jest.mock('./clock');
jest.useFakeTimers();

afterEach(() => {
    jest.runOnlyPendingTimers();
});

describe('when it is 5 minutes before the race start time', () => {
    it('returns the next race to start', () => {
        const raceStartSequence = new RaceStartSequence(raceScorpionA, new Clock());
        const race = raceStartSequence.getNextRaceToStart(new Date(raceScorpionA.plannedStartTime.valueOf() - 36000));

        expect(race).toEqual(raceScorpionA);
    });
});

describe('when it is 0 minutes before the race start time', () => {
    it('returns the next race to start', () => {
        const raceStartSequence = new RaceStartSequence(raceScorpionA, new Clock());
        const race = raceStartSequence.getNextRaceToStart(new Date(raceScorpionA.plannedStartTime.valueOf()));

        expect(race).toEqual(raceScorpionA);
    });
});

describe('when it is 1 second after the race start time', () => {
    it('returns null as no next race to start', () => {
        const raceStartSequence = new RaceStartSequence(raceScorpionA, new Clock());
        const race = raceStartSequence.getNextRaceToStart(new Date(raceScorpionA.plannedStartTime.valueOf() + 1000));

        expect(race).toBeNull();
    });
});

describe('when using CSC club start', () => {
    describe('when single dinghy class Fleet race', () => {
        it('returns signals', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA, new Clock());
            const signals = raceStartSequence.getSignals();
            const scorpionEndSequenceSignal = {...endSequenceSignal, time: new Date(raceScorpionA.plannedStartTime.valueOf())};

            expect(signals).toEqual([scorpionWarningSignal, preparatorySignal, scorpionEndSequenceSignal, scorpionStartSignal]);
        });
    });
    describe('when Fleet handicap race', () => {
        it('returns signals', () => {
            const raceStartSequence = new RaceStartSequence(raceHandicapA, new Clock());
            const signals = raceStartSequence.getSignals();

            const classFlag = {name: 'Handicap Class Flag'};
            const preparatoryFlag = {name: 'Blue Peter'};
            const warningVisualSignal = {flags: [classFlag], flagsState: FlagState.RAISED};
            const warningSoundSignal = {description: 'One'};
            const preparatoryVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.RAISED};
            const preparatorySoundSignal = {description: 'One'};
            const fiveMinuteVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.LOWERED};
            const startVisualSignal = {flags: [classFlag], flagsState: FlagState.LOWERED};
            const startSoundSignal = {description: 'One'};
            const warningSignal = {meaning: 'Warning signal', time: new Date(raceHandicapA.plannedStartTime.valueOf() - 600000), soundSignal: warningSoundSignal, visualSignal: warningVisualSignal};
            const preparatorySignal = {meaning: 'Preparatory signal', time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), soundSignal: preparatorySoundSignal, visualSignal: preparatoryVisualSignal};
            const fiveMinuteSignal = {meaning: 'Start sequence finished', time: new Date(raceHandicapA.plannedStartTime.valueOf()), soundSignal: null, visualSignal: fiveMinuteVisualSignal};
            const startSignal = {meaning: 'Starting signal', time: new Date(raceHandicapA.plannedStartTime.valueOf()), soundSignal: startSoundSignal, visualSignal: startVisualSignal};

            expect(signals).toEqual([warningSignal, preparatorySignal, fiveMinuteSignal, startSignal]);
        });
    });
    describe('when Pursuit race', () => {
        it('returns signals', () => {
            const raceWithDinghyClasses = {...racePursuitA, fleet: {
                name: 'Handicap', 
                dinghyClasses: [{name: 'Optimist (Club)', crewSize: 1, portsmouthNumber: 1831}], 
                url: 'http://localhost:8081/dinghyracing/api/fleets/2'
            }, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
            const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses, new Clock());

            const classFlag = {name: 'Handicap Class Flag'};
            const preparatoryFlag = {name: 'Blue Peter'};
            const warningVisualSignal = {flags: [classFlag], flagsState: FlagState.RAISED};
            const warningSoundSignal = {description: 'One'};
            const preparatoryVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.RAISED};
            const preparatorySoundSignal = {description: 'One'};
            const fiveMinuteVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.LOWERED};
            const startVisualSignal = {flags: [classFlag], flagsState: FlagState.LOWERED};
            const startSoundSignal = {description: 'One'};
            const topperStartSoundSignal = {description: 'One'};
            const laserStartSoundSignal = {description: 'One'};
            const warningSignal = {meaning: 'Warning signal', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), soundSignal: warningSoundSignal, visualSignal: warningVisualSignal};
            const preparatorySignal = {meaning: 'Preparatory signal', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), soundSignal: preparatorySoundSignal, visualSignal: preparatoryVisualSignal};
            const fiveMinuteSignal = {meaning: 'Start sequence finished', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf()), soundSignal: null, visualSignal: fiveMinuteVisualSignal};
            const startSignal = {meaning: 'Starting signal', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf()), soundSignal: startSoundSignal, visualSignal: startVisualSignal};
            const topperSignal = {meaning: 'Topper start', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), soundSignal: topperStartSoundSignal};
            const laserSignal = {meaning: 'Laser start', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), soundSignal: laserStartSoundSignal};

            expect(raceStartSequence.getSignals()).toEqual([warningSignal, preparatorySignal, fiveMinuteSignal, startSignal, topperSignal, laserSignal]);
        });
    });
});

describe('when using RRS26 start', () => {
    describe('when single dinghy class Fleet race', () => {
        it('returns signals', () => {
            const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26}, new Clock());
            const signals = raceStartSequence.getSignals();

            const scorpionWarningSignal_rrs26 = {...scorpionWarningSignal, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000)};
            const scorpionPreparatorySignal_rrs26 = {...scorpionPreparatorySignal, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000)};

            expect(signals).toEqual([scorpionWarningSignal_rrs26, scorpionPreparatorySignal_rrs26, scorpionOneMinuteSignal, scorpionStartSignal]);
        });
    });
    describe('when Fleet handicap race', () => {
        it('returns signals', () => {
            const raceStartSequence = new RaceStartSequence({...raceHandicapA, startType: StartType.RRS26}, new Clock());
            const signals = raceStartSequence.getSignals();

            const classFlag = {name: 'Handicap Class Flag'};
            const preparatoryFlag = {name: 'Blue Peter'};
            const warningVisualSignal = {flags: [classFlag], flagsState: FlagState.RAISED};
            const warningSoundSignal = {description: 'One'};
            const preparatoryVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.RAISED};
            const preparatorySoundSignal = {description: 'One'};
            const oneMinuteVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.LOWERED};
            const oneMinuteSoundSignal = {description: 'One long'};
            const startVisualSignal = {flags: [classFlag], flagsState: FlagState.LOWERED};
            const startSoundSignal = {description: 'One'};
            const warningSignal = {meaning: 'Warning signal', time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), soundSignal: warningSoundSignal, visualSignal: warningVisualSignal};
            const preparatorySignal = {meaning: 'Preparatory signal', time: new Date(raceHandicapA.plannedStartTime.valueOf() - 240000), soundSignal: preparatorySoundSignal, visualSignal: preparatoryVisualSignal};
            const oneMinuteSignal = {meaning: 'One minute', time: new Date(raceHandicapA.plannedStartTime.valueOf() - 60000), soundSignal: oneMinuteSoundSignal, visualSignal: oneMinuteVisualSignal};
            const startSignal = {meaning: 'Starting signal', time: new Date(raceHandicapA.plannedStartTime.valueOf()), soundSignal: startSoundSignal, visualSignal: startVisualSignal};

            expect(signals).toEqual([warningSignal, preparatorySignal, oneMinuteSignal, startSignal]);
        });
    });
    describe('when Pursuit race', () => {
        it('returns signals', () => {
            const raceWithDinghyClasses = {...racePursuitA, fleet: {
                name: 'Handicap', 
                dinghyClasses: [{name: 'Optimist (Club)', crewSize: 1, portsmouthNumber: 1831}], 
                url: 'http://localhost:8081/dinghyracing/api/fleets/2'
            }, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
            const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses, new Clock());

            const classFlag = {name: 'Handicap Class Flag'};
            const preparatoryFlag = {name: 'Blue Peter'};
            const warningVisualSignal = {flags: [classFlag], flagsState: FlagState.RAISED};
            const warningSoundSignal = {description: 'One'};
            const preparatoryVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.RAISED};
            const preparatorySoundSignal = {description: 'One'};
            const oneMinuteVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.LOWERED};
            const oneMinuteSoundSignal = {description: 'One long'};
            const startVisualSignal = {flags: [classFlag], flagsState: FlagState.LOWERED};
            const startSoundSignal = {description: 'One'};
            const topperStartSoundSignal = {description: 'One'};
            const laserStartSoundSignal = {description: 'One'};
            const warningSignal = {meaning: 'Warning signal', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), soundSignal: warningSoundSignal, visualSignal: warningVisualSignal};
            const preparatorySignal = {meaning: 'Preparatory signal', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), soundSignal: preparatorySoundSignal, visualSignal: preparatoryVisualSignal};
            const oneMinuteSignal = {meaning: 'One minute', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), soundSignal: oneMinuteSoundSignal, visualSignal: oneMinuteVisualSignal};
            const startSignal = {meaning: 'Starting signal', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf()), soundSignal: startSoundSignal, visualSignal: startVisualSignal};
            const topperSignal = {meaning: 'Topper start', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), soundSignal: topperStartSoundSignal};
            const laserSignal = {meaning: 'Laser start', time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), soundSignal: laserStartSoundSignal};

            expect(raceStartSequence.getSignals()).toEqual([warningSignal, preparatorySignal, oneMinuteSignal, startSignal, topperSignal, laserSignal]);
        });
    });
});

describe('when time to prepare for race start signal', () => {
    it('notifies observers', () => {
        jest.setSystemTime(new Date("2021-10-14T10:23:59Z"));
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const clock = new Clock();
        clock.start();
        const raceStartSequence  = new RaceStartSequence({...raceScorpionA}, clock);
        raceStartSequence.addPrepareForRaceStartSignalHandler(handler1);
        raceStartSequence.addPrepareForRaceStartSignalHandler(handler2);

        jest.advanceTimersByTime(1251);
        expect(handler1).toBeCalledTimes(1);
        expect(handler2).toBeCalledTimes(1);
    });
});

it('removes registration of an observer from prepare for race start events', () => {
    const handler1 = jest.fn();
        jest.setSystemTime(new Date("2021-10-14T10:24:59Z"));
        const handler2 = jest.fn();
        const clock = new Clock();
        clock.start();
        const raceStartSequence  = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26}, clock);
        raceStartSequence.addPrepareForRaceStartSignalHandler(handler1);
        raceStartSequence.addPrepareForRaceStartSignalHandler(handler2);
        raceStartSequence.removePrepareForRaceStartSignalHandler(handler1);
        jest.advanceTimersByTime(1899);
        expect(handler1).toBeCalledTimes(0);
        expect(handler2).toBeCalledTimes(1);
});

describe('when time to make race start signal', () => {
    it('notifies observers', () => {
        jest.setSystemTime(new Date("2021-10-14T10:29:59Z"));
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const clock = new Clock();
        clock.start();

        const raceStartSequence  = new RaceStartSequence({...raceScorpionA}, clock);
        raceStartSequence.addMakeRaceStartSignalHandler(handler1);
        raceStartSequence.addMakeRaceStartSignalHandler(handler2);

        jest.advanceTimersByTime(1095);
        expect(handler1).toBeCalledTimes(1);
        expect(handler2).toBeCalledTimes(1);
    });
});

it('removes registration of an observer from make race start signal events', () => {
    jest.setSystemTime(new Date("2021-10-14T10:29:59Z"));
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const clock = new Clock();
    clock.start();

    const raceStartSequence  = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26}, clock);
    raceStartSequence.addMakeRaceStartSignalHandler(handler1);
    raceStartSequence.addMakeRaceStartSignalHandler(handler2);
    raceStartSequence.removeMakeRaceStartSignalHandler(handler1);
    jest.advanceTimersByTime(1000);
    expect(handler1).toBeCalledTimes(0);
    expect(handler2).toBeCalledTimes(1);
});