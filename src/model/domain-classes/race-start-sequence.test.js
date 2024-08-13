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
import { httpRootURL, wsRootURL, raceScorpionA, raceHandicapA, racePursuitA } from '../__mocks__/test-data';
import FlagRole from './flag-role';
import FlagState from './flag-state';
import StartSignal from './start-signal';
import DinghyRacingModel from '../dinghy-racing-model';
import StartType from './start-type';


describe('when using CSC club start', () => {
    describe('when single dinghy class Fleet race', () => {
        it('returns flags', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const flags = raceStartSequence.getFlags(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
        
            const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
            warningFlag.actions.push(warningflagRaiseAction);
            warningFlag.actions.push(warningflagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            expect(flags).toEqual([warningFlag, preparatoryFlag]);
        });
        describe('when 11 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence(raceScorpionA);
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceStartSequence = new RaceStartSequence(raceScorpionA);
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags[0].flag).toStrictEqual(warningFlag);
                expect(flags[0].action).toStrictEqual(warningflagRaiseAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagRaiseAction);
            });
        });
        describe('when 10 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence(raceScorpionA);
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceStartSequence = new RaceStartSequence(raceScorpionA);
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags[0].flag).toStrictEqual(warningFlag);
                expect(flags[0].action).toStrictEqual(warningflagLowerAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagRaiseAction);
            });
        });
        describe('when 5 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence(raceScorpionA);
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceStartSequence = new RaceStartSequence(raceScorpionA);
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags[0].flag).toStrictEqual(warningFlag);
                expect(flags[0].action).toStrictEqual(warningflagLowerAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagLowerAction);
            });
        });
        describe('when 0 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence(raceScorpionA);
                const flags = raceStartSequence.getFlagsAtTime(raceScorpionA.plannedStartTime);
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceStartSequence = new RaceStartSequence(raceScorpionA);
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(raceScorpionA.plannedStartTime);
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags[0].flag).toStrictEqual(warningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
            });
        });
        it('returns the correct actions', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const actions = raceStartSequence.getActions();
            
            const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
    
            warningFlag.actions.push(warningflagRaiseAction);
            warningFlag.actions.push(warningflagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            expect(actions[0]).toStrictEqual(warningflagRaiseAction);
            expect(actions[1]).toStrictEqual(warningflagLowerAction);
            expect(actions[2]).toStrictEqual(preparatoryFlagRaiseAction);
            expect(actions[3]).toStrictEqual(preparatoryFlagLowerAction);
        });
        describe('when updating the race start state', () => {
            describe('when 11 minutes before the start of the race', () => {
                it('does not update the model', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence(raceScorpionA, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
                    expect(updateRaceStartSequenceStateSpy).not.toHaveBeenCalled();
                });
            });
            describe('when 10 minutes before the start of the race', () => {
                it('updates the remote model to show warning signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence(raceScorpionA, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(raceScorpionA, StartSignal.WARNINGSIGNAL);
                });
            });
            describe('when 5 minutes before the start of the race', () => {
                it('updates the remote model to show preparatory signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence(raceScorpionA, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(raceScorpionA, StartSignal.PREPARATORYSIGNAL);
                });
            });
            describe('when 1 minutes before the start of the race', () => {
                it('does not update the model', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence(raceScorpionA, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 60000));
                    expect(updateRaceStartSequenceStateSpy).not.toHaveBeenCalled();
                });
            });
            describe('when 0 minutes before the start of the race', () => {
                it('updates the remote model to show start signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence(raceScorpionA, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf()))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(raceScorpionA, StartSignal.STARTINGSIGNAL);
                });
            });
        });
    });
    describe('when Fleet handicap race', () => {
        describe('when 11 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence(raceHandicapA);
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceHandicapA.plannedStartTime.valueOf() - 660000));
            
                const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
        });
        describe('when 10 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence(raceHandicapA);
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceHandicapA.plannedStartTime.valueOf() - 600000));
            
                const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            });
        });
        describe('when 5 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence(raceHandicapA);
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceHandicapA.plannedStartTime.valueOf() - 30000));
            
                const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            });
        });
        describe('when 0 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence(raceHandicapA);
                const flags = raceStartSequence.getFlagsAtTime(raceHandicapA.plannedStartTime);
            
                const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
        });
        it('returns the correct actions', () => {
            const raceStartSequence = new RaceStartSequence(raceHandicapA);
            const actions = raceStartSequence.getActions();
            
            const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
    
            warningFlag.actions.push(warningflagRaiseAction);
            warningFlag.actions.push(warningflagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            expect(actions[0]).toStrictEqual(warningflagRaiseAction);
            expect(actions[1]).toStrictEqual(warningflagLowerAction);
            expect(actions[2]).toStrictEqual(preparatoryFlagRaiseAction);
            expect(actions[3]).toStrictEqual(preparatoryFlagLowerAction);
        })
    });
    describe('when Pursuit race', () => {
        it('returns flags', () => {
            const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
            const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
        
            const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, actions: []};
            const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, actions: []};
            const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
            const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
            const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
            const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
            const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
            baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
            baseWarningFlag.actions.push(baseWarningFlagLowerAction);
            topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
            topperWarningFlag.actions.push(topperWarningFlagLowerAction);
            laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
            laserWarningFlag.actions.push(laserWarningFlagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            const flags = raceStartSequence.getFlags(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 660000));
    
            expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
        });
        describe('when 11 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(racePursuitA.plannedStartTime.valueOf() - 660000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 660000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(baseWarningFlagRaiseAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagRaiseAction);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagRaiseAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 10 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(baseWarningFlagLowerAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagRaiseAction);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagRaiseAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 5 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(racePursuitA.plannedStartTime.valueOf() - 300000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(baseWarningFlagLowerAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagLowerAction);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagRaiseAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 0 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(raceWithDinghyClasses.plannedStartTime);
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(raceWithDinghyClasses.plannedStartTime);
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagRaiseAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 11 minutes after the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 660000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 660000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagLowerAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 17 minutes after the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1020000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1020000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: undefined});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagLowerAction});
            });
        });
        describe('when 17 minutes 55 seconds after the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.CSCCLUBSTART};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: undefined});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: undefined});
            });
        });
        it('returns the correct actions', () => {
            const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.CSCCLUBSTART});
            const actions = raceStartSequence.getActions();
            
            const warningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const warningflagRaiseAction = {flag: warningFlag, time: new Date(racePursuitA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
            const warningflagLowerAction = {flag: warningFlag, time: racePursuitA.plannedStartTime, afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(racePursuitA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: racePursuitA.plannedStartTime, afterState: FlagState.LOWERED};
    
            warningFlag.actions.push(warningflagRaiseAction);
            warningFlag.actions.push(warningflagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            expect(actions[0]).toStrictEqual(warningflagRaiseAction);
            expect(actions[1]).toStrictEqual(warningflagLowerAction);
            expect(actions[2]).toStrictEqual(preparatoryFlagRaiseAction);
            expect(actions[3]).toStrictEqual(preparatoryFlagLowerAction);
        });
        describe('when updating the race start state', () => {
            describe('when 11 minutes before the start of the race', () => {
                it('does not update the model', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.CSCCLUBSTART}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf() - 660000));
                    expect(updateRaceStartSequenceStateSpy).not.toHaveBeenCalled();
                });
            });
            describe('when 10 minutes before the start of the race', () => {
                it('updates the remote model to show warning signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.CSCCLUBSTART}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf() - 600000))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith({...racePursuitA, startType: StartType.CSCCLUBSTART}, StartSignal.WARNINGSIGNAL);
                });
            });
            describe('when 5 minutes before the start of the race', () => {
                it('updates the remote model to show preparatory signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.CSCCLUBSTART}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf() - 300000))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith({...racePursuitA, startType: StartType.CSCCLUBSTART}, StartSignal.PREPARATORYSIGNAL);
                });
            });
            describe('when 1 minutes before the start of the race', () => {
                it('does not update the model', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.CSCCLUBSTART}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf() - 60000));
                    expect(updateRaceStartSequenceStateSpy).not.toHaveBeenCalled();
                });
            });
            describe('when 0 minutes before the start of the race', () => {
                it('updates the remote model to show start signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.CSCCLUBSTART}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf()))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith({...racePursuitA, startType: StartType.CSCCLUBSTART}, StartSignal.STARTINGSIGNAL);
                });
            });
        });
    });
});

describe('when using RRS26 start', () => {
    describe('when single dinghy class Fleet race', () => {
        it('returns flags', () => {
            const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
            const flags = raceStartSequence.getFlags(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
        
            const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
            warningFlag.actions.push(warningflagRaiseAction);
            warningFlag.actions.push(warningflagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            expect(flags).toEqual([warningFlag, preparatoryFlag]);
        });
        describe('when 6 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 360000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 360000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags[0].flag).toStrictEqual(warningFlag);
                expect(flags[0].action).toStrictEqual(warningflagRaiseAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagRaiseAction);
            });
        });
        describe('when 5 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags[0].flag).toStrictEqual(warningFlag);
                expect(flags[0].action).toStrictEqual(warningflagLowerAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagRaiseAction);
            });
        });
        describe('when 4 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 240000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 240000));
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags[0].flag).toStrictEqual(warningFlag);
                expect(flags[0].action).toStrictEqual(warningflagLowerAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagLowerAction);
            });
        });
        describe('when 0 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTime(raceScorpionA.plannedStartTime);
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(raceScorpionA.plannedStartTime);
            
                const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags[0].flag).toStrictEqual(warningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
            });
        });
        it('returns the correct actions', () => {
            const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26});
            const actions = raceStartSequence.getActions();
            
            const warningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const warningflagLowerAction = {flag: warningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
            warningFlag.actions.push(warningflagRaiseAction);
            warningFlag.actions.push(warningflagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            expect(actions[0]).toStrictEqual(warningflagRaiseAction);
            expect(actions[1]).toStrictEqual(warningflagLowerAction);
            expect(actions[2]).toStrictEqual(preparatoryFlagRaiseAction);
            expect(actions[3]).toStrictEqual(preparatoryFlagLowerAction);
        });
        describe('when updating the race start state', () => {
            describe('when 6 minutes before the start of the race', () => {
                it('does not update the model', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 360000));
                    expect(updateRaceStartSequenceStateSpy).not.toHaveBeenCalled();
                });
            });
            describe('when 5 minutes before the start of the race', () => {
                it('updates the remote model to show warning signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith({...raceScorpionA, startType: StartType.RRS26}, StartSignal.WARNINGSIGNAL);
                });
            });
            describe('when 4 minutes before the start of the race', () => {
                it('updates the remote model to show preparatory signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 240000))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith({...raceScorpionA, startType: StartType.RRS26}, StartSignal.PREPARATORYSIGNAL);
                });
            });
            describe('when 1 minutes before the start of the race', () => {
                it('updates the remote model to show one minute signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf() - 60000))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith({...raceScorpionA, startType: StartType.RRS26}, StartSignal.ONEMINUTE);
                });
            });
            describe('when 0 minutes before the start of the race', () => {
                it('updates the remote model to show start signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...raceScorpionA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(raceScorpionA.plannedStartTime.valueOf()))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith({...raceScorpionA, startType: StartType.RRS26}, StartSignal.STARTINGSIGNAL);
                });
            });
        });
    });
    describe('when Fleet handicap race', () => {
        describe('when 6 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence({...raceHandicapA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceHandicapA.plannedStartTime.valueOf() - 360000));
            
                const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
        });
        describe('when 5 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence({...raceHandicapA, startType: StartType.RRS26});
                raceStartSequence.getFlagsAtTime(new Date(raceHandicapA.plannedStartTime.valueOf() - 300000));
            
                const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            });
        });
        describe('when 4 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence({...raceHandicapA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceHandicapA.plannedStartTime.valueOf() - 24000));
            
                const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            });
        });
        describe('when 0 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceStartSequence = new RaceStartSequence({...raceHandicapA, startType: StartType.RRS26});
                const flags = raceStartSequence.getFlagsAtTime(raceHandicapA.plannedStartTime);
            
                const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                warningFlag.actions.push(warningflagRaiseAction);
                warningFlag.actions.push(warningflagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
                expect(flags).toEqual([warningFlag, preparatoryFlag]);
            });
        });
        it('returns the correct actions', () => {
            const raceStartSequence = new RaceStartSequence({...raceHandicapA, startType: StartType.RRS26});
            const actions = raceStartSequence.getActions();
            
            const warningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const warningflagRaiseAction = {flag: warningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const warningflagLowerAction = {flag: warningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
            warningFlag.actions.push(warningflagRaiseAction);
            warningFlag.actions.push(warningflagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            expect(actions[0]).toStrictEqual(warningflagRaiseAction);
            expect(actions[1]).toStrictEqual(warningflagLowerAction);
            expect(actions[2]).toStrictEqual(preparatoryFlagRaiseAction);
            expect(actions[3]).toStrictEqual(preparatoryFlagLowerAction);
        })
    });
    describe('when Pursuit race', () => {
        it('returns flags', () => {
            const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
            const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
        
            const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, actions: []};
            const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, actions: []};
            const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
            const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
            const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
            const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
            const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
            baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
            baseWarningFlag.actions.push(baseWarningFlagLowerAction);
            topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
            topperWarningFlag.actions.push(topperWarningFlagLowerAction);
            laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
            laserWarningFlag.actions.push(laserWarningFlagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            const flags = raceStartSequence.getFlags(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 660000));
    
            expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
        });
        describe('when 6 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(racePursuitA.plannedStartTime.valueOf() - 360000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 360000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(baseWarningFlagRaiseAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagRaiseAction);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagRaiseAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 5 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(baseWarningFlagLowerAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagRaiseAction);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagRaiseAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 4 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(racePursuitA.plannedStartTime.valueOf() - 240000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(baseWarningFlagLowerAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(preparatoryFlagLowerAction);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagRaiseAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 1 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(racePursuitA.plannedStartTime.valueOf() - 60000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(baseWarningFlagLowerAction);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagRaiseAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 0 minutes before the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(raceWithDinghyClasses.plannedStartTime);
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(raceWithDinghyClasses.plannedStartTime);
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagRaiseAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 11 minutes after the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 660000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 660000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: topperWarningFlagLowerAction});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagRaiseAction});
            });
        });
        describe('when 17 minutes after the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1020000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1020000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: undefined});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: laserWarningFlagLowerAction});
            });
        });
        describe('when 17 minutes 55 seconds after the start of the race', () => {
            it('returns correct flags', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTime(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000));
    
                expect(flags).toEqual([baseWarningFlag, preparatoryFlag, topperWarningFlag, laserWarningFlag]);
            });
            it('returns correct flags with correct next action', () => {
                const raceWithDinghyClasses = {...racePursuitA, dinghyClasses: [{name: 'Topper', crewSize: 1, portsmouthNumber: 1369}, {name: 'Laser', crewSize: 1, portsmouthNumber: 1102}], startType: StartType.RRS26};
                const raceStartSequence = new RaceStartSequence(raceWithDinghyClasses);
            
                const baseWarningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED, actions: []};
                const topperWarningFlag = {name: 'Topper Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const laserWarningFlag = {name: 'Laser Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED, actions: []};
                const baseWarningFlagRaiseAction = {flag: baseWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
                const baseWarningFlagLowerAction = {flag: baseWarningFlag, time: raceWithDinghyClasses.plannedStartTime, afterState: FlagState.LOWERED};
                const topperWarningFlagRaiseAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 682000), afterState: FlagState.RAISED};
                const topperWarningFlagLowerAction = {flag: topperWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 682000), afterState: FlagState.LOWERED};
                const laserWarningFlagRaiseAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000 + 1075000), afterState: FlagState.RAISED};
                const laserWarningFlagLowerAction = {flag: laserWarningFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000), afterState: FlagState.LOWERED};
                const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
                const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(raceWithDinghyClasses.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
                baseWarningFlag.actions.push(baseWarningFlagRaiseAction);
                baseWarningFlag.actions.push(baseWarningFlagLowerAction);
                topperWarningFlag.actions.push(topperWarningFlagRaiseAction);
                topperWarningFlag.actions.push(topperWarningFlagLowerAction);
                laserWarningFlag.actions.push(laserWarningFlagRaiseAction);
                laserWarningFlag.actions.push(laserWarningFlagLowerAction);
                preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
                preparatoryFlag.actions.push(preparatoryFlagLowerAction);
                
                const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceWithDinghyClasses.plannedStartTime.valueOf() + 1075000));
    
                expect(flags).toHaveLength(4);
                expect(flags[0].flag).toStrictEqual(baseWarningFlag);
                expect(flags[0].action).toStrictEqual(undefined);
                expect(flags[1].flag).toStrictEqual(preparatoryFlag);
                expect(flags[1].action).toStrictEqual(undefined);
                expect(flags[2]).toStrictEqual({flag: topperWarningFlag, action: undefined});
                expect(flags[3]).toStrictEqual({flag: laserWarningFlag, action: undefined});
            });
        });
        it('returns the correct actions', () => {
            const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.RRS26});
            const actions = raceStartSequence.getActions();
            
            const warningFlag = {name: 'Optimist (Club) Class Flag', role: FlagRole.WARNING, actions: []};
            const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
            const warningflagRaiseAction = {flag: warningFlag, time: new Date(racePursuitA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
            const warningflagLowerAction = {flag: warningFlag, time: racePursuitA.plannedStartTime, afterState: FlagState.LOWERED};
            const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(racePursuitA.plannedStartTime.valueOf() - 240000), afterState: FlagState.RAISED};
            const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: new Date(racePursuitA.plannedStartTime.valueOf() - 60000), afterState: FlagState.LOWERED};
    
            warningFlag.actions.push(warningflagRaiseAction);
            warningFlag.actions.push(warningflagLowerAction);
            preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
            preparatoryFlag.actions.push(preparatoryFlagLowerAction);
    
            expect(actions[0]).toStrictEqual(warningflagRaiseAction);
            expect(actions[1]).toStrictEqual(warningflagLowerAction);
            expect(actions[2]).toStrictEqual(preparatoryFlagRaiseAction);
            expect(actions[3]).toStrictEqual(preparatoryFlagLowerAction);
        });
        describe('when updating the race start state', () => {
            describe('when 6 minutes before the start of the race', () => {
                it('does not update the model', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf() - 360000));
                    expect(updateRaceStartSequenceStateSpy).not.toHaveBeenCalled();
                });
            });
            describe('when 5 minutes before the start of the race', () => {
                it('updates the remote model to show warning signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf() - 300000))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(racePursuitA, StartSignal.WARNINGSIGNAL);
                });
            });
            describe('when 4 minutes before the start of the race', () => {
                it('updates the remote model to show preparatory signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf() - 240000))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(racePursuitA, StartSignal.PREPARATORYSIGNAL);
                });
            });
            describe('when 1 minutes before the start of the race', () => {
                it('updates the remote model to show one minute signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf() - 60000));
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(racePursuitA, StartSignal.ONEMINUTE);
                });
            });
            describe('when 0 minutes before the start of the race', () => {
                it('updates the remote model to show start signal given', () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const updateRaceStartSequenceStateSpy = jest.spyOn(model, 'updateRaceStartSequenceState');
                    const raceStartSequence = new RaceStartSequence({...racePursuitA, startType: StartType.RRS26}, model);
                
                    raceStartSequence.updateRaceState(new Date(racePursuitA.plannedStartTime.valueOf()))
                    expect(updateRaceStartSequenceStateSpy).toHaveBeenCalledWith(racePursuitA, StartSignal.STARTINGSIGNAL);
                });
            });
        });
    });
});