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
import DropboxAuthorisationForm from './DropboxAuthorisationForm';
import { expect } from 'vitest';

it('renders', async () => {
    const getUrlSpy = vi.fn(async () => {return 'http://someurl.com'});
    act(() => {
        render(<DropboxAuthorisationForm getUrl={getUrlSpy} />);
    });    
    const codeInput = screen.getByLabelText('Code');
    const submitButton = screen.getByRole('button', {name: 'Submit'});
    const cancelButton = screen.getByRole('button', {name: 'Cancel'});
    const dropboxAuthUrl = await screen.findByRole('link', {name: 'http://someurl.com'});
    expect(screen.getByRole('heading', {name: 'Dropbox Authorisation'})).toBeInTheDocument();
    expect(codeInput).toBeInTheDocument();
    expect(dropboxAuthUrl).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
});

it('accepts entry of a code', async () => {
    const user = userEvent.setup();
    render(<DropboxAuthorisationForm getUrl={vi.fn(async () => {return 'http://someurl.com'})} />);
    const codeInput = screen.getByLabelText('Code');
    await user.type(codeInput, 'w12gdtH896jh25');
    expect(codeInput).toHaveValue('w12gdtH896jh25');
});

it('calls function passed to onSubmit with entered code', async () => {
    const user = userEvent.setup();
    const onSubmitSpy = vi.fn();
    render(<DropboxAuthorisationForm getUrl={vi.fn(async () => {return 'http://someurl.com'})} onSubmit={onSubmitSpy} />);
    const codeInput = screen.getByLabelText('Code');
    const submitButton = screen.getByRole('button', {name: /Submit/i});
    await user.type(codeInput, 'w12gdtH896jh25');
    await user.click(submitButton);
    expect(onSubmitSpy).toHaveBeenCalledWith('w12gdtH896jh25');
});

it('clears form on cancel', async () => {
    const user = userEvent.setup();
    const onSubmitSpy = vi.fn();
    render(<DropboxAuthorisationForm getUrl={vi.fn(async () => {return 'http://someurl.com'})} onSubmit={onSubmitSpy} />);
    const codeInput = screen.getByLabelText('Code');
    const cancelButton = screen.getByRole('button', {name: /cancel/i});
    await user.type(codeInput, 'w12gdtH896jh25');
    await user.click(cancelButton);
    expect(codeInput).toHaveValue('');
});

it('displays the failure message on failure', async () => {
    const user = userEvent.setup();
    const onSubmitSpy = vi.fn(async () => {throw new Error('That was a bust!')});
    render(<DropboxAuthorisationForm getUrl={vi.fn(async () => {return 'http://someurl.com'})} onSubmit={onSubmitSpy} />);
    const submitButton = screen.getByRole('button', {name: /Submit/i});
    await user.click(submitButton);
    const message = await screen.findByText('That was a bust!');
    expect(message).toBeInTheDocument();
});