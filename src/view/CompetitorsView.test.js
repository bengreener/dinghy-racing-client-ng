import { screen, render } from '@testing-library/react';
import CompetitorsView from './CompetitorsView';

it('renders', () => {
    render(<CompetitorsView />);
    expect(screen.getByRole('heading', {name: 'Competitors'})).toBeInTheDocument();
});