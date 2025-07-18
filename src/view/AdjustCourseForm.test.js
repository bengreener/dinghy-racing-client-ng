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
import userEvent from '@testing-library/user-event';
import AdjustCourseForm from './AdjustCourseForm';
import { raceScorpionA } from '../model/__mocks__/test-data';

it('renders', () => {
    render(<AdjustCourseForm />);
    expect(screen.getByLabelText(/set laps/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Update Laps/})).toBeInTheDocument();
});

it('displays new value typed in for laps', async () => {
    const user = userEvent.setup();
    render(<AdjustCourseForm minLaps={0}/>); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
    const lapInput = screen.getByLabelText(/set laps/i);
    await act(async () => {
        await user.clear(lapInput);
        await user.type(lapInput, '5');
    });
    expect(lapInput).toHaveValue(5);
});

it('does not accept an input greater than value set for maximum laps', async () => {
    const user = userEvent.setup();
    render(<AdjustCourseForm minLaps={0} maxLaps={3} />);
    const lapInput = screen.getByLabelText(/set laps/i);
    await act(async () => {
        await user.clear(lapInput);
        await user.type(lapInput, '5');
    });
    expect(lapInput).not.toHaveValue(5);
});

it('does not accept an input less than value set for minimum laps', async () => {
    const user = userEvent.setup();
    render(<AdjustCourseForm minLaps={3} />);
    const lapInput = screen.getByLabelText(/set laps/i);
    await act(async () => {
        await user.clear(lapInput); // fails as value would be 0
        await user.type(lapInput, '2'); // results in a value of 32
    });
    expect(lapInput).not.toHaveValue(2);
});

it('shows initial value set for number of laps', () => {
    render(<AdjustCourseForm initialValue={3} />);
    expect(screen.getByLabelText(/set laps/i)).toHaveValue(3);
});

describe('when update laps button clicked', () => {
    it('calls function passed to onUpdate with race and value entered for laps', async () => {
        const onUpdateSpy = jest.fn();
        const user = userEvent.setup();
        render(<AdjustCourseForm race={raceScorpionA} minLaps={0} maxLaps={5} initialValue={3} onUpdate={onUpdateSpy} />);
        const lapInput = screen.getByLabelText(/set laps/i);
        await act(async () => {
            await user.clear(lapInput);
            await user.type(lapInput, '4');
        });
        await user.click(screen.getByRole('button', {name: /Update Laps/}));
        expect(onUpdateSpy).toHaveBeenCalledWith(raceScorpionA, 4);
    });
});

describe('when enter button is pressed', () => {
    it('calls function passed to onUpdate with race and value entered for laps', async () => {
        const onUpdateSpy = jest.fn();
        const user = userEvent.setup();
        render(<AdjustCourseForm race={raceScorpionA} minLaps={0} maxLaps={5} initialValue={3} onUpdate={onUpdateSpy} />);
        const lapInput = screen.getByLabelText(/set laps/i);
        await user.keyboard('{Enter}');
        expect(onUpdateSpy).toHaveBeenCalledWith(raceScorpionA, 3);
    });
});

describe('when contained in a modal dialog', () => {
    describe('when update laps button clicked', () => {
        it('closes containing dialog', async () => {
            const onUpdateSpy = jest.fn();
            const closeParentSpy = jest.fn();
            const user = userEvent.setup();
            render(<AdjustCourseForm race={raceScorpionA} minLaps={0} maxLaps={5} initialValue={3} onUpdate={onUpdateSpy} closeParent={closeParentSpy} />);
            const lapInput = screen.getByLabelText(/set laps/i);
            await act(async () => {
                await user.clear(lapInput);
                await user.type(lapInput, '4');
            });
            await user.click(screen.getByRole('button', {name: /Update Laps/}));
            expect(closeParentSpy).toHaveBeenCalled();
        });
    });
    it('when cancelled it closes containing dialog', async () => {
        const closeParentSpy = jest.fn();
        const user = userEvent.setup();
        render(<AdjustCourseForm closeParent={closeParentSpy} />);
        const cancelButtton = screen.getByRole('button', {'name': /cancel/i});
        await user.click(cancelButtton);
        expect(closeParentSpy).toBeCalledTimes(1);
    });
});