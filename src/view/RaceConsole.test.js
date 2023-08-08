import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import RaceConsole from './RaceConsole';

it('renders', () => {
    render(<RaceConsole />);

    const selectRace = screen.getByLabelText(/Select Race/i);
    expect(selectRace).toBeInTheDocument();
});