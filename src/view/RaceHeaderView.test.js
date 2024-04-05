import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import { screen, act } from '@testing-library/react';
import RaceHeaderView from './RaceHeaderView';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { httpRootURL, wsRootURL, raceScorpionA, raceGraduateA, entriesScorpionA, entriesGraduateA } from '../model/__mocks__/test-data';
import Clock from '../model/domain-classes/clock';

jest.mock('../model/dinghy-racing-model');
jest.mock('@stomp/stompjs');

HTMLDialogElement.prototype.showModal = jest.fn();
HTMLDialogElement.prototype.close = jest.fn();

beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe('when rendered', () => {
    it('displays race name', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
    });    
    it('displays number of laps', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/laps(?!.)/i)).toHaveValue('5');
    });
    it('displays initial race duration', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/duration/i)).toHaveValue('45:00');
    });
    it('displays remaining race duration', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = new Clock();
        jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => 30000);

        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
        expect(screen.getByLabelText(/remaining/i)).toHaveValue('44:30');
    });
    it('displays estimate for number of laps that will be completed', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/estimate/i)).toHaveValue('5.00');
    });
    it('displays the last lap time for the lead entry', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/last/i)).toHaveValue('00:00');
    });
    it('displays the average lap time for the lead entry', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/average/i)).toHaveValue('00:00');
    });
    it('displays postpone race button', () => {
        // const raceScorpionA_copy = {...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))};
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={{...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))}} />, model, controller);
        expect(screen.getByRole('button', {name: /postpone start/i})).toBeInTheDocument();
    });
    it('displays start race button', () => {
        // const raceScorpionA_copy = {...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))};
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={{...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))}} />, model, controller);
        expect(screen.getByRole('button', {name: /start now/i})).toBeInTheDocument();
    });
});

describe('when showInRaceData is false', () => {
    it('does not display additional elements', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))} } showInRaceData={false} />, model, controller);
        expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/laps(?!.)/i)).toHaveValue('5');
        expect(screen.getByLabelText(/duration/i)).toHaveValue('45:00');
        expect(screen.queryByLabelText(/remaining/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/estimate/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/last/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/average/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: /postpone start/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /start now/i})).toBeInTheDocument();
    });
});

describe('when race has not yet started', () => {
    it('displays countdown to start of race as a positive value', () => {
        const startTime = new Date(Date.now() + 60000);
        const clock = new Clock(startTime);
        jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => -60000);

        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);

        customRender(<RaceHeaderView key={raceScorpionA.name+startTime.toISOString()} race={ {...raceScorpionA, 'plannedStartTime': startTime.toISOString(),'clock': clock} } />, model, controller);
        
        const outputRemaining = screen.getByLabelText(/countdown/i);
        expect(outputRemaining).toHaveValue('01:00');
    });
});

describe('when a race has started', () => {
    it('updates the remaining time field to show the time remaining', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(controller, 'startRace');
        const startTime = new Date(Date.now() - 6000);
        const clock = new Clock(startTime);
        jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => 6000);

        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);

        const outputRemaining = screen.getByLabelText(/remaining/i);
        expect(outputRemaining).toHaveValue('44:54');
    });
    it('no longer shows option to postpone race', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'plannedStartTime': new Date(), 'clock': new Clock(new Date())} } />, model, controller);
        expect(screen.queryByText(/postpone start/i)).not.toBeInTheDocument();
    });
    it('no longer shows option to start race', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'plannedStartTime': new Date(), 'clock': new Clock(new Date())} } />, model, controller);
        expect(screen.queryByText(/start now/i)).not.toBeInTheDocument();
    });
});

it('updates values when a new race is selected', async () => {
    const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});;
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    const clock = new Clock();
    jest.spyOn(controller, 'startRace');
    jest.spyOn(model, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceGraduateA})})
        .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesGraduateA})})
        .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'registerEntryUpdateCallback');
    jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => 5000);

    const {rerender} = customRender(<RaceHeaderView key={raceScorpionA.name+raceScorpionA.plannedStartTime.toISOString()} race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
    expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();

    rerender(<RaceHeaderView key={raceGraduateA.name+raceGraduateA.plannedStartTime.toISOString()} race={{...raceGraduateA, 'duration': 1350000, 'clock': clock}} />, model, controller);
    
    expect(screen.getByText(/graduate a/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/laps(?!.)/i)).toHaveValue('4');
    expect(screen.getByLabelText(/duration/i)).toHaveValue('22:30');
    expect(screen.getByLabelText(/remaining/i)).toHaveValue('22:25');
    expect(screen.getByLabelText(/estimate/i)).toHaveValue('4.00');
});

describe('when postpone race button clicked', () => {
    it('displays postpone race dialog', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});;
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))} } />, model, controller);
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /postpone start/i}));
        });
        expect(screen.getByRole('dialog', {'hidden': true})).toBeInTheDocument();
        expect(screen.getByRole('spinbutton', {'name': /delay/i, 'hidden': true})).toBeInTheDocument();
        expect(screen.getByRole('button', {'name': /cancel/i, 'hidden': true})).toBeInTheDocument();
        expect(screen.getByRole('button', {'name': 'Postpone', 'hidden': true})).toBeInTheDocument();
    });
});

describe('when start now button clicked', () => {
    it('starts race', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});;
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const startRaceSpy = jest.spyOn(controller, 'startRace');

        customRender(<RaceHeaderView race={ {...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))}} />, model, controller);
        const startRaceButton = screen.getByRole('button', {'name': /start now/i});
        await user.click(startRaceButton);
        expect(startRaceSpy).toHaveBeenCalled();
    });
});