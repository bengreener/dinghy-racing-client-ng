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

import ClockDisplay from './ClockDisplay';
import { act, render, screen } from '@testing-library/react';
import Clock from '../model/domain-classes/clock';

jest.mock('../model/domain-classes/clock');

const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();
const formatOptions = {
    timeZone: resolvedOptions.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
};
const timeFormat = new Intl.DateTimeFormat(resolvedOptions.locale, formatOptions);

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2021-10-14T10:41:42Z'));
});

afterEach(() => {
    jest.runOnlyPendingTimers();
});

it('renders', () => {
    const formattedTime = timeFormat.format(new Date(Date.now()));

    render(<ClockDisplay clock={new Clock()} />);
    expect(screen.getByText(formattedTime)).toBeInTheDocument();
});

describe('when clock ticks', () => {
    it('updates the displayed time', async () => {
        const time = Date.now();
        const clock = new Clock();
        clock.start();
        render(<ClockDisplay clock={clock} />);

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        const formattedTime = timeFormat.format(new Date(time + 1000));
        expect(screen.getByText(formattedTime)).toBeInTheDocument();
    });
});