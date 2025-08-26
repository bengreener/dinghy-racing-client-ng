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
import { raceScorpionA } from '../model/__mocks__/test-data';

describe('when contained in a modal dialog', () => {
    it('renders', () => {
        render(<PostponeRaceForm closeParent={vi.fn()} />);
        expect(screen.getByRole('spinbutton', {'name': /delay/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {'name': /cancel/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {'name': /postpone/i})).toBeInTheDocument();
    });
    it('when cancelled it closes containing dialog', async () => {
        const closeDialogeCallbackMock = vi.fn(() => {});
        const user = userEvent.setup();
        render(<PostponeRaceForm closeParent={closeDialogeCallbackMock} />);
        const cancelButtton = screen.getByRole('button', {'name': /cancel/i});
        await user.click(cancelButtton);
        expect(closeDialogeCallbackMock).toBeCalledTimes(1);
    });
});

describe('when displayed as a component in a non-modal container', () => {
    it('renders', () => {
        render(<PostponeRaceForm />);
        expect(screen.getByRole('spinbutton', {'name': /delay/i})).toBeInTheDocument();
        expect(screen.queryByRole('button', {'name': /cancel/i})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {'name': /postpone/i})).toBeInTheDocument();
    });
})

describe('when delay is input', () => {
    it('accepts delay input', async () => {
        const user = userEvent.setup();
        render(<PostponeRaceForm />);
        const delayInput = screen.getByRole('spinbutton', {'name': /delay/i});
        await act(async () => {
            await user.clear(delayInput);
            await user.type(delayInput, '155');
        });
        expect(delayInput).toHaveValue(155);
    });
    it('does not accept negative duration value', async () => {
        const user = userEvent.setup();
        render(<PostponeRaceForm />);
        const delayInput = screen.getByRole('spinbutton', {'name': /delay/i});
        await act(async () => {
            await user.clear(delayInput);
            await user.type(delayInput, '-20');
        });
        expect(delayInput).not.toHaveValue(-20);
    })
});

describe('when postpone button clicked', () => {
    it('postpones race', async () => {
        const postponeCallbackMock = vi.fn((race, duration) => {});
        const user = userEvent.setup();
        render(<PostponeRaceForm race={raceScorpionA} onPostpone={postponeCallbackMock} />);
        const postponeButtton = screen.getByRole('button', {'name': /postpone/i});
        await user.click(postponeButtton);
        expect(postponeCallbackMock).toBeCalledTimes(1);
    });
});

describe('when enter button is pressed', () => {
    it('postpones race', async () => {
        const postponeCallbackMock = vi.fn((race, duration) => {});
        const user = userEvent.setup();
        render(<PostponeRaceForm race={raceScorpionA} onPostpone={postponeCallbackMock} />);
        const delayInput = screen.getByRole('spinbutton', {'name': /delay/i});
        await user.keyboard('{Enter}');
        expect(postponeCallbackMock).toBeCalledTimes(1);
    });
});