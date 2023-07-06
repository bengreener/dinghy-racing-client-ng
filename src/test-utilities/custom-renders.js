import { render } from '@testing-library/react';
import { ModelContext } from '../view/ModelContext';


export const customRender = (ui, model, {...renderOptions} = {}) => {
    return render(
        <ModelContext.Provider value = {model}>
            {ui}
        </ModelContext.Provider>,
        renderOptions
    )
};