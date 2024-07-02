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
import FlagControl from './FlagControl';
import FlagState from '../model/domain-classes/flag-state';
import FlagRole from '../model/domain-classes/flag-role';

beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

it('diaplays the name of the flag', () => {
    render(<FlagControl flag={{name: 'Flag A', role: FlagRole.WARNING, state: FlagState.LOWERED}} timeToChange={1000} />);

    expect(screen.getByLabelText(/flag/i)).toHaveValue('Flag A');
});

it('displays the correct status for the flag', () => {
    render(<FlagControl flag={{name: 'Flag A', role: FlagRole.PREPARATORY, state: FlagState.RAISED}} timeToChange={1000} />);

    expect(screen.getByLabelText(/state/i)).toHaveValue('Raised');
});

it('displays the time to the next flag state change', () => {
    render(<FlagControl flag={{name: 'Flag A', role: FlagRole.WARNING, state: FlagState.RAISED}} timeToChange={60000} />);

    expect(screen.getByLabelText(/change in/i)).toHaveValue('01:00');
});