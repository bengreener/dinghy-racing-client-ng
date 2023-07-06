import { screen, render, prettyDOM, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../test-utilities/custom-renders';
import { act } from 'react-dom/test-utils';
import CreateRace from './CreateRace';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { rootURL, dinghyClasses } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');

it('renders', () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
    customRender(<CreateRace />, model);
    const inputName = screen.getByLabelText(/name/i);
    const inputTime = screen.getByLabelText(/time/i);
    const inputDinghyClass = screen.getByLabelText(/class/i);
    expect(inputName).toBeInTheDocument();
    expect(inputTime).toBeInTheDocument();
    expect(inputDinghyClass).toBeInTheDocument();
})

it('accepts the name for a race', async () => {
    const user = userEvent.setup();
    
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
    customRender(<CreateRace />, model);
    const txtRaceName = await screen.findByLabelText('Race Name');
    await act(async () => {
        await user.type(txtRaceName, 'Graduate Helms');
    });
    
    expect(txtRaceName).toHaveValue('Graduate Helms');
});

it('accepts the time for the race', async () => {
    const user = userEvent.setup();

    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
    customRender(<CreateRace />, model);
    const inputTime = screen.getByLabelText(/time/i);
    await act(async () => {
        await user.clear(inputTime); // clear input to avoid errors when typing in new value
        await user.type(inputTime, '2020-05-12T12:30');
    });
    expect(inputTime).toHaveValue('2020-05-12T12:30');
})

it('accepts the class for the race', async () => {
    const user = userEvent.setup();

    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
    customRender(<CreateRace />, model);
    const txtRaceClass = await screen.findByLabelText('Race Class');
    await act(async () => {
        await user.type(txtRaceClass, 'Comet');
    });
    
    expect(txtRaceClass).toHaveValue('Comet');
})

it('calls the function passed in to onCreate prop', async () => {
    const user = userEvent.setup();
    const fnOnCreate = jest.fn((race) => {return {'success': true}});
    
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
    customRender(<CreateRace onCreate={fnOnCreate} />, model);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    await act(async () => {
        await user.click(btnCreate);
    });

    expect(fnOnCreate).toBeCalledTimes(1);
});

it('calls the function passed in to onCreate prop with new race as parameter', async () => {
    const user = userEvent.setup();
    const fnOnCreate = jest.fn((race) => {return {'success': true}});
    
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
    customRender(<CreateRace onCreate={fnOnCreate} />, model);
    const inputName = screen.getByLabelText(/name/i);
    const inputTime = screen.getByLabelText(/time/i);
    const inputDinghyClass = screen.getByLabelText(/class/i);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    await act(async () => {
        await user.type(inputName, 'Scorpion A');
        await user.clear(inputTime); // clear input to avoid errors when typing in new value
        await user.type(inputTime, '2020-05-12T12:30');
        await user.type(inputDinghyClass, 'Scorpion');
        await user.click(btnCreate);
    });

    expect(fnOnCreate).toBeCalledWith({'name': 'Scorpion A', 'time': new Date('2020-05-12T12:30'), 'dinghyClass': {'name': 'Scorpion'}});
});

describe('when creating a new dinghy class', () => {
    it('clears the input on success', async () => {
        const user = userEvent.setup();
        const fnOnCreate = jest.fn(() => {return {'success': true}});
        
        const model = new DinghyRacingModel(rootURL);
        jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
        customRender(<CreateRace onCreate={fnOnCreate} />, model);
        const inputName = screen.getByLabelText(/name/i);
        const inputTime = screen.getByLabelText(/time/i);
        const inputDinghyClass = screen.getByLabelText(/class/i);
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await act(async () => {
            await user.type(inputName, 'Scorpion A');
            await user.type(inputTime, '2020-05-12T12:30');
            await user.type(inputDinghyClass, 'Scorpion');
            await user.click(btnCreate);
        });
    
        expect(inputName).toHaveValue('');
        // expect(inputTime).toHaveValue('');
        expect(inputTime).toHaveValue(new Date().toISOString().substring(0, 16));
        expect(inputDinghyClass).toHaveValue('');
    })
    it('displays the failure message on failure', async () => {
        const user = userEvent.setup();
        const fnOnCreate = jest.fn(() => {return {'success': false, 'message': 'That was a bust!'}});
        
        const model = new DinghyRacingModel(rootURL);
        jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});
        customRender(<CreateRace onCreate={fnOnCreate} />, model);
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await act(async () => {
            await user.click(btnCreate);
        });
        const message = await screen.findByText('That was a bust!');
    
        expect(message).toBeInTheDocument();
    })
})