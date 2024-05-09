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

import { act, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../test-utilities/custom-renders';
import DinghyRacingModel from '../model/dinghy-racing-model';
import ViewUpcomingRaces from './ViewUpcomingRaces';
import { httpRootURL, wsRootURL, races } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': []})});
    await act(async () => {
        await customRender(<ViewUpcomingRaces />, model);
    });    

    expect(screen.getByText(/race/i)).toBeInTheDocument();
    expect(screen.getByText(/class/i)).toBeInTheDocument();
    expect(screen.getByText(/start/i)).toBeInTheDocument();
});

// test could be affected by date time local settings
it('displays the details of upcoming races', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    const getRacesOnOrAfterTimeSpy = jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    await act(async () => {
        await customRender(<ViewUpcomingRaces />, model);
    });    

    const cells = await screen.findAllByRole('cell');
    const cellValues = cells.map(cell => cell.textContent);

    const timeCheck = new Date('2021-10-14T10:30:00Z').toLocaleString();
    expect(cellValues).toContain('Scorpion A');
    expect(cellValues).toContain('Graduate');
    expect(cellValues).toContain(timeCheck);
});

describe('when a race is selected', () => {
    it('the method passed to showSignUpForm is called with the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        const showSignUpFormMock = jest.fn();

        await act(async () => {
            await customRender(<ViewUpcomingRaces showSignUpForm={showSignUpFormMock}/>, model);
        });
        
        const cellRaceScorpionA = await screen.findByRole('cell', {name: 'Scorpion A'});
        await user.click(cellRaceScorpionA);

        expect(showSignUpFormMock).toBeCalled();
    });
});

describe('when races fail to load', () => {
    it('displays the error message', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'That was a bust!'})});
        await act(async () => {
            await customRender(<ViewUpcomingRaces />, model);
        });
        const message = await screen.findByText(/That was a bust!/);
        expect(message).toBeInTheDocument();
    })
});