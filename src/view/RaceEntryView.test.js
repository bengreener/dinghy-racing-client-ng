import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaceEntryView from './RaceEntryView';
import { entryChrisMarshallScorpionA1234 } from '../model/__mocks__/test-data';

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