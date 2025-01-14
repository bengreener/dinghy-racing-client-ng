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

import { customRender } from '../test-utilities/custom-renders';
import { act, screen, within, prettyDOM } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaceStartConsole from './RaceStartConsole';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { httpRootURL, wsRootURL, races, raceScorpionA, raceGraduateA, raceCometA, raceHandicapA, dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet } from '../model/__mocks__/test-data';
import StartSequence from '../model/domain-classes/start-sequence';
import StartSignal from '../model/domain-classes/start-signal';
import RaceType from '../model/domain-classes/race-type';


jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

HTMLDialogElement.prototype.close = jest.fn();
HTMLMediaElement.prototype.play = jest.fn();

const formatOptions = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
};
const timeFormat = new Intl.DateTimeFormat('utc', formatOptions);

beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2021-10-14T10:25:00Z'));
    jest.spyOn(global, 'setTimeout');
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toBeInTheDocument();
    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toBeInTheDocument();
    expect(screen.getByLabelText(/fleet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fleet/i)).toBeChecked();
    expect(screen.getByLabelText(/pursuit/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /start races/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /flags/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /^races$/i})).toBeInTheDocument();
});

it('calls getStartSequence with correct arguments', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    const getStartSequenceSpy = jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
    const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
    sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
    const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000); // create as 18:00 UTC intially
    sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    expect(getStartSequenceSpy).toHaveBeenCalledWith(sessionStart, sessionEnd, RaceType.FLEET);
});

describe('when new value set for race type', () => {
    it('calls getStartSequence with correct arguments', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const getStartSequenceSpy = jest.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
        sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000); // create as 18:00 UTC intially
        sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        
        await act(async () => {        
            customRender(<RaceStartConsole />, model, controller);
        });
        
        await act(async () => {
            await user.click(screen.getByLabelText(/pursuit/i));
        });
    
        expect(getStartSequenceSpy).toHaveBeenCalledWith(sessionStart, sessionEnd, RaceType.PURSUIT);
    });
});

it('defaults session start to 8:00 today', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16));
});

it('defaults session end to 18:00 of today', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000).toISOString().substring(0, 16));
});

it('provides countdown value and message to Countdown control', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
        return Promise.resolve({'success': true, 'domainObject': new StartSequence([ raceScorpionA ], model)})
    });

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const countdownControl = screen.getByText('Start Countdown').parentElement;
    expect(within(countdownControl).getByText(/scorpion a/i)).toBeInTheDocument();
    expect(within(countdownControl).getByText(/5:00/i)).toBeInTheDocument();
});

it('displays race names and blue peter', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
    expect(within(flagIndicators).getByText(/scorpion class/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/blue peter/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/graduate class/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/club burgee/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/comet class/i)).toBeInTheDocument();
});

it('displays initial state for each flag', async () => {
    // const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
    // const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
    // const raceCometA = { "name": "Comet A", "plannedStartTime" : new Date("2021-10-14T14:20:00Z"), "dinghyClass": dinghyClassComet, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/17" };
    // const raceHandicapA = { "name": "Handicap A", "plannedStartTime": new Date("2021-10-14T14:25:00Z"), "dinghyClass": null, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/8" };
    // const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
    expect(within(flagIndicators).getAllByText(/raised/i)).toHaveLength(3);
    expect(within(flagIndicators).getAllByText(/lowered/i)).toHaveLength(2);
});

it('displays time to next flag state change for each flag', async () => {
    // const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
    // const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
    // const raceCometA = { "name": "Comet A", "plannedStartTime" : new Date("2021-10-14T14:20:00Z"), "dinghyClass": dinghyClassComet, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/17" };
    // const raceHandicapA = { "name": "Handicap A", "plannedStartTime": new Date("2021-10-14T14:25:00Z"), "dinghyClass": null, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/8" };
    // const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
    expect(within(flagIndicators).getAllByText(/05:00/i)).toHaveLength(2);
    expect(within(flagIndicators).getAllByText(/10:00/i)).toHaveLength(2);
    expect(within(flagIndicators).getByText(/20:00/i)).toBeInTheDocument();
});

it('displays race headers for races in session', async () => {
    const races = [raceScorpionA, raceGraduateA, raceCometA, {...raceHandicapA, duration: 2100000, plannedLaps: 3}];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const raceHeaders = (screen.getByRole('heading', {name: /^races$/i})).parentNode;

    expect(within(raceHeaders).getByText(/scorpion a/i)).toBeInTheDocument();
    const raceA = within(raceHeaders).getByText(/scorpion a/i).parentNode.parentNode.parentNode;
    expect(within(raceA).getByLabelText(/^laps$/i)).toHaveValue('5');
    expect(within(raceA).getByLabelText(/duration/i)).toHaveValue('45:00');
    expect(within(raceA).getByLabelText(/countdown/i)).toHaveValue('05:00');
    expect(within(raceA).getByRole('button', {name: /postpone/i})).toBeInTheDocument();
    expect(within(raceA).getByRole('button', {name: /start now/i})).toBeInTheDocument();

    expect(within(raceHeaders).getByText(/graduate a/i)).toBeInTheDocument();
    const raceB = within(raceHeaders).getByText(/graduate a/i).parentNode.parentNode.parentNode;
    expect(within(raceB).getByLabelText(/^laps$/i)).toHaveValue('4');
    expect(within(raceB).getByLabelText(/duration/i)).toHaveValue('45:00');
    expect(within(raceB).getByLabelText(/countdown/i)).toHaveValue('10:00');
    expect(within(raceB).getByRole('button', {name: /postpone/i})).toBeInTheDocument();
    expect(within(raceB).getByRole('button', {name: /start now/i})).toBeInTheDocument();

    expect(within(raceHeaders).getByText(/comet a/i)).toBeInTheDocument();
    const raceC = within(raceHeaders).getByText(/comet a/i).parentNode.parentNode.parentNode;
    expect(within(raceC).getByLabelText(/^laps$/i)).toHaveValue('4');
    expect(within(raceC).getByLabelText(/duration/i)).toHaveValue('45:00');
    expect(within(raceC).getByLabelText(/countdown/i)).toHaveValue('15:00');
    expect(within(raceC).getByRole('button', {name: /postpone/i})).toBeInTheDocument();
    expect(within(raceC).getByRole('button', {name: /start now/i})).toBeInTheDocument();

    expect(within(raceHeaders).getByText(/handicap a/i)).toBeInTheDocument();
    const raceD = within(raceHeaders).getByText(/handicap a/i).parentNode.parentNode.parentNode;
    expect(within(raceD).getByLabelText(/^laps$/i)).toHaveValue('3');
    expect(within(raceD).getByLabelText(/duration/i)).toHaveValue('35:00');
    expect(within(raceD).getByLabelText(/countdown/i)).toHaveValue('20:00');
    expect(within(raceD).getByRole('button', {name: /postpone/i})).toBeInTheDocument();
    expect(within(raceD).getByRole('button', {name: /start now/i})).toBeInTheDocument();
});

it('does not display in race data in race headers', async () => {
    const races = [raceScorpionA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const raceHeaders = (screen.getByRole('heading', {name: /^races$/i})).parentNode;
    expect(within(raceHeaders).getByText(/scorpion a/i)).toBeInTheDocument();
    const raceA = within(raceHeaders).getByText(/scorpion a/i).parentNode;
    expect(within(raceA).queryByLabelText(/remaining/i)).not.toBeInTheDocument();
    expect(within(raceA).queryByLabelText(/estimate/i)).not.toBeInTheDocument();
    expect(within(raceA).queryByLabelText(/last/i)).not.toBeInTheDocument();
    expect(within(raceA).queryByLabelText(/average/i)).not.toBeInTheDocument();
});

it('displays actions to start races in session', async () => {
    // const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
    // const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
    const races = [raceScorpionA, raceGraduateA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });
    const actionRows = screen.getAllByRole('row');
    expect(actionRows).toHaveLength(5);
    expect(within(actionRows[1]).getByText(timeFormat.format(new Date('2021-10-14T10:20:00Z')))).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/raise scorpion class flag/i)).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(timeFormat.format(new Date('2021-10-14T10:25:00Z')))).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/raise blue peter/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/raise graduate class flag/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/00:00/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(timeFormat.format(new Date('2021-10-14T10:30:00Z')))).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/lower scorpion class flag/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/05:00/i)).toBeInTheDocument();
    expect(within(actionRows[4]).getByText(timeFormat.format(new Date('2021-10-14T10:35:00Z')))).toBeInTheDocument();
    expect(within(actionRows[4]).getByText(/lower graduate class flag/i)).toBeInTheDocument();
    expect(within(actionRows[4]).getByText(/10:00/i)).toBeInTheDocument();
});

describe('when clock ticks', () => {
    it('updates time to next flag state change', async () => {
        // const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
        // const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
        const races = [raceScorpionA, raceGraduateA];
        
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
        expect(await within(flagIndicators).findAllByText(/04:59/i)).toHaveLength(1);
        expect(await within(flagIndicators).findAllByText(/09:59/i)).toHaveLength(2);
	});
    describe('when a flag state change is triggered', () => {
        it('updates the displayed flag state to the new flag state', async () => {
            // const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
            // const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
            const races = [raceScorpionA, raceGraduateA];

            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});

            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });

            act(() => {
                jest.advanceTimersByTime(300000);
            });

            expect(await screen.findAllByText(/raised/i)).toHaveLength(2);
            expect(await screen.findAllByText(/lowered/i)).toHaveLength(1);
        });
    });
    it('updates countdown for actions', async () => {
        jest.setSystemTime(new Date('2021-10-14T10:25:00Z'));
        const races = [raceScorpionA, raceGraduateA];

        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});

        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        const actionRows = screen.getAllByRole('row');
        expect(actionRows).toHaveLength(5);
        expect(within(actionRows[1]).getByText(timeFormat.format(new Date('2021-10-14T10:20:00Z')))).toBeInTheDocument();
        expect(within(actionRows[1]).getByText(/raise scorpion class flag/i)).toBeInTheDocument();
        expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(timeFormat.format(new Date('2021-10-14T10:25:00Z')))).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/raise blue peter/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/raise graduate class flag/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/00:00/i)).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(timeFormat.format(new Date('2021-10-14T10:30:00Z')))).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(/lower scorpion class flag/i)).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(/04:59/i)).toBeInTheDocument();
        expect(within(actionRows[4]).getByText(timeFormat.format(new Date('2021-10-14T10:35:00Z')))).toBeInTheDocument();
        expect(within(actionRows[4]).getByText(/lower graduate class flag/i)).toBeInTheDocument();
        expect(within(actionRows[4]).getByText(/09:59/i)).toBeInTheDocument();
    });
    describe('when ticks to 1 minute before a race start state change', () => {
        // unsure how to test audio using a variable to control audio rather than <audio> element
        xit('prepare for race start state change audio is present in document', async () => {
            const races = [{...raceScorpionA, startSequenceState: StartSignal.WARNINGSIGNAL}, raceGraduateA];
            jest.setSystemTime(new Date('2021-10-14T10:23:59Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
                return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
            });
            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            const audio = screen.queryByTestId('prepare-sound-warning-audio');
            expect(audio).toBeInTheDocument();
        });
    });
    describe('when ticks to 59 seconds before a race start state change', () => {
        // unsure how to test audio using a variable to control audio rather than <audio> element
        xit('prepare for race start state change audio is not present in document', async () => {
            const races = [{...raceScorpionA, startSequenceState: StartSignal.WARNINGSIGNAL}, raceGraduateA];
            jest.setSystemTime(new Date('2021-10-14T10:24:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
                return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
            });
            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            const audio = screen.queryByTestId('prepare-sound-warning-audio');
            expect(audio).not.toBeInTheDocument();
        });
    });
    describe('when ticks to time for a race start state change', () => {
        // unsure how to test audio using a variable to control audio rather than <audio> element
        xit('race start state change audio is present in document', async () => {
            const races = [{...raceScorpionA, startSequenceState: StartSignal.WARNINGSIGNAL}, {...raceGraduateA, startSequenceState: StartSignal.NONE}];
            jest.setSystemTime(new Date('2021-10-14T10:24:59Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
                return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
            });
            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });act(() => {
                jest.advanceTimersByTime(1000);
            });
            const audio = screen.queryByTestId('act-sound-warning-audio');
            expect(audio).toBeInTheDocument();
        });
    })
    describe('when ticks to 1 second after a race start state change', () => {
        // unsure how to test audio using a variable to control audio rather than <audio> element
        xit('race start state change audio is not present in document', async () => {
            const races = [{...raceScorpionA, startSequenceState: StartSignal.PREPARATORYSIGNAL}, {...raceGraduateA, startSequenceState: StartSignal.WARNINGSIGNAL}];
            jest.setSystemTime(new Date('2021-10-14T10:25:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
                return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
            });
            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });act(() => {
                jest.advanceTimersByTime(1000);
            });
            const audio = screen.queryByTestId('act-sound-warning-audio');
            expect(audio).not.toBeInTheDocument();
        });
    })
});

it('registers an interest in race updates for races in session', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
    const registerRaceUpdateCallbackSpy = jest.spyOn(model, 'registerRaceUpdateCallback');

    customRender(<RaceStartConsole />, model, controller);
    await screen.findAllByText(/scorpion a/i);

    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(1, 'http://localhost:8081/dinghyracing/api/races/4', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(2, 'http://localhost:8081/dinghyracing/api/races/7', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(3, 'http://localhost:8081/dinghyracing/api/races/17', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(4, 'http://localhost:8081/dinghyracing/api/races/8', expect.any(Function));
});

describe('when races within session are changed', () => {
    it('updates recorded details', async () => {
        const races_copy = [...races];
        races_copy[0] = {...races[0]};
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races_copy, model)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        expect(screen.getAllByText('Scorpion A')[0]).toBeInTheDocument();
        races_copy[0].name = 'Popeye Special';
        
        await act(async () => {
            jest.advanceTimersByTime(1000); // advance time so RaceStartConsole knows it needs to rerender
            model.handleRaceUpdate({'body': races_copy[0].url});
        });
        expect(screen.getAllByText('Popeye Special')[0]).toBeInTheDocument();
    });
    it('removes a race that has had start time changed so it falls outside session time window', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        expect(screen.getByText('Handicap A')).toBeInTheDocument();
        const url = races[races.length -1].url;
        races.pop();
        await act(async () => {
            jest.advanceTimersByTime(1000); // advance time so RaceStartConsole knows it needs to rerender
            model.handleRaceUpdate({'body': url});
        });
        expect(screen.queryByText('Handicap A')).not.toBeInTheDocument();
    });
});

describe('when 6 minutes 1 second before start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    xit('prepare for race start state change audio is not present in document', async () => {
        const races = [{...raceScorpionA, startSequenceState: StartSignal.WARNINGSIGNAL}, raceGraduateA];
        jest.setSystemTime(new Date('2021-10-14T10:23:59Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
            return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
        });
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('prepare-sound-warning-audio');
        expect(audio).not.toBeInTheDocument();
    });
});

describe('when 6 minutes before start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    xit('prepare for race start state change audio is present in document', async () => {
        const races = [{...raceScorpionA, startSequenceState: StartSignal.WARNINGSIGNAL}, raceGraduateA];
        jest.setSystemTime(new Date('2021-10-14T10:24:00Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
            return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
        });
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('prepare-sound-warning-audio');
        expect(audio).toBeInTheDocument();
    });
});

describe('when 5 minutes 59 second before start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    xit('prepare for race start state change audio is not present in document', async () => {
        const races = [{...raceScorpionA, startSequenceState: StartSignal.WARNINGSIGNAL}, raceGraduateA];
        jest.setSystemTime(new Date('2021-10-14T10:24:01Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
            return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
        });
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('prepare-sound-warning-audio');
        expect(audio).not.toBeInTheDocument();
    });
});

describe('when 1 second before start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    xit('race start state change audio is not present in document', async () => {
        const races = [{...raceScorpionA, startSequenceState: StartSignal.PREPARATORYSIGNAL}, {...raceGraduateA, startSequenceState: StartSignal.WARNINGSIGNAL}];
        jest.setSystemTime(new Date('2021-10-14T10:29:59Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
            return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
        });
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('act-sound-warning-audio');
        expect(audio).not.toBeInTheDocument();
    });
});

describe('when start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    xit('race start state change audio is present in document', async () => {
        const races = [{...raceScorpionA, startSequenceState: StartSignal.PREPARATORYSIGNAL}, {...raceGraduateA, startSequenceState: StartSignal.WARNINGSIGNAL}];
        jest.setSystemTime(new Date('2021-10-14T10:20:00Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
            return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
        });
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('act-sound-warning-audio');
        expect(audio).toBeInTheDocument();
    });
});

describe('when 1 second after start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    xit('prepare for race start state change audio is not present in document', async () => {
        const races = [{...raceScorpionA, startSequenceState: StartSignal.STARTINGSIGNAL}, {...raceGraduateA, startSequenceState: StartSignal.PREPARATORYSIGNAL}];
        jest.setSystemTime(new Date('2021-10-14T10:30:01Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {
            return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})
        });
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('act-sound-warning-audio');
        expect(audio).not.toBeInTheDocument();
    });
});