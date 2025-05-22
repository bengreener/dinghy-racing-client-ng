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
import userEvent from '@testing-library/user-event';
import { act, screen, within } from '@testing-library/react';
import RaceConsole from './RaceConsole';
import { httpRootURL, wsRootURL, races, entriesScorpionA, entriesGraduateA, raceScorpionA, raceGraduateA } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import RaceType from '../model/domain-classes/race-type';

jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

HTMLDialogElement.prototype.close = jest.fn();

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
    const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 18:00 UTC intially
    
    await act(async () => {        
        customRender(<RaceConsole />, model);
    });


    const selectRace = screen.getByLabelText(/Select Race/i);
    expect(selectRace).toBeInTheDocument();
    expect(screen.getByLabelText(/fleet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fleet/i)).toBeChecked();
    expect(screen.getByLabelText(/pursuit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/session start/i)).toHaveValue(sessionStart.toISOString().substring(16, 0));
    expect(screen.getByLabelText(/session end/i)).toHaveValue(sessionEnd.toISOString().substring(16, 0));
});

it('displays races available for selection', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model);

    const optionScorpion = await screen.findByRole('option', {'name': /Scorpion A/i});
    const optionsGraduate = await screen.findByRole('option', {'name': /Graduate A/i});
    
    expect(optionScorpion).toBeInTheDocument();
    expect(optionsGraduate).toBeInTheDocument();
});

it('notifies user if races cannot be retrieved', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Http 404 Error'})});

    customRender(<RaceConsole />, model);
    const message = await screen.findByText(/Unable to load races/i);
    expect(message).toBeInTheDocument();
});

it('enables a race to be selected', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model, controller);
    const selectRace = await screen.findByLabelText(/Race/i);
    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(selectRace, 'Scorpion A');
    }); 
    
    expect(selectRace.value).toBe('Scorpion A');
});

it('enables more than one race to be selected', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model, controller);
    const selectRace = await screen.findByLabelText(/Race/i);
    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
    });
    
    const selected = [];
    for (let i = 0; i < selectRace.selectedOptions.length; i++) {
        selected.push(selectRace.selectedOptions[i].value);
    }
    expect(selected).toContain('Scorpion A');
    expect(selected).toContain('Graduate A');
});

describe('when a race is selected', () => {
    it('shows the duration of the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, 'Scorpion A');
        });
        const outputDuration = screen.getByLabelText(/duration/i)
        expect(outputDuration).toHaveValue('45:00');
    });
    it('displays the entries for the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        jest.spyOn(model, 'startRace').mockImplementation(() => {return Promise.resolve({'success': true})});
        const controllerStartRaceSpy = jest.spyOn(controller, 'startRace');
    
        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, 'Scorpion A');
        });
        
        const entry1 = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        const entry2 = await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'});
        expect(entry1).toBeInTheDocument();
        expect(entry2).toBeInTheDocument();
    });
});

describe('when more than one race is selected', () => {
    it('shows the duration of the selected races', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }
            
        });
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        });
        
        const outputDuration = await screen.findAllByLabelText(/duration/i);
        expect(outputDuration).toHaveLength(2);
        expect(outputDuration[0]).toHaveValue('45:00');
        expect(outputDuration[1]).toHaveValue('45:00');
    });
    it('displays the entries for the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }
            
        });
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        jest.spyOn(model, 'startRace').mockImplementation(() => {return Promise.resolve({'success': true})});
        const controllerStartRaceSpy = jest.spyOn(controller, 'startRace');
    
        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        });
        
        const entry1 = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        const entry2 = await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'});
        const entry3 = await screen.findByRole('status', {name: (content, node) => node.textContent === '2928'})
        expect(entry1).toBeInTheDocument();
        expect(entry2).toBeInTheDocument();
        expect(entry3).toBeInTheDocument();
    });
});

describe('when a race is unselected', () => {
    it('removes race header from display', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }
        });
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        });

        const tempRaceHeaderViews = document.getElementsByClassName('race-header-view');
        const raceHeaderViews = tempRaceHeaderViews[0].parentElement;
        
        const graduateHeader = await within(raceHeaderViews).findByText(/graduate a/i);
        expect(graduateHeader).toBeInTheDocument();
        await act(async () => {
            await user.deselectOptions(selectRace, ['Graduate A']);
        });
        expect(graduateHeader).not.toBeInTheDocument();
    });
    it('removes entries from display', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async() => {
            await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        });
        

        const graduateEntries = await within(document.getElementsByClassName('race-entries-view')[0]).findAllByText(/Graduate/i);
        graduateEntries.forEach(entry => expect(entry).toBeInTheDocument());
        await act(async () => {
            await user.deselectOptions(selectRace, ['Graduate A']);
        });
        graduateEntries.forEach(entry => expect(entry).not.toBeInTheDocument());
    });
});

describe('when an error is received', () => {
    it('displays error message', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        
        await act(async () => {        
            customRender(<RaceConsole />, model);
        });
    
        const errorMessage = screen.getByText(/Unable to load races/i);
        expect(errorMessage).toBeInTheDocument();
    });
    it('clears error message when a successful response is received', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})})
            .mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        let render;

        await act(async () => {        
            render = customRender(<RaceConsole key={Date.now()}/>, model);
        });
    
        const errorMessage = screen.getByText(/Unable to load races/i);
        expect(errorMessage).toBeInTheDocument();

        await act(async () => {
            render.rerender(<RaceConsole key={Date.now()}/>, model);
        });
        expect(screen.queryByText(/Unable to load races/i)).not.toBeInTheDocument();
    });
});

it('provides option to select start time for first race', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    
    await act(async () => {        
        customRender(<RaceConsole />, model);
    });

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toBeInTheDocument();
});

it('provides option to select end time for first race', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    
    await act(async () => {        
        customRender(<RaceConsole />, model);
    });

    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toBeInTheDocument();
});

it('registers an interest in race updates for races in session', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    const registerRaceUpdateCallbackSpy = jest.spyOn(model, 'registerRaceUpdateCallback');

    await act(async () => {
        customRender(<RaceConsole />, model, controller);
    });
    await screen.findAllByRole('option');
    
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
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races_copy})});
        await act(async () => {        
            customRender(<RaceConsole />, model);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        races_copy[0].name = 'Popeye Special';
        await act(async () => {
            model.handleRaceUpdate({'body': races_copy[0].url});
        });
        expect(screen.getByText('Popeye Special')).toBeInTheDocument();
    });
    it('removes a race that has had start time changed so it falls outside session time window', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        await act(async () => {        
            customRender(<RaceConsole />, model);
        });
        expect(screen.getByText('Handicap A')).toBeInTheDocument();
        const url = races[races.length -1].url;
        races.pop();
        await act(async () => {
            model.handleRaceUpdate({'body': url});
        });
        expect(screen.queryByText('Handicap A')).not.toBeInTheDocument();
    });
});

describe('when start time for the session is changed', () => {
    it('updates list of races', async () => {
        const user = userEvent.setup();
        const races1 = [raceScorpionA];
        const races2 = [raceScorpionA, raceGraduateA];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races2})}).mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races1})});
        await act(async () => {
            customRender(<RaceConsole />, model);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        expect(screen.queryByText('Graduate A')).not.toBeInTheDocument();
        const sessionStartInput = screen.getByLabelText(/session start/i);
        await act(async () => {
            await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
            await user.type(sessionStartInput, '2020-05-12T12:30');
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        expect(screen.getByText('Graduate A')).toBeInTheDocument();
    });
});

describe('when end time for the session is changed', () => {
    it('updates list of races', async () => {
        const user = userEvent.setup();
        const races1 = [raceScorpionA];
        const races2 = [raceScorpionA, raceGraduateA];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 74800000); // create as 18:00 UTC intially
        jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races2})}).mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races1})});
        await act(async () => {
            customRender(<RaceConsole />, model);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        expect(screen.queryByText('Graduate A')).not.toBeInTheDocument();
        const sessionEndInput = screen.getByLabelText(/session end/i);
        await act(async () => {
            await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
            await user.type(sessionEndInput, sessionEnd.toISOString().substring(16, 0));
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        expect(screen.getByText('Graduate A')).toBeInTheDocument();
    });
});

describe('when new value set for race type', () => {
    it('calls getRacesBetweenTimesForType with correct arguments', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getRacesBetweenTimesForTypeSpy = jest.spyOn(model, 'getRacesBetweenTimesForType').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
        sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 18:00 UTC intially
        sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        
        await act(async () => {
            customRender(<RaceConsole />, model);
        });
        
        await act(async () => {
            await user.click(screen.getByLabelText(/pursuit/i));
        });
    
        expect(getRacesBetweenTimesForTypeSpy).toHaveBeenCalledWith(sessionStart, sessionEnd, RaceType.PURSUIT);
    });
});