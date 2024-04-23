import { render, screen } from '@testing-library/react';
import ModalDialog from './ModalDialog';

// jsdom 16.7.0 does not implement HTMLDialogElement behaviour
// unsure how to address this. A better understanding f the standard and jsdom implementation might help
HTMLDialogElement.prototype.showModal = jest.fn();
HTMLDialogElement.prototype.close = jest.fn();

describe('when set to show', () => {
    it('renders with children vsible', async () => {
        function TestText() {
            return (<p>Test Text</p>)
        };
        render(<ModalDialog show={true} onClose={jest.fn()} children={TestText()} />);
        const testText = await screen.findByText('Test Text');
        expect(testText).toBeInTheDocument();
    });
});

describe('when show is false', () => {
    // cannot test with jsdom implementation
    xit('renders with children invsible', async () => {
        function TestText() {
            return (<p>Test Text</p>)
        };
        render(<ModalDialog show={false} onClose={jest.fn()} children={TestText()} />);
        const testText = await screen.findByText('Test Text');
        expect(testText).not.toBeInTheDocument();
    });
});

