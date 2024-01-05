import { act, screen } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import SignUp from './SignUp';
import { httpRootURL, wsRootURL, 
    competitorsCollection, competitorChrisMarshall, competitorSarahPascal, competitorLouScrew, competitorJillMyer,
    dinghyClasses, dinghyClassScorpion, dinghyClassComet,
    dinghies, dinghy1234, dinghy6745, dinghy826,
    raceScorpionA, raceHandicapA, raceCometA,
    entriesScorpionA, entriesCometA} from '../model/__mocks__/test-data';

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

describe('when race for dinghy class with no crew', () => {
    it('renders', async () => {
        await act(async () => {
            customRender(<SignUp race={raceCometA}/>, model, controller);
        });
        const raceTitle = screen.getByRole('heading', {'name': /comet a/i});
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
        expect(raceTitle).toBeInTheDocument();
        expect(inputHelm).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
        expect(btnCreate).toBeInTheDocument();
    });
    
    describe('when helm name is entered', () => {
        it('displays helm name', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
            });
            expect(inputHelm).toHaveValue('Chris Marshall');
        });
    });

    describe('when sail number is entered', () => {
        it('displays sail number', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputSailNumber, 'g6754i');
            });
            expect(inputSailNumber).toHaveValue('g6754i');
        });
    });

    it('does not request entry of dinghy class', async () => {
        await act(async () => {
            customRender(<SignUp race={raceCometA}/>, model, controller);
        });
        const inputDinghyClass = screen.queryByLabelText(/class/i);
        
        expect(inputDinghyClass).not.toBeInTheDocument();
    });

    it('does not request entry of crew', async () => {
        await act(async () => {
            customRender(<SignUp race={raceCometA}/>, model, controller);
        });
        const inputCrew = screen.queryByLabelText(/crew/i);
        
        expect(inputCrew).not.toBeInTheDocument();
    });

    describe('when helm and dinghy exist', () => {
		it('displays sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Jill Myer');
            });
            await act(async () => {
                await user.type(inputSailNumber, '826');
            });
            expect(screen.getByRole('button', {'name': /^sign-up(?!.)/i}));
        });
		
		describe('when create button clicked', () => {
            it('creates entry with values entered into form and dinghy class set per race', async () => {
                const onSignupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceCometA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Jill Myer');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '826');
                });
                const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                await act(async () => {
                    await user.click(buttonCreate);
                });
                expect(onSignupToRaceSpy).toHaveBeenCalledWith(raceCometA, competitorJillMyer, dinghy826);
            });
		
			describe('when entry not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Jill Myer');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '826');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Jill Myer');
                    expect(inputSailNumber).toHaveValue('826');
                });
            });	
        });
	});

	describe('when helm does not exist', () => {
        it('displays create helm & sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Not There');
            });
            await act(async () => {
                await user.type(inputSailNumber, '826');
            });
            expect(screen.getByRole('button', {'name': /add helm & sign-up/i}));
        });
	
		describe('when create button clicked', () => {
            it('creates helm and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceCometA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '826');
                });
                const createButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceCometA, {'name': 'Not There', 'url': ''}, dinghy826);
            })
			
			describe('when helm not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '826');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('826');
                });
            });
			
			describe('when entry not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '826');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('826');
                });
            });
        });
    });

	describe('when dinghy does not exist', () => {
        it('displays create dinghy and sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Jill Myer');
            });
            await act(async () => {
                await user.type(inputSailNumber, 'g6754i');
            });
            expect(screen.getByRole('button', {'name': /add dinghy & sign-up/i}));
        });
		
		describe('when create button clicked', () => {
            it('creates dinghy and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceCometA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Jill Myer');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'g6754i');
                });
                const createButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceCometA, competitorJillMyer,
                    {'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
            });
			
			describe('when dinghy not created', () => {
                it('it displays failure message and entered values remain on form', async () => {
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Jill Myer');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const createButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                    expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Jill Myer');
                    expect(inputSailNumber).toHaveValue('g6754i');
                });
            });
			
			describe('when entry not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Jill Myer');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Jill Myer');
                    expect(inputSailNumber).toHaveValue('g6754i');
                });
            });
        });			
    });

	describe('when neither helm nor dinghy exist', () => {
        it('displays create helm & dinghy & sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Not There');
            });
            await act(async () => {
                await user.type(inputSailNumber, 'xyz');
            });
            expect(screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i}));
        });
		
		describe('when create button clicked', () => {
            it('creates helm and dinghy and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceCometA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'g6754i');
                });
                const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceCometA, {'name': 'Not There', 'url': ''},
                    {'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
            });
			
			describe('when helm not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    const createHelmSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                    expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                });
            });
				
			describe('when dinghy not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    const createHelmSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                    expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                });
            });
				
			describe('when neither helm nor dinghy created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    const createHelmSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                    expect(screen.getByText(/Competitor not created/i)).toBeInTheDocument();
                    expect(screen.getByText(/Dinghy not created/i)).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                });
            });

            describe('when entry not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                });
            });
        });
    });
    
    it('clears form on success', async () => {
        const onSignupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
            return Promise.resolve({'success': true});
        });
        const user = userEvent.setup();
        customRender(<SignUp race={raceCometA}/>, model, controller);
        const inputHelm = await screen.findByLabelText(/helm/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputHelm, 'Jill Myer');
        });
        await act(async () => {
            await user.type(inputSailNumber, '826');
        });
        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
        await act(async () => {
            await user.click(buttonCreate);
        });
        const raceTitle = screen.getByRole('heading', {'name': /comet a/i});
        const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
        expect(raceTitle).toBeInTheDocument();
        expect(inputHelm).toHaveValue('');
        expect(inputSailNumber).toHaveValue('');
        expect(screen.queryByLabelText(/crew/i)).not.toBeInTheDocument();
        expect(btnCreate).toBeInTheDocument();
    });
    
    it('displays entries for race', async () => {
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesCometA})});
        customRender(<SignUp race={raceCometA}/>, model, controller);
        expect(await screen.findByRole('cell', {'name': /Jill Myer/i})).toBeInTheDocument();
        expect((await screen.findAllByRole('cell', {'name': /Comet/i}))[0]).toBeInTheDocument();
        expect(await screen.findByRole('cell', {'name': /826/i})).toBeInTheDocument();
    });
});

describe('when race for dinghy class with crew', () => {
    it('renders', async () => {
        await act(async () => {
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
        });
        const raceTitle = screen.getByRole('heading', {'name': /scorpion a/i});
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
        expect(raceTitle).toBeInTheDocument();
        expect(inputHelm).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
        expect(inputCrew).toBeInTheDocument();
        expect(btnCreate).toBeInTheDocument();
    });

    describe('when helm name is entered', () => {
        it('displays helm name', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
            });
            expect(inputHelm).toHaveValue('Chris Marshall');
        });
    });

    describe('when sail number is entered', () => {
        it('displays sail number', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputSailNumber, 'g6754i');
            });
            expect(inputSailNumber).toHaveValue('g6754i');
        });
    });
    
    it('does not request entry of dinghy class', async () => {
        await act(async () => {
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
        });
        const inputDinghyClass = screen.queryByLabelText(/class/i);

        expect(inputDinghyClass).not.toBeInTheDocument();
    });

    describe('when crew name is entered', () => {
        it('displays crew name', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputCrew, 'Lou Screw');
            });
            expect(inputCrew).toHaveValue('Lou Screw');
        });
    });
    
    describe('when helm and dinghy and crew exist', () => {
		it('displays sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
            });
            await act(async () => {
                await user.type(inputSailNumber, '1234');
            });
            await act(async () => {
                await user.type(inputCrew, 'Lou Screw');
            });
            expect(screen.getByRole('button', {'name': /^sign-up(?!.)/i}));
        });
			
		describe('when create button clicked', () => {
			it('creates entry with values entered into form and dinghy class set per race', async () => {
                const onSignupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Chris Marshall');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Lou Screw');
                });
                const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                await act(async () => {
                    await user.click(buttonCreate);
                });
                expect(onSignupToRaceSpy).toHaveBeenCalledWith(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            });
		
			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Chris Marshall');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue('Lou Screw');
                });
            });
        });
    });

	describe('when helm does not exist', () => {
        it('displays create helm & sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputHelm, 'Not There');
            });
            await act(async () => {
                await user.type(inputSailNumber, '1234');
            });
            await act(async () => {
                await user.type(inputCrew, 'Lou Screw');
            });
            expect(screen.getByRole('button', {'name': /add helm & sign-up/i}));
        });
	
		describe('when create button clicked', () => {
			it('creates helm and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Lou Screw');
                });
                const createButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceScorpionA, {'name': 'Not There', 'url': ''}, dinghy1234, competitorLouScrew);
            });
			
			describe('when helm not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue('Lou Screw');
                });
            });				
			
			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue(('Lou Screw'));
                });
            });
        });
    });
		
	describe('when dinghy does not exist', () => {
		it('displays create dinghy and sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
            });
            await act(async () => {
                await user.type(inputSailNumber, 'g6754i');
            });
            await act(async () => {
                await user.type(inputCrew, 'Lou Screw');
            })
            expect(screen.getByRole('button', {'name': /add dinghy & sign-up/i}));
        });
		
		describe('when create button clicked', () => {
			it('creates dinghy and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Chris Marshall');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'xyz');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Lou Screw');
                });
                const createButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceScorpionA, competitorChrisMarshall,
                    {'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''}, competitorLouScrew);
            });
			
			describe('when dinghy not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const createButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Chris Marshall');
                    expect(inputSailNumber).toHaveValue('xyz');
                    expect(inputCrew).toHaveValue('Lou Screw');
                });
            });

			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Chris Marshall');
                    expect(inputSailNumber).toHaveValue('xyz');
                    expect(inputCrew).toHaveValue(('Lou Screw'));
                });
            });
        });
    });

	describe('when crew does not exist', () => {
		it('displays create crew and sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
            });
            await act(async () => {
                await user.type(inputSailNumber, '1234');
            });
            await act(async () => {
                await user.type(inputCrew, 'Not There');
            })
            expect(screen.getByRole('button', {'name': /add crew & sign-up/i}));
        });
		
		describe('when create button clicked', () => {
			it('creates crew and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Chris Marshall');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Pop Off');
                });
                const createButton = screen.getByRole('button', {'name': /add crew & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceScorpionA, competitorChrisMarshall,
                    dinghy1234, {'name': 'Pop Off', 'url': ''});
            });
			
			describe('when crew not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Not There');
                    });
                    const createButton = screen.getByRole('button', {'name': /add crew & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Chris Marshall');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue('Not There');
                });
            });
			
			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Not There');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Chris Marshall');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue(('Not There'));
                });
            });
        });
    });

	describe('when neither helm nor dinghy exist', () => {
		it('displays create helm and dinghy and sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputHelm, 'Not There');
            });
            await act(async () => {
                await user.type(inputSailNumber, 'xyz');
            });
            await act(async () => {
                await user.type(inputCrew, 'Lou Screw');
            });
            expect(screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i}));
        });
		
		describe('when create button clicked', () => {
			it('creates helm and dinghy and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'xyz');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Lou Screw');
                });
                const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceScorpionA, {'name': 'Not There', 'url': ''},
                    {'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''}, competitorLouScrew);
            });
			
			describe('when helm not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('xyz');
                    expect(inputCrew).toHaveValue('Lou Screw');
                });
            });
			
            describe('when dinghy not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Lou Screw');
                });
            });
				
			describe('when neither helm nor dinghy created', () => {
				it('displays failure messages and entered values remain on form', async () => {
                    const createHelmSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText(/Competitor not created/i)).toBeInTheDocument();
                    expect(screen.getByText(/Dinghy not created/i)).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Lou Screw');
                });
            });

			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('xyz');
                    expect(inputCrew).toHaveValue(('Lou Screw'));
                });
            });
        });
    });

	describe('when neither helm nor crew exist', () => {
		it('displays create helm & crew & sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputHelm, 'Not There');
            });
            await act(async () => {
                await user.type(inputSailNumber, '1234');
            });
            await act(async () => {
                await user.type(inputCrew, 'Pop Off');
            });
            expect(screen.getByRole('button', {'name': /add helm & crew & sign-up/i}));
        });
		
		describe('when create button clicked', () => {
			it('creates helm and crew and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Pop Off');
                });
                const createButton = screen.getByRole('button', {'name': /add helm & crew & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceScorpionA, {'name': 'Not There', 'url': ''},
                    dinghy1234, {'name': 'Pop Off', 'url': ''});
            });
			
			describe('when helm not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    // SignUp does not refresh competitor list so button label will not change
                    // const updatedCompetitorsCollection = [...competitorsCollection, {'name':'Pop Off', 'url': 'http://localhost:8081/dinghyracing/api/competitors/999'}];
                    // jest.spyOn(model, 'getCompetitors').mockImplementation(() => {
                    //     console.log(`getCompetitors.mockImplementation`);
                    //     return Promise.resolve({'success': true, 'domainObject': updatedCompetitorsCollection
                    // })})
                    //     .mockImplementationOnce(() => {
                    //         console.log(`getCompetitors.mockImplementationOnce`);
                    //         return Promise.resolve({'success': true, 'domainObject': competitorsCollection})
                    //     });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                        if (competitor.name === 'Not There') {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        }
                        else {
                            return Promise.resolve({'success': true});
                        }
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue('Pop Off');
                    // SignUp does not refresh competitor list so button label will not change
                    // expect(await screen.findByRole('button', {'name': /add helm & sign-up/i})).toBeInTheDocument();
                });
            });

			describe('when crew not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    // SignUp does not refresh competitor list so button label will not change
                    // const updatedCompetitorsCollection = [...competitorsCollection, {'name':'Pop Off', 'url': 'http://localhost:8081/dinghyracing/api/competitors/999'}];
                    // jest.spyOn(model, 'getCompetitors').mockImplementation(() => {
                    //     console.log(`getCompetitors.mockImplementation`);
                    //     return Promise.resolve({'success': true, 'domainObject': updatedCompetitorsCollection
                    // })})
                    //     .mockImplementationOnce(() => {
                    //         console.log(`getCompetitors.mockImplementationOnce`);
                    //         return Promise.resolve({'success': true, 'domainObject': competitorsCollection})
                    //     });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                        if (competitor.name === 'Pop Off') {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        }
                        else {
                            return Promise.resolve({'success': true});
                        }
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue('Pop Off');
                    // SignUp does not refresh competitor list so button label will not change
                    // expect(await screen.findByRole('button', {'name': /add helm & sign-up/i})).toBeInTheDocument();
                });
            });
				
			describe('when neither helm nor crew created', () => {
				it('displays failure messages and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(screen.getByText('Competitor not created/nCompetitor not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
			});
			
            describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue(('Pop Off'));
                });
            });
        });
    });

	describe('when neither dinghy nor crew exist', () => {
		it('displays create dinghy and crew and sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
            });
            await act(async () => {
                await user.type(inputSailNumber, 'xyz');
            });
            await act(async () => {
                await user.type(inputCrew, 'Pop Off');
            });
            expect(screen.getByRole('button', {'name': /add crew & dinghy & sign-up/i}));
        });
		
		describe('when create button clicked', () => {
			it('creates dinghy and crew and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Chris Marshall');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'xyz');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Pop Off');
                });
                const createButton = screen.getByRole('button', {'name': /add crew & dinghy & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceScorpionA, competitorChrisMarshall,
                    {'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''}, {'name': 'Pop Off', 'url': ''});
            });
			
			describe('when dinghy not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Chris Marshall');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
            });
			
			describe('when crew not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Chris Marshall');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
            });

			describe('when neither dinghy nor crew created', () => {
				it('displays failure messages and entered values remain on form', async () => {
                    const createHelmSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Not There');
                    });
                    const createButton = screen.getByRole('button', {'name': /add crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText(/Competitor not created/i)).toBeInTheDocument();
                    expect(screen.getByText(/Dinghy not created/i)).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Chris Marshall');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Not There');
                });
            });

			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Not There');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Chris Marshall');
                    expect(inputSailNumber).toHaveValue('xyz');
                    expect(inputCrew).toHaveValue(('Not There'));
                });
            });
        });
    });

	describe('when neither helm nor dinghy nor crew exist', () => {
        it('displays create helm and dinghy and crew and sign-up button', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSailNumber = await screen.findByLabelText(/sail/i);
            const inputCrew = await screen.findByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputHelm, 'Not There');
            });
            await act(async () => {
                await user.type(inputSailNumber, 'xyz');
            });
            await act(async () => {
                await user.type(inputCrew, 'Pop Off');
            });
            expect(screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i}));
        });
		
		describe('when create button clicked', () => {
			it('creates helm and dinghy and crew and then creates entry with values entered into form', async () => {
                const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'xyz');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Pop Off');
                });
                const createButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
                await act(async () => {
                    await user.click(createButton);
                });
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                expect(signupToRaceSpy).toHaveBeenCalledWith(raceScorpionA, {'name': 'Not There', 'url': ''},
                    {'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''}, {'name': 'Pop Off', 'url': ''});
            });
			
			describe('when helm not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                        if (competitor.name === 'Not There') {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        }
                        else {
                            return Promise.resolve({'success': true});
                        }
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('xyz');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
            });

			describe('when dinghy not created', () => {
				it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
            });

			describe('when crew not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                        if (competitor.name === 'Pop Off') {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        }
                        else {
                            return Promise.resolve({'success': true});
                        }
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('xyz');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
            });				
				
			describe('when neither helm nor dinghy created', () => {
				it('displays failure messages and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                        if (competitor.name === 'Not There') {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        }
                        else {
                            return Promise.resolve({'success': true});
                        }
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getAllByText(/Competitor not created/i)).toHaveLength(1);
                    expect(screen.getByText(/Dinghy not created/i)).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
			});

			describe('when neither helm nor crew created', () => {
				it('displays failure messages and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText(/Competitor not created\/nCompetitor not created/i)).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
            });
			
            describe('when neither dinghy nor crew created', () => {
				it('displays failure messages and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                        if (competitor.name === 'Pop Off') {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        }
                        else {
                            return Promise.resolve({'success': true});
                        }
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText(/Competitor not created/i)).toBeInTheDocument();
                    expect(screen.getByText(/Dinghy not created/i)).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
			});
			
            describe('when neither helm nor dinghy nor crew created', () => {
				it('displays failure messages and entered values remain on form', async () => {
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                        return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                    expect(screen.getByText(/Competitor not created.+Competitor not created/i)).toBeInTheDocument();
                    expect(screen.getByText(/Dinghy not created/i)).toBeInTheDocument();
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('g6754i');
                    expect(inputCrew).toHaveValue('Pop Off');
                });
            });

			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', () => {

                });
            });
        });      
    });

    it('clears form on success', async () => {

    });
    
    it('displays failure message on failure and entered values remain on form', async () => {

    });
    
    it('displays entries for race', async () => {

    });
});

describe('when race is a handicap', () => {
    it('renders', async () => {
        await act(async () => {
            customRender(<SignUp race={raceHandicapA}/>, model, controller);
        });
        const raceTitle = screen.getByRole('heading', {'name': /Handicap A/i});
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
        expect(raceTitle).toBeInTheDocument();
        expect(inputHelm).toBeInTheDocument();
        expect(inputSailNumber).toBeInTheDocument();
        expect(btnCreate).toBeInTheDocument();
    });

    describe('when helm name is entered then ', () => {
        it('displays helm name', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceHandicapA}/>, model, controller);
            const inputHelm = await screen.findByLabelText(/helm/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
            });
            expect(inputHelm).toHaveValue('Chris Marshall');
        });
    });

    describe('when sail number is entered', () => {
        it('displays sail number', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceHandicapA}/>, model, controller);

            const inputSailNumber = await screen.findByLabelText(/sail/i);

            await act(async () => {
                await user.type(inputSailNumber, '1234');
            });

            expect(inputSailNumber).toHaveValue('1234');
        });
    });

    describe('when dinghy class is entered', () => {
        it('displays dinghy class', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceHandicapA}/>, model, controller);

            const inputDinghyClass = screen.getByLabelText(/class/i);
            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
            await act(async () => {
                await user.selectOptions(inputDinghyClass, 'Scorpion');
            });
            expect(inputDinghyClass).toHaveValue('Scorpion');
        });
    });
    
    describe('when dinghy class with no crew selected', () => {
		it('does not request entry of crew', async () => {
            const user = userEvent.setup();
            customRender(<SignUp race={raceHandicapA}/>, model, controller);

            const inputDinghyClass = screen.getByLabelText(/class/i);
            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
            await act(async () => {
                await user.selectOptions(inputDinghyClass, 'Comet');
            });
            const inputCrew = screen.queryByLabelText(/crew/i);
            expect(inputCrew).not.toBeInTheDocument();
        });
        
        describe('when helm and dinghy exist', () => {
			it('displays sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);

                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Comet');
                });
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Jill Myer');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '826');
                });
                expect(screen.getByRole('button', {'name': /^sign-up(?!.)/i}));
            });
			
			describe('when create button clicked', () => {
				it('creates entry with values entered into form and dinghy class set per race', async () => {
                    const onSignupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
    
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Comet');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Jill Myer');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '826');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(onSignupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, competitorJillMyer, dinghy826);
                });
			
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const onSignupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Jill Myer');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '826');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Jill Myer');
                        expect(inputDinghyClass).toHaveValue('Comet');
                        expect(inputSailNumber).toHaveValue('826');
                    })
                });
            });
        });

		describe('when helm does not exist', () => {
			it('displays create helm & sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Comet');
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '826');
                });
                expect(screen.getByRole('button', {'name': /add helm & sign-up/i}));
            });
		
			describe('when create button clicked', () => {
				it('creates helm and then creates entry with values entered into form', async () => {
                    const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Comet');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '826');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, {'name': 'Not There', 'url': ''}, dinghy826);
                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '826');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('826');
                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '826');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('826');
                    });
                });
            });
        });

		describe('when dinghy does not exist', () => {
			it('displays create dinghy and sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Comet');
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Jill Myer');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'g6754i');
                });
                expect(screen.getByRole('button', {'name': /add dinghy & sign-up/i}));
            });
			
			describe('when create button clicked', () => {
				it('creates dinghy and then creates entry with values entered into form', async () => {
                    const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Comet');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Jill Myer');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const createButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url':''});
                    expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, competitorJillMyer,
                        {'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                });
				describe('when dinghy not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Jill Myer');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const createButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                        expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Jill Myer');
                        expect(inputDinghyClass).toHaveValue('Comet');
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Jill Myer');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Jill Myer');
                        expect(inputDinghyClass).toHaveValue('Comet');
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
                });
			});	
        });

		describe('when neither helm nor dinghy exist', () => {
			it('displays create helm & dinghy & sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Comet');
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'xyz');
                });
                expect(screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i}));
            });
			
			describe('when create button clicked', () => {
				it('creates helm and dinghy and then creates entry with values entered into form', async () => {
                    const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Comet');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url':''});
                    expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, {'name': 'Not There', 'url': ''},
                        {'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createHelmSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                        expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputDinghyClass).toHaveValue('Comet');
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
				});

				describe('when dinghy not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createHelmSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                        expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputDinghyClass).toHaveValue('Comet');
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
                });

				describe('when neither helm nor dinghy created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createHelmSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                        expect(screen.getByText(/Competitor not created/i)).toBeInTheDocument();
                        expect(screen.getByText(/Dinghy not created/i)).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputDinghyClass).toHaveValue('Comet');
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
                });
            });
        });
    });

	describe('when dinghy class with crew selected', () => {	
		describe('when crew name is entered', () => {
            it('displays crew name', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);

                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Scorpion');
                });
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputCrew, 'Lou Screw');
                    expect(inputCrew).toHaveValue('Lou Screw');
                });
            });
        });

        describe('when helm and dinghy and crew exist', () => {
			it('displays sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Scorpion');
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Chris Marshall');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Lou Screw');
                });
                expect(screen.getByRole('button', {'name': /^sign-up(?!.)/i}));
            });
				
			describe('when create button clicked', () => {
				it('creates entry with values entered into form and dinghy class set per race', async () => {
                    const onSignupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(onSignupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
                });
			
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const onSignupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputDinghyClass).toHaveValue('Scorpion');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Lou Screw');
                    });
                });
            });
        });

		describe('when helm does not exist', () => {
			it('displays create helm & sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Scorpion');
                });
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Lou Screw');
                });
                expect(screen.getByRole('button', {'name': /add helm & sign-up/i}));
            });
		
			describe('when create button clicked', () => {
				it('creates helm and then creates entry with values entered into form', async () => {
                    const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, {'name': 'Not There', 'url': ''}, dinghy1234, competitorLouScrew);
                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputDinghyClass).toHaveValue('Scorpion');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Lou Screw');
                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputDinghyClass).toHaveValue('Scorpion');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue(('Lou Screw'));
                    });
                });
            });
        });

		describe('when dinghy does not exist', () => {
			it('displays create dinghy and sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Scorpion');
                });
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Chris Marshall');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'g6754i');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Lou Screw');
                })
                expect(screen.getByRole('button', {'name': /add dinghy & sign-up/i}));
            });
			
			describe('when create button clicked', () => {
				it('creates dinghy and then creates entry with values entered into form', async () => {
                    const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const createButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                    expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, competitorChrisMarshall,
                        {'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''}, competitorLouScrew);
                });
				describe('when dinghy not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const createButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                        expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputDinghyClass).toHaveValue('Scorpion');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue('Lou Screw');
                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputDinghyClass).toHaveValue('Scorpion');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue(('Lou Screw'));
                    });
                });
            });
        });

		describe('when crew does not exist', () => {
			it('displays create crew and sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Scorpion');
                });
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Chris Marshall');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Pop Off');
                })
                expect(screen.getByRole('button', {'name': /add crew & sign-up/i}));
            });
			
			describe('when create button clicked', () => {
				it('creates crew and then creates entry with values entered into form', async () => {
                    const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add crew & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, competitorChrisMarshall,
                        dinghy1234, {'name': 'Pop Off', 'url': ''});
                });
				describe('when crew not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const createButton = screen.getByRole('button', {'name': /add crew & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                        expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Pop Off');
                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue(('Pop Off'));
                    });
                });
            });
        });

		describe('when neither helm nor dinghy exist', () => {
			it('displays create helm & dinghy & sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Scorpion');
                });
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, 'xyz');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Lou Screw');
                });
                expect(screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i}));
            });
			
			describe('when create button clicked', () => {
				it('creates helm and dinghy and then creates entry with values entered into form', async () => {
                    const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                    expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, {'name': 'Not There', 'url': ''},
                        {'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''}, competitorLouScrew);
                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                        expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue('Lou Screw');
                    });
				});

				describe('when dinghy not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                        expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('g6754i');
                        expect(inputCrew).toHaveValue('Lou Screw');
                    });
                });

				describe('when neither helm nor dinghy created', () => {
					it('displays failure messages and entered values remain on form', async () => {
                        const createHelmSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                        expect(screen.getByText(/Competitor not created/i)).toBeInTheDocument();
                        expect(screen.getByText(/Dinghy not created/i)).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('g6754i');
                        expect(inputCrew).toHaveValue('Lou Screw');
                    });
                });
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue(('Lou Screw'));
                    });
                });
            });
        });

		describe('when neither helm nor crew exist', () => {
			it('displays create helm & crew & sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Scorpion');
                });
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSailNumber = await screen.findByLabelText(/sail/i);
                const inputCrew = await screen.findByLabelText(/crew/i);
                await act(async () => {
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.type(inputCrew, 'Pop Off');
                });
                expect(screen.getByRole('button', {'name': /add helm & crew & sign-up/i}));
            });
			
			describe('when create button clicked', () => {
				it('creates helm and crew and then creates entry with values entered into form', async () => {
                    const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                    expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, {'name': 'Not There', 'url': ''},
                        dinghy1234, {'name': 'Pop Off', 'url': ''});
                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                    // SignUp does not refresh competitor list so button label will not change
                    // const updatedCompetitorsCollection = [...competitorsCollection, {'name':'Pop Off', 'url': 'http://localhost:8081/dinghyracing/api/competitors/999'}];
                    // jest.spyOn(model, 'getCompetitors').mockImplementation(() => {
                    //     console.log(`getCompetitors.mockImplementation`);
                    //     return Promise.resolve({'success': true, 'domainObject': updatedCompetitorsCollection
                    // })})
                    //     .mockImplementationOnce(() => {
                    //         console.log(`getCompetitors.mockImplementationOnce`);
                    //         return Promise.resolve({'success': true, 'domainObject': competitorsCollection})
                    //     });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                        if (competitor.name === 'Not There') {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        }
                        else {
                            return Promise.resolve({'success': true});
                        }
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSailNumber = await screen.findByLabelText(/sail/i);
                    const inputCrew = await screen.findByLabelText(/crew/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const createButton = screen.getByRole('button', {'name': /add helm & crew & sign-up/i});
                    await act(async () => {
                        await user.click(createButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                    expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                    expect(inputHelm).toHaveValue('Not There');
                    expect(inputSailNumber).toHaveValue('1234');
                    expect(inputCrew).toHaveValue('Pop Off');
                    // SignUp does not refresh competitor list so button label will not change
                    // expect(await screen.findByRole('button', {'name': /add helm & sign-up/i})).toBeInTheDocument();
                    });
				});

				describe('when crew not created', () => {
					it('displays failure message and entered values remain on form', async () => {
                        // SignUp does not refresh competitor list so button label will not change
                        // const updatedCompetitorsCollection = [...competitorsCollection, {'name':'Pop Off', 'url': 'http://localhost:8081/dinghyracing/api/competitors/999'}];
                        // jest.spyOn(model, 'getCompetitors').mockImplementation(() => {
                        //     console.log(`getCompetitors.mockImplementation`);
                        //     return Promise.resolve({'success': true, 'domainObject': updatedCompetitorsCollection
                        // })})
                        //     .mockImplementationOnce(() => {
                        //         console.log(`getCompetitors.mockImplementationOnce`);
                        //         return Promise.resolve({'success': true, 'domainObject': competitorsCollection})
                        //     });
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation((competitor) => {
                            if (competitor.name === 'Pop Off') {
                                return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                            }
                            else {
                                return Promise.resolve({'success': true});
                            }
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & crew & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                        expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Pop Off');
                        // SignUp does not refresh competitor list so button label will not change
                        // expect(await screen.findByRole('button', {'name': /add helm & sign-up/i})).toBeInTheDocument();
                    });
                });

				describe('when neither helm nor crew created', () => {
					it('displays failure messages and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = await screen.findByLabelText(/helm/i);
                        const inputSailNumber = await screen.findByLabelText(/sail/i);
                        const inputCrew = await screen.findByLabelText(/crew/i);
                        await act(async () => {
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & crew & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                        expect(screen.getByText('Competitor not created/nCompetitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Pop Off');
                    });
                });

				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });
		
        describe('when neither dinghy nor crew exist', () => {
			it('displays create dinghy & crew & sign-up button', () => {

            });
			
			describe('when create button clicked', () => {
				it('creates dinghy and crew and then creates entry with values entered into form', () => {

                });
				
				describe('when dinghy not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
				});

				describe('when crew not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });

				describe('when neither helm nor crew created', () => {
					it('displays failure messages and entered values remain on form', () => {

                    });
                });

				describe('when entry not created', () => {
                    it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });
		
        describe('when neither helm nor dinghy nor crew exist', () => {
			it('displays create helm & dinghy & crew & sign-up button', () => {

            });
			
			describe('when create button clicked', () => {
				it('creates helm and dinghy and crew and then creates entry with values entered into form', () => {

                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });

				describe('when dinghy not created', () => {
                    it('displays failure message and entered values remain on form', () => {

                    });
                });
				
				describe('when crew not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });

				describe('when neither helm nor dinghy created', () => {
					it('displays failure messages and entered values remain on form', () => {

                    });
                });

				describe('when neither helm nor crew created', () => {
					it('displays failure messages and entered values remain on form', () => {

                    });
				});

				describe('when neither dinghy nor crew created', () => {
					it('displays failure messages and entered values remain on form', () => {

                    });
				});

				describe('when neither helm nor dinghy nor crew created', () => {
					it('displays failure messages and entered values remain on form', () => {

                    });
                });

				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });
    });

    it('clears form on success', async () => {

    });
    
    it('displays failure message on failure and entered values remain on form', async () => {
        
    });
    
    it('displays entries for race', async () => {

    });
});