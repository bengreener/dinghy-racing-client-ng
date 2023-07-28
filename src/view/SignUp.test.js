import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from './SignUp';
import { raceScorpionA, raceNoClass, dinghyClassScorpion } from '../model/__mocks__/test-data';

it('renders', () => {
    render(<SignUp race={raceScorpionA}/>);
    const inputCompetitor = screen.getByLabelText(/competitor/i);
    const inputSailNumber = screen.getByLabelText(/sail/i);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    expect(inputCompetitor).toBeInTheDocument();
    expect(inputSailNumber).toBeInTheDocument();
    expect(btnCreate).toBeInTheDocument();
});

describe('when race has a specified dinghyClass', () => {
    it('requests competitor name and dinghy sail number', () => {
        render(<SignUp race={raceScorpionA}/>);

        const inputCompetitor = screen.getByLabelText(/competitor/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        expect(inputCompetitor).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
    })
});

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
});

it('when competitor name is entered then displays name', async () => {
    const user = userEvent.setup();
    render(<SignUp race={raceScorpionA}/>);

    const inputCompetitor = await screen.findByLabelText(/competitor/i);
    await act(async () => {
        await user.type(inputCompetitor, 'Bob Dunn');
    });
    expect(inputCompetitor).toHaveValue('Bob Dunn');
});

it('when sail number is entered then displays sail number', async () => {
    const user = userEvent.setup();
    render(<SignUp race={raceScorpionA}/>);

    const inputSailNumber = await screen.findByLabelText(/sail/i);
    await act(async () => {
        await user.type(inputSailNumber, '1234');
    });
    expect(inputSailNumber).toHaveValue('1234');
});

it('when dinghy class is entered then displays dinghy class', async () => {
    const user = userEvent.setup();
    render(<SignUp race={raceNoClass}/>);

    const inputDinghyClass = await screen.findByLabelText(/class/i);
    await act(async () => {
        await user.type(inputDinghyClass, 'Scorpion');
    });
    expect(inputDinghyClass).toHaveValue('Scorpion');
});

it('when create button is clicked and race has a specified dinghy class then function passed to onCreate prop is called with values entered into form and dinghy dinghy class set per race', async () => {
    const onCreateMock = jest.fn();
    const user = userEvent.setup();

    render(<SignUp race={raceScorpionA} onCreate={onCreateMock} />);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    const inputCompetitor = await screen.findByLabelText(/competitor/i);
    const inputSailNumber = await screen.findByLabelText(/sail/i);

    await act(async () => {
        await user.type(inputCompetitor, 'Bob Dunn');
        await user.type(inputSailNumber, '1234');
        await user.click(btnCreate);
    });

    expect(onCreateMock).toHaveBeenCalledWith(raceScorpionA, {'name': 'Bob Dunn', 'url': ''}, {'sailNumber': '1234', 'dinghyClass': dinghyClassScorpion, 'url': ''});
});

it('when create button is clicked and race does not have a specified dinghy class then function passed to onCreate prop is called with values entered into form', async () => {
    const onCreateMock = jest.fn();
    const user = userEvent.setup();

    render(<SignUp race={raceNoClass} onCreate={onCreateMock} />);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    
    const inputCompetitor = await screen.findByLabelText(/competitor/i);
    const inputSailNumber = await screen.findByLabelText(/sail/i);
    const inputDinghyClass = await screen.findByLabelText(/class/i);

    await act(async () => {
        await user.type(inputCompetitor, 'Bob Dunn');
        await user.type(inputSailNumber, '1234');
        await user.type(inputDinghyClass, 'Graduate');
        await user.click(btnCreate);
    });
    
    expect(onCreateMock).toHaveBeenCalledWith(raceNoClass, {'name': 'Bob Dunn', 'url': ''}, {'sailNumber': '1234', 'dinghyClass': {'name': 'Graduate', 'url': ''}, 'url': ''});
});

it('when create button is clicked if onCreate function returns success then form is cleared', async () => {
    const onCreateMock = jest.fn(() => {
        return Promise.resolve({'success': true});
    });
    const user = userEvent.setup();

    render(<SignUp race={raceNoClass} onCreate={onCreateMock} />);
    
    const inputCompetitor = await screen.findByLabelText(/competitor/i);
    const inputSailNumber = await screen.findByLabelText(/sail/i);
    const inputDinghyClass = await screen.findByLabelText(/class/i);

    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    await act(async () => {
        await user.type(inputCompetitor, 'Bob Dunn');
        await user.type(inputSailNumber, '1234');
        await user.type(inputDinghyClass, 'Scorpion');
    });
    expect(inputCompetitor).toHaveValue('Bob Dunn');
    expect(inputSailNumber).toHaveValue('1234');
    expect(inputDinghyClass).toHaveValue('Scorpion');
    
    await act(async () => {
        await user.click(btnCreate);
    });
    expect(inputCompetitor).toHaveValue('');
    expect(inputSailNumber).toHaveValue('');
    expect(inputDinghyClass).toHaveValue('');
});

it('when create button is clicked if onCreate function returns failure then failure message is displayed and entered values remain on form', async () => {
    const onCreateMock = jest.fn(() => {
        return Promise.resolve({'success': false, 'message': 'Something went wrong'});
    });
    const user = userEvent.setup();

    render(<SignUp race={raceNoClass} onCreate={onCreateMock} />);
    
    const inputCompetitor = await screen.findByLabelText(/competitor/i);
    const inputSailNumber = await screen.findByLabelText(/sail/i);
    const inputDinghyClass = await screen.findByLabelText(/class/i);

    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    await act(async () => {
        await user.type(inputCompetitor, 'Bob Dunn');
        await user.type(inputSailNumber, '1234');
        await user.type(inputDinghyClass, 'Scorpion');
        await user.click(btnCreate);
    });
    expect(inputCompetitor).toHaveValue('Bob Dunn');
    expect(inputSailNumber).toHaveValue('1234');
    expect(inputDinghyClass).toHaveValue('Scorpion');
    const message = await screen.findByText('Something went wrong');
    expect(message).toBeInTheDocument();
});