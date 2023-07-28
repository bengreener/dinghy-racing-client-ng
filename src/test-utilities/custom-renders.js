import { render } from '@testing-library/react';
import ModelContext from '../view/ModelContext';
import ControllerContext from '../view/ControllerContext';

beforeEach(() => {
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});
})

afterEach(() => {
    console.error.mockRestore();
})

export const customRender = (ui, model, controller, {...renderOptions} = {}) => {
    return render(
        <ModelContext.Provider value={model}>
        <ControllerContext.Provider value={controller}>
            {ui}
        </ControllerContext.Provider>
        </ModelContext.Provider>,
        renderOptions
    )
};