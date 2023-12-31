import { act, screen } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import SignUp from './SignUp';
import { httpRootURL, wsRootURL, competitorsCollection, competitorChrisMarshall, raceScorpionA, raceNoClass, dinghies, dinghy1234, dinghy6745, dinghy826,
    dinghyClasses, dinghyClassScorpion, dinghyClassComet, competitorSarahPascal, entriesScorpionA, competitorLouScrew, raceCometA } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

const model = new DinghyRacingModel(httpRootURL, wsRootURL);
const controller = new DinghyRacingController(model);    

beforeEach(() => {
    jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': competitorsCollection})});
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClasses})});
    jest.spyOn(model, 'getDinghies').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghies})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
});

it('renders', async () => {
    await act(async () => {
        customRender(<SignUp race={raceScorpionA}/>, model, controller);
    })
    const inputHelm = screen.getByLabelText(/helm/i);
    const inputSailNumber = screen.getByLabelText(/sail/i);
    const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
    expect(inputHelm).toBeInTheDocument();
    expect(inputSailNumber).toBeInTheDocument();
    expect(btnCreate).toBeInTheDocument();
});

describe('when race has a specified dinghyClass', () => {
    it('requests helm name and dinghy sail number', async () => {    
        await act(async () => {
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        expect(inputHelm).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
    });
});

describe('when race is a handicap race ', () => {
    it('requests helm name and dinghy class and sail number', async () => {
        await act(async () => {
            customRender(<SignUp race={raceNoClass}/>, model, controller);
        });

        const inputHelm = screen.getByLabelText(/helm/i);
        const inputDingyClass = screen.getByLabelText(/class/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        expect(inputHelm).toBeInTheDocument();
        expect(inputDingyClass).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
    });
    describe('when dinghy selected is a dinghy class that has crew', () => {
        it('provides option to select crew', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceNoClass}/>, model, controller);

            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);

            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
                await user.type(inputSailNumber, '1234');
            });

            const inputCrew = screen.getByLabelText(/crew/i);
            expect(inputCrew).toBeInTheDocument();
        });
    });
    describe('when dinghy selected is a dinghy class that does not have crew', () => {
        it('does not show option to select crew', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceNoClass}/>, model, controller);

            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.selectOptions(inputDinghyClass, 'Comet');
                await user.type(inputSailNumber, '1234');
            });

            const inputCrew = screen.queryByLabelText(/crew/i);
            expect(inputCrew).not.toBeInTheDocument();
        });
    });
});

describe('when helm name is entered then ', () => {
    it('displays helm name', async () => {
        const user = userEvent.setup();
    
        customRender(<SignUp race={raceScorpionA}/>, model, controller);
    
        const inputHelm = await screen.findByLabelText(/helm/i);
        await act(async () => {
            await user.type(inputHelm, 'Chris Marshall');
        });
        expect(inputHelm).toHaveValue('Chris Marshall');
    });
    it('displays sign-up button if helm is in system already', async () => {
        const user = userEvent.setup();
    
        customRender(<SignUp race={raceScorpionA}/>, model, controller);    
        const inputHelm = await screen.findByLabelText(/helm/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
        });
        expect(screen.getByRole('button', {'name': 'Sign-up'})).toBeInTheDocument();
    });
    it('displays add helm and sign-up button if helm not in system', async () => {
        const user = userEvent.setup();
    
        customRender(<SignUp race={raceScorpionA}/>, model, controller);    
        const inputHelm = await screen.findByLabelText(/helm/i);
        const inputCrew = await screen.findByLabelText(/crew/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputHelm, 'Mary Shelley');
            await user.type(inputCrew, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
        });
        expect(screen.getByRole('button', {'name': 'Add helm & sign-up'})).toBeInTheDocument();
    });
})

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
        const inputHelm = await screen.findByLabelText(/helm/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
        });
        expect(screen.getByRole('button', {'name': 'Sign-up'})).toBeInTheDocument();
    });
    it('displays add dinghy and sign-up button if dinghy not in system', async () => {
        const user = userEvent.setup();
    
        customRender(<SignUp race={raceScorpionA}/>, model, controller);
        const inputHelm = await screen.findByLabelText(/helm/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputHelm, 'Chris Marshall');
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
                return Promise.resolve({'success': true});
            });
        
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
        
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.type(inputCrew, 'Lou Screw');
                await user.type(inputSailNumber, '1234');
                await user.click(screen.getByRole('button', {'name': 'Sign-up'}));
            });
        
            expect(onCreateSpy).toHaveBeenCalledWith(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
        });
    })
    describe('when race does not have a specified dinghy class ', () => {
        it('calls create function with values entered into form', async () => {
            const user = userEvent.setup();
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
        
            customRender(<SignUp race={raceNoClass} />, model, controller);
            
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
        
            let inputCrew;

            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
                await user.type(inputSailNumber, '1234');
            });
            await act(async () => {
                inputCrew = await screen.findByLabelText(/crew/i);
                await user.type(inputCrew, 'Lou Screw');
                await user.click(screen.getByRole('button', {'name': 'Sign-up'}));
            });
            
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, competitorChrisMarshall, dinghy1234, competitorLouScrew);
        });
    });
    it('clears form on success', async () => {
        const user = userEvent.setup();
        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
            return Promise.resolve({'success': true});
        });
    
        customRender(<SignUp race={raceNoClass} />, model, controller);
        
        const inputHelm = await screen.findByLabelText(/helm/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        const inputDinghyClass = await screen.findByLabelText(/class/i);
        
        let inputCrew;
    
        await act(async () => {
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
            await user.selectOptions(inputDinghyClass, 'Scorpion');
        });
        await act(async () => {
            inputCrew = await screen.findByLabelText(/crew/i);
            await user.type(inputCrew, 'Lou Screw');
        })
        expect(inputHelm).toHaveValue('Chris Marshall');
        expect(inputCrew).toHaveValue('Lou Screw');
        expect(inputSailNumber).toHaveValue('1234');
        expect(inputDinghyClass).toHaveValue('Scorpion');
        
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': 'Sign-up'}));
        });
        expect(inputHelm).toHaveValue('');
        expect(inputCrew).toHaveValue('');
        expect(inputSailNumber).toHaveValue('');
        expect(inputDinghyClass).toHaveValue('');
    });
    describe('when dinghy does not exist', () => {
        it('creates dinghy and then signs helm up to race', async () => {
            const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const user = userEvent.setup();
    
            customRender(<SignUp race={raceNoClass} />, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.type(inputSailNumber, '999');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
            });
            await act(async () => {
                const inputCrew = await screen.findByLabelText(/crew/i);
                await user.type(inputCrew, 'Lou Screw');
                await user.click(screen.getByRole('button', {'name': 'Add dinghy & sign-up'}));
            })

            expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber':'999', 'dinghyClass': dinghyClassScorpion, 'url': ''});
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, competitorChrisMarshall, {'sailNumber':'999', 'dinghyClass': dinghyClassScorpion, 'url': ''}, competitorLouScrew);
        });
    });
    describe('when helm does not exist', () => {
        it('creates competitor and then signs helm up for race', async () => {
            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const user = userEvent.setup();
    
            customRender(<SignUp race={raceNoClass} />, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
            await act(async () => {
                await user.type(inputHelm, 'Bill Wilkins');
                await user.type(inputSailNumber, '1234');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
            });
            await act(async () => {
                const inputCrew = await screen.findByLabelText(/crew/i);
                await user.type(inputCrew, 'Chris Marshall');
                await user.click(await screen.findByRole('button', {'name': 'Add helm & sign-up'}));
            });            

            expect(createCompetitorSpy).toHaveBeenCalledWith({'name':'Bill Wilkins', 'url': ''});
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, {'name': 'Bill Wilkins', 'url': ''}, {...dinghy1234}, competitorChrisMarshall);
        })
    });
    describe('when neither helm or dinghy exists', () => {
        it('creates competitor and dinghy and then signs up for race', async () => {
            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const user = userEvent.setup();
    
            customRender(<SignUp race={raceNoClass} />, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
            await act(async () => {
                await user.type(inputHelm, 'Bill Wilkins');
                await user.type(inputSailNumber, '999');
                await user.selectOptions(inputDinghyClass, 'Comet');
            });
            await act(async () => {
                await user.click(screen.getByRole('button', {'name': 'Add helm & dinghy & sign-up'}));
            });

            expect(createCompetitorSpy).toHaveBeenCalledWith({'name':'Bill Wilkins', 'url': ''});
            expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber':'999', 'dinghyClass': dinghyClassComet, 'url': ''});
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, {'name': 'Bill Wilkins', 'url': ''}, {'sailNumber':'999', 'dinghyClass': dinghyClassComet, 'url': ''});
        })
    });
    describe('when crew does not exist', () => {
        it('creates competitor and then signs up for race', async () => {
            const user = userEvent.setup();
            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
        
            customRender(<SignUp race={raceNoClass} />, model, controller);
            
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
        
            let inputCrew;

            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
                await user.type(inputSailNumber, '1234');
            });
            await act(async () => {
                inputCrew = await screen.findByLabelText(/crew/i);
                await user.type(inputCrew, 'Bill Wilkins');
                await user.click(screen.getByRole('button', {'name': 'Add crew & sign-up'}));
            });

            expect(createCompetitorSpy).toHaveBeenCalledWith({'name':'Bill Wilkins', 'url': ''});
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, competitorChrisMarshall, dinghy1234, {'name': 'Bill Wilkins', 'url': ''});
        });
    });
    describe('when neither helm nor crew exists', () => {
        it('creates competitor and dinghy and then signs helm up for race', async () => {
            const user = userEvent.setup();
            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
        
            customRender(<SignUp race={raceNoClass} />, model, controller);
            
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
        
            let inputCrew;

            await act(async () => {
                await user.type(inputHelm, 'Asmee Varma');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
                await user.type(inputSailNumber, '1234');
            });
            await act(async () => {
                inputCrew = await screen.findByLabelText(/crew/i);
                await user.type(inputCrew, 'Bill Wilkins');
                await user.click(screen.getByRole('button', {'name': 'Add helm & crew & sign-up'}));
            });

            expect(createCompetitorSpy).toHaveBeenCalledWith({'name':'Asmee Varma', 'url': ''});
            expect(createCompetitorSpy).toHaveBeenCalledWith({'name':'Bill Wilkins', 'url': ''});
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, {'name': 'Asmee Varma', 'url': ''}, {...dinghy1234}, {'name': 'Bill Wilkins', 'url': ''});
        });
    describe('when neither crew or dinghy exists', () => {
        it('creates competitor and dinghy and then signs helm up for race', async () => {
            const user = userEvent.setup();
            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
        
            customRender(<SignUp race={raceNoClass} />, model, controller);
            
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
        
            let inputCrew;

            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
                await user.type(inputSailNumber, '6754');
            });
            await act(async () => {
                inputCrew = await screen.findByLabelText(/crew/i);
                await user.type(inputCrew, 'Bill Wilkins');
                await user.click(screen.getByRole('button', {'name': 'Add crew & dinghy & sign-up'}));
            });

            expect(createCompetitorSpy).toHaveBeenCalledWith({'name':'Bill Wilkins', 'url': ''});
            expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber':'6754', 'dinghyClass': dinghyClassScorpion, 'url': ''});
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, competitorChrisMarshall, {'sailNumber':'6754', 'dinghyClass': dinghyClassScorpion, 'url': ''}, 
                {'name': 'Bill Wilkins', 'url': ''});
        });
    });
    });
    describe('when neither helm, crew, nor dinghy exists', () => {
        it('creates helm competitor, crew competitor, and dinghy, and then signs helm up for race', async () => {
            const user = userEvent.setup();
            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
        
            customRender(<SignUp race={raceNoClass} />, model, controller);
            
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputDinghyClass = await screen.findByLabelText(/class/i);
        
            let inputCrew;

            await act(async () => {
                await user.type(inputHelm, 'Asmee Varma');
                await user.selectOptions(inputDinghyClass, 'Scorpion');
                await user.type(inputSailNumber, '6754');
            });
            await act(async () => {
                inputCrew = await screen.findByLabelText(/crew/i);
                await user.type(inputCrew, 'Bill Wilkins');
                await user.click(screen.getByRole('button', {'name': 'Add helm & crew & dinghy & sign-up'}));
            });

            expect(createCompetitorSpy).toHaveBeenCalledWith({'name':'Asmee Varma', 'url': ''});
            expect(createCompetitorSpy).toHaveBeenCalledWith({'name':'Bill Wilkins', 'url': ''});
            expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber':'6754', 'dinghyClass': dinghyClassScorpion, 'url': ''});
            expect(signupToRaceSpy).toHaveBeenCalledWith(raceNoClass, {'name': 'Asmee Varma', 'url': ''}, {'sailNumber':'6754', 'dinghyClass': dinghyClassScorpion, 
                'url': ''}, {'name': 'Bill Wilkins', 'url': ''});
        });
    });
    it('displays failure message on failure and entered values remain on form', async () => {
        const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
            return Promise.resolve({'success': false, 'message': 'Something went wrong'});
        });
        const user = userEvent.setup();

        customRender(<SignUp race={raceNoClass} />, model, controller);
        
        const inputHelm = await screen.findByLabelText(/helm/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        const inputDinghyClass = await screen.findByLabelText(/class/i);

        await act(async () => {
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
            await user.selectOptions(inputDinghyClass, 'Scorpion');
        });
        await act(async () => {
            const inputCrew = await screen.findByLabelText(/crew/i);
            await user.type(inputCrew, 'Lou Screw');
            await user.click(screen.getByRole('button', {'name': 'Sign-up'}));
        });
        expect(inputHelm).toHaveValue('Chris Marshall');
        expect(inputSailNumber).toHaveValue('1234');
        expect(inputDinghyClass).toHaveValue('Scorpion');
        expect(signupToRaceSpy).toBeCalled();
        const message = await screen.findByText('Something went wrong');
        expect(message).toBeInTheDocument();
    });
});

it('displays entries for race', async () => {
    customRender(<SignUp race={raceScorpionA}/>, model, controller);

    const competitor1 = await screen.findByRole('cell', {'name': /Chris Marshall/i});
    const competitor2 = await screen.findByRole('cell', {'name': /Sarah Pascal/i});
    const competitor3 = await screen.findByRole('cell', {'name': /Lou Screw/i});
    const dinghyClass = await screen.findAllByRole('cell', {'name': /Scorpion/i});
    const dinghy1 = await screen.findByRole('cell', {'name': /1234/i});
    const dinghy2 = await screen.findByRole('cell', {'name': /6745/i});

    expect(competitor1).toBeInTheDocument();
    expect(competitor2).toBeInTheDocument();
    expect(competitor3).toBeInTheDocument();
    expect(dinghyClass[0]).toBeInTheDocument();
    expect(dinghyClass[1]).toBeInTheDocument();
    expect(dinghy1).toBeInTheDocument();
    expect(dinghy2).toBeInTheDocument();
});

describe('when dinghy class has crew', () => {
    it('provides option to select crew', async () => {
        customRender(<SignUp race={raceScorpionA}/>, model, controller);
    
        const inputCrew = screen.getByLabelText(/crew/i);
        expect(inputCrew).toBeInTheDocument();
    });
    describe('when crew name is entered ', () => {
        it('displays crew name', async () => {
            const user = userEvent.setup();
        
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
        
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputCrew, 'Lou Screw');
            });
            expect(inputCrew).toHaveValue('Lou Screw');
        });
        it('displays sign-up button if crew is in system already', async () => {
            const user = userEvent.setup();
        
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.type(inputCrew, 'Lou Screw');
                await user.type(inputSailNumber, '1234');
            });
            expect(screen.getByRole('button', {'name': 'Sign-up'})).toBeInTheDocument();
        });
        it('displays add crew and sign-up button if crew not in system', async () => {
            const user = userEvent.setup();
        
            customRender(<SignUp race={raceScorpionA}/>, model, controller);    
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.type(inputCrew, 'Mary Shelley');
                await user.type(inputSailNumber, '1234');
            });
            expect(screen.getByRole('button', {'name': 'Add crew & sign-up'})).toBeInTheDocument();
        });
    });
});

describe('when race is for a dinghy class that has no crew', () => {
    it('does not display option to select crew', async () => {
        const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);

            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
                await user.type(inputSailNumber, '1234');
            });

            const inputCrew = screen.queryByLabelText(/crew/i);
            expect(inputCrew).not.toBeInTheDocument();
    });
    it('calls create function with values entered into form and dinghy dinghy class set per race', async () => {
        const user = userEvent.setup();
        const onCreateSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
            return Promise.resolve({'success': true});
        });
    
        customRender(<SignUp race={raceCometA}/>, model, controller);
        const inputHelm = await screen.findByLabelText(/helm/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
    
        await act(async () => {
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, '826');
            await user.click(screen.getByRole('button', {'name': 'Sign-up'}));
        });
    
        expect(onCreateSpy).toHaveBeenCalledWith(raceCometA, competitorChrisMarshall, dinghy826);
    });
});