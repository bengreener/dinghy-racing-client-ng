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

import { raceScorpionA, raceHandicapA } from '../__mocks__/test-data';
import FlagRole from './flag-role';
import FlagState from './flag-state';

describe('when CSC Club Start for Fleet races', () => {
    describe('when 11 minutes before the start of the first race and 16 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

            const flags = sessionStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
        
            expect(flags[0]).toStrictEqual(scorpionAWarningFlag);
            expect(flags[1]).toStrictEqual(preparatoryFlag);
            expect(flags[2]).toStrictEqual(raceHandicapAWarningFlag);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
        
            expect(flags[0]).toStrictEqual({flag: scorpionAWarningFlag, action: scorpionAWarningflagRaiseAction});
            expect(flags[1]).toStrictEqual({flag: preparatoryFlag, action: preparatoryFlagRaiseAction});
            expect(flags[2]).toStrictEqual({flag: raceHandicapAWarningFlag, action: raceHandicapAWarningflagRaiseAction});
        });
        it('returns the next race that will start', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const race = sessionStartSequence.getNextRaceToStart(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
            expect(race).toStrictEqual(raceScorpionA);
        });
    });
    describe('when 10 minutes before the start of the first race and 15 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

            const flags = sessionStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000));
        
            expect(flags[0]).toStrictEqual(scorpionAWarningFlag);
            expect(flags[1]).toStrictEqual(preparatoryFlag);
            expect(flags[2]).toStrictEqual(raceHandicapAWarningFlag);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000));
        
            expect(flags[0]).toStrictEqual({flag: scorpionAWarningFlag, action: scorpionAWarningflagLowerAction});
            expect(flags[1]).toStrictEqual({flag: preparatoryFlag, action: preparatoryFlagRaiseAction});
            expect(flags[2]).toStrictEqual({flag: raceHandicapAWarningFlag, action: raceHandicapAWarningflagRaiseAction});
        });
    });
    describe('when 5 minutes before the start of the first race and 10 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);
            
            const flags = sessionStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
        
            expect(flags[0]).toStrictEqual(scorpionAWarningFlag);
            expect(flags[1]).toStrictEqual(preparatoryFlag);
            expect(flags[2]).toStrictEqual(raceHandicapAWarningFlag);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
            expect(flags[0]).toStrictEqual({flag: scorpionAWarningFlag, action: scorpionAWarningflagLowerAction});
            expect(flags[1]).toStrictEqual({flag: preparatoryFlag, action: preparatoryFlagLowerAction});
            expect(flags[2]).toStrictEqual({flag: raceHandicapAWarningFlag, action: raceHandicapAWarningflagLowerAction});
        });
    });
    describe('when 0 minutes before the start of the first race and 5 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

            const flags = sessionStartSequence.getFlagsAtTime(raceScorpionA.plannedStartTime);
        
            expect(flags[0]).toStrictEqual(scorpionAWarningFlag);
            expect(flags[1]).toStrictEqual(preparatoryFlag);
            expect(flags[2]).toStrictEqual(raceHandicapAWarningFlag);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(raceScorpionA.plannedStartTime);
        
            expect(flags[0]).toStrictEqual({flag: scorpionAWarningFlag, action: undefined});
            expect(flags[1]).toStrictEqual({flag: preparatoryFlag, action: preparatoryFlagLowerAction});
            expect(flags[2]).toStrictEqual({flag: raceHandicapAWarningFlag, action: raceHandicapAWarningflagLowerAction});
        });
        it('returns the next race that will start', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const race = sessionStartSequence.getNextRaceToStart(new Date(raceScorpionA.plannedStartTime.valueOf()));
            expect(race).toStrictEqual(raceScorpionA);
        });
    });
    describe('when 5 minutes after the start of the first race and 0 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

            const flags = sessionStartSequence.getFlagsAtTime(raceHandicapA_newStart.plannedStartTime);
        
            expect(flags[0]).toStrictEqual(scorpionAWarningFlag);
            expect(flags[1]).toStrictEqual({...preparatoryFlag});
            expect(flags[2]).toStrictEqual(raceHandicapAWarningFlag);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

            scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
            scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
            
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
            
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
            raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(raceHandicapA_newStart.plannedStartTime);
        
            expect(flags[0]).toStrictEqual({flag: scorpionAWarningFlag, action: undefined});
            expect(flags[1]).toStrictEqual({flag: preparatoryFlag, action: undefined});
            expect(flags[2]).toStrictEqual({flag: raceHandicapAWarningFlag, action: undefined});
        });
        it('returns the next race that will start', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const race = sessionStartSequence.getNextRaceToStart(new Date(raceScorpionA.plannedStartTime.valueOf() + 300000));
            expect(race).toStrictEqual(raceHandicapA_newStart);
        });
    });
    it('returns the correct actions', () => {
        const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
        const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
        const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, actions: []};
        const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
        const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, actions: []};

        const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        
        const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        
        const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

        scorpionAWarningFlag.actions.push(scorpionAWarningflagRaiseAction);
        scorpionAWarningFlag.actions.push(scorpionAWarningflagLowerAction);
        
        preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
        preparatoryFlag.actions.push(preparatoryFlagLowerAction);
        
        raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
        raceHandicapAWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

        const actions = sessionStartSequence.getActions();

        expect(actions[0]).toStrictEqual(scorpionAWarningflagRaiseAction);
        expect(actions[1]).toStrictEqual(scorpionAWarningflagLowerAction);
        expect(actions[2]).toStrictEqual(raceHandicapAWarningflagRaiseAction);
        expect(actions[3]).toStrictEqual(raceHandicapAWarningflagLowerAction);
        expect(actions[4]).toStrictEqual(preparatoryFlagRaiseAction);
        expect(actions[5]).toStrictEqual(preparatoryFlagLowerAction);
    });
});

describe('when two races in the start sequence use the same flag', () => {
    it('returns a single instance of the flag', () => {
        const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
        const raceHandicapB = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T11:35:00Z')};
        const sessionStartSequence = new SessionStartSequence([raceHandicapA_newStart, raceHandicapB]);
    
        const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
        const handicapWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

        const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapB.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        
        const raceHandicapAWarningflagRaiseAction = {flag: handicapWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        const raceHandicapAWarningflagLowerAction = {flag: handicapWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

        const raceHandicapBWarningflagRaiseAction = {flag: handicapWarningFlag, time: new Date(raceHandicapB.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        const raceHandicapBWarningflagLowerAction = {flag: handicapWarningFlag, time: raceHandicapB.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        
        preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
        preparatoryFlag.actions.push(preparatoryFlagLowerAction);
        
        handicapWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
        handicapWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

        handicapWarningFlag.actions.push(raceHandicapBWarningflagRaiseAction);
        handicapWarningFlag.actions.push(raceHandicapBWarningflagLowerAction);

        const flags = sessionStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
    
        expect(flags).toHaveLength(2);
        expect(flags[0]).toStrictEqual(handicapWarningFlag);
        expect(flags[1]).toStrictEqual(preparatoryFlag);
    });
    it('combines the actions for both races into a single actions list', () => {
        const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
        const raceHandicapB = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T11:35:00Z')};
        const sessionStartSequence = new SessionStartSequence([raceHandicapA_newStart, raceHandicapB]);
    
        const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
        const handicapWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, actions: []};

        const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapB.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        
        const raceHandicapAWarningflagRaiseAction = {flag: handicapWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        const raceHandicapAWarningflagLowerAction = {flag: handicapWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};

        const raceHandicapBWarningflagRaiseAction = {flag: handicapWarningFlag, time: new Date(raceHandicapB.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        const raceHandicapBWarningflagLowerAction = {flag: handicapWarningFlag, time: raceHandicapB.plannedStartTime, afterState: FlagState.LOWERED, signalPrepareRaceStartStateChange: true, signalRaceStartStateChange: true};
        
        preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
        preparatoryFlag.actions.push(preparatoryFlagLowerAction);
        
        handicapWarningFlag.actions.push(raceHandicapAWarningflagRaiseAction);
        handicapWarningFlag.actions.push(raceHandicapAWarningflagLowerAction);

        handicapWarningFlag.actions.push(raceHandicapBWarningflagRaiseAction);
        handicapWarningFlag.actions.push(raceHandicapBWarningflagLowerAction);

        const actions = sessionStartSequence.getActions();

        expect(actions[0]).toStrictEqual(raceHandicapAWarningflagRaiseAction);
        expect(actions[1]).toStrictEqual(raceHandicapAWarningflagLowerAction);
        expect(actions[2]).toStrictEqual(raceHandicapBWarningflagRaiseAction);
        expect(actions[3]).toStrictEqual(raceHandicapBWarningflagLowerAction);
        expect(actions[4]).toStrictEqual(preparatoryFlagRaiseAction);
        expect(actions[5]).toStrictEqual(preparatoryFlagLowerAction);
    });
})