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

import { render } from '@testing-library/react';
import ModelContext from '../view/ModelContext';
import ControllerContext from '../view/ControllerContext';

export const customRender = (ui, model, controller, {...renderOptions} = {}) => {
    const rendered = render(
        <ModelContext.Provider value={model}>
        <ControllerContext.Provider value={controller}>
            {ui}
        </ControllerContext.Provider>
        </ModelContext.Provider>,
        renderOptions
    );
    return {
        ...rendered,
        rerender: (rerenderUi, model, controller) => {
            rendered.rerender(
                <ModelContext.Provider value={model}>
                <ControllerContext.Provider value={controller}>
                    {rerenderUi}
                </ControllerContext.Provider>
                </ModelContext.Provider>
            )
        }
    }
};