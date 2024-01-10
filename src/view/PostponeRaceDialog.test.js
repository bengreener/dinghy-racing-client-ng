import { act, render } from '@testing-library/react';
import { screen, logRoles } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostponeRaceDialog from './PostponeRaceDialog';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { raceScorpionA } from '../model/__mocks__/test-data';

// previous testing identified dialog element not (properly?) implemented in jsdom
// elements not accessible unless searching for hidden aria elements; do not know mechanism in use, does not appear to be aria-hidden
// showModal() does not work on dialog

it('renders', () => {
    render(<PostponeRaceDialog />);
    expect(screen.getByRole('dialog', {'hidden': true})).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', {'name': /delay/i, 'hidden': true})).toBeInTheDocument();
    expect(screen.getByRole('button', {'name': /cancel/i, 'hidden': true})).toBeInTheDocument();
    expect(screen.getByRole('button', {'name': /postpone/i, 'hidden': true})).toBeInTheDocument();
});

describe('when delay is input', () => {
    it('accepts delay input', async () => {
        const user = userEvent.setup();
        render(<PostponeRaceDialog />);
        const delayInput = screen.getByRole('spinbutton', {'name': /delay/i, 'hidden': true});
        await act(async () => {
            await user.clear(delayInput);
            await user.type(delayInput, '155');
        });
        expect(delayInput).toHaveValue(155);
    });
    it('does not accept negative duration value', async () => {
        const user = userEvent.setup();
        render(<PostponeRaceDialog />);
        const delayInput = screen.getByRole('spinbutton', {'name': /delay/i, 'hidden': true});
        await act(async () => {
            await user.clear(delayInput);
            await user.type(delayInput, '-20');
        });
        expect(delayInput).not.toHaveValue(-20);
    })
});

describe('when postpone button clicked', () => {
    it('postpones race', async () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const postponeCallback = jest.fn((race, duration) => {});
        const user = userEvent.setup();
        render(<PostponeRaceDialog race={raceScorpionA} onPostpone={postponeCallback} onClose={jest.fn()} />);
        const postponeButtton = screen.getByRole('button', {'name': /postpone/i, 'hidden': true});
        await user.click(postponeButtton);
        expect(postponeCallback).toBeCalledTimes(1);
    });
    it('closes dialog', async () => {
        const mockClose = jest.fn();
        HTMLDialogElement.prototype.close = mockClose;
        const postponeCallback = jest.fn((race, duration) => {});
        const user = userEvent.setup();
        render(<PostponeRaceDialog race={raceScorpionA} onPostpone={postponeCallback} onClose={jest.fn()} />);
        const postponeButtton = screen.getByRole('button', {'name': /postpone/i, 'hidden': true});
        await user.click(postponeButtton);
        expect(mockClose).toBeCalledTimes(1);
    });
});

// describe('when cancel button clicked', () => {
//     it('closes dialog without postponing race', async () => {
//         const mockClose = jest.fn();
//         HTMLDialogElement.prototype.close = mockClose;
//         const postponeCallback = jest.fn((race, duration) => {});
//         const user = userEvent.setup();
//         render(<PostponeRaceDialog race={raceScorpionA} onPostpone={postponeCallback} />);
//         const cancelButtton = screen.getByRole('button', {'name': /cancel/i, 'hidden': true});
//         await user.click(cancelButtton);
//         expect(mockClose).not.toBeCalled();
//         expect(mockClose).toBeCalledTimes(1);
//     })
// });