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

import { act, render, screen, within } from '@testing-library/react';
import ActionListView from './ActionListView';
import FlagState from '../model/domain-classes/flag-state';
import FlagRole from '../model/domain-classes/flag-role';

const formatOptions = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
};
const timeFormat = new Intl.DateTimeFormat('utc', formatOptions);

beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout')
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

it('renders', () => {
    render(<ActionListView actions={[]}/>);
    expect(screen.getByRole('heading', {name: /action list/i})).toBeInTheDocument();
});

it('displays a header for the action list', () => {
    render(<ActionListView actions={[]}/>);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /time/i})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /action/i})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /countdown/i})).toBeInTheDocument();
});

it('displays actions', () => {
    const now = Date.now();
    const actions = [
        {flag: {name: 'A Class Flag', role: FlagRole.WARNING}, time: new Date(now), afterState: FlagState.RAISED},
        {flag: {name: 'P Flag', role: FlagRole.PREPARATORY}, time: new Date(now + 300000), afterState: FlagState.RAISED},
        {flag: {name: 'B Class Flag', role: FlagRole.WARNING}, time: new Date(now + 300000), afterState: FlagState.RAISED},
        {flag: {name: 'A Class Flag', role: FlagRole.WARNING}, time: new Date(now + 600000), afterState: FlagState.LOWERED}
    ];
    render(<ActionListView actions={actions}/>);
    const actionRows = screen.getAllByRole('row');
    expect(actionRows).toHaveLength(4);
    expect(within(actionRows[1]).getByText(timeFormat.format(new Date(now)))).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/raise a class flag/i)).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(timeFormat.format(new Date(now + 300000)))).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/raise p flag.+raise b class flag/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/05:00/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(timeFormat.format(new Date(now + 600000)))).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/lower a class flag/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/10:00/i)).toBeInTheDocument();
});

it('updates action countdowns every second', async () => {
    const now = Date.now();
    const actions = [
        {flag: {name: 'A Class Flag', role: FlagRole.WARNING}, time: new Date(now), afterState: FlagState.RAISED},
        {flag: {name: 'P Flag', role: FlagRole.PREPARATORY}, time: new Date(now + 300000), afterState: FlagState.RAISED},
        {flag: {name: 'B Class Flag', role: FlagRole.WARNING}, time: new Date(now + 300000), afterState: FlagState.RAISED},
        {flag: {name: 'A Class Flag', role: FlagRole.WARNING}, time: new Date(now + 600000), afterState: FlagState.LOWERED}
    ];
    render(<ActionListView actions={actions}/>);
    act(() => {
        jest.advanceTimersByTime(1000);
    });
    const actionRows = screen.getAllByRole('row');
    expect(actionRows).toHaveLength(3);
    expect(await within(actionRows[1]).findByText(/04:59/i)).toBeInTheDocument();
    expect(await within(actionRows[2]).findByText(/09:59/i)).toBeInTheDocument();
});

it('does not display actions that have expired', async() => {
    const now = Date.now();
    const actions = [
        {flag: {name: 'A Class Flag', role: FlagRole.WARNING}, time: new Date(now - 600000), afterState: FlagState.RAISED},
        {flag: {name: 'P Flag', role: FlagRole.PREPARATORY}, time: new Date(now - 300000), afterState: FlagState.RAISED},
        {flag: {name: 'B Class Flag', role: FlagRole.WARNING}, time: new Date(now - 300000), afterState: FlagState.RAISED},
        {flag: {name: 'A Class Flag', role: FlagRole.WARNING}, time: new Date(now), afterState: FlagState.LOWERED}
    ];
    render(<ActionListView actions={actions}/>);
    const actionRows = screen.getAllByRole('row');
    expect(actionRows).toHaveLength(2);
    expect(within(actionRows[1]).queryByText(timeFormat.format(new Date(now - 600000)))).not.toBeInTheDocument();
    expect(within(actionRows[1]).queryByText(/raise a class flag/i)).not.toBeInTheDocument();
    expect(within(actionRows[1]).queryByText(timeFormat.format(new Date(now - 300000)))).not.toBeInTheDocument();
    expect(within(actionRows[1]).queryByText(/raise p flag.+raise b class flag/i)).not.toBeInTheDocument();
    expect(within(actionRows[1]).getByText(timeFormat.format(new Date(now)))).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/lower a class flag/i)).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
});