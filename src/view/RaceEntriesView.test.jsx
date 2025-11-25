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

import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { customRender } from '../test-utilities/custom-renders';
import RaceEntriesView from './RaceEntriesView';
import { httpRootURL, wsRootURL, 
    competitorSarahPascal, competitorChrisMarshall, competitorJillMyer, competitorOwainDavies,
    dinghy6745, dinghy1234, dinghy2928, dinghy2726,
    raceScorpionA, raceGraduateA, racePursuitA,
    entriesScorpionA, entriesGraduateA, 
    competitorLouScrew,
    entrySarahPascalScorpionA6745} from '../model/__mocks__/test-data';
import { entriesGraduateA_bigData } from '../model/__mocks__/test-data-more-data';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import Entry from '../model/domain-classes/entry';
import SignedUp from '../model/domain-classes/signed-up';

vi.mock('../model/dinghy-racing-model');
vi.mock('../model/domain-classes/clock');

// some of the updates display after tests may no longer be required as update route via web sockets is driven from server (2 tests lap times following entry update notification & clears error message after successful update)?

const entryRowLastCellLapTimeCellOffset = 4;

afterEach(() => {
    vi.resetAllMocks();
})

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, competitorLouScrew, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
    const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
    entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
    entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
    vi.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
    await act(async () => {
        customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
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
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, competitorLouScrew, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
    const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
    const entryJillMyerGraduateA2928 = new Entry(raceGraduateA, competitorJillMyer, null, dinghy2928, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
    entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
    entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
    entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
    vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
        if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
            return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
        }
        if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
            return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
        }
    });
    await act(async () => {
        customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
    });
    const entry1 = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
    const entry2 = await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'});
    const entry3 = await screen.findByRole('status', {name: (content, node) => node.textContent === '2928'});
    expect(entry1).toBeInTheDocument();
    expect(entry2).toBeInTheDocument();
    expect(entry3).toBeInTheDocument();
});
describe('when entries cannot be loaded for a selected race', () => {
    it('displays an error message', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        const errorMessage = screen.getByText(/Unable to load entries/i);
        expect(errorMessage).toBeInTheDocument();
    });
    it('clears the error message when entries are successfully loaded', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, competitorLouScrew, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})}).mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        let render;
        await act(async () => {
            render = customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        let errorMessage = screen.getByText(/Unable to load entries/i);
        expect(errorMessage).toBeInTheDocument();
        await act(async () => {
            render.rerender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        errorMessage = screen.queryByText(/Unable to load entries/i);
        expect(errorMessage).not.toBeInTheDocument();
    });
});
describe('when sorting entries', () => {
    it('sorts by the sailnumber', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, competitorLouScrew, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(raceGraduateA, competitorJillMyer, null, dinghy2928, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        const sortBySailNumber = screen.getByRole('button', {'name': /by sail number/i});
        await user.click(sortBySailNumber);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('sorts by the dinghy class and sail number', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, competitorLouScrew, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        const sortByClassAndSailNumber = screen.getByRole('button', {'name': /by class & sail number/i});
        await user.click(sortByClassAndSailNumber);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('sorts by the number of laps and then by the time to complete the last lap in descending order', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 
            3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        const entryLouScrewGraduateA2726 = new Entry(competitorLouScrew, null, [], dinghy2726, [], 0, 0, false, false, 'DNS', null, 'http://localhost:8081/dinghyracing/api/entries/13', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        entryLouScrewGraduateA2726.signedUpTo = [new SignedUp(raceGraduateA, entryLouScrewGraduateA2726, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryLouScrewGraduateA2726, entryJillMyerGraduateA2928]});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await user.click(sortByLapTimeButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        // screen.debug();
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[3]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
    });
    it('sorts by estimation of next lap finish time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 
            0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 562000}], 562000, 562000, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        const sortByForecast = screen.getByRole('button', {'name': /by forecast/i});
        await user.click(sortByForecast);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('enables resorting by the same value after entries have been updated', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 312568}], 312568, 312568, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745_pre = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745_post = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 212568}], 212568, 212568, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745_pre.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745_pre, model)];
        entrySarahPascalScorpionA6745_post.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745_post, model)];
        vi.spyOn(model, 'getEntriesByRace')
            .mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745_post]})})
            .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745_pre]})});
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await user.click(sortByLapTimeButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        await act(async () => {
            model.handleEntryUpdate({'body': entriesScorpionA[1].url});
        });        
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        await user.click(sortByLapTimeButton);
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    describe('when sorting by position', () => {
        it('sorts by position in ascending order', async () => {
            const entryJillMyer = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'});
            const entrySarahPascal = new Entry(competitorSarahPascal, null, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            const entryChrisMarshall = new Entry(competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            const entryBob = new Entry({name: 'Bob'}, null, [], {...dinghy1234, sailNumber: '9999'}, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/14', {eTag: '"1"'});
            const entryJoan = new Entry({name: 'Joan'}, null, [], {...dinghy1234, sailNumber: '8888'}, [], 0, 0, false, false, 'DNS', 'http://localhost:8081/dinghyracing/api/entries/15', {eTag: '"1"'});
            entryJillMyer.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyer)];
            entryJillMyer.signedUpTo[0].position = 2;
            entrySarahPascal.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascal)];
            entrySarahPascal.signedUpTo[0].position = 3;
            entryChrisMarshall.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshall)];
            entryChrisMarshall.signedUpTo[0].position = 1;
            entryBob.signedUpTo = [new SignedUp(raceScorpionA, entryBob)];
            entryBob.signedUpTo[0].position = null;
            entryJoan.signedUpTo = [new SignedUp(raceScorpionA, entryJoan)];
            entryJoan.signedUpTo[0].position = null;
            const entries = [ entryJillMyer, entrySarahPascal, entryChrisMarshall, entryBob, entryJoan ];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entries})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await user.click(sortByPositionButton);
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
            expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[3]).getByRole('status', {name: (content, node) => node.textContent === '9999'})).toBeInTheDocument();
            expect(within(raceEntryViews[4]).getByRole('status', {name: (content, node) => node.textContent === '8888'})).toBeInTheDocument();
        });
        it('sorts entries with a scoring abbreviation below other entries', async ()=> {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryJillMyer = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, 'RET', 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'});
            const entrySarahPascal = new Entry(competitorSarahPascal, null, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            const entryChrisMarshall = new Entry(competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}], 1, 1, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            const entryBob = new Entry({name: 'Bob'}, null, [], {...dinghy1234, sailNumber: '9999'}, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/14', {eTag: '"1"'});
            const entryJoan = new Entry({name: 'Joan'}, null, [], {...dinghy1234, sailNumber: '8888'}, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/15', {eTag: '"1"'});
            entryJillMyer.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyer)];
            entryJillMyer.signedUpTo[0].position = 5;
            entrySarahPascal.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascal)];
            entrySarahPascal.signedUpTo[0].position = null;
            entryChrisMarshall.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshall)];
            entryChrisMarshall.signedUpTo[0].position = 1;
            entryBob.signedUpTo = [new SignedUp(raceScorpionA, entryBob)];
            entryBob.signedUpTo[0].position = null;
            entryJoan.signedUpTo = [new SignedUp(raceScorpionA, entryJoan)];
            entryJoan.signedUpTo[0].position = null;
            const entries = [ entryJillMyer, entrySarahPascal, entryChrisMarshall, entryJoan, entryBob ];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entries})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await user.click(sortByPositionButton);
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '8888'})).toBeInTheDocument();
            expect(within(raceEntryViews[3]).getByRole('status', {name: (content, node) => node.textContent === '9999'})).toBeInTheDocument();
            expect(within(raceEntryViews[4]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        });
    });    
    describe('when sorting entries that include an entry that did not start', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for DNS entry which is placed last', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 4, 4, false, false, 'DNS',  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await user.click(sortByLapTimeButton);
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when sorting entries that include an entry that retired', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for RET entry which is placed last', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 4, 4, false, false, 'RET',  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await user.click(sortByLapTimeButton);
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when sorting entries that include an entry that has been disqualified', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for DSQ entry which is placed last', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 4, 4, false, false, 'DSQ',  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await user.click(sortByLapTimeButton);
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when sorting entries that include an entry that was on course side', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for OCS entry which is placed last', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 4, 4, false, false, 'OCS',  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await user.click(sortByLapTimeButton);
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when sorting entries that include an entry that did not finish', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for DNF entry which is placed last', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                    {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
                ], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'scoringAbbreviation': 'DNF', 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 4, 4, false, false, 'DNF',  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await user.click(sortByLapTimeButton);
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    it('clears fast grouping from entries', async () => {
        const entriesScorpionA = [
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        // fast group entries
        let entry = (await screen.findByText((content, node) => /^Scorpion6745Sarah Pascal  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
        let onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        entry = (await screen.findByText((content, node) => /^Scorpion1234Chris Marshall  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
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
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 	3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        let entry = (await screen.findByText((content, node) => /^Scorpion6745Sarah Pascal  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
        const onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    });
    it('displays entries not fast grouped in the same order as before an entry was fast grouped', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 3, 3, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'}, null);
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        const entryLouScrewGraduateA2726 = new Entry(competitorLouScrew, null, [], dinghy2726, [], 0, 0, false, false, 'DNS', 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'}, null);
        entryLouScrewGraduateA2726.signedUpTo = [new SignedUp(raceGraduateA, entryLouScrewGraduateA2726, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745, entryJillMyerGraduateA2928, entryLouScrewGraduateA2726]})});
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        // sort entries
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await user.click(sortByLapTimeButton);
        // fast group entry
        const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
        const onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[3]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
    });
    it('shows entries in order selected with first entry selected at the top', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA_bigData});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceGraduateA]} />, model);
        });
        let entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '2928'})).parentElement.parentElement.parentElement;
        let onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '2009'})).parentElement.parentElement.parentElement;
        onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '2373'})).parentElement.parentElement.parentElement;
        onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2009'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '2373'})).toBeInTheDocument();
    });
    it('shows entries as fast group selected', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 	3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
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
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 	3, 3, false, false, 'RET',  null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        const entry = (await screen.findByText((content, node) => /^Scorpion1234Chris Marshall  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view'))); // with only one entry RaceEntriesView and RaceEntryView both match test unless additional criteria specified
        const onFastGroupButton = within(entry).getByRole('checkbox');
        await user.click(onFastGroupButton);
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('checkbox')).not.toBeChecked();
        expect(screen.getByText('Cannot fast group an entry with a scoring abbreviation')).toBeInTheDocument();
    });
    describe('when an additional race is selected', () => {
        it('shows fast grouped entries at top of display order', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            let render;
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 	3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                    return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
                }
                if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                    return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
                }
            });
            await act(async () => {
                render = customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            // fast group entries
            const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
            const onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            // select additional race
            await act(async () => {
                render.rerender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
            expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when a race is deselected', () => {
        it('shows fast grouped entries at top of display order', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            let render;
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 	3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                    return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
                }
                if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                    return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
                }
            });
            await act(async () => {
                render = customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
            });
            // fast group entries
            let entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '2928'})).parentElement.parentElement.parentElement;
            let onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
            onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            // deselect race
            await act(async () => {
                render.rerender(<RaceEntriesView races={[raceScorpionA]} />, model);
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
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
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
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 7}});
        const local_raceScorpionA = {...raceScorpionA, clock: model.getClock()};
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{number: 1, time: 1}, {number: 2, time: 2}], 3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(local_raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entrySarahPascalScorpionA6745]})});
        const addLapSpy = vi.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true, 'domainObject': {}})});
        await act(async () => {
            customRender(<RaceEntriesView races={[local_raceScorpionA]} />, model, controller);
        });
        const entry = screen.getByRole('status', {name: (content, node) => node.textContent === '6745'});
        await user.click(entry);
        expect(addLapSpy).toBeCalledWith(entrySarahPascalScorpionA6745, 7);
    });
    it('refreshes display after addLap completed', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const clock = {getElapsedTime: () => {return 312568}};
        const controller = new DinghyRacingController(model);
        const entryChrisMarshallScorpionA1234_pre = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 312568}], 312568, 312568, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entryChrisMarshallScorpionA1234_post = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 312568}, {'number': 2, 'time': 312568}], 625136, 625136, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234_pre.signedUpTo = [new SignedUp({...raceScorpionA, clock: model.getClock()}, entryChrisMarshallScorpionA1234_pre, model)];
        entryChrisMarshallScorpionA1234_post.signedUpTo = [new SignedUp({...raceScorpionA, clock: model.getClock()}, entryChrisMarshallScorpionA1234_post, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp({...raceScorpionA, clock: model.getClock()}, entrySarahPascalScorpionA6745, model)];
        
        vi.spyOn(model, 'getEntriesByRace')
            .mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234_post, entrySarahPascalScorpionA6745]})})
            .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234_pre, entrySarahPascalScorpionA6745]})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
        await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        expect(await screen.queryByText('10:25')).not.toBeInTheDocument();
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshallScorpionA1234_pre.url});
        });
        expect(await screen.findByText('10:25')).toBeInTheDocument();
    });
    it('displays a message if there is a problem adding the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 312568}
        });
        const local_raceScorpionA = {...raceScorpionA, clock: model.getClock()};
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(local_raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(local_raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
        });
        vi.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({success: false, message: 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: model.getClock()}]} />, model, controller);
        });
        const entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.click(entry);
        expect(screen.getByText(/oops/i)).toBeInTheDocument();
    });    
    it('releases entry if there is a problem adding the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 312568}
        });
        const local_raceScorpionA = {...raceScorpionA, clock: model.getClock()};
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(local_raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(local_raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
        });
        vi.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({success: false, message: 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: model.getClock()}]} />, model, controller);
        });    
        const entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.click(entry);
        expect(entry.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 312568}});
        const controller = new DinghyRacingController(model);
        const local_raceScorpionA = {...raceScorpionA, clock: model.getClock()};
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{number: 1, time: 312568}], 312568, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(local_raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(local_raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({success: true, domainObject: [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})})
            .mockImplementationOnce((race) => {return Promise.resolve({success: true, domainObject: [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
        vi.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({success: true, domainObject: {}})}).mockImplementationOnce((entry, time) => {return Promise.resolve({success: false, message: 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[local_raceScorpionA]} />, model, controller);
        });
        const entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.click(entry);
        expect(screen.getByText(/oops/i)).toBeInTheDocument();
        await user.click(entry);
        await act(async () => {
            model.handleEntryUpdate({body: entryChrisMarshallScorpionA1234.url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});
describe('when removing a lap time', () => {
    it('updates model', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7}], 7, 7, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        const controller = new DinghyRacingController(model);
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
        const removeLapSpy = vi.spyOn(controller, 'removeLap').mockImplementation((entry, lap) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });        
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.keyboard('{Control>}');
        await user.click(entry);
        expect(removeLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, {'number': 1, 'time': 7});
    });
    it('refreshes display after lap time removed', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const entryChrisMarshallScorpionA1234_pre = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 312568}], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234_pre.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234_pre, model)];
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234_pre, entrySarahPascalScorpionA6745]})});
        vi.spyOn(controller, 'removeLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        const lapTime = await screen.findByText('05:12');
        expect(lapTime).toBeInTheDocument();
        await user.keyboard('{Control>}');
        await user.click(entry);
        await act(async () => {
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(lapTime).not.toBeInTheDocument();
    });
    it('displays a message if there is a problem removing the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7}], 7, 7, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
        vi.spyOn(controller, 'removeLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });    
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.keyboard('{Control>}');
        await user.click(entry);
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('releases entry if there is a problem problem removing the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 312568}], 312568, 312568, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 312568}], 312568, 312568, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
        vi.spyOn(controller, 'removeLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });    
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.keyboard('{Control>}');
        await user.click(entry);
        expect(entry.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp({...raceScorpionA, clock: clock}, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp({...raceScorpionA, clock: clock}, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
        vi.spyOn(controller, 'removeLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})}).mockImplementationOnce((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });    
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await user.keyboard('{Control>}');
        await user.click(entry);
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        await user.keyboard('{Control>}');
        await user.click(entry);
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshallScorpionA1234.url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});
describe('when updating a lap time', () => {
    it('updates model', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7000}], 7000, 7000, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
        const updateLapSpy = vi.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        // render updated components
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '15:23');
        await user.keyboard('{Enter}');
        expect(updateLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 923000);
    });
    it('refreshes display after lap time updated', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const entryChrisMarshallScorpionA1234_pre = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7000}, {'number': 2, 'time': 7000}], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entryChrisMarshallScorpionA1234_post = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7000}, {'number': 2, 'time': 8000}], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234_pre.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234_pre, model)];
        entryChrisMarshallScorpionA1234_post.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234_post, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234_post, entrySarahPascalScorpionA6745]})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234_pre, entrySarahPascalScorpionA6745]})});
        vi.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:14');
        // render updated components
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:14'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '00:15');
        await user.keyboard('{Enter}');
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshallScorpionA1234_pre.url});
        });
        expect(await within(raceEntryView).findByText('00:15')).toBeInTheDocument();
    });
    it('displays a message if there is a problem updating the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7000}], 7000, 7000, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
        vi.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '00:15');
        await user.keyboard('{Enter}');
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('releases entry if there is a problem updating the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7000}], 7000, 7000, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 312568}], 312568, 312568, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
        vi.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '00:15');
        await user.keyboard('{Enter}');
        expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const entryChrisMarshallScorpionA1234_pre = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7000}, {'number': 2, 'time': 7000}], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entryChrisMarshallScorpionA1234_post = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7000}, {'number': 2, 'time': 8000}], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234_pre.signedUpTo = [new SignedUp({...raceScorpionA, clock: model.getClock()}, entryChrisMarshallScorpionA1234_pre, model)];
        entryChrisMarshallScorpionA1234_post.signedUpTo = [new SignedUp({...raceScorpionA, clock: model.getClock()}, entryChrisMarshallScorpionA1234_post, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp({...raceScorpionA, clock: model.getClock()}, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getClock').mockImplementation(() => {
            return {getElapsedTime: () => 312568}
        });
        vi.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({success: true, domainObject: [entryChrisMarshallScorpionA1234_post, entrySarahPascalScorpionA6745]})})
            .mockImplementationOnce((race) => {return Promise.resolve({success: true, domainObject: [entryChrisMarshallScorpionA1234_pre, entrySarahPascalScorpionA6745]})});

        vi.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({success: true, domainObject: {}})}).mockImplementationOnce((entry, time) => {return Promise.resolve({success: false, message: 'Oops!'})});

        vi.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({success: true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: model.getClock()}]} />, model, controller);
        });
        const entry = screen.getByRole('status', {name: (content, node) => node.textContent === '6745'});
        // after render perform update
        await user.click(entry);
        expect(screen.getByText(/oops/i)).toBeInTheDocument();
        let raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        let lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        let lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '00:15');
        await user.keyboard('{Enter}');
        await act(async () => {
            model.handleEntryUpdate({'body': entryChrisMarshallScorpionA1234_pre.url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
    it('displays an error message when RaceEntryView fails validation of an updated lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 7000}], 7000, 7000, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await user.clear(lapEntryCellInput);
        await user.type(lapEntryCellInput, '0150012');
        await user.keyboard('{Enter}');
        expect(await screen.findByText(/Time must be in the format \[hh:\]\[mm:\]ss./i)).toBeInTheDocument();
    });
});
describe('when setting a scoring abbreviation', () => {
    it('call controller setScoringAbbreviation', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 	3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
            }
        });
        const controller = new DinghyRacingController(model);
        const setScoringAbbreviationSpy = vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await user.selectOptions(selectSA, 'DNS');
        expect(setScoringAbbreviationSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 'DNS');
    });
    it('displays a message if there is a problem updating the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 	3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
            }
        });
        const controller = new DinghyRacingController(model);
        vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await user.selectOptions(selectSA, 'DNS');
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('releases entry if there is a problem updating the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 	3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
            }
        });
        const controller = new DinghyRacingController(model);
        vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await user.selectOptions(selectSA, 'DNS');
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 	3, 3, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 4, 4, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        const entryJillMyerGraduateA2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}], 6, 6, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        entryJillMyerGraduateA2928.signedUpTo = [new SignedUp(raceGraduateA, entryJillMyerGraduateA2928, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
            }
        });
        const controller = new DinghyRacingController(model);
        vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': true})}).mockImplementationOnce((entry, scoringAbbreviation) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        // after render perform update
        const selectSA = screen.getAllByRole('combobox')[0];
        await user.selectOptions(selectSA, 'DNS');
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        // after render perform update
        await user.selectOptions(selectSA, 'DNS');
        await act(async () => {
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});
describe('when user drags and drops an entry to a new position', () => {
    it('updates the display order to show the subject entry in the position above the target entry', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            }
        });
        const controller = new DinghyRacingController(model);
        vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
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
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const racePursuitA = {...raceScorpionA, type: 'PURSUIT'};
                const entryChrisMarshallPursuitA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 4, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
                const entrySarahPascalPursuitA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 3, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
                entryChrisMarshallPursuitA1234.signedUpTo = [new SignedUp(racePursuitA, entryChrisMarshallPursuitA1234, model)];
                entrySarahPascalPursuitA6745.signedUpTo = [new SignedUp(racePursuitA, entrySarahPascalPursuitA6745, model)];
                entrySarahPascalPursuitA6745.signedUpTo[0].position = 3;
                vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                    if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                        return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallPursuitA1234, entrySarahPascalPursuitA6745]});
                    }
                });
                const controller = new DinghyRacingController(model);
                const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
                await act(async () => {
                    customRender(<RaceEntriesView races={[racePursuitA]} />, model, controller);
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
                fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(setUpdateEntryPositionSpy).toBeCalledWith(entryChrisMarshallPursuitA1234, 3);
            });
        });
        describe('when dropped on a target entry in a different race that has a position', () => {
            it('does not update subject entry race position', async () => {
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const racePursuitA = {...raceScorpionA, type: 'PURSUIT'};
                const racePursuitB = {...raceGraduateA, type: 'PURSUIT'};
                const entryChrisMarshallPursuitA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
                const entrySarahPascalPursuitA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
                const entryJillMyerPursauitB2928 = new Entry(competitorJillMyer, null, [], dinghy2928, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/12', {eTag: '"1"'})
                entryChrisMarshallPursuitA1234.signedUpTo = [new SignedUp(racePursuitA, entryChrisMarshallPursuitA1234, model)];
                entrySarahPascalPursuitA6745.signedUpTo = [new SignedUp(racePursuitA, entrySarahPascalPursuitA6745, model)];
                entryJillMyerPursauitB2928.signedUpTo = [new SignedUp(racePursuitB, entryJillMyerPursauitB2928, model)];
                vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                    if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                        return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallPursuitA1234, entrySarahPascalPursuitA6745]});
                    }
                    if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                        return Promise.resolve({'success': true, 'domainObject': [entryJillMyerPursauitB2928]});
                    }
                });
                const controller = new DinghyRacingController(model);
                const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
                await act(async () => {
                    customRender(<RaceEntriesView races={[racePursuitA, racePursuitB]} />, model, controller);
                });
                const subjectREV = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                const targetREV = screen.getByText(/jill myer/i).parentElement.parentElement.parentElement;
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const racePursuitA = {...raceScorpionA, type: 'PURSUIT'};
                    const entryChrisMarshallPursuitA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
                    const entrySarahPascalPursuitA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 3, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
                    entryChrisMarshallPursuitA1234.signedUpTo = [new SignedUp(racePursuitA, entryChrisMarshallPursuitA1234, model)];
                    entrySarahPascalPursuitA6745.signedUpTo = [new SignedUp(racePursuitA, entrySarahPascalPursuitA6745, model)];
                    vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallPursuitA1234, entrySarahPascalPursuitA6745]});})
                    const controller = new DinghyRacingController(model);
                    const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
                    await act(async () => {
                        customRender(<RaceEntriesView races={[racePursuitA]} />, model, controller);
                    });
                    const targetREV = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                    const subjectREV = screen.getByText(/sarah pascal/i).parentElement.parentElement.parentElement;
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const racePursuitA = {...raceScorpionA, type: 'PURSUIT'};
                    const entryChrisMarshallPursuitA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
                    const entrySarahPascalPursuitA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 3, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
                    entryChrisMarshallPursuitA1234.signedUpTo = [new SignedUp(racePursuitA, entryChrisMarshallPursuitA1234, model)];
                    entrySarahPascalPursuitA6745.signedUpTo = [new SignedUp(racePursuitA, entrySarahPascalPursuitA6745, model)];
                    vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallPursuitA1234, entrySarahPascalPursuitA6745]});})
                    const controller = new DinghyRacingController(model);
                    const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
                    await act(async () => {
                        customRender(<RaceEntriesView races={[racePursuitA]} />, model, controller);
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
                    expect(setUpdateEntryPositionSpy).not.toHaveBeenCalled();
                    expect(document.getElementById('Scorpion-1234-Chris Marshall-position')).toHaveValue(' ');
                });
            });
        });
        describe('when there is a problem updating the position', () => {
            it('displays a message that there is a problem updating the position', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const raceScorpionAPursuit = {...raceScorpionA, type: 'PURSUIT'};
                const entryChrisMarshallPursuitA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
                const entrySarahPascalPursuitA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
                entryChrisMarshallPursuitA1234.signedUpTo = [new SignedUp(raceScorpionAPursuit, entryChrisMarshallPursuitA1234, model)];
                entrySarahPascalPursuitA6745.signedUpTo = [new SignedUp(raceScorpionAPursuit, entrySarahPascalPursuitA6745, model)];
                entryChrisMarshallPursuitA1234.signedUpTo[0].position = 1;
                entrySarahPascalPursuitA6745.signedUpTo[0].position = 2;
                vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                    return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallPursuitA1234, entrySarahPascalPursuitA6745]});
                });
                const controller = new DinghyRacingController(model);
                vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': false, message: 'Any old nonsense'})});
                await act(async () => {
                    customRender(<RaceEntriesView races={[raceScorpionAPursuit]} />, model, controller);
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
                expect(await screen.findByText(/any old nonsense/i)).toBeInTheDocument();
            });
            it('releases entry if there is a problem updating the position', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const racePursuitA = {...raceScorpionA, type: 'PURSUIT'};
                const entryChrisMarshallPursuitA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
                const entrySarahPascalPursuitA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 3, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
                entryChrisMarshallPursuitA1234.signedUpTo = [new SignedUp(racePursuitA, entryChrisMarshallPursuitA1234, model)];
                entryChrisMarshallPursuitA1234.signedUpTo[0].position = 3;
                entrySarahPascalPursuitA6745.signedUpTo = [new SignedUp(racePursuitA, entrySarahPascalPursuitA6745, model)];
                entrySarahPascalPursuitA6745.signedUpTo[0].position = 4;
                vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallPursuitA1234, entrySarahPascalPursuitA6745]})});
                const controller = new DinghyRacingController(model);
                vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': false, message: 'Any old nonsense'})});
                await act(async () => {
                    customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
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
                fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(rev1.getAttribute('class')).not.toMatch(/disabled/i);
            });
            it('clears error message on success', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const racePursuitA = {...raceScorpionA, type: 'PURSUIT'};
                const entryChrisMarshallPursuitA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
                const entrySarahPascalPursuitA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
                entryChrisMarshallPursuitA1234.signedUpTo = [new SignedUp(racePursuitA, entryChrisMarshallPursuitA1234, model)];
                entryChrisMarshallPursuitA1234.signedUpTo[0].position = 3;
                entrySarahPascalPursuitA6745.signedUpTo = [new SignedUp(racePursuitA, entrySarahPascalPursuitA6745, model)];
                entrySarahPascalPursuitA6745.signedUpTo[0].position = 4;
                vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallPursuitA1234, entrySarahPascalPursuitA6745]})});
                const controller = new DinghyRacingController(model);
                vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})}).mockImplementationOnce((entry, newPosition) => {return Promise.resolve({'success': false, message: 'Any old nonsense'})});
                await act(async () => {
                    customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
                });
                // sort by position to avoid position check error when dragging
                const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
                await act(async () => {
                    await user.click(sortByPositionButton);
                });
                // after render perform update
                const rev1 = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                const rev2 = screen.getByText(/sarah pascal/i).parentElement.parentElement.parentElement;
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
                    model.handleEntryUpdate({'body': entriesScorpionA[0].url});
                });
                expect(screen.queryByText(/Any old nonsense/i)).not.toBeInTheDocument();
            });
        });
    });
    describe('when race is not a pursuit race', () => {
        describe('when subject entry dropped on an entry in the same race that has a position', () => {
            it('does not update subject entry race position', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
                const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
                entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
                entryChrisMarshallScorpionA1234.signedUpTo[0].position = 4;
                entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
                entrySarahPascalScorpionA6745.signedUpTo[0].position = 3;
                vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                    return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
                });
                const controller = new DinghyRacingController(model);
                const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
                await act(async () => {
                    customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
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
                expect(setUpdateEntryPositionSpy).not.toBeCalledWith(entryChrisMarshallScorpionA1234, 3);
            });
        });
    });
    describe('when entry dragged onto another entry with a scoring abbreviation', () => {
        it('does not change the positions of the entries and advises user that the operation is not allowed', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, 'RET', 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            entryChrisMarshallScorpionA1234.signedUpTo[0].position = 4;
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            entrySarahPascalScorpionA6745.signedUpTo[0].position = 3;
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve(
                {'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            });
            const controller = new DinghyRacingController(model);
            const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
            await act(async () => {
                customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
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
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, 'DNS',  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            entryChrisMarshallScorpionA1234.signedUpTo[0].position = 4;
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            entrySarahPascalScorpionA6745.signedUpTo[0].position = 3;
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve(
                {'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
            });
            const controller = new DinghyRacingController(model);
            const setUpdateEntryPositionSpy = vi.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
            await act(async () => {
                customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
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
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.name === 'Scorpion A') {
                    return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
                }
                else if (race.name === 'Graduate A') {
                    return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
                }    
            });
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
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
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.name === 'Scorpion A') {
                    return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
                }    
            });
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
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
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const entryChrisMarshallScorpionA1234 = new Entry (competitorChrisMarshall, null, [], dinghy1234, [], 0, 0, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
            entryChrisMarshallScorpionA1234.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234, model)];
            const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
            entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
            vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.name === 'Scorpion A') {
                    return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745]});
                }
                else if (race.name === 'Graduate A') {
                    return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
                }    
            });
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            // select entry into fast group
            let entry = (await screen.findByText((content, node) => /^Scorpion6745Sarah Pascal  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
            let onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            entry = (await screen.findByText((content, node) => /^Scorpion1234Chris Marshall  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
            onFastGroupButton = within(entry).getByRole('checkbox');
            await user.click(onFastGroupButton);
            // drag and drop entry into fast group
            const targetREV = screen.getByText((content, node) => /^Scorpion6745Sarah Pascal  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view'));
            const subjectREV = screen.getByText((content, node) => /^Scorpion1234Chris Marshall  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view'));
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
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        const entryChrisMarshallScorpionA1234_pre = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 312568}], 312568, 312568, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234_pre.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234_pre, model)];
        const entryChrisMarshallScorpionA1234_post = new Entry (competitorChrisMarshall, null, [], dinghy1234, [{'number': 1, 'time': 312568}, {'number': 2, 'time': 312568}], 625136, 625136, false, false, null,  'http://localhost:8081/dinghyracing/api/entries/10', {eTag: '"1"'});
        entryChrisMarshallScorpionA1234_post.signedUpTo = [new SignedUp(raceScorpionA, entryChrisMarshallScorpionA1234_post, model)];
        const entrySarahPascalScorpionA6745 = new Entry(competitorSarahPascal, competitorOwainDavies, [], dinghy6745, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/11', {eTag: '"1"'});
        entrySarahPascalScorpionA6745.signedUpTo = [new SignedUp(raceScorpionA, entrySarahPascalScorpionA6745, model)];
        vi.spyOn(model, 'getEntriesByRace')
            .mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234_post, entrySarahPascalScorpionA6745]})})
            .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallScorpionA1234_pre, entrySarahPascalScorpionA6745]})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
        const refreshButton = await screen.findByRole('button', {name: /refresh/i});
        expect(await screen.queryByText('10:25')).not.toBeInTheDocument();
        await act(async () => {
            user.click(refreshButton);
        });
        expect(await screen.findByText('10:25')).toBeInTheDocument();
    });
});
describe('when race is a pursuit race', () => {
    it('does not show option to fast group entries', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const entryChrisMarshallPursuitA1234 = new Entry(racePursuitA, competitorChrisMarshall, competitorLouScrew, dinghy1234, [], 0, 0, false, false, null, 'http://localhost:8081/dinghyracing/api/entries/22', {eTag: '"1"'});
        entryChrisMarshallPursuitA1234.signedUpTo = [new SignedUp(racePursuitA, entryChrisMarshallPursuitA1234, model)];
        vi.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Pursuit A') {
                return Promise.resolve({'success': true, 'domainObject': [entryChrisMarshallPursuitA1234]});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[racePursuitA]} />, model);
        });
        const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'})).parentElement.parentElement.parentElement;        
        expect(within(entry).queryByRole('checkbox')).not.toBeInTheDocument();
    });
});