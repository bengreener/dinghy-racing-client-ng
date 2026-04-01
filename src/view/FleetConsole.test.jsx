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

import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FleetConsole from './FleetConsole';
import { httpRootURL, wsRootURL, dinghyClassCometHAL, dinghyClassScorpionHAL, 
    fleetCometHAL, fleetGraduateHAL, fleetHandicapHAL, fleetScorpionHAL } from '../model/__mocks__/test-data';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import Collection from '../model/collection';
import DinghyClass from '../model/dinghy-class';
import Fleet from '../model/fleet';

vi.mock('../model/sylph-model');
vi.mock('../controller/sylph-controller');
vi.mock('../model/clock');

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    await act(async () => {
        render(<FleetConsole model={model} controller={controller} />);
    });
    expect(screen.getByRole('heading', {name: 'Fleets'})).toBeInTheDocument();
    expect(screen.getByLabelText(/fleet name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /create/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
});
it('displays list of dinghy classes', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    await act( async () => {
        render(<FleetConsole model={model} controller={controller} />);
    });
    const dinghyClassesSelect = screen.getByRole('listbox');
    expect(within(dinghyClassesSelect).getByText(/scorpion/i)).toBeInTheDocument();
    expect(within(dinghyClassesSelect).getByText(/comet/i)).toBeInTheDocument();
});
describe('when a dinghy class is selected', () => {
    it('displays the selected dinghy class', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await act( async () => {
            render(<FleetConsole model={model} controller={controller} />);
        });
        const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
        await user.selectOptions(selectDinghyClass, ['Scorpion']);
        expect(selectDinghyClass.selectedOptions.length).toBe(1);
        expect(selectDinghyClass.value).toBe('http://localhost:8081/dinghyracing/api/dinghyClasses/1');
    });
});
describe('when more than one dinghy class is selected', () => {
    it('displays the selected dinghy classes', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await act( async () => {
            render(<FleetConsole model={model} controller={controller} />);
        });
        const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
        await user.selectOptions(selectDinghyClass, ['Scorpion', 'Comet']);
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
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    await act( async () => {
        render(<FleetConsole model={model} controller={controller} />);
    });
    const txtFleetName = await screen.findByLabelText(/fleet name/i);
    await user.type(txtFleetName, 'Scorpion');
    expect(txtFleetName).toHaveValue('Scorpion');
});
describe('when update button clicked', () => {
    it('creates fleet', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const createFleetSpy = vi.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({success: true})});
        await act( async () => {
            render(<FleetConsole model={model} controller={controller} />);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await user.click(btnCreate);
        expect(createFleetSpy).toBeCalledTimes(1);
    });
    describe('when a dinghy class is selected', () => {
        it('creates the fleet with the selected dinghy classes', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const createFleetSpy = vi.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({success: true})});
            await act( async () => {
                render(<FleetConsole model={model} controller={controller} />);
            });
            const inputFleetName = screen.getByLabelText(/name/i)
            const selectDinghyClass = screen.getByLabelText(/dinghy class/i);
            const btnCreate = screen.getByRole('button', {'name': 'Create'});
            await user.type(inputFleetName, 'Scorpion');
            await user.selectOptions(selectDinghyClass, ['Scorpion']);
            await user.click(btnCreate);
            expect(createFleetSpy).toBeCalledWith('Scorpion', [new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)]);
        });
        it('clears the input on success', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await act( async () => {
                render(<FleetConsole model={model} controller={controller} />);
            });
            const btnCreate = screen.getByRole('button', {'name': 'Create'});
            const txtFleetName = await screen.findByLabelText(/fleet name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            await user.type(txtFleetName, 'Scorpion');
            await user.selectOptions(selectDinghyClass, ['Scorpion']);
            await user.click(btnCreate);
            expect(txtFleetName.value).toBe('');
            expect(selectDinghyClass.selectedOptions.length).toBe(0);
        });
    });
    describe('when more than one dinghy class is selected', () => {
        it('displays the selected dinghy classes', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const createFleetSpy = vi.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({success: true})});
            await act( async () => {
                render(<FleetConsole model={model} controller={controller} />);
            });
            const inputFleetName = screen.getByLabelText(/name/i)
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            await user.type(inputFleetName, 'Handicap');
            await user.selectOptions(selectDinghyClass, ['Scorpion', 'Comet']);
            const btnCreate = screen.getByRole('button', {'name': 'Create'});
            await user.click(btnCreate);
            expect(createFleetSpy).toBeCalledWith('Handicap', [new DinghyClass(dinghyClassCometHAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)]);
        });
        it('clears the input on success', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await act( async () => {
                render(<FleetConsole model={model} controller={controller} />);
            });
            const btnCreate = screen.getByRole('button', {'name': 'Create'});
            const txtFleetName = await screen.findByLabelText(/fleet name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            await user.type(txtFleetName, 'Handicap');
            await user.selectOptions(selectDinghyClass, ['Scorpion', 'Comet']);
            await user.click(btnCreate);
            expect(txtFleetName.value).toBe('');
            expect(selectDinghyClass.selectedOptions.length).toBe(0);
        });
    });
    it('calls the controller createFleet with new fleet name and selected dinghy class as parameter', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const createFleetSpy = vi.spyOn(controller, 'createFleet').mockImplementation(async () => {return new Fleet(fleetScorpionHAL, {version: ''}, this)});
        await act( async () => {
            render(<FleetConsole model={model} controller={controller} />);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        const txtFleetName = await screen.findByLabelText(/fleet name/i);
        await user.type(txtFleetName, 'Scorpion');
        await user.click(btnCreate);
        expect(createFleetSpy).toBeCalledWith('Scorpion', []);
    });
    it('displays the failure message on failure', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(controller, 'createFleet').mockImplementation(async () => {throw new Error('That was a bust!')});
        await act( async () => {
            render(<FleetConsole model={model} controller={controller} />);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        const txtFleetName = await screen.findByLabelText(/fleet name/i);
        await user.type(txtFleetName, 'Scorpion');
        await user.click(btnCreate);
        const message = await screen.findByText('That was a bust!');
        expect(message).toBeInTheDocument();
    });
});
describe('when cancel button is clicked', () => {
    it('clears entered data and selections from form', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await act( async () => {
            render(<FleetConsole model={model} controller={controller} />);
        });
        const btnCancel = screen.getByRole('button', {'name': /cancel/i});
        const txtFleetName = await screen.findByLabelText(/fleet name/i);
        const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
        await user.type(txtFleetName, 'Handicap');
        await user.selectOptions(selectDinghyClass, ['Scorpion', 'Comet']);
        await user.click(btnCancel);
        expect(txtFleetName.value).toBe('');
        expect(selectDinghyClass.selectedOptions.length).toBe(0);
    })
});
it('displays existing fleets', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    await act( async () => {
        render(<FleetConsole model={model} controller={controller} />);
    });
    const fleetTable = screen.getByRole('table');
    expect(within(fleetTable).getByText(/scorpion/i)).toBeInTheDocument();
    expect(within(fleetTable).getByText(/handicap/i)).toBeInTheDocument();
});
describe('when a fleet is selected', () => {
    it('displays fleet details for editing', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        await act( async () => {
            render(<FleetConsole model={model} />);
        });
        const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
        const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
        await user.click(fleetCell);
        expect(await screen.findByLabelText(/name/i)).toHaveValue('Scorpion');
        expect(selectDinghyClass.selectedOptions.length).toBe(1);
        expect(selectDinghyClass.value).toBe('http://localhost:8081/dinghyracing/api/dinghyClasses/1');
        expect(screen.getByRole('button', {name: /update/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
    });
    it('clears any error message', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(controller, 'updateFleet').mockImplementation(async () => {throw new Error('Oops!')});
        await act( async () => {
            render(<FleetConsole model={model} controller={controller} />);
        });
        const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
        await user.click(fleetCell);
        const nameInput = await screen.findByLabelText(/name/i);
        const updateButton = screen.getByRole('button', {name: 'Update'});
        await user.clear(nameInput);
        await user.type(nameInput, 'Scorp Pro');
        await user.click(updateButton);
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        await user.click(fleetCell);
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
    describe('when values are changed', () => {
        it('displays new values', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            await act( async () => {
                render(<FleetConsole model={model} />);
            });
            const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
            await user.click(fleetCell);
            const nameInput = await screen.findByLabelText(/name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            await user.clear(nameInput);
            await user.type(nameInput, 'Scorp Pro');
            await user.deselectOptions(selectDinghyClass, ['Scorpion']);
            await user.selectOptions(selectDinghyClass, ['Comet']);
            expect(nameInput).toHaveValue('Scorp Pro');expect(selectDinghyClass.selectedOptions.length).toBe(1);
            expect(selectDinghyClass.value).toBe('http://localhost:8081/dinghyracing/api/dinghyClasses/16');
        });
    });
    describe('when update button clicked', () => {
        it('updates dinghy class details in system with new values provided', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const updateFleetSpy = vi.spyOn(controller, 'updateFleet').mockImplementation(async () => {return new Fleet({...fleetScorpionHAL, name: 'Scorp Pro'}, {version: '"1"'}, model)});
            await act( async () => {
                render(<FleetConsole model={model} controller={controller} />);
            });
            const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
            await user.click(fleetCell);
            const nameInput = await screen.findByLabelText(/name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            const updateButton = screen.getByRole('button', {name: 'Update'});
            await user.clear(nameInput);
            await user.type(nameInput, 'Scorp Pro');
            await user.deselectOptions(selectDinghyClass, ['Scorpion']);
            await user.selectOptions(selectDinghyClass, ['Comet']);
            await user.click(updateButton);
            expect(updateFleetSpy).toBeCalledWith(new Fleet(fleetScorpionHAL, {version: '"0"'}, model), 'Scorp Pro', [new DinghyClass(dinghyClassCometHAL, {version: '"0"'}, model)]);
        });
        describe('when update is successful', () => {
            it('clears input fields', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                await act( async () => {
                    render(<FleetConsole model={model} controller={controller} />);
                });
                const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
                await user.click(fleetCell);
                const nameInput = await screen.findByLabelText(/name/i);
                const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await user.clear(nameInput);
                await user.type(nameInput, 'Scorp Pro');
                await user.deselectOptions(selectDinghyClass, ['Scorpion']);
                await user.selectOptions(selectDinghyClass, ['Comet']);
                await user.click(updateButton);
                expect(nameInput).toHaveValue('');
                expect(selectDinghyClass.selectedOptions.length).toBe(0);
            });
            it('refreshes fleet list', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                const fleetComet = new Fleet(fleetCometHAL, {version: '"0"'}, model);
                const fleetGraduate = new Fleet(fleetGraduateHAL, {version: '"0"'}, model);
                const fleetHandicap = new Fleet(fleetHandicapHAL, {version: '"0"'}, model);
                const fleetScorpion = new Fleet(fleetScorpionHAL, {version: '"0"'}, model);
                const fleetScorpionPro = new Fleet({...fleetScorpionHAL, name: 'Scorp Pro'}, {version: '"0"'}, this);
                vi.spyOn(model, 'getFleets').mockImplementation(async () => {return new Collection([fleetComet, fleetHandicap, fleetGraduate, fleetScorpionPro], {size: 20, totalElements: 4, totalPages: 0, number: 0})})
                    .mockImplementationOnce(async () => {return new Collection([fleetComet, fleetHandicap, fleetGraduate, fleetScorpion], {size: 20, totalElements: 4, totalPages: 0, number: 0})});
                vi.spyOn(controller, 'updateFleet').mockImplementation(async () => {return new Fleet({...fleetScorpionHAL, name: 'Scorp Pro'})});
                await act( async () => {
                    render(<FleetConsole model={model} controller={controller} />);
                });
                const dinghyClassCell = await screen.findByRole('cell', {name: /scorpion/i});
                await user.click(dinghyClassCell);
                const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
                await user.click(fleetCell);
                const nameInput = await screen.findByLabelText(/name/i);
                const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
                await user.clear(nameInput);
                await user.type(nameInput, 'Scorp Pro');
                await user.deselectOptions(selectDinghyClass, ['Scorpion']);
                await user.selectOptions(selectDinghyClass, ['Comet']);
                await act(async () => {
                    model.handleFleetUpdate({'body': fleetScorpion.url});
                });
                expect(await screen.findByRole('cell', {name: /scorp pro/i})).toBeInTheDocument();
            });
        });
        describe('when there is a problem updating dinghy class', () => {
            it('provides a message expalining cause of issue', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(controller, 'updateFleet').mockImplementation(async () => {throw new Error('Oops something went wrong.')});
                await act( async () => {
                    render(<FleetConsole model={model} controller={controller} />);
                });
                const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
                await user.click(fleetCell);
                const nameInput = await screen.findByLabelText(/name/i);
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
                render(<FleetConsole model={model} controller={controller} />);
            });
            const fleetCell = await screen.findByRole('cell', {name: /scorpion/i});
            await user.click(fleetCell);
            const nameInput = await screen.findByLabelText(/name/i);
            const selectDinghyClass = await screen.findByLabelText(/dinghy class/i);
            const cancelButton = screen.getByRole('button', {name: 'Cancel'});
            await user.clear(nameInput);
            await user.type(nameInput, 'Scorp Pro');
            await user.click(cancelButton);
            expect(nameInput).toHaveValue('');
            expect(selectDinghyClass.selectedOptions.length).toBe(0);
        });
    });
});