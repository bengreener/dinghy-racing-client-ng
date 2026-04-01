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

import { act, render, screen } from '@testing-library/react';
// import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import DinghyClassConsole from './DinghyClassConsole';
import Collection from '../model/collection';
import DinghyClass from '../model/dinghy-class';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import { httpRootURL, wsRootURL, dinghyClasses, dinghyClassScorpion, dinghyClassCometHAL, dinghyClassGraduateHAL, dinghyClassScorpionHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../controller/sylph-controller');
vi.mock('../model/clock');

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    // vi.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    await act( async () => {
        render(<DinghyClassConsole model={model} />)
    });
    expect(screen.getByLabelText(/Class Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Crew Size/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Portsmouth Number/)).toBeInTheDocument();
    expect(screen.getByLabelText(/External Name/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
});
it('accepts the name of a dinghy class', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    vi.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    await act( async () => {
        render(<DinghyClassConsole model={model} />)
    });
    const txtClassName = await screen.findByLabelText('Class Name');
    await user.type(txtClassName, 'Scorpion');
    expect(txtClassName).toHaveValue('Scorpion');
});
it('accepts the crew size', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    vi.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    await act( async () => {
        render(<DinghyClassConsole model={model} />)
    });
    const crewSizeInput = await screen.findByLabelText('Crew Size');
    await user.clear(crewSizeInput);
    await user.type(crewSizeInput, '2');
    expect(crewSizeInput).toHaveValue(2);
});
it('accepts the portsmouth number', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    vi.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    await act( async () => {
        render(<DinghyClassConsole model={model} />)
    });
    const portsmouthNumberInput = await screen.findByLabelText('Portsmouth Number');
    await user.clear(portsmouthNumberInput);
    await user.type(portsmouthNumberInput, '999');
    expect(portsmouthNumberInput).toHaveValue(999);
});
it('accepts the external name', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    vi.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    await act( async () => {
        render(<DinghyClassConsole model={model} />)
    });
    const externalNameInput = await screen.findByLabelText('External Name');
    await user.type(externalNameInput, 'SCORPION');
    expect(externalNameInput).toHaveValue('SCORPION');
});
describe('when creating a new dinghy class', () => {
    it('calls the controller createDinghyClass with correct parameters', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        const createDinghyClassSpy = vi.spyOn(controller, 'createDinghyClass').mockImplementation(async () => {return new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)});
        await act( async () => {
            render(<DinghyClassConsole model={model} controller={controller}/>)
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        const txtClassName = screen.getByLabelText('Class Name');
        const crewSizeInput = await screen.findByLabelText('Crew Size');
        const portsmouthNumberInput = await screen.findByLabelText('Portsmouth Number');
        const externalNameInput = await screen.findByLabelText('External Name');
        await user.type(txtClassName, 'Scorpion');
        await user.clear(crewSizeInput);
        await user.type(crewSizeInput, '2');
        await user.clear(portsmouthNumberInput);
        await user.type(portsmouthNumberInput, '999');
        await user.type(externalNameInput, 'SCORPION');
        await user.click(btnCreate);
        expect(createDinghyClassSpy).toBeCalledWith('Scorpion', 2, 999, 'SCORPION');
    });
    it('clears the input on success', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        vi.spyOn(controller, 'createDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, domainObject: dinghyClassScorpion})});
        await act( async () => {
            render(<DinghyClassConsole model={model} controller={controller}/>)
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        const txtClassName = screen.getByLabelText('Class Name');
        const crewSizeInput = await screen.findByLabelText('Crew Size');
        const portsmouthNumberInput = await screen.findByLabelText('Portsmouth Number');
        const externalNameInput = await screen.findByLabelText('External Name');
        await user.type(txtClassName, 'Scorpion');
        await user.clear(crewSizeInput);
        await user.type(crewSizeInput, '2');
        await user.clear(portsmouthNumberInput);
        await user.type(portsmouthNumberInput, '999');
        await user.type(externalNameInput, 'SCORPION');
        await user.click(btnCreate);
        expect(txtClassName.value).toBe('');
        expect(crewSizeInput.value).toBe('1');
        expect(portsmouthNumberInput.value).toBe('1000');
        expect(externalNameInput.value).toBe('');
    });
    it('displays the failure message on failure', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        vi.spyOn(controller, 'createDinghyClass').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'That was a bust!'})});
        await act( async () => {
            render(<DinghyClassConsole model={model} controller={controller}/>)
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await user.click(btnCreate);
        const message = await screen.findByText('That was a bust!');
        expect(message).toBeInTheDocument();
    });
});
describe('when there are dinghy classes', () => {
    it('displays list of dinghy classes', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        // vi.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClasses})});
        // act(() => {
            render(<DinghyClassConsole model={model} />)
        // });
        expect(await screen.findByRole('cell', {name: /Scorpion/})).toBeInTheDocument();
        expect((await screen.findAllByRole('cell', {name: /2/i}))[0]).toBeInTheDocument();
        expect(await screen.findByRole('cell', {name: /1043/i})).toBeInTheDocument();
        expect(await screen.findByRole('cell', {name: /SCORPION/})).toBeInTheDocument();
        expect(await screen.findByRole('cell', {name: /graduate/i})).toBeInTheDocument();
        expect(await screen.findByRole('cell', {name: /comet/i})).toBeInTheDocument();
    });
    describe('when successfully retrieves dinghy classes', () => {
        it('clears any error message', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getDinghyClasses').mockImplementationOnce(async () => {throw new Error('Oops!')});
            
            let renderResult;
            await act( async () => {
                renderResult = render(<DinghyClassConsole model={model} />);
            });
            expect(await screen.findByText(/oops/i)).toBeInTheDocument();
            
            await act( async () => {
                renderResult.rerender(<DinghyClassConsole model={model} />);
            });
            expect(screen.queryByText('Oops!')).not.toBeInTheDocument();
        });
    });
});
describe('when a dinghy class is selected', () => {
    it('displays dinghy class details for editing', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        await act( async () => {
            render(<DinghyClassConsole model={model} />)
        });
        const dinghyClassCell = await screen.findByRole('cell', {name: /Scorpion/});
        await act(async () => {
            await user.click(dinghyClassCell);
        });
        expect(await screen.findByLabelText(/class name/i)).toHaveValue('Scorpion');
        expect(await screen.findByLabelText(/crew size/i)).toHaveValue(2);
        expect(await screen.findByLabelText(/portsmouth number/i)).toHaveValue(1043);
        expect(await screen.findByLabelText(/external name/i)).toHaveValue('SCORPION');
        expect(screen.getByRole('button', {name: /update/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
    });
    it('clears any error message', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(controller, 'updateDinghyClass').mockImplementation(async () => {throw Error('Oops!')});
        await act( async () => {
            render(<DinghyClassConsole model={model} controller={controller}/>)
        });
        const dinghyClassCell = await screen.findByRole('cell', {name: /Scorpion/});
        await user.click(dinghyClassCell);
        const nameInput = await screen.findByLabelText(/class name/i);
        const updateButton = screen.getByRole('button', {name: 'Update'});
        await user.clear(nameInput);
        await user.type(nameInput, 'Scorp Pro');
        await user.click(updateButton);
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        await user.click(dinghyClassCell);
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
    describe('when values are changed', () => {
        it('displays new values', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            await act( async () => {
                render(<DinghyClassConsole model={model} />)
            });
            const dinghyClassCell = await screen.findByRole('cell', {name: /Scorpion/});
            await user.click(dinghyClassCell);
            const nameInput = await screen.findByLabelText(/class name/i);
            const crewSizeInput = await screen.findByLabelText(/crew size/i);
            const portsmouthNumberInput = await screen.findByLabelText(/portsmouth number/i);
            const externalNameInput = await screen.findByLabelText(/external name/i);
            await user.clear(nameInput);
            await user.type(nameInput, 'Scorp Pro');
            await user.clear(crewSizeInput);
            await user.type(crewSizeInput, '3');
            await user.clear(portsmouthNumberInput);
            await user.type(portsmouthNumberInput, '999');
            await user.clear(externalNameInput);
            await user.type(externalNameInput, 'SCORPION PRO');
            expect(nameInput).toHaveValue('Scorp Pro');
            expect(crewSizeInput).toHaveValue(3);
            expect(portsmouthNumberInput).toHaveValue(999);
            expect(externalNameInput).toHaveValue('SCORPION PRO');
        });
    });
    describe('when update button clicked', () => {
        it('updates dinghy class details in system with new values provided', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const updateDinghyClassSpy = vi.spyOn(controller, 'updateDinghyClass').mockImplementation(async () => {return new DinghyClass({...dinghyClassScorpionHAL, name: 'Scorp Pro', crewSize: 3, portsmouthNumber: 999, externalName: 'SCORPION PRO'}, {version: '"1"'}, model)});
            await act( async () => {
                render(<DinghyClassConsole model={model} controller={controller}/>)
            });
            const dinghyClassCell = await screen.findByRole('cell', {name: /Scorpion/});
            await user.click(dinghyClassCell);
            const nameInput = await screen.findByLabelText(/class name/i);
            const crewSizeInput = await screen.findByLabelText(/crew size/i);
            const portsmouthNumberInput = await screen.findByLabelText(/portsmouth number/i);
            const externalNameInput = await screen.findByLabelText(/external name/i);
            const updateButton = screen.getByRole('button', {name: 'Update'});
            await user.clear(nameInput);
            await user.type(nameInput, 'Scorp Pro');
            await user.clear(crewSizeInput);
            await user.type(crewSizeInput, '3');
            await user.clear(portsmouthNumberInput);
            await user.type(portsmouthNumberInput, '999');
            await user.clear(externalNameInput);
            await user.type(externalNameInput, 'SCORPION PRO');
            await user.click(updateButton);
            expect(updateDinghyClassSpy).toBeCalledWith(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model), 'Scorp Pro', 3, 999, 'SCORPION PRO'
        );
        });
        describe('when update is successful', () => {
            it('clears input fields', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(controller, 'updateDinghyClass').mockImplementation(() => {return Promise.resolve({success: true, domainObject: {...dinghyClassScorpion, name: 'Scorp Pro', crewSize: 3, portsmouthNumber: 999}})});
                await act( async () => {
                    render(<DinghyClassConsole model={model} controller={controller}/>)
                });
                const dinghyClassCell = await screen.findByRole('cell', {name: /Scorpion/});
                await user.click(dinghyClassCell);
                const nameInput = await screen.findByLabelText(/class name/i);
                const crewSizeInput = await screen.findByLabelText(/crew size/i);
                const portsmouthNumberInput = await screen.findByLabelText(/portsmouth number/i);
                const externalNameInput = await screen.findByLabelText(/external name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await user.clear(nameInput);
                await user.type(nameInput, 'Scorp Pro');
                await user.clear(crewSizeInput);
                await user.type(crewSizeInput, '3');
                await user.clear(portsmouthNumberInput);
                await user.type(portsmouthNumberInput, '999');
                await user.clear(externalNameInput);
                await user.type(externalNameInput, 'SCORPION PRO');
                await user.click(updateButton);
                expect(nameInput).toHaveValue('');
                expect(crewSizeInput).toHaveValue(1);
                expect(portsmouthNumberInput).toHaveValue(1000);
                expect(externalNameInput).toHaveValue('');
                expect(screen.getByRole('button', {name: /create/i})).toBeInTheDocument();
            });
            it('refreshes dinghy class list', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const dinghyClassComet = new DinghyClass(dinghyClassCometHAL, {version: '"0"'}, model);
                const dinghyClassGraduate = new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model);
                const dinghyClassScorpion = new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model);
                const dinghyClassScorpionPro = new DinghyClass({...dinghyClassScorpionHAL, name: 'Scorp Pro', crewSize: 3, portsmouthNumber: 999, externalName: 'SCORPION PRO'}, {version: '"1"'}, model);
                let dinghyClasses = [dinghyClassComet, dinghyClassGraduate, dinghyClassScorpion];                
                const controller = new SylphController(model);
                vi.spyOn(model, 'getDinghyClasses').mockImplementation(async () => {return new Collection(dinghyClasses, {size: 20, totalElements: 3, totalPages: 0, number: 0})});
                vi.spyOn(controller, 'updateDinghyClass').mockImplementation(async () => {return new DinghyClass({...dinghyClassScorpion, name: 'Scorp Pro', crewSize: 3, portsmouthNumber: 999, externalName: 'SCORPION PRO'}, {version: '"1"'}, model)});
                await act(async () => {
                    render(<DinghyClassConsole model={model} controller={controller}/>)
                });
                const dinghyClassCell = await screen.findByRole('cell', {name: /Scorpion/});
                await user.click(dinghyClassCell);
                const nameInput = await screen.findByLabelText(/class name/i);
                const crewSizeInput = await screen.findByLabelText(/crew size/i);
                const portsmouthNumberInput = await screen.findByLabelText(/portsmouth number/i);
                const externalNameInput = await screen.findByLabelText(/external name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await user.clear(nameInput);
                await user.type(nameInput, 'Scorp Pro');
                await user.clear(crewSizeInput);
                await user.type(crewSizeInput, '3');
                await user.clear(portsmouthNumberInput);
                await user.type(portsmouthNumberInput, '999');
                await user.clear(externalNameInput);
                await user.type(externalNameInput, 'SCORPION PRO');
                await user.click(updateButton);
                dinghyClasses = [dinghyClassComet, dinghyClassGraduate, dinghyClassScorpionPro];
                await act(async () => {
                    model.handleDinghyClassUpdate({'body': dinghyClasses[0].url});    
                });                
                expect(await screen.findByRole('cell', {name: /scorp pro/i})).toBeInTheDocument();
                expect(await screen.findByRole('cell', {name: /3/i})).toBeInTheDocument();
                expect(await screen.findByRole('cell', {name: /999/i})).toBeInTheDocument();
                expect(await screen.findByRole('cell', {name: /SCORPION PRO/i})).toBeInTheDocument();
            });
        });
        describe('when there is a problem updating dinghy class', () => {
            it('provides a message expalining cause of issue', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(controller, 'updateDinghyClass').mockImplementation(async () => {throw new Error('Oops something went wrong.')});
                await act( async () => {
                    render(<DinghyClassConsole model={model} controller={controller}/>)
                });
                const dinghyClassCell = await screen.findByRole('cell', {name: /Scorpion/});
                await user.click(dinghyClassCell);
                const nameInput = await screen.findByLabelText(/class name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await user.clear(nameInput);
                await user.type(nameInput, 'Scorp Pro');
                await user.click(updateButton);
                expect(await screen.findByText('Oops something went wrong.')).toBeInTheDocument();
            });
        });
    });
    describe('when cancelled', () => {
        it('clears input fields', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await act( async () => {
                render(<DinghyClassConsole model={model} controller={controller}/>,)
            });
            const dinghyClassCell = await screen.findByRole('cell', {name: /Scorpion/});
            await user.click(dinghyClassCell);
            const nameInput = await screen.findByLabelText(/class name/i);
            const crewSizeInput = await screen.findByLabelText(/crew size/i);
            const portsmouthNumberInput = await screen.findByLabelText(/portsmouth number/i);
            const externalNameInput = await screen.findByLabelText(/external name/i);
            const cancelButton = screen.getByRole('button', {name: 'Cancel'});
            await user.clear(nameInput);
            await user.type(nameInput, 'Scorp Pro');
            await user.clear(crewSizeInput);
            await user.type(crewSizeInput, '3');
            await user.clear(portsmouthNumberInput);
            await user.type(portsmouthNumberInput, '999');
            await user.clear(externalNameInput);
            await user.type(externalNameInput, 'SCORPION PRO');
            await user.click(cancelButton);
            expect(nameInput).toHaveValue('');
            expect(crewSizeInput).toHaveValue(1);
            expect(portsmouthNumberInput).toHaveValue(1000);
            expect(externalNameInput).toHaveValue('');
            expect(screen.getByRole('button', {name: /create/i})).toBeInTheDocument();
        });
    });
});
describe('when a new dinghy class is created', () => {
    it('updates the list of dinghy classes', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const dinghyClassComet = new DinghyClass(dinghyClassCometHAL, {version: '"0"'}, model);
        const dinghyClassGraduate = new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model);
        const dinghyClassScorpion = new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model);
        const dinghyClassAvalon = new DinghyClass({name: 'Avalon', crewSize: 5, portsmouthNumber: 856, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/99'}}}, {version: '"1"'}, model);
        let dinghyClasses = [dinghyClassComet, dinghyClassGraduate, dinghyClassScorpion];    
        vi.spyOn(model, 'getDinghyClasses').mockImplementation(async () => {return new Collection(dinghyClasses, {size: 20, totalElements: 3, totalPages: 0, number: 0})});
        await act( async () => {
            render(<DinghyClassConsole model={model} />)
        });
        dinghyClasses = [dinghyClassComet, dinghyClassGraduate, dinghyClassScorpion, dinghyClassAvalon];
        await act(async () => {
            model.handleDinghyClassCreation('http://localhost:8081/dinghyracing/api/dinghyClasses/99');
        });
        expect(await screen.findByRole('cell', {name: /avalon/i})).toBeInTheDocument();
    });
});