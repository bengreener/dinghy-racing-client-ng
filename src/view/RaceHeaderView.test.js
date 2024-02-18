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
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
    });    
    it('displays number of laps', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/laps(?!.)/i)).toHaveValue('5');
    });
    it('displays initial race duration', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/duration/i)).toHaveValue('45:00');
    });
    it('displays remaining race duration', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = new Clock();
        jest.spyOn(clock, 'getElapsedTime').mockImplementationOnce(() => 30000);

        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
        expect(screen.getByLabelText(/remaining/i)).toHaveValue('44:30');
    });
    it('displays estimate for number of laps that will be completed', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/estimate/i)).toHaveValue('5.00');
    });
    it('displays the last lap time for the lead entry', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/last/i)).toHaveValue('00:00');
    });
    it('displays the average lap time for the lead entry', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByLabelText(/average/i)).toHaveValue('00:00');
    });
    it('displays download results button', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        expect(screen.getByText(/download results/i)).toBeInTheDocument();
    });
    it('displays postpone race button', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        // const raceScorpionA_copy = {...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))};
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={{...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))}} />, model, controller);
        expect(screen.getByRole('button', {name: /postpone start/i})).toBeInTheDocument();
    });
    it('displays start race button', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        // const raceScorpionA_copy = {...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))};
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={{...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))}} />, model, controller);
        expect(screen.getByRole('button', {name: /start now/i})).toBeInTheDocument();
    });
});

describe('when race has not yet started', () => {
    it('displays countdown to start of race as a positive value', () => {
        HTMLDialogElement.prototype.close = jest.fn();
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
        HTMLDialogElement.prototype.close = jest.fn();
        // const user = userEvent.setup();
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
    // Have not figured out to test a value has not changed after a period of time. Can revisit when need to to do something other than stopping clock 
    xit('stops the selected race', async () => {
        // const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
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
    it('no longer shows option to postpone race', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'plannedStartTime': new Date(), 'clock': new Clock(new Date())} } />, model, controller);
        expect(screen.queryByText(/postpone start/i)).not.toBeInTheDocument();
    });
    it('no longer shows option to start race', () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'plannedStartTime': new Date(), 'clock': new Clock(new Date())} } />, model, controller);
        expect(screen.queryByText(/start now/i)).not.toBeInTheDocument();
    });
});

it('updates values when a new race is selected', async () => {
    HTMLDialogElement.prototype.close = jest.fn();
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

describe('when download results button clicked', () => {
    it('calls controller download results function', async () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});;
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const downloadFunctionSpy = jest.spyOn(controller, 'downloadRaceResults').mockImplementation(() => {return Promise.resolve({'success': true})});
        customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': new Clock()} } />, model, controller);
        await user.click(screen.getByText(/download results/i));

        expect(downloadFunctionSpy).toBeCalledTimes(1);
    });
    it('displays the error message if the request to download is unsuccessful', async () => {
        HTMLDialogElement.prototype.close = jest.fn();
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});;
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

describe('when postpone race button clicked', () => {
    it('displays postpone race dialog', async () => {
        HTMLDialogElement.prototype.showModal = jest.fn();
        HTMLDialogElement.prototype.close = jest.fn();
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
        HTMLDialogElement.prototype.close = jest.fn();
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

describe('when race header first displayed', () => {
    describe('when more than 11 minutes before race', () => {
        it('warning flag indicator does not have class of warning-flag-prepare-raise', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -660001);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).not.toMatch(/warning-flag-prepare-raise/);
        });
        it('does not have class of blue-peter-prepare-raise', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -660001);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).not.toMatch(/blue-peter-prepare-raise/);
        });
        it('warning flag indicator does not have class of warning-flag-raised', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -660001);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).not.toMatch(/warning-flag-raised/);
        });
        it('does not have class of blue-peter-raised', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -660001);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).not.toMatch(/blue-peter-raised/);
        });
    });
    
    describe('when 11 minutes before race starts', () => {
        it('warning flag indicator has a class of warning-flag-prepare-raise', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            const getElapsedTimeSpy = jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -660000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).toMatch(/warning-flag-prepare-raise/);
        });
    });
    
    describe('when 10 minutes before race starts', () => {
        it('warning flag indicator has a class of warning-flag-raised', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -600000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).toMatch(/warning-flag-raised/);
        });
        it('warning flag indicator does not have class of warning-flag-prepare-raise', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -600000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).not.toMatch(/warning-flag-prepare-raise/);
        });
    });
    
    describe('when 6 minutes before race starts', () => {
        it('blue peter flag indicator has a class of blue-peter-prepare-raise', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -360000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('BP').getAttribute('class')).toMatch(/blue-peter-prepare-raise/);
        });
    });
    
    describe('when 5 minutes before race starts', () => {
        it('blue peter flag indicator has a class of blue-peter-raised', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -300000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('BP').getAttribute('class')).toMatch(/blue-peter-raised/);
        });
        it('blue peter flag indicator does not have a class of blue-peter-prepare-raise', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -300000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('BP').getAttribute('class')).not.toMatch(/blue-peter-prepare-raise/);
        });
    });
    
    describe('when 1 minutes before race starts', () => {
        it('warning flag indicator has a class of warning-flag-prepare-lower', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -60000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).toMatch(/warning-flag-prepare-lower/);
        });
        it('blue peter indicator has a class of blue-peter-prepare-lower', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -60000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('BP').getAttribute('class')).toMatch(/blue-peter-prepare-lower/);
        });
        it('warning flag indicator does not have class of warning-flag-raised', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -60000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).not.toMatch(/warning-flag-raised/);
        });
        it('blue peter indicator does not have a class of blue-peter-raised', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => -60000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('BP').getAttribute('class')).not.toMatch(/blue-peter-raised/);
        });
    });
    
    describe('when 0 minutes before race starts', () => {
        it('warning flag indicator has a class of warning-flag-lowered', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => 0);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).toMatch(/warning-flag-lowered/);
        });
        it('blue peter indicator has a class of blue-peter-lowered', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => 0);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('BP').getAttribute('class')).toMatch(/blue-peter-lowered/);
        });
        it('warning flag indicator does not have a class of warning-flag-prepare-lower', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => 0);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('WF').getAttribute('class')).not.toMatch(/warning-flag-prepare-lower/);
        });
        it('blue peter indicator does not have a class of blue-peter-prepare-lower', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const clock = new Clock();
            jest.spyOn(clock, 'getElapsedTime').mockImplementation(() => 0);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            expect(screen.getByText('BP').getAttribute('class')).not.toMatch(/blue-peter-prepare-lower/);
        });
    });
});

describe('when race header displayed', () => {
    describe('when clock ticks from 11 minutes and 2 seconds before race to 11 minutes and one second before race', () => {
        it('warning flag indicator has a class of warning-flag-lowered', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 662000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('11:01');
            expect(screen.getByText('WF').getAttribute('class')).toMatch(/warning-flag-lowered/);
        });
        it('prepare audio warning is not present', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 662000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('11:01');
            expect(screen.queryByTestId('prepare-sound-warning-audio')).not.toBeInTheDocument();
        });
        it('act audio warning is not present', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 662000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('11:01');
            expect(screen.queryByTestId('act-sound-warning-audio')).not.toBeInTheDocument();
        });
    });
    describe('when clock ticks from 11 minutes and 1 second before race to 11 minutes before race', () => {
        it('warning flag indicator has a class of warning-flag-prepare-raise', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 661000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('11:00');
            expect(screen.getByText('WF').getAttribute('class')).toMatch(/warning-flag-prepare-raise/);
        });
        it('prepare audio warning is present', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 661000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('11:00');
            expect(screen.queryByTestId('prepare-sound-warning-audio')).toBeInTheDocument();
        });
    });
    describe('when clock ticks from 10 minutes and 1 second before race to 10 minutes before race', () => {
        it('warning flag indicator has a class of warning-flag-raised', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 601000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                // jest.advanceTimersToNextTimer();
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('10:00');
            expect(screen.getByText('WF').getAttribute('class')).toMatch(/warning-flag-raised/);
        });
        it('act audio warning is present', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 601000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('10:00');
            expect(screen.queryByTestId('act-sound-warning-audio')).toBeInTheDocument();
        });
    });
    describe('when clock ticks from 6 minutes and 1 second before race to 6 minutes before race', () => {
        it('blue peter flag indicator has a class of blue-peter-prepare-raise', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 361000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('06:00');
            expect(screen.getByText('BP').getAttribute('class')).toMatch(/blue-peter-prepare-raise/);
        });
        it('prepare audio warning is present', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 361000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('06:00');
            expect(screen.queryByTestId('prepare-sound-warning-audio')).toBeInTheDocument();
        });
    });
    describe('when clock ticks from 5 minutes and 1 second before race to 5 minutes before race', () => {
        it('blue peter flag indicator has a class of blue-peter-raised', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 301000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('05:00');
            expect(screen.getByText('BP').getAttribute('class')).toMatch(/blue-peter-raised/);
        });
        it('act audio warning is present', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 301000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText(/05:00/);
            expect(screen.queryByTestId('act-sound-warning-audio')).toBeInTheDocument();
        });
    });
    describe('when clock ticks from 1 minutes and 1 second before race to 1 minutes before race', () => {
        it('warning flag indicator has a class of warning-flag-prepare-lower', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 61000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('01:00');
            expect(screen.getByText('WF').getAttribute('class')).toMatch(/warning-flag-prepare-lower/);
        });
        it('blue peter flag indicator has a class of blue-peter-prepare-lower', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 61000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText('01:00');
            expect(screen.getByText('BP').getAttribute('class')).toMatch(/blue-peter-prepare-lower/);
        });
        it('prepare audio warning is present', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 61000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByText(/01:00/);
            expect(screen.queryByTestId('prepare-sound-warning-audio')).toBeInTheDocument();
        });
    });
    describe('when clock ticks from 0 minutes and 1 second before race to 0 minutes before race', () => {
        it('warning flag indicator has a class of warning-flag-lowered', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 1000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByLabelText(/remaining/i);
            expect(screen.getByText('WF').getAttribute('class')).toMatch(/warning-flag-lowered/);
        });
        it('blue peter flag indicator has a class of blue-peter-lowered', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 1000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByLabelText(/remaining/i);
            expect(screen.getByText('BP').getAttribute('class')).toMatch(/blue-peter-lowered/);
        });
        it('act audio warning is present', async () => {
            HTMLDialogElement.prototype.close = jest.fn();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            const startTime = Math.round(Date.now() / 1000) * 1000; // calculate a start time without fractional second element to avoid issues when advancing timers
            const clock = new Clock(startTime + 1000);
            customRender(<RaceHeaderView race={ {...raceScorpionA, 'clock': clock} } />, model, controller);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await screen.findByLabelText(/remaining/i);
            expect(screen.queryByTestId('act-sound-warning-audio')).toBeInTheDocument();
        });
    });
});