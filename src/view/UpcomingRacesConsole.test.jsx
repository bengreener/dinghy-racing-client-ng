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

import { act, render, screen, within} from '@testing-library/react';
import { userEvent} from '@testing-library/user-event';
import SylphModel from '../model/sylph-model';
import Collection from '../model/collection';
import DirectRace from '../model/direct-race';
import UpcomingRacesConsole from './UpcomingRacesConsole';
import { httpRootURL, wsRootURL, raceCometAHAL, raceGraduateAHAL, raceHandicapAHAL, raceScorpionAHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    await act(async () => {
        render(<UpcomingRacesConsole model={model}/>);
    });
    expect(screen.getByRole('heading', {name: /upcoming races/i})).toBeInTheDocument();
    expect(screen.getByLabelText(/session start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/session end/i)).toBeInTheDocument();
    expect(screen.getByText(/^race$/i)).toBeInTheDocument();
    expect(screen.getByText(/class/i)).toBeInTheDocument();
    expect(screen.getByText(/start time/i)).toBeInTheDocument();
    expect(screen.getByText(/^type/i)).toBeInTheDocument();
    expect(screen.getByText(/start type/i)).toBeInTheDocument();
});
it('defaults start time for race selection to now', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    await act(async () => {
        render(<UpcomingRacesConsole model={model}/>);
    });
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    expect(screen.getByLabelText(/session start/i)).toHaveValue(now.toISOString().substring(0, 16));
});
it('defaults end time for race selection to 20:00 today', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    await act(async () => {
        render(<UpcomingRacesConsole model={model}/>);
    });
    expect(screen.getByLabelText(/session end/i)).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000).toISOString().substring(0, 16));
});
// test could be affected by date time local settings
it('displays the details of upcoming races', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    await act(async () => {
        render(<UpcomingRacesConsole model={model}/>);
    });
    const cells = await screen.findAllByRole('cell');
    const cellValues = cells.map(cell => cell.textContent);
    const timeCheck = new Date('2021-10-14T10:30:00Z').toLocaleString();
    expect(cellValues).toContain('Scorpion A');
    expect(cellValues).toContain('Graduate A');
    expect(cellValues).toContain(timeCheck);
    expect(cellValues).toContain('Fleet');
    expect(cellValues).toContain('10-5-Go');
});
it('displays the details of upcoming races in order of planned start time', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    await act(async () => {
        render(<UpcomingRacesConsole model={model}/>);
    });
    const raceRows = await screen.findAllByRole('row');
    expect(within(raceRows[1]).getByText(/scorpion a/i)).toBeInTheDocument();
    expect(within(raceRows[2]).getByText(/graduate a/i)).toBeInTheDocument();
    expect(within(raceRows[3]).getByText(/comet a/i)).toBeInTheDocument();
    expect(within(raceRows[4]).getByText(/handicap a/i)).toBeInTheDocument();
});
describe('when start time is changed', () => {
    it('gets the races that fall into the new time period', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getDirectRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve(new Collection([new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0, number: 0}))});
        render(<UpcomingRacesConsole model={model}/>);
        
        let cells = await screen.findAllByRole('cell');
        let cellValues = cells.map(cell => cell.textContent);        
        expect(cellValues).not.toContain('Graduate A');
        const sessionStartInput = screen.getByLabelText(/session start/i);
        await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
        await user.type(sessionStartInput, '2020-05-12T12:30');
        await act(async () => {});
        cells = await screen.findAllByRole('cell');
        cellValues = cells.map(cell => cell.textContent);
        expect(cellValues).toContain('Graduate A');
    });
});
describe('when end time is changed', () => {
    it('gets the races that fall into the new time period', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getDirectRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve(new Collection([new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0, number: 0}))});
        await act(async () => {
            render(<UpcomingRacesConsole model={model}/>);
        });
        let cells = await screen.findAllByRole('cell');
        let cellValues = cells.map(cell => cell.textContent);
        expect(cellValues).not.toContain('Graduate A');
        const sessionEndInput = screen.getByLabelText(/session start/i);
        await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
        await user.type(sessionEndInput, '2020-05-12T12:30');            
        await act(async () => {});
        cells = await screen.findAllByRole('cell');
        cellValues = cells.map(cell => cell.textContent);
        expect(cellValues).toContain('Graduate A');
    });
});
describe('when a race is selected', () => {
    it('the method passed to showSignUpForm is called with the selected race', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const showSignUpConsoleMock = vi.fn();
        await act(async () => {
            render(<UpcomingRacesConsole model={model} showSignUpConsole={showSignUpConsoleMock}/>);
        });
        const cellRaceScorpionA = await screen.findByRole('cell', {name: 'Scorpion A'});
        await user.click(cellRaceScorpionA);
        expect(showSignUpConsoleMock).toBeCalled();
    });
});
describe('when races fail to load', () => {
    it('displays the error message', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getDirectRacesBetweenTimes').mockImplementationOnce(async () => {throw Error('That was a bust!')});
        // await act(async () => {
            render(<UpcomingRacesConsole model={model}/>);
        // });
        const message = await screen.findByText(/That was a bust!/);
        expect(message).toBeInTheDocument();
    })
});
it('registers an interest in race updates for races in selected period', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const registerRaceUpdateCallbackSpy = vi.spyOn(model, 'registerRaceUpdateCallback');
    render(<UpcomingRacesConsole model={model}/>);
    await screen.findAllByRole('cell');
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(1, 'http://localhost:8081/dinghyracing/api/directRaces/17', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(2, 'http://localhost:8081/dinghyracing/api/directRaces/7', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(3, 'http://localhost:8081/dinghyracing/api/directRaces/8', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(4, 'http://localhost:8081/dinghyracing/api/directRaces/4', expect.any(Function));
});
describe('when races within session are changed', () => {
    it('updates recorded details', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceCometA = new DirectRace(raceCometAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        const raceHandicapA = new DirectRace(raceHandicapAHAL, {version: '"0"'}, model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const races = [
            raceCometA, raceGraduateA, raceHandicapA, raceScorpionA
        ];
        vi.spyOn(model, 'getDirectRacesBetweenTimes').mockImplementation(async () => {
            return new Collection(races, {size: 20, totalElements: 4, totalPages: 0, number: 0})
        });
        await act(async () => {        
            render(<UpcomingRacesConsole model={model}/>);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        races[0].hal = {...raceCometAHAL, name: 'Popeye Special'};
        await act(async () => {
            model.handleRaceUpdate({'body': races[0].url});
        });
        expect(screen.getByText('Popeye Special')).toBeInTheDocument();
    });
    it('removes a race that has had start time changed so it falls outside session time window', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceCometA = new DirectRace(raceCometAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        const raceHandicapA = new DirectRace(raceHandicapAHAL, {version: '"0"'}, model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const races = [
            raceCometA, raceGraduateA, raceHandicapA, raceScorpionA
        ];
        vi.spyOn(model, 'getDirectRacesBetweenTimes').mockImplementation(async () => {
            return new Collection(races, {size: 20, totalElements: 4, totalPages: 0, number: 0})
        });
        await act(async () => {        
            render(<UpcomingRacesConsole model={model}/>);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        const url = races[races.length -1].url;
        races.pop();
        await act(async () => {
            model.handleRaceUpdate({'body': url});
        });
        expect(screen.queryByText('Scorpion A')).not.toBeInTheDocument();
    });
});