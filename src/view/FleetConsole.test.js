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
import FleetConsole from './FleetConsole';
import { dinghyClassComet, dinghyClassScorpion, fleets, fleetScorpion, fleetHandicap, httpRootURL } from '../model/__mocks__/test-data';
import { wsRootURL } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { dinghyClasses } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');
jest.mock('../model/domain-classes/clock');

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});

    await act(async () => {
        customRender(<FleetConsole />, model, controller);
    });
    
    expect(screen.getByRole('heading', {name: 'Fleets'})).toBeInTheDocument();
    expect(screen.getByLabelText(/fleet name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /create/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
});

it('displays list of dinghy classes', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});

    await act( async () => {
        customRender(<FleetConsole />, model, controller);
    });

    const dinghyClassesSelect = screen.getByRole('listbox');
    expect(within(dinghyClassesSelect).getByText(/scorpion/i)).toBeInTheDocument();
    expect(within(dinghyClassesSelect).getByText(/comet/i)).toBeInTheDocument();
});

describe('when a dinghy class is selected', () => {
    it('displays the selected dinghy class', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});

        await act( async () => {
            customRender(<FleetConsole />, model, controller);
        });
        const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
        await act(async () => {
            await user.selectOptions(selectDinghyClass, ['Scorpion']);
        });

        expect(selectDinghyClass.selectedOptions.length).toBe(1);
        expect(selectDinghyClass.value).toBe('http://localhost:8081/dinghyracing/api/dinghyClasses/1');
    });
});

describe('when more than one dinghy class is selected', () => {
    it('displays the selected dinghy classes', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});

        await act( async () => {
            customRender(<FleetConsole />, model, controller);
        });
        const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
        await act(async () => {
            await user.selectOptions(selectDinghyClass, ['Scorpion', 'Comet']);
        });
        
        const selected = [];
        for (let i = 0; i < selectDinghyClass.selectedOptions.length; i++) {
            selected.push(selectDinghyClass.selectedOptions[i].value);
        }
        expect(selectDinghyClass.selectedOptions.length).toBe(2);
        expect(selected).toContain('http://localhost:8081/dinghyracing/api/dinghyClasses/1');
        expect(selected).toContain('http://localhost:8081/dinghyracing/api/dinghyClasses/16');
    });
});

it('accepts the name of a fleet', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
    
    await act( async () => {
        customRender(<FleetConsole />, model, controller);
    });
    const txtFleetName = await screen.findByLabelText(/fleet name/i);
    await act(async () => {
        await user.type(txtFleetName, 'Scorpion');
    })
    
    expect(txtFleetName).toHaveValue('Scorpion');
});

describe('when update button clicked', () => {
    it('creates fleet', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
        const createFleetSpy = jest.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({success: true})});
        
        await act( async () => {
            customRender(<FleetConsole />, model, controller);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await act(async () => {
            await user.click(btnCreate);
        });
    
        expect(createFleetSpy).toBeCalledTimes(1);
    });
    describe('when a dinghy class is selected', () => {
        it('creates the fleet with the selected dinghy classes', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
            jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
            const createFleetSpy = jest.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({success: true})});
    
            await act( async () => {
                customRender(<FleetConsole />, model, controller);
            });
            const inputFleetName = screen.getByLabelText(/name/i)
            const selectDinghyClass = screen.getByLabelText(/dinghy class/i);
            const btnCreate = screen.getByRole('button', {'name': 'Create'});
            await act(async () => {
                await user.type(inputFleetName, 'Scorpion');
                await user.selectOptions(selectDinghyClass, ['Scorpion']);
                await user.click(btnCreate);
            });
    
            expect(createFleetSpy).toBeCalledWith({...fleetScorpion, url: ''});
        });
        it('clears the input on success', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
            jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
            jest.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({'success': true, domainObject: fleetScorpion})});
            
            await act( async () => {
                customRender(<FleetConsole />, model, controller);
            });
            const btnCreate = screen.getByRole('button', {'name': 'Create'});
            const txtFleetName = await screen.findByLabelText(/fleet name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            await act(async () => {
                await user.type(txtFleetName, 'Scorpion');
                await user.selectOptions(selectDinghyClass, ['Scorpion']);
                await user.click(btnCreate);
            });

            expect(txtFleetName.value).toBe('');
            expect(selectDinghyClass.selectedOptions.length).toBe(0);
        });
    });
    describe('when more than one dinghy class is selected', () => {
        it('displays the selected dinghy classes', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
            jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
            const createFleetSpy = jest.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({success: true})});
    
            await act( async () => {
                customRender(<FleetConsole />, model, controller);
            });
            const inputFleetName = screen.getByLabelText(/name/i)
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            await act(async () => {
                await user.type(inputFleetName, 'Handicap');
                await user.selectOptions(selectDinghyClass, ['Scorpion', 'Comet']);
            });
            const btnCreate = screen.getByRole('button', {'name': 'Create'});
            await act(async () => {
                await user.click(btnCreate);
            });
    
            expect(createFleetSpy).toBeCalledWith({...fleetHandicap, dinghyClasses: [dinghyClassScorpion, dinghyClassComet], url: ''});
        });
        it('clears the input on success', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
            jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
            jest.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({'success': true, domainObject: fleetScorpion})});
            
            await act( async () => {
                customRender(<FleetConsole />, model, controller);
            });
            const btnCreate = screen.getByRole('button', {'name': 'Create'});
            const txtFleetName = await screen.findByLabelText(/fleet name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            await act(async () => {
                await user.type(txtFleetName, 'Handicap');
                await user.selectOptions(selectDinghyClass, ['Scorpion', 'Comet']);
                await user.click(btnCreate);
            });

            expect(txtFleetName.value).toBe('');
            expect(selectDinghyClass.selectedOptions.length).toBe(0);
        });
    });
    it('calls the controller createDinghyClass with new dinghy class as parameter', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
        const createFleetSpy = jest.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({'success': true})});
        
        await act( async () => {
            customRender(<FleetConsole />, model, controller);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        const txtFleetName = await screen.findByLabelText(/fleet name/i);
        await act(async () => {
            await user.type(txtFleetName, 'Scorpion');
            await user.click(btnCreate);
        });
    
        expect(createFleetSpy).toBeCalledWith({...DinghyRacingModel.fleetTemplate(), name: 'Scorpion'});
    });
    it('displays the failure message on failure', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
        jest.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({'success': false, message: 'That was a bust!'})});
        
        await act( async () => {
            customRender(<FleetConsole />, model, controller);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        const txtFleetName = await screen.findByLabelText(/fleet name/i);
        await act(async () => {
            await user.type(txtFleetName, 'Scorpion');
            await user.click(btnCreate);
        });
        const message = await screen.findByText('That was a bust!');
    
        expect(message).toBeInTheDocument();
    });
});

describe('when cancel button is clicked', () => {
    it('clears entered data and selections from form', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
        jest.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({'success': true, domainObject: fleetScorpion})});
        
        await act( async () => {
            customRender(<FleetConsole />, model, controller);
        });
        const btnCancel = screen.getByRole('button', {'name': /cancel/i});
        const txtFleetName = await screen.findByLabelText(/fleet name/i);
        const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
        await act(async () => {
            await user.type(txtFleetName, 'Handicap');
            await user.selectOptions(selectDinghyClass, ['Scorpion', 'Comet']);
            await user.click(btnCancel);
        });

        expect(txtFleetName.value).toBe('');
        expect(selectDinghyClass.selectedOptions.length).toBe(0);
    })
});

it('displays existing fleets', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});

    await act( async () => {
        customRender(<FleetConsole />, model, controller);
    });

    const fleetTable = screen.getByRole('table');
    expect(within(fleetTable).getByText(/scorpion/i)).toBeInTheDocument();
    expect(within(fleetTable).getByText(/handicap/i)).toBeInTheDocument();
});

describe('when a fleet is selected', () => {
    it('displays fleet details for editing', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
        await act( async () => {
            customRender(<FleetConsole />, model);
        });
        const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
        const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
        await act(async () => {
            await user.click(fleetCell);
        });
        expect(await screen.findByLabelText(/name/i)).toHaveValue('Scorpion');
        expect(selectDinghyClass.selectedOptions.length).toBe(1);
        expect(selectDinghyClass.value).toBe('http://localhost:8081/dinghyracing/api/dinghyClasses/1');
        expect(screen.getByRole('button', {name: /update/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
    });
    it('clears any error message', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
        jest.spyOn(controller, 'updateFleet').mockImplementation(() => {return Promise.resolve({success: false, message: 'Oops!'})});
        await act( async () => {
            customRender(<FleetConsole />, model, controller);
        });
        const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
        await act(async () => {
            await user.click(fleetCell);
        });
        const nameInput = await screen.findByLabelText(/name/i);
        const updateButton = screen.getByRole('button', {name: 'Update'});
        await act(async () => {
            await user.clear(nameInput);
            await user.type(nameInput, 'Scorp Pro');
            await user.click(updateButton);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        await act(async () => {
            await user.click(fleetCell);
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
    describe('when values are changed', () => {
        it('displays new values', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
            jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
            await act( async () => {
                customRender(<FleetConsole />, model);
            });
            const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
            await act(async () => {
                await user.click(fleetCell);
            });
            const nameInput = await screen.findByLabelText(/name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            await act(async () => {
                await user.clear(nameInput);
                await user.type(nameInput, 'Scorp Pro');
                await user.deselectOptions(selectDinghyClass, ['Scorpion']);
                await user.selectOptions(selectDinghyClass, ['Comet']);
            });
            expect(nameInput).toHaveValue('Scorp Pro');expect(selectDinghyClass.selectedOptions.length).toBe(1);
            expect(selectDinghyClass.value).toBe('http://localhost:8081/dinghyracing/api/dinghyClasses/16');
        });
    });
    describe('when update button clicked', () => {
        it('updates dinghy class details in system with new values provided', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
            jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
            const updateFleetSpy = jest.spyOn(controller, 'updateFleet').mockImplementation(() => {return Promise.resolve({success: true, domainObject: {...fleetScorpion, name: 'Scorp Pro', dinghyClasses: [dinghyClassComet]}})});
            await act( async () => {
                customRender(<FleetConsole />, model, controller);
            });
            const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
            await act(async () => {
                await user.click(fleetCell);
            });
            const nameInput = await screen.findByLabelText(/name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            const updateButton = screen.getByRole('button', {name: 'Update'});
            await act(async () => {
                await user.clear(nameInput);
                await user.type(nameInput, 'Scorp Pro');
                await user.deselectOptions(selectDinghyClass, ['Scorpion']);
                await user.selectOptions(selectDinghyClass, ['Comet']);
                await user.click(updateButton);
            });

            expect(updateFleetSpy).toBeCalledWith({...fleetScorpion, name: 'Scorp Pro', dinghyClasses: [dinghyClassComet]});
        });
        describe('when update is successful', () => {
            it('clears input fields', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const controller = new DinghyRacingController(model);
                jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
                jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
                jest.spyOn(controller, 'updateFleet').mockImplementation(() => {return Promise.resolve({success: true, domainObject: {...fleetScorpion, name: 'Scorp Pro', dinghyClasses: [dinghyClassComet]}})});
                await act( async () => {
                    customRender(<FleetConsole />, model, controller);
                });
                const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
                await act(async () => {
                    await user.click(fleetCell);
                });
                const nameInput = await screen.findByLabelText(/name/i);
                const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await act(async () => {
                    await user.clear(nameInput);
                    await user.type(nameInput, 'Scorp Pro');
                    await user.deselectOptions(selectDinghyClass, ['Scorpion']);
                    await user.selectOptions(selectDinghyClass, ['Comet']);
                    await user.click(updateButton);
                });
                expect(nameInput).toHaveValue('');
                expect(selectDinghyClass.selectedOptions.length).toBe(0);
            });
            it('refreshes fleet list', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const controller = new DinghyRacingController(model);
                jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success:true, domainObject: [{...fleets[0], name: 'Scorp Pro', dingyClasses: [dinghyClassComet]}, fleets[1]]})})
                    .mockImplementationOnce(() => {return Promise.resolve({success: true, domainObject: fleets})});
                jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
                jest.spyOn(controller, 'updateFleet').mockImplementation(() => {return Promise.resolve({success: true, domainObject: {...fleetScorpion, name: 'Scorp Pro', dinghyClasses: [dinghyClassComet]}})});
                await act( async () => {
                    customRender(<FleetConsole />, model, controller);
                });
                const dinghyClassCell = await screen.findByRole('cell', {name: /scorpion/i});
                await act(async () => {
                    await user.click(dinghyClassCell);
                });
                const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
                await act(async () => {
                    await user.click(fleetCell);
                });
                const nameInput = await screen.findByLabelText(/name/i);
                const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
                await act(async () => {
                    await user.clear(nameInput);
                    await user.type(nameInput, 'Scorp Pro');
                    await user.deselectOptions(selectDinghyClass, ['Scorpion']);
                    await user.selectOptions(selectDinghyClass, ['Comet']);
                });
                await act(async () => {
                    model.handleFleetUpdate({'body': fleets[0].url});
                });
    
                expect(await screen.findByRole('cell', {name: /scorp pro/i})).toBeInTheDocument();
            });
        });
        describe('when there is a problem updating dinghy class', () => {
            it('provides a message expalining cause of issue', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const controller = new DinghyRacingController(model);
                jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
                jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
                jest.spyOn(controller, 'updateFleet').mockImplementation(() => {return Promise.resolve({success: false, message: 'Oops something went wrong.'})});
                await act( async () => {
                    customRender(<FleetConsole />, model, controller);
                });
                const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
                await act(async () => {
                    await user.click(fleetCell);
                });
                const nameInput = await screen.findByLabelText(/name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await act(async () => {
                    await user.clear(nameInput);
                    await user.type(nameInput, 'Scorp Pro');
                    await user.click(updateButton);
                });

                expect(await screen.findByText('Oops something went wrong.')).toBeInTheDocument();
            });
        })
    });
    describe('when cancelled', () => {
        it('clears input fields', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getFleets').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleets})});
            jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
            await act( async () => {
                customRender(<FleetConsole />, model, controller);
            });
            const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
            await act(async () => {
                await user.click(fleetCell);
            });
            const nameInput = await screen.findByLabelText(/name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            const cancelButton = screen.getByRole('button', {name: 'Cancel'});
            await act(async () => {
                await user.clear(nameInput);
                await user.type(nameInput, 'Scorp Pro');
                await user.click(cancelButton);
            });
            expect(nameInput).toHaveValue('');
            expect(selectDinghyClass.selectedOptions.length).toBe(0);
        });
    });
})