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

import { act, render, screen } from '@testing-library/react';
import SignalIndicator from './SignalIndicator';
import Clock from '../model/clock';
import FlagState from '../model/flag-state';
import { raceScorpionAHAL } from '../model/__mocks__/test-data';

vi.mock('../model/clock');

beforeAll(() => {
    vi.useFakeTimers();
});

afterEach(async () => {
    await act(async () => {
        vi.runOnlyPendingTimers();
    });
});

afterAll(() => {
    vi.useRealTimers();
});

const scorpionClassFlag = {name: 'Scorpion Class Flag'};
const scorpionWarningVisualSignal = {flags: [scorpionClassFlag], flagsState: FlagState.RAISED};
const scorpionStartVisualSignal = {flags: [scorpionClassFlag], flagsState: FlagState.LOWERED};
const scorpionStartSoundSignal = {description: 'One'};
const scorpionWarningSoundSignal = {description: 'One'};
const scorpionWarningSignal = {meaning: 'Warning signal', time: new Date(raceScorpionAHAL.plannedStartTime).getTime() - 600000, soundSignal: scorpionWarningSoundSignal, visualSignal: scorpionWarningVisualSignal};
const scorpionStartSignal = {meaning: 'Starting signal', time: new Date(raceScorpionAHAL.plannedStartTime).getTime(), soundSignal: scorpionStartSoundSignal, visualSignal: scorpionStartVisualSignal};

describe('when signals use flags', () => {
    it('displays the name of the flags', () => {
        vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 600001);
        const signals = [scorpionWarningSignal, scorpionStartSignal];
        render(<SignalIndicator signals={signals} clock={new Clock()} />);

        expect(screen.getByText(/scorpion class flag/i)).toBeInTheDocument();
    });
    describe('when before time of first signal', () => {
        it('displays time then up arrow and then flag', () => {
            vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 600001);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);
            const signalFlag = screen.getByTestId('signal-flag-./flags/z.svg');
            const signalFlagActionIcon = screen.getByTestId('signal-flag-action-icon');
            const signalFlagActionTime = screen.getByTestId('signal-flag-action-time');

            expect(signalFlagActionTime.compareDocumentPosition(signalFlagActionIcon)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
            expect(signalFlagActionIcon.classList.contains('flipped')).toBeFalsy();
            expect(signalFlagActionIcon.compareDocumentPosition(signalFlag)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        });
        it('displays time to next signal', () => {
             vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 600001);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);

            expect(screen.getByText(/00:01/i)).toBeInTheDocument();
        });
    });
    describe('when more than one minute to flag change', () => {
        it('does not add one-minute-to-flag-change class to time container', () => {
            vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 60001);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);
            const signalFlagActionContainer = screen.getByTestId('signal-flag-action-container');

            expect(signalFlagActionContainer.classList.contains('one-minute-to-flag-change')).toBeFalsy();
        });
    })
    describe('when one minute to flag change', () => {
        it('adds one-minute-to-flag-change class to time container', () => {
            vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 60000);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);
            const signalFlagActionContainer = screen.getByTestId('signal-flag-action-container');

            expect(signalFlagActionContainer.classList.contains('one-minute-to-flag-change')).toBeTruthy();
        });
    });
    describe('when time of first signal', () => {
        it('shows flag state for first signal', () => {
            vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 600000);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);
            const signalFlag = screen.getByTestId('signal-flag-./flags/z.svg');
            const signalFlagActionIcon = screen.queryByTestId('signal-flag-action-icon');
            const signalFlagActionTime = screen.getByTestId('signal-flag-action-time');

            expect(signalFlag.compareDocumentPosition(signalFlagActionTime)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
            expect(signalFlagActionIcon).not.toBeInTheDocument();
        });
        it('shows 0:00 for time to next signal', () => {
            vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 600000);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);

            expect(screen.getByText(/00:00/i)).toBeInTheDocument();
        });
    });
    describe('when after time to first signal and before time of next signal', () => {
        it('shows flag state for first signal', () => {
            vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 300001);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);
            const signalFlag = screen.getByTestId('signal-flag-./flags/z.svg');
            const signalFlagActionIcon = screen.getByTestId('signal-flag-action-icon');
            const signalFlagActionTime = screen.getByTestId('signal-flag-action-time');

            expect(signalFlag.compareDocumentPosition(signalFlagActionIcon)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
            expect(signalFlagActionIcon.classList.contains('flipped')).toBeTruthy();
            expect(signalFlagActionIcon.compareDocumentPosition(signalFlagActionTime)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        });
        it('shows time to next signal', () => {
            vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 60000);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);

            expect(screen.getByText(/01:00/i)).toBeInTheDocument();
        });
    });
    describe('when after time of last signal', () => {
        it('shows flag sate for after last signal', () => {
            vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() + 1);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);
            const signalFlag = screen.getByTestId('signal-flag-./flags/z.svg');
            const signalFlagActionIcon = screen.queryByTestId('signal-flag-action-icon');
            const signalFlagActionTime = screen.getByTestId('signal-flag-action-time');

            expect(signalFlagActionTime.compareDocumentPosition(signalFlag)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
            expect(signalFlagActionIcon).not.toBeInTheDocument();
        });
        it('shows no time to next signal', () => {
            vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() + 100000);
            const signals = [scorpionWarningSignal, scorpionStartSignal];
            render(<SignalIndicator signals={signals} clock={new Clock()} />);

            expect(screen.getByText(/00:00/i)).toBeInTheDocument();
        });
    });
});

describe('when clock ticks', () => {
    it('updates time', async () => {
        // check time to next signal is updated
        vi.setSystemTime(new Date(raceScorpionAHAL.plannedStartTime).getTime() - 600001);
        const clock = new Clock();
        // clock.start();
        const signals = [scorpionWarningSignal, scorpionStartSignal];

        render(<SignalIndicator signals={signals} clock={clock} />);

        await act(async () => {
            vi.runOnlyPendingTimers();
        })
        
        expect(screen.getByText(/00:00/i)).toBeInTheDocument();
    });
});