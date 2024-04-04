import { render, screen } from '@testing-library/react';
import ActionListView from './ActionListView';

it('renders', () => {
    render(<ActionListView />);

    expect(screen.getByRole('heading', {name: /action list/i})).toBeInTheDocument();
})