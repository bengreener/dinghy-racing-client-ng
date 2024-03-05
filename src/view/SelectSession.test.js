import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    const onSessionStartChangeSpy = jest.fn();
    const sessionStart = new Date('2024', '11', '25', 8, 30);
    render(<SelectSession sessionStart={sessionStart} onSessionStartChange={onSessionStartChangeSpy}/>);

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toHaveValue(sessionStart.toISOString().substring(0, 16));
});

it('displays session end provided as prop', () => {
    const onSessionEndChangeSpy = jest.fn();
    const sessionEnd = new Date('2024', '12', '25', 18, 0);
    render(<SelectSession sessionEnd={sessionEnd} onSessionEndChange={onSessionEndChangeSpy}/>);

    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toHaveValue(sessionEnd.toISOString().substring(0, 16));
});

describe('when session start is set to a valid date', () => {
    it('calls session start change handler with date set', async () => {
        const user = userEvent.setup();
        const onSessionStartChangeSpy = jest.fn();

        const sessionStart = new Date('2024', '11', '25', 8, 30);
        render(<SelectSession sessionStart={sessionStart} onSessionStartChange={onSessionStartChangeSpy}/>);

        const sessionStartInput = screen.getByLabelText(/session start/i);
        await act(async () => {
            await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
            await user.type(sessionStartInput, '2020-05-12T12:30');
        });
        expect(onSessionStartChangeSpy).toBeCalledWith(new Date('2020-05-12T12:30'));
    });
});

describe('when session start is set to an invalid date', () => {
    it('does not call session start change handler', async () => {
        const user = userEvent.setup();
        const onSessionStartChangeSpy = jest.fn();

        const sessionStart = new Date('2024', '11', '25', 8, 30);
        render(<SelectSession sessionStart={sessionStart} onSessionStartChange={onSessionStartChangeSpy}/>);

        const sessionStartInput = screen.getByLabelText(/session start/i);
        await act(async () => {
            await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
            await user.type(sessionStartInput, '0000-00-00T00:00');
        });
        expect(onSessionStartChangeSpy).toHaveBeenCalledTimes(0);
    });
});

describe('when session end is set to a valid date', () => {
    it('calls session end change handler with date set', async () => {
        const user = userEvent.setup();
        const onSessionEndChangeSpy = jest.fn();

        const sessionEnd = new Date('2024', '11', '25', 8, 30);
        render(<SelectSession sessionEnd={sessionEnd} onSessionEndChange={onSessionEndChangeSpy}/>);

        const sessionEndInput = screen.getByLabelText(/session end/i);
        await act(async () => {
            await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
            await user.type(sessionEndInput, '2020-05-12T12:30');
        });
        expect(onSessionEndChangeSpy).toBeCalledWith(new Date('2020-05-12T12:30'));
    });
});

describe('when session end is set to an invalid date', () => {
    it('does not call session end change handler', async () => {
        const user = userEvent.setup();
        const onSessionEndChangeSpy = jest.fn();

        const sessionEnd = new Date('2024', '11', '25', 8, 30);
        render(<SelectSession sessionEnd={sessionEnd} onSessionEndChange={onSessionEndChangeSpy}/>);

        const sessionEndInput = screen.getByLabelText(/session end/i);
        await act(async () => {
            await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
            await user.type(sessionEndInput, '0000-00-00T00:00');
        });
        expect(onSessionEndChangeSpy).toHaveBeenCalledTimes(0);
    });
});