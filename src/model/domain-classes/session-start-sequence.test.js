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

import { httpRootURL, wsRootURL, raceScorpionA, raceHandicapA } from '../__mocks__/test-data';
import FlagRole from './flag-role';
import FlagState from './flag-state';
import StartSignal from './start-signal';
import DinghyRacingModel from '../dinghy-racing-model';

describe('when CSC Club Start for Fleet races', () => {
    describe('when 11 minutes before the start of the first race and 16 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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
    });
    describe('when 10 minutes before the start of the first race and 15 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
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

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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
    });
    describe('when 5 minutes after the start of the first race and 0 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
            const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
            const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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

            const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
            
            const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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
    });
    it('returns the correct actions', () => {
        const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
        const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        
        const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, actions: []};
        const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
        const raceHandicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, actions: []};

        const scorpionAWarningflagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
        const scorpionAWarningflagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
        
        const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
        const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};
        
        const raceHandicapAWarningflagRaiseAction = {flag: raceHandicapAWarningFlag, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
        const raceHandicapAWarningflagLowerAction = {flag: raceHandicapAWarningFlag, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED};

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
    describe('when updating the race start state', () => {
        describe('when 11 minutes before the start of the first race and 16 minutes before start of second race', () => {
            it('does not update the model', () => {
                const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], model);
            
                sessionStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
                expect(updateRaceStartSequenceStateSpy).not.toHaveBeenCalled();
            });
        });
        describe('when 10 minutes before the start of the first race and 15 minutes before start of second race', () => {
            it('updates the remote model to show warning signal given', () => {
                const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], model);
            
                sessionStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000));
                expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledTimes(1);
                expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(raceScorpionA, StartSignal.WARNINGSIGNAL);
            });
        });
        describe('when 5 minutes before the start of the first race and 10 minutes before start of second race', () => {
            it('updates the remote model to show preparatory signal given', () => {
                const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], model);
            
                sessionStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000))
                expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(raceScorpionA, StartSignal.PREPARATORYSIGNAL);
                expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(raceHandicapA_newStart, StartSignal.WARNINGSIGNAL);
            });
        });
        describe('when 1 minutes before the start of the race and 6 minutes before the start of the second race', () => {
            it('does not update the model', () => {
                const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], model);
            
                sessionStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 60000));
                expect(updateRaceStartSequenceStateSpy).not.toHaveBeenCalled();
            });
        });
        describe('when 0 minutes before the start of the first race and 5 minutes before start of second race', () => {
            it('updates the remote model to show start signal given', () => {
                const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], model);
            
                sessionStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf()));
                expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(raceScorpionA, StartSignal.STARTINGSIGNAL);
                expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(raceHandicapA_newStart, StartSignal.PREPARATORYSIGNAL);
            });
        });
        describe('when 5 minutes after the start of the first race and 0 minutes before start of second race', () => {
            it('updates the remote model to show start signal given', () => {
                const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart], model);
            
                sessionStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() + 300000));
                expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledTimes(1);
                expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(raceHandicapA_newStart, StartSignal.STARTINGSIGNAL);
            });
        });
    });
});