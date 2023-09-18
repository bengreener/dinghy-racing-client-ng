import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@testing-library/react';
import RaceHeaderView from './RaceHeaderView';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { httpRootURL, wsRootURL, raceScorpionA, raceGraduateA, entriesScorpionA, entriesGraduateA } from '../model/__mocks__/test-data';
import Clock from '../model/domain-classes/clock';

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
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/remaining/i)).toHaveValue('00:45:00');
    });
    it('displays estimate for number of laps that will be completed', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/estimate/i)).toHaveValue('5');
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
});

it('displays start race button', () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
    expect(screen.getByText(/start/i)).toBeInTheDocument();
});

it('displays stop race button', () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
    expect(screen.getByText(/stop/i)).toBeInTheDocument();
});

it('starts the selected race', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    const controllerStartRaceSpy = jest.spyOn(controller, 'startRace');

    const race = {...raceScorpionA, 'clock': new Clock()};
    customRender(<RaceHeaderView race={ race } />, model, controller);
    
    const buttonStart = screen.getByText(/start/i);
    await user.click(buttonStart);
    expect(controllerStartRaceSpy).toBeCalledWith(race);
});

describe('when a race is started', () => {
    it('updates the remaining time field to show the time remaining', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(controller, 'startRace');

        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);

        const buttonStart = screen.getByText(/start/i);
        const outputRemaining = screen.getByLabelText(/remaining/i);

        await user.click(buttonStart);
        await waitFor(() => expect(outputRemaining).toHaveValue('00:44:58'), {'timeout': 3000});
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

it('resets the duration and clock when a new race is selected', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(controller, 'startRace');
    jest.spyOn(model, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceGraduateA})})
        .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesGraduateA})})
        .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'registerEntryUpdateCallback');

    const {rerender} = customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);

    const buttonStart = screen.getByText(/start/i);
    const outputRemaining = screen.getByLabelText(/remaining/i);

    await user.click(buttonStart);
    await waitFor(() => expect(outputRemaining).toHaveValue('00:44:58'), {'timeout': 3000});
    rerender(<RaceHeaderView race={{...raceGraduateA, 'clock': new Clock()}} />, model, controller);
    expect(screen.getByLabelText(/remaining/i)).toHaveValue('00:45:00');
    
    await user.click(buttonStart);
    await waitFor(() => expect(outputRemaining).toHaveValue('00:44:58'), {'timeout': 3000});
});