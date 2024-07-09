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

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaceEntryView from './RaceEntryView';
import { entryChrisMarshallScorpionA1234 } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';

const entryRowLastCellLapTimeCellOffset = 2;

beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

it('renders', () => {
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />, {container: document.body.appendChild(tableBody)});
    const SMScorp1234entry = screen.getByText(/1234/i);
    expect(SMScorp1234entry).toBeInTheDocument();
});

it('displays lap times', async () => {
    const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
    const entry = {...entryChrisMarshallScorpionA1234, laps: [{number: 1, time: 1234}]};
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} />, {container: document.body.appendChild(tableBody)});
    expect(screen.getByText('00:01')).toBeInTheDocument();
});

it('displays cumulative sum of lap times', async () => {
    const entry = {...entryChrisMarshallScorpionA1234, laps: [{number: 1, time: 1234}, {number: 2, time: 1234}, {number: 3, time: 1234}]};
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} />, {container: document.body.appendChild(tableBody)});
    expect(screen.getByText('00:01')).toBeInTheDocument();
    expect(screen.getByText('00:02')).toBeInTheDocument();
    expect(screen.getByText('00:04')).toBeInTheDocument();
});

it('displays position', () => {
    const entry = {...entryChrisMarshallScorpionA1234, laps: [{number: 1, time: 1234}, {number: 2, time: 1234}, {number: 3, time: 1234}], position: 5};
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} />, {container: document.body.appendChild(tableBody)});
    expect(screen.getByText('5')).toBeInTheDocument();
});

it('calls addLap callback with entry', async () => {
    const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
    const entry = {...entryChrisMarshallScorpionA1234};
    const addLapCallback = jest.fn((e) => {entry.laps.push({'number': 1, 'time': 1234})});
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} addLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
    const SMScorp1234entry = screen.getByText(/1234/i);
    await act(async () => {
        await user.click(SMScorp1234entry);
    });
    expect(addLapCallback).toBeCalledWith(entry);
});

it('calls removeLap callback with entry', async () => {
    const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
    const entry = {...entryChrisMarshallScorpionA1234};
    const removeLapCallback = jest.fn((e) => {entry.laps.pop()});
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} removeLap={removeLapCallback} />, {container: document.body.appendChild(tableBody)});
    const SMScorp1234entry = screen.getByText(/1234/i);
    await act(async () => {
        await user.keyboard('{Control>}');
        await user.click(SMScorp1234entry);
    });
    expect(removeLapCallback).toBeCalledWith(entry);
});

it('when secondary mouse button is clicked accepts a new lap time input in the last field of the row', async () => {
    const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
    const entry = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, {...DinghyRacingModel.lapTemplate(), number: 2, time: 2000}, {...DinghyRacingModel.lapTemplate(), number: 3, time: 3000}], 
        'sumOfLapTimes': 6000};
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} />, {container: document.body.appendChild(tableBody)});
    const entryRow = screen.getByText(/1234/i).parentElement;
    const lastCell = entryRow.children[entryRow.children.length - entryRowLastCellLapTimeCellOffset];
    await act(async () => {
        await user.pointer({target: lastCell, keys: '[MouseRight]'});
    });
    await act(async () => {
        await user.clear(lastCell.lastChild);
        await user.type(lastCell.lastChild, '00:15');
    });
    expect(lastCell.lastChild).toHaveValue('00:15');
});

describe('when editing a lap time', () => {
    it('does not add new lap when primary button clicked', async () => { 
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, {...DinghyRacingModel.lapTemplate(), number: 2, time: 2000}, {...DinghyRacingModel.lapTemplate(), number: 3, time: 3000}]};
        const addLapCallback = jest.fn();
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entry} adLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i);
        const lastCell = SMScorp1234entry.parentElement.lastChild;
        await act(async () => {
            await user.pointer({target: lastCell, keys: '[MouseRight]'});
        });
        await act(async () => {
            await user.click(SMScorp1234entry);
        });
        expect(addLapCallback).not.toHaveBeenCalled();
    });
    it('does not remove last lap when ctrl+primary button clicked', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234};
        const removeLapCallback = jest.fn((e) => {entry.laps.pop()});
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entry} removeLap={removeLapCallback} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i);
        const lastCell = SMScorp1234entry.parentElement.lastChild;
        await act(async () => {
            await user.pointer({target: lastCell, keys: '[MouseRight]'});
        });
        await act(async () => {
            await user.keyboard('{Control>}');
            await user.click(SMScorp1234entry);
        });
        expect(removeLapCallback).not.toHaveBeenCalled();
    });
    it('updates lap with new time supplied', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234, 'laps': [
            {...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, 
            {...DinghyRacingModel.lapTemplate(), number: 2, time: 2000}, 
            {...DinghyRacingModel.lapTemplate(), number: 3, time: 3000}
        ]};
        const tableBody = document.createElement('tbody');
        const updateLapCallback = jest.fn((entry, value) => {});
        render(<RaceEntryView entry={entry} updateLap={updateLapCallback} />, {container: document.body.appendChild(tableBody)});
        const entryRow = screen.getByText(/1234/i).parentElement;
        const lastCell = entryRow.children[entryRow.children.length - entryRowLastCellLapTimeCellOffset];
        await act(async () => {
            await user.pointer({target: lastCell, keys: '[MouseRight]'});
        });
        await act(async () => {
            await user.clear(lastCell.lastChild);
            await user.type(lastCell.lastChild, '15:53');
            await user.keyboard('{Enter}');
        });
        expect(updateLapCallback).toBeCalledWith(entry, '15:53');
    });
});

describe('when user taps row', () => {
    it('calls addLap callback with entry', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234};
        const addLapCallback = jest.fn((e) => {entry.laps.push({'number': 1, 'time': 1234})});
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entry} addLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i);
        await act(async () => {
            await user.pointer([{keys: '[TouchA]', target: SMScorp1234entry}]);
        });
        expect(addLapCallback).toBeCalledWith(entry);
    });
});

describe('when user taps and holds on row', () => {
    it('accepts a new lap time input in the last field of the row', async () => {
        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, {...DinghyRacingModel.lapTemplate(), number: 2, time: 2000}, {...DinghyRacingModel.lapTemplate(), number: 3, time: 3000}]};
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entry} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i);
        const entryRow = screen.getByText(/1234/i).parentElement;
        const lastCell = entryRow.children[entryRow.children.length - entryRowLastCellLapTimeCellOffset];
        await act(async () => {
            await user.pointer({target: SMScorp1234entry, keys: '[TouchA>]'});
        });
        act(() => {
            jest.advanceTimersByTime(500);
        });
        await act(async () => {
            await user.clear(lastCell.lastChild);
            await user.type(lastCell.lastChild, '00:15');
        });
        // expect(lastCell.lastChild).toHaveValue(15678);
        expect(lastCell.lastChild).toHaveValue('00:15');
    });
});

// may not be possible to test this due to a current issue in @testing-library/user-event with generating pointer move event 
// https://github.com/testing-library/user-event/issues/1047
describe('when user swipes left on row', () => {
    xit('calls removeLap callback with entry', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, {...DinghyRacingModel.lapTemplate(), number: 2, time: 2000}, {...DinghyRacingModel.lapTemplate(), number: 3, time: 3000}]};
        const removeLapCallback = jest.fn((e) => {entry.laps.pop()});
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entry} removeLap={removeLapCallback} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i);
        const position1 = SMScorp1234entry.parentElement.children[3];
        const position2 = SMScorp1234entry.parentElement.children[2];
        await act(async () => {
            await user.pointer([{target: position1, coords: {x: 100, y: 100}, keys: '[TouchA>]'}, 
                {target:position2, coords: {x: 80, y: 100}, keys: '[TouchA]'}, {keys: '[/TouchA]'}]);
        });
        expect(removeLapCallback).toBeCalledWith(entry);
    });
});

describe('when entry is on last lap', () => {
    it('has a class of on-last-lap', () => {
        const entryOnLastLap = {...entryChrisMarshallScorpionA1234, 'onLastLap': true};
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entryOnLastLap} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i).parentElement;
        expect(SMScorp1234entry.getAttribute('class')).toMatch(/on-last-lap/i);
    });
});

describe('when entry is not on last lap', () => {
    it('does not have a class of on-last-lap', () => {
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i).parentElement;
        expect(SMScorp1234entry.getAttribute('class')).not.toMatch(/on-last-lap/i);
    });
});

describe('when entry has finished race', () => {
    it('has a class of finished-race', () => {
        const entryOnLastLap = {...entryChrisMarshallScorpionA1234, 'finishedRace': true};
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entryOnLastLap} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i).parentElement;
        expect(SMScorp1234entry.getAttribute('class')).toMatch(/finished-race/i);
    });
});

describe('when entry has not finished race', () => {
    it('does not have a class of finished-race', () => {
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i).parentElement;
        expect(SMScorp1234entry.getAttribute('class')).not.toMatch(/finished-race/i);
    });
});

describe('when a scoring abbreviation is not selected', () => {
    it('only has a class of race-entry-view', () => {
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i).parentElement;
        expect(SMScorp1234entry.getAttribute('class')).toMatch(/^race-entry-view$/i);
    });
});

describe('when a scoring abbreviation is selected', () => {
    it('calls setScoringAbbreviation callback provided as prop', async () => {
        const setScoringAbbreviationSpy = jest.fn();
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} setScoringAbbreviation={setScoringAbbreviationSpy}/>, {container: document.body.appendChild(tableBody)});
        const selectSA = screen.getByRole('combobox');
        await user.selectOptions(selectSA, 'DNS');
        expect(setScoringAbbreviationSpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, 'DNS');
    });
    describe('when entry did not start the race', () => {
        it('has a class of did-not-start', () => {
            const entryDNS = {...entryChrisMarshallScorpionA1234, 'scoringAbbreviation': 'DNS'};
            const tableBody = document.createElement('tbody');
            render(<RaceEntryView entry={entryDNS} />, {container: document.body.appendChild(tableBody)});
            const SMScorp1234entry = screen.getByText(/1234/i).parentElement;
            expect(SMScorp1234entry.getAttribute('class')).toMatch(/did-not-start/i);
        });
    });
    describe('when entry retired', () => {
        it('has a class of retired', () => {
            const entryRET = {...entryChrisMarshallScorpionA1234, 'scoringAbbreviation': 'RET'};
            const tableBody = document.createElement('tbody');
            render(<RaceEntryView entry={entryRET} />, {container: document.body.appendChild(tableBody)});
            const SMScorp1234entry = screen.getByText(/1234/i).parentElement;
            expect(SMScorp1234entry.getAttribute('class')).toMatch(/retired/i);
        });
    });
    describe('when entry disqualified', () => {
        it('has a class of disqualified', () => {
            const entryRET = {...entryChrisMarshallScorpionA1234, 'scoringAbbreviation': 'DSQ'};
            const tableBody = document.createElement('tbody');
            render(<RaceEntryView entry={entryRET} />, {container: document.body.appendChild(tableBody)});
            const SMScorp1234entry = screen.getByText(/1234/i).parentElement;
            expect(SMScorp1234entry.getAttribute('class')).toMatch(/disqualified/i);
        });
    });
});

describe('when the entry is selected to add a new lap', () => {
    it('updates the display to show it has been selected', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234};
        const addLapCallback = jest.fn();
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entry} addLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i);
        await act(async () => {
            await user.click(SMScorp1234entry);
        });
        expect(SMScorp1234entry.parentElement.getAttribute('class')).toMatch(/disabled/i);
    });
    it('does not accept selection to add a new lap time', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234};
        const addLapCallback = jest.fn();
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entry} addLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/1234/i);
        await act(async () => {
            await user.click(SMScorp1234entry);
        });
        expect(addLapCallback).toHaveBeenCalledTimes(1);
        await act(async () => {
            await user.click(SMScorp1234entry);
        });
        expect(addLapCallback).toHaveBeenCalledTimes(1);
    });
    // how to make this work useEffect results in a class on a visible field being chnaged so can't wait for an element to appear so waitFor doesn't seem to wait :-/
    xdescribe('when confirmation is received pf the recorded lap', () => {
        it('updates the display to show it can be selected for lap entry', async () => {
            const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
            const entry = {...entryChrisMarshallScorpionA1234, laps: []};
            const addLapCallback = jest.fn();
            const tableBody = document.createElement('tbody');
            const { rerender } = render(<RaceEntryView entry={entry} addLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
            const SMScorp1234entry = await screen.findByText(/1234/i);
            await act(async () => {
                await user.click(SMScorp1234entry);
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
            const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
            const entry = {...entryChrisMarshallScorpionA1234, laps: []};
            const addLapCallback = jest.fn();
            const tableBody = document.createElement('tbody');
            const { rerender } = render(<RaceEntryView entry={entry} addLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
            const SMScorp1234entry = screen.getByText(/1234/i);
            await act(async () => {
                await user.click(SMScorp1234entry);
            });
            entry.laps.push({number: 1, time: 1000 });
            await act(async () => {
                rerender(<RaceEntryView entry={entry} addLap={addLapCallback} />);
            });
            await act(async () => {
                await user.click(SMScorp1234entry);
            });
            expect(addLapCallback).toHaveBeenCalledTimes(2);
        });
    });
});