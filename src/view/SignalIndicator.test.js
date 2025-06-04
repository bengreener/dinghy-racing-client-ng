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

import { screen } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import SignalIndicator from './SignalIndicator';
import DinghyRacingModel from '../model/dinghy-racing-model';
import FlagState from '../model/domain-classes/flag-state';
import { httpRootURL, wsRootURL } from '../model/__mocks__/test-data';

describe('when signals use flags', () => {
    describe('when before time of first signal', () => {
        it('displays flags as lowered', () => {
            expect(false).toBeTruthy();
        });
        it('displays time to next signal', () => {
            expect(false).toBeTruthy();
        });
    });
    describe('when time of first signal', () => {
        it('shows flag state for first signal', () => {
            expect(false).toBeTruthy();
        });
        it('shows 0:00 for time to next signal', () => {
            expect(false).toBeTruthy();
        });
    });
    describe('when after time fo first signal and before time of next signal', () => {
        it('shows flag state for first signal', () => {
            expect(false).toBeTruthy();
        });
        it('shows time to next signal', () => {
            expect(false).toBeTruthy();
        });
    });
    describe('when after time of last signal', () => {
        it('shows flag sate for last signal', () => {
            expect(false).toBeTruthy();
        });
        it('shows no time to next signal', () => {
            expect(false).toBeTruthy();
        });
    });
    it('displays ', () => {
        const signals = [
            {meaning: 'test signal 1', time: new Date(Date.now() - 1000), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.RAISED}}, 
            {meaning: 'test signal 2', time: new Date(Date.now() + 59000) , soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.LOWERED}}];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    
        customRender(<SignalIndicator signals={signals} />, model);
        screen.debug();
    });
});

describe('when clock ticks', () => {
    it('updates time', () => {
        // check time to next signal is updated
        expect(false).toBeTruthy();
    });
});

describe('when signals do not use flags', () => {
    // placeholder for future development
});