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

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaceEntryView from './RaceEntryView';
import { httpRootURL, wsRootURL, competitorChrisMarshallHAL, competitorSarahPascalHAL, entryChrisMarshall1234ScorpionAHAL, entrySarahPascal6745ScorpionAHAL, 
    dinghy1234HAL, dinghy6745HAL, dinghyClassScorpionHAL, racePursuitAHAL, raceScorpionAHAL,
    signedUpChrisMarshallDinghy1234ScorpionAHAL } from '../model/__mocks__/test-data';
import SylphModel from '../model/sylph-model';
import Competitor from '../model/competitor';
import Collection from '../model/collection';
import Dinghy from '../model/dinghy';
import DinghyClass from '../model/dinghy-class';
import Entry from '../model/entry';
import Lap from '../model/lap';
import Race from '../model/race';
import SignedUp from '../model/signed-up';
import SynchronousDinghy from './synchronous-model/synchronous-dinghy';
import SynchronousEntry from './synchronous-model/synchronous-entry';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

const entryRowLastCellLapTimeCellOffset = 4;

beforeEach(() => {
    vi.useFakeTimers();
    // vi.spyOn(global, 'setTimeout');
});

afterEach(() => {
    vi.runOnlyPendingTimers();
    // vi.useRealTimers();
});

it('renders', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
        new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
        new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
        new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
        new Race(raceScorpionAHAL, {version: '"0"'}, model),
        new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
        new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
    );
    render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
    const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
    expect(SMScorp1234entry).toBeInTheDocument();
});

it('displays lap times', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
        new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
        new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
        new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
        new Race(raceScorpionAHAL, {version: '"0"'}, model),
        new Collection([new Lap({number: 1, time: 'PT0M01S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
        new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
    );
    render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
    expect(screen.getByText('00:01')).toBeInTheDocument();
});

it('displays cumulative sum of lap times', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
        new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
        new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
        new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
        new Race(raceScorpionAHAL, {version: '"0"'}, model),
        new Collection([
            new Lap({number: 1, time: 'PT0M01S'}, {version: '"0"'}, model),
            new Lap({number: 2, time: 'PT0M01S'}, {version: '"0"'}, model),
            new Lap({number: 3, time: 'PT0M01S'}, {version: '"0"'}, model)
        ], {size: 20, totalElements: 3, totalPages: 0,number: 0}),
        new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
    );
    render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
    expect(screen.getByText('00:01')).toBeInTheDocument();
    expect(screen.getByText('00:02')).toBeInTheDocument();
    expect(screen.getByText('00:03')).toBeInTheDocument();
});

it('displays position', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
        new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
        new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
        new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
        new Race(raceScorpionAHAL, {version: '"0"'}, model),
        new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
        new SignedUp({...signedUpChrisMarshallDinghy1234ScorpionAHAL, position: 5}, {version: '"0"'}, model)
    );
    render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
    expect(screen.getByText('5')).toBeInTheDocument();
});

describe('before race has started', () => {
    it('calls addLap callback with entry', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const addLapCallback = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} addLap={addLapCallback} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        user.click(SMScorp1234entry);
        // wait for async function in RaceEntryView
        await vi.waitFor(async () => {
            expect(addLapCallback).not.toBeCalledWith(entryChrisMarshallScorpionA1234);
        });
    });
});

describe('after race has started', () => {
    it('calls addLap callback with entry', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const addLapCallback = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} addLap={addLapCallback} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        user.click(SMScorp1234entry);
        // wait for async function in RaceEntryView
        await vi.waitFor(async () => {
            expect(addLapCallback).toBeCalledWith(entry);
        });
    });
});

describe('when a lap is removed from an entry', () => {
    it('calls removeLap callback with entry', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const removeLapCallback = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} removeLap={removeLapCallback} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        user.keyboard('{Control>}');
        await act(async () => {
            user.click(SMScorp1234entry);
        });
        expect(removeLapCallback).toBeCalledWith(entry);
    });
    it('updates the display to show the delete lap instruction has been sent to the server', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const removeLapCallback = vi.fn(async () => true);
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} removeLap={removeLapCallback} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        user.keyboard('{Control>}');
        await act(async () => {
            user.click(SMScorp1234entry);
        });
        expect(screen.getByText((content, node) => /^Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')).getAttribute('class')).toMatch(/disabled/i);
    });
    describe('when lap removal fails', () => {
        it('entry view is enabled to accept input', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const removeLapCallback = vi.fn(async () => false);
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entry} removeLap={removeLapCallback} />);
            const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
            user.keyboard('{Control>}');
            await act(async () => {
                user.click(SMScorp1234entry);
            });
            await (act(async () => {}));
            expect(screen.getByText((content, node) => /^Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')).getAttribute('class')).not.toMatch(/disabled/i);
        });
    });
});

describe('when secondary mouse button is clicked', () => {
    describe('when a lap has been recorded for the entry', () => {
        it('accepts a new lap time input in the last field of the row', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([
                    new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)
                ], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entry} />);
            const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement;
            const lapEntryCellOutput = within(raceEntryView).getByText('00:06');
            await act(async () => {
                user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
            });
            const lapEntryCellInput = within(raceEntryView).getByRole('textbox', '00:06');
            await act(async () => {
                user.clear(lapEntryCellInput);
                user.type(lapEntryCellInput, '00:15');
            });
            expect(lapEntryCellInput).toHaveValue('00:15');
        });
    });
    describe('when a lap has not been recorded for the entry', () => {
        it('does not enter edit mode and accepts a lap time via left click', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const addLapCallback = vi.fn();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entry} addLap={addLapCallback} />);
            const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement;
            user.pointer({target: raceEntryView, keys: '[MouseRight]'});
            await act(async () => {
                user.click(raceEntryView);
            });
            expect(addLapCallback).toBeCalledWith(entry);
        });
    });
});

describe('when editing a lap time', () => {
    it('does not add new lap when primary button clicked', async () => { 
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const addLapCallback = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} addLap={addLapCallback} updateLap={vi.fn()} />);
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:06');
        await act(async () => {
            user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        });
        await act(async () => {
            user.click(lapEntryCellOutput);
        });
        expect(addLapCallback).not.toHaveBeenCalled();
    });
    it('does not remove last lap when ctrl+primary button clicked', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const removeLapCallback = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} updateLap={vi.fn()} removeLap={removeLapCallback} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement;
        const lastCell = within(SMScorp1234entry).getByText('00:06');
        user.pointer({target: lastCell, keys: '[MouseRight]'});
        await act(async () => {
            user.keyboard('{Control>}');
            user.click(lastCell);
        });
        expect(removeLapCallback).not.toHaveBeenCalled();
    });
    describe('when lap time has not changed', () => {
        it('does not update lap time', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const updateLapCallback = vi.fn();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entry} updateLap={updateLapCallback} />);
            const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement;
            const lapEntryCellOutput = within(raceEntryView).getByText('00:06');
            await act(async () => {
                user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
            });
            const lapEntryCellInput = within(raceEntryView).getByRole('textbox', '00:06');
            await act(async () => {
                user.clear(lapEntryCellInput);
                user.type(lapEntryCellInput, '0:06');
                user.keyboard('{Enter}');
            });
            expect(updateLapCallback).not.toHaveBeenCalled();
            expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
        });
    });
    it('updates lap with new time supplied', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new SylphModel(httpRootURL, wsRootURL);
        const updateLapCallback = vi.fn();
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} updateLap={updateLapCallback} />);
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:06');
        await act(async () => {
            user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        });
        
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', '00:06');
        await act(async () => {
            user.clear(lapEntryCellInput);
            user.type(lapEntryCellInput, '15:53');
        });
        user.keyboard('{Enter}');
        await vi.waitFor(async () => {
            expect(updateLapCallback).toBeCalledWith(entry, 953000);
        });
    });
    it('updates the display to show the edited lap time is being sent to the server', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const updateLapCallback = vi.fn(async (entry, value) => {return true});
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} updateLap={updateLapCallback} />);
        const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall100:06OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
        const lapEntryCellOutput = within(raceEntryView).getByText('00:06');
        await act(async () => {
            user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        });
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', '00:06');
        await act(async () => {
            user.clear(lapEntryCellInput);
            user.type(lapEntryCellInput, '15:53');
        });
        await act(async () => {
            user.keyboard('{Enter}');
        });
        expect(raceEntryView.getAttribute('class')).toMatch(/disabled/i);
    });
    describe('when lap update fails', () => {
        it('entry view is enabled to accept input', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const updateLapCallback = vi.fn((entry, value) => {return false});
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            await act(async () => {
                render(<RaceEntryView entry={entry} updateLap={updateLapCallback} />);
            });
            const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall100:06OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
            const lapEntryCellOutput = within(raceEntryView).getByText('00:06');
            await act(async () => {
                user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
            });
            const lapEntryCellInput = within(raceEntryView).getByRole('textbox', '00:06');
            await act(async () => {
                user.clear(lapEntryCellInput);
                user.type(lapEntryCellInput, '15:53');
                user.keyboard('{Enter}');
            });
            expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
        });
    });
    describe('when the new lap time is entered in an invalid format', () => {
        it('does not accept the incorrect format and keeps edit mode open', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entry} updateLap={vi.fn()} />);
            const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall100:06OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
            const lapEntryCellOutput = within(raceEntryView).getByText('00:06');
            await act(async () => {
                user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
            });
            const lapEntryCellInput = within(raceEntryView).getByRole('textbox', '00:06');
            await act(async () => {
                user.clear(lapEntryCellInput);
                user.type(lapEntryCellInput, '15530');
                user.keyboard('{Enter}');
            });
            expect(lapEntryCellInput).toHaveValue('15530');
        });
        it('calls showUserMessage prop with message explainging error', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const showUserMessage = vi.fn();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entry} updateLap={vi.fn()} showUserMessage={showUserMessage} />);
            const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement;
            const lapEntryCellOutput = within(raceEntryView).getByText('00:06');
            await act(async () => {
                user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
            });
            const lapEntryCellInput = within(raceEntryView).getByRole('textbox', '00:06');
            await act(async () => {
                user.clear(lapEntryCellInput);
                user.type(lapEntryCellInput, '15530');
                user.keyboard('{Enter}');
            });
            expect(showUserMessage).toHaveBeenCalledWith('Time must be in the format [hh:][mm:]ss.');
        });
    });
});

describe('when user taps row', () => {
    it('calls addLap callback with entry', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const addLapCallback = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} addLap={addLapCallback} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            user.pointer([{keys: '[TouchA]', target: SMScorp1234entry}]);
        });
        expect(addLapCallback).toBeCalledWith(entry);
    });
    describe('when add lap fails', () => {
        it('entry view is enabled to accept input', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const addLapCallback = vi.fn(() => {return false});
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            let container;
            ({ container } = render(<RaceEntryView entry={entry} addLap={addLapCallback} />));
            const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
            await act(async () => {
                user.pointer([{keys: '[TouchA]', target: SMScorp1234entry}]);
            });
            await act(async () => {});
            const raceEntryView = container.getElementsByClassName('race-entry-view')[0];
            expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
        });
    });
});

describe('when user taps and holds on row', () => {
    it('accepts a new lap time input in the last field of the row', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([new Lap({number: 1, time: 'PT0M06S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} />);
        const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall100:06OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view')).children[0];
        await act(async () => {
            user.pointer({target: raceEntryView, keys: '[TouchA>]'});
        });
        await act(async () => {
            vi.advanceTimersByTime(500);
        });
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', '00:06');
        await act(async () => {
            user.clear(lapEntryCellInput);
            user.type(lapEntryCellInput, '00:15');
        });
        expect(lapEntryCellInput).toHaveValue('00:15');
    });
});

// may not be possible to test this due to a current issue in @testing-library/user-event with generating pointer move event 
// https://github.com/testing-library/user-event/issues/1047
describe('when user swipes left on row', () => {
    it.skip('calls removeLap callback with entry', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234, 'laps': [
            {...SylphModel.lapTemplate(), number: 1, time: 1000},
            {...SylphModel.lapTemplate(), number: 2, time: 2000},
            {...SylphModel.lapTemplate(), number: 3, time: 3000}
        ], metadata: {eTag: '"1"'}};
        const removeLapCallback = vi.fn((e) => {entry.laps.pop()});
        render(<RaceEntryView entry={entry} removeLap={removeLapCallback} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        const position1 = SMScorp1234entry.parentElement.children[3];
        const position2 = SMScorp1234entry.parentElement.children[2];
        await act(async () => {
            user.pointer([{target: position1, coords: {x: 100, y: 100}, keys: '[TouchA>]'}, 
                {target:position2, coords: {x: 80, y: 100}, keys: '[TouchA]'}, {keys: '[/TouchA]'}]);
        });
        expect(removeLapCallback).toBeCalledWith(entry);
    });
});

describe('when entry is on last lap', () => {
    it('has a class of on-last-lap', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry({...entryChrisMarshall1234ScorpionAHAL, onLastLap: true}, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entry} />);
        const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
        expect(raceEntryView.getAttribute('class')).toMatch(/on-last-lap/i);
    });
});

describe('when entry is not on last lap', () => {
    it('does not have a class of on-last-lap', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement;
        expect(SMScorp1234entry.getAttribute('class')).not.toMatch(/on-last-lap/i);
    });
});

describe('when entry has finished race', () => {
    it('has a class of finished-race', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry({...entryChrisMarshall1234ScorpionAHAL, finishedRace: true}, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
        expect(raceEntryView.getAttribute('class')).toMatch(/finished-race/i);
    });
});

describe('when entry has not finished race', () => {
    it('does not have a class of finished-race', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement;
        expect(SMScorp1234entry.getAttribute('class')).not.toMatch(/finished-race/i);
    });
});

describe('when a scoring abbreviation is not selected', () => {
    it('only has a classes of race-entry-view w3-row w3-border w3-hover-border-blue cursor-pointer preserve-whitespace', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
        expect(raceEntryView.getAttribute('class')).toMatch(/^race-entry-view w3-row w3-border w3-hover-border-blue$/i);
    });
});

describe('when a scoring abbreviation is selected', () => {
    it('calls setScoringAbbreviation callback provided as prop', async () => {
        const setScoringAbbreviationSpy = vi.fn(async () => {return true});
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} setScoringAbbreviation={setScoringAbbreviationSpy}/>);
        const selectSA = screen.getByRole('combobox');
        await act(async() => {
            user.selectOptions(selectSA, 'DNS');
        });
        expect(setScoringAbbreviationSpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, 'DNS');
    });
    it('updates the display to show a scoring abbreviation is being sent to the server', async () => {
        const setScoringAbbreviationSpy = vi.fn(async () => {return true});
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} setScoringAbbreviation={setScoringAbbreviationSpy}/>);
        const selectSA = screen.getByRole('combobox');
        await act(async () => {
            user.selectOptions(selectSA, 'DNS');
        });
        expect(screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view')).getAttribute('class')).toMatch(/disabled/i);
    });
    describe('when adding scoring abbreviation fails', () => {
        it('entry view is enabled to accept input', async () => {
            const setScoringAbbreviationSpy = vi.fn(async () => {return false});
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} setScoringAbbreviation={setScoringAbbreviationSpy}/>);
            const selectSA = screen.getByRole('combobox');
            user.selectOptions(selectSA, 'DNS');
            expect(screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view')).getAttribute('class')).not.toMatch(/disabled/i);
        });
    });
    describe('when entry did not start the race', () => {
        it('has a class of did-not-start', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry({entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'DNS'}, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
            const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
            expect(raceEntryView.getAttribute('class')).toMatch(/did-not-start/i);
        });
    });
    describe('when entry retired', () => {
        it('has a class of retired', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry({entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'RET'}, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
            const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
            expect(raceEntryView.getAttribute('class')).toMatch(/retired/i);
        });
    });
    describe('when entry disqualified', () => {
        it('has a class of disqualified', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry({entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'DSQ'}, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
            const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
            expect(raceEntryView.getAttribute('class')).toMatch(/disqualified/i);
        });
    });
    describe('when entry did not compete in the race', () => {
        it('has a class of did-not-start', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry({entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'DNC'}, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0, number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
            const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
            expect(raceEntryView.getAttribute('class')).toMatch(/did-not-compete/i);
        });
    });
    describe('when entry on course side at start of race', () => {
        it('has a class of on-course-side', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry({entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'OCS'}, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0, number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
            const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
            expect(raceEntryView.getAttribute('class')).toMatch(/on-course-side/i);
        });
    });
    describe('when entry did not finish the race', () => {
        it('has a class of did-not-finish', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry({entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'DNF'}, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0, number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
            const raceEntryView = screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view'));
            expect(raceEntryView.getAttribute('class')).toMatch(/did-not-finish/i);
        });
    });
});

describe('when the entry is selected to add a new lap', () => {
    it('updates the display to show it has been selected', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        const addLapCallback = vi.fn(() => {return true});
        render(<RaceEntryView entry={entry} addLap={addLapCallback} />);
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            user.click(raceEntryView);
        });
        expect(screen.getByText((content, node) => /Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET/.test(node.textContent) && node.classList.contains('race-entry-view')).getAttribute('class')).toMatch(/disabled/i);
    });
    it('does not allow user to immediately add another lap time', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        const addLapCallback = vi.fn(() => {return true});
        render(<RaceEntryView entry={entry} addLap={addLapCallback} />);
        const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            user.click(SMScorp1234entry);
        });
        expect(addLapCallback).toHaveBeenCalledTimes(1);
        await act(async () => {
            user.click(SMScorp1234entry);
        });
        expect(addLapCallback).toHaveBeenCalledTimes(1);
    });
    describe('when add lap fails', () => {
        it('entry view is enabled to accept input', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            const addLapCallback = vi.fn(() => {return false});
            let container;
            ({ container } = render(<RaceEntryView entry={entry} addLap={addLapCallback} />));
            const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
            user.click(SMScorp1234entry);
            const raceEntryView = container.getElementsByClassName('race-entry-view')[0];
            expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
        });
    });
    // how to make this work useEffect results in a class on a visible field being changed so can't wait for an element to appear so waitFor doesn't seem to wait :-/
    describe.skip('when confirmation is received of the recorded lap', () => {
        it('updates the display to show it can be selected for lap entry', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const entry = new Entry(competitorChrisMarshall, competitorLouScrew, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/20', {eTag: '"1"'});
            entry.signedUpTo = [new SignedUp(raceScorpionA, entry)];
            const addLapCallback = vi.fn();
            const { rerender } = render(<RaceEntryView entry={entry} addLap={addLapCallback} />);
            const SMScorp1234entry = await screen.findByText(/1234/i);
            await act(async () => {
                user.click(SMScorp1234entry);
            });
            entry.laps.push({number:1, time: 1000 });
            await act(async () => {
                rerender(<RaceEntryView entry={entry} addLap={addLapCallback} />);
            });
            
            await waitFor(() => {
                expect(SMScorp1234entry.parentElement.getAttribute('class')).not.toMatch(/disabled/i);
            });            
        });
        it('accepts selection to add a new lap time', async () => {
            const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
            const entry = new Entry(competitorChrisMarshall, competitorLouScrew, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/20', {eTag: '"1"'});
            entry.signedUpTo = [new SignedUp(raceScorpionA, entry)];
            const addLapCallback = vi.fn();
            const { rerender } = render(<RaceEntryView entry={entry} addLap={addLapCallback} />);
            const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
            await act(async () => {
                user.click(SMScorp1234entry);
            });
            entry.laps.push({number: 1, time: 1000 });
            await act(async () => {
                rerender(<RaceEntryView entry={entry} addLap={addLapCallback} />);
            });
            await act(async () => {
                user.click(SMScorp1234entry);
            });
            expect(addLapCallback).toHaveBeenCalledTimes(2);
        });
    });
});

describe('when user drags and drops an entry to a new position', () => {
    // seems like a forced test but, couldn't get pointer events to trigger drag and drop API events :-(
    it('calls function passed to onRaceEntryDrop with subject key and target key', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const onRaceEntryDropSpy = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry1 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        const entry2 = new SynchronousEntry(
            new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy6745HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        const addLapCallback = vi.fn();
        render(
            <div>
                <RaceEntryView entry={entry1} addLap={addLapCallback} onRaceEntryDrop={onRaceEntryDropSpy} />
                <RaceEntryView entry={entry2} addLap={addLapCallback} onRaceEntryDrop={onRaceEntryDropSpy} />
            </div>
        );
        const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement;
        screen.getByText(/sarah pascal/i).parentElement.parentElement;

        await act(async () => {
            fireEvent.drop(rev1, {dataTransfer: {getData: () => {}}});
        });
        expect(onRaceEntryDropSpy).toHaveBeenCalled();
    });
    it('calls function passed to onRaceEntryDrop with value set by dragStart event', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const onRaceEntryDropSpy = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry1 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        const entry2 = new SynchronousEntry(
            new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy6745HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model),
            new Race(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        const addLapCallback = vi.fn();
        render(
            <div>
                <RaceEntryView entry={entry1} addLap={addLapCallback} onRaceEntryDrop={onRaceEntryDropSpy} />
                <RaceEntryView entry={entry2} addLap={addLapCallback} onRaceEntryDrop={onRaceEntryDropSpy} />
            </div>
        );
        const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement;
        const rev2 = screen.getByText(/sarah pascal/i).parentElement.parentElement;

        const dataTransferObject = {
            data: new Map(), 
            setData(key, value) {this.data.set(key, value)},
            getData(key) {this.data.get(key)}
        };
        await act(async () => {
            fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
            fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
        });
        expect(onRaceEntryDropSpy).toHaveBeenCalled();
    });
    describe('when race is a pursuit race', () => {
        it('updates the display to show the position of the target entry is being updated', async () => {
            const onRaceEntryDropSpy = vi.fn(async () => true);
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry1 = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(racePursuitAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            const entry2 = new SynchronousEntry(
                new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy6745HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model),
                new Race(racePursuitAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(
                <div>
                    <RaceEntryView entry={entry1} onRaceEntryDrop={onRaceEntryDropSpy} />
                    <RaceEntryView entry={entry2} onRaceEntryDrop={onRaceEntryDropSpy} />
                </div>
            );
            const subjectREV = screen.getByText((content, node) => /chris marshall/i.test(node.textContent) && node.classList.contains('race-entry-view'));
            const targetREV = screen.getByText((content, node) => /sarah pascal/i.test(node.textContent) && node.classList.contains('race-entry-view'));
            const dataTransferObject = {
                data: new Map(), 
                setData(key, value) {this.data.set(key, value)},
                getData(key) {this.data.get(key)}
            };
            await act(async () => {
                fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
                fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
            });
            expect(targetREV.getAttribute('class')).toMatch(/disabled/i);
        });
        describe('when entry drop fails', () => {
            it('entry view is enabled to accept input', async () => {
                const onRaceEntryDropSpy = vi.fn(async () => false);
                const model = new SylphModel(httpRootURL, wsRootURL);
                const entry1 = new SynchronousEntry(
                    new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                    new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                    new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                    new Race(racePursuitAHAL, {version: '"0"'}, model),
                    new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                    new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
                );
                const entry2 = new SynchronousEntry(
                    new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"', model}), 
                    new SynchronousDinghy(new Dinghy(dinghy6745HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                    new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model),
                    new Race(racePursuitAHAL, {version: '"0"'}, model),
                    new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                    new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
                );
                render(
                    <div>
                        <RaceEntryView entry={entry1} onRaceEntryDrop={onRaceEntryDropSpy} />
                        <RaceEntryView entry={entry2} onRaceEntryDrop={onRaceEntryDropSpy} />
                    </div>
                );
                const subjectREV = screen.getByText((content, node) => /chris marshall/i.test(node.textContent) && node.classList.contains('race-entry-view'));
                const targetREV = screen.getByText((content, node) => /sarah pascal/i.test(node.textContent) && node.classList.contains('race-entry-view'));
                const dataTransferObject = {
                    data: new Map(), 
                    setData(key, value) {this.data.set(key, value)},
                    getData(key) {this.data.get(key)}
                };
                await act(async () => {
                    fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
                });
                await act(async () => {
                    fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
                });
                expect(targetREV.getAttribute('class')).not.toMatch(/disabled/i);
            });
        });
        describe('when entry is dropped on itself', () => {
            it('does nothing', async () => {
                const onRaceEntryDropSpy = vi.fn();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const entry1 = new SynchronousEntry(
                    new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                    new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                    new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                    new Race(racePursuitAHAL, {version: '"0"'}, model),
                    new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                    new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
                );
                render(
                    <div>
                        <RaceEntryView entry={entry1} onRaceEntryDrop={onRaceEntryDropSpy} />
                    </div>
                );
                const subjectREV = screen.getByText(/chris marshall/i).parentElement.parentElement;
                const targetREV = screen.getByText(/chris marshall/i).parentElement.parentElement;

                const dataTransferObject = {
                    data: new Map(),
                    setData(key, value) {this.data.set(key, value)},
                    getData(key) {return this.data.get(key)}
                };
                await act(async () => {
                    fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
                });
                await act(async () => {
                    fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
                });
                expect(onRaceEntryDropSpy).not.toHaveBeenCalled();
            });
        });
    });
    describe('when race is not a pursuit race', () => {
        it('does not update the display to show the position of the target entry is being updated', async () => {
            const onRaceEntryDropSpy = vi.fn();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry1 = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Race(racePursuitAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            const entry2 = new SynchronousEntry(
                new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"', model}), 
                new SynchronousDinghy(new Dinghy(dinghy6745HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model),
                new Race(racePursuitAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            const addLapCallback = vi.fn();
            render(
                <div>
                    <RaceEntryView entry={entry1} addLap={addLapCallback} onRaceEntryDrop={onRaceEntryDropSpy} />
                    <RaceEntryView entry={entry2} addLap={addLapCallback} onRaceEntryDrop={onRaceEntryDropSpy} />
                </div>
            );
            const subjectREV = screen.getByText(/chris marshall/i).parentElement.parentElement;
            const targetREV = screen.getByText(/sarah pascal/i).parentElement.parentElement;
    
            const dataTransferObject = {
                data: new Map(), 
                setData(key, value) {this.data.set(key, value)},
                getData(key) {this.data.get(key)}
            };
            await act(async () => {
                fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
            });
            await act(async () => {
                fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
            });
            expect(targetREV.getAttribute('class')).not.toMatch(/disabled/i);
        });
    });
});

describe('when handler set for onFastGroup', () => {
    it('displays option to fast group entry', () => {
        const onFastGroupHandlerSpy = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(racePursuitAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} onFastGroup={onFastGroupHandlerSpy} />);
        const fastGroupButton = screen.getByRole('checkbox');
        expect(fastGroupButton).toBeInTheDocument();
    });
    it('fast group option shows selected when inFastGroup prop is true', async () => {
        const onFastGroupHandlerSpy = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(racePursuitAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} onFastGroup={onFastGroupHandlerSpy} inFastGroup={true} />);
        const fastGroupButton = screen.getByRole('checkbox');
        expect(fastGroupButton).toBeChecked();
    });
    it('fast group option shows unselected when inFastGroup prop is false', async () => {
        const onFastGroupHandlerSpy = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(racePursuitAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} onFastGroup={onFastGroupHandlerSpy} inFastGroup={false} />);
        const fastGroupButton = screen.getByRole('checkbox');

        expect(fastGroupButton).not.toBeChecked();
    });
    it('calls handler with key for entry when fast group option is checked', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const onFastGroupHandlerSpy = vi.fn();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(racePursuitAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} onFastGroup={onFastGroupHandlerSpy} />);
        const fastGroupButton = screen.getByRole('checkbox');
        await act(async () => {
            user.click(fastGroupButton);
        });

        expect(onFastGroupHandlerSpy).toHaveBeenCalledWith('Scorpion1234Chris Marshall');
    });
});

describe('when handler not set for onFastGroup', () => {
    it('does not display option to fast group entry', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new Race(racePursuitAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const fastGroupButton = screen.queryByRole('checkbox');
        expect(fastGroupButton).not.toBeInTheDocument();
    });
});