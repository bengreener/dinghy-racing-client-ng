import { act, screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateDinghyClass from './CreateDinghyClass';
import DinghyRacingModel from '../model/dinghy-racing-model';

it('renders', () => {
    render(<CreateDinghyClass />);
});

it('accepts the name of a dinghy class', async () => {
    const user = userEvent.setup();
    
    render(<CreateDinghyClass />);
    const txtClassName = await screen.findByLabelText('Class Name');
    await act(async () => {
        await user.type(txtClassName, 'Scorpion');
    })
    
    expect(txtClassName).toHaveValue('Scorpion');
});

it('accepts the crew size', async () => {
    const user = userEvent.setup();
    
    render(<CreateDinghyClass />);
    const crewSizeInput = await screen.findByLabelText('Crew Size');
    await act(async () => {
        await user.clear(crewSizeInput);
        await user.type(crewSizeInput, '2');
    });
    
    expect(crewSizeInput).toHaveValue(2);
});

it('calls the function passed in to onCreate prop', async () => {
    const user = userEvent.setup();
    const fnOnCreate = jest.fn(() => {return Promise.resolve({'success': true})});
    
    render(<CreateDinghyClass onCreate={fnOnCreate} />);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    await act(async () => {
        await user.click(btnCreate);
    });

    expect(fnOnCreate).toBeCalledTimes(1);
});

it('calls the function passed in to onCreate prop with new dinghy class as parameter', async () => {
    const user = userEvent.setup();
    const fnOnCreate = jest.fn((dinghyClass) => {return Promise.resolve({'success': true})});
    
    render(<CreateDinghyClass onCreate={fnOnCreate} />);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    const txtClassName = screen.getByLabelText('Class Name');
    const crewSizeInput = await screen.findByLabelText('Crew Size');
    await act(async () => {
        await user.type(txtClassName, 'Scorpion');
        await user.clear(crewSizeInput);
        await user.type(crewSizeInput, '2');
        await user.click(btnCreate);
    });

    expect(fnOnCreate).toBeCalledWith({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion', 'crewSize': 2});
});

describe('when creating a new dinghy class', () => {
    it('clears the input on success', async () => {
        const user = userEvent.setup();
        const fnOnCreate = jest.fn(() => {return Promise.resolve({'success': true})});
        
        render(<CreateDinghyClass onCreate={fnOnCreate} />);
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        const txtClassName = screen.getByLabelText('Class Name');
        await act(async () => {
            await user.type(txtClassName, 'Scorpion');
            await user.click(btnCreate);
        });
    
        expect(txtClassName.value).toBe('');
    })
    it('displays the failure message on failure', async () => {
        const user = userEvent.setup();
        const fnOnCreate = jest.fn(() => {return Promise.resolve({'success': false, 'message': 'That was a bust!'})});
        
        render(<CreateDinghyClass onCreate={fnOnCreate} />);
        const btnCreate = screen.getByRole('button', {'name': 'Create'});
        await act(async () => {
            await user.click(btnCreate);
        });
        const message = await screen.findByText('That was a bust!');
    
        expect(message).toBeInTheDocument();
    })
})
