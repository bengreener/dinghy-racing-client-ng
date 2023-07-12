import { render, screen } from '@testing-library/react';
import SignUp from './SignUp';
import { raceScorpionA, raceNoClass } from '../model/__mocks__/test-data';

it('renders', () => {
    render(<SignUp race={raceScorpionA}/>)
})

describe('when race has a specified dinghyClass', () => {
    it('requests competitor name and dinghy sail number', () => {
        render(<SignUp race={raceScorpionA}/>);

        const inputCompetitor = screen.getByLabelText(/competitor/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        expect(inputCompetitor).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
    })
})

describe('when race is a handicap race ', () => {
    it('requests competitor name and dinghy class and sail number', () => {
        render(<SignUp race={raceNoClass}/>);

        const inputCompetitor = screen.getByLabelText(/competitor/i);
        const inputDingyClass = screen.getByLabelText(/class/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        expect(inputCompetitor).toBeInTheDocument();
        expect(inputDingyClass).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
    })
})
