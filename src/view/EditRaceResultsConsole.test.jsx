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
import EditRaceResultsConsole from './EditRaceResultsConsole';
import { httpRootURL, wsRootURL } from '../model/__mocks__/test-data';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import * as storageUtilities from '../utilities/storage-utilities';

vi.mock('../model/sylph-model');
vi.mock('../controller/sylph-controller');
vi.mock('../model/clock');

afterEach(() => {
    sessionStorage.removeItem('sessionStart');
    sessionStorage.removeItem('sessionEnd');
    sessionStorage.removeItem('raceType');
});

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
    const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 18:00 UTC intially
    await act(async () => {
        render(<EditRaceResultsConsole model={model} />);
    });

    expect(screen.getByRole('heading', 'Select Race'));
    expect(screen.getByLabelText(/fleet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fleet/i)).toBeChecked();
    expect(screen.getByLabelText(/pursuit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/session start/i)).toHaveValue(sessionStart.toISOString().substring(16, 0));
    expect(screen.getByLabelText(/session end/i)).toHaveValue(sessionEnd.toISOString().substring(16, 0));
});