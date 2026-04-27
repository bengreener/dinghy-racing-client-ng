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

import { render, screen } from '@testing-library/react';
import { expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import EmbeddedRacesPanel from './EmbeddedRacesPanel';
import EmbeddedRace from '../model/embedded-race';
import SylphModel from '../model/sylph-model';
import { httpRootURL, wsRootURL, embeddedRaceVeteransAHAL, embeddedRaceLadiesAHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

const model = new SylphModel(httpRootURL, wsRootURL);

it('displays supplied races', () => {
    const embeddedRaces = [new EmbeddedRace(embeddedRaceVeteransAHAL, model), new EmbeddedRace(embeddedRaceLadiesAHAL, model)];
    render(<EmbeddedRacesPanel embeddedRaces={embeddedRaces} />);
    expect(screen.getByText(/veterans a/i)).toBeInTheDocument();
    expect(screen.getByText(/ladies a/i)).toBeInTheDocument();
});

it('shows selected races as selected', () => {
    const embeddedRaceVeteransA = new EmbeddedRace(embeddedRaceVeteransAHAL, model);
    const embeddedRaceLadiesA = new EmbeddedRace(embeddedRaceLadiesAHAL, model);
    const embeddedRaces = [embeddedRaceVeteransA, embeddedRaceLadiesA];
    const selectedRaces = [embeddedRaceLadiesA];
    render(<EmbeddedRacesPanel embeddedRaces={embeddedRaces} selectedRaces={selectedRaces} />);
    expect(screen.getByLabelText(/veterans a/i)).not.toBeChecked();
    expect(screen.getByLabelText(/ladies a/i)).toBeChecked();
});

describe('when race selection is changed', () => {
    it('calls onRaceSelectionChange handler with an array containing the selected races', async () => {
        const user = userEvent.setup();
        const handleRaceSelectionChangeSpy = vi.fn();
        const embeddedRaceVeteransA = new EmbeddedRace(embeddedRaceVeteransAHAL, model);
        const embeddedRaceLadiesA = new EmbeddedRace(embeddedRaceLadiesAHAL, model);
        const embeddedRaces = [embeddedRaceVeteransA, embeddedRaceLadiesA];
        render(<EmbeddedRacesPanel embeddedRaces={embeddedRaces} onRaceSelectionChanged={handleRaceSelectionChangeSpy} />);
        await user.click(screen.getByLabelText(/ladies a/i));

        expect(handleRaceSelectionChangeSpy).toHaveBeenCalledWith([embeddedRaceLadiesA]);
        expect(screen.getByText(/ladies a/i)).toBeInTheDocument();
    });
})