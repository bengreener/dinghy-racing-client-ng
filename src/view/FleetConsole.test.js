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

import { act, screen } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import FleetConsole from './FleetConsole';
import { httpRootURL } from '../model/__mocks__/test-data';
import { wsRootURL } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';

it('renders', () => {
    customRender(<FleetConsole />);
    expect(screen.getByRole('heading', {name: 'Fleets'})).toBeInTheDocument();
    expect(screen.getByLabelText(/fleet name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /create/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
});

it('accepts the name of a fleet', async () => {
    const user = userEvent.setup();
    
    await act( async () => {
        customRender(<FleetConsole />);
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
        const createFleetSpy = jest.spyOn(controller, 'createFleet').mockImplementation(() => {return Promise.resolve({'success': true})});
        
        await act( async () => {
            customRender(<FleetConsole />, model, controller);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await act(async () => {
            await user.click(btnCreate);
        });
    
        expect(createFleetSpy).toBeCalledTimes(1);
    });
    it('calls the controller createDinghyClass with new dinghy class as parameter', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
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
});