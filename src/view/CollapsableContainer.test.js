import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CollapsableContainer from './CollapsableContainer';

it('renders', () => {
    render(<CollapsableContainer />);
});

it('displays header', () => {
    render(<CollapsableContainer heading={'Test Heading'} />);

    expect(screen.getByText(/test heading/i)).toBeInTheDocument();
})

it('renders children', () => {
    render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
    expect(screen.getByText(/world/i)).toBeInTheDocument();
});

it('shows buttton to toggle visibility of children', () => {
    render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
    expect(screen.getByRole('button', {'name': /hide/i})).toBeInTheDocument();
});

describe('when hide button clicked', () => {
    it('hides children', async () => {
        const user = userEvent.setup();
        render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
        expect(screen.getByText(/hello/i)).toBeInTheDocument();
        expect(screen.getByText(/world/i)).toBeInTheDocument();
        const buttonHide = screen.getByRole('button', {'name': /hide/i});
        await act(async () => {
            await user.click(buttonHide);
        });
        expect(screen.queryByText(/hello/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/world/i)).not.toBeInTheDocument();
    });
    it('changes label on hide button to show', async () => {
        const user = userEvent.setup();
        render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
        const buttonHide = screen.getByRole('button', {'name': /hide/i});
        await act(async () => {
            await user.click(buttonHide);
        });
        expect(screen.getByRole('button', {'name': /show/i})).toBeInTheDocument();
    });
});

describe('when show button clicked', () => {
    it('shows children', async () => {
        const user = userEvent.setup();
        render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /hide/i}));
        });
        expect(screen.queryByText(/hello/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/world/i)).not.toBeInTheDocument();
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /show/i}));
        });
        expect(screen.queryByText(/hello/i)).toBeInTheDocument();
        expect(screen.queryByText(/world/i)).toBeInTheDocument();
    });
    it('changes label on show button to hide', async () => {
        const user = userEvent.setup();
        render(<CollapsableContainer children={[<p key='p1'>Hello</p>, <p key='p2'>World</p>]} />);
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /hide/i}));
        });
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /show/i}));
        });
        expect(screen.getByRole('button', {'name': /hide/i})).toBeInTheDocument();
    });
});