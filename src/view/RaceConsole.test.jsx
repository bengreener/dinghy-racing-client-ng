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
import RaceConsole from './RaceConsole';
import { httpRootURL, wsRootURL, raceScorpionAHAL, raceGraduateAHAL, raceHandicapAHAL, raceCometAHAL } from '../model/__mocks__/test-data';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import Collection from '../model/collection';
import DirectRace from '../model/direct-race';
import RaceType from '../model/race-type';
import * as storageUtilities from '../utilities/storage-utilities';

vi.mock('../model/sylph-model');
vi.mock('../controller/sylph-controller');
vi.mock('../model/clock');

HTMLDialogElement.prototype.close = vi.fn();

afterEach(() => {
    sessionStorage.removeItem('sessionStart');
    sessionStorage.removeItem('sessionEnd');
    sessionStorage.removeItem('raceType');
});

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
    const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 18:00 UTC intially
    await act(async () => {        
        render(<RaceConsole model={model} />);
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
    const model = new SylphModel(httpRootURL, wsRootURL);
    render(<RaceConsole model={model} />);
    const optionScorpion = await screen.findByRole('option', {'name': /Scorpion A/i});
    const optionsGraduate = await screen.findByRole('option', {'name': /Graduate A/i});
    expect(optionScorpion).toBeInTheDocument();
    expect(optionsGraduate).toBeInTheDocument();
});
it('notifies user if races cannot be retrieved', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const model = new SylphModel(httpRootURL, wsRootURL);
    vi.spyOn(model, 'getDirectRacesBetweenTimesForType').mockImplementationOnce(async () => {throw new Error('Http 404 Error')});
    render(<RaceConsole model={model} />);
    const message = await screen.findByText(/Unable to load races/i);
    expect(message).toBeInTheDocument();
});
it('enables a race to be selected', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    render(<RaceConsole model={model} controller={controller} />);
    const selectRace = await screen.findByLabelText(/Race/i);
    await screen.findAllByRole('option');
    await user.selectOptions(selectRace, 'Scorpion A');
    expect(selectRace.value).toBe('Scorpion A');
});
it('enables more than one race to be selected', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    render(<RaceConsole model={model} controller={controller} />);
    const selectRace = await screen.findByLabelText(/Race/i);
    await screen.findAllByRole('option');
    await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
    const selected = [];
    for (let i = 0; i < selectRace.selectedOptions.length; i++) {
        selected.push(selectRace.selectedOptions[i].value);
    };
    expect(selected).toContain('Scorpion A');
    expect(selected).toContain('Graduate A');
});
describe('when a race is selected', () => {
    it('shows the duration of the selected race', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        render(<RaceConsole model={model} controller={controller} />);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await user.selectOptions(selectRace, 'Scorpion A');
        const outputDuration = screen.getByLabelText(/duration/i)
        expect(outputDuration).toHaveValue('45:00');
    });
    it('displays the entries for the selected race', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        render(<RaceConsole model={model} controller={controller} />);
        
        const selectRace = await screen.findByLabelText(/Race/i);
        screen.findAllByRole('option');
        user.selectOptions(selectRace, 'Scorpion A');
        const entry1 = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        const entry2 = await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'});
        
        expect(entry1).toBeInTheDocument();
        expect(entry2).toBeInTheDocument();
    });
});
describe('when more than one race is selected', () => {
    it('shows the duration of the selected races', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await act(async () => {
            render(<RaceConsole model={model} controller={controller} />);
        });
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        const outputDuration = await screen.findAllByLabelText(/duration/i);
        expect(outputDuration).toHaveLength(2);
        expect(outputDuration[0]).toHaveValue('45:00');
        expect(outputDuration[1]).toHaveValue('45:00');
    });
    it('displays the entries for the selected race', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await act(async () => {
            render(<RaceConsole model={model} controller={controller} />);
        });
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        const entry1 = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        const entry2 = await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'});
        const entry3 = await screen.findByRole('status', {name: (content, node) => node.textContent === '2726'})
        expect(entry1).toBeInTheDocument();
        expect(entry2).toBeInTheDocument();
        expect(entry3).toBeInTheDocument();
    });
});
describe('when a race is unselected', () => {
    it('removes race header from display', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await act(async () => {
            render(<RaceConsole model={model} controller={controller} />);
        });        
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);

        const tempRaceHeaderViews = document.getElementsByClassName('race-header-view');
        const raceHeaderViews = tempRaceHeaderViews[0].parentElement;
        const graduateHeader = await within(raceHeaderViews).findByText(/graduate a/i);
        expect(graduateHeader).toBeInTheDocument();
        await user.deselectOptions(selectRace, ['Graduate A']);
        expect(graduateHeader).not.toBeInTheDocument();
    });
    it('removes entries from display', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await act(async () => {
            render(<RaceConsole model={model} controller={controller} />);
        });        
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        const graduateEntries = await within(document.getElementsByClassName('race-entries-view')[0]).findAllByText(/Graduate/i);
        graduateEntries.forEach(entry => expect(entry).toBeInTheDocument());
        await user.deselectOptions(selectRace, ['Graduate A']);
        graduateEntries.forEach(entry => expect(entry).not.toBeInTheDocument());
    });
});
describe('when an error is received', () => {
    it('displays error message', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getDirectRacesBetweenTimesForType').mockImplementation(async () => {throw new Error('Oops!')});
        await act(async () => {        
            render(<RaceConsole model={model} />);
        });
        const errorMessage = screen.getByText(/Oops!/i);
        expect(errorMessage).toBeInTheDocument();
    });
    it('clears error message when a successful response is received', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getDirectRacesBetweenTimesForType').mockImplementationOnce(async () => {throw new Error('Oops!')});
        let renderResult;
        await act(async () => {        
            renderResult = render(<RaceConsole key={Date.now()} model={model} />);
        });
        const errorMessage = screen.getByText(/Unable to load races/i);
        expect(errorMessage).toBeInTheDocument();
        await act(async () => {
            renderResult.rerender(<RaceConsole key={Date.now()} model={model} />);
        });
        expect(screen.queryByText(/oops!/i)).not.toBeInTheDocument();
    });
});
it('provides option to select start time for first race', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    await act(async () => {        
        render(<RaceConsole model={model} />);
    });
    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toBeInTheDocument();
});
it('provides option to select end time for first race', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    await act(async () => {        
        render(<RaceConsole model={model} />);
    });
    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toBeInTheDocument();
});
it('registers an interest in race updates for races in session', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    const registerRaceUpdateCallbackSpy = vi.spyOn(model, 'registerRaceUpdateCallback');
    await act(async () => {
        render(<RaceConsole model={model} controller={controller} />);
    });
    await screen.findAllByRole('option');
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(1, 'http://localhost:8081/dinghyracing/api/directRaces/4', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(2, 'http://localhost:8081/dinghyracing/api/directRaces/7', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(3, 'http://localhost:8081/dinghyracing/api/directRaces/17', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(4, 'http://localhost:8081/dinghyracing/api/directRaces/8', expect.any(Function));
});
describe('when races within session are changed', () => {
    it('updates recorded details', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceCometA = new DirectRace(raceCometAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        const raceHandicapA = new DirectRace(raceHandicapAHAL, {version: '"0"'}, model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const racePopeyeSpecial = new DirectRace({...raceScorpionAHAL, name: 'Popeye Special'}, {version: '"0"'}, model);
        let collection = [ raceScorpionA, raceGraduateA, raceCometA, raceHandicapA ];
        vi.spyOn(model, 'getDirectRacesBetweenTimesForType').mockImplementation(async () => {return new Collection(collection, {size: 20, totalElements: collection.length, totalPages: 0, number: 0})});
        await act(async () => {        
            render(<RaceConsole model={model} />);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        collection = [ racePopeyeSpecial, raceGraduateA, raceCometA, raceHandicapA ];
        await act(async () => {
            model.handleRaceUpdate({'body': raceScorpionA.url});
        });        
        expect(screen.getByText('Popeye Special')).toBeInTheDocument();
    });
    it('removes a race that has had start time changed so it falls outside session time window', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceCometA = new DirectRace(raceCometAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        const raceHandicapA = new DirectRace(raceHandicapAHAL, {version: '"0"'}, model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const collection = [ raceScorpionA, raceGraduateA, raceCometA, raceHandicapA ];
        vi.spyOn(model, 'getDirectRacesBetweenTimesForType').mockImplementation(async () => {return new Collection(collection, {size: 20, totalElements: collection.length, totalPages: 0, number: 0})});
        await act(async () => {        
            render(<RaceConsole model={model} />);
        });
        expect(screen.getByText('Handicap A')).toBeInTheDocument();
        collection.pop();
        await act(async () => {        
            model.handleRaceUpdate({'body': raceHandicapA.url});
        });
        expect(screen.queryByText('Handicap A')).not.toBeInTheDocument();
    });
});
describe('when start time for the session is changed', () => {
    it('updates list of races', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        let collection = [ raceScorpionA ];
        vi.spyOn(model, 'getDirectRacesBetweenTimesForType').mockImplementation(async () => {return new Collection(collection, {size: 20, totalElements: collection.length, totalPages: 0, number: 0})});
        await act(async () => {
            render(<RaceConsole model={model} />);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        expect(screen.queryByText('Graduate A')).not.toBeInTheDocument();
        collection = [ raceScorpionA, raceGraduateA ];
        const sessionStartInput = screen.getByLabelText(/session start/i);
        await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
        await user.type(sessionStartInput, '2020-05-12T12:30');
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        expect(screen.getByText('Graduate A')).toBeInTheDocument();
    });
});
describe('when end time for the session is changed', () => {
    it('updates list of races', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        let collection = [ raceScorpionA ];
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 74800000); // create as 18:00 UTC intially
        vi.spyOn(model, 'getDirectRacesBetweenTimesForType').mockImplementation(async () => {return new Collection(collection, {size: 20, totalElements: collection.length, totalPages: 0, number: 0})});
        await act(async () => {
            render(<RaceConsole model={model} />);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        expect(screen.queryByText('Graduate A')).not.toBeInTheDocument();
        collection = [ raceScorpionA, raceGraduateA ];
        const sessionEndInput = screen.getByLabelText(/session end/i);
        await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
        await user.type(sessionEndInput, sessionEnd.toISOString().substring(16, 0));
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        expect(screen.getByText('Graduate A')).toBeInTheDocument();
    });
});
describe('when new value set for race type', () => {
    it('calls getDirectRacesBetweenTimesForType with correct arguments', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const getRacesBetweenTimesForTypeSpy = vi.spyOn(model, 'getDirectRacesBetweenTimesForType');
        const sessionStart = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000); // create as 8:00 UTC intially
        sessionStart.setMinutes(sessionStart.getMinutes() + sessionStart.getTimezoneOffset()); // adjust to be equivalent to 8:00 local time
        const sessionEnd = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000); // create as 18:00 UTC intially
        sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionEnd.getTimezoneOffset()); // adjust to be equivalent to 18:00 local time
        // await act(async () => {
            render(<RaceConsole model={model} />);
        // });
        await user.click(screen.getByLabelText(/pursuit/i));
        await act(async () => {});
        expect(getRacesBetweenTimesForTypeSpy).toHaveBeenCalledWith(sessionStart, sessionEnd, RaceType.PURSUIT, null, null, {by: 'plannedStartTime', order: 'ASC'});
        // expect(getRacesBetweenTimesForTypeSpy).toHaveBeenCalledWith(RaceType.PURSUIT);
    });
});
it('registers an interest in race entry laps updates for races in session', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    const registerRaceEntryLapsUpdateCallbackSpy = vi.spyOn(model, 'registerRaceEntryLapsUpdateCallback');
    await act(async () => {
        render(<RaceConsole model={model} controller={controller} />);
    });
    await screen.findAllByRole('option');
    expect(registerRaceEntryLapsUpdateCallbackSpy).toHaveBeenCalledTimes(4);
    expect(registerRaceEntryLapsUpdateCallbackSpy).toHaveBeenNthCalledWith(1, 'http://localhost:8081/dinghyracing/api/directRaces/4', expect.any(Function));
    expect(registerRaceEntryLapsUpdateCallbackSpy).toHaveBeenNthCalledWith(2, 'http://localhost:8081/dinghyracing/api/directRaces/7', expect.any(Function));
    expect(registerRaceEntryLapsUpdateCallbackSpy).toHaveBeenNthCalledWith(3, 'http://localhost:8081/dinghyracing/api/directRaces/17', expect.any(Function));
    expect(registerRaceEntryLapsUpdateCallbackSpy).toHaveBeenNthCalledWith(4, 'http://localhost:8081/dinghyracing/api/directRaces/8', expect.any(Function));
});
// ensure up to date information is displayed if someone switchees the selected races in the session
describe('when a lap is added to an entry in a race in session', () => {
    it('updates recorded details', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceCometA = new DirectRace(raceCometAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        const raceHandicapA = new DirectRace(raceHandicapAHAL, {version: '"0"'}, model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const racePopeyeSpecial = new DirectRace({...raceScorpionAHAL, name: 'Popeye Special'}, {version: '"0"'}, model);
        let collection = [ raceScorpionA, raceGraduateA, raceCometA, raceHandicapA ];
        vi.spyOn(model, 'getDirectRacesBetweenTimesForType').mockImplementation(async () => {return new Collection(collection, {size: 20, totalElements: collection.length, totalPages: 0, number: 0})});
        await act(async () => {
            render(<RaceConsole model={model} />);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        collection = [ racePopeyeSpecial, raceGraduateA, raceCometA, raceHandicapA ];
        await act(async () => {
            model.handleRaceEntryLapsUpdate({'body': raceScorpionA.url});
        });
        expect(screen.getByText('Popeye Special')).toBeInTheDocument();
    });
});
describe('when session storage is available', () => {
    describe('when start session time has been changed from default this sesssion', () => {
        it('uses value set for session start by user', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getStartSequence');
            sessionStorage.setItem('sessionStart', '2024-08-15T14:00:00Z');
            await act(async () => {        
                render(<RaceConsole model={model} />);
            });
            const selectSessionStart = screen.getByLabelText(/session start/i);
            expect(selectSessionStart).toHaveValue('2024-08-15T15:00');
        });
    });
    describe('when end session time has been changed from default this sesssion', () => {
        it('uses value set for session end by user', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getStartSequence');
            sessionStorage.setItem('sessionEnd', '2024-08-15T10:00:00Z');
            await act(async () => {        
                render(<RaceConsole model={model} />);
            });
            const selectSessionEnd = screen.getByLabelText(/session end/i);
            expect(selectSessionEnd).toHaveValue('2024-08-15T11:00');
        });
    });
    describe('when race type has been changed from default this session', () => {
        it('uses value set for race type by user', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getStartSequence');
            sessionStorage.setItem('raceType', 'PURSUIT');
            await act(async () => {        
                render(<RaceConsole model={model} />);
            });
            const checkboxPursuit = screen.getByLabelText(/pursuit/i);
            expect(checkboxPursuit).toBeChecked();
        });
    });
});
describe('when session storage is not available', () => {
    describe('when start session time has been changed from default this sesssion', () => {
        it('uses default value for session start', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getStartSequence');
            vi.spyOn(storageUtilities, 'storageAvailable').mockImplementation(() => false);
            sessionStorage.setItem('sessionStart', '2024-08-15T14:00:00Z');
            await act(async () => {        
                render(<RaceConsole model={model} />);
            });
            const selectSessionStart = screen.getByLabelText(/session start/i);
            expect(selectSessionStart).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16));
        });
    });
    describe('when end session time has been changed from default this sesssion', () => {
        it('uses default value for session end', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getStartSequence');
            vi.spyOn(storageUtilities, 'storageAvailable').mockImplementation(() => false);
            sessionStorage.setItem('sessionEnd', '2024-08-15T10:00:00Z');
            await act(async () => {        
                render(<RaceConsole model={model} />);
            });
            const selectSessionEnd = screen.getByLabelText(/session end/i);
            expect(selectSessionEnd).toHaveValue(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 72000000).toISOString().substring(0, 16));
        });
    });
    describe('when race type has been changed from default this session', () => {
        it('uses default value for race type', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getStartSequence');
            sessionStorage.setItem('raceType', 'PURSUIT');
            await act(async () => {        
                render(<RaceConsole model={model} />);
            });
            const checkboxPursuit = screen.getByLabelText(/pursuit/i);
            expect(checkboxPursuit).not.toBeChecked();
        });
    });
});