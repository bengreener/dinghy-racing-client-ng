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

import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmbeddedRaceSelector from './EmbeddedRaceSelector';
import SylphModel from '../model/sylph-model';
import EmbeddedRace from '../model/embedded-race';
import { httpRootURL, wsRootURL, embeddedRaceVeteransAHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

const model = new SylphModel(httpRootURL, wsRootURL);

it('renders', () => {
    const race = new EmbeddedRace(embeddedRaceVeteransAHAL, model)
    render(<EmbeddedRaceSelector embeddedRace={race} />);
    const checkBox = screen.getByRole('checkbox');

    expect(screen.getByText(/veterans a/i)).toBeInTheDocument();
    expect(checkBox).not.toBeChecked();
});

describe('when race has been selected', () => {
    it('displays check box as checked', () => {
        const race = new EmbeddedRace(embeddedRaceVeteransAHAL, model)
        render(<EmbeddedRaceSelector embeddedRace={race} raceSelected={true} />);
        const checkBox = screen.getByRole('checkbox');
        
        expect(screen.getByText(/veterans a/i)).toBeInTheDocument();
        expect(checkBox).toBeChecked();
    });
});

describe('when check box is clicked', () => {
    it('calls onChange handler with embedded race', async () => {
        const user = userEvent.setup();
        const changeHandlerSpy = new vi.fn();
        const race = new EmbeddedRace(embeddedRaceVeteransAHAL, model)
        render(<EmbeddedRaceSelector embeddedRace={race} raceSelected={true} onChange={changeHandlerSpy} />);
        const checkBox = screen.getByRole('checkbox');
        await user.click(checkBox);
        
        expect(changeHandlerSpy).toHaveBeenCalledWith(race);
    });
});