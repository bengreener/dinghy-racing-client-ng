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

it('displays session start provided as prop', () => {
    const sessionStart = new Date('2024', '12', '25', 8, 30).toISOString().substring(0, 16);
    render(<SelectSession sessionStart={sessionStart}/>);

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toHaveValue(sessionStart);
});

it('displays session end provided as prop', () => {
    const sessionEnd = new Date('2024', '12', '25', 18, 0).toISOString().substring(0, 16);
    render(<SelectSession sessionEnd={sessionEnd}/>);

    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toHaveValue(sessionEnd);
});