import { customRender } from '../test-utilities/custom-renders';
import { act, screen, within } from '@testing-library/react';
import RaceStartConsole from './RaceStartConsole';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { httpRootURL, wsRootURL, races, dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet } from '../model/__mocks__/test-data';
import StartSequence from '../model/domain-classes/start-sequence';


jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

HTMLDialogElement.prototype.close = jest.fn();

const formatOptions = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
};
const timeFormat = new Intl.DateTimeFormat('utc', formatOptions);

beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2021-10-14T14:05:00Z"));
    jest.spyOn(global, 'setTimeout');
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toBeInTheDocument();
    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /flags/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /races/i})).toBeInTheDocument();
});

it('defaults session start to 8:00 today', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16));
});

it('defaults session end to 18:00 of today', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000).toISOString().substring(0, 16));
});

it('displays race names and blue peter', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
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
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
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
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
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
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const raceHeaders = (screen.getByRole('heading', {name: /races/i})).parentNode;
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

it('does not displays in race data in race headers', async () => {
    const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
    const races = [raceScorpionA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const raceHeaders = (screen.getByRole('heading', {name: /races/i})).parentNode;
    expect(within(raceHeaders).getByText(/scorpion a/i)).toBeInTheDocument();
    const raceA = within(raceHeaders).getByText(/scorpion a/i).parentNode;
    expect(within(raceA).queryByLabelText(/remaining/i)).not.toBeInTheDocument();
    expect(within(raceA).queryByLabelText(/estimate/i)).not.toBeInTheDocument();
    expect(within(raceA).queryByLabelText(/last/i)).not.toBeInTheDocument();
    expect(within(raceA).queryByLabelText(/average/i)).not.toBeInTheDocument();
});

it('displays actions to start races in session', async () => {
    const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
    const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
    const races = [raceScorpionA, raceGraduateA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const actionRows = screen.getAllByRole('row');
    expect(actionRows).toHaveLength(5);
    expect(within(actionRows[1]).getByText(timeFormat.format(new Date('2021-10-14T14:00:00Z')))).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/raise warning flag for scorpion a/i)).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(timeFormat.format(new Date('2021-10-14T14:05:00Z')))).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/raise blue peter/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/raise warning flag for graduate a/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/00:00/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(timeFormat.format(new Date('2021-10-14T14:10:00Z')))).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/lower warning flag for scorpion a/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/05:00/i)).toBeInTheDocument();
    expect(within(actionRows[4]).getByText(timeFormat.format(new Date('2021-10-14T14:15:00Z')))).toBeInTheDocument();
    expect(within(actionRows[4]).getByText(/lower warning flag for graduate a/i)).toBeInTheDocument();
    expect(within(actionRows[4]).getByText(/10:00/i)).toBeInTheDocument();
});

describe('when clock ticks', () => {
    it('updates time to next flag state change', async () => {
        const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
        const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
        const races = [raceScorpionA, raceGraduateA];
        
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});
        
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
            const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
            const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
            const races = [raceScorpionA, raceGraduateA];

            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});

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
        const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
        const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
        const races = [raceScorpionA, raceGraduateA];

        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});

        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        const actionRows = screen.getAllByRole('row');
        expect(actionRows).toHaveLength(5);
        expect(within(actionRows[1]).getByText(timeFormat.format(new Date('2021-10-14T14:00:00Z')))).toBeInTheDocument();
        expect(within(actionRows[1]).getByText(/raise warning flag for scorpion a/i)).toBeInTheDocument();
        expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(timeFormat.format(new Date('2021-10-14T14:05:00Z')))).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/raise blue peter/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/raise warning flag for graduate a/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/00:00/i)).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(timeFormat.format(new Date('2021-10-14T14:10:00Z')))).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(/lower warning flag for scorpion a/i)).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(/04:59/i)).toBeInTheDocument();
        expect(within(actionRows[4]).getByText(timeFormat.format(new Date('2021-10-14T14:15:00Z')))).toBeInTheDocument();
        expect(within(actionRows[4]).getByText(/lower warning flag for graduate a/i)).toBeInTheDocument();
        expect(within(actionRows[4]).getByText(/09:59/i)).toBeInTheDocument();
    });
});

it('registers an interest in race updates for races in session', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getStartSequence').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});
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
        jest.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races_copy)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        races_copy[0].name = 'Popeye Special';
        await act(async () => {
            jest.advanceTimersByTime(1000); // advance time so RaceStartConsole nows it needs to rerender
            model.handleRaceUpdate({'body': races_copy[0].url});
        });
        expect(screen.getByText('Popeye Special')).toBeInTheDocument();
    });
    it('removes a race that has had start time changed so it falls outside session time window', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        expect(screen.getByText('Handicap A')).toBeInTheDocument();
        const url = races[races.length -1].url;
        races.pop();
        await act(async () => {
            jest.advanceTimersByTime(1000); // advance time so RaceStartConsole nows it needs to rerender
            model.handleRaceUpdate({'body': url});
        });
        expect(screen.queryByText('Handicap A')).not.toBeInTheDocument();
    });
})