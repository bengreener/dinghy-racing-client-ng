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
import Clock from '../model/domain-classes/clock';

jest.mock('../model/domain-classes/clock');

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
    render(<ActionListView signals={[]} clock={new Clock()}/>);
    expect(screen.getByRole('heading', {name: /action list/i})).toBeInTheDocument();
});

it('displays a header for the action list', () => {
    render(<ActionListView signals={[]} clock={new Clock()}/>);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /time/i})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /action/i})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /countdown/i})).toBeInTheDocument();
});

it('displays actions', () => {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const flagA = {name: 'A Class Flag'};
    const flagP = {name: 'P Flag'};
    const flagB = {name: 'B Class Flag'};

    const visualSignalAUp = {flags: [flagA], flagsState: FlagState.RAISED};
    const visualSignalADown = {flags: [flagA], flagsState: FlagState.LOWERED};
    const visualSignalPUp = {flags: [flagP], flagsState: FlagState.RAISED};
    const visualSignalBUp = {flags: [flagB], flagsState: FlagState.RAISED};

    const signalAUp = {meaning: 'Warning signal', time: new Date(now), visualSignal: visualSignalAUp, soundSignal: {description: 'One'}};
    const signalADown = {meaning: 'Starting signal', time: new Date(now + 600000), visualSignal: visualSignalADown, soundSignal: {description: 'One'}};
    const signalPUp = {meaning: 'Preparatory signal', time: new Date(now + 300000), visualSignal: visualSignalPUp, soundSignal: {description: 'One long'}};
    const signalBUp = {meaning: 'Warning signal',time: new Date(now + 300000), visualSignal: visualSignalBUp, soundSignal: {description: 'One'}};
    const soundOnly = {meaning: 'Class start',time: new Date(now + 1050000), soundSignal: {description: 'One'}};

    const signals = [signalAUp, signalADown, signalPUp, signalBUp, soundOnly];

    render(<ActionListView signals={signals} clock={new Clock()}/>);

    const actionRows = screen.getAllByRole('row');
    expect(actionRows).toHaveLength(5);
    expect(within(actionRows[1]).getByText(timeFormat.format(new Date(now)))).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/warning signal.+raise a class flag.+one/i)).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(timeFormat.format(new Date(now + 300000)))).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/preparatory signal.+raise p flag.+one long.+warning signal.+raise b class flag.+one/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/05:00/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(timeFormat.format(new Date(now + 600000)))).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/starting signal.+lower a class flag.+one/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/10:00/i)).toBeInTheDocument();
    expect(within(actionRows[4]).getByText(timeFormat.format(new Date(now + 1050000)))).toBeInTheDocument();
    expect(within(actionRows[4]).getByText(/class start.+one/i)).toBeInTheDocument();
    expect(within(actionRows[4]).getByText(/17:30/i)).toBeInTheDocument();
});

it('updates action countdowns every second', async () => {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const flagA = {name: 'A Class Flag'};
    const flagP = {name: 'P Flag'};
    const flagB = {name: 'B Class Flag'};

    const visualSignalAUp = {flags: [flagA], flagsState: FlagState.RAISED};
    const visualSignalADown = {flags: [flagA], flagsState: FlagState.LOWERED};
    const visualSignalPUp = {flags: [flagP], flagsState: FlagState.RAISED};
    const visualSignalBUp = {flags: [flagB], flagsState: FlagState.RAISED};

    const signalAUp = {meaning: 'Warning signal', time: new Date(now), visualSignal: visualSignalAUp};
    const signalADown = {meaning: 'Starting signal', time: new Date(now + 600000), visualSignal: visualSignalADown};
    const signalPUp = {meaning: 'Preparatory signal', time: new Date(now + 300000), visualSignal: visualSignalPUp};
    const signalBUp = {meaning: 'Warning signal',time: new Date(now + 300000), visualSignal: visualSignalBUp};

    const signals = [signalAUp, signalADown, signalPUp, signalBUp];

    const clock = new Clock();
    clock.start();

    let container;
    await act(async () => {
        ({ container } = render(<ActionListView signals={signals} clock={clock}/>));
    });

    const actionListView = container.getElementsByClassName('action-list-view')[0];

    // screen.debug(actionListView);
    await act(async () => {
        jest.advanceTimersByTime(1000);
    });

    // screen.debug(actionListView);
    const actionRows = screen.getAllByRole('row');
    expect(actionRows).toHaveLength(3);
    expect(await within(actionRows[1]).findByText(/04:59/i)).toBeInTheDocument();
    expect(await within(actionRows[2]).findByText(/09:59/i)).toBeInTheDocument();
});

it('does not display actions that have expired', async() => {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const flagA = {name: 'A Class Flag'};
    const flagP = {name: 'P Flag'};
    const flagB = {name: 'B Class Flag'};
    
    const visualSignalAUp = {flags: [flagA], flagsState: FlagState.RAISED};
    const visualSignalADown = {flags: [flagA], flagsState: FlagState.LOWERED};
    const visualSignalPUp = {flags: [flagP], flagsState: FlagState.RAISED};
    const visualSignalBUp = {flags: [flagB], flagsState: FlagState.RAISED};

    const signalAUp = {meaning: 'Warning signal', time: new Date(now - 600000), visualSignal: visualSignalAUp};
    const signalADown = {meaning: 'Starting signal', time: new Date(now), visualSignal: visualSignalADown};
    const signalPUp = {meaning: 'Preparatory signal', time: new Date(now - 300000), visualSignal: visualSignalPUp};
    const signalBUp = {meaning: 'Warning signal',time: new Date(now  - 300000), visualSignal: visualSignalBUp};

    const signals = [signalAUp, signalADown, signalPUp, signalBUp];

    render(<ActionListView signals={signals} clock={new Clock()}/>);
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