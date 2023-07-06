import { render, screen, prettyDOM } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

describe('when there is no error', () => {
    it('renders children', () => {
        render(<ErrorBoundary children={<h1>Child Prop</h1>}/>);
        expect(screen.getByText('Child Prop')).toBeInTheDocument();
    })
})

describe('when there is an error', () => {
    it('displays the error message', () => {
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
    })
})