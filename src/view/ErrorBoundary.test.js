import { render, screen, prettyDOM } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// beforeEach(() => {
//     jest.spyOn(console, 'error');
//     console.error.mockImplementation(() => {});
// })

// afterEach(() => {
//     console.error.mockRestore();
// })

describe('when there is no error', () => {
    it('renders children', () => {
        render(<ErrorBoundary children={<h1>Child Prop</h1>}/>);
        expect(screen.getByText('Child Prop')).toBeInTheDocument();
    })
})

describe('when there is an error', () => {
    it('displays the error message', () => {
        // an error is expected to be thrown so mock out console logging of errors so as not to clutter up console
        jest.spyOn(console, 'error');
        console.error.mockImplementation(() => {});

        const ThrowError = () => {
            throw new SyntaxError('Oops!');
        }

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        )

        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('SyntaxError')).toBeInTheDocument();
        expect(screen.getByText('Oops!')).toBeInTheDocument();

        // restore console logging for errors
        console.error.mockRestore();
    });
})