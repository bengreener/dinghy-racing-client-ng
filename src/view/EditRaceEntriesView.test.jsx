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

import { act, render, screen } from '@testing-library/react';
import EditRaceEntriesView from './EditRaceEntriesView';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import DirectRace from '../model/direct-race';
import { httpRootURL, wsRootURL, raceScorpionAHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../controller/sylph-controller');
vi.mock('../model/clock');

afterEach(() => {
    vi.resetAllMocks();
});

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    await act(async () => {
        render(<EditRaceEntriesView model={model} controller={controller} races={[new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)]} />);
    });
    expect(screen.getByRole('button', {name: /by sail number/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by class & sail number/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by lap times/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by position/i})).toBeInTheDocument();
    expect(screen.getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    expect(screen.getAllByText(/Scorpion/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Chris marshaLL/i)).toBeInTheDocument();
});