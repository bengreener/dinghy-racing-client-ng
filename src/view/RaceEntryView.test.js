import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaceEntryView from './RaceEntryView';
import { entryChrisMarshallScorpionA1234 } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';

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
    const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
    expect(SMScorp1234entry).toBeInTheDocument();
});

it('displays lap times', async () => {
    const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
    const entry = {...entryChrisMarshallScorpionA1234, laps: [{'number': 1, 'time': 1234}]};
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} />, {container: document.body.appendChild(tableBody)});
    expect(screen.getByText('00:00:01')).toBeInTheDocument();
});

it('calls addLap callback with entry', async () => {
    const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
    const entry = {...entryChrisMarshallScorpionA1234};
    const addLapCallback = jest.fn((e) => {entry.laps.push({'number': 1, 'time': 1234})});
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} addLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
    const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
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
    const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
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
    const entryRow = screen.getByText(/scorpion 1234/i).parentElement;
    const lastCell = entryRow.children[entryRow.children.length - 2];
    await act(async () => {
        await user.pointer({target: lastCell, keys: '[MouseRight]'});
    });
    await user.clear(lastCell.lastChild);
    await user.type(lastCell.lastChild, '15678');
    expect(lastCell.lastChild).toHaveValue(15678);
});

describe('when editing a lap time', () => {
    it('does not add new lap when primary button clicked', async () => { 
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, {...DinghyRacingModel.lapTemplate(), number: 2, time: 2000}, {...DinghyRacingModel.lapTemplate(), number: 3, time: 3000}]};
        const addLapCallback = jest.fn();
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entry} adLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
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
        const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
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
        const entry = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, {...DinghyRacingModel.lapTemplate(), number: 2, time: 2000}, {...DinghyRacingModel.lapTemplate(), number: 3, time: 3000}]};
        const tableBody = document.createElement('tbody');
        const updateLapCallback = jest.fn((entry, value) => {});
        render(<RaceEntryView entry={entry} updateLap={updateLapCallback} />, {container: document.body.appendChild(tableBody)});
        const entryRow = screen.getByText(/scorpion 1234/i).parentElement;
        const lastCell = entryRow.children[entryRow.children.length - 2];
        await act(async () => {
            await user.pointer({target: lastCell, keys: '[MouseRight]'});
        });
        await user.clear(lastCell.lastChild);
        await user.type(lastCell.lastChild, '15678');
        await act(async () => {
            await user.keyboard('{Enter}');
        });
        expect(updateLapCallback).toBeCalledWith(entry, 15678);
    });
});

describe('when user taps row', () => {
    it('calls addLap callback with entry', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const entry = {...entryChrisMarshallScorpionA1234};
        const addLapCallback = jest.fn((e) => {entry.laps.push({'number': 1, 'time': 1234})});
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entry} addLap={addLapCallback} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
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
        const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
        const entryRow = screen.getByText(/scorpion 1234/i).parentElement;
        const lastCell = entryRow.children[entryRow.children.length - 2];
        await act(async () => {
            await user.pointer({target: SMScorp1234entry, keys: '[TouchA>]'});
        });
        act(() => {
            jest.advanceTimersByTime(500);
        });
        await user.clear(lastCell.lastChild);
        await user.type(lastCell.lastChild, '15678');
        expect(lastCell.lastChild).toHaveValue(15678);
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
        const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
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
    it('sets a class of on-last-lap', () => {
        const entryOnLastLap = {...entryChrisMarshallScorpionA1234, 'onLastLap': true};
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entryOnLastLap} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i).parentElement;
        expect(SMScorp1234entry.getAttribute('class')).toMatch(/on-last-lap/i);
    });
});

describe('when entry is on last lap', () => {
    it('sets a class of on-last-lap', () => {
        const tableBody = document.createElement('tbody');
        render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />, {container: document.body.appendChild(tableBody)});
        const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i).parentElement;
        expect(SMScorp1234entry.getAttribute('class')).not.toMatch(/on-last-lap/i);
    });
});