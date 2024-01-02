import { act, screen } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import SignUp from './SignUp';
import { httpRootURL, wsRootURL, competitorsCollection, competitorChrisMarshall, raceScorpionA, raceNoClass, dinghies, dinghy1234, dinghy6745, 
    dinghyClasses, dinghyClassScorpion, dinghyClassComet, competitorSarahPascal, entriesScorpionA, competitorLouScrew, raceCometA, competitorJillMyer, dinghy826 } from '../model/__mocks__/test-data';

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
        
            const inputSail = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputSail, 'g6754i');
            });
            expect(inputSail).toHaveValue('g6754i');
        });
    });

    it('does not request entry of dinghy class', () => {
        customRender(<SignUp race={raceCometA}/>, model, controller);
        
        const inputDinghyClass = screen.queryByLabelText(/class/i);
        
        expect(inputDinghyClass).not.toBeInTheDocument();
    });

    it('does not request entry of crew', () => {
        customRender(<SignUp race={raceCometA}/>, model, controller);
        
        const inputCrew = screen.queryByLabelText(/crew/i);
        
        expect(inputCrew).not.toBeInTheDocument();
    });

    describe('when helm and dinghy exist', () => {
		it('displays sign-up button', async () => {
            const user = userEvent.setup();
    
            customRender(<SignUp race={raceCometA}/>, model, controller);
        
            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSail = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Jill Myer');
            });
            await act(async () => {
                await user.type(inputSail, '826');
            });
            expect(screen.getByRole('button', {'name': /sign-up/i}));
        });
		
		describe('when create button clicked', () => {
            it('creates entry with values entered into form and dinghy class set per race', async () => {
                const onCreateSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                    return Promise.resolve({'success': true});
                });
                const user = userEvent.setup();
    
                customRender(<SignUp race={raceCometA}/>, model, controller);
            
                const inputHelm = await screen.findByLabelText(/helm/i);
                const inputSail = await screen.findByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Jill Myer');
                });
                await act(async () => {
                    await user.type(inputSail, '826');
                });
                const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                await act(async () => {
                    await user.click(buttonCreate);
                });
                expect(onCreateSpy).toHaveBeenCalledWith(raceCometA, competitorJillMyer, dinghy826);
            });
		
			describe('when entry not created', () => {
                it('displays failure message and entered values remain on form', async () => {
                    const onCreateSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': false, 'message': 'Entry not created'});
                    });
                    const user = userEvent.setup();

                    customRender(<SignUp race={raceCometA}/>, model, controller);

                    const inputHelm = await screen.findByLabelText(/helm/i);
                    const inputSail = await screen.findByLabelText(/sail/i);
                    await act(async () => {
                        await user.type(inputHelm, 'Jill Myer');
                    });
                    await act(async () => {
                        await user.type(inputSail, '826');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(screen.getByText('Entry not created')).toBeInTheDocument();
                });
            });	
        });
	});

	describe('when helm does not exist', () => {
        it('displays create helm & sign-up button', async () => {
            const user = userEvent.setup();

            customRender(<SignUp race={raceCometA}/>, model, controller);

            const inputHelm = await screen.findByLabelText(/helm/i);
            const inputSail = await screen.findByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Not There');
            });
            await act(async () => {
                await user.type(inputSail, '826');
            });
            expect(await screen.findByRole('button', {'name': /add helm & sign-up/i}));
        });
	
		describe('when create button clicked', () => {
            it('creates helm and then creates entry with values entered into form', () => {

            })
			
			describe('when helm not created', () => {
				it('displays failure message and entered values remain on form', () => {

                });
            });
			
			describe('when entry not created', () => {
                it('displays failure message and entered values remain on form', () => {

                });
            });
        });
    });		

	describe('when dinghy does not exist', () => {
        it('displays create dinghy and sign-up button', () => {

        });
		
		describe('when create button clicked', () => {
            it('creates dinghy and then creates entry with values entered into form', () => {

            });
			
			describe('when dinghy not created', () => {
                it('it displays failure message and entered values remain on form', () => {

                });
            });
			
			describe('when entry not created', () => {
                it('displays failure message and entered values remain on form', () => {

                });
            });
        });			
    });

	describe('when neither helm nor dinghy exist', () => {
        it('displays create helm & dinghy & sign-up button', () => {

        });
		
		describe('when create button clicked', () => {
            it('creates helm and dinghy and then creates entry with values entered into form', () => {

            });
			
			describe('when helm not created', () => {
                it('displays failure message and entered values remain on form', () => {

                });
            });
				
			describe('when dinghy not created', () => {
                it('displays failure message and entered values remain on form', () => {

                });
            });
				
			describe('when neither helm nor dinghy created', () => {
                it('displays failure message and entered values remain on form', () => {

                });
            });				
        });
    });
    
    it('clears form on success', async () => {

    });
    
    it('displays entries for race', async () => {

    }); 
});

describe('when race for dinghy class with crew', () => {
    it('renders', async () => {

    });

    describe('when helm name is entered', () => {
        it('displays helm name', async () => {

        });
    });

    describe('when sail number is entered', () => {
        it('displays sail number', () => {

        });
    });
    
    it('does not request entry of dinghy class', () => {
    });

    describe('when crew name is entered', () => {
        it('displays crew name', () => {

        });
    });
    
    describe('when helm and dinghy and crew exist', () => {
		it('displays sign-up button', () => {

        });
			
		describe('when create button clicked', () => {
			it('creates entry with values entered into form and dinghy class set per race', async () => {

            });
		
			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', () => {

                });
            });
        });
    });

	describe('when helm does not exist', () => {
        it('displays create helm & sign-up button', () => {

        });
	
		describe('when create button clicked', () => {
			it('creates helm and then creates entry with values entered into form', () => {
             
            });
			
			describe('when helm not created', () => {
                it('displays failure message and entered values remain on form', () => {

                });
            });				
			
			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', () => {

                });
            });
        });
    });
		
	describe('when dinghy does not exist', () => {
		it('displays create dinghy and sign-up button', () => {

        });
		
		describe('when create button clicked', () => {
			it('creates dinghy and then creates entry with values entered into form', () => {

            });
			
			describe('when dinghy not created', () => {
				it('displays failure message and entered values remain on form', () => {

                });
            });

			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', () => {

                });
            });
        });
    });

	describe('when crew does not exist', () => {
		it('displays create crew and sign-up button', () => {

        });
		
		describe('when create button clicked', () => {
			it('creates crew and then creates entry with values entered into form', () => {

            });
			
			describe('when crew not created', () => {
				it('displays failure message and entered values remain on form', () => {

                });
            });
			
			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', () => {});
            });
        });
    });

	describe('when neither helm nor dinghy exist', () => {
		it('displays create helm & dinghy & sign-up button', () => {

        });
		
		describe('when create button clicked', () => {
			it('creates helm and dinghy and then creates entry with values entered into form', () => {});
			
			describe('when helm not created', () => {
				it('displays failure message and entered values remain on form', () => {});
            });
			
            describe('when dinghy not created', () => {
                it('displays failure message and entered values remain on form', () => {});
            });
				
			describe('when neither helm nor dinghy created', () => {
				it('displays failure messages and entered values remain on form', () => {

                });
            });

			describe('when entry not created', () => {
				it('displays failure message and entered values remain on form', () => {

                });
            });
        });
    });

	describe('when neither helm nor crew exist', () => {
		it('displays create helm & crew & sign-up button', () => {

        });
		
		describe('when create button clicked', () => {
			it('creates helm and crew and then creates entry with values entered into form', () => {

            });
			
			describe('when helm not created', () => {
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

    it('clears form on success', async () => {});
    
    it('displays failure message on failure and entered values remain on form', async () => {});
    
    it('displays entries for race', async () => {});
});

describe('when race is a handicap', () => {
    it('renders', async () => {

    });

    describe('when helm name is entered then ', () => {
        it('displays helm name', async () => {

        });
    });

    describe('when sail number is entered', () => {
        it('displays sail number', () => {

        });
    });

    describe('when dinghy class is entered', () => {
        it('displays dinghy class', () => {

        });
    });

    describe('when dinghy class has a crew', () => {
        describe('when crew name is entered', () => {
            it('displays crew name', () => {
            });
        });
    });

    describe('when dinghy class does not have crew', () => {
        it('does not request entry of crew', () => {
        });
    });
    
    describe('when dinghy class without crew selected', () => {
		describe('when helm and dinghy exist', () => {
			it('displays sign-up button', () => {

            });
			
			describe('when create button clicked', () => {
				it('creates entry with values entered into form and dinghy class set per race', async () => {

                });
			
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    })
                });
            });
        });

		describe('when helm does not exist', () => {
			it('displays create helm & sign-up button', () => {

            });
		
			describe('when create button clicked', () => {
				it('creates helm and then creates entry with values entered into form', () => {

                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });

		describe('when dinghy does not exist', () => {
			it('displays create dinghy and sign-up button', () => {

            });
			
			describe('when create button clicked', () => {
				it('creates dinghy and then creates entry with values entered into form', () => {

                });
				describe('when dinghy not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
			});	
        });
		describe('when neither helm nor dinghy exist', () => {
			it('displays create helm & dinghy & sign-up button', () => {

            });
			
			describe('when create button clicked', () => {
				it('creates helm and dinghy and then creates entry with values entered into form', () => {
                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', () => {});
				});
				describe('when dinghy not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
				describe('when neither helm nor dinghy created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });
	
    });

	describe('when dinghy class with crew selected', () => {	
		describe('when helm and dinghy and crew exist', () => {
			it('displays sign-up button', () => {

            });
				
			describe('when create button clicked', () => {
				it('creates entry with values entered into form and dinghy class set per race', async () => {
                    
                });
			
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });

		describe('when helm does not exist', () => {
			it('displays create helm & sign-up button', () => {

            });
		
			describe('when create button clicked', () => {
				it('creates helm and then creates entry with values entered into form', () => {

                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });
		describe('when dinghy does not exist', () => {
			it('displays create dinghy and sign-up button', () => {

            });
			
			describe('when create button clicked', () => {
				it('creates dinghy and then creates entry with values entered into form', () => {

                });
				
				describe('when dinghy not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });
		describe('when crew does not exist', () => {
			it('displays create crew and sign-up button', () => {

            });
			
			describe('when create button clicked', () => {
				it('creates crew and then creates entry with values entered into form', () => {

                });
				describe('when crew not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
				});
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });
		describe('when neither helm nor dinghy exist', () => {
			it('displays create helm & dinghy & sign-up button', () => {
            
            });
			
			describe('when create button clicked', () => {
				it('creates helm and dinghy and then creates entry with values entered into form', () => {

                });
				
				describe('when helm not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
				});

				describe('when dinghy not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });

				describe('when neither helm nor dinghy created', () => {
					it('displays failure messages and entered values remain on form', () => {

                    });
                });
				describe('when entry not created', () => {
					it('displays failure message and entered values remain on form', () => {

                    });
                });
            });
        });
		describe('when neither helm nor crew exist', () => {
			it('displays create helm & crew & sign-up button', () => {

            });
			
			describe('when create button clicked', () => {
				it('creates helm and crew and then creates entry with values entered into form', () => {

                });
				
				describe('when helm not created', () => {
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