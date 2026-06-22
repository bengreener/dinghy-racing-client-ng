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

import { act, render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostponeRaceForm from './PostponeRaceForm';
import SylphModel from '../model/sylph-model';
import DirectRace from '../model/direct-race';
import { httpRootURL, wsRootURL, raceScorpionAHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../model/clock.js');

const model = new SylphModel(httpRootURL, wsRootURL);

describe('when contained in a modal dialog', () => {
    it('renders', () => {
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        render(<PostponeRaceForm race={race} closeParent={vi.fn()} />);

        // TODO: fix for british summer time change
        expect(screen.getByLabelText('Planned Start Time')).toHaveValue('11:30:00');
        expect(screen.getByLabelText('Current Start Time')).toHaveValue('11:40:00');
        expect(screen.getByLabelText('New Start Time')).toHaveValue('11:40:00');
        expect(screen.queryByRole('button', {'name': /cancel/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {'name': /postpone/i})).toBeInTheDocument();
    });
    it('when cancelled it closes containing dialog', async () => {
        const closeDialogCallbackMock = vi.fn(() => {});
        const user = userEvent.setup();
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        render(<PostponeRaceForm race={race} closeParent={closeDialogCallbackMock} />);
        const cancelButtton = screen.getByRole('button', {'name': /cancel/i});
        await user.click(cancelButtton);
        expect(closeDialogCallbackMock).toBeCalledTimes(1);
    });
});

describe('when displayed as a component in a non-modal container', () => {
    it('renders', () => {
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        render(<PostponeRaceForm race={race}/>);
        // TODO: fix for british summer time change
        expect(screen.getByLabelText('Current Start Time')).toHaveValue('11:30:00');
        expect(screen.getByLabelText('New Start Time')).toHaveValue('11:30:00');
        expect(screen.queryByRole('button', {'name': /cancel/i})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {'name': /postpone/i})).toBeInTheDocument();
    });
})

describe('when new start time is entered', () => {
    // Had to rewrite C:\Users\benhg\VSCode Workspace\dinghy-racing-client-ng\node_modules\@testing-library\user-event\dist\esm\utils\edit\timeValue.js to make this work
    /**
     const parseInt = globalThis.parseInt;
        function buildTimeValue(value) {
            // assume value may be either a time formatted string or sequence of digits
            // if digits 1 - 2 digits is hours only
            // 3-4 digits first 2 digits is hours & digits 3-4 minutes
            // 5-6 digits first 2 digits is hours, digits 3 & 4 minutes & digits 5-6 seconds
            const onlyDigitsValue = value.replace(/\D/g, '');
            if (onlyDigitsValue.length < 2) {
                return value;
            }
            return build(onlyDigitsValue, 2);
        }
        function build(onlyDigitsValue, index) {
            const hours = onlyDigitsValue.slice(0, Math.min(onlyDigitsValue.length, 2));
            const validHours = Math.min(parseInt(hours, 10), 23);
            const minuteCharacters = onlyDigitsValue.slice(2, Math.min(onlyDigitsValue.length, 4));
            const parsedMinutes = parseInt(minuteCharacters, 10);
            const validMinutes = Math.min(parsedMinutes, 59);
            if (onlyDigitsValue.length > 4) {
                const secondCharacters = onlyDigitsValue.slice(4, Math.min(onlyDigitsValue.length, 6));
                const parsedSeconds = parseInt(secondCharacters, 10);
                const validSeconds = Math.min(parsedSeconds, 59);
                return `${validHours.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}:${validSeconds.toString().padStart(2, '0')}`;
            }
            return `${validHours.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}`;
        }
        function isValidDateOrTimeValue(element, value) {
            const clone = element.cloneNode();
            clone.value = value;
            return clone.value === value;
        }

        export { buildTimeValue, isValidDateOrTimeValue };
     */
    it('accepts new start time', async () => {
        const user = userEvent.setup();
        const race = new DirectRace({...raceScorpionAHAL, plannedStartTime: new Date('2021-10-14T00:01:00')}, {version: '"0"'}, model);
        render(<PostponeRaceForm race={race}/>);
        const newTimeInput = screen.getByLabelText('New Start Time');
        await act(async () => {
            await user.type(newTimeInput, '1', {initialSelectionStart: 0, initialSelectionEnd: 1});
            await user.type(newTimeInput, '2', {initialSelectionStart: 1, initialSelectionEnd: 2});
            await user.type(newTimeInput, '3', {initialSelectionStart: 3, initialSelectionEnd: 4});
            await user.type(newTimeInput, '0', {initialSelectionStart: 4, initialSelectionEnd: 5});
        });
        expect(newTimeInput).toHaveValue('12:30:00');
    });
});

describe('when postpone button clicked', () => {
    it('postpones race', async () => {
        const postponeCallbackMock = vi.fn((race, duration) => {});
        const user = userEvent.setup();
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        render(<PostponeRaceForm race={race} onPostpone={postponeCallbackMock} />);
        const postponeButtton = screen.getByRole('button', {'name': /postpone/i});
        await user.click(postponeButtton);
        expect(postponeCallbackMock).toBeCalledTimes(1);
    });
});

describe('when enter button is pressed', () => {
    it('postpones race', async () => {
        const postponeCallbackMock = vi.fn((race, duration) => {});
        const user = userEvent.setup();
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        render(<PostponeRaceForm race={race} onPostpone={postponeCallbackMock} />);
        await user.keyboard('{Enter}');
        expect(postponeCallbackMock).toBeCalledTimes(1);
    });
});