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
import userEvent from '@testing-library/user-event';
import CurrentEntries from './CurrentEntries';
import SylphModel from '../model/sylph-model';
import Entry from '../model/entry';
import DirectRace from '../model/direct-race';
import { httpRootURL, wsRootURL, raceCometAHAL, raceHandicapAHAL, raceScorpionAHAL, entryChrisMarshall1234ScorpionAHAL } from '../model/__mocks__/test-data';
import { buildSynchronousEntries } from './synchronous-model/synchronous-model';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');
vi.mock(import('./synchronous-model/synchronous-model'), { spy: true });

beforeEach(() => {
    vi.resetAllMocks();
});
it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<CurrentEntries race={race} />);
    });
    expect(screen.getByRole('columnheader', {name: /helm/i})).toBeInTheDocument();
});
it('shows number of entries for each dinghy class', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new DirectRace(raceHandicapAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<CurrentEntries race={race} />);
    });
    const entriesSummary = document.getElementsByClassName('entries-summary')[0];
    const summaryRows = within(entriesSummary).getAllByRole('row');
    expect(within(summaryRows[1]).getByText(/comet/i)).toBeInTheDocument();
    expect(within(summaryRows[1]).getByText(/1/i)).toBeInTheDocument();
    expect(within(summaryRows[2]).getByText(/scorpion/i)).toBeInTheDocument();
    expect(within(summaryRows[2]).getByText(/2/i)).toBeInTheDocument();
});
describe('when an entry is selected', () => {
    it('calls onSelect handler with entry', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const onEntrySelectedSpy = vi.fn();
        await act(async () => {
            render(<CurrentEntries race={race} onEntrySelected={onEntrySelectedSpy} />);
        });
        await user.click(screen.getByRole('row', {name: /Chris Marshall 1234 Scorpion Lou Screw X/i}));
        expect(onEntrySelectedSpy).toBeCalledWith(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
    });
});
describe('when an entry is selected for withdrawal', () => {
    it('calls onWithdrawEntry handler with entry', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const onWithdrawEntrySpy = vi.fn();
        await act(async () => {
            render(<CurrentEntries race={race} onWithdrawEntry={onWithdrawEntrySpy} />);
        });
        const entryRow = screen.getByRole('row', {name: /Chris Marshall 1234 Scorpion Lou Screw X/i});
        await user.click(within(entryRow).getByRole('button', {name: /x/i}));
        expect(onWithdrawEntrySpy).toBeCalledWith(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
    });
});
describe('when race is for dinghies with crew', () => {
    it('shows helm, sail number, class, and crew', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<CurrentEntries race={race} />);
        });
        expect(screen.getByRole('columnheader', {name: /helm/i})).toBeInTheDocument();
        expect(screen.getByRole('columnheader', {name: /sail number/i})).toBeInTheDocument();
        expect((screen.getAllByRole('columnheader', {name: /class/i}))[0]).toBeInTheDocument();
        expect(screen.getByRole('columnheader', {name: /crew/i})).toBeInTheDocument();
    });
    it('displays entry details', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<CurrentEntries race={race} />);
        });
        expect(screen.getByText(/chris marshall/i)).toBeInTheDocument();
        expect(screen.getByText(/1234/i)).toBeInTheDocument();
        expect((screen.getAllByText(/scorpion/i))[0]).toBeInTheDocument();
        expect(screen.getByText(/lou screw/i)).toBeInTheDocument();
    });
});
describe('when race is for dinghies without crew', () => {
    it('shows helm, sail number, and class', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceCometAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<CurrentEntries race={race} />);
        });
        expect(screen.getByRole('columnheader', {name: /helm/i})).toBeInTheDocument();
        expect(screen.getByRole('columnheader', {name: /sail number/i})).toBeInTheDocument();
        expect((screen.getAllByRole('columnheader', {name: /class/i}))[0]).toBeInTheDocument();
        expect(screen.queryByRole('columnheader', {name: /crew/i})).not.toBeInTheDocument();
    });
    it('displays entry details', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceCometAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<CurrentEntries race={race} />);
        });
        expect(screen.getByText(/jill myer/i)).toBeInTheDocument();
        expect(screen.getByText(/826/i)).toBeInTheDocument();
        expect((screen.getAllByText(/comet/i))[0]).toBeInTheDocument();
    });
});
// adding a new entry to a race will trigger a race update so this will refresh current entries display
describe('when a race is updated', () => {
    it('updates display', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<CurrentEntries race={race} />);
        });
        await act(async () => {
            model.handleRaceUpdate({body: race.url});
        });
        expect(buildSynchronousEntries).toHaveBeenCalledTimes(2);
    });
});
describe('when an entry is signed up to the race', () => {
    it('updates display', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<CurrentEntries race={race} />);
        });
        await act(async () => {
            model.handleEntryCreation({body: entryChrisMarshall1234ScorpionAHAL._links.self.href});
        });
        expect(buildSynchronousEntries).toHaveBeenCalledTimes(2);
    });
});
describe('when an entry in the race is updated', () => {
    it('updates display', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<CurrentEntries race={race} />);
        });
        await act(async () => {
            model.handleEntryUpdate({body: entryChrisMarshall1234ScorpionAHAL._links.self.href});
        });
        expect(buildSynchronousEntries).toHaveBeenCalledTimes(2);
    });
});
describe('when an entry in the race is withdrawn', () => {
    it('updates display', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<CurrentEntries race={race} />);
        });
        expect(await screen.findByRole('cell', {'name': /chris marshall/i})).toBeInTheDocument();
        await act(async () => {
            model.handleEntryDeletion({body: entryChrisMarshall1234ScorpionAHAL._links.self.href});
        });
        expect(buildSynchronousEntries).toHaveBeenCalledTimes(2);
    });
})