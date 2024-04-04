import { render, screen, within } from '@testing-library/react';
import ActionListView from './ActionListView';

it('renders', () => {
    render(<ActionListView actions={[]}/>);

    expect(screen.getByRole('heading', {name: /action list/i})).toBeInTheDocument();
});

it('displays a header for the action list', () => {
    render(<ActionListView actions={[]}/>);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /time/i})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /action/i})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /countdown/i})).toBeInTheDocument();
});

it('displays actions', () => {
    let formatOptions = {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const timeFormat = new Intl.DateTimeFormat('en-GB', formatOptions);

    const now = Date.now();
    const actions = [
        {time: new Date(now), description: 'Action 1'},
        {time: new Date(now + 300000), description: 'Action 2'},
        {time: new Date(now + 600000), description: 'Action 3'}
    ];

    render(<ActionListView actions={actions}/>);

    const actionRows = screen.getAllByRole('row');
    expect(actionRows).toHaveLength(4);
    expect(within(actionRows[1]).getByText(timeFormat.format(new Date(now)))).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/action 1/i)).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(timeFormat.format(new Date(now + 300000)))).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/action 2/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/05:00/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(timeFormat.format(new Date(now + 600000)))).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/action 3/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/10:00/i)).toBeInTheDocument();
});