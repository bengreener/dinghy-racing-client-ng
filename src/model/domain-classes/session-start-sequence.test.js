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
            const flags = sessionStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
        
            expect(flags).toEqual([{name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}, {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED}]);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 660000));
        
            expect(flags).toEqual([
                {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, action: {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED}},
                {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED}},
                {flag: {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED}, action: {flag: {name: 'Club Burgee', role: FlagRole.WARNING}, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED}}
            ]);
        });
    });
    describe('when 10 minutes before the start of the first race and 15 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
            const flags = sessionStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000));
        
            expect(flags).toEqual([{name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}, {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED}]);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 600000));
        
            expect(flags).toEqual([
                {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED}, action: {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED}},
                {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED}},
                {flag: {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED}, action: {flag: {name: 'Club Burgee', role: FlagRole.WARNING}, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED}}
            ]);
        });
    });
    describe('when 5 minutes before the start of the first race and 10 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
            const flags = sessionStartSequence.getFlagsAtTime(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
        
            expect(flags).toEqual([{name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED}, {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED}]);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(new Date(raceScorpionA.plannedStartTime.valueOf() - 300000));
        
            expect(flags).toEqual([
                {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.RAISED}, action: {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED}},
                {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED}},
                {flag: {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED}, action: {flag: {name: 'Club Burgee', role: FlagRole.WARNING}, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED}}
            ]);
        });
    });
    describe('when 0 minutes before the start of the first race and 5 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
            const flags = sessionStartSequence.getFlagsAtTime(raceScorpionA.plannedStartTime);
        
            expect(flags).toEqual([{name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED}, {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED}]);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(raceScorpionA.plannedStartTime);
        
            expect(flags).toEqual([
                {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, action: undefined},
                {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.RAISED}, action: {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED}},
                {flag: {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.RAISED}, action: {flag: {name: 'Club Burgee', role: FlagRole.WARNING}, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED}}
            ]);
        });
    });
    describe('when 5 minutes after the start of the first race and 0 minutes before start of second race', () => {
        it('returns correct flags', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
            const flags = sessionStartSequence.getFlagsAtTime(raceHandicapA_newStart.plannedStartTime);
        
            expect(flags).toEqual([{name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}, {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED}]);
        });
        it('returns correct flags with correct next action', () => {
            const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
            const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
            const flags = sessionStartSequence.getFlagsAtTimeWithNextAction(raceHandicapA_newStart.plannedStartTime);
        
            expect(flags).toEqual([
                {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING, state: FlagState.LOWERED}, action: undefined},
                {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY, state: FlagState.LOWERED}, action: undefined},
                {flag: {name: 'Club Burgee', role: FlagRole.WARNING, state: FlagState.LOWERED}, action: undefined}
            ]);
        });
    });
    it('returns the correct actions', () => {
        const raceHandicapA_newStart = {...raceHandicapA, plannedStartTime: new Date('2021-10-14T10:35:00Z')};
        const sessionStartSequence = new SessionStartSequence([raceScorpionA, raceHandicapA_newStart]);
        const actions = sessionStartSequence.getActions();

        expect(actions).toEqual([
            {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED},
            {flag: {name: 'Scorpion Class Flag', role: FlagRole.WARNING}, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED},
            {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED},
            {flag: {name: 'Blue Peter', role: FlagRole.PREPARATORY}, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED},
            {flag: {name: 'Club Burgee', role: FlagRole.WARNING}, time: new Date(raceHandicapA_newStart.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED},
            {flag: {name: 'Club Burgee', role: FlagRole.WARNING}, time: raceHandicapA_newStart.plannedStartTime, afterState: FlagState.LOWERED}
        ])
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