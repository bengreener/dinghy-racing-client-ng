import { render, screen, act, findAllByRole, logRoles } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import SignUp from './SignUp';
import { competitorsCollection, competitorChrisMarshall, raceScorpionA, raceNoClass, dinghies, dinghy1234, dinghyClasses, rootURL, dinghyClassScorpion } from '../model/__mocks__/test-data';

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
    const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
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
    await act(async () => {
        await user.type(inputCompetitor, 'Chris Marshall');
    });
    expect(inputCompetitor).toHaveValue('Chris Marshall');
});

describe('when sail number is entered then', () => {
    it('displays sail number', async () => {
        const user = userEvent.setup();
    
        customRender(<SignUp race={raceScorpionA}/>, model, controller);
    
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputSailNumber, '1234');
        });
        expect(inputSailNumber).toHaveValue('1234');
    });
    it('displays sign-up button if dinghy is in system already', async () => {
        const user = userEvent.setup();
    
        customRender(<SignUp race={raceScorpionA}/>, model, controller);
    
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputSailNumber, '1234');
        });
        expect(screen.getByRole('button', {'name': 'Sign-up'})).toBeInTheDocument();
    });
    it('displays add dinghy and sign-up button if dinghy not in system', async () => {
        const user = userEvent.setup();
    
        customRender(<SignUp race={raceScorpionA}/>, model, controller);
    
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputSailNumber, '999');
        });
        expect(screen.getByRole('button', {'name': 'Add dinghy & sign-up'})).toBeInTheDocument();
    });
})


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

describe('when create button is clicked', () => {
    describe('when race has a specified dinghy class ', () => {
        it('calls create function with values entered into form and dinghy dinghy class set per race', async () => {
            const user = userEvent.setup();
            const onCreateSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': false, 'message': 'Something went wrong'});
            });
        
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputCompetitor = await screen.findByLabelText(/competitor/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
        
            await act(async () => {
                await user.type(inputCompetitor, 'Chris Marshall');
                await user.type(inputSailNumber, '1234');
                await user.click(screen.getByRole('button', {'name': 'Sign-up'}));
            });
        
            expect(onCreateSpy).toHaveBeenCalledWith(raceScorpionA, competitorChrisMarshall, dinghy1234);
        });
    })
    describe('when race does not have a specified dinghy class ', () => {
        it('calls create function with values entered into form', async () => {
            const user = userEvent.setup();
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
        
            customRender(<SignUp race={raceNoClass} />, model, controller);
            
            const inputCompetitor = await screen.findByLabelText(/competitor/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
        
            await act(async () => {
                await user.type(inputCompetitor, 'Chris Marshall');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
                await user.type(inputSailNumber, '1234');
                await user.click(screen.getByRole('button', {'name': 'Sign-up'}));
            });
            
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, competitorChrisMarshall, dinghy1234);
        });
    });
    it('clears form on success', async () => {
        const user = userEvent.setup();
        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
            return Promise.resolve({'success': true});
        });
    
        customRender(<SignUp race={raceNoClass} />, model, controller);
        
        const inputCompetitor = await screen.findByLabelText(/competitor/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        const inputDinghyClass = await screen.findByLabelText(/class/i);
    
        await act(async () => {
            await user.type(inputCompetitor, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
            await user.selectOptions(inputDinghyClass, 'Scorpion');
        });
        expect(inputCompetitor).toHaveValue('Chris Marshall');
        expect(inputSailNumber).toHaveValue('1234');
        expect(inputDinghyClass).toHaveValue('Scorpion');
        
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': 'Sign-up'}));
        });
        expect(inputCompetitor).toHaveValue('');
        expect(inputSailNumber).toHaveValue('');
        expect(inputDinghyClass).toHaveValue('');
    });
    describe('when dinghy does not exist', () => {
        it('creates dinghy and then signs competitor up to race', async () => {
            const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const user = userEvent.setup();
    
            customRender(<SignUp race={raceNoClass} />, model, controller);
            const inputCompetitor = await screen.findByLabelText(/competitor/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
            await act(async () => {
                await user.type(inputCompetitor, 'Chris Marshall');
                await user.type(inputSailNumber, '999');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
                await user.click(screen.getByRole('button', {'name': 'Add dinghy & sign-up'}));
            });

            expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber':'999', 'dinghyClass': dinghyClassScorpion});
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, competitorChrisMarshall, {'sailNumber':'999', 'dinghyClass': dinghyClassScorpion});
        });
    });
    it('displays failure message on failure and entered values remain on form', async () => {
        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
            return Promise.resolve({'success': false, 'message': 'Something went wrong'});
        });
        const user = userEvent.setup();

        customRender(<SignUp race={raceNoClass} />, model, controller);
        
        const inputCompetitor = await screen.findByLabelText(/competitor/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        const inputDinghyClass = await screen.findByLabelText(/class/i);

        await act(async () => {
            await user.type(inputCompetitor, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
            await user.selectOptions(inputDinghyClass, 'Scorpion');
            await user.click(screen.getByRole('button', {'name': 'Sign-up'}));
        });
        expect(inputCompetitor).toHaveValue('Chris Marshall');
        expect(inputSailNumber).toHaveValue('1234');
        expect(inputDinghyClass).toHaveValue('Scorpion');
        const message = await screen.findByText('Something went wrong');
        expect(message).toBeInTheDocument();
    });
});