import { render, screen, act, findAllByRole, logRoles } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import SignUp from './SignUp';
import { competitorsCollection, competitorChrisMarshall, raceScorpionA, raceNoClass, dinghies, dinghy1234, dinghyClasses, rootURL } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

const model = new DinghyRacingModel(rootURL);
const controller = new DinghyRacingController(model);    

beforeEach(() => {
    jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': competitorsCollection})});
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClasses})});
    jest.spyOn(model, 'getDinghies').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghies})});
})

it('renders', () => {
    customRender(<SignUp race={raceScorpionA}/>, model, controller);
    const inputCompetitor = screen.getByLabelText(/competitor/i);
    const inputSailNumber = screen.getByLabelText(/sail/i);
    const btnCreate = screen.getByRole('button', {'name': 'Sign-up'});
    expect(inputCompetitor).toBeInTheDocument();
    expect(inputSailNumber).toBeInTheDocument();
    expect(btnCreate).toBeInTheDocument();
});

describe('when race has a specified dinghyClass', () => {
    it('requests competitor name and dinghy sail number', () => {    
        customRender(<SignUp race={raceScorpionA}/>, model, controller);

        const inputCompetitor = screen.getByLabelText(/competitor/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        expect(inputCompetitor).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
    });
});

describe('when race is a handicap race ', () => {
    it('requests competitor name and dinghy class and sail number', async () => {
        customRender(<SignUp race={raceNoClass}/>, model, controller);

        const inputCompetitor = screen.getByLabelText(/competitor/i);
        const inputDingyClass = screen.getByLabelText(/class/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        expect(inputCompetitor).toBeInTheDocument();
        expect(inputDingyClass).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
    });
});

it('when competitor name is entered then displays name', async () => {
    const user = userEvent.setup();

    customRender(<SignUp race={raceScorpionA}/>, model, controller);

    const inputCompetitor = await screen.findByLabelText(/competitor/i);
    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(inputCompetitor, 'Chris Marshall');
    });
    expect(inputCompetitor).toHaveValue('Chris Marshall');
});

it('when sail number is entered then displays sail number', async () => {
    const user = userEvent.setup();

    customRender(<SignUp race={raceScorpionA}/>, model, controller);

    const inputSailNumber = await screen.findByLabelText(/sail/i);
    await screen.findAllByRole('option');
    await act(async () => {
        await user.type(inputSailNumber, '1234');
    });
    expect(inputSailNumber).toHaveValue('1234');
});

it('when dinghy class is entered then displays dinghy class', async () => {
    const user = userEvent.setup();

    customRender(<SignUp race={raceNoClass}/>, model, controller);

    const inputDinghyClass = await screen.findByLabelText(/class/i);
    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(inputDinghyClass, 'Scorpion');
    });
    expect(inputDinghyClass).toHaveValue('Scorpion');
});

it('when create button is clicked and race has a specified dinghy class then create function is called with values entered into form and dinghy dinghy class set per race', async () => {
    const user = userEvent.setup();
    const onCreateSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
        return Promise.resolve({'success': false, 'message': 'Something went wrong'});
    });

    customRender(<SignUp race={raceScorpionA}/>, model, controller);
    const btnCreate = screen.getByRole('button', {'name': 'Sign-up'});
    const inputCompetitor = await screen.findByLabelText(/competitor/i);
    const inputSailNumber = await screen.findByLabelText(/sail/i);

    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(inputCompetitor, 'Chris Marshall');
        await user.type(inputSailNumber, '1234');
        await user.click(btnCreate);
    });

    expect(onCreateSpy).toHaveBeenCalledWith(raceScorpionA, competitorChrisMarshall, dinghy1234);
});

it('when create button is clicked and race does not have a specified dinghy class then create function is called with values entered into form', async () => {
    const user = userEvent.setup();
    const onCreateSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
        return Promise.resolve({'success': true});
    });

    customRender(<SignUp race={raceNoClass} />, model, controller);
    const btnCreate = screen.getByRole('button', {'name': 'Sign-up'});
    
    const inputCompetitor = await screen.findByLabelText(/competitor/i);
    const inputSailNumber = await screen.findByLabelText(/sail/i);
    const inputDinghyClass = await screen.findByLabelText(/class/i);

    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(inputCompetitor, 'Chris Marshall');
        await user.selectOptions(inputDinghyClass, 'Scorpion');
        await user.type(inputSailNumber, '1234');
        await user.click(btnCreate);
    });
    
    expect(onCreateSpy).toHaveBeenCalledWith(raceNoClass, competitorChrisMarshall, dinghy1234);
});

it('when create button is clicked if create function returns success then form is cleared', async () => {
    const user = userEvent.setup();
    const onCreateSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
        return Promise.resolve({'success': true});
    });

    customRender(<SignUp race={raceNoClass} />, model, controller);
    
    const inputCompetitor = await screen.findByLabelText(/competitor/i);
    const inputSailNumber = await screen.findByLabelText(/sail/i);
    const inputDinghyClass = await screen.findByLabelText(/class/i);

    const btnCreate = screen.getByRole('button', {'name': 'Sign-up'});

    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(inputCompetitor, 'Chris Marshall');
        await user.type(inputSailNumber, '1234');
        await user.selectOptions(inputDinghyClass, 'Scorpion');
    });
    expect(inputCompetitor).toHaveValue('Chris Marshall');
    expect(inputSailNumber).toHaveValue('1234');
    expect(inputDinghyClass).toHaveValue('Scorpion');
    
    await act(async () => {
        await user.click(btnCreate);
    });
    expect(inputCompetitor).toHaveValue('');
    expect(inputSailNumber).toHaveValue('');
    expect(inputDinghyClass).toHaveValue('');
});

describe('when create button is clicked', () => {
    it('and dinghy does not exist it displays a message advising the dinghy does not exist', async () => {
        const onCreateSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
            return Promise.resolve({'success': false, 'message': 'Something went wrong'});
        });
        const user = userEvent.setup();

        customRender(<SignUp race={raceNoClass} />, model, controller);
        
        const inputCompetitor = await screen.findByLabelText(/competitor/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        const inputDinghyClass = await screen.findByLabelText(/class/i);

        const btnCreate = screen.getByRole('button', {'name': 'Sign-up'});

        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(inputCompetitor, 'Chris Marshall');
            await user.type(inputSailNumber, '999');
            await user.selectOptions(inputDinghyClass, 'Scorpion');
            await user.click(btnCreate);
        });
        expect(inputCompetitor).toHaveValue('Chris Marshall');
        expect(inputSailNumber).toHaveValue('999');
        expect(inputDinghyClass).toHaveValue('Scorpion');
        const message = await screen.findByText('Dinghy does not exist please add it if entered details are correct');
        expect(message).toBeInTheDocument();
    })
    it('if create function returns failure then failure message is displayed and entered values remain on form', async () => {
        const onCreateSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
            return Promise.resolve({'success': false, 'message': 'Something went wrong'});
        });
        const user = userEvent.setup();

        customRender(<SignUp race={raceNoClass} />, model, controller);
        
        const inputCompetitor = await screen.findByLabelText(/competitor/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        const inputDinghyClass = await screen.findByLabelText(/class/i);

        const btnCreate = screen.getByRole('button', {'name': 'Sign-up'});

        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(inputCompetitor, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
            await user.selectOptions(inputDinghyClass, 'Scorpion');
            await user.click(btnCreate);
        });
        expect(inputCompetitor).toHaveValue('Chris Marshall');
        expect(inputSailNumber).toHaveValue('1234');
        expect(inputDinghyClass).toHaveValue('Scorpion');
        const message = await screen.findByText('Something went wrong');
        expect(message).toBeInTheDocument();
    });
});