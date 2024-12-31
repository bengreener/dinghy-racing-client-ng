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
import LapView from './LapView';

describe('when editable is false', () => {
    it('displays value in time format', () => {
        render(<LapView value={1015897} />);
        screen.getByText('16:55');
    });
    it('does not call value passed to keyup', async () => {
        const keyupMock = jest.fn();
        const user = userEvent.setup();
        render(<LapView value={895689} editable={false} keyup={keyupMock} />);
        screen.getByText('14:55').focus();
        await user.keyboard('{Enter}');
        expect(keyupMock).not.toBeCalled();
    });
    it('does not call value passed to focusout', () => {
        const keyupMock = jest.fn();
        const focusoutMock = jest.fn();
        const user = userEvent.setup(); 
        render(<LapView value={312568} editable={false} keyup={keyupMock} focusout={focusoutMock} />);
        const cell = screen.getByText('05:12');
        cell.focus();
        cell.blur();
        expect(focusoutMock).not.toBeCalled();
    });
    describe('when cell contains a total', () => {
        it('has class total', () => {
            render(<LapView value={1015897} total={true} />);
            expect(screen.getByText('16:55').getAttribute('class')).toMatch(/total/i);
        });
    });
});

describe('when editable is true', () => {
    it('displays value in time format', () => {
        render(<LapView value={1234} editable={true}/>);
        screen.getByRole('textbox', {'value': '00:01'});
    });
    it('accepts a new value', async () => {
        const user = userEvent.setup();
        render(<LapView value={1234} editable={true}/>);
        const input = screen.getByRole('textbox', {'value': '00:01'});
        await act(async () => {
            await user.clear(input);
            await user.type(input, '00:09');
        });
        expect(input).toHaveValue('00:09');
    }); 
    it('calls value passed to keyup', async () => {
        const keyupMock = jest.fn();
        const user = userEvent.setup();
        render(<LapView value={1234} editable={true} keyup={keyupMock} />);
        screen.getByRole('textbox').focus();
        await user.keyboard('{Enter}');
        expect(keyupMock).toBeCalled();
    });
    it('calls value passed to focusout', () => {
        const keyupMock = jest.fn();
        const focusoutMock = jest.fn();
        const user = userEvent.setup();
        render(<LapView value={1234} editable={true} keyup={keyupMock} focusout={focusoutMock} />);
        const cell = screen.getByRole('textbox');
        cell.focus();
        cell.blur();
        expect(focusoutMock).toBeCalled();
    });
    describe('when validating entry', () => {
        it('does not accept letters', async () => {
            const user = userEvent.setup();
            render(<LapView value={1234} editable={true}/>);
            const input = screen.getByRole('textbox', {'value': '00:01'});
            await act(async () => {
                await user.clear(input);
                await user.type(input, '00:h');
            });
            expect(input).toHaveValue('00:');
        });
        it('does not accept 999:63', async () => {
            const user = userEvent.setup();
            render(<LapView value={1234} editable={true}/>);
            const input = screen.getByRole('textbox', {'value': '00:01'});
            await act(async () => {
                await user.clear(input);
                await user.type(input, '999:63');
            });
            expect(input).toHaveValue('999:6');
        });
        it('does not accept 999:63', async () => {
            const user = userEvent.setup();
            render(<LapView value={1234} editable={true}/>);
            const input = screen.getByRole('textbox', {'value': '00:01'});
            await act(async () => {
                await user.clear(input);
                await user.type(input, '999:52:78');
            });
            expect(input).toHaveValue('999:52:7');
        });
    })
    describe('when cell contains a total', () => {
        it('has class total', () => {
            render(<LapView value={1015897} total={true} />);
            expect(screen.getByText('16:55').getAttribute('class')).toMatch(/total/i);
        });
    });
});
