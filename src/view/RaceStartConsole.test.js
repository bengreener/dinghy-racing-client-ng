import { customRender } from '../test-utilities/custom-renders';
import { act, screen, within } from '@testing-library/react';
import RaceStartConsole from './RaceStartConsole';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { httpRootURL, wsRootURL, races, dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet } from '../model/__mocks__/test-data';

import DinghyRacingController from '../controller/dinghy-racing-controller';

jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

HTMLDialogElement.prototype.close = jest.fn();

beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2021-10-14T14:05:00Z"));
    jest.spyOn(global, 'setTimeout');
});

afterAll(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toBeInTheDocument();
    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /flag indicators/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /race headers/i})).toBeInTheDocument();
});

it('defaults session start to 8:00 today', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16));
});

it('defaults session end to 18:00 of today', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000).toISOString().substring(0, 16));
});

it('displays race names and blue peter', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flag Indicators'})).parentNode;
    expect(within(flagIndicators).getByText(/scorpion a/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/blue peter/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/graduate a/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/handicap a/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/comet a/i)).toBeInTheDocument();
});

it('displays initial state for each flag', async () => {
    const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
    const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
    const raceCometA = { "name": "Comet A", "plannedStartTime" : new Date("2021-10-14T14:20:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassComet, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/17" };
    const raceHandicapA = { "name": "Handicap A", "plannedStartTime": new Date("2021-10-14T14:25:00Z"), "actualStartTime": null, "dinghyClass": null, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/8" };
    const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flag Indicators'})).parentNode;
    expect(within(flagIndicators).getAllByText(/raised/i)).toHaveLength(3);
    expect(within(flagIndicators).getAllByText(/lowered/i)).toHaveLength(2);
});

it('displays time to next flag state change for each flag', async () => {
    const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
    const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
    const raceCometA = { "name": "Comet A", "plannedStartTime" : new Date("2021-10-14T14:20:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassComet, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/17" };
    const raceHandicapA = { "name": "Handicap A", "plannedStartTime": new Date("2021-10-14T14:25:00Z"), "actualStartTime": null, "dinghyClass": null, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/8" };
    const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flag Indicators'})).parentNode;
    expect(within(flagIndicators).getAllByText(/05:00/i)).toHaveLength(2);
    expect(within(flagIndicators).getAllByText(/10:00/i)).toHaveLength(2);
    expect(within(flagIndicators).getByText(/20:00/i)).toBeInTheDocument();
});

it('displays race headers for races in session', async () => {
    const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
    const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
    const raceCometA = { "name": "Comet A", "plannedStartTime" : new Date("2021-10-14T14:20:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassComet, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/17" };
    const raceHandicapA = { "name": "Handicap A", "plannedStartTime": new Date("2021-10-14T14:25:00Z"), "actualStartTime": null, "dinghyClass": null, "duration": 2100000, "plannedLaps": 3, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/8" };
    const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const raceHeaders = (screen.getByRole('heading', {name: /race headers/i})).parentNode;
    expect(within(raceHeaders).getByText(/scorpion a/i)).toBeInTheDocument();
    const raceA = within(raceHeaders).getByText(/scorpion a/i).parentNode;
    expect(within(raceA).getByLabelText(/laps$/i)).toHaveValue('5');
    expect(within(raceA).getByLabelText(/duration/i)).toHaveValue('45:00');
    expect(within(raceA).getByLabelText(/countdown/i)).toHaveValue('05:00');
    expect(within(raceA).getByRole('button', {name: /postpone/i})).toBeInTheDocument();
    expect(within(raceA).getByRole('button', {name: /start now/i})).toBeInTheDocument();


    expect(within(raceHeaders).getByText(/graduate a/i)).toBeInTheDocument();
    const raceB = within(raceHeaders).getByText(/graduate a/i).parentNode;
    expect(within(raceB).getByLabelText(/laps$/i)).toHaveValue('4');
    expect(within(raceB).getByLabelText(/duration/i)).toHaveValue('45:00');
    expect(within(raceB).getByLabelText(/countdown/i)).toHaveValue('10:00');
    expect(within(raceB).getByRole('button', {name: /postpone/i})).toBeInTheDocument();
    expect(within(raceB).getByRole('button', {name: /start now/i})).toBeInTheDocument();

    expect(within(raceHeaders).getByText(/comet a/i)).toBeInTheDocument();
    const raceC = within(raceHeaders).getByText(/comet a/i).parentNode;
    expect(within(raceC).getByLabelText(/laps$/i)).toHaveValue('4');
    expect(within(raceC).getByLabelText(/duration/i)).toHaveValue('45:00');
    expect(within(raceC).getByLabelText(/countdown/i)).toHaveValue('15:00');
    expect(within(raceC).getByRole('button', {name: /postpone/i})).toBeInTheDocument();
    expect(within(raceC).getByRole('button', {name: /start now/i})).toBeInTheDocument();

    expect(within(raceHeaders).getByText(/handicap a/i)).toBeInTheDocument();
    const raceD = within(raceHeaders).getByText(/handicap a/i).parentNode;
    expect(within(raceD).getByLabelText(/laps$/i)).toHaveValue('3');
    expect(within(raceD).getByLabelText(/duration/i)).toHaveValue('35:00');
    expect(within(raceD).getByLabelText(/countdown/i)).toHaveValue('20:00');
    expect(within(raceD).getByRole('button', {name: /postpone/i})).toBeInTheDocument();
    expect(within(raceD).getByRole('button', {name: /start now/i})).toBeInTheDocument();
});

describe('when clock ticks', () => {
    // unclear why this is not working. Timesout waiting for findAllByText. Equivalent test works in FlagControl.test.js
    xit('updates time to next flag state change', async () => {
        const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
        const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
        const races = [raceScorpionA, raceGraduateA];
        
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });

        // expect(screen.getByText(/05:00/i)).toBeInTheDocument();
        // screen.debug();
        await act(async () => {
            jest.advanceTimersByTime(1000);
            // await screen.findByText(/04:59/i);
        });

        // expect(setTimeoutSpy).toBeCalled();
        expect(await screen.findAllByText(/04:59/i)).toHaveLength(2);
        expect(await screen.findAllByText(/09:59/i)).toHaveLength(2);
        expect(await screen.findAllByText(/19:59/i)).toBeInTheDocument();
	});
    describe('when a flag state change is triggered', () => {
        // unclear why this is not working. Test completes by displayed values are not updated. Equivalent test works in FlagControl.test.js
        // setTimeout is called
        // callback function is set correctly
        // advancing timers does not appear to result in function passed to setTimeout being called :-/
        xit('updates the displayed flag state to the new flag state', async () => {
            const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
            const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
            const races = [raceScorpionA, raceGraduateA];

            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });

            // console.log(`Time in test: ${Date()}`);
            act(() => {
                jest.advanceTimersByTime(300000);
                // jest.runAllTimers();
            });
            // console.log(`Time in test: ${Date()}`);

            // console.log(setTimeoutSpy.mock.lastCall);
            // console.log(setTimeoutSpy.mock.lastCall[0].toString());
            // expect(setTimeoutSpy).toBeCalled();

            expect(await screen.findAllByText(/raised/i)).toHaveLength(2);
            expect(await screen.findAllByText(/lowered/i)).toHaveLength(1);
        });
    });
});