import { render, screen } from '@testing-library/react';
import SelectSession from './SelectSession';

it('renders', () => {
    render(<SelectSession />);
});

it('provides option to select start time for session', async () => {
    render(<SelectSession />);

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toBeInTheDocument();
});

it('provides option to select end time for session', async () => {
    render(<SelectSession />);

    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toBeInTheDocument();
});