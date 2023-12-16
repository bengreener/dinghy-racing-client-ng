import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import { screen, act } from '@testing-library/react';
import RaceHeaderView from './RaceHeaderView';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { httpRootURL, wsRootURL, raceScorpionA, raceGraduateA, entriesScorpionA, entriesGraduateA } from '../model/__mocks__/test-data';
import Clock from '../model/domain-classes/clock';

// May be a good idea to mock out Clock? Would still need to test responses to tick events?
jest.mock('../model/dinghy-racing-model');
jest.mock('@stomp/stompjs');

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
        expect(screen.getByLabelText(/duration/i)).toHaveValue('00:45:00');
    });
    it('displays remaining race duration', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = new Clock();
        jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => 30000);

        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
        expect(screen.getByLabelText(/remaining/i)).toHaveValue('00:44:30');
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
        expect(screen.getByLabelText(/last/i)).toHaveValue('00:00:00');
    });
    it('displays the average lap time for the lead entry', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/average/i)).toHaveValue('00:00:00');
    });
    it('displays download results button', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByText(/download results/i)).toBeInTheDocument();
    });
});

describe('when race has not yet started', () => {
    it('displays countdown to start of race', () => {
        const startTime = new Date(Date.now() + 60000);
        const clock = new Clock(startTime);
        jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => -60000);

        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);

        customRender(<RaceHeaderView key={raceScorpionA.name+startTime.toISOString()} race={ {...raceScorpionA, 'plannedStartTime': startTime.toISOString(),'clock': clock} } />, model, controller);
        
        const outputRemaining = screen.getByLabelText(/countdown/i);
        expect(outputRemaining).toHaveValue('-00:01:00');
    });
});

describe('when a race has started', () => {
    it('updates the remaining time field to show the time remaining', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(controller, 'startRace');
        const startTime = new Date(Date.now() - 6000);
        const clock = new Clock(startTime);
        jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => 6000);

        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);

        const outputRemaining = screen.getByLabelText(/remaining/i);
        expect(outputRemaining).toHaveValue('00:44:54');
    });
    // Have not figured out to test a value has not changed after a period of time. Can revisit when need ti to do something other than stopping clock 
    it('stops the selected race', async () => {
        // const user = userEvent.setup();
        // const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        // const controller = new DinghyRacingController(model);
        // jest.spyOn(controller, 'startRace');
        // const clockSpy = jest.spyOn(Clock, 'formatDuration')

        // customRender(<RaceHeaderView race={ raceScorpionA } />, model, controller);

        // const buttonStart = screen.getByText(/start/i);
        // const buttonStop = screen.getByText(/stop/i);
        // const outputRemaining = screen.getByLabelText(/remaining/i);
        // await user.click(buttonStart);
        // await setTimeout(() => {
        //     user.click(buttonStop);
        // }, 1000);
        // await setTimeout(async () => {
        //     expect(outputRemaining).toHaveValue('00:44:59');
        // }, 2000);
        // await waitFor(() => {

        //     expect(clockSpy).toHav
        // })
        // screen.debug();
    });
});

it('updates values when a new race is selected', async () => {
    const user = userEvent.setup();
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
    expect(screen.getByLabelText(/duration/i)).toHaveValue('00:22:30');
    expect(screen.getByLabelText(/remaining/i)).toHaveValue('00:22:25');
    expect(screen.getByLabelText(/estimate/i)).toHaveValue('4.00');
});

describe('when download results button clicked', () => {
    it('calls controller download results function', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const downloadFunctionSpy = jest.spyOn(controller, 'downloadRaceResults').mockImplementation(() => {return Promise.resolve({'success': true})});
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        await user.click(screen.getByText(/download results/i));

        expect(downloadFunctionSpy).toBeCalledTimes(1);
    });
    it('displays the error message if the request to download is unsuccessful', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const downloadFunctionSpy = jest.spyOn(controller, 'downloadRaceResults').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        await act(async () => {
            await user.click(screen.getByText(/download results/i));
        });
        
        expect(screen.getByText(/oops/i)).toBeInTheDocument();
    })
});