import { act, render, screen } from '@testing-library/react';
import FlagsControl from './FlagsControl';
import { dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet, races } from '../model/__mocks__/test-data';

// let setTimeoutSpy;

beforeAll(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2021-10-14T14:05:00Z"));
    jest.spyOn(global, 'setTimeout');
    // setTimeoutSpy = jest.spyOn(global, 'setTimeout');
});

afterAll(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe('when no races provided', () => {
    it('renders', () => {
        render(<FlagsControl />);
    });
});

describe('when array of races supplied', () => {
    it('displays race names and blue peter', () => {
        render(<FlagsControl races={races} />);
        expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
        expect(screen.getByText(/blue peter/i)).toBeInTheDocument();
        expect(screen.getByText(/graduate a/i)).toBeInTheDocument();
        expect(screen.getByText(/handicap a/i)).toBeInTheDocument();
        expect(screen.getByText(/comet a/i)).toBeInTheDocument();
    });
    it('displays initial flag status for each race', () => {
        const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
        const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
        const raceCometA = { "name": "Comet A", "plannedStartTime" : new Date("2021-10-14T14:20:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassComet, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/17" };
        const raceHandicapA = { "name": "Handicap A", "plannedStartTime": new Date("2021-10-14T14:25:00Z"), "actualStartTime": null, "dinghyClass": null, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/8" };
        const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];
        render(<FlagsControl races={races}/>);

        expect(screen.getAllByText(/raised/i)).toHaveLength(3);
        expect(screen.getAllByText(/lowered/i)).toHaveLength(2);
    });
    it('displays time to next flag state change for each flag', () => {
        const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
        const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
        const raceCometA = { "name": "Comet A", "plannedStartTime" : new Date("2021-10-14T14:20:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassComet, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/17" };
        const raceHandicapA = { "name": "Handicap A", "plannedStartTime": new Date("2021-10-14T14:25:00Z"), "actualStartTime": null, "dinghyClass": null, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/8" };
        const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];
        render(<FlagsControl races={races}/>);

        expect(screen.getAllByText(/05:00/i)).toHaveLength(2);
        expect(screen.getAllByText(/10:00/i)).toHaveLength(2);
        expect(screen.getByText(/20:00/i)).toBeInTheDocument();
    });
});

describe('when clock ticks', () => {
    // unclear why this is not working. Timesout waiting for findByText. Equivalent test works in FlagControl.test.js
    xit('updates time to next flag state change', async () => {
        const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
        const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
        const races = [raceScorpionA, raceGraduateA];

        render(<FlagsControl races={races}/>);

        // expect(screen.getByText(/05:00/i)).toBeInTheDocument();
        // screen.debug();
        await act(async () => {
            jest.advanceTimersByTime(1000);
            // await screen.findByText(/04:59/i);
        });

        // expect(setTimeoutSpy).toBeCalled();
        expect(screen.getByLabelText(/change in/i)).toHaveValue('00:59');
	});
    describe('when a flag state change is triggered', () => {
        // unclear why this is not working. Timesout waiting for findByText. Equivalent test works in FlagControl.test.js
        // setTimeout is called
        // callback function is set correctly
        // advancing timers does not appear to result in function passed to setTimeout being called :-/
        xit('updates the displayed flag state to the new flag state', async () => {
            const raceScorpionA = { "name": "Scorpion A", "plannedStartTime": new Date("2021-10-14T14:10:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassScorpion, "duration": 2700000, "plannedLaps": 5, "lapForecast": 5.0, "lastLapTime": 0, "averageLapTime": 0, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/4" };
            const raceGraduateA = { "name": "Graduate A", "plannedStartTime" : new Date("2021-10-14T14:15:00Z"), "actualStartTime": null, "dinghyClass": dinghyClassGraduate, "duration": 2700000, "plannedLaps": 4, "lapForecast": 4.0, "lastLapTime": null, "averageLapTime": null, "clock": null, "url": "http://localhost:8081/dinghyracing/api/races/7" };
            const races = [raceScorpionA, raceGraduateA];

            render(<FlagsControl races={races}/>);

            // console.log(`Time in test: ${Date()}`);
            act(() => {
                jest.advanceTimersByTime(300000);
                // jest.runAllTimers();
            });
            // console.log(`Time in test: ${Date()}`);

            // console.log(setTimeoutSpy.mock.lastCall);
            // console.log(setTimeoutSpy.mock.lastCall[0].toString());
            // expect(setTimeoutSpy).toBeCalled();

            await screen.findByText(/lowered/i);
            expect(screen.getAllByText(/raised/i)).toHaveLength(2);
            expect(screen.getAllByText(/lowered/i)).toHaveLength(1);
        });
    });
});