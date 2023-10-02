import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaceEntryView from './RaceEntryView';
import { entryChrisMarshallScorpionA1234 } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';

it('renders', () => {
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />, {container: document.body.appendChild(tableBody)});
    const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
    expect(SMScorp1234entry).toBeInTheDocument();
});

it('displays lap times', async () => {
    const user = userEvent.setup();
    const entry = {...entryChrisMarshallScorpionA1234, laps: [{'number': 1, 'time': 1234}]};
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} />, {container: document.body.appendChild(tableBody)});
    expect(screen.getByText(1234)).toBeInTheDocument();
});

it('calls addLap callback with entry', async () => {
    const user = userEvent.setup();
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
    const user = userEvent.setup();
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
    const user = userEvent.setup();
    const entry = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, {...DinghyRacingModel.lapTemplate(), number: 2, time: 2000}, {...DinghyRacingModel.lapTemplate(), number: 3, time: 3000}]};
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} />, {container: document.body.appendChild(tableBody)});
    const entryCell = screen.getByText(/scorpion 1234/i);
    const lastCell = entryCell.parentElement.lastChild;
    await act(async () => {
        await user.pointer({target: lastCell, keys: '[MouseRight]'});
    });
    await user.clear(lastCell.lastChild);
    await user.type(lastCell.lastChild, '15678');
    expect(lastCell.lastChild).toHaveValue(15678);
});

describe('when editing a lap time', () => {
    it('does not add new lap when primary button clicked', async () => { 
        const user = userEvent.setup();
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
        const user = userEvent.setup();
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
        const user = userEvent.setup();
        const entry = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, {...DinghyRacingModel.lapTemplate(), number: 2, time: 2000}, {...DinghyRacingModel.lapTemplate(), number: 3, time: 3000}]};
        const tableBody = document.createElement('tbody');
        const updateLapCallback = jest.fn((entry, value) => {});
        render(<RaceEntryView entry={entry} updateLap={updateLapCallback} />, {container: document.body.appendChild(tableBody)});
        const entryCell = screen.getByText(/scorpion 1234/i);
        const lastCell = entryCell.parentElement.lastChild;
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