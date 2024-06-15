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
import DinghyClassConsole from './DinghyClassConsole';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { httpRootURL, wsRootURL, dinghyClasses, dinghyClassScorpion } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    await act( async () => {
        customRender(<DinghyClassConsole />, model);
    });
});

it('accepts the name of a dinghy class', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    
    await act( async () => {
        customRender(<DinghyClassConsole />, model);
    });
    const txtClassName = await screen.findByLabelText('Class Name');
    await act(async () => {
        await user.type(txtClassName, 'Scorpion');
    })
    
    expect(txtClassName).toHaveValue('Scorpion');
});

it('accepts the crew size', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    
    await act( async () => {
        customRender(<DinghyClassConsole />, model);
    });
    const crewSizeInput = await screen.findByLabelText('Crew Size');
    await act(async () => {
        await user.clear(crewSizeInput);
        await user.type(crewSizeInput, '2');
    });
    
    expect(crewSizeInput).toHaveValue(2);
});

it('accepts the portsmouth number', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});

    await act( async () => {
        customRender(<DinghyClassConsole />, model);
    });
    const portsmouthNumberInput = await screen.findByLabelText('Portsmouth Number');
    await act(async () => {
        await user.clear(portsmouthNumberInput);
        await user.type(portsmouthNumberInput, '999');
    });

    expect(portsmouthNumberInput).toHaveValue(999);
});

it('calls the controller createDinghyClass method', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    const createDinghyClassSpy = jest.spyOn(controller, 'createDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true})});
    
    await act( async () => {
        customRender(<DinghyClassConsole />, model, controller);
    });
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    await act(async () => {
        await user.click(btnCreate);
    });

    expect(createDinghyClassSpy).toBeCalledTimes(1);
});

it('calls the controller createDinghyClass with new dinghy class as parameter', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    const createDinghyClassSpy = jest.spyOn(controller, 'createDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true})});
    
    await act( async () => {
        customRender(<DinghyClassConsole />, model, controller);
    });
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    const txtClassName = screen.getByLabelText('Class Name');
    const crewSizeInput = await screen.findByLabelText('Crew Size');
    const portsmouthNumberInput = await screen.findByLabelText('Portsmouth Number');
    await act(async () => {
        await user.type(txtClassName, 'Scorpion');
        await user.clear(crewSizeInput);
        await user.type(crewSizeInput, '2');
        await user.clear(portsmouthNumberInput);
        await user.type(portsmouthNumberInput, '999');
        await user.click(btnCreate);
    });

    expect(createDinghyClassSpy).toBeCalledWith({...DinghyRacingModel.dinghyClassTemplate(), name: 'Scorpion', crewSize: 2, portsmouthNumber: 999});
});

describe('when creating a new dinghy class', () => {
    it('clears the input on success', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        jest.spyOn(controller, 'createDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, domainObject: dinghyClassScorpion})});
        
        await act( async () => {
            customRender(<DinghyClassConsole />, model, controller);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        const txtClassName = screen.getByLabelText('Class Name');
        const crewSizeInput = await screen.findByLabelText('Crew Size');
        const portsmouthNumberInput = await screen.findByLabelText('Portsmouth Number');
        await act(async () => {
            await user.type(txtClassName, 'Scorpion');
            await user.clear(crewSizeInput);
            await user.type(crewSizeInput, '2');
            await user.clear(portsmouthNumberInput);
            await user.type(portsmouthNumberInput, '999');
            await user.click(btnCreate);
        });
    
        expect(txtClassName.value).toBe('');
        expect(crewSizeInput.value).toBe('1');
        expect(portsmouthNumberInput.value).toBe('1000');
    })
    it('displays the failure message on failure', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        jest.spyOn(controller, 'createDinghyClass').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'That was a bust!'})});
        
        await act( async () => {
            customRender(<DinghyClassConsole />, model, controller);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await act(async () => {
            await user.click(btnCreate);
        });
        const message = await screen.findByText('That was a bust!');
    
        expect(message).toBeInTheDocument();
    })
})
