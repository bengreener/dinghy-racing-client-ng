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

import SessionStartSequence from './session-start-sequence';
import Clock from './clock';

import { raceScorpionA, raceHandicapA } from '../__mocks__/test-data';
import FlagRole from './flag-role';
import FlagState from './flag-state';
import StartType from './start-type';

jest.useFakeTimers();

afterEach(() => {
    jest.runOnlyPendingTimers();
});

describe('when using CSC club start', () => {
    it('returns correct signals', () => {
        const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
        const clock = new Clock();
        clock.start();
        const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], clock);
    
        const scorpionClassFlag = {name: 'Scorpion Class Flag'};
        const preparatoryFlag = {name: 'Blue Peter'};
        const handicapClassFlag = {name: 'Handicap Class Flag'};
        const scorpionWarningVisualSignal = {flags: [scorpionClassFlag], flagsState: FlagState.RAISED};
        const scorpionWarningSoundSignal = {description: 'One'};
        const handicapWarningVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.RAISED};
        const handicapWarningSoundSignal = {description: 'One'};
        const preparatoryVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.RAISED};
        const preparatorySoundSignal = {description: 'One'};
        const scorpionStartVisualSignal = {flags: [scorpionClassFlag], flagsState: FlagState.LOWERED};
        const scorpionStartSoundSignal = {description: 'One'};
        const handicapStartVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.LOWERED};
        const handicapStartSoundSignal = {description: 'One'};
        const endSequenceVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.LOWERED};
        const scorpionWarningSignal = {meaning: 'Warning signal', time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), soundSignal: scorpionWarningSoundSignal, visualSignal: scorpionWarningVisualSignal};
        const handicapWarningSignal = {meaning: 'Warning signal', time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), soundSignal: handicapWarningSoundSignal, visualSignal: handicapWarningVisualSignal};
        const preparatorySignal = {meaning: 'Preparatory signal', time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), soundSignal: preparatorySoundSignal, visualSignal: preparatoryVisualSignal};
        const scorpionStartSignal = {meaning: 'Starting signal', time: new Date(raceScorpionA.plannedStartTime.valueOf()), soundSignal: scorpionStartSoundSignal, visualSignal: scorpionStartVisualSignal};
        const endSequenceSignal = {meaning: 'Start sequence finished', time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf()), soundSignal: null, visualSignal: endSequenceVisualSignal};
        const handicapStartSignal = {meaning: 'Starting signal', time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf()), soundSignal: handicapStartSoundSignal, visualSignal: handicapStartVisualSignal};
        
        expect(sessionStartSequence.getSignals()).toEqual([scorpionWarningSignal, preparatorySignal, handicapWarningSignal, scorpionStartSignal, endSequenceSignal, handicapStartSignal]);
    });
    describe('when 11 minutes before the start of the first race and 16 minutes before start of second race', () => {
        it('returns the next race that will start', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const clock = new Clock();
            clock.start();
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], clock);
        
            const race = sessionStartSequence.getNextRaceToStart(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
            expect(race).toStrictEqual(raceScorpionA);
        });
    });
    describe('when 0 minutes before the start of the first race and 5 minutes before start of second race', () => {
        it('returns the next race that will start', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const clock = new Clock();
            clock.start();
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], clock);
        
            const race = sessionStartSequence.getNextRaceToStart(new Date(raceScorpionA.plannedStartTime.valueOf()));
            expect(race).toStrictEqual(raceScorpionA);
        });
    });
    describe('when 5 minutes after the start of the first race and 0 minutes before start of second race', () => {
        it('returns the next race that will start', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const clock = new Clock();
            clock.start();
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], clock);
        
            const race = sessionStartSequence.getNextRaceToStart(new Date(raceScorpionA.plannedStartTime.valueOf() + 300000));
            expect(race).toStrictEqual(raceHandicapA_newStart);
        });
    });
});

describe('when using RRS26 start', () => {
    it('returns correct signals', () => {
        const raceScorpionA_rrs26 = {...raceScorpionA, startType: StartType.RRS26};
        const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z'), startType: StartType.RRS26};
        const clock = new Clock();
        clock.start();
        const sessionStartSequence = new SessionStartSequence([raceScorpionA_rrs26, raceHandicapA_newStart], clock);
    
        const scorpionClassFlag = {name: 'Scorpion Class Flag'};
        const preparatoryFlag = {name: 'Blue Peter'};
        const handicapClassFlag = {name: 'Handicap Class Flag'};
        const scorpionWarningVisualSignal = {flags: [scorpionClassFlag], flagsState: FlagState.RAISED};
        const scorpionWarningSoundSignal = {description: 'One'};
        const handicapWarningVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.RAISED};
        const handicapWarningSoundSignal = {description: 'One'};
        const preparatoryVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.RAISED};
        const preparatorySoundSignal = {description: 'One'};
        const scorpionStartVisualSignal = {flags: [scorpionClassFlag], flagsState: FlagState.LOWERED};
        const scorpionStartSoundSignal = {description: 'One'};
        const handicapStartVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.LOWERED};
        const handicapStartSoundSignal = {description: 'One'};
        const endSequenceVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.LOWERED};
        const scorpionWarningSignal = {meaning: 'Warning signal', time: new Date(raceScorpionA_rrs26.plannedStartTime.valueOf() - 300000), soundSignal: scorpionWarningSoundSignal, visualSignal: scorpionWarningVisualSignal};
        const scorpionPreparatorySignal = {meaning: 'Preparatory signal', time: new Date(raceScorpionA_rrs26.plannedStartTime.valueOf() - 240000), soundSignal: preparatorySoundSignal, visualSignal: preparatoryVisualSignal};
        const scorpionOneMinuteSignal = {meaning: 'One minute', time: new Date(raceScorpionA_rrs26.plannedStartTime.valueOf() - 60000), soundSignal: {description: 'One long'}, visualSignal: endSequenceVisualSignal};
        const scorpionStartSignal = {meaning: 'Starting signal', time: new Date(raceScorpionA_rrs26.plannedStartTime.valueOf()), soundSignal: scorpionStartSoundSignal, visualSignal: scorpionStartVisualSignal};
        const handicapWarningSignal = {meaning: 'Warning signal', time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 300000), soundSignal: handicapWarningSoundSignal, visualSignal: handicapWarningVisualSignal};
        const handicapPreparatorySignal = {meaning: 'Preparatory signal', time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 240000), soundSignal: preparatorySoundSignal, visualSignal: preparatoryVisualSignal};
        const handicapOneMinuteSignal = {meaning: 'One minute', time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 60000), soundSignal: {description: 'One long'}, visualSignal: endSequenceVisualSignal};
        const handicapStartSignal = {meaning: 'Starting signal', time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf()), soundSignal: handicapStartSoundSignal, visualSignal: handicapStartVisualSignal};
        
        expect(sessionStartSequence.getSignals()).toEqual([scorpionWarningSignal, scorpionPreparatorySignal, scorpionOneMinuteSignal, scorpionStartSignal, handicapWarningSignal, handicapPreparatorySignal, handicapOneMinuteSignal, handicapStartSignal]);
    });
    describe('when 6 minutes before the start of the first race and 11 minutes before start of second race', () => {
        it('returns the next race that will start', () => {
            const raceScorpionA_rrs26 = {...raceScorpionA, startType: StartType.RRS26};
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z'), startType: StartType.RRS26};
            const clock = new Clock();
            clock.start();
            const sessionStartSequence = new SessionStartSequence([raceScorpionA_rrs26, raceHandicapA_newStart], clock);
        
            const race = sessionStartSequence.getNextRaceToStart(new Date(raceScorpionA_rrs26.plannedStartTime.valueOf() - 360000));
            expect(race).toStrictEqual(raceScorpionA_rrs26);
        });
    });
    describe('when 0 minutes before the start of the first race and 5 minutes before start of second race', () => {
        it('returns the next race that will start', () => {
            const raceScorpionA_rrs26 = {...raceScorpionA, startType: StartType.RRS26};
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z'), startType: StartType.RRS26};
            const clock = new Clock();
            clock.start();
            const sessionStartSequence = new SessionStartSequence([raceScorpionA_rrs26, raceHandicapA_newStart], clock);
        
            const race = sessionStartSequence.getNextRaceToStart(new Date(raceScorpionA_rrs26.plannedStartTime.valueOf()));
            expect(race).toStrictEqual(raceScorpionA_rrs26);
        });
    });
    describe('when 5 minutes after the start of the first race and 0 minutes before start of second race', () => {
        it('returns the next race that will start', () => {
            const raceScorpionA_rrs26 = {...raceScorpionA, startType: StartType.RRS26};
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const clock = new Clock();
            clock.start();
            const sessionStartSequence = new SessionStartSequence([raceScorpionA_rrs26, raceHandicapA_newStart], clock);
        
            const race = sessionStartSequence.getNextRaceToStart(new Date(raceScorpionA_rrs26.plannedStartTime.valueOf() + 300000));
            expect(race).toStrictEqual(raceHandicapA_newStart);
        });
    });
});

describe('when time to prepare for race start signal', () => {
    it('notifies observers', () => {
        jest.setSystemTime(new Date("2021-10-14T10:23:59Z"));
        const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const clock = new Clock();
        clock.start();
        const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], clock);
        sessionStartSequence.addPrepareForRaceStartSignalHandler(handler1);
        sessionStartSequence.addPrepareForRaceStartSignalHandler(handler2);

        jest.advanceTimersByTime(1251);
        expect(handler1).toBeCalledTimes(2);
        expect(handler2).toBeCalledTimes(2);
    });
});

it('removes registration of an observer from prepare for race start events', () => {
    const handler1 = jest.fn();
    const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
        jest.setSystemTime(new Date("2021-10-14T10:23:59Z"));
        const handler2 = jest.fn();
        const clock = new Clock();
        clock.start();
        const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], clock);
        sessionStartSequence.addPrepareForRaceStartSignalHandler(handler1);
        sessionStartSequence.addPrepareForRaceStartSignalHandler(handler2);
        sessionStartSequence.removePrepareForRaceStartSignalHandler(handler1);
        jest.advanceTimersByTime(1899);
        expect(handler1).toBeCalledTimes(0);
        expect(handler2).toBeCalledTimes(2);
});

describe('when time to make race start signal', () => {
    it('notifies observers', () => {
        jest.setSystemTime(new Date("2021-10-14T10:29:59Z"));
        const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const clock = new Clock();
        clock.start();

        const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], clock);
        sessionStartSequence.addMakeRaceStartSignalHandler(handler1);
        sessionStartSequence.addMakeRaceStartSignalHandler(handler2);

        jest.advanceTimersByTime(1095);
        expect(handler1).toBeCalledTimes(2);
        expect(handler2).toBeCalledTimes(2);
    });
});

it('removes registration of an observer from make race start signal events', () => {
    jest.setSystemTime(new Date("2021-10-14T10:29:59Z"));
    const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const clock = new Clock();
    clock.start();

    const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], clock);
    sessionStartSequence.addMakeRaceStartSignalHandler(handler1);
    sessionStartSequence.addMakeRaceStartSignalHandler(handler2);
    sessionStartSequence.removeMakeRaceStartSignalHandler(handler1);
    jest.advanceTimersByTime(1000);
    expect(handler1).toBeCalledTimes(0);
    expect(handler2).toBeCalledTimes(2);
});