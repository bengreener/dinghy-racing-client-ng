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

import { screen, render, prettyDOM, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../test-utilities/custom-renders';
import { act } from 'react-dom/test-utils';
import CreateRace from './CreateRace';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { httpRootURL, wsRootURL, dinghyClasses, dinghyClassScorpion, dinghyClassesByNameAsc } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClasses})});
    await act(async () => {
        customRender(<CreateRace />, model);
    });
    
    const inputName = screen.getByLabelText(/name/i);
    const inputTime = screen.getByLabelText(/time/i);
    const inputDuration = screen.getByLabelText(/duration/i);
    const selectRaceClass = screen.getByLabelText(/class/i);
    expect(inputName).toBeInTheDocument();
    expect(inputTime).toBeInTheDocument();
    expect(inputDuration).toBeInTheDocument();
    expect(selectRaceClass).toBeInTheDocument();
})

it('displays the available dinghyClasses and handicap option', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassesByNameAsc})});
    await act(async () => {
        customRender(<CreateRace />, model);
    });
    
    const options = await screen.findAllByRole('option');
    const optionsAvailable = options.map(element => {return {'text': element.text, 'value': element.value}});
    expect(optionsAvailable).toEqual([{'text': '', 'value': ''}, {'text': 'Comet', 'value': 'Comet'}, {'text': 'Graduate', 'value': 'Graduate'}, {'text': 'Scorpion', 'value': 'Scorpion'}]);
})

it('provides a default option of 5 for the number of laps for the race', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassesByNameAsc})});
    await act(async () => {
        customRender(<CreateRace />, model);
    });
    
    const inputLaps = screen.getByLabelText(/laps/i);
    expect(inputLaps).toHaveValue(5);
})

it('accepts the name for a race', async () => {
    const user = userEvent.setup();
    
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
    await act(async () => {
        customRender(<CreateRace />, model);
    });
    const txtRaceName = await screen.findByLabelText('Race Name');
    await act(async () => {
        await user.type(txtRaceName, 'Graduate Helms');
    });
    
    expect(txtRaceName).toHaveValue('Graduate Helms');
});

it('accepts the time for the race', async () => {
    const user = userEvent.setup();

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
    await act(async () => {
        customRender(<CreateRace />, model);
    });
    const inputTime = screen.getByLabelText(/time/i);
    await act(async () => {
        await user.clear(inputTime); // clear input to avoid errors when typing in new value
        await user.type(inputTime, '2020-05-12T12:30');
    });
    expect(inputTime).toHaveValue('2020-05-12T12:30');
})

it('accepts the class for the race', async () => {
    const user = userEvent.setup();

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassesByNameAsc})});
    await act(async () => {
        customRender(<CreateRace />, model);
    });
    const selectRaceClass = screen.getByLabelText('Race Class');
    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(selectRaceClass, 'Scorpion');
    });
    
    expect(selectRaceClass).toHaveValue('Scorpion');
})

it('accepts the duration of the race', async () => {
    const user = userEvent.setup();

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassesByNameAsc})});
    await act(async () => {
        customRender(<CreateRace />, model);
    });
    const inputDuration = screen.getByLabelText(/duration/i);
    await act(async () => {
        await user.clear(inputDuration);
        await user.type(inputDuration, '65');
    });
    
    expect(inputDuration).toHaveValue(65);
})

it('accepts the number of laps for the race', async () => {
    const user = userEvent.setup();

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassesByNameAsc})});
    await act(async () => {
        customRender(<CreateRace />, model);
    });
    const inputLaps = screen.getByLabelText(/laps/i);
    await act(async () => {
        await user.clear(inputLaps);
        await user.type(inputLaps, '10');
    });
    
    expect(inputLaps).toHaveValue(10);
});

it('calls the function passed in to onCreate prop', async () => {
    const user = userEvent.setup();
    const fnOnCreate = jest.fn((race) => {return Promise.resolve({'success': true})});
    
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassesByNameAsc})});
    await act(async () => {
        customRender(<CreateRace onCreate={fnOnCreate} />, model);
    });
    
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    await act(async () => {
        await user.click(btnCreate);
    });

    expect(fnOnCreate).toBeCalledTimes(1);
});

it('calls the function passed in to onCreate prop with new race as parameter', async () => {
    
    const user = userEvent.setup();
    const fnOnCreate = jest.fn((race) => {return Promise.resolve({'success': true})});
    
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassesByNameAsc})});
    await act(async () => {
        customRender(<CreateRace onCreate={fnOnCreate} />, model);
    });
    const inputName = screen.getByLabelText(/name/i);
    const inputTime = screen.getByLabelText(/time/i);
    const inputDuration = screen.getByLabelText(/duration/i);
    const inputLaps = screen.getByLabelText(/laps/i);
    const selectRaceClass = screen.getByLabelText(/class/i);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    await screen.findAllByRole('option'); // wait for dinghy class options to be built
    await act(async () => {
        await user.type(inputName, 'Scorpion A');
        await user.clear(inputTime); // clear input to avoid errors when typing in new value
        await user.type(inputTime, '2020-05-12T12:30');
        await user.clear(inputDuration);
        await user.type(inputDuration, '65');
        await user.clear(inputLaps);
        await user.type(inputLaps, '7');
        await user.selectOptions(selectRaceClass, 'Scorpion');
        await user.click(btnCreate);
    });

    expect(fnOnCreate).toBeCalledWith({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2020-05-12T12:30'), 'dinghyClass': dinghyClassScorpion, 'plannedLaps': 7, 'duration': 3900000});
});

describe('when creating a new race', () => {
    it('clears the input on success', async () => {
        const user = userEvent.setup();
        const fnOnCreate = jest.fn(() => {return Promise.resolve({'success': true})});
        
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassesByNameAsc})});
        jest.spyOn(DinghyRacingModel, 'dinghyClassTemplate').mockImplementation(() => {return Promise.resolve({'name': '', 'url': ''})});
        jest.spyOn(DinghyRacingModel, 'raceTemplate').mockImplementation(() => {return {'name': '', 'plannedStartTime': null, 'dinghyClass': DinghyRacingModel.dinghyClassTemplate(), 'url': ''}});
        await act(async () => {
            customRender(<CreateRace onCreate={fnOnCreate} />, model);
        });
        const inputName = screen.getByLabelText(/name/i);
        const inputTime = screen.getByLabelText(/time/i);
        const inputDuration = screen.getByLabelText(/duration/i);
        const inputDinghyClass = screen.getByLabelText(/class/i);
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await act(async () => {
            await user.type(inputName, 'Scorpion A');
            await user.type(inputTime, '2020-05-12T12:30');
            await user.clear(inputDuration);
            await user.type(inputDuration, '65');
            await user.type(inputDinghyClass, 'Scorpion');
            await user.click(btnCreate);
        });
    
        expect(inputName).toHaveValue('');
        expect(inputTime).toHaveValue(new Date(Date.now() + 60 * new Date().getTimezoneOffset() * -1000).toISOString().substring(0, 16));
        expect(inputDuration).toHaveValue(45);
        expect(inputDinghyClass).toHaveValue('');
    })
    it('displays the failure message on failure', async () => {
        const user = userEvent.setup();
        const fnOnCreate = jest.fn(() => {return Promise.resolve({'success': false, 'message': 'That was a bust!'})});
        
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassesByNameAsc})});
        await act(async () => {
            customRender(<CreateRace onCreate={fnOnCreate} />, model);
        });
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await act(async () => {
            await user.click(btnCreate);
        });
        const message = await screen.findByText('That was a bust!');
    
        expect(message).toBeInTheDocument();
    })
})