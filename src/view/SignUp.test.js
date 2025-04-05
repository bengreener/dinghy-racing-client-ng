/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

import { act, screen, within } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import SignUp from './SignUp';
import { httpRootURL, wsRootURL, 
    competitorsCollection, competitorChrisMarshall, competitorLouScrew, competitorJillMyer,
    dinghyClasses, dinghyClassScorpion, dinghyClassComet,
    dinghies, dinghy1234, dinghy826, dinghy1234Graduate, dinghy1234Comet,
    raceScorpionA, raceHandicapA, raceCometA,
    entriesScorpionA, entriesCometA, entriesHandicapA, entryJillMyerCometA826,
    competitorSarahPascal,
    dinghy2726,
    entryChrisMarshallHandicapA1234, entryChrisMarshallScorpionA1234,
    dinghyScorpion1234Crews, dinghyGraduate1234Crews, dinghyComet1234Crews, 
    dinghyClassGraduate,
    fleetHandicap} from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

const model = new DinghyRacingModel(httpRootURL, wsRootURL);
const controller = new DinghyRacingController(model);    

beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': competitorsCollection})});
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClasses})});
    jest.spyOn(model, 'getDinghies').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghies})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
        if (race === raceScorpionA){
            return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
        }
        if (race === raceCometA){
            return Promise.resolve({'success': true, 'domainObject': entriesCometA});
        }
        if (race === raceHandicapA) {
            return Promise.resolve({success: true, domainObject: entriesHandicapA});
        }
        else {
            return Promise.resolve({success: false, message: 'Race not found.'});
        }
    });
    jest.spyOn(model, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => {
        return Promise.resolve({success: true, domainObject: dinghy1234 })
    });
    jest.spyOn(model, 'getCrewsByDinghy').mockImplementation((dinghy) => {
        if (dinghy.url === dinghy1234.url) {
            return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
        }
        else if (dinghy.url === dinghy1234Graduate.url) {
            return Promise.resolve({success: true, domainObject: dinghyGraduate1234Crews});
        }
        else {
            return Promise.resolve({success: true, domainObject: []});
        }
    });
});

describe('when signing up for a race', () => {
    it('only provides the option to select dinghy classes that are allowed for the race', async () => {
        const fleetHandicap = {name: 'Handicap', dinghyClasses: [dinghyClassScorpion, dinghyClassGraduate], url: 'http://localhost:8081/dinghyracing/api/fleets/2'};
        await act(async () => {
            customRender(<SignUp race={{...raceHandicapA, fleet: fleetHandicap}}/>, model, controller);
        });
        const inputDinghyClass = screen.getByLabelText(/class/i);
        const options = within(inputDinghyClass).getAllByRole('option');
        expect(options.length).toBe(3);
    });
    describe('when race for a fleet that includes only dinghy classes with no crew', () => {
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
                const inputHelm = screen.getByLabelText(/helm/i);
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
                const inputSailNumber = screen.getByLabelText(/sail/i);
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
            // const inputCrew = screen.queryByLabelText(/crew/i);
            // expect(inputCrew).not.toBeInTheDocument();
            const inputCrew = screen.getByLabelText(/crew/i);
            expect(inputCrew).toBeDisabled();
        });

        describe('when helm and dinghy exist', () => {
            it('displays sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceCometA}/>, model, controller);
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputHelm, 'Jill Myer');
                });
                await act(async () => {
                    await user.type(inputSailNumber, '826');
                });
                expect(screen.getByRole('button', {'name': /^sign-up(?!.)/i}));
            });

            describe('when sign-up button clicked', () => {
                it('creates entry with values entered into form and dinghy class set per race', async () => {
                    const onSignupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
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
                    expect(onSignupToRaceSpy).toHaveBeenCalledWith(raceCometA, competitorJillMyer, dinghy826);
                });
                describe('when entry not created', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceCometA}/>, model, controller);
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
                        expect(inputSailNumber).toHaveValue('826');
                    });
                });
                describe('when entry is a duplicate of an exisiting entry', () =>{
                    it('provides the dinghy class, sail number, and helm name', async () => {
                        jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                            return Promise.resolve({
                                success: false, 
                                message: "HTTP Error: 409 Conflict Message: The entry '15-7-17' already exists; this may be caused by an uppercase/ lowercase difference between existing record and the value entered."});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceCometA}/>, model, controller);
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
                        expect(screen.getByText('HTTP Error: 409 Conflict Message: The entry already exists; this may be caused by an uppercase/ lowercase difference between existing record and the value entered.')).toBeInTheDocument();
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
                    customRender(<SignUp race={raceCometA}/>, model, controller);
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
                    expect(signupToRaceSpy).toHaveBeenCalledWith(raceCometA, {'name': 'Not There', 'url': ''}, dinghy826);
                })
                
                describe('when helm not created', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceCometA}/>, model, controller);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
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
                    customRender(<SignUp race={raceCometA}/>, model, controller);
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
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
                });
            });			
        });
    
        describe('when neither helm nor dinghy exist', () => {
            it('displays create helm & dinghy & sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceCometA}/>, model, controller);
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
                    customRender(<SignUp race={raceCometA}/>, model, controller);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
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
            jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234 ]})});
            jest.spyOn(model, 'getCrewsByDinghy').mockImplementation(() => {
                return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
            });
            const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Jill Myer');
            });
            await act(async () => {
                await user.type(inputSailNumber, '826');
                await user.keyboard('{Tab}');
            });
            const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
            await act(async () => {
                await user.click(buttonCreate);
            });
            const raceTitle = screen.getByRole('heading', {'name': /comet a/i});
            const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
            const previousEntries = within(screen.getByTestId('previous-entries'));
            expect(raceTitle).toBeInTheDocument();
            expect(inputHelm).toHaveValue('');
            expect(inputSailNumber).toHaveValue('');
            expect(screen.queryByLabelText(/crew/i)).toBeDisabled();
            expect(previousEntries.getAllByRole('row')).toHaveLength(1);
            expect(btnCreate).toBeInTheDocument();
        });
        
        it('displays entries for race', async () => {
            jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesCometA})});
            customRender(<SignUp race={raceCometA}/>, model, controller);
            expect(await screen.findByRole('cell', {'name': /Jill Myer/i})).toBeInTheDocument();
            expect((await screen.findAllByRole('cell', {'name': /Comet/i}))[0]).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /826/i})).toBeInTheDocument();
            expect((await screen.findAllByRole('button', {name: /x/i}))[0]).toBeInTheDocument();
        });

        it('shows a count of the number of entries to the race', async () => {
            jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesHandicapA})});
            await act(async () => {
                customRender(<SignUp race={raceCometA}/>, model, controller);
            });
            const signUpSummary = document.getElementsByClassName('sign-up-summary');
            expect(within(signUpSummary[0]).getByText(/Total entries/i)).toBeInTheDocument();
            expect(within(signUpSummary[0]).getByText(/scorpion/i)).toBeInTheDocument();
            expect(within(signUpSummary[0]).getByText(/comet/i)).toBeInTheDocument();
        });
    });    
    describe('when race for a fleet that includes dinghy classes with crew', () => {
        it('renders', async () => {
            await act(async () => {
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
            });
            const raceTitle = screen.getByRole('heading', {'name': /scorpion a/i});
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
            const btnCancel = screen.getByRole('button', {'name': /cancel/i});
            expect(raceTitle).toBeInTheDocument();
            expect(inputHelm).toBeInTheDocument();
            expect(inputSailNumber).toBeInTheDocument();
            expect(inputCrew).toBeInTheDocument();
            expect(btnCreate).toBeInTheDocument();
            expect(btnCancel).toBeInTheDocument();

        });
    
        describe('when helm name is entered', () => {
            it('displays helm name', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const inputHelm = screen.getByLabelText(/helm/i);
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
                const inputSailNumber = screen.getByLabelText(/sail/i);
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
                const inputCrew = screen.getByLabelText(/crew/i);
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
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
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
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
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
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
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
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
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
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
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
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
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
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
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
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue(('Pop Off'));
                    });
                });
            });      
        });
    
        it('clears form on success', async () => {
            jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234 ]})});
            jest.spyOn(model, 'getCrewsByDinghy').mockImplementation(() => {
                return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
            });
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await act(async () => {
                await user.type(inputHelm, 'Chris Marshall');
            });
            await act(async () => {
                await user.type(inputSailNumber, '1234');
                await user.keyboard('{Tab}');
            });
            await act(async () => {
                await user.type(inputCrew, 'Lou Screw');
            });
            const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
            await act(async () => {
                await user.click(buttonCreate);
            });
            const raceTitle = screen.getByRole('heading', {'name': /scorpion a/i});
            const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
            const previousEntries = within(screen.getByTestId('previous-entries'));
            expect(raceTitle).toBeInTheDocument();
            expect(inputHelm).toHaveValue('');
            expect(inputSailNumber).toHaveValue('');
            expect(inputCrew).toHaveValue('');
            expect(previousEntries.getAllByRole('row')).toHaveLength(1);
            expect(btnCreate).toBeInTheDocument();
        });
        
        it('displays entries for race', async () => {
            jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            expect(await screen.findByRole('cell', {'name': /Chris Marshall/i})).toBeInTheDocument();
            expect((await screen.findAllByRole('cell', {'name': /Scorpion/i}))[0]).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /1234/i})).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /Lou Screw/i})).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /Sarah Pascal/i})).toBeInTheDocument();
            expect((await screen.findAllByRole('cell', {'name': /Scorpion/i}))[1]).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /6745/i})).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /Owain Davies/i})).toBeInTheDocument();
            expect((await screen.findAllByRole('button', {name: /x/i}))[0]).toBeInTheDocument();
        });
    });    
    describe('when race is an open handicap', () => {
        it('renders', async () => {
            await act(async () => {
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
            });
            const raceTitle = screen.getByRole('heading', {'name': /Handicap A/i});
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputDinghyClass = screen.getByLabelText(/class/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
            const btnCancel = screen.getByRole('button', {'name': /cancel/i});
            expect(raceTitle).toBeInTheDocument();
            expect(inputHelm).toBeInTheDocument();
            expect(inputDinghyClass).toBeInTheDocument();
            expect(inputSailNumber).toBeInTheDocument();
            expect(btnCreate).toBeInTheDocument();
            expect(btnCancel).toBeInTheDocument();
        });
        describe('when helm name is entered then ', () => {
            it('displays helm name', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const inputHelm = screen.getByLabelText(/helm/i);
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
                const inputSailNumber = screen.getByLabelText(/sail/i);
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
                // expect(inputCrew).not.toBeInTheDocument();
                expect(inputCrew).toBeDisabled();
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
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
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
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
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
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
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
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
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
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
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
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
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
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
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
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
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
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
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
                it('displays create dinghy & crew & sign-up button', async () => {
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
                        expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, competitorChrisMarshall,
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
                it('displays create helm & dinghy & crew & sign-up button', async () => {
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
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const createButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
                        await act(async () => {
                            await user.click(createButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                        expect(signupToRaceSpy).toHaveBeenCalledWith(raceHandicapA, {'name': 'Not There', 'url': ''},
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
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not created')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputSailNumber).toHaveValue('xyz');
                            expect(inputCrew).toHaveValue(('Pop Off'));
                        });
                    });
                });
            });
        });
    
        it('clears form on success', async () => {
            jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234 ]})});
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
                await user.keyboard('{Tab}');
            });
            await act(async () => {
                await user.type(inputCrew, 'Lou Screw');
            });
            const buttonCreate = screen.getByRole('button', {'name': /sign-up/i});
            await act(async () => {
                await user.click(buttonCreate);
            });
            const raceTitle = screen.getByRole('heading', {'name': /handicap a/i});
            const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
            const previousEntries = within(screen.getByTestId('previous-entries'));
            expect(raceTitle).toBeInTheDocument();
            expect(inputHelm).toHaveValue('');
            expect(inputSailNumber).toHaveValue('');
            expect(inputCrew).toHaveValue('');
            expect(previousEntries.getAllByRole('row')).toHaveLength(1);
            expect(btnCreate).toBeInTheDocument();
        });
        
        it('displays entries for race', async () => {
            jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesHandicapA})});
            customRender(<SignUp race={raceHandicapA}/>, model, controller);
            expect(await screen.findByRole('cell', {'name': /Chris Marshall/i})).toBeInTheDocument();
            expect((await screen.findAllByRole('cell', {'name': /Scorpion/i}))[0]).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /1234/i})).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /Lou Screw/i})).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /Jill Myer/i})).toBeInTheDocument();
            expect((await screen.findAllByRole('cell', {'name': /Comet/i}))[0]).toBeInTheDocument();
            expect(await screen.findByRole('cell', {'name': /826/i})).toBeInTheDocument();
            expect((await screen.findAllByRole('button', {name: /x/i}))[0]).toBeInTheDocument();
        });
    });
    it('has an option to cancel update that clears selected entry values to allow new entry to sign up', async () => {
        const user = userEvent.setup();
        await act(async () => {
            customRender(<SignUp race={raceHandicapA}/>, model, controller);
        });

        const inputDinghyClass = screen.getByLabelText(/class/i);
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await act(async () => {
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
            await user.keyboard('{Tab}');
            await user.type(inputCrew, 'Lou Screw');
        });
        await act(async () => {
            await user.click(screen.getByRole('button', {name: /cancel/i}));
        });
        expect(inputHelm).toHaveValue('');
        expect(inputCrew).toHaveValue('');
        expect(inputSailNumber).toHaveValue('');
    });
});

describe('when updating an existing entry', () => {
    describe('when race for a fleet that includes only dinghy classes with no crew', () => {
        it('displays details for selected entry', async () => {
            const user = userEvent.setup();
            await act(async () => {
                customRender(<SignUp race={raceCometA}/>, model, controller);
            });
            const raceTitle = screen.getByRole('heading', {'name': /comet a/i});
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);

            const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
            await act(async () => {
                await user.click(cellJillMyer);
            });

            expect(raceTitle).toBeInTheDocument();
            expect(inputHelm).toHaveValue('Jill Myer');
            expect(inputSailNumber).toHaveValue('826');
        });
        
        describe('when helm name is entered', () => {
            it('displays helm name', async () => {
                const user = userEvent.setup();
                await act(async () => {
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                });
                const inputHelm = screen.getByLabelText(/helm/i);

                const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                await act(async () => {
                    await user.click(cellJillMyer);
                });
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Chris Marshall');
                });
                expect(inputHelm).toHaveValue('Chris Marshall');
            });
        });
    
        describe('when sail number is entered', () => {
            it('displays sail number', async () => {
                const user = userEvent.setup();
                await act(async () => {
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                });
                const inputSailNumber = screen.getByLabelText(/sail/i);

                const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                await act(async () => {
                    await user.click(cellJillMyer);
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, 'g6754i');
                });
                expect(inputSailNumber).toHaveValue('g6754i');
            });
        });
    
        it('does not request entry of dinghy class', async () => {
            const user = userEvent.setup();
            await act(async () => {
                customRender(<SignUp race={raceCometA}/>, model, controller);
            });

            const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
            await act(async () => {
                await user.click(cellJillMyer);
            });
            const inputDinghyClass = screen.queryByLabelText(/class/i);
            expect(inputDinghyClass).not.toBeInTheDocument();
        });
    
        it('does not request entry of crew', async () => {
            const user = userEvent.setup();
            await act(async () => {
                customRender(<SignUp race={raceCometA}/>, model, controller);
            });

            const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
            await act(async () => {
                await user.click(cellJillMyer);
            });
            const inputCrew = screen.getByLabelText(/crew/i);
            expect(inputCrew).toBeDisabled();
        });
    
        describe('when helm and dinghy exist', () => {
            it('displays update button', async () => {
                const user = userEvent.setup();
                await act(async () => {
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);

                const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                await act(async () => {
                    await user.click(cellJillMyer);
                });
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.clear(inputSailNumber);
                    await user.type(inputHelm, 'Chris Marshall');
                    await user.type(inputSailNumber, '1234');
                });
                expect(screen.getByRole('button', {'name': /^update$/i}));
            });
            
            describe('when update button clicked', () => {
                it('updates entry with values entered into form and dinghy class set per race', async () => {
                    const onUpdateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    
                    const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                    await act(async () => {
                        await user.click(cellJillMyer);
                    });

                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, '1234');
                    });
                    const buttonUpdate = screen.getByRole('button', {'name': /update/i});
                    await act(async () => {
                        await user.click(buttonUpdate);
                    });
                    expect(onUpdateEntrySpy).toHaveBeenCalledWith(entryJillMyerCometA826, competitorChrisMarshall, {...dinghy1234});
                });
            
                describe('when entry not created', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceCometA}/>, model, controller);
                        const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                        await act(async () => {
                            await user.click(cellJillMyer);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '1234');
                        });
                        const buttonUpdate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonUpdate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputSailNumber).toHaveValue('1234');
                    });
                });	
            });
        });
    
        describe('when helm does not exist', () => {
            it('displays create helm & update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceCometA}/>, model, controller);
                const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                await act(async () => {
                    await user.click(cellJillMyer);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, '1234');
                });
                expect(screen.getByRole('button', {'name': /add helm & update/i}));
            });
        
            describe('when update button clicked', () => {
                it('creates helm and then updates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                    await act(async () => {
                        await user.click(cellJillMyer);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add helm & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryJillMyerCometA826, {'name': 'Not There', 'url': ''}, dinghy826);
                })
                
                describe('when helm not created', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceCometA}/>, model, controller);
                        const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                        await act(async () => {
                            await user.click(cellJillMyer);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('826');
                    });
                });
                
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceCometA}/>, model, controller);
                        const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                        await act(async () => {
                            await user.click(cellJillMyer);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        const buttonUpdate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonUpdate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(screen.getByLabelText(/sail/i)).toHaveValue('826');
                    });
                });
            });
        });
    
        describe('when dinghy does not exist', () => {
            it('displays create dinghy and sign-up button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceCometA}/>, model, controller);
                const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                await act(async () => {
                    await user.click(cellJillMyer);
                });
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, 'g6754i');
                });
                expect(screen.getByRole('button', {'name': /add dinghy & update/i}));
            });
            
            describe('when create button clicked', () => {
                it('creates dinghy and then creates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceCometA}/>, model, controller);
                    const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                    await act(async () => {
                        await user.click(cellJillMyer);
                    });
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add dinghy & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryJillMyerCometA826, competitorJillMyer, {'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                });
                
                describe('when dinghy not created', () => {
                    it('it displays failure message and entered values remain on form', async () => {
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceCometA}/>, model, controller);
                        const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                        await act(async () => {
                            await user.click(cellJillMyer);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                        expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Jill Myer');
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
                });
                
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceCometA}/>, model, controller);
                        const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                        await act(async () => {
                            await user.click(cellJillMyer);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const buttonUpdate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonUpdate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Jill Myer');
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
                });
            });			
        });
    
        describe('when neither helm nor dinghy exist', () => {
            it('displays create helm & dinghy & update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceCometA}/>, model, controller);
                const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                await act(async () => {
                    await user.click(cellJillMyer);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, 'xyz');
                });
                expect(screen.getByRole('button', {'name': /add helm & dinghy & update/i}));
            });
            
            describe('when update button clicked', () => {
                it('creates helm and dinghy and then updates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
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
                    const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                    await act(async () => {
                        await user.click(cellJillMyer);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryJillMyerCometA826, {'name': 'Not There', 'url': ''},
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
                        const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                        await act(async () => {
                            await user.click(cellJillMyer);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                        await act(async () => {
                            await user.click(cellJillMyer);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                        await act(async () => {
                            await user.click(cellJillMyer);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createHelmSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                        expect(screen.getByText(/Competitor not created/i)).toBeInTheDocument();
                        expect(screen.getByText(/Dinghy not created/i)).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
                });
    
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceCometA}/>, model, controller);
                        const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
                        await act(async () => {
                            await user.click(cellJillMyer);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const updateButton = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('g6754i');
                    });
                });
            });
        });
        
        it('clears form on success', async () => {
            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234 ]})});
            jest.spyOn(model, 'getCrewsByDinghy').mockImplementation(() => {
                return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
            });
            const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);
            const cellJillMyer = await screen.findByRole('cell', {name: /jill myer/i});
            await act(async () => {
                await user.click(cellJillMyer);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            await act(async () => {
                await user.clear(inputHelm);
                await user.type(inputHelm, 'Chris Marshall');
            });
            await act(async () => {
                await user.clear(inputSailNumber);
                await user.type(inputSailNumber, '1234');
                await user.keyboard('{Tab}');
            });
            const updateButton = screen.getByRole('button', {'name': /update/i});
            await act(async () => {
                await user.click(updateButton);
            });
            const previousEntries = within(screen.getByTestId('previous-entries'));
            expect(inputHelm).toHaveValue('');
            expect(inputSailNumber).toHaveValue('');
            expect(screen.queryByLabelText(/crew/i)).toBeDisabled();
            expect(previousEntries.getAllByRole('row')).toHaveLength(1);
            expect(screen.getByRole('button', {'name': /sign-up/i})).toBeInTheDocument();
        });
    });    
    describe('when race for a fleet that includes dinghy classes with crew', () => {
        it('displays details for selected entry', async () => {
            const user = userEvent.setup();
            await act(async () => {
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
            });

            const raceTitle = screen.getByRole('heading', {'name': /scorpion a/i});
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);

            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
            await act(async () => {
                await user.click(cellChrisMarshall);
            });

            expect(raceTitle).toBeInTheDocument();
            expect(inputHelm).toHaveValue('Chris Marshall');
            expect(inputCrew).toHaveValue('Lou Screw');
            expect(inputSailNumber).toHaveValue('1234');
        });

        describe('when helm name is entered', () => {
            it('displays helm name', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'New Person');
                });
                expect(inputHelm).toHaveValue('New Person');
            });
        });
    
        describe('when sail number is entered', () => {
            it('displays sail number', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, 'g6754i');
                });
                expect(inputSailNumber).toHaveValue('g6754i');
            });
        });
        
        it('does not request entry of dinghy class', async () => {
            const user = userEvent.setup();
            await act(async () => {
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
            });
            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
            await act(async () => {
                await user.click(cellChrisMarshall);
            });
            const inputDinghyClass = screen.queryByLabelText(/class/i);
            expect(inputDinghyClass).not.toBeInTheDocument();
        });
    
        describe('when crew name is entered', () => {
            it('displays crew name', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.clear(inputCrew);
                    await user.type(inputCrew, 'A Person');
                });
                expect(inputCrew).toHaveValue('A Person');
            });
        });
        
        describe('when helm and dinghy and crew exist', () => {
            it('displays update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Jill Myer');
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, '826');
                });
                await act(async () => {
                    await user.clear(inputCrew);
                    await user.type(inputCrew, 'Chris Marshall');
                });
                expect(screen.getByRole('button', {'name': /^update$/i}));
            });
                
            describe('when update button clicked', () => {
                it('updates entry with values entered into form and dinghy class set per race', async () => {
                    const onUpdateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const buttonCreate = screen.getByRole('button', {'name': /update/i});
                    await act(async () => {
                        await user.click(buttonCreate);
                    });
                    expect(onUpdateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234, competitorLouScrew);
                });
            
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Lou Screw');
                    });
                });
            });
        });
    
        describe('when helm does not exist', () => {
            it('displays update helm & update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.clear(inputCrew);
                    await user.type(inputCrew, 'Lou Screw');
                });
                expect(screen.getByRole('button', {'name': /add helm & update/i}));
            });
        
            describe('when update button clicked', () => {
                it('updates helm and then updates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add helm & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, {'name': 'Not There', 'url': ''}, dinghy1234, competitorLouScrew);
                });
                
                describe('when helm not created', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Lou Screw');
                    });
                });				
                
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue(('Lou Screw'));
                    });
                });
            });
        });
            
        describe('when dinghy does not exist', () => {
            it('displays create dinghy and update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Chris Marshall');
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, 'g6754i');
                });
                await act(async () => {
                    await user.clear(inputCrew);
                    await user.type(inputCrew, 'Lou Screw');
                })
                expect(screen.getByRole('button', {'name': /add dinghy & update/i}));
            });
            
            describe('when update button clicked', () => {
                it('creates dinghy and then updates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add dinghy & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, competitorChrisMarshall,
                        {'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''}, competitorLouScrew);
                });
                
                describe('when dinghy not created', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                        expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue('Lou Screw');
                    });
                });
    
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue(('Lou Screw'));
                    });
                });
            });
        });
    
        describe('when crew does not exist', () => {
            it('displays create crew and update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Chris Marshall');
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.clear(inputCrew);
                    await user.type(inputCrew, 'Not There');
                })
                expect(screen.getByRole('button', {'name': /add crew & update/i}));
            });
            
            describe('when update button clicked', () => {
                it('creates crew and then updates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add crew & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, competitorChrisMarshall,
                        dinghy1234, {'name': 'Pop Off', 'url': ''});
                });
                
                describe('when crew not created', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Not There');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add crew & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Not There');
                    });
                });
                
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Chris Marshall');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Not There');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue(('Not There'));
                    });
                });
            });
        });
    
        describe('when neither helm nor dinghy exist', () => {
            it('displays create helm and dinghy and update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, 'xyz');
                });
                await act(async () => {
                    await user.clear(inputCrew);
                    await user.type(inputCrew, 'Lou Screw');
                });
                expect(screen.getByRole('button', {'name': /add helm & dinghy & update/i}));
            });
            
            describe('when update button clicked', () => {
                it('creates helm and dinghy and then updates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
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
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Lou Screw');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, {'name': 'Not There', 'url': ''},
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
    
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Lou Screw');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue(('Lou Screw'));
                    });
                });
            });
        });
    
        describe('when neither helm nor crew exist', () => {
            it('displays create helm & crew & update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, '1234');
                });
                await act(async () => {
                    await user.clear(inputCrew);
                    await user.type(inputCrew, 'Pop Off');
                });
                expect(screen.getByRole('button', {'name': /add helm & crew & update/i}));
            });
            
            describe('when update button clicked', () => {
                it('creates helm and crew and then updates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                        return Promise.resolve({'success': true});
                    });
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, '1234');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add helm & crew & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, {'name': 'Not There', 'url': ''},
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '1234');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                        expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Pop Off');
                        // SignUp does not refresh competitor list so button label will not change
                        // expect(await screen.findByRole('button', {'name': /add helm & update/i})).toBeInTheDocument();
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                        expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Pop Off');
                        // SignUp does not refresh competitor list so button label will not change
                        // expect(await screen.findByRole('button', {'name': /add helm & update/i})).toBeInTheDocument();
                    });
                });
                    
                describe('when neither helm nor crew created', () => {
                    it('displays failure messages and entered values remain on form', async () => {
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                        expect(screen.getByText('Competitor not created/nCompetitor not created')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Pop Off');
                    });
                });
                
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue(('Pop Off'));
                    });
                });
            });
        });
    
        describe('when neither dinghy nor crew exist', () => {
            it('displays create dinghy and crew and update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, 'xyz');
                });
                await act(async () => {
                    await user.clear(inputCrew);
                    await user.type(inputCrew, 'Pop Off');
                });
                expect(screen.getByRole('button', {'name': /add crew & dinghy & update/i}));
            });
            
            describe('when update button clicked', () => {
                it('creates dinghy and crew and then updates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
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
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add crew & dinghy & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, competitorChrisMarshall,
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Not There');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
    
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Not There');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Chris Marshall');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue(('Not There'));
                    });
                });
            });
        });
    
        describe('when neither helm nor dinghy nor crew exist', () => {
            it('displays create helm and dinghy and crew and update button', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Not There');
                });
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, 'xyz');
                });
                await act(async () => {
                    await user.clear(inputCrew);
                    await user.type(inputCrew, 'Pop Off');
                });
                expect(screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i}));
            });
            
            describe('when update button clicked', () => {
                it('creates helm and dinghy and crew and then updates entry with values entered into form', async () => {
                    const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
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
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Pop Off');
                    });
                    const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                    await act(async () => {
                        await user.click(updateButton);
                    });
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                    expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                    expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                    expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234, {'name': 'Not There', 'url': ''},
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
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
    
                describe('when entry not updated', () => {
                    it('displays failure message and entered values remain on form', async () => {
                        jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceScorpionA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('xyz');
                        expect(inputCrew).toHaveValue(('Pop Off'));
                    });
                });
            });      
        });
    
        it('clears form on success', async () => {
            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234 ]})});
            jest.spyOn(model, 'getCrewsByDinghy').mockImplementation(() => {
                return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
            });
            const user = userEvent.setup();
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
            await act(async () => {
                await user.click(cellChrisMarshall);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await act(async () => {
                await user.clear(inputHelm);
                await user.type(inputHelm, 'Jill Myer');
            });
            await act(async () => {
                await user.clear(inputSailNumber);
                await user.type(inputSailNumber, '826');
                await user.keyboard('{Tab}');
            });
            await act(async () => {
                await user.clear(inputCrew);
                await user.type(inputCrew, 'Chris Marshall');
            });
            const updateButton = screen.getByRole('button', {'name': /update/i});
            await act(async () => {
                await user.click(updateButton);
            });
            const previousEntries = within(screen.getByTestId('previous-entries'));
            expect(screen.getByRole('heading', {'name': /scorpion a/i})).toBeInTheDocument();
            expect(inputHelm).toHaveValue('');
            expect(inputSailNumber).toHaveValue('');
            expect(inputCrew).toHaveValue('');
            expect(previousEntries.getAllByRole('row')).toHaveLength(1);
            expect(screen.getByRole('button', {'name': /sign-up/i})).toBeInTheDocument();
        });
    });    
    describe('when race is a handicap', () => {
        it('displays details for selected entry', async () => {
            const user = userEvent.setup();
            await act(async () => {
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
            });

            const raceTitle = screen.getByRole('heading', {'name': /handicap a/i});
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);

            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
            await act(async () => {
                await user.click(cellChrisMarshall);
            });

            expect(raceTitle).toBeInTheDocument();
            expect(inputHelm).toHaveValue('Chris Marshall');
            expect(inputCrew).toHaveValue('Lou Screw');
            expect(inputSailNumber).toHaveValue('1234');
        });
    
        describe('when helm name is entered then ', () => {
            it('displays helm name', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                await act(async () => {
                    await user.clear(inputHelm);
                    await user.type(inputHelm, 'Jill Myer');
                });
                expect(inputHelm).toHaveValue('Jill Myer');
            });
        });
    
        describe('when sail number is entered', () => {
            it('displays sail number', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.clear(inputSailNumber);
                    await user.type(inputSailNumber, 'xyz');
                });
                expect(inputSailNumber).toHaveValue('xyz');
            });
        });
    
        describe('when dinghy class is entered', () => {
            it('displays dinghy class', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Comet');
                });
                expect(inputDinghyClass).toHaveValue('Comet');
            });
        });
        
        describe('when dinghy class with no crew selected', () => {
            it('does not request entry of crew', async () => {
                const user = userEvent.setup();
                customRender(<SignUp race={raceHandicapA}/>, model, controller);
                const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(cellChrisMarshall);
                });
                const inputDinghyClass = screen.getByLabelText(/class/i);
                await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                await act(async () => {
                    await user.selectOptions(inputDinghyClass, 'Comet');
                });
                const inputCrew = screen.queryByLabelText(/crew/i);
                expect(inputCrew).toBeDisabled();
            });
            
            describe('when helm and dinghy exist', () => {
                it('displays update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Comet');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Jill Myer');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, '826');
                    });
                    expect(screen.getByRole('button', {'name': /^update$/i}));
                });
                
                describe('when update button clicked', () => {
                    it('updates entry with values entered into form and dinghy class set per race', async () => {
                        const onUpdateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Jill Myer');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '826');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(onUpdateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, competitorJillMyer, dinghy826);
                    });
                
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Comet');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Jill Myer');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, '826');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Jill Myer');
                            expect(inputDinghyClass).toHaveValue('Comet');
                            expect(inputSailNumber).toHaveValue('826');
                        })
                    });
                });
            });
    
            describe('when helm does not exist', () => {
                it('displays create helm & update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Comet');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, '826');
                    });
                    expect(screen.getByRole('button', {'name': /add helm & update/i}));
                });
            
                describe('when update button clicked', () => {
                    it('creates helm and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '826');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, {'name': 'Not There', 'url': ''}, dinghy826);
                    });
                    
                    describe('when helm not created', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Comet');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, '826');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & update/i});
                            await act(async () => {
                                await user.click(updateButton);
                            });
                            expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                            expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputSailNumber).toHaveValue('826');
                        });
                    });
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Comet');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, '826');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputSailNumber).toHaveValue('826');
                        });
                    });
                });
            });
    
            describe('when dinghy does not exist', () => {
                it('displays create dinghy and update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Comet');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Jill Myer');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    expect(screen.getByRole('button', {'name': /add dinghy & update/i}));
                });
                
                describe('when update button clicked', () => {
                    it('creates dinghy and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Jill Myer');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url':''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, competitorJillMyer,
                            {'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                    });
    
                    describe('when dinghy not created', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Comet');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Jill Myer');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
                            });
                            expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url': ''});
                            expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Jill Myer');
                            expect(inputDinghyClass).toHaveValue('Comet');
                            expect(inputSailNumber).toHaveValue('g6754i');
                        });
                    });
    
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Comet');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Jill Myer');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Jill Myer');
                            expect(inputDinghyClass).toHaveValue('Comet');
                            expect(inputSailNumber).toHaveValue('g6754i');
                        });
                    });
                });	
            });
    
            describe('when neither helm nor dinghy exist', () => {
                it('displays create helm & dinghy & update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Comet');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'xyz');
                    });
                    expect(screen.getByRole('button', {'name': /add helm & dinghy & update/i}));
                });
                
                describe('when update button clicked', () => {
                    it('creates helm and dinghy and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Comet');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'g6754i');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'g6754i', 'dinghyClass': dinghyClassComet, 'url':''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, {'name': 'Not There', 'url': ''},
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
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Comet');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Comet');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Comet');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Graduate');
                    });
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Jill Myer');
                    });
                    expect(inputCrew).toHaveValue('Jill Myer');
                });
            });
    
            describe('when helm and dinghy and crew exist', () => {
                it('displays update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Jill Myer');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, '2726');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Sarah Pascal');
                    });
                    expect(screen.getByRole('button', {'name': /^update$/i}));
                });
    
                describe('when update button clicked', () => {
                    it('updates entry with values entered into form and dinghy class set per race', async () => {
                        const onUpdateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Jill Myer');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, '2726');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Sarah Pascal');
                        });
                        const buttonCreate = screen.getByRole('button', {'name': /update/i});
                        await act(async () => {
                            await user.click(buttonCreate);
                        });
                        expect(onUpdateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, competitorJillMyer, dinghy2726, competitorSarahPascal);
                    });
                
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Jill Myer');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, '2726');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Sarah Pascal');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Jill Myer');
                            expect(inputDinghyClass).toHaveValue('Scorpion');
                            expect(inputSailNumber).toHaveValue('2726');
                            expect(inputCrew).toHaveValue('Sarah Pascal');
                        });
                    });
                });
            });
    
            describe('when helm does not exist', () => {
                it('displays create helm & update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    expect(screen.getByRole('button', {'name': /add helm & update/i}));
                });
            
                describe('when update button clicked', () => {
                    it('creates helm and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, {'name': 'Not There', 'url': ''}, dinghy1234, competitorLouScrew);
                    });
                    
                    describe('when helm not created', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & update/i});
                            await act(async () => {
                                await user.click(updateButton);
                            });
                            expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                            expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputDinghyClass).toHaveValue('Scorpion');
                            expect(inputSailNumber).toHaveValue('1234');
                            expect(inputCrew).toHaveValue('Lou Screw');
                        });
                    });
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputDinghyClass).toHaveValue('Scorpion');
                            expect(inputSailNumber).toHaveValue('1234');
                            expect(inputCrew).toHaveValue(('Lou Screw'));
                        });
                    });
                });
            });
    
            describe('when dinghy does not exist', () => {
                it('displays create dinghy and update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Chris Marshall');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'g6754i');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Lou Screw');
                    })
                    expect(screen.getByRole('button', {'name': /add dinghy & update/i}));
                });
                
                describe('when update button clicked', () => {
                    it('creates dinghy and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, competitorChrisMarshall,
                            {'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''}, competitorLouScrew);
                    });
                    describe('when dinghy not created', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Dinghy not created'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'xyz');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
                            });
                            expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''});
                            expect(screen.getByText('Dinghy not created')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Chris Marshall');
                            expect(inputDinghyClass).toHaveValue('Scorpion');
                            expect(inputSailNumber).toHaveValue('xyz');
                            expect(inputCrew).toHaveValue('Lou Screw');
                        });
                    });
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'xyz');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Chris Marshall');
                            expect(inputDinghyClass).toHaveValue('Scorpion');
                            expect(inputSailNumber).toHaveValue('xyz');
                            expect(inputCrew).toHaveValue(('Lou Screw'));
                        });
                    });
                });
            });
    
            describe('when crew does not exist', () => {
                it('displays create crew and update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Pop Off');
                    })
                    expect(screen.getByRole('button', {'name': /add crew & update/i}));
                });
                
                describe('when update button clicked', () => {
                    it('creates crew and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add crew & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, competitorChrisMarshall,
                            dinghy1234, {'name': 'Pop Off', 'url': ''});
                    });
    
                    describe('when crew not created', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add crew & update/i});
                            await act(async () => {
                                await user.click(updateButton);
                            });
                            expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                            expect(screen.getByText('Competitor not created')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Chris Marshall');
                            expect(inputSailNumber).toHaveValue('1234');
                            expect(inputCrew).toHaveValue('Pop Off');
                        });
                    });
    
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Chris Marshall');
                            expect(inputSailNumber).toHaveValue('1234');
                            expect(inputCrew).toHaveValue(('Pop Off'));
                        });
                    });
                });
            });
    
            describe('when neither helm nor dinghy exist', () => {
                it('displays create helm & dinghy & update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'xyz');
                    });
                    expect(screen.getByRole('button', {'name': /add helm & dinghy & update/i}));
                });
                
                describe('when update button clicked', () => {
                    it('creates helm and dinghy and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, {'name': 'Not There', 'url': ''},
                            {'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url': ''}, competitorLouScrew);
                    });
                    
                    describe('when helm not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                            });
                            const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'xyz');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
    
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'xyz');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputSailNumber).toHaveValue('xyz');
                            expect(inputCrew).toHaveValue(('Lou Screw'));
                        });
                    });
                });
            });
    
            describe('when neither helm nor crew exist', () => {
                it('displays create helm & crew & update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Pop Off');
                    });
                    expect(screen.getByRole('button', {'name': /add helm & crew & update/i}));
                });
                
                describe('when update button clicked', () => {
                    it('creates helm and crew and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                            return Promise.resolve({'success': true});
                        });
                        const user = userEvent.setup();
                        customRender(<SignUp race={raceHandicapA}/>, model, controller);
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, {'name': 'Not There', 'url': ''},
                            dinghy1234, {'name': 'Pop Off', 'url': ''});
                    });
                    
                    describe('when helm not updated', () => {
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                        expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                        expect(inputHelm).toHaveValue('Not There');
                        expect(inputSailNumber).toHaveValue('1234');
                        expect(inputCrew).toHaveValue('Pop Off');
                        // SignUp does not refresh competitor list so button label will not change
                        // expect(await screen.findByRole('button', {'name': /add helm & update/i})).toBeInTheDocument();
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
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & crew & update/i});
                            await act(async () => {
                                await user.click(updateButton);
                            });
                            expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                            expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                            expect(screen.getAllByText('Competitor not created')).toHaveLength(1);
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputSailNumber).toHaveValue('1234');
                            expect(inputCrew).toHaveValue('Pop Off');
                            // SignUp does not refresh competitor list so button label will not change
                            // expect(await screen.findByRole('button', {'name': /add helm & update/i})).toBeInTheDocument();
                        });
                    });

                    describe('when neither helm nor crew created', () => {
                        it('displays failure messages and entered values remain on form', async () => {
                            const createCompetitorSpy = jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Competitor not created'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & crew & update/i});
                            await act(async () => {
                                await user.click(updateButton);
                            });
                            expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url': ''});
                            expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url': ''});
                            expect(screen.getByText('Competitor not created/nCompetitor not created')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputSailNumber).toHaveValue('1234');
                            expect(inputCrew).toHaveValue('Pop Off');
                        });
                    });

                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputSailNumber).toHaveValue('1234');
                            expect(inputCrew).toHaveValue(('Pop Off'));
                        });
                    });
                });
            });
            
            describe('when neither dinghy nor crew exist', () => {
                it('displays create dinghy & crew & update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Pop Off');
                    });
                    expect(screen.getByRole('button', {'name': /add crew & dinghy & update/i}));
                });
                
                describe('when update button clicked', () => {
                    it('creates dinghy and crew and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, competitorChrisMarshall,
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Not There');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
    
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'xyz');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Not There');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Chris Marshall');
                            expect(inputSailNumber).toHaveValue('xyz');
                            expect(inputCrew).toHaveValue(('Not There'));
                        });
                    });
                });
            });
            
            describe('when neither helm nor dinghy nor crew exist', () => {
                it('displays create helm & dinghy & crew & update button', async () => {
                    const user = userEvent.setup();
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                    const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                    await act(async () => {
                        await user.click(cellChrisMarshall);
                    });
                    const inputDinghyClass = screen.getByLabelText(/class/i);
                    await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                    await act(async () => {
                        await user.selectOptions(inputDinghyClass, 'Scorpion');
                    });
                    const inputHelm = screen.getByLabelText(/helm/i);
                    const inputSailNumber = screen.getByLabelText(/sail/i);
                    const inputCrew = screen.getByLabelText(/crew/i);
                    await act(async () => {
                        await user.clear(inputHelm);
                        await user.type(inputHelm, 'Not There');
                    });
                    await act(async () => {
                        await user.clear(inputSailNumber);
                        await user.type(inputSailNumber, 'xyz');
                    });
                    await act(async () => {
                        await user.clear(inputCrew);
                        await user.type(inputCrew, 'Pop Off');
                    });
                    expect(screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i}));
                });
                
                describe('when update button clicked', () => {
                    it('creates helm and dinghy and crew and then updates entry with values entered into form', async () => {
                        const updateEntrySpy = jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
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
                        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                        await act(async () => {
                            await user.click(cellChrisMarshall);
                        });
                        const inputDinghyClass = screen.getByLabelText(/class/i);
                        await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                        await act(async () => {
                            await user.selectOptions(inputDinghyClass, 'Scorpion');
                        });
                        const inputHelm = screen.getByLabelText(/helm/i);
                        const inputSailNumber = screen.getByLabelText(/sail/i);
                        const inputCrew = screen.getByLabelText(/crew/i);
                        await act(async () => {
                            await user.clear(inputHelm);
                            await user.type(inputHelm, 'Not There');
                        });
                        await act(async () => {
                            await user.clear(inputSailNumber);
                            await user.type(inputSailNumber, 'xyz');
                        });
                        await act(async () => {
                            await user.clear(inputCrew);
                            await user.type(inputCrew, 'Pop Off');
                        });
                        const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                        await act(async () => {
                            await user.click(updateButton);
                        });
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Not There', 'url':''});
                        expect(createCompetitorSpy).toHaveBeenCalledWith({'name': 'Pop Off', 'url':''});
                        expect(createDinghySpy).toHaveBeenCalledWith({'sailNumber': 'xyz', 'dinghyClass': dinghyClassScorpion, 'url':''});
                        expect(updateEntrySpy).toHaveBeenCalledWith(entryChrisMarshallHandicapA1234, {'name': 'Not There', 'url': ''},
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'xyz');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'xyz');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'g6754i');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const updateButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & update/i});
                            await act(async () => {
                                await user.click(updateButton);
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
        
                    describe('when entry not updated', () => {
                        it('displays failure message and entered values remain on form', async () => {
                            jest.spyOn(controller, 'createCompetitor').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'createDinghy').mockImplementation(() => {
                                return Promise.resolve({'success': true});
                            });
                            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                                return Promise.resolve({'success': false, 'message': 'Entry not updated'});
                            });
                            const user = userEvent.setup();
                            customRender(<SignUp race={raceHandicapA}/>, model, controller);
                            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
                            await act(async () => {
                                await user.click(cellChrisMarshall);
                            });
                            const inputDinghyClass = screen.getByLabelText(/class/i);
                            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
                            await act(async () => {
                                await user.selectOptions(inputDinghyClass, 'Scorpion');
                            });
                            const inputHelm = screen.getByLabelText(/helm/i);
                            const inputSailNumber = screen.getByLabelText(/sail/i);
                            const inputCrew = screen.getByLabelText(/crew/i);
                            await act(async () => {
                                await user.clear(inputHelm);
                                await user.type(inputHelm, 'Not There');
                            });
                            await act(async () => {
                                await user.clear(inputSailNumber);
                                await user.type(inputSailNumber, 'xyz');
                            });
                            await act(async () => {
                                await user.clear(inputCrew);
                                await user.type(inputCrew, 'Pop Off');
                            });
                            const buttonCreate = screen.getByRole('button', {'name': /update/i});
                            await act(async () => {
                                await user.click(buttonCreate);
                            });
                            expect(screen.getByText('Entry not updated')).toBeInTheDocument();
                            expect(inputHelm).toHaveValue('Not There');
                            expect(inputSailNumber).toHaveValue('xyz');
                            expect(inputCrew).toHaveValue(('Pop Off'));
                        });
                    });
                });
            });
        });
    
        it('clears form on success', async () => {
            jest.spyOn(controller, 'updateEntry').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234 ]})});
            jest.spyOn(model, 'getCrewsByDinghy').mockImplementation(() => {
                return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
            });
            const user = userEvent.setup();
            customRender(<SignUp race={raceHandicapA}/>, model, controller);
            const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
            await act(async () => {
                await user.click(cellChrisMarshall);
            });
            const inputDinghyClass = screen.getByLabelText(/class/i);
            await screen.findAllByRole('option'); // wait for options list to be built via asynchronous calls
            await act(async () => {
                await user.selectOptions(inputDinghyClass, 'Scorpion');
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await act(async () => {
                await user.clear(inputHelm);
                await user.type(inputHelm, 'Chris Marshall');
            });
            await act(async () => {
                await user.clear(inputSailNumber);
                await user.type(inputSailNumber, '1234');
                await user.keyboard('{Tab}');
            });
            await act(async () => {
                await user.clear(inputCrew);
                await user.type(inputCrew, 'Lou Screw');
            });
            const buttonCreate = screen.getByRole('button', {'name': /update/i});
            await act(async () => {
                await user.click(buttonCreate);
            });
            const raceTitle = screen.getByRole('heading', {'name': /handicap a/i});
            const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
            const previousEntries = within(screen.getByTestId('previous-entries'));
            expect(raceTitle).toBeInTheDocument();
            expect(inputHelm).toHaveValue('');
            expect(inputSailNumber).toHaveValue('');
            expect(inputCrew).toHaveValue('');
            expect(previousEntries.getAllByRole('row')).toHaveLength(1);
            expect(btnCreate).toBeInTheDocument();
        });
    });
    it('has an option to cancel update that clears selected entry values to allow new entry to sign up', async () => {
        const user = userEvent.setup();
        await act(async () => {
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
        });
        const cellChrisMarshall = await screen.findByRole('cell', {name: /chris marshall/i});
        await act(async () => {
            await user.click(cellChrisMarshall);
        });
        await act(async () => {
            await user.click(screen.getByRole('button', {name: /cancel/i}));
        });

        const raceTitle = await screen.findByRole('heading', {'name': /scorpion a/i});
        const inputHelm = await screen.findByLabelText(/helm/i);
        const inputCrew = await screen.findByLabelText(/crew/i);
        const inputSailNumber = await screen.findByLabelText(/sail/i);
        const btnCreate = await screen.findByRole('button', {'name': /sign-up/i});
        expect(raceTitle).toBeInTheDocument();
        expect(inputHelm).toHaveValue('');
        expect(inputCrew).toHaveValue('');
        expect(inputSailNumber).toHaveValue('');
        expect(btnCreate).toBeInTheDocument();
    });
});

it('registers an interest in race updates for the race being signed up to', async () => {
    const user = userEvent.setup();
    jest.spyOn(model, 'getEntriesByRace').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    const registerRaceUpdateCallbackSpy = jest.spyOn(model, 'registerRaceUpdateCallback');

    customRender(<SignUp race={raceScorpionA}/>, model, controller);
    expect((await screen.findAllByRole('cell', {'name': /Scorpion/i}))[0]).toBeInTheDocument();

    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(1, 'http://localhost:8081/dinghyracing/api/races/4', expect.any(Function));
});

it('registers an interest in entry updates for the entries in the race being signed up to', async () => {
    const user = userEvent.setup();
    jest.spyOn(model, 'getEntriesByRace').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    const registerEntryUpdateCallbackSpy = jest.spyOn(model, 'registerEntryUpdateCallback');

    customRender(<SignUp race={raceScorpionA}/>, model, controller);
    expect((await screen.findAllByRole('cell', {'name': /Scorpion/i}))[0]).toBeInTheDocument();

    expect(registerEntryUpdateCallbackSpy).toHaveBeenCalledWith('http://localhost:8081/dinghyracing/api/entries/10', expect.any(Function));
    expect(registerEntryUpdateCallbackSpy).toHaveBeenCalledWith('http://localhost:8081/dinghyracing/api/entries/11', expect.any(Function));
});

it('removes an entry that has been withdrawn from list of displayed entries', async () => {
    const entriesScorpionADeleted = [entriesScorpionA[0]];
    jest.spyOn(model, 'getEntriesByRace').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})}).mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionADeleted})});
    await act(async () => {
        customRender(<SignUp race={raceScorpionA}/>, model, controller);
    });
    expect(await screen.findByRole('cell', {'name': /sarah pascal/i})).toBeInTheDocument();
    await act(async () => {
        model.handleRaceUpdate({'body': 'http://localhost:8081/dinghyracing/api/races/4'});
    });

    expect(screen.queryByRole('cell', {'name': /sarah pascal/i})).not.toBeInTheDocument();
});

describe('when the withdraw button for an entry is clicked', () => {
    it('calls the controller withDraw entry method with the entry to be withdrawn', async () => {
        const user = userEvent.setup();
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesCometA})});
        customRender(<SignUp race={raceCometA}/>, model, controller);
        const withdrawEntrySpy = jest.spyOn(controller, 'withdrawEntry').mockImplementation(() => {return Promise.resolve({success: true})});
        const jillMyerCell = await screen.findByRole('cell', {'name': /Jill Myer/i});
        const entryJillMyerRow = jillMyerCell.parentElement;
        const withdrawButton = within(entryJillMyerRow).getByRole('button', {name: /x/i});
        await act(async () => {
           await user.click(withdrawButton);
        });
        expect(withdrawEntrySpy).toBeCalledWith(entryJillMyerCometA826);
    });
});

it('registers an interest in new competitors', async () => {
    const registerCompetitorCreationCallbackSpy = jest.spyOn(model, 'registerCompetitorCreationCallback');

    customRender(<SignUp race={raceScorpionA}/>, model, controller);
    expect((await screen.findAllByRole('cell', {'name': /Scorpion/i}))[0]).toBeInTheDocument();

    expect(registerCompetitorCreationCallbackSpy).toHaveBeenNthCalledWith(1, expect.any(Function));
});

describe('when a new competitor is created', () => {
    it('updates the list of known competitors', async () => {
        const competitorsCollection_updated = [...competitorsCollection, {name: 'new', url: 'http://localhost:8081/dinghyracing/api/competitors/99'}]
        jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': competitorsCollection_updated})}).mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': competitorsCollection})});
        customRender(<SignUp race={raceCometA}/>, model, controller);
        
        await act(async () => {
            model.handleCompetitorCreation('http://localhost:8081/dinghyracing/api/competitors/99');
        });
        expect(await screen.findByRole('option', {name: /new/i, hidden: true})).toBeInTheDocument();
    });
});

it('registers an interest in new dinghies', async () => {
    const registerDinghyCreationCallbackSpy = jest.spyOn(model, 'registerDinghyCreationCallback');

    customRender(<SignUp race={raceScorpionA}/>, model, controller);
    expect((await screen.findAllByRole('cell', {'name': /Scorpion/i}))[0]).toBeInTheDocument();

    expect(registerDinghyCreationCallbackSpy).toHaveBeenNthCalledWith(1, expect.any(Function));
});

describe('when a new dinghy is created', () => {
    it('updates the list of known dinghies', async () => {
        const dinghies_updated = [...dinghies, {sailNumber: '999', dinghyClass: dinghyClassScorpion, url: 'http://localhost:8081/dinghyracing/api/dinghies/99'}]
        jest.spyOn(model, 'getDinghies').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghies_updated})}).mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghies})});
        customRender(<SignUp race={raceCometA}/>, model, controller);
        
        await act(async () => {
            model.handleDinghyCreation('http://localhost:8081/dinghyracing/api/dinghies/99');
        });
        expect(await screen.findByRole('option', {name: /999/i, hidden: true})).toBeInTheDocument();
    });
});

describe('when a new dinghy class is created', () => {
    it('updates the list of known dinghy classes', async () => {
        const dinghyClasses_updated = [...dinghyClasses, {name: 'Avalon', crewSize: 5, portsMouthNumber: 856, url: 'http://localhost:8081/dinghyracing/api/dinghyClasses/99'}]
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClasses_updated})}).mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClasses})});
        customRender(<SignUp race={raceHandicapA}/>, model, controller);

        await act(async () => {
            model.handleDinghyClassCreation('http://localhost:8081/dinghyracing/api/dinghyClasses/99');
        });
        expect(await screen.findByRole('option', {name: /avalon/i, hidden: true})).toBeInTheDocument();
    });
});

describe('when a sailnumber is entered', () => {
    it('displays dinghy class and previous crews for boats with that sail number', async () => {
        const user = userEvent.setup();
        jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234, dinghy1234Graduate ]})});
        await act(async () => {
            customRender(<SignUp race={raceHandicapA}/>, model, controller);
        });
        // enter sail number
        const inputSailNumber = screen.getByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputSailNumber, '1234');
            await user.keyboard('{Tab}');
        });
        // get table that is suppossed to contain details of dinghy class and previous crews
        const previousEntries = within(screen.getByTestId('previous-entries'));
        // check it contains dinghy classes and previous crews for boats with sail number
        expect(await previousEntries.findAllByRole('cell', {name: 'Scorpion'})).toHaveLength(2);
        expect(await previousEntries.findByRole('cell', {name: 'Chris Marshall'})).toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Jill Myer'})).toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Graduate'})).toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Liu Bao'})).toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Lou Screw'})).toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Sarah Pascal'})).toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Owain Davies'})).toBeInTheDocument();
        expect(inputSailNumber).not.toHaveFocus();
    });
    it('only displays entries that are eligible to sail based on the fleet for the race', async () => {
        const user = userEvent.setup();

        jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234, dinghy1234Graduate ]})});
        jest.spyOn(model, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234 })});
        jest.spyOn(model, 'getCrewsByDinghy').mockImplementation((dinghy) => {
            if (dinghy.url === dinghy1234.url) {
                return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
            }
            else if (dinghy.url === dinghy1234Graduate.url) {
                return Promise.resolve({success: true, domainObject: dinghyGraduate1234Crews});
            }
        });
        
        await act(async () => {
            customRender(<SignUp race={raceScorpionA}/>, model, controller);
        });
        // enter sail number
        const inputSailNumber = screen.getByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputSailNumber, '1234');
            await user.keyboard('{Tab}');
        });
        // get table that is suppossed to contain details of dinghy class and previous crews
        const previousEntries = within(screen.getByTestId('previous-entries'));
        // check it contains dinghy classes and previous crews for boats with sail number
        expect(await previousEntries.findAllByRole('cell', {name: 'Scorpion'})).toHaveLength(2);
        expect(await previousEntries.findByRole('cell', {name: 'Chris Marshall'})).toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Jill Myer'})).toBeInTheDocument();
        expect(await previousEntries.queryByRole('cell', {name: 'Graduate'})).not.toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Liu Bao'})).toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Lou Screw'})).toBeInTheDocument();
        expect(await previousEntries.queryByRole('cell', {name: 'Sarah Pascal'})).not.toBeInTheDocument();
        expect(await previousEntries.queryByRole('cell', {name: 'Owain Davies'})).not.toBeInTheDocument();
        expect(inputSailNumber).not.toHaveFocus();
    });
    describe('when there is a problem retrieving dinghies with the sail number', () => {
        describe('when race is an open handicap (any dinghy class allowed)', () => {
            it('displays an error message when there is a problem retrieving previous entries', async () => {
                const user = userEvent.setup();
        
                jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: false, message: 'Oops!'})});
                jest.spyOn(model, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => {return Promise.resolve({success: false, message: 'Oops!' })});
                jest.spyOn(model, 'getCrewsByDinghy').mockImplementation((dinghy) => {
                    if (dinghy.url === dinghy1234.url) {
                        return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
                    }
                    else if (dinghy.url === dinghy1234Graduate.url) {
                        return Promise.resolve({success: true, domainObject: dinghyGraduate1234Crews});
                    }
                });
                
                await act(async () => {
                    customRender(<SignUp race={raceHandicapA}/>, model, controller);
                });
                // enter sail number
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                    await user.keyboard('{Tab}');
                })
                expect(await screen.findByText(/oops!/i)).toBeInTheDocument();
            });
        });
        describe('when race is for a restricted set of dinghy classes', () => {
            it('displays an error message when there is a problem retrieving previous entries', async () => {
                const user = userEvent.setup();
        
                jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: false, message: 'Oops!'})});
                jest.spyOn(model, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => {
                    return Promise.resolve(
                        {
                            success: false, 
                            message: 'HTTP Error: 404 Message: JSON.parse: unexpected end of data at line 1 column 1 of the JSON data/nUnable to retrieve previous entries HTTP Error: 404 Message: JSON.parse: unexpected end of data at line 1 column 1 of the JSON data' 
                        }
                    )
                });
                
                await act(async () => {
                    customRender(<SignUp race={raceScorpionA}/>, model, controller);
                });
                // enter sail number
                const inputSailNumber = screen.getByLabelText(/sail/i);
                await act(async () => {
                    await user.type(inputSailNumber, '1234');
                    await user.keyboard('{Tab}');
                })
                expect(screen.queryByText(/HTTP Error: 404 Message/i)).not.toBeInTheDocument();
            });
            describe('when an entry with that sail number cannot be found for a partucular dinghy class', () => {
                it('silently ignores the response as it is highly likely a specific combination of dinghy class and sail number will not exist expecially if the fleet has a large number of classes', async () => {
                    
                })
            });
        });
        it('clears error message on success', async () => {
            const user = userEvent.setup();
        
            jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementationOnce(() => {return Promise.resolve({success: false, message: 'Oops!'})});
            jest.spyOn(model, 'getDinghyBySailNumberAndDinghyClass').mockImplementationOnce(() => {return Promise.resolve({success: false, message: 'Oops!' })});
            // jest.spyOn(model, 'getCrewsByDinghy').mockImplementation((dinghy) => {
            //     if (dinghy.url === dinghy1234.url) {
            //         return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
            //     }
            //     else if (dinghy.url === dinghy1234Graduate.url) {
            //         return Promise.resolve({success: true, domainObject: dinghyGraduate1234Crews});
            //     }
            // });
            
            await act(async () => {
                customRender(<SignUp race={raceScorpionA}/>, model, controller);
            });
            // enter sail number
            const inputSailNumber = screen.getByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputSailNumber, '1234');
                await user.keyboard('{Tab}');
            });
            expect(await screen.findByText(/oops!/i)).toBeInTheDocument();
            
            await act(async () => {
                await user.type(inputSailNumber, '1234');
                await user.keyboard('{Tab}');
            });            
            // get table that is suppossed to contain details of dinghy class and previous crews
            const previousEntries = within(screen.getByTestId('previous-entries'));
            // check it contains dinghy classes and previous crews for boats with sail number
            expect(screen.queryByText(/oops!/i)).not.toBeInTheDocument();
        });
    });
    
});

describe('when a previous entry is selected', () => {
    it('populates the signup form with details from the previous entry', async () => {
        const user = userEvent.setup();
        jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234, dinghy1234Graduate ]})});
        await act(async () => {
            customRender(<SignUp race={raceHandicapA}/>, model, controller);
        });
        // enter sal number
        const inputSailNumber = screen.getByLabelText(/sail/i);
        await act(async () => {
            await user.type(inputSailNumber, '1234');
            await user.keyboard('{Tab}');
        });
        // get table that is suppossed to contain details of dinghy class and previous crews
        const previousEntries = within(screen.getByTestId('previous-entries'));
        const competitorCell = await previousEntries.findByRole('cell', {name: /chris marshall/i});
        await act(async () => {
            await user.click(competitorCell);
        });
        expect(await screen.findByLabelText(/helm/i)).toHaveValue('Chris Marshall');
        expect(await screen.findByLabelText(/crew/i)).toHaveValue('Jill Myer');
        expect(await screen.findByLabelText(/dinghy class/i)).toHaveValue('Scorpion');
        expect(await screen.findByLabelText(/sail number/i)).toHaveValue('1234');
    });
    it('overwrites any previously entered values removing any value entered for mate if mate in selected record is null', async () => {
        const user = userEvent.setup();

        jest.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234, dinghy1234Graduate, dinghy1234Comet ]})});
        jest.spyOn(model, 'getCrewsByDinghy').mockImplementation((dinghy) => {
            if (dinghy.url === dinghy1234.url) {
                return Promise.resolve({success: true, domainObject: dinghyScorpion1234Crews});
            }
            else if (dinghy.url === dinghy1234Graduate.url) {
                return Promise.resolve({success: true, domainObject: dinghyGraduate1234Crews});
            }
            else if (dinghy.url === dinghy1234Comet.url) {
                return Promise.resolve({success: true, domainObject: dinghyComet1234Crews});
            }
        });

        await act(async () => {
            customRender(<SignUp race={raceHandicapA}/>, model, controller);
        });
        // enter sail number
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        const inputDinghyClass = screen.getByLabelText(/dinghy class/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        await act(async () => {
            await user.selectOptions(inputDinghyClass, 'Scorpion');
            await user.type(inputSailNumber, '7654');
            await user.type(inputHelm, 'J R Hartley');
        });
        // seperate entry of crew name to allow check on dinghy class crew size to complete and setup form
        await act(async () => {
            await user.type(inputCrew, 'Bilbo Baggins');
        });
        // confirm there is a crew value to be replaced
        expect(inputCrew).toHaveValue('Bilbo Baggins');
        const previousEntries = within(screen.getByTestId('previous-entries'));
        const competitorCell = await previousEntries.findByRole('cell', {name: /bob hoskins/i});
        await act(async () => {
            await user.click(competitorCell);
        });
        expect(inputHelm).toHaveValue('Bob Hoskins');
        expect(inputCrew).toHaveValue('');
        expect(inputDinghyClass).toHaveValue('Comet');
        expect(inputSailNumber).toHaveValue('1234');
    });
});

describe('when race is for a fleet with a single class', () => {
    describe('when display has been cleared', () => {
        it('allows a new dinghy to be created', async () => {
            const signupToRaceSpy = jest.spyOn(controller, 'signupToRace').mockImplementation(() => {
                return Promise.resolve({'success': true});
            });
            const createDinghySpy = jest.spyOn(controller, 'createDinghy').mockImplementation((dinghy) => {
                if (!dinghy || !dinghy.sailNumber) {
                    return Promise.resolve({'success': false, 'message': 'A sail number is required for a new dinghy.'});
                }
                if (!dinghy.dinghyClass || !dinghy.dinghyClass.name) {
                    return Promise.resolve({'success': false, 'message': 'A dinghy class is required for a new dinghy.'});
                }
                return Promise.resolve({'success': true});
            });
            const user = userEvent.setup();
            customRender(<SignUp race={raceCometA}/>, model, controller);
            await act(async () => {
                await user.click(screen.getByRole('button', {name: /cancel/i})); // clear form
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            await act(async () => {
                await user.type(inputHelm, 'Jill Myer');
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
    });
});

it('registers an interest in fleet updates for races in session', async () => {
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})}); // ???? works when run in debug or as lone test. When run as part of larger test run order of last 2 calls keeps being revesed so never correct
    // jest.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence([raceScorpionA, raceGraduateA, raceCometA, raceHandicapA], model)})});
    const registerFleetUpdateCallbackSpy = jest.spyOn(model, 'registerFleetUpdateCallback');
    const fleet = {...fleetHandicap, dinghyClasses: [dinghyClassComet, dinghyClassGraduate]};

    await act(async () => {
        customRender(<SignUp race={{...raceHandicapA, fleet: fleet}}/>, model, controller);
    });
    
    expect(registerFleetUpdateCallbackSpy).toHaveBeenNthCalledWith(1, 'http://localhost:8081/dinghyracing/api/fleets/2', expect.any(Function));
});

describe('when the fleet associated with the race is changed', () => {
    it('updates the list of dinghy classes', async () => {
        const fleet = {...fleetHandicap, dinghyClasses: [dinghyClassComet, dinghyClassGraduate, dinghyClassScorpion]};
        jest.spyOn(model, 'getFleet').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': {...fleetHandicap, dinghyClasses: [dinghyClassGraduate, dinghyClassScorpion]}})});

        await act(async () => {
            customRender(<SignUp race={{...raceHandicapA, fleet: fleet}}/>, model, controller);
        });
        const inputDinghyClass = screen.getByLabelText(/class/i);
        let options = within(inputDinghyClass).getAllByRole('option');
        expect(options.length).toBe(4);

        await act(async () => {
            model.handleFleetUpdate({'body': fleet.url});
        });
        options = within(inputDinghyClass).getAllByRole('option');
        expect(options.length).toBe(3);
    });
});