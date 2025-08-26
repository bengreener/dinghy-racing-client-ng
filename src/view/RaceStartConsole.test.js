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
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaceStartConsole from './RaceStartConsole';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import { httpRootURL, wsRootURL, races, raceScorpionA, raceGraduateA, raceCometA, raceHandicapA, dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet, racePursuitA, fleetHandicap } from '../model/__mocks__/test-data';
import SessionStartSequence from '../model/domain-classes/session-start-sequence';
import RaceType from '../model/domain-classes/race-type';
import { SortOrder } from '../model/dinghy-racing-model';
import Clock from '../model/domain-classes/clock';
import * as storageUtilities from '../utilities/storage-utilities';

vi.mock('../model/dinghy-racing-model');
vi.mock('../controller/dinghy-racing-controller');
vi.mock('../model/domain-classes/clock');

HTMLDialogElement.prototype.close = vi.fn();
HTMLMediaElement.prototype.play = vi.fn();

const formatOptions = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
};
const timeFormat = new Intl.DateTimeFormat('utc', formatOptions);

beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers().setSystemTime(new Date('2021-10-14T10:25:00Z'));
    vi.spyOn(global, 'setTimeout');
});

afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    sessionStorage.removeItem('sessionStart');
    sessionStorage.removeItem('sessionEnd');
    sessionStorage.removeItem('raceType');
});

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    
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

describe('when no races selected', () => {
    it('renders', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);

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
});

it('displays races included in selected session', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const optionScorpion = await screen.findByRole('option', {'name': /Scorpion A/i});
    const optionsGraduate = await screen.findByRole('option', {'name': /Graduate A/i});
    
    expect(optionScorpion).toBeInTheDocument();
    expect(optionsGraduate).toBeInTheDocument();
});

it('calls DinghyRacingModel.getRacesBetweenTimesForType with correct arguments', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    const getRacesBetweenTimesForTypeSpy = vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
    sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
    const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 18:00 UTC intially
    sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    expect(getRacesBetweenTimesForTypeSpy).toHaveBeenCalledWith(sessionStart, sessionEnd, RaceType.FLEET, null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING});
});

it('calls DinghyRacingModel.getStartSequence with correct arguments', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    const getStartSequenceSpy = vi.spyOn(model, 'getStartSequence');
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    expect(getStartSequenceSpy).toHaveBeenCalledWith(races, RaceType.FLEET);
});

describe('when new value set for race type', () => {
    it('calls DinghyRacingModel.getRacesBetweenTimesForType with correct arguments', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const getRacesBetweenTimesForTypeSpy = vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races, model})});
        const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
        sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 18:00 UTC intially
        sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        
        await act(async () => {        
            customRender(<RaceStartConsole />, model, controller);
        });
        
        await act(async () => {
            await user.click(screen.getByLabelText(/pursuit/i));
        });
    
        expect(getRacesBetweenTimesForTypeSpy).toHaveBeenCalledWith(sessionStart, sessionEnd, RaceType.PURSUIT, null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING});
    });
    it('calls DinghyRacingModel.getStartSequence with correct arguments', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        const getStartSequenceSpy = vi.spyOn(model, 'getStartSequence');

        await act(async () => {        
            customRender(<RaceStartConsole />, model, controller);
        });

        await act(async () => {
            await user.click(screen.getByLabelText(/pursuit/i));
        });

        expect(getStartSequenceSpy).toHaveBeenCalledWith(races, RaceType.PURSUIT);
    });
});

it('defaults session start to 8:00 today', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getStartSequence');
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16));
});

it('defaults session end to 20:00 of today', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
    
    await act(async () => {        
        customRender(<RaceStartConsole />, model, controller);
    });

    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000).toISOString().substring(0, 16));
});

it('provides countdown value and message to Countdown control', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    vi.spyOn(model, 'getStartSequence').mockImplementation(() => {
        return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence([ raceScorpionA ], new Clock())});
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
    vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });

    const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
    expect(within(flagIndicators).getByText(/scorpion class/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/blue peter/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/graduate class/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/handicap class/i)).toBeInTheDocument();
    expect(within(flagIndicators).getByText(/comet class/i)).toBeInTheDocument();
});

it('displays initial state for each flag', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => Promise.resolve({success:true, domainObject: races}));
    vi.spyOn(model, 'getStartSequence');

    let container;
    await act(async () => {
        ({ container } = customRender(<RaceStartConsole />, model, controller));
    });

    const signalsPanel = container.getElementsByClassName('signals-panel')[0];
    expect(within(signalsPanel).getAllByText(/raised/i)).toHaveLength(3);
    expect(within(signalsPanel).getAllByText(/lowered/i)).toHaveLength(2);
});

it('displays time to next flag state change for each flag', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(races, model.getClock())})});

    let container;
    await act(async () => {
        ({ container } = customRender(<RaceStartConsole />, model, controller));
    });

    const signalsPanel = container.getElementsByClassName('signals-panel')[0];
    expect(within(signalsPanel).getAllByText(/00:00/i)).toHaveLength(2);
    expect(within(signalsPanel).getAllByText(/05:00/i)).toHaveLength(2);
    expect(within(signalsPanel).getAllByText(/10:00/i)).toHaveLength(1);
});

it('displays race headers for races in session', async () => {
    const races = [raceScorpionA, raceGraduateA, raceCometA, {...raceHandicapA, duration: 2100000, plannedLaps: 3}];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races, model})});
    vi.spyOn(model, 'getStartSequence');

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
    vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races, model})});
    vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});

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
    const races = [raceScorpionA, raceGraduateA];

    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(races, new Clock())})});

    await act(async () => {
        customRender(<RaceStartConsole />, model, controller);
    });
    const actionRows = screen.getAllByRole('row');
    expect(actionRows).toHaveLength(4);
    expect(within(actionRows[1]).getByText(timeFormat.format(new Date('2021-10-14T10:25:00Z')))).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/raise blue peter/i)).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/raise graduate class flag/i)).toBeInTheDocument();
    expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(timeFormat.format(new Date('2021-10-14T10:30:00Z')))).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/lower scorpion class flag/i)).toBeInTheDocument();
    expect(within(actionRows[2]).getByText(/05:00/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(timeFormat.format(new Date('2021-10-14T10:35:00Z')))).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/lower graduate class flag/i)).toBeInTheDocument();
    expect(within(actionRows[3]).getByText(/10:00/i)).toBeInTheDocument();
});

describe('when clock ticks', () => {
    it('updates time to next flag state change', async () => {
        const races = [raceScorpionA, raceGraduateA];

        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        // const clock = new Clock();
        // clock.start();
        vi.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(races, model.getClock())})});

        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });

        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
        expect(await within(flagIndicators).findAllByText(/04:59/i)).toHaveLength(1);
        expect(await within(flagIndicators).findAllByText(/09:59/i)).toHaveLength(2);
	});
    describe('when a flag state change is triggered', () => {
        it('updates the displayed flag state to the new flag state', async () => {
            const races = [raceScorpionA, raceGraduateA];

            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(races, model.getClock())})});

            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });

            act(() => {
                vi.advanceTimersByTime(300000);
            });

            expect(await screen.findAllByText(/raised/i)).toHaveLength(2);
            expect(await screen.findAllByText(/lowered/i)).toHaveLength(1);
        });
    });
    it('updates countdown for actions', async () => {
        const races = [raceScorpionA, raceGraduateA];

        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(races, model.getClock())})});

        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        const actionRows = screen.getAllByRole('row');
        expect(actionRows).toHaveLength(3);
        expect(within(actionRows[1]).getByText(timeFormat.format(new Date('2021-10-14T10:30:00Z')))).toBeInTheDocument();
        expect(within(actionRows[1]).getByText(/lower scorpion class flag/i)).toBeInTheDocument();
        expect(within(actionRows[1]).getByText(/04:59/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(timeFormat.format(new Date('2021-10-14T10:35:00Z')))).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/lower graduate class flag/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/09:59/i)).toBeInTheDocument();
    });
    describe('when ticks to 1 minute before a race start state change', () => {
        // unsure how to test audio using a variable to control audio rather than <audio> element
        it.skip('prepare for race start state change audio is present in document', async () => {
            const races = [{...raceScorpionA}, raceGraduateA];
            vi.setSystemTime(new Date('2021-10-14T10:23:59Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });
            act(() => {
                vi.advanceTimersByTime(1000);
            });
            const audio = screen.queryByTestId('prepare-sound-warning-audio');
            expect(audio).toBeInTheDocument();
        });
    });
    describe('when ticks to 59 seconds before a race start state change', () => {
        // unsure how to test audio using a variable to control audio rather than <audio> element
        it.skip('prepare for race start state change audio is not present in document', async () => {
            const races = [{...raceScorpionA}, raceGraduateA];
            vi.setSystemTime(new Date('2021-10-14T10:24:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });
            act(() => {
                vi.advanceTimersByTime(1000);
            });
            const audio = screen.queryByTestId('prepare-sound-warning-audio');
            expect(audio).not.toBeInTheDocument();
        });
    });
    describe('when ticks to time for a race start state change', () => {
        // unsure how to test audio using a variable to control audio rather than <audio> element
        it.skip('race start state change audio is present in document', async () => {
            const races = [{...raceScorpionA}, {...raceGraduateA}];
            vi.setSystemTime(new Date('2021-10-14T10:24:59Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });act(() => {
                vi.advanceTimersByTime(1000);
            });
            const audio = screen.queryByTestId('act-sound-warning-audio');
            expect(audio).toBeInTheDocument();
        });
    })
    describe('when ticks to 1 second after a race start state change', () => {
        // unsure how to test audio using a variable to control audio rather than <audio> element
        it.skip('race start state change audio is not present in document', async () => {
            const races = [{...raceScorpionA}, {...raceGraduateA}];
            vi.setSystemTime(new Date('2021-10-14T10:25:00Z'));
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
            await act(async () => {
                customRender(<RaceStartConsole />, model, controller);
            });act(() => {
                vi.advanceTimersByTime(1000);
            });
            const audio = screen.queryByTestId('act-sound-warning-audio');
            expect(audio).not.toBeInTheDocument();
        });
    })
});

it('registers an interest in race updates for races in session', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races, model})});
    vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
    const registerRaceUpdateCallbackSpy = vi.spyOn(model, 'registerRaceUpdateCallback');

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
        vi.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(races_copy, model.getClock())})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        expect(screen.getAllByText('Scorpion A')[0]).toBeInTheDocument();
        races_copy[0].name = 'Popeye Special';
        await act(async () => {
            vi.advanceTimersByTime(1000); // advance time so RaceStartConsole knows it needs to rerender
            model.handleRaceUpdate({'body': races_copy[0].url});
        });
        expect(screen.getAllByText('Popeye Special')[0]).toBeInTheDocument();
    });
    it('removes a race that has had start time changed so it falls outside session time window', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races, model})});
        vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        expect(screen.getAllByText('Handicap A')).toHaveLength(2);
        const url = races[races.length -1].url;
        races.pop();
        await act(async () => {
            vi.advanceTimersByTime(1000); // advance time so RaceStartConsole knows it needs to rerender
            model.handleRaceUpdate({'body': url});
        });
        expect(screen.queryAllByText('Handicap A')).toHaveLength(0);
    });
});

it('registers an interest in fleet updates for races in session', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA]})});
    vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence([raceScorpionA, raceGraduateA, raceCometA, raceHandicapA])})});
    const registerFleetUpdateCallbackSpy = vi.spyOn(model, 'registerFleetUpdateCallback');

    customRender(<RaceStartConsole />, model, controller);
    await screen.findAllByText(/scorpion a/i);

    expect(registerFleetUpdateCallbackSpy).toHaveBeenNthCalledWith(1, 'http://localhost:8081/dinghyracing/api/fleets/1', expect.any(Function));
    expect(registerFleetUpdateCallbackSpy).toHaveBeenNthCalledWith(2, 'http://localhost:8081/dinghyracing/api/fleets/3', expect.any(Function));
    expect(registerFleetUpdateCallbackSpy).toHaveBeenNthCalledWith(3, 'http://localhost:8081/dinghyracing/api/fleets/4', expect.any(Function));
    expect(registerFleetUpdateCallbackSpy).toHaveBeenNthCalledWith(4, 'http://localhost:8081/dinghyracing/api/fleets/2', expect.any(Function));
});

describe('when the fleet associated with the race is changed', () => {
    it('displays updated start sequence', async () => {
        const fleet = {...fleetHandicap, dinghyClasses: [dinghyClassComet, dinghyClassScorpion]};
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': [{...racePursuitA, fleet: fleet, dinghyClasses: [dinghyClassScorpion]}], model})});
        vi.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence([{...racePursuitA, fleet: fleet, dinghyClasses: [dinghyClassScorpion]}], model.getClock())})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        expect(screen.queryAllByText(/scorpion/i)[0]).toBeInTheDocument();

        fleet.dinghyClasses = [dinghyClassScorpion];
        await act(async () => {
            vi.advanceTimersByTime(1000); // advance time so RaceStartConsole knows it needs to rerender
            model.handleFleetUpdate({'body': fleet.url});
        });
        
        expect(screen.queryAllByText(/scorpion/i)).toHaveLength(0);
    });
});

describe('when 6 minutes 1 second before start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    it.skip('prepare for race start state change audio is not present in document', async () => {
        const races = [{...raceScorpionA}, raceGraduateA];
        vi.setSystemTime(new Date('2021-10-14T10:23:59Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('prepare-sound-warning-audio');
        expect(audio).not.toBeInTheDocument();
    });
});

describe('when 6 minutes before start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    it.skip('prepare for race start state change audio is present in document', async () => {
        const races = [{...raceScorpionA}, raceGraduateA];
        vi.setSystemTime(new Date('2021-10-14T10:24:00Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('prepare-sound-warning-audio');
        expect(audio).toBeInTheDocument();
    });
});

describe('when 5 minutes 59 second before start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    it.skip('prepare for race start state change audio is not present in document', async () => {
        const races = [{...raceScorpionA}, raceGraduateA];
        vi.setSystemTime(new Date('2021-10-14T10:24:01Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('prepare-sound-warning-audio');
        expect(audio).not.toBeInTheDocument();
    });
});

describe('when 1 second before start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    it.skip('race start state change audio is not present in document', async () => {
        const races = [{...raceScorpionA}, {...raceGraduateA}];
        vi.setSystemTime(new Date('2021-10-14T10:29:59Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('act-sound-warning-audio');
        expect(audio).not.toBeInTheDocument();
    });
});

describe('when start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    it.skip('race start state change audio is present in document', async () => {
        const races = [{...raceScorpionA}, {...raceGraduateA}];
        vi.setSystemTime(new Date('2021-10-14T10:20:00Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('act-sound-warning-audio');
        expect(audio).toBeInTheDocument();
    });
});

describe('when 1 second after start of first race', () => {
    // unsure how to test audio using a variable to control audio rather than <audio> element
    it.skip('prepare for race start state change audio is not present in document', async () => {
        const races = [{...raceScorpionA}, {...raceGraduateA}];
        vi.setSystemTime(new Date('2021-10-14T10:30:01Z'));
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races, model)})});
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
        const audio = screen.queryByTestId('act-sound-warning-audio');
        expect(audio).not.toBeInTheDocument();
    });
});

describe('when selected races changed', () => {
    it('displays race headers for selected races', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});

        const races = [raceScorpionA, raceGraduateA, raceCometA, {...raceHandicapA, duration: 2100000, plannedLaps: 3}];

        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        vi.spyOn(model, 'getStartSequence');//.mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new StartSequence(races)})});
    
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });

        const raceHeaders = (screen.getByRole('heading', {name: /^races$/i})).parentNode;
        let raceA = within(raceHeaders).getByText(/scorpion a/i);
        expect(raceA).toBeInTheDocument();

        const selectRace = await screen.findByLabelText(/Race/i);
        await act(async () => {
            user.deselectOptions(selectRace, ['Scorpion A']);
        });
        raceA = within(raceHeaders).queryByText(/scorpion a/i);
        expect(raceA).not.toBeInTheDocument();
    });
    it('calls DinghyRacingModel.getStartSequence with correct arguments', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA]; // was dropping handicap race when full test suit run for some reason so redlcare as appears to resolve :-/
        const selectedRaces = [raceGraduateA, raceCometA, raceHandicapA];
        vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        const getStartSequenceSpy = vi.spyOn(model, 'getStartSequence');

        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });

        const selectRace = await screen.findByLabelText(/Race/i);
        await act(async () => {
            user.deselectOptions(selectRace, ['Scorpion A']);
        });
        expect(getStartSequenceSpy).toHaveBeenLastCalledWith(selectedRaces, RaceType.FLEET);
    });
    it('displays race names and blue peter', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const selectedRaces = [raceGraduateA, raceCometA, raceHandicapA];
        vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        vi.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(selectedRaces, new Clock())})}).mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(races, new Clock())})});
    
        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });
    
        const selectRace = await screen.findByLabelText(/Race/i);
        await act(async () => {
            user.deselectOptions(selectRace, ['Scorpion A']);
        });

        const flagIndicators = (screen.getByRole('heading', {name: 'Flags'})).parentNode;
        expect(within(flagIndicators).queryByText(/scorpion class/i)).not.toBeInTheDocument();
        expect(within(flagIndicators).getByText(/blue peter/i)).toBeInTheDocument();
        expect(within(flagIndicators).getByText(/graduate class/i)).toBeInTheDocument();
        expect(within(flagIndicators).getByText(/handicap class/i)).toBeInTheDocument();
        expect(within(flagIndicators).getByText(/comet class/i)).toBeInTheDocument();
    });
    it('displays actions to start races in session', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const races = [raceScorpionA, raceGraduateA];
        const selectedRaces = [raceGraduateA];

        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(selectedRaces, new Clock())})}).mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': new SessionStartSequence(races, new Clock())})});

        await act(async () => {
            customRender(<RaceStartConsole />, model, controller);
        });

        const selectRace = await screen.findByLabelText(/Race/i);
        await act(async () => {
            user.deselectOptions(selectRace, ['Scorpion A']);
        });

        const actionRows = screen.getAllByRole('row');
        expect(actionRows).toHaveLength(4);
        expect(within(actionRows[1]).getByText(timeFormat.format(new Date('2021-10-14T10:25:00Z')))).toBeInTheDocument();
        expect(within(actionRows[1]).getByText(/raise graduate class flag/i)).toBeInTheDocument();
        expect(within(actionRows[1]).getByText(/00:00/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(timeFormat.format(new Date('2021-10-14T10:30:00Z')))).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/raise blue peter/i)).toBeInTheDocument();
        expect(within(actionRows[2]).getByText(/05:00/i)).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(timeFormat.format(new Date('2021-10-14T10:35:00Z')))).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(/lower graduate class flag/i)).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(/lower blue peter/i)).toBeInTheDocument();
        expect(within(actionRows[3]).getByText(/10:00/i)).toBeInTheDocument();
    });
});

describe('when session storage is available', () => {
    describe('when start session time has been changed from default this sesssion', () => {
        it('uses value set for session start by user', async () => {
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');
    
            sessionStorage.setItem('sessionStart', '2024-08-15T14:00:00Z');
            
            await act(async () => {        
                customRender(<RaceStartConsole />, model, controller);
            });
    
            const selectSessionStart = screen.getByLabelText(/session start/i);
            expect(selectSessionStart).toHaveValue('2024-08-15T15:00');
        });
    });
    describe('when end session time has been changed from default this sesssion', () => {
        it('uses value set for session end by user', async () => {
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');
    
            sessionStorage.setItem('sessionEnd', '2024-08-15T10:00:00Z');
            
            await act(async () => {        
                customRender(<RaceStartConsole />, model, controller);
            });
    
            const selectSessionEnd = screen.getByLabelText(/session end/i);
            expect(selectSessionEnd).toHaveValue('2024-08-15T11:00');
        });
    });
    describe('when race type has been changed from default this session', () => {
        it('uses value set for race type by user', async () => {
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');
    
            sessionStorage.setItem('raceType', 'PURSUIT');
            
            await act(async () => {        
                customRender(<RaceStartConsole />, model, controller);
            });
    
            const checkboxPursuit = screen.getByLabelText(/pursuit/i);
            expect(checkboxPursuit).toBeChecked();
        });
    });
});

describe('when session storage is not available', () => {
    describe('when start session time has been changed from default this sesssion', () => {
        it('uses default value for session start', async () => {
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');
            vi.spyOn(storageUtilities, 'storageAvailable').mockImplementation(() => false);
    
            sessionStorage.setItem('sessionStart', '2024-08-15T14:00:00Z');
            
            await act(async () => {        
                customRender(<RaceStartConsole />, model, controller);
            });
    
            const selectSessionStart = screen.getByLabelText(/session start/i);
            expect(selectSessionStart).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16));
        });
    });
    describe('when end session time has been changed from default this sesssion', () => {
        it('uses default value for session end', async () => {
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');
            vi.spyOn(storageUtilities, 'storageAvailable').mockImplementation(() => false);
    
            sessionStorage.setItem('sessionEnd', '2024-08-15T10:00:00Z');
            
            await act(async () => {        
                customRender(<RaceStartConsole />, model, controller);
            });
    
            const selectSessionEnd = screen.getByLabelText(/session end/i);
            expect(selectSessionEnd).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000).toISOString().substring(0, 16));
        });
    });
    describe('when race type has been changed from default this session', () => {
        it('uses default value for race type', async () => {
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            vi.spyOn(model, 'getStartSequence');
    
            sessionStorage.setItem('raceType', 'PURSUIT');
            
            await act(async () => {        
                customRender(<RaceStartConsole />, model, controller);
            });
    
            const checkboxPursuit = screen.getByLabelText(/pursuit/i);
            expect(checkboxPursuit).not.toBeChecked();
        });
    });
});