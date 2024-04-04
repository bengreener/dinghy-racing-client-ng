import { render, screen } from '@testing-library/react';
import ActionListView from './ActionListView';

it('renders', () => {
    render(<ActionListView />);

    expect(screen.getByRole('heading', {name: /action list/i})).toBeInTheDocument();
});

it('displays a header for the action list', () => {
    render(<ActionListView />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /time/i})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /action/i})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /countdown/i})).toBeInTheDocument();
})