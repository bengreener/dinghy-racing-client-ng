import { customRender } from '../test-utilities/custom-renders';import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@testing-library/react';
import RaceHeaderView from './RaceHeaderView';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { rootURL, raceScorpionA, raceGraduateA } from '../model/__mocks__/test-data';

it('renders', () => {
    render(<RaceHeaderView race={ raceScorpionA }/>);
});

it('displays race name', () => {
    render(<RaceHeaderView race={ raceScorpionA } />);
    expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
});

it('displays initial race duration', () => {
    render(<RaceHeaderView race={ raceScorpionA } />);
    expect(screen.getByLabelText(/duration/i)).toHaveValue('00:45:00');
});

it('displays remaining race duration', () => {
    render(<RaceHeaderView race={ raceScorpionA } />);
    expect(screen.getByLabelText(/remaining/i)).toHaveValue('00:45:00');
});

it('displays start race button', () => {
    render(<RaceHeaderView race={ raceScorpionA } />);
    expect(screen.getByText(/start/i)).toBeInTheDocument();
});

it('displays stop race button', () => {
    render(<RaceHeaderView race={ raceScorpionA } />);
    expect(screen.getByText(/stop/i)).toBeInTheDocument();
});

it('starts the selected race', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(rootURL);
    const controller = new DinghyRacingController(model);
    const controllerStartRaceSpy = jest.spyOn(controller, 'startRace');

    customRender(<RaceHeaderView race={ raceScorpionA } />, model, controller);
    
    const buttonStart = screen.getByText(/start/i);
    await user.click(buttonStart);
    expect(controllerStartRaceSpy).toBeCalledWith(raceScorpionA);
});

describe('when a race is started', () => {
    it('updates the remaining time field to show the time remaining', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(controller, 'startRace');

        customRender(<RaceHeaderView race={ raceScorpionA } />, model, controller);

        const buttonStart = screen.getByText(/start/i);
        const outputRemaining = screen.getByLabelText(/remaining/i);

        await user.click(buttonStart);
        await waitFor(() => expect(outputRemaining).toHaveValue('00:44:58'), {'timeout': 3000});
    });
    // Have not figured out to test a value has not changed after a period of time. Can revisit when need ti to do something other than stopping clock 
    it('stops the selected race', async () => {
        // const user = userEvent.setup();
        // const model = new DinghyRacingModel(rootURL);
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
    const model = new DinghyRacingModel(rootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(controller, 'startRace');

    const {rerender} = customRender(<RaceHeaderView race={ raceScorpionA } />, model, controller);

    const buttonStart = screen.getByText(/start/i);
    const outputRemaining = screen.getByLabelText(/remaining/i);

    await user.click(buttonStart);
    await waitFor(() => expect(outputRemaining).toHaveValue('00:44:58'), {'timeout': 3000});
    rerender(<RaceHeaderView race={raceGraduateA} />);

    expect(screen.getByLabelText(/remaining/i)).toHaveValue('00:45:00');
    await user.click(buttonStart);
    await waitFor(() => expect(outputRemaining).toHaveValue('00:44:58'), {'timeout': 3000});
})