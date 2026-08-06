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

import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditRaceEntriesView from './EditRaceEntriesView';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import Collection from '../model/collection';
import DirectRace from '../model/direct-race';
import Entry from '../model/entry';
import { httpRootURL, wsRootURL, raceScorpionAHAL, raceGraduateAHAL, entryChrisMarshall1234ScorpionAHAL, entrySarahPascal6745ScorpionAHAL  } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../controller/sylph-controller');
vi.mock('../model/clock');

afterEach(() => {
    vi.resetAllMocks();
});

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    await act(async () => {
        render(<EditRaceEntriesView model={model} controller={controller} races={[new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)]} />);
    });
    expect(screen.getByRole('button', {name: /by sail number/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by class & sail number/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by lap times/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by position/i})).toBeInTheDocument();
    expect(screen.getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    expect(screen.getAllByText(/Scorpion/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Chris marshaLL/i)).toBeInTheDocument();
});
describe('when sorting entries', () => {
    it('sorts by the sailnumber', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<EditRaceEntriesView model={model} controller={controller} races={[raceScorpionA, raceGraduateA]} />);
        });
        const sortBySailNumber = screen.getByRole('button', {'name': /by sail number/i});
        await user.click(sortBySailNumber);
        const editRaceEntryViews = document.getElementsByClassName('edit-race-entry-view');
        expect(within(editRaceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(editRaceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
        expect(within(editRaceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('sorts by the dinghy class and sail number', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<EditRaceEntriesView model={model} controller={controller} races={[raceScorpionA, raceGraduateA]} />);
        });
        const sortByClassAndSailNumber = screen.getByRole('button', {'name': /by class & sail number/i});
        await user.click(sortByClassAndSailNumber);
        const editRaceEntryViews = document.getElementsByClassName('edit-race-entry-view');
        expect(within(editRaceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
        expect(within(editRaceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(editRaceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('sorts by the displayed number of laps and then by the displayed time to complete the last lap in descending order', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<EditRaceEntriesView model={model} controller={controller} races={[raceScorpionA, raceGraduateA]} />);
        });
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await user.click(sortByLapTimeButton);
        const lapCountInput = screen.getByTestId('lap-count-input-Scorpion-6745');
        await user.clear(lapCountInput);
        await user.type(lapCountInput, '2');
        await user.click(sortByLapTimeButton);
        const editRaceEntryViews = document.getElementsByClassName('edit-race-entry-view');
        expect(within(editRaceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(editRaceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
        expect(within(editRaceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    });
    describe('when sorting by position', () => {
        it('sorts by position in ascending order', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            await act(async () => {
                render(<EditRaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
            });
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await user.click(sortByPositionButton);
            const editRaceEntryViews = document.getElementsByClassName('edit-race-entry-view');
            expect(within(editRaceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
            expect(within(editRaceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        });
        it('sorts entries with a scoring abbreviation below other entries', async ()=> {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (url) => {
                const entryCollection = [
                    new Entry({...entryChrisMarshall1234ScorpionAHAL, leadEntryAverageLapTime: 'PT5M12.568S', sumOfLapTimes: 'PT5M12.568S', correctedTime: 'PT4M59.681S', leadEntryLastLapTime: 'PT5M12.568S', scoringAbbreviation: 'DSQ'}, {version: '"0"'}, model),
                    new Entry({...entrySarahPascal6745ScorpionAHAL, leadEntryAverageLapTime: 'PT3M32.568S', sumOfLapTimes: 'PT3M32.568S', correctedTime: 'PT3M23.804S', leadEntryLastLapTime: 'PT3M32.568S'}, {version: '"0"'}, model)
                ];
                return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
            });
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            await act(async () => {
                render(<EditRaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
            });
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await user.click(sortByPositionButton);
            const editRaceEntryViews = document.getElementsByClassName('edit-race-entry-view');
            expect(within(editRaceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(editRaceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
});