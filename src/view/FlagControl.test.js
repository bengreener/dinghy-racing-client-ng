import { act, render, screen } from '@testing-library/react';
import FlagControl, { FlagState } from './FlagControl';
import Clock from '../model/domain-classes/clock';

beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

it('diaplays the name of the flag', () => {
    const startTime = new Date(Date.now() + 60000);
    const clock = new Clock(startTime);
    const stateSequence = [{startTimeOffset: -600000, state: FlagState.RAISED}, {startTimeOffset: 0, state: FlagState.LOWERED}];

    render(<FlagControl name={'Flag A'} clock={clock} flagStateChangeTimings={stateSequence} />);

    expect(screen.getByLabelText(/flag/i)).toHaveValue('Flag A');
});

it('displays the correct status for the flag initially', () => {
    const startTime = new Date(Date.now() + 60000);
    const clock = new Clock(startTime);
    jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => -60000);

    const stateSequence = [{startTimeOffset: -600000, state: FlagState.RAISED}, {startTimeOffset: 0, state: FlagState.LOWERED}];

    render(<FlagControl name={'Flag A'} clock={clock} flagStateChangeTimings={stateSequence} />);

    expect(screen.getByLabelText(/state/i)).toHaveValue('Raised');
});

it('displays the time to the next flag state change', () => {
    const startTime = new Date(Date.now() + 60000);
    const clock = new Clock(startTime);
    jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => -60000);

    const stateSequence = [{startTimeOffset: -600000, state: FlagState.RAISED}, {startTimeOffset: 0, state: FlagState.LOWERED}];

    render(<FlagControl name={'Flag A'} clock={clock} flagStateChangeTimings={stateSequence} />);

    expect(screen.getByLabelText(/change in/i)).toHaveValue('01:00');
});

describe('when clock ticks', () => {
    describe('when a flag state change is triggered', () => {
        it('updates the displayed flag state to the new flag state', async () => {
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 1000);
            // jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => 0).mockImplementationOnce(() => -60000);
        
            const stateSequence = [{startTimeOffset: -600000, state: FlagState.RAISED}, {startTimeOffset: 0, state: FlagState.LOWERED}];
        
            render(<FlagControl name={'Flag A'} clock={clock} flagStateChangeTimings={stateSequence} />);
            
        
            expect(screen.getByLabelText(/state/i)).toHaveValue('Raised');
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText(/lowered/i);
            expect(screen.getByLabelText(/state/i)).toHaveValue('Lowered');
        });
    });
});