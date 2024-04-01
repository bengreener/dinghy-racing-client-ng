import { render, screen } from '@testing-library/react';
import FlagControl, { FlagState } from './FlagControl';
import Clock from '../model/domain-classes/clock';

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