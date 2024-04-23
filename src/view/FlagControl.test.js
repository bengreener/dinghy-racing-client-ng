import { act, render, screen } from '@testing-library/react';
import Clock from '../model/domain-classes/clock';
import FlagControl from './FlagControl';
import FlagState from '../model/domain-classes/flag-state';

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
    render(<FlagControl flag={{name: 'Flag A', state: FlagState.LOWERED, timeToChange: -152234}} />);

    expect(screen.getByLabelText(/flag/i)).toHaveValue('Flag A');
});

it('displays the correct status for the flag', () => {
    render(<FlagControl flag={{name: 'Flag A', state: FlagState.RAISED, timeToChange: -1542}} />);

    expect(screen.getByLabelText(/state/i)).toHaveValue('Raised');
});

it('displays the time to the next flag state change', () => {
    render(<FlagControl flag={{name: 'Flag A', state: FlagState.RAISED, timeToChange: -60000}} />);

    expect(screen.getByLabelText(/change in/i)).toHaveValue('01:00');
});