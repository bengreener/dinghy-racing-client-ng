import { screen, render, prettyDOM, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import CreateRace from './CreateRace';

it('renders', () => {
    render(<CreateRace />);
})

it('accepts the name for a race', async () => {
    const user = userEvent.setup();
    
    render(<CreateRace />);
    const txtRaceName = await screen.findByLabelText('Race Name');
    await act(async () => {
        await user.type(txtRaceName, 'Graduate Helms');
    });
    
    expect(txtRaceName).toHaveValue('Graduate Helms');
});

it('accepts the time for the race', async () => {
    const user = userEvent.setup();

    render(<CreateRace />);
    const dateRaceTime = await screen.findByLabelText('Race Time');
    await act(async () => {
        await user.click(dateRaceTime);
        await user.clear(dateRaceTime)
        await user.keyboard('2020-05-12T12:30');
    });
    expect(dateRaceTime).toHaveValue('2020-05-12T12:30');
})

it('accepts the class for the race', async () => {
    const user = userEvent.setup();

    render(<CreateRace />);
    const txtRaceClass = await screen.findByLabelText('Race Class');
    await act(async () => {
        await user.type(txtRaceClass, 'Comet');
    });
    
    expect(txtRaceClass).toHaveValue('Comet');
})