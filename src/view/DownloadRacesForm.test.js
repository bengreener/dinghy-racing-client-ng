import { render, screen } from '@testing-library/react';
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