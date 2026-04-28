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

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SylphModel from '../model/sylph-model';
import RaceEntriesView from './RaceEntriesView';
import { httpRootURL, wsRootURL, raceGraduateAHAL, raceScorpionAHAL, entryChrisMarshall1234ScorpionAHAL, entryChrisMarshall1234PursuitAHAL, entryJillMyer826PursuitAHAL, entrySarahPascal6745ScorpionAHAL, 
    raceCometAHAL, lap1HAL, lap5HAL, racePursuitAHAL,
    signedUpChrisMarshallDinghy1234PursuitAHAL, signedUpJillMyerDinghy826PursuitAHAL, signedUpSarahPascalDinghy6745ScorpionAHAL,
    competitorChrisMarshallHAL
} from '../model/__mocks__/test-data';
// import { entriesGraduateA_bigData } from '../model/__mocks__/test-data-more-data';
import DinghyRacingController from '../controller/sylph-controller';
import Collection from '../model/collection';
import Entry from '../model/entry';
import Lap from '../model/lap';
import DirectRace from '../model/direct-race';
import SignedUp from '../model/signed-up';
import SylphController from '../controller/sylph-controller';
import Competitor from '../model/competitor';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

// some of the updates display after tests may no longer be required as update route via web sockets is driven from server (2 tests lap times following entry update notification & clears error message after successful update)?

const entryRowLastCellLapTimeCellOffset = 4;

afterEach(() => {
    vi.resetAllMocks();
})

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    await act(async () => {
        render(<RaceEntriesView model={model} races={[new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)]} />);
    });
    expect(screen.getByRole('button', {name: /by sail number/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by class & sail number/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by lap times/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by position/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /by forecast/i})).toBeInTheDocument();
    expect(screen.getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    expect(screen.getAllByText(/Scorpion/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Chris marshaLL/i)).toBeInTheDocument();
});
it('displays entries for selected races', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
    const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<RaceEntriesView model={model} races={[raceScorpionA, raceGraduateA]} />);
    });
    const entry1 = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
    const entry2 = await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'});
    const entry3 = await screen.findByRole('status', {name: (content, node) => node.textContent === '2726'});
    expect(entry1).toBeInTheDocument();
    expect(entry2).toBeInTheDocument();
    expect(entry3).toBeInTheDocument();
});
describe('when entries cannot be loaded for a selected race', () => {
    it('displays an error message', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(model, 'getEntriesByRace').mockImplementation(async () => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
        });
        const errorMessage = screen.getByText(/Unable to load entries oops!/i);
        expect(errorMessage).toBeInTheDocument();
    });
    it('clears the error message when entries are successfully loaded', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(model, 'getEntriesByRace').mockImplementationOnce(async () => {throw new Error('Oops!')});
        let renderResult;
        await act(async () => {
            renderResult = render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
        });
        let errorMessage = screen.getByText(/Unable to load entries oops!/i);
        expect(errorMessage).toBeInTheDocument();
        await act(async () => {
            renderResult.rerender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        errorMessage = screen.queryByText(/Unable to load entries oops!/i);
        expect(errorMessage).not.toBeInTheDocument();
    });
});
describe('when sorting entries', () => {
    it('sorts by the sailnumber', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA, raceGraduateA]} />);
        });
        const sortBySailNumber = screen.getByRole('button', {'name': /by sail number/i});
        await user.click(sortBySailNumber);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('sorts by the dinghy class and sail number', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA, raceGraduateA]} />);
        });
        const sortByClassAndSailNumber = screen.getByRole('button', {'name': /by class & sail number/i});
        await user.click(sortByClassAndSailNumber);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('sorts by the number of laps and then by the time to complete the last lap in descending order', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA, raceGraduateA]} />);
        });
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await user.click(sortByLapTimeButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('sorts by estimation of next lap finish time', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA, raceGraduateA]} />);
        });
        const sortByForecast = screen.getByRole('button', {'name': /by forecast/i});
        await user.click(sortByForecast);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
    });
    it('enables resorting by the same value after entries have been updated', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (url) => {
            const entryCollection = [
                new Entry({...entryChrisMarshall1234ScorpionAHAL, leadEntryAverageLapTime: 'PT5M12.568S', sumOfLapTimes: 'PT5M12.568S', correctedTime: 'PT4M59.681S', leadEntryLastLapTime: 'PT5M12.568S'}, {version: '"0"'}, model),
                new Entry({...entrySarahPascal6745ScorpionAHAL, leadEntryAverageLapTime: 'PT3M32.568S', sumOfLapTimes: 'PT3M32.568S', correctedTime: 'PT3M23.804S', leadEntryLastLapTime: 'PT3M32.568S'}, {version: '"0"'}, model)
            ];
            return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
        }).mockImplementationOnce((url) => {
            const entryCollection = [
                new Entry({...entryChrisMarshall1234ScorpionAHAL, leadEntryAverageLapTime: 'PT5M12.568S', sumOfLapTimes: 'PT5M12.568S', correctedTime: 'PT4M59.681S', leadEntryLastLapTime: 'PT5M12.568S'}, {version: '"0"'}, model),
                new Entry({...entrySarahPascal6745ScorpionAHAL, leadEntryAverageLapTime: 'PT0M0S', sumOfLapTimes: 'PT0M0S', correctedTime: 'PT0M0S', leadEntryLastLapTime: 'PT0M0S'}, {version: '"0"'}, model)
            ];
            return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
        });
        vi.spyOn(model, 'getLaps').mockImplementation(async (url) => {
            const lap1HAL = {number: 1, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/2' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/2' } }};
            const lap2HAL = {number: 1, time: 'PT17M26S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/3' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/3' } }};
            let lapsCollection = [];
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/laps') {
                lapsCollection = [new Lap({...lap1HAL, time: 'PT5M12.568S'}, {version: '"0"'}, model)];
            }
            else if (url === 'http://localhost:8081/dinghyracing/api/entries/11/laps') {
                lapsCollection = [new Lap({...lap2HAL, time: 'PT3M32.568S'}, {version: '"0"'}, model)];
            }
            return new Collection(lapsCollection, {size: 20,totalElements: lapsCollection.length, totalPages: 0,number: 0});
        }).mockImplementationOnce(async (url) => {
            const lap1HAL = {number: 1, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/2' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/2' } }};
            let lapsCollection = [];
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/laps') {
                lapsCollection = [new Lap({...lap1HAL, time: 'PT5M12.568S'}, {version: '"0"'}, model)];
            }
            else if (url === 'http://localhost:8081/dinghyracing/api/entries/11/laps') {
                lapsCollection = [];
            }
            return new Collection(lapsCollection, {size: 20,totalElements: lapsCollection.length, totalPages: 0,number: 0});
        }).mockImplementationOnce(async (url) => {
            const lap1HAL = {number: 1, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/2' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/2' } }};
            let lapsCollection = [];
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/laps') {
                lapsCollection = [new Lap({...lap1HAL, time: 'PT5M12.568S'}, {version: '"0"'}, model)];
            }
            else if (url === 'http://localhost:8081/dinghyracing/api/entries/11/laps') {
                lapsCollection = [];
            }
            return new Collection(lapsCollection, {size: 20,totalElements: lapsCollection.length, totalPages: 0,number: 0});
        });
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
        });
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await user.click(sortByLapTimeButton);
        // screen.debug();
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshall1234ScorpionAHAL._links.self.href});
        });
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        await user.click(sortByLapTimeButton);
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    describe('when sorting by position', () => {
        it('sorts by position in ascending order', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            await act(async () => {
                render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
            });
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await user.click(sortByPositionButton);
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        });
        it('sorts entries with a scoring abbreviation below other entries', async ()=> {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (url) => {
                const entryCollection = [
                    new Entry({...entryChrisMarshall1234ScorpionAHAL, leadEntryAverageLapTime: 'PT5M12.568S', sumOfLapTimes: 'PT5M12.568S', correctedTime: 'PT4M59.681S', leadEntryLastLapTime: 'PT5M12.568S', scoringAbbreviation: 'DSQ'}, {version: '"0"'}, model),
                    new Entry({...entrySarahPascal6745ScorpionAHAL, leadEntryAverageLapTime: 'PT3M32.568S', sumOfLapTimes: 'PT3M32.568S', correctedTime: 'PT3M23.804S', leadEntryLastLapTime: 'PT3M32.568S'}, {version: '"0"'}, model)
                ];
                return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
            });
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            await act(async () => {
                render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
            });
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await user.click(sortByPositionButton);
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    it('clears fast grouping from entries', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getLaps').mockImplementation(async (url) => {
            return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0});
        });
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA, raceGraduateA]} />);
        });
        // fast group entries
        let entry = (await screen.findByText((content, node) => /^Scorpion6745Sarah Pascal2 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
        let onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        entry = (await screen.findByText((content, node) => /^Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
        onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        // sort by sail number
        const sortBySailNumber = screen.getByRole('button', {'name': /by sail number/i});
        await user.click(sortBySailNumber);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('checkbox')).not.toBeChecked();
        expect(within(raceEntryViews[1]).getByRole('checkbox')).not.toBeChecked();
        expect(within(raceEntryViews[2]).getByRole('checkbox')).not.toBeChecked();
    });
});
describe('when fast grouping entries', () => {
    it('moves first entry selected for fast group to top of entries list', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getLaps').mockImplementation(async (url) => {
            return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0});
        })
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
        });
        let entry = await screen.findByText((content, node) => /^Scorpion6745Sarah Pascal2 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view'));
        const onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    });
    it('displays entries not fast grouped in the same order as before an entry was fast grouped', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        const raceCometA = new DirectRace(raceCometAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceCometA, raceGraduateA, raceScorpionA]} />);
        });
        // sort entries
        const sortByLapTimeButton = screen.getByRole('button', {name: /by lap time/i});
        await user.click(sortByLapTimeButton);
        // fast group entry
        const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '826'})).parentElement.parentElement.parentElement;
        const onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '826'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[3]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('shows entries in order selected with first entry selected at the top', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceGraduateA, raceScorpionA]} />);
        });
        let entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
        let onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '2726'})).parentElement.parentElement.parentElement;
        onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'})).parentElement.parentElement.parentElement;
        onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    });
    it('shows entries as fast group selected', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA, raceGraduateA]} />);
        });
        // fast group entries
        let entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
        let onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'})).parentElement.parentElement.parentElement;
        onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('checkbox')).toBeChecked();
        expect(within(raceEntryViews[1]).getByRole('checkbox')).toBeChecked();
        expect(within(raceEntryViews[2]).getByRole('checkbox')).not.toBeChecked();
    });
    it('does not allow an entry with a scoring abbreviation to be fast grouped', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (url) => {
            const entryCollection = [
                new Entry({...entryChrisMarshall1234ScorpionAHAL, leadEntryAverageLapTime: 'PT5M12.568S', sumOfLapTimes: 'PT5M12.568S', correctedTime: 'PT4M59.681S', leadEntryLastLapTime: 'PT5M12.568S', scoringAbbreviation: 'DSQ'}, {version: '"0"'}, model),
                new Entry({...entrySarahPascal6745ScorpionAHAL, leadEntryAverageLapTime: 'PT3M32.568S', sumOfLapTimes: 'PT3M32.568S', correctedTime: 'PT3M23.804S', leadEntryLastLapTime: 'PT3M32.568S'}, {version: '"0"'}, model)
            ];
            return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
        });
        vi.spyOn(model, 'getLaps').mockImplementation(async (url) => {
            return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0});
        });
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
        });
        const entry = (await screen.findByText((content, node) => /^Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view'))); // with only one entry RaceEntriesView and RaceEntryView both match test unless additional criteria specified
        const onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('checkbox')).not.toBeChecked();
        expect(screen.getByText('Cannot fast group an entry with a scoring abbreviation')).toBeInTheDocument();
    });
    describe('when an additional race is selected', () => {
        it('shows fast grouped entries at top of display order', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
            let renderResult;
            await act(async () => {
                renderResult = render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
            });
            // fast group entries
            const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
            const onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            // select additional race
            await act(async () => {
                renderResult.rerender(<RaceEntriesView model={model} races={[raceScorpionA, raceGraduateA]} />);
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
            expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when a race is deselected', () => {
        it('shows fast grouped entries at top of display order', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
            let renderResult;
            await act(async () => {
                renderResult = render(<RaceEntriesView model={model} races={[raceScorpionA, raceGraduateA]} />);
            });
            // fast group entries
            let entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '2726'})).parentElement.parentElement.parentElement;
            let onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
            onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            // deselect race
            await act(async () => {
                renderResult.rerender(<RaceEntriesView model={model} races={[raceScorpionA]} />);
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
});
describe('when removing an entry from fast group', () => {
    it('moves entry to below fast group', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
        });
        const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
        const onFastGroupButton = within(entry).getByRole('checkbox');
        // check fast group
        await user.click(onFastGroupButton);
        // uncheck fast group
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
});
describe('when adding a lap time', () => {
    it('calls controller add lap function with value of time sailed', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 7};
        });
        vi.spyOn(model, 'getLaps').mockImplementation(async (url) => {
            return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0});
        });
        const controller = new DinghyRacingController(model);
        const addLapSpy = vi.spyOn(controller, 'addLap');
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        const entry = screen.getByRole('status', {name: (content, node) => node.textContent === '6745'});
        await user.click(entry);
        expect(addLapSpy).toBeCalledWith(new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"'}, model), 7);
    });
    it('refreshes display after addLap completed', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getLaps').mockImplementation(async (url) => {
            return new Collection([new Lap({...lap1HAL, time: 'PT10M25S'}, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0,number: 0});
        }).mockImplementationOnce(async (url) => {
            return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0});
        }).mockImplementationOnce(async (url) => {
            return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0});
        });
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 312568};
        });
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        expect(await screen.queryByText('10:25')).not.toBeInTheDocument();
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshall1234ScorpionAHAL._links.self.href});
        });
        expect((await screen.findAllByText('10:25'))[0]).toBeInTheDocument();
    });
    it('displays a message if there is a problem adding the lap time', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 312568}
        });
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'addLap').mockImplementation(async (entry, time) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        const entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.click(entry);
        expect(screen.getByText(/oops/i)).toBeInTheDocument();
    });    
    it('releases entry if there is a problem adding the lap time', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 312568}
        });
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'addLap').mockImplementation(async (entry, time) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });    
        const entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.click(entry);
        expect(entry.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 312568};
        });
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'addLap').mockImplementationOnce(async (entry, time) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        const entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.click(entry);
        expect(screen.getByText(/oops/i)).toBeInTheDocument();
        await user.click(entry);
        await act(async () => {
            model.handleEntryUpdate({body: entryChrisMarshall1234ScorpionAHAL._links.self.href});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});
describe('when removing a lap time', () => {
    it('updates model', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const removeLapSpy = vi.spyOn(controller, 'removeLap').mockImplementation(async (entry, lap) => {return entryChrisMarshallDinghy1234});
        render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.keyboard('{Control>}');
        await user.click(entry);
        expect(removeLapSpy).toBeCalledWith(entryChrisMarshallDinghy1234, new Lap(lap5HAL, {version: '"0"'}, model));
    });
    it('refreshes display after lap time removed', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (url) => {
            const entryCollection = [
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model)
            ];
            return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
        });
        vi.spyOn(model, 'getLaps').mockImplementation(async (url) => {
            const lap1HAL = {number: 1, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/2' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/2' } }};
            let lapsCollection = [new Lap(lap1HAL, {version: '"0"'}, model)];
            return new Collection(lapsCollection, {size: 20,totalElements: lapsCollection.length, totalPages: 0,number: 0});
        }).mockImplementationOnce(async (url) => {
            const lap1HAL = {number: 1, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/2' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/2' } }};
            const lap2HAL = {number: 2, time: 'PT17M26S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/3' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/3' } }};
            let lapsCollection = [new Lap(lap1HAL, {version: '"0"'}, model), new Lap(lap2HAL, {version: '"0"'}, model)];
            return new Collection(lapsCollection, {size: 20,totalElements: lapsCollection.length, totalPages: 0,number: 0});
        });
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'removeLap').mockImplementation(async (entry, lap) => {return entryChrisMarshallDinghy1234});
        render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        const lapTime = await screen.findByText('34:06');
        expect(lapTime).toBeInTheDocument();
        await user.keyboard('{Control>}');
        await user.click(entry);
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshallDinghy1234.url});
        });
        expect(lapTime).not.toBeInTheDocument();
    });
    it('displays a message if there is a problem removing the lap time', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'removeLap').mockImplementation(async (entry, time) => {throw new Error('Oops!')});
        render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.keyboard('{Control>}');
        await user.click(entry);
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('releases entry if there is a problem problem removing the lap time', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'removeLap').mockImplementation(async (entry, time) => {throw new Error('Oops!')});
        render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.keyboard('{Control>}');
        await user.click(entry);
        expect(entry.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'removeLap').mockImplementation(async (entry, time) => {return new Entry}).mockImplementationOnce(async (entry, time) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });    
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.keyboard('{Control>}');
        await user.click(entry);
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        await user.keyboard('{Control>}');
        await user.click(entry);
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshallDinghy1234.url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});
describe('when updating a lap time', () => {
    it('updates model', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const updateLapSpy = vi.spyOn(controller, 'updateLap').mockImplementation(async (entry, time) => {return entryChrisMarshallDinghy1234});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('33:20');
        // render updated components
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '33:20'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '15:23');
        await user.keyboard('{Enter}');
        expect(updateLapSpy).toBeCalledWith(entryChrisMarshallDinghy1234, 923000);
    });
    it('refreshes display after lap time updated', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (url) => {
            const entryCollection = [
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model)
            ];
            return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
        });
        vi.spyOn(model, 'getLaps').mockImplementation(async (url) => {
            const lap1HAL = {number: 1, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/2' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/2' } }};
            const lap2HAL = {number: 2, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/3' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/3' } }};
            let lapsCollection = [new Lap(lap1HAL, {version: '"0"'}, model), new Lap(lap2HAL, {version: '"0"'}, model)];
            return new Collection(lapsCollection, {size: 20,totalElements: lapsCollection.length, totalPages: 0,number: 0});
        }).mockImplementationOnce(async (url) => {
            const lap1HAL = {number: 1, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/2' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/2' } }};
            const lap2HAL = {number: 2, time: 'PT17M26S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/3' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/3' } }};
            let lapsCollection = [new Lap(lap1HAL, {version: '"0"'}, model), new Lap(lap2HAL, {version: '"0"'}, model)];
            return new Collection(lapsCollection, {size: 20,totalElements: lapsCollection.length, totalPages: 0,number: 0});
        });
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'updateLap').mockImplementation(async (entry, time) => {return entryChrisMarshallDinghy1234});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('34:06');
        // render updated components
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '33:20'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '33:20');
        await user.keyboard('{Enter}');
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshallDinghy1234.url});
        });
        expect(await within(raceEntryView).findByText('33:20')).toBeInTheDocument();
    });
    it('displays a message if there is a problem updating the lap time', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'updateLap').mockImplementation(async (entry, time) => {return entryChrisMarshallDinghy1234}).mockImplementation(async (entry, time) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('16:40');
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '16:40'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '00:15');
        await user.keyboard('{Enter}');
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('releases entry if there is a problem updating the lap time', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'updateLap').mockImplementation(async (entry, time) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('16:40');
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '16:40'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '00:15');
        await user.keyboard('{Enter}');
        expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'updateLap').mockImplementationOnce(async (entry, time) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('16:40');
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        let lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '16:40'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '00:15');
        await user.keyboard('{Enter}');
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '16:40'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '00:15');
        await user.keyboard('{Enter}');
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshallDinghy1234.url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
    it('displays an error message when RaceEntryView fails validation of an updated lap time', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('16:40');
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '16:40'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '0150012');
        await user.keyboard('{Enter}');
        expect(await screen.findByText(/Time must be in the format \[hh:\]\[mm:\]ss./i)).toBeInTheDocument();
    });
});
describe('when setting a scoring abbreviation', () => {
    it('call controller setScoringAbbreviation', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const controller = new DinghyRacingController(model);
        const setScoringAbbreviationSpy = vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation(async (entry, scoringAbbreviation) => {return entry});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await user.selectOptions(selectSA, 'DNS');
        expect(setScoringAbbreviationSpy).toBeCalledWith(entryChrisMarshallDinghy1234, 'DNS');
    });
    it('displays a message if there is a problem updating the lap time', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const controller = new DinghyRacingController(model);
        vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await user.selectOptions(selectSA, 'DNS');
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('releases entry if there is a problem updating the lap time', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const controller = new DinghyRacingController(model);
        vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await user.selectOptions(selectSA, 'DNS');
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const controller = new DinghyRacingController(model);
        vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return entryChrisMarshallDinghy1234}).mockImplementationOnce((entry, scoringAbbreviation) => {throw new Error('Oops!')});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
        });
        // after render perform update
        const selectSA = screen.getAllByRole('combobox')[0];
        await user.selectOptions(selectSA, 'DNS');
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        // after render perform update
        await user.selectOptions(selectSA, 'DNS');
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshallDinghy1234.url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});
describe('when user drags and drops an entry to a new position', () => {
    it('updates the display order to show the subject entry in the position above the target entry', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const controller = new DinghyRacingController(model);
        vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        const targetREV = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const subjectREV = screen.getByRole('status', {name: (content, node) => node.textContent === '6745'}).parentElement.parentElement.parentElement;
        const dataTransferObject = {
            data: new Map(), 
            setData(key, value) {this.data.set(key, value)},
            getData(key) {return this.data.get(key)}
        };
        fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
        fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    });
    describe('when race is a pursuit race', () => {
        describe('when dropped on a target entry in the same race that has a position', () => {
            it('update subject entry race position', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                vi.spyOn(model, 'getSignedUpTo').mockImplementation(async (url) => {
                    const signedUpChrisMarshallDinghy1234PursuitA = new SignedUp(signedUpChrisMarshallDinghy1234PursuitAHAL, {version: '"0"'}, model);
                    const signedUpJillMyerDinghy826PursuitA = new SignedUp({...signedUpJillMyerDinghy826PursuitAHAL, position: 3}, {version: '"0"'}, model);
                    let signedUpCollection = [];
                    if (url === entryChrisMarshall1234PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpChrisMarshallDinghy1234PursuitA];
                    }
                    else if (url === entryJillMyer826PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpJillMyerDinghy826PursuitA];
                    }
                    return new Collection(signedUpCollection, {size: 20,totalElements: signedUpCollection.length, totalPages: 0,number: 0});
                });
                const controller = new DinghyRacingController(model);
                const racePursuitA = new DirectRace(racePursuitAHAL, {version: '"0"'}, model);
                const entryChrisMarshallPursuitA1234 = new Entry(entryChrisMarshall1234PursuitAHAL, {version: '"0"'}, model);
                const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation(async (entry, newPosition) => {return });
                await act(async () => {
                    render(<RaceEntriesView model={model} controller={controller} races={[racePursuitA]} />);
                });
                // sort by position to avoid position check error when dragging
                const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
                await user.click(sortByPositionButton);
                const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                const rev2 = screen.getByText(/jill myer/i).parentElement.parentElement.parentElement;
                const dataTransferObject = {
                    data: new Map(), 
                    setData(key, value) {this.data.set(key, value)},
                    getData(key) {return this.data.get(key)}
                };
                fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(setUpdateEntryPositionSpy).toBeCalledWith(entryChrisMarshallPursuitA1234, 3);
            });
        });
        describe('when dropped on a target entry in a different race that has a position', () => {
            it('does not update subject entry race position', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new DinghyRacingController(model);
                const racePursuitA = new DirectRace(racePursuitAHAL, {version: '"0"'}, model);
                const racePursuitB = new DirectRace({...racePursuitAHAL, name: 'Pursuit B', _links:{
                    self:{href:'http://localhost:8081/dinghyracing/api/directRaces/10'},
                    directRace:{href:'http://localhost:8081/dinghyracing/api/directRaces/10'},
                    signedUp:{href:'http://localhost:8081/dinghyracing/api/races/10/signedUp'},
                    fleet:{href:'http://localhost:8081/dinghyracing/api/races/10/fleet'}
                }}, {version: '"0"'}, model);
                const entryChrisMarshallPursuitA1234 = new Entry(entryChrisMarshall1234PursuitAHAL, {version: '"0"'}, model);
                vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (race) => {
                    let collection = [];
                    if (race.url === racePursuitA.url) {
                        collection = [
                            entryChrisMarshallPursuitA1234,
                            new Entry(entryJillMyer826PursuitAHAL, {version: '"0"'}, model)
                        ];
                    }
                    else if (race.url === racePursuitB.url) {
                        collection = [
                            new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"'}, model)
                        ];
                    }
                    return new Collection(collection, {size: 20, totalElements: collection.length, totalPages: 0, number: 0});
                });
                vi.spyOn(model, 'getSignedUpTo').mockImplementation(async (url) => {
                    const signedUpChrisMarshallDinghy1234PursuitA = new SignedUp(signedUpChrisMarshallDinghy1234PursuitAHAL, {version: '"0"'}, model);
                    const signedUpJillMyerDinghy826PursuitA = new SignedUp(signedUpJillMyerDinghy826PursuitAHAL, {version: '"0"'}, model);
                    const signedUpSarahPascalDinghy6745ScorpionA = new SignedUp(signedUpSarahPascalDinghy6745ScorpionAHAL, {version: '"0"'}, model);
                    let signedUpCollection = [];
                    if (url === entryChrisMarshall1234PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpChrisMarshallDinghy1234PursuitA];
                    }
                    else if (url === entrySarahPascal6745ScorpionAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpSarahPascalDinghy6745ScorpionA];
                    }
                    else if (url === entryJillMyer826PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpJillMyerDinghy826PursuitA];
                    }
                    return new Collection(signedUpCollection, {size: 20,totalElements: signedUpCollection.length, totalPages: 0,number: 0});
                });
                vi.spyOn(model, 'getRace').mockImplementation(async (url) => {
                    let raceHAL = {};
                    let version = {version: ''};
                    if (url === signedUpSarahPascalDinghy6745ScorpionAHAL._links.race.href) {
                        raceHAL = racePursuitB.hal;
                        version = {version: '"0"'};
                    }
                    else if (url === signedUpChrisMarshallDinghy1234PursuitAHAL._links.race.href || url === signedUpJillMyerDinghy826PursuitAHAL._links.race.href) {
                        raceHAL = racePursuitAHAL;
                        version = {version: '"0"'};
                    }
                    return new DirectRace(raceHAL, version, model);
                });
                const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return });
                await act(async () => {
                    render(<RaceEntriesView model={model} controller={controller}races={[racePursuitA, racePursuitB]} />);
                });
                const subjectREV = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                const targetREV = screen.getByText(/sarah pascal/i).parentElement.parentElement.parentElement;
                const dataTransferObject = {
                    data: new Map(), 
                    setData(key, value) {this.data.set(key, value)},
                    getData(key) {return this.data.get(key)}
                };
                await act(async () => {
                    fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
                    fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
                });                
                expect(setUpdateEntryPositionSpy).not.toBeCalledWith(entryChrisMarshallPursuitA1234, 3);
            });
        });
        describe('when position in race of target has not been set', () => {
            describe('when position of subject in race has been set', () => {
                it('does not update subject entry race position', async () => {
                    const model = new SylphModel(httpRootURL, wsRootURL);
                    vi.spyOn(model, 'getSignedUpTo').mockImplementation(async (url) => {
                        const signedUpChrisMarshallDinghy1234PursuitA = new SignedUp({...signedUpChrisMarshallDinghy1234PursuitAHAL, position: 3}, {version: '"0"'}, model);
                        const signedUpJillMyerDinghy826PursuitA = new SignedUp(signedUpJillMyerDinghy826PursuitAHAL, {version: '"0"'}, model);
                        let signedUpCollection = [];
                        if (url === entryChrisMarshall1234PursuitAHAL._links.signedUpTo.href) {
                            signedUpCollection = [signedUpChrisMarshallDinghy1234PursuitA];
                        }
                        else if (url === entryJillMyer826PursuitAHAL._links.signedUpTo.href) {
                            signedUpCollection = [signedUpJillMyerDinghy826PursuitA];
                        }
                        return new Collection(signedUpCollection, {size: 20,totalElements: signedUpCollection.length, totalPages: 0,number: 0});
                    });
                    const controller = new DinghyRacingController(model);
                    const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation(async (entry, newPosition) => {return signedUpChrisMarshallDinghy1234PursuitAHAL});
                    const racePursuitA = new DirectRace(racePursuitAHAL, {version: '"0"'}, model);
                    await act(async () => {
                        render(<RaceEntriesView model={model} controller={controller} races={[racePursuitA]} />);
                    });
                    const targetREV = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                    const subjectREV = screen.getByText(/jill myer/i).parentElement.parentElement.parentElement;
                    const dataTransferObject = {
                        data: new Map(), 
                        setData(key, value) {this.data.set(key, value)},
                        getData(key) {return this.data.get(key)}
                    };
                    await act(async () => {
                        fireEvent.dragStart(targetREV, {dataTransfer: dataTransferObject});
                        fireEvent.drop(subjectREV, {dataTransfer: dataTransferObject});
                    });
                    expect(setUpdateEntryPositionSpy).not.toHaveBeenCalled();
                });
            });
            describe('when position of subject has not been set', () => {
                it('position of subject remains the same', async () => {
                    const model = new SylphModel(httpRootURL, wsRootURL);
                    vi.spyOn(model, 'getSignedUpTo').mockImplementation(async (url) => {
                        const signedUpChrisMarshallDinghy1234PursuitA = new SignedUp({...signedUpChrisMarshallDinghy1234PursuitAHAL, position: null}, {version: '"0"'}, model);
                        const signedUpJillMyerDinghy826PursuitA = new SignedUp(signedUpJillMyerDinghy826PursuitAHAL, {version: '"0"'}, model);
                        let signedUpCollection = [];
                        if (url === entryChrisMarshall1234PursuitAHAL._links.signedUpTo.href) {
                            signedUpCollection = [signedUpChrisMarshallDinghy1234PursuitA];
                        }
                        else if (url === entryJillMyer826PursuitAHAL._links.signedUpTo.href) {
                            signedUpCollection = [signedUpJillMyerDinghy826PursuitA];
                        }
                        return new Collection(signedUpCollection, {size: 20,totalElements: signedUpCollection.length, totalPages: 0,number: 0});
                    });
                    const controller = new DinghyRacingController(model);
                    const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation(async (entry, newPosition) => {return signedUpChrisMarshallDinghy1234PursuitAHAL});
                    const racePursuitA = new DirectRace(racePursuitAHAL, {version: '"0"'}, model);
                    await act(async () => {
                        render(<RaceEntriesView model={model} controller={controller}races={[racePursuitA]} />);
                    });
                    const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                    const rev2 = screen.getByText(/jill myer/i).parentElement.parentElement.parentElement;
                    const dataTransferObject = {
                        data: new Map(), 
                        setData(key, value) {this.data.set(key, value)},
                        getData(key) {return this.data.get(key)}
                    };
                    await act(async () => {
                        fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                        fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                    });
                    expect(setUpdateEntryPositionSpy).not.toHaveBeenCalled();
                    expect(document.getElementById('Scorpion-1234-Chris Marshall-position')).toHaveValue(' ');
                });
            });
        });
        describe('when there is a problem updating the position', () => {
            it('displays a message that there is a problem updating the position', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                vi.spyOn(model, 'getSignedUpTo').mockImplementation(async (url) => {
                    const signedUpChrisMarshallDinghy1234PursuitA = new SignedUp(signedUpChrisMarshallDinghy1234PursuitAHAL, {version: '"0"'}, model);
                    const signedUpJillMyerDinghy826PursuitA = new SignedUp({...signedUpJillMyerDinghy826PursuitAHAL, position: 3}, {version: '"0"'}, model);
                    let signedUpCollection = [];
                    if (url === entryChrisMarshall1234PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpChrisMarshallDinghy1234PursuitA];
                    }
                    else if (url === entryJillMyer826PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpJillMyerDinghy826PursuitA];
                    }
                    return new Collection(signedUpCollection, {size: 20,totalElements: signedUpCollection.length, totalPages: 0,number: 0});
                });
                const racePursuitA = new DirectRace(racePursuitAHAL, {version: '"0"'}, model);
                const controller = new DinghyRacingController(model);
                vi.spyOn(controller, 'updateEntryPosition').mockImplementation(async (entry, newPosition) => {throw new Error('Any old nonsense')});
                await act(async () => {
                    render(<RaceEntriesView model={model} controller={controller} races={[racePursuitA]} />);
                });
                // sort by position to avoid position check error when dragging
                const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
                await act(async () => {
                    await user.click(sortByPositionButton);
                });
                const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                const rev2 = screen.getByText(/jill myer/i).parentElement.parentElement.parentElement;
                const dataTransferObject = {
                    data: new Map(), 
                    setData(key, value) {this.data.set(key, value)},
                    getData(key) {return this.data.get(key)}
                };
                await act(async () => {
                    fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(await screen.findByText(/any old nonsense/i)).toBeInTheDocument();
            });
            it('releases entry if there is a problem updating the position', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                vi.spyOn(model, 'getSignedUpTo').mockImplementation(async (url) => {
                    const signedUpChrisMarshallDinghy1234PursuitA = new SignedUp(signedUpChrisMarshallDinghy1234PursuitAHAL, {version: '"0"'}, model);
                    const signedUpJillMyerDinghy826PursuitA = new SignedUp({...signedUpJillMyerDinghy826PursuitAHAL, position: 3}, {version: '"0"'}, model);
                    let signedUpCollection = [];
                    if (url === entryChrisMarshall1234PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpChrisMarshallDinghy1234PursuitA];
                    }
                    else if (url === entryJillMyer826PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpJillMyerDinghy826PursuitA];
                    }
                    return new Collection(signedUpCollection, {size: 20,totalElements: signedUpCollection.length, totalPages: 0,number: 0});
                });
                const racePursuitA = new DirectRace(racePursuitAHAL, {version: '"0"'}, model);
                const controller = new DinghyRacingController(model);
                vi.spyOn(controller, 'updateEntryPosition').mockImplementation(async (entry, newPosition) => {throw new Error('Any old nonsense')});
                await act(async () => {
                    render(<RaceEntriesView model={model} controller={controller} races={[racePursuitA]} />);
                });
                // sort by position to avoid position check error when dragging
                const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
                await user.click(sortByPositionButton);
                const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                const rev2 = screen.getByText(/jill myer/i).parentElement.parentElement.parentElement;
                const dataTransferObject = {
                    data: new Map(), 
                    setData(key, value) {this.data.set(key, value)},
                    getData(key) {return this.data.get(key)}
                };
                fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(rev1.getAttribute('class')).not.toMatch(/disabled/i);
            });
            it('clears error message on success', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                vi.spyOn(model, 'getSignedUpTo').mockImplementation(async (url) => {
                    const signedUpChrisMarshallDinghy1234PursuitA = new SignedUp(signedUpChrisMarshallDinghy1234PursuitAHAL, {version: '"0"'}, model);
                    const signedUpJillMyerDinghy826PursuitA = new SignedUp({...signedUpJillMyerDinghy826PursuitAHAL, position: 3}, {version: '"0"'}, model);
                    let signedUpCollection = [];
                    if (url === entryChrisMarshall1234PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpChrisMarshallDinghy1234PursuitA];
                    }
                    else if (url === entryJillMyer826PursuitAHAL._links.signedUpTo.href) {
                        signedUpCollection = [signedUpJillMyerDinghy826PursuitA];
                    }
                    return new Collection(signedUpCollection, {size: 20,totalElements: signedUpCollection.length, totalPages: 0,number: 0});
                });
                const racePursuitA = new DirectRace(racePursuitAHAL, {version: '"0"'}, model);
                const controller = new DinghyRacingController(model);
                vi.spyOn(controller, 'updateEntryPosition').mockImplementation(async (entry, newPosition) => {return entryChrisMarshall1234PursuitAHAL}).mockImplementationOnce(async (entry, newPosition) => {throw new Error('Any old nonsense')});
                await act(async () => {
                    render(<RaceEntriesView model={model} controller={controller} races={[racePursuitA]} />);
                });
                // sort by position to avoid position check error when dragging
                const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
                await user.click(sortByPositionButton);
                const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                const rev2 = screen.getByText(/jill myer/i).parentElement.parentElement.parentElement;
                const dataTransferObject = {
                    data: new Map(), 
                    setData(key, value) {this.data.set(key, value)},
                    getData(key) {return this.data.get(key)}
                };
                fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                expect(await screen.findByText(/Any old nonsense/i)).toBeInTheDocument();
                // after render perform update
                await act(async () => {
                    fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                await act(async () => {
                    model.handleEntryUpdate({'body': entryChrisMarshall1234PursuitAHAL.url});
                });
                expect(screen.queryByText(/Any old nonsense/i)).not.toBeInTheDocument();
            });
        });
    });
    describe('when race is not a pursuit race', () => {
        describe('when subject entry dropped on an entry in the same race that has a position', () => {
            it('does not update subject entry race position', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new DinghyRacingController(model);
                const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
                const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
                const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
                await act(async () => {
                    render(<RaceEntriesView model={model} controller={controller}races={[raceScorpionA]} />);
                });
                // sort by position to avoid position check error when dragging
                const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
                await user.click(sortByPositionButton);
                const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                const rev2 = screen.getByText(/sarah pascal/i).parentElement.parentElement.parentElement;
                const dataTransferObject = {
                    data: new Map(), 
                    setData(key, value) {this.data.set(key, value)},
                    getData(key) {return this.data.get(key)}
                };
                await act(async () => {                
                    fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(setUpdateEntryPositionSpy).not.toBeCalledWith(entryChrisMarshallDinghy1234, 3);
            });
        });
    });
    describe('when entry dragged onto another entry with a scoring abbreviation', () => {
        it('does not change the positions of the entries and advises user that the operation is not allowed', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (url) => {
                const entryCollection = [
                    new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model),
                    new Entry({...entrySarahPascal6745ScorpionAHAL, scoringAbbreviation: 'DSQ'}, {version: '"0"'}, model)
                ];
                return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
            });
            const controller = new DinghyRacingController(model);
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            const entryChrisMarshallDinghy1234 = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation(async (entry, newPosition) => {return entryChrisMarshallDinghy1234});
            await act(async () => {
                render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
            });
            // sort by position to avoid position check error when dragging
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await act(async () => {
                await user.click(sortByPositionButton);
            });
            const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
            const rev2 = screen.getByText(/sarah pascal/i).parentElement.parentElement.parentElement;
            const dataTransferObject = {
                data: new Map(),
                setData(key, value) {this.data.set(key, value)},
                getData(key) {return this.data.get(key)}
            };
            await act(async () => {
                fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
            });
            expect(setUpdateEntryPositionSpy).not.toBeCalled();
            expect(await screen.findByText(/cannot change position of an entry with a scoring abbreviation/i)).toBeInTheDocument();
        });
    });
    describe('when entry with a scoring abbreviation is dragged onto another entry', () => {
        it('does not change the positions of the entries and advises user that the operation is not allowed', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (url) => {
                const entryCollection = [
                    new Entry({...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'DSQ'}, {version: '"0"'}, model),
                    new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"'}, model)
                ];
                return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
            });
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            const controller = new DinghyRacingController(model);
            const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation(async (entry, newPosition) => {return new Entry({...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'DSQ'}, {version: '"0"'}, model)});
            await act(async () => {
                render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
            });
            // sort by position to avoid position check error when dragging
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await act(async () => {
                await user.click(sortByPositionButton);
            });
            const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
            const rev2 = screen.getByText(/sarah pascal/i).parentElement.parentElement.parentElement;
            const dataTransferObject = {
                data: new Map(),
                setData(key, value) {this.data.set(key, value)},
                getData(key) {return this.data.get(key)}
            };
            await act(async () => {
                fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
            });
            expect(setUpdateEntryPositionSpy).not.toBeCalled();
            expect(await screen.findByText(/cannot change position of an entry with a scoring abbreviation/i)).toBeInTheDocument();
        });
    });
    describe('when a non-fast grouped entry is dropped onto a fast grouped entry', () => {
        it('inserts dropped entry into fast group at location of target and treats dropped entry as fast grouped', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            await act(async () => {
                render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
            });
            // select entry into fast group
            const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
            const onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            // drag and drop entry into fast group
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            const targetREV = screen.getByRole('status', {name: (content, node) => node.textContent === '6745'}).parentElement.parentElement.parentElement;
            const subjectREV = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
            const dataTransferObject = {
                data: new Map(), 
                setData(key, value) {this.data.set(key, value)},
                getData(key) {return this.data.get(key)}
            };
            await act(async () => {
                fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
                fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
            });
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[0]).getByRole('checkbox')).toBeChecked();
            expect(within(raceEntryViews[1]).getByRole('checkbox')).toBeChecked();
        });
    });
    describe('when a fast grouped entry is dragged onto a non-fast grouped entry', () => {
        it('inserts dropped entry into display at location of target and removes dropped entry from fast group', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            const raceGraduateA = new DirectRace(raceGraduateAHAL, {version: '"0"'}, model);
            await act(async () => {
                render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
            });
            // select entry into fast group
            const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
            const onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            // drag and drop entry into fast group
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            const targetREV = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
            const subjectREV = screen.getByRole('status', {name: (content, node) => node.textContent === '6745'}).parentElement.parentElement.parentElement;
            const dataTransferObject = {
                data: new Map(), 
                setData(key, value) {this.data.set(key, value)},
                getData(key) {return this.data.get(key)}
            };
            await act(async () => {
                fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
                fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
            });
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[0]).getByRole('checkbox')).not.toBeChecked();
            expect(within(raceEntryViews[1]).getByRole('checkbox')).not.toBeChecked();
        });
    });
    describe('when a fast grouped entry is dragged onto a fast grouped entry', () => {
        it('inserts dropped entry into fast group at location of target and treats dropped entry as fast grouped', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);vi.spyOn(model, 'getLaps').mockImplementation(async (url) => {
                return new Collection([], {size: 20,totalElements: 0, totalPages: 0,number: 0});
            });
            const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            await act(async () => {
                render(<RaceEntriesView model={model} races={[raceScorpionA]} />);
            });
            // select entry into fast group
            let entry = (await screen.findByText((content, node) => /^Scorpion6745Sarah Pascal2 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
            let onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            entry = (await screen.findByText((content, node) => /^Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
            onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            // drag and drop entry into fast group
            const targetREV = screen.getByText((content, node) => /^Scorpion6745Sarah Pascal2 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view'));
            const subjectREV = screen.getByText((content, node) => /^Scorpion1234Chris Marshall1 OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view'));
            const dataTransferObject = {
                data: new Map(), 
                setData(key, value) {this.data.set(key, value)},
                getData(key) {return this.data.get(key)}
            };
            await act(async () => {
                fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
                fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[0]).getByRole('checkbox')).toBeChecked();
            expect(within(raceEntryViews[1]).getByRole('checkbox')).toBeChecked();
        });
    });
});
describe('when refresh button clicked', () => {
    it('refreshes entries', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getEntriesByRace').mockImplementation(async (url) => {
            const entryCollection = [
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model)
            ];
            return new Collection(entryCollection, {size: 20, totalElements: entryCollection.length, totalPages: 0, number: 0});
        });
        vi.spyOn(model, 'getCompetitor').mockImplementation(async () => {return new Competitor({...competitorChrisMarshallHAL, name: 'Batman'}, '"1"', model)})
            .mockImplementationOnce(async () => {return new Competitor(competitorChrisMarshallHAL, '"0"', model)});
        const controller = new DinghyRacingController(model);
        const raceScorpionA = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} controller={controller} races={[raceScorpionA]} />);
        });
        const refreshButton = await screen.findByRole('button', {name: /refresh/i});
        expect(await screen.queryByText('Batman')).not.toBeInTheDocument();
        await act(async () => {
            user.click(refreshButton);
        });
        expect(await screen.findByText('Batman')).toBeInTheDocument();
    });
});
describe('when race is a pursuit race', () => {
    it('does not show option to fast group entries', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const racePursuitA = new DirectRace(racePursuitAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<RaceEntriesView model={model} races={[racePursuitA]} />, model);
        });
        const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'})).parentElement.parentElement.parentElement;        
        expect(within(entry).queryByRole('checkbox')).not.toBeInTheDocument();
    });
});