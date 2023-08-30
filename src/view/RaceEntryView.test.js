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

it('calls onClick handler with entry', async () => {
    const user = userEvent.setup();
    const entry = {...entryChrisMarshallScorpionA1234};
    const clickHandler = jest.fn((e) => {entry.laps.push({'number': 1, 'time': 1234})});
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entry} addLap={clickHandler} />, {container: document.body.appendChild(tableBody)});
    const SMScorp1234entry = screen.getByText(/scorpion 1234 chris marshall/i);
    await act(async () => {
        await user.click(SMScorp1234entry);
    });
    expect(clickHandler).toBeCalledWith(entry);
})