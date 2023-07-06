import { render } from '@testing-library/react';
import { ModelContext } from '../view/ModelContext';

beforeEach(() => {
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});
})

afterEach(() => {
    console.error.mockRestore();
})

export const customRender = (ui, model, {...renderOptions} = {}) => {
    return render(
        <ModelContext.Provider value={model}>
            {ui}
        </ModelContext.Provider>,
        renderOptions
    )
};