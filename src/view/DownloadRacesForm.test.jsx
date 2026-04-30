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
import userEvent from '@testing-library/user-event';
import { httpRootURL, wsRootURL, raceScorpionAHAL } from '../model/__mocks__/test-data';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import Collection from '../model/collection';
import DirectRace from '../model/direct-race';
import NameFormat from '../controller/name-format';
import DownloadRacesForm from './DownloadRacesForm';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

beforeEach(() => {
	vi.clearAllMocks();
    vi.restoreAllMocks();
});

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    act(() => {
        render(<DownloadRacesForm model={model} />);
    });
    expect(await screen.findByText('Download Races')).toBeInTheDocument();
});
it('provides option to select start time and end time for session', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    act(() => {
        render(<DownloadRacesForm model={model} />);
    });
    const selectSessionStart = await screen.findByLabelText(/session start/i);
    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionStart).toBeInTheDocument();
    expect(selectSessionEnd).toBeInTheDocument();
});
it('sets start and end time to defaults', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const expectedStartTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16);
    const expectedEndTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 75600000).toISOString().substring(0, 16);
    act(() => {
        render(<DownloadRacesForm model={model} />);
    });
    expect(await screen.findByLabelText(/session start/i)).toHaveValue(expectedStartTime);
    expect(screen.getByLabelText(/session end/i)).toHaveValue(expectedEndTime);
});
it('accepts a change to the get races in window start time', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    act(() => {
        render(<DownloadRacesForm model={model} />);
    });
    const sessionStartInput = screen.getByLabelText(/session start/i);
    await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
    await user.type(sessionStartInput, '2020-02-12T12:10');
    expect(sessionStartInput).toHaveValue('2020-02-12T12:10');
});
it('accepts a change to the get races in window start time', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    act(() => {
        render(<DownloadRacesForm model={model} />);
    });
    const sessionEndInput = screen.getByLabelText(/session end/i);
    await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
    await user.type(sessionEndInput, '2075-02-12T12:10');
    expect(sessionEndInput).toHaveValue('2075-02-12T12:10');
});
it('calls model get races between times with values set for start and end of window', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const getRacesBetweenTimesSpy = vi.spyOn(model, 'getRacesBetweenTimes');
    const startTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000);
    startTime.setMinutes(startTime.getMinutes() + startTime.getTimezoneOffset());
    const endTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 75600000);
    endTime.setMinutes(endTime.getMinutes() + endTime.getTimezoneOffset());
    act(() => {
        render(<DownloadRacesForm model={model} />);
    });
    await screen.findByText('Download Races'); // avoid updated not wrapped in act warning
    expect(getRacesBetweenTimesSpy).toBeCalledWith(startTime, endTime);
});
describe('when start time for races window changes', () => {
    it('calls model get races between times with new time set for start and end of window', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const getRacesBetweenTimesSpy = vi.spyOn(model, 'getRacesBetweenTimes');
        const startTime = new Date('2020-02-12T12:10');
        startTime.setMinutes(startTime.getMinutes() + startTime.getTimezoneOffset());
        const endTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 75600000);
        endTime.setMinutes(endTime.getMinutes() + endTime.getTimezoneOffset());
        act(() => {
            render(<DownloadRacesForm model={model} />);
        });
        const sessionStartInput = screen.getByLabelText(/session start/i);
        await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
        await user.type(sessionStartInput, '2020-02-12T12:10');
        expect(getRacesBetweenTimesSpy).toBeCalledWith(startTime, endTime);
    });
});
describe('when end time for races window changes', () => {
    it('calls model get races between times with start time and new time set for end of window', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const getRacesBetweenTimesSpy = vi.spyOn(model, 'getRacesBetweenTimes');
        const startTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000);
        startTime.setMinutes(startTime.getMinutes() + startTime.getTimezoneOffset());
        act(() => {
            render(<DownloadRacesForm model={model} />);
        });
        const sessionEndInput = screen.getByLabelText(/session end/i);
        await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
        await user.type(sessionEndInput, '2075-02-12T12:10');
        expect(getRacesBetweenTimesSpy).toBeCalledWith(startTime, new Date('2075-02-12T12:10'));
    });
});
describe('when an error is received', () => {
    it('displays error message', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(async () => {throw new Error('Oops!')});
        act(() => {
            render(<DownloadRacesForm model={model} />);
        });
        expect(await screen.findByText(/oops!/i)).toBeInTheDocument();
    });
    it('clears error message when a successful response is received', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(async () => {
            throw new Error('Oops!')
        });
        let renderResult
        act(() => {
            renderResult = render(<DownloadRacesForm model={model} />);
        });        
        expect(await screen.findByText(/oops!/i)).toBeInTheDocument();
        act(() => {
            renderResult.rerender(<DownloadRacesForm key={1} model={model} />);
        });
        await screen.findByText('Download Races'); // avoid updated not wrapped in act warning
        expect(await screen.queryByText(/oops!/i)).not.toBeInTheDocument();
    });
});
it('displays races that start within the time window specified', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    act(() => {
        render(<DownloadRacesForm model={model} />);
    });
    expect(await screen.findByText(/scorpion a/i)).toBeInTheDocument();
    expect(screen.getByText(/comet a/i)).toBeInTheDocument();
    expect(screen.getByText(/handicap a/i)).toBeInTheDocument();
});
describe('when download results button clicked', () => {
    it('calls controller download results function', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'getRacesBetweenTimes').mockImplementation(async () => {return new Collection([new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0, number: 0})});
        const downloadFunctionSpy = vi.spyOn(controller, 'downloadRaceResults').mockImplementation(async () => {return {'success': true}});
        act(() => {
            render(<DownloadRacesForm model={model} controller={controller}/>);
        });
        await user.click(await screen.findByText(/download results/i));
        expect(downloadFunctionSpy).toBeCalledTimes(1);
        expect(downloadFunctionSpy).toBeCalledWith(new DirectRace(raceScorpionAHAL, {version: '"0"'}, model), {nameFormat: NameFormat.FIRSTNAMESURNAME});
    });
    it('displays the error message if the request to download is unsuccessful', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'getRacesBetweenTimes').mockImplementation(async () => {return new Collection([new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0, number: 0})});
        vi.spyOn(controller, 'downloadRaceResults').mockImplementation(async () => {throw new Error('Oops!')});
        act(() => {
            render(<DownloadRacesForm model={model} controller={controller}/>);
        });
        const downloadButton = await screen.findByText(/download results/i)
        await user.click(downloadButton);
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
});