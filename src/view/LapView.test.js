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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LapView from './LapView';

describe('when editable is false', () => {
    it('displays value in time format', () => {
        const container = document.createElement('tr');
        render(<LapView value={1015897} />, {'container': document.body.appendChild(container)});
        screen.getByText('16:56');
    });
    it('does not call value passed to keyup', async () => {
        const keyupMock = jest.fn();
        const user = userEvent.setup(); 
        const container = document.createElement('tr');
        render(<LapView value={895689} editable={false} keyup={keyupMock} />, {'container': document.body.appendChild(container)});
        screen.getByText('14:56').focus();
        await user.keyboard('{Enter}');
        expect(keyupMock).not.toBeCalled();
    });
    it('does not call value passed to focusout', () => {
        const keyupMock = jest.fn();
        const focusoutMock = jest.fn();
        const user = userEvent.setup(); 
        const container = document.createElement('tr');
        render(<LapView value={312568} editable={false} keyup={keyupMock} focusout={focusoutMock} />, {'container': document.body.appendChild(container)});
        const cell = screen.getByText('05:13');
        cell.focus();
        cell.blur();
        expect(focusoutMock).not.toBeCalled();
    });
    describe('when cell contains a total', () => {
        it('has class total', () => {
            const container = document.createElement('tr');
            render(<LapView value={1015897} total={true} />, {'container': document.body.appendChild(container)});
            expect(screen.getByText('16:56').getAttribute('class')).toMatch(/total/i);
        });
    });
});

describe('when editable is true', () => {
    it('displays numeric input showing value passed in', () => {
        const container = document.createElement('tr');
        render(<LapView value={1234} editable={true}/>, {'container': document.body.appendChild(container)});
        screen.getByRole('spinbutton', {'value': 1234});
    });
    it('accepts a new value', async () => {
        const user = userEvent.setup();
        const container = document.createElement('tr');
        render(<LapView value={1234} editable={true}/>, {'container': document.body.appendChild(container)});
        const input = screen.getByRole('spinbutton', {'value': 1234});
            await user.clear(input);
            await user.type(input, '9876');
        expect(input).toHaveValue(9876);
    }); 
    it('calls value passed to keyup', async () => {
        const keyupMock = jest.fn();
        const user = userEvent.setup(); 
        const container = document.createElement('tr');
        render(<LapView value={1234} editable={true} keyup={keyupMock} />, {'container': document.body.appendChild(container)});
        screen.getByRole('spinbutton').focus();
        await user.keyboard('{Enter}');
        expect(keyupMock).toBeCalled();
    });
    it('calls value passed to focusout', () => {
        const keyupMock = jest.fn();
        const focusoutMock = jest.fn();
        const user = userEvent.setup(); 
        const container = document.createElement('tr');
        render(<LapView value={1234} editable={true} keyup={keyupMock} focusout={focusoutMock} />, {'container': document.body.appendChild(container)});
        const cell = screen.getByRole('spinbutton');
        cell.focus();
        cell.blur();
        expect(focusoutMock).toBeCalled();
    });
    describe('when cell contains a total', () => {
        it('has class total', () => {
            const container = document.createElement('tr');
            render(<LapView value={1015897} total={true} />, {'container': document.body.appendChild(container)});
            expect(screen.getByText('16:56').getAttribute('class')).toMatch(/total/i);
        });
    });
});
