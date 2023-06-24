import { screen, prettyDOM, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateDinghyClass from './CreateDinghyClass';

it('renders', () => {
    render(<CreateDinghyClass />);
});

it('accepts the name of a dinghy class', async () => {
    const user = userEvent.setup();
    
    render(<CreateDinghyClass />);
    const txtClassName = screen.getByLabelText('Class Name');
    await user.type(txtClassName, 'Scorpion');

    expect(txtClassName.value).toBe('Scorpion');
});

it('calls the function passed in to onCreate prop', async () => {
    const user = userEvent.setup();
    const fncOnCreate = jest.fn();
    
    render(<CreateDinghyClass onCreate={fncOnCreate}/>);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    await user.click(btnCreate);

    expect(fncOnCreate).toBeCalledTimes(1);
});

it('calls the function passed in to onCreate prop with new dinghy class as parameter', async () => {
    const user = userEvent.setup();
    const fncOnCreate = jest.fn();
    
    render(<CreateDinghyClass onCreate={fncOnCreate}/>);
    const btnCreate = screen.getByRole('button', {'name': 'Create'});
    const txtClassName = screen.getByLabelText('Class Name');
    await user.type(txtClassName, 'Scorpion');
    await user.click(btnCreate);

    expect(fncOnCreate).toBeCalledWith({'name': 'Scorpion'});
});