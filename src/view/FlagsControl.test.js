import { render, screen } from '@testing-library/react';
import FlagsControl from './FlagsControl';
import { dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet, races } from '../model/__mocks__/test-data';

beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2021-10-14T14:05:00Z"));
    jest.spyOn(global, 'setTimeout');
});

afterAll(() => {
    // jest.runOnlyPendingTimers();
    jest.runAllTimers();
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
});