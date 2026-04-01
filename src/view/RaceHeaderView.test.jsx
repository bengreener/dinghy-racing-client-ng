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

import userEvent from '@testing-library/user-event';
import { act, render, screen, within } from '@testing-library/react';
import RaceHeaderView from './RaceHeaderView';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import Clock from '../model/clock';
import Race from '../model/race';
import { httpRootURL, wsRootURL, raceCometAHAL, raceScorpionAHAL, raceGraduateAHAL, racePursuitAHAL, } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');
vi.mock('@stomp/stompjs');

HTMLDialogElement.prototype.showModal = vi.fn();
HTMLDialogElement.prototype.close = vi.fn();

beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
});

afterEach(async () => {
    await act(async () => {
        vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
});

describe('when rendered', () => {
    describe('when not a pursuit race', () => {
        it('displays race name', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
            expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
        });    
        it('displays number of laps', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
            expect(screen.getByLabelText(/^laps$/i)).toHaveValue('5');
        });
        it('displays initial race duration', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
            expect(screen.getByLabelText(/duration/i)).toHaveValue('45:00');
        });
        it('displays remaining race duration', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            vi.spyOn(model, 'getClock').mockImplementation(() => {return {
                addTickHandler: vi.fn(),
                getElapsedTime: () => 30000,
                removeTickHandler: vi.fn()
            }});
            render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
            expect(screen.getByLabelText(/remaining/i)).toHaveValue('44:30');
        });
        describe('when race is in progress', () => {
            it('displays elapsed time for race', () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(model, 'getClock').mockImplementation(() => {return {
                    addTickHandler: vi.fn(),
                    getElapsedTime: () => 30000,
                    removeTickHandler: vi.fn()
                }});
                render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
                expect(screen.getByLabelText(/elapsed/i)).toHaveValue('00:30');
            });
        })
        describe('when last lap time greater than 0', () => {
            it('displays estimate for number of laps that will be completed', () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                render(<RaceHeaderView  model={model} controller={controller} race={new Race({...raceScorpionAHAL, lapForecast: 3.69, leadEntry: {...raceScorpionAHAL.leadEntry, lastLapTime: 'PT12M12S'}}, {version: '"0"'}, model)} />);
                expect(screen.getByLabelText(/estimate/i)).toHaveValue('3.69');
            });
            it('displays the last lap time for the lead entry', () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, leadEntry: {...raceScorpionAHAL.leadEntry, lastLapTime: 'PT12M12S'}}, {version: '"0"'}, model)} />);
                expect(screen.getByLabelText(/last/i)).toHaveValue('12:12');
            });
            it('displays the average lap time for the lead entry', () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, leadEntry: {...raceScorpionAHAL.leadEntry, lastLapTime: 'PT12M12S', averageLapTime: 'PT12M12S'}}, {version: '"0"'}, model)} />);
                expect(screen.getByLabelText(/average/i)).toHaveValue('12:12');
            });
        });
        it('displays postpone race button', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, plannedStartTime: new Date(Date.now() + 10000)}, {version: '"0"'}, model)} />);
            expect(screen.getByRole('button', {name: /postpone start/i})).toBeInTheDocument();
        });
        it('displays start race button', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, plannedStartTime: new Date(Date.now() + 10000)}, {version: '"0"'}, model)} />);
            expect(screen.getByRole('button', {name: /start now/i})).toBeInTheDocument();
        });
        it('displays lap sheet button', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, plannedStartTime: new Date(Date.now() + 10000)}, {version: '"0"'}, model)} />);
            expect(screen.getByRole('button', {name: /lap sheet/i})).toBeInTheDocument();
        });
    });
    describe('when a pursuit race', () => {
        it('displays race name', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race(racePursuitAHAL, {version: '"0"'}, model)} />);
            expect(screen.getByText(/pursuit a/i)).toBeInTheDocument();
        });    
        it('does not display number of laps', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race(racePursuitAHAL, {version: '"0"'}, model)} />);
            expect(screen.queryByLabelText(/^laps$/i)).not.toBeInTheDocument();
        });
        it('displays initial race duration', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            vi.spyOn(model, 'getClock').mockImplementation(() => {return {
                addTickHandler: vi.fn(),
                getElapsedTime: () => 30000,
                removeTickHandler: vi.fn()
            }});
            render(<RaceHeaderView model={model} controller={controller} race={new Race(racePursuitAHAL, {version: '"0"'}, model)} />);
            expect(screen.getByLabelText(/duration/i)).toHaveValue('45:00');
        });
        it('displays remaining race duration', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const clock = new Clock();
            vi.spyOn(model, 'getClock').mockImplementation(() => {return {
                addTickHandler: vi.fn(),
                getElapsedTime: () => 30000,
                removeTickHandler: vi.fn()
            }});    
            render(<RaceHeaderView model={model} controller={controller} race={new Race(racePursuitAHAL, {version: '"0"'}, model)} />);
            expect(screen.getByLabelText(/remaining/i)).toHaveValue('44:30');
        });
        describe('when race is in progress', () => {
            it('displays elapsed time for race', () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(model, 'getClock').mockImplementation(() => {return {
                    addTickHandler: vi.fn(),
                    getElapsedTime: () => 30000,
                    removeTickHandler: vi.fn()
                }});    
                render(<RaceHeaderView model={model} controller={controller} race={new Race(racePursuitAHAL, {version: '"0"'}, model)} />);
                expect(screen.getByLabelText(/elapsed/i)).toHaveValue('00:30');
            });
        });
        describe('when last lap time greater than 0', () => {
            it('does not display estimate for number of laps that will be completed', () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                render(<RaceHeaderView model={model} controller={controller} race={new Race({...racePursuitAHAL, leadEntryLastLapTime: 'PT12M12S', lapForecast: 3.69}, {version: '"0"'}, model)} />);
                expect(screen.queryByLabelText(/estimate/i)).not.toBeInTheDocument();
            });
            it('does not display the last lap time for the lead entry', () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                render(<RaceHeaderView model={model} controller={controller} race={new Race({...racePursuitAHAL, leadEntryLastLapTime: 'PT12M12S'}, {version: '"0"'}, model)} />);
                expect(screen.queryByLabelText(/last/i)).not.toBeInTheDocument();
            });
            it('does not display the average lap time for the lead entry', () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                render(<RaceHeaderView model={model} controller={controller} race={new Race({...racePursuitAHAL, leadEntryLastLapTime: 'PT12M12S', leadEntry: {...raceScorpionAHAL.leadEntry, leadEntryAverageLapTime: 'PT12M12S'}}, {version: '"0"'}, model)} />);
                expect(screen.queryByLabelText(/average/i)).not.toBeInTheDocument();
            });
        });
        it('displays postpone race button', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race({...racePursuitAHAL, plannedStartTime: new Date(Date.now() + 10000)}, {version: '"0"'}, model)} />);
            expect(screen.getByRole('button', {name: /postpone start/i})).toBeInTheDocument();
        });
        it('displays start race button', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race({...racePursuitAHAL, plannedStartTime: new Date(Date.now() + 10000)}, {version: '"0"'}, model)} />);
            expect(screen.getByRole('button', {name: /start now/i})).toBeInTheDocument();
        });
        it('displays lap sheet button', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            render(<RaceHeaderView model={model} controller={controller} race={new Race({...racePursuitAHAL, plannedStartTime: new Date(Date.now() + 10000)}, {version: '"0"'}, model)} />);
            expect(screen.getByRole('button', {name: /lap sheet/i})).toBeInTheDocument();
        });
    });
});

describe('when showInRaceData is false', () => {
    it('does not display additional elements', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, plannedStartTime: new Date(Date.now() + 10000).toISOString().replaceAll('Z', '')}, {version: '"0"'}, model)} showInRaceData={false} />);
        expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^laps$/i)).toHaveValue('5');
        expect(screen.getByLabelText(/duration/i)).toHaveValue('45:00');
        expect(screen.queryByLabelText(/countdown/i)).toHaveValue('00:10');
        expect(screen.queryByLabelText(/estimate/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/last/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/average/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: /postpone start/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /start now/i})).toBeInTheDocument();
    });
    it('displays adjust course button', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, plannedStartTime: new Date(Date.now() + 10000).toISOString().replaceAll('Z', '')}, {version: '"0"'}, model)} showInRaceData={false} />);
        expect(screen.queryByRole('button', {name: /shorten course/i})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: /adjust laps/i})).toBeInTheDocument();
    })
});

describe('when race has not yet started', () => {
    it('displays countdown to start of race as a positive value', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'getClock').mockImplementation(() => {return {
            addTickHandler: vi.fn(),
            getElapsedTime: () => -60000,
            removeTickHandler: vi.fn()
        }});
        render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, plannedStartTime: new Date(Date.now() + 60000)}, {version: '"0"'}, model)} showInRaceData={false} />);
        
        const outputRemaining = screen.getByLabelText(/countdown/i);
        expect(outputRemaining).toHaveValue('01:00');
    });
});

describe('when a race has started', () => {
    it('updates the remaining time field to show the time remaining', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'getClock').mockImplementation(() => {return {
            addTickHandler: vi.fn(),
            getElapsedTime: () => 6000,
            removeTickHandler: vi.fn()
        }});
        render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);

        const outputRemaining = screen.getByLabelText(/remaining/i);
        expect(outputRemaining).toHaveValue('44:54');
    });
    it('no longer shows option to postpone race', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'getClock').mockImplementation(() => {return {
            addTickHandler: vi.fn(),
            getElapsedTime: () => 6000,
            removeTickHandler: vi.fn()
        }});
        render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
        expect(screen.queryByText(/postpone start/i)).not.toBeInTheDocument();
    });
    it('no longer shows option to start race', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'getClock').mockImplementation(() => {return {
            addTickHandler: vi.fn(),
            getElapsedTime: () => 6000,
            removeTickHandler: vi.fn()
        }});
        render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
        expect(screen.queryByText(/start now/i)).not.toBeInTheDocument();
    });
});

it('updates values when a new race is selected', async () => {
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});;
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    const clock = new Clock();
    vi.spyOn(model, 'getClock').mockImplementation(() => {return {
        addTickHandler: vi.fn(),
        getElapsedTime: () => 5000,
        removeTickHandler: vi.fn()
    }});
    const {rerender} = render(<RaceHeaderView key={raceScorpionAHAL.name+raceScorpionAHAL.plannedStartTime} model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
    expect(screen.getByText(/scorpion a/i)).toBeInTheDocument();
    rerender(<RaceHeaderView key={raceGraduateAHAL.name+raceGraduateAHAL.plannedStartTime} model={model} controller={controller} race={new Race({...raceGraduateAHAL, duration: 'PT22M30S'}, {version: '"0"'}, model)} />);
    
    expect(screen.getByText(/graduate a/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^laps$/i)).toHaveValue('4');
    expect(screen.getByLabelText(/duration/i)).toHaveValue('22:30');
    expect(screen.getByLabelText(/remaining/i)).toHaveValue('22:25');
});

describe('when postpone race button clicked', () => {
    it('displays postpone race dialog', () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, plannedStartTime: new Date(Date.now() + 60000)}, {version: '"0"'}, model)} />);
        act(() => {
            user.click(screen.getByRole('button', {'name': /postpone start/i}));
        });
        const dialog = within(screen.getByTestId('postpone-race-dialog'));
        expect(dialog.getByRole('spinbutton', {'name': /delay/i, 'hidden': true})).toBeInTheDocument();
        expect(dialog.getByRole('button', {'name': /cancel/i, 'hidden': true})).toBeInTheDocument();
        expect(dialog.getByRole('button', {'name': 'Postpone', 'hidden': true})).toBeInTheDocument();
    });
});

describe('when race has started and no entries have sailed a lap', () => {
    it('displays Restart Race button', () => {
        vi.setSystemTime(new Date('2021-10-14T10:35:00Z'));
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
        expect(screen.getByRole('button', {name: /restart/i})).toBeInTheDocument();    
    });
});

describe('when race has started and an entry has sailed a lap', () => {
    it('does not display Restart Race button', async () => {
        vi.setSystemTime(new Date('2021-10-14T10:35:00Z'));
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, leadEntry: {...raceScorpionAHAL.leadEntry, lapsSailed: 1}, plannedStartTime: new Date(Date.now() - 60000)}, {version: '"0"'}, model)} />);
        expect(screen.queryByRole('button', {name: /restart/i})).not.toBeInTheDocument();    
    });
});

describe('when restart race button clicked', () => {
    it('displays postpone race dialog', () => {
        const user = userEvent.setup();
        vi.setSystemTime(new Date('2021-10-14T10:35:00Z'));
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        render(<RaceHeaderView model={model} controller={controller} race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
        act(() => {
            user.click(screen.getByRole('button', {'name': /restart/i}));
        });
        const dialog = within(screen.getByTestId('postpone-race-dialog'));
        expect(dialog.getByRole('spinbutton', {'name': /delay/i, 'hidden': true})).toBeInTheDocument();
        expect(dialog.getByRole('button', {'name': /cancel/i, 'hidden': true})).toBeInTheDocument();
        expect(dialog.getByRole('button', {'name': 'Postpone', 'hidden': true})).toBeInTheDocument();
    });
});

describe('when start now button clicked', () => {
    it('starts race', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const startRaceSpy = vi.spyOn(controller, 'startRace');
        await act(async () => {
            render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, plannedStartTime: new Date(Date.now() + 10000)}, {version: '"0"'}, model)} />);
        });
        const startRaceButton = screen.getByRole('button', {'name': /start now/i});
        await act(async () => {
            user.click(startRaceButton);
        });
        
        expect(startRaceSpy).toHaveBeenCalled();
    });
});

describe('when shorten course button clicked', () => {
    it('displays shorten course dialog', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await act(async () => {
            // render(<RaceHeaderView race={ {...raceScorpionA, 'plannedStartTime': new Date(Date.now() + 10000), 'clock': new Clock(new Date(Date.now() + 10000))} } />, model, controller);
            render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, plannedStartTime: new Date(Date.now() - 10000)}, {version: '"0"'}, model)} />);
        });
        
        await act(async () => {
            user.click(screen.getByRole('button', {'name': /shorten course/i}));
        });
        const dialog = within(screen.getByTestId('shorten-course-dialog'));
        expect(dialog.getByRole('spinbutton', {'name': /laps/i, 'hidden': true})).toBeInTheDocument();
        expect(dialog.getByRole('button', {'name': /cancel/i, 'hidden': true})).toBeInTheDocument();
        expect(dialog.getByRole('button', {'name': 'Update Laps', 'hidden': true})).toBeInTheDocument();
    });
});

describe('when lap sheet button clicked', () => {
    it('opens a new window for the lap sheet for that race', async () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({
            origin: 'http://localhost',
            pathname: ''
        });
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        const openSpy = vi.spyOn(window, 'open').mockImplementation(vi.fn());
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await act(async () => {
            render(<RaceHeaderView model={model} controller={controller} race={new Race({...raceScorpionAHAL, 'plannedStartTime': new Date(Date.now() + 10000)}, {version: '"0"'}, model)} />);
        });
        await act(async () => {
            user.click(screen.getByRole('button', {name: /lap sheet/i}));
        });
        expect(openSpy).toBeCalledWith('http://localhost/lap-sheet/4');
    });
});

describe('when race is a pursuit race', () => {
    describe('when 61 seconds before the end of the race', () => {
        it.skip('does not sound an audio warning to prepare for the end of the race', () => {
            // don't know how to actually test this :(
            expect(true).toBeFalsy();
        });
    });
    describe('when 60 seconds before the end of the race', () => {
        it.skip('sounds an audio warning to prepare for the end of the race', () => {
            // don't know how to actually test this :(
            expect(true).toBeFalsy();
        });
    });
    describe('when 59 seconds before the end of the race', () => {
        it.skip('does not sound an audio warning to prepare for the end of the race', () => {
            // don't know how to actually test this :(
            expect(true).toBeFalsy();
        });
    });
    describe('when 1 seconds before the end of the race', () => {
        it.skip('does not sound an audio warning for the end of the race', () => {
            // don't know how to actually test this :(
            expect(true).toBeFalsy();
        });
    });
    describe('when the end of the race', () => {
        it.skip('sounds an audio warning for the end of the race', () => {
            // don't know how to actually test this :(
            expect(true).toBeFalsy();
        });
    });
    describe('when 1 seconds after the end of the race', () => {
        it.skip('does not sound an audio warning for the end of the race', () => {
            // don't know how to actually test this :(
            expect(true).toBeFalsy();
        });
    });
});

describe('when race is a fleet race', () => {
    describe('when 60 seconds before the end of the race', () => {
        it.skip('does not sound an audio warning for the end of the race', () => {
            // don't know how to actually test this :(
            expect(true).toBeFalsy();
        })
    });
    describe('when the end of the race', () => {
        it.skip('does not sound an audio warning for the end of the race', () => {
            // don't know how to actually test this :(
            expect(true).toBeFalsy();
        });
    });
});

describe('when a lap is added to the race', () => {
    it('updates race', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getRace').mockImplementation(async () => {
            return new Race(raceCometAHAL, {version: '"0"'}, model)
        });
        const controller = new SylphController(model);
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        render(<RaceHeaderView model={model} controller={controller} race={race} />);
        await act(async () => {
            model.handleRaceEntryLapsUpdate({'body': race.url});
        });
        expect(screen.getByText('Comet A')).toBeInTheDocument();
    });
});