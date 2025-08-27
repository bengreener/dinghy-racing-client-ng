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
import SetTimeForm from './SetTimeForm';


let formatOptions = {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
};
const timeFormat = new Intl.DateTimeFormat('en-GB', formatOptions);

it('renders', () => {
    const testTimeString = timeFormat.format(Date.now());
    const closeParentSpy = vi.fn();
    render(<SetTimeForm closeParent = {closeParentSpy} />);
    expect(screen.getByLabelText(/enter time/i)).toHaveValue(testTimeString);
    expect(screen.getByRole('button', {name: /set time/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
});

it('displays new value entered for time', async () => {
    const user = userEvent.setup();
    render(<SetTimeForm />);
    const timeInput = screen.getByLabelText(/enter time/i);

    await act(async () => {
        await user.clear(timeInput);
        await user.type(timeInput, '0811'); // should include seconds but JSDom Input type=time does not appear to be recognising step value to set a seconds component into control
    });
    expect(timeInput).toHaveValue('08:11');
});

describe('when set time button clicked', () => {
    it('calls function passed to setTime with time entered', async () => {
        const setTimeSpy = vi.fn();
        const user = userEvent.setup();
        
        render(<SetTimeForm setTime={setTimeSpy} />);
        
        const timeInput = screen.getByLabelText(/enter time/i);
        const testTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 3600000 * 8 + 60000 * 11);
        await act(async () => {
            await user.clear(timeInput);
            await user.type(timeInput, '0811'); // should include seconds but JSDom Input type=time does not appear to be recognising step value to set a seconds component into control
        });
        await user.click(screen.getByRole('button', {name: /set time/i}));
        expect(setTimeSpy).toHaveBeenCalledWith(testTime);
    });
});

describe('when contained in a modal dialog', () => {
    describe('when update laps button clicked', () => {
        it('closes containing dialog', async () => {
            const setTimeSpy = vi.fn();
            const closeParentSpy = vi.fn();
            const user = userEvent.setup();
            
            render(<SetTimeForm setTime={setTimeSpy} closeParent={closeParentSpy} />);
            
            const timeInput = screen.getByLabelText(/enter time/i);
            await act(async () => {
                await user.clear(timeInput);
                await user.type(timeInput, '0811'); // should include seconds but JSDom Input type=time does not appear to be recognising step value to set a seconds component into control
            });
            await user.click(screen.getByRole('button', {name: /set time/i}));
            expect(closeParentSpy).toHaveBeenCalled();
        });
    });
    it('when cancelled it closes containing dialog', async () => {
        const closeParentSpy = vi.fn();
        const user = userEvent.setup();
        
        render(<SetTimeForm closeParent={closeParentSpy} />);
        
        const cancelButtton = screen.getByRole('button', {'name': /cancel/i});
        await user.click(cancelButtton);
        expect(closeParentSpy).toBeCalledTimes(1);
    });
});