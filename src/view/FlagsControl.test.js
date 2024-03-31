import { render, screen } from '@testing-library/react';
import FlagsControl from './FlagsControl';
import { races } from '../model/__mocks__/test-data';

it('renders', () => {
    render(<FlagsControl />);
});

describe('when array of races supplied', () => {
    it('displays race names and blue peter', () => {
        render(<FlagsControl races={races}/>);
        expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
        expect(screen.getByText(/blue peter/i)).toBeInTheDocument();
        expect(screen.getByText(/graduate a/i)).toBeInTheDocument();
        expect(screen.getByText(/handicap a/i)).toBeInTheDocument();
        expect(screen.getByText(/comet a/i)).toBeInTheDocument();
    });
});