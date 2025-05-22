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
import CollapsableContainer from './CollapsableContainer';

it('renders', () => {
    render(<CollapsableContainer />);
});

it('displays header', () => {
    render(<CollapsableContainer heading={'Test Heading'} />);

    expect(screen.getByText(/test heading/i)).toBeInTheDocument();
})

it('renders children', () => {
    render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
    expect(screen.getByText(/world/i)).toBeInTheDocument();
});

it('shows buttton to toggle visibility of children', () => {
    render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
    expect(screen.getByRole('button', {'name': /hide/i})).toBeInTheDocument();
});

describe('when hide button clicked', () => {
    it('hides children', async () => {
        const user = userEvent.setup();
        render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
        expect(screen.getByText(/hello/i)).toBeInTheDocument();
        expect(screen.getByText(/world/i)).toBeInTheDocument();
        const buttonHide = screen.getByRole('button', {'name': /hide/i});
        await act(async () => {
            await user.click(buttonHide);
        });expect(screen.queryByText(/hello/i, {hidden: true})).not.toBeVisible();
        expect(screen.queryByText(/world/i, {hidden: true})).not.toBeVisible();
    });
    it('changes label on hide button to show', async () => {
        const user = userEvent.setup();
        render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
        const buttonHide = screen.getByRole('button', {'name': /hide/i});
        await act(async () => {
            await user.click(buttonHide);
        });
        expect(screen.getByRole('button', {'name': /show/i})).toBeInTheDocument();
    });
});

describe('when show button clicked', () => {
    it('shows children', async () => {
        const user = userEvent.setup();
        render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /hide/i}));
        });
        expect(screen.queryByText(/hello/i)).not.toBeVisible();
        expect(screen.queryByText(/world/i)).not.toBeVisible();
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /show/i}));
        });
        expect(screen.queryByText(/hello/i)).toBeInTheDocument();
        expect(screen.queryByText(/world/i)).toBeInTheDocument();
    });
    it('changes label on show button to hide', async () => {
        const user = userEvent.setup();
        render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /hide/i}));
        });
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /show/i}));
        });
        expect(screen.getByRole('button', {'name': /hide/i})).toBeInTheDocument();
    });
});