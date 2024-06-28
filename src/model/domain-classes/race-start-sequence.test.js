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
import { httpRootURL, wsRootURL, raceScorpionA, raceHandicapA } from '../__mocks__/test-data';
import FlagRole from './flag-role';
import FlagState from './flag-state';
import StartSignal from './start-signal';
import DinghyRacingModel from '../dinghy-racing-model';

describe('when single dinghy class race using CSC Club Start for a Fleet race', () => {
    describe('when 11 minutes before the start of the race', () => {
        it('returns correct flags', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
        
            expect(flags).toEqual([{name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}]);
        });
        it('returns correct flags with correct next action', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
        
            expect(flags).toEqual([
                {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, action: {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED}},
                {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED}}
            ]);
        });
    });
    describe('when 10 minutes before the start of the race', () => {
        it('returns correct flags', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000));
        
            expect(flags).toEqual([{name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}]);
        });
        it('returns correct flags with correct next action', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000));
        
            expect(flags).toEqual([
                {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED}, action: {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED}},
                {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED}}
            ]);
        });
    });
    describe('when 5 minutes before the start of the race', () => {
        it('returns correct flags', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
        
            expect(flags).toEqual([{name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED}]);
        });
        it('returns correct flags with correct next action', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const flags = raceStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
        
            expect(flags).toEqual([
                {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED}, action: {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED}},
                {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceScorpionA.plannedStartTime), afterState: FlagState.LOWERED}}
            ]);
        });
    });
    describe('when 0 minutes before the start of the race', () => {
        it('returns correct flags', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const flags = raceStartSequence.getFlagsAtTime(raceScorpionA.plannedStartTime);
        
            expect(flags).toEqual([{name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}]);
        });
        it('returns correct flags with correct next action', () => {
            const raceStartSequence = new RaceStartSequence(raceScorpionA);
            const flags = raceStartSequence.getFlagsAtTimeWithNextAction(raceScorpionA.plannedStartTime);
        
            expect(flags).toEqual([
                {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, action: undefined},
                {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}, action: undefined}
            ]);
        });
    });
    it('returns the correct actions', () => {
        const raceStartSequence = new RaceStartSequence(raceScorpionA);
        const actions = raceStartSequence.getActions();

        expect(actions).toEqual([
            {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED},
            {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED},
            {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED},
            {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED}
        ])
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

describe('when handicap race using CSC Club Start for a Fleet race', () => {
    describe('when 11 minutes before the start of the race', () => {
        it('returns correct flags', () => {
            const raceStartSequence = new RaceStartSequence(raceHandicapA);
            const flags = raceStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
        
            expect(flags).toEqual([{name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}]);
        });
    });
    describe('when 10 minutes before the start of the race', () => {
        it('returns correct flags', () => {
            const raceStartSequence = new RaceStartSequence(raceHandicapA);
            const flags = raceStartSequence.getFlagsAtTime(new Date(raceHandicapA.plannedStartTime.valueOf() - 600000));
        
            expect(flags).toEqual([{name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}]);
        });
    });
    describe('when 5 minutes before the start of the race', () => {
        it('returns correct flags', () => {
            const raceStartSequence = new RaceStartSequence(raceHandicapA);
            const flags = raceStartSequence.getFlagsAtTime(new Date(raceHandicapA.plannedStartTime.valueOf() - 30000));
        
            expect(flags).toEqual([{name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED}]);
        });
    });
    describe('when 0 minutes before the start of the race', () => {
        it('returns correct flags', () => {
            const raceStartSequence = new RaceStartSequence(raceHandicapA);
            const flags = raceStartSequence.getFlagsAtTime(raceHandicapA.plannedStartTime);
        
            expect(flags).toEqual([{name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}]);
        });
    });
    it('returns the correct actions', () => {
        const raceStartSequence = new RaceStartSequence(raceHandicapA);
        const actions = raceStartSequence.getActions();

        expect(actions).toEqual([
            {flag: {name: 'Club Burgee', role: FlagRole.WARNING}, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED},
            {flag: {name: 'Club Burgee', role: FlagRole.WARNING}, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED},
            {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED},
            {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED}
        ])
    })
});

