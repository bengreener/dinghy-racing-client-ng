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