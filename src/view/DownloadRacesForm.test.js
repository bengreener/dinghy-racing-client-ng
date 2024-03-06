import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DownloadRacesForm from './DownloadRacesForm';

it('renders', () => {
    render(<DownloadRacesForm />);
});

it('provides option to select start time and end time for session', async () => {
    render(<DownloadRacesForm />);

    const selectSessionStart = screen.getByLabelText(/session start/i);
    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionStart).toBeInTheDocument();
    expect(selectSessionEnd).toBeInTheDocument();
});

it('sets start and end time to defaults', () => {
    const expectedStartTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16);
    const expectedEndTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000).toISOString().substring(0, 16);

    render(<DownloadRacesForm />);
    expect(screen.getByLabelText(/session start/i)).toHaveValue(expectedStartTime);
    expect(screen.getByLabelText(/session end/i)).toHaveValue(expectedEndTime);
});

it('accepts a change to the get races in window start time', async () => {
    const user = userEvent.setup();

    render(<DownloadRacesForm />);

    const sessionStartInput = screen.getByLabelText(/session start/i);
    await act(async () => {
        await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
        await user.type(sessionStartInput, '2020-02-12T12:10');
    });
    expect(sessionStartInput).toHaveValue('2020-02-12T12:10');
});

it('accepts a change to the get races in window end time', async () => {
    const user = userEvent.setup();

    render(<DownloadRacesForm />);

    const sessionEndInput = screen.getByLabelText(/session end/i);
    await act(async () => {
        await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
        await user.type(sessionEndInput, '2075-02-12T12:10');
    });
    expect(sessionEndInput).toHaveValue('2075-02-12T12:10');
});