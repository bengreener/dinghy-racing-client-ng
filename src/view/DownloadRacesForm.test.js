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

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../test-utilities/custom-renders';
import { httpRootURL, wsRootURL, races, raceScorpionA } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import DownloadRacesForm from './DownloadRacesForm';

jest.mock('../model/dinghy-racing-model');

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })
});

it('provides option to select start time and end time for session', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })

    const selectSessionStart = screen.getByLabelText(/session start/i);
    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionStart).toBeInTheDocument();
    expect(selectSessionEnd).toBeInTheDocument();
});

it('sets start and end time to defaults', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const expectedStartTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16);
    const expectedEndTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000).toISOString().substring(0, 16);

    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })
    expect(screen.getByLabelText(/session start/i)).toHaveValue(expectedStartTime);
    expect(screen.getByLabelText(/session end/i)).toHaveValue(expectedEndTime);
});

it('accepts a change to the get races in window start time', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })

    const sessionStartInput = screen.getByLabelText(/session start/i);
    await act(async () => {
        await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
        await user.type(sessionStartInput, '2020-02-12T12:10');
    });
    expect(sessionStartInput).toHaveValue('2020-02-12T12:10');
});

it('accepts a change to the get races in window start time', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })

    const sessionEndInput = screen.getByLabelText(/session end/i);
    await act(async () => {
        await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
        await user.type(sessionEndInput, '2075-02-12T12:10');
    });
    expect(sessionEndInput).toHaveValue('2075-02-12T12:10');
});

it('calls model get races between times with values set for start and end of window', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const getRacesBetweenTimesSpy = jest.spyOn(model, 'getRacesBetweenTimes');
    const startTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000);
    startTime.setMinutes(startTime.getMinutes() + startTime.getTimezoneOffset());
    const endTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000);
    endTime.setMinutes(endTime.getMinutes() + endTime.getTimezoneOffset());
    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })
    
    expect(getRacesBetweenTimesSpy).toBeCalledWith(startTime, endTime);
});

describe('when start time for races window chnages', () => {
    it('calls model get races between times with new time set for start and end of window', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getRacesBetweenTimesSpy = jest.spyOn(model, 'getRacesBetweenTimes');
        const startTime = new Date('2020-02-12T12:10');
        startTime.setMinutes(startTime.getMinutes() + startTime.getTimezoneOffset());
        const endTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000);
        endTime.setMinutes(endTime.getMinutes() + endTime.getTimezoneOffset());
        await act(async () => {
            await customRender(<DownloadRacesForm />, model);
        })

        const sessionStartInput = screen.getByLabelText(/session start/i);
        await act(async () => {
            await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
            await user.type(sessionStartInput, '2020-02-12T12:10');
        });

        expect(getRacesBetweenTimesSpy).toBeCalledWith(startTime, endTime);
    });
});

describe('when end time for races window chnages', () => {
    it('calls model get races between times with start time and new time set for end of window', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getRacesBetweenTimesSpy = jest.spyOn(model, 'getRacesBetweenTimes');
        const startTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000);
        startTime.setMinutes(startTime.getMinutes() + startTime.getTimezoneOffset());

        await act(async () => {
            await customRender(<DownloadRacesForm />, model);
        })

        const sessionEndInput = screen.getByLabelText(/session end/i);
        await act(async () => {
            await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
            await user.type(sessionEndInput, '2075-02-12T12:10');
        });

        expect(getRacesBetweenTimesSpy).toBeCalledWith(startTime, new Date('2075-02-12T12:10'));
    });
});

describe('when an error is received', () => {
    it('displays error message', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            await customRender(<DownloadRacesForm />, model);
        })
        
        expect(screen.getByText(/oops!/i)).toBeInTheDocument();
    });
    it('clears error message when a successful response is received', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        let render;

        await act(async () => {
            render = await customRender(<DownloadRacesForm key={Date.now()} />, model);
        })
        
        expect(screen.getByText(/oops!/i)).toBeInTheDocument();

        await act(async () => {
            render.rerender(<DownloadRacesForm key={Date.now()} />, model);
        });
        expect(screen.queryByText(/oops!/i)).not.toBeInTheDocument();
    });
});

it('displays races that start within the time window specified', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const getRacesBetweenTimesSpy = jest.spyOn(model, 'getRacesBetweenTimes').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    });

    expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
    // expect(screen.getByText(/14\/10\/2021 10:30/i)).toBeInTheDocument();
    expect(screen.getByText(new Intl.DateTimeFormat(navigator.language, {
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: false
    }).format(new Date('2021-10-14T10:30:00Z')))).toBeInTheDocument();
    expect(screen.getByText(/^comet$/i)).toBeInTheDocument();
    expect(screen.getByText(/handicap a/i)).toBeInTheDocument();
});

describe('when download results button clicked', () => {
    it('calls controller download results function', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': [raceScorpionA]})});
        const downloadFunctionSpy = jest.spyOn(controller, 'downloadRaceResults').mockImplementation(() => {return Promise.resolve({'success': true})});
        await act(async () => {
            await customRender(<DownloadRacesForm />, model, controller);
        });

        await user.click(screen.getByText(/download results/i));

        expect(downloadFunctionSpy).toBeCalledTimes(1);
    });
    it('displays the error message if the request to download is unsuccessful', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': [raceScorpionA]})});
        jest.spyOn(controller, 'downloadRaceResults').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            await customRender(<DownloadRacesForm />, model, controller);
        });

        await act(async () => {
            await user.click(screen.getByText(/download results/i));
        });

        expect(screen.getByText(/oops/i)).toBeInTheDocument();
    })
});