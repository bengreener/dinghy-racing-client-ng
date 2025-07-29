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

import { act, screen } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import SignalIndicator from './SignalIndicator';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { httpRootURL, wsRootURL } from '../model/__mocks__/test-data';
import { raceScorpionA, scorpionWarningSignal, scorpionStartSignal } from '../model/__mocks__/test-data';

jest.mock('../model/domain-classes/clock');
jest.useFakeTimers();

describe('when signals use flags', () => {
    it('displays the name of the flags', () => {
        jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() - 600001));
        const signals = [scorpionWarningSignal, scorpionStartSignal];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);

        customRender(<SignalIndicator signals={signals} />, model);

        expect(screen.getByText(/scorpion class flag/i)).toBeInTheDocument();
    });
    describe('when before time of first signal', () => {
        it('displays flags as lowered', () => {
            jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() - 600001));
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);

            customRender(<SignalIndicator signals={signals} />, model);

            expect(screen.getByText(/lowered/i)).toBeInTheDocument();
        });
        it('displays time to next signal', () => {
            jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() - 600001));
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);

            customRender(<SignalIndicator signals={signals} />, model);

            expect(screen.getByText(/00:01/i)).toBeInTheDocument();
        });
    });
    describe('when time of first signal', () => {
        it('shows flag state for first signal', () => {
            jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() - 600000));
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);

            customRender(<SignalIndicator signals={signals} />, model);

            expect(screen.getByText(/raised/i)).toBeInTheDocument();
        });
        it('shows 0:00 for time to next signal', () => {
            jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() - 600000));
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);

            customRender(<SignalIndicator signals={signals} />, model);

            expect(screen.getByText(/00:00/i)).toBeInTheDocument();
        });
    });
    describe('when after time fo first signal and before time of next signal', () => {
        it('shows flag state for first signal', () => {
            jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() - 300001));
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);

            customRender(<SignalIndicator signals={signals} />, model);

            expect(screen.getByText(/raised/i)).toBeInTheDocument();
        });
        it('shows time to next signal', () => {
            jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() - 60000));
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);

            customRender(<SignalIndicator signals={signals} />, model);

            expect(screen.getByText(/01:00/i)).toBeInTheDocument();
        });
    });
    describe('when after time of last signal', () => {
        it('shows flag sate for last signal', () => {
            jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() + 100000));
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);

            customRender(<SignalIndicator signals={signals} />, model);

            expect(screen.getByText(/lowered/i)).toBeInTheDocument();
        });
        it('shows no time to next signal', () => {
            jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() + 100000));
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);

            customRender(<SignalIndicator signals={signals} />, model);

            expect(screen.getByLabelText(/change in/i)).toHaveValue('00:00');
        });
    });
});

describe('when clock ticks', () => {
    it('updates time', async () => {
        // check time to next signal is updated
        jest.setSystemTime(new Date(raceScorpionA.plannedStartTime.getTime() - 600001));
        const signals = [scorpionWarningSignal, scorpionStartSignal];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);

        customRender(<SignalIndicator signals={signals} />, model);

        await act(() => {
            jest.runOnlyPendingTimers();
        });
        expect(screen.getByText(/00:00/i)).toBeInTheDocument();
    });
});