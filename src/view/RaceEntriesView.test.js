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

import { act, fireEvent, getNodeText, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { customRender } from '../test-utilities/custom-renders';
import RaceEntriesView from './RaceEntriesView';
import { httpRootURL, wsRootURL, 
    competitorSarahPascal, competitorChrisMarshall, competitorJillMyer,
    dinghy6745, dinghy1234, dinghy2928, dinghy2726,
    raceScorpionA, raceGraduateA, raceCometA, racePursuitA,
    entriesScorpionA, entriesGraduateA, entriesCometA, entriesPursuitA,
    entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745, entryJillMyerCometA826,
    competitorLouScrew} from '../model/__mocks__/test-data';
import { entriesGraduateA_bigData } from '../model/__mocks__/test-data-more-data';
import DinghyRacingController from '../controller/dinghy-racing-controller';

jest.mock('../model/dinghy-racing-model');
jest.mock('../model/domain-classes/clock');

// some of the updates display after tests may no longer be required as update route via web sockets is driven from server (2 tests lap times following entry update notification & clears error message after successful update)?

const entryRowLastCellLapTimeCellOffset = 4;

afterEach(() => {
    jest.resetAllMocks();
})

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
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
    jest.spyOn(model, 'getEntriesByRace').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesGraduateA})});
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
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        const errorMessage = screen.getByText(/Unable to load entries/i);
        expect(errorMessage).toBeInTheDocument();
    });
    it('clears the error message when entries are successfully loaded', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesGraduateA})}).mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});

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
        const entriesScorpionA = [
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        const sortBySailNumber = screen.getByRole('button', {'name': /by sail number/i});
        await act(async () => {
            await user.click(sortBySailNumber);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('sorts by the dinghy class and sail number', async () => {
        const entriesScorpionA = [
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        
        const sortByClassAndSailNumber = screen.getByRole('button', {'name': /by class & sail number/i});
        await act(async () => {
            await user.click(sortByClassAndSailNumber);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('sorts by the number of laps and then race start time of dinghies in descending order', async () => {
        const entries = [
            {'helm': competitorJillMyer, 'crew': null, 'race': raceGraduateA,'dinghy': dinghy2928, 'laps': [
                {'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}
            ], 'sumOfLapTimes': 6, 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': null, 'url': 'http://localhost:8081/dinghyracing/api/entries/12', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
            ], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
            {'helm': competitorLouScrew,'race': raceGraduateA,'dinghy': dinghy2726, 'laps': [], 'sumOfLapTimes': 0, scoringAbbreviation: 'DNS', 'url': 'http://localhost:8081/dinghyracing/api/entries/13', metadata: {eTag: '"1"'}},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [
                {'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}
            ], 'sumOfLapTimes': 3, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entries})});
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await act(async () => {
            await user.click(sortByLapTimeButton);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[3]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
    });
    it('sorts by estimation of next lap finish time', async () => {
        const entriesScorpionA = [
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [{number: 1, time: 562000}], 'sumOfLapTimes': 562000,'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        const sortByForecast = screen.getByRole('button', {'name': /by forecast/i});
        await act(async () => {
            await user.click(sortByForecast);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    it('enables resorting by the same value after entries have been updated', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"2"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [{'number': 1, 'time': 212568}], 'sumOfLapTimes': 212568, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"2"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await act(async () => {
            await user.click(sortByLapTimeButton);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        await act(async () => {
            model.handleEntryUpdate({'body': entriesScorpionA[1].url});
        });
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        await act(async () => {
            await user.click(sortByLapTimeButton);
        });
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
    describe('when sorting by position', () => {
        it('sorts by position in ascending order', async () => {
            const entries = [
                {'helm': competitorJillMyer, 'crew': null, 'race': raceGraduateA,'dinghy': dinghy2928, 'laps': [
                    {'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}
                ], 'sumOfLapTimes': 6, 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': null, position: 2, 'url': 'http://localhost:8081/dinghyracing/api/entries/12', metadata: {eTag: '"1"'}},
                {'helm': {name: 'Jane'},'race': raceScorpionA,'dinghy': {...dinghy1234, sailNumber: '8888'}, 'laps': [], 'sumOfLapTimes': 0, position: null, scoringAbbreviation: 'DNS', 'url': 'http://localhost:8081/dinghyracing/api/entries/13', metadata: {eTag: '"1"'}},
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                    {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
                ], 'sumOfLapTimes': 4, position: 3, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [
                    {'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}
                ], 'sumOfLapTimes': 3, position: 1, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
                {'helm': {name: 'Bob'},'race': raceScorpionA,'dinghy': {...dinghy1234, sailNumber: '9999'}, 'laps': [], 'sumOfLapTimes': 0, position: null, 'url': 'http://localhost:8081/dinghyracing/api/entries/13', metadata: {eTag: '"1"'}},
                {'helm': {name: 'Jane'},'race': raceScorpionA,'dinghy': {...dinghy1234, sailNumber: '8888'}, 'laps': [], 'sumOfLapTimes': 0, position: null, scoringAbbreviation: 'DNS', 'url': 'http://localhost:8081/dinghyracing/api/entries/13', metadata: {eTag: '"1"'}}
            ];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entries})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await act(async () => {
                await user.click(sortByPositionButton);
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
            expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[3]).getByRole('status', {name: (content, node) => node.textContent === '9999'})).toBeInTheDocument();
            expect(within(raceEntryViews[4]).getByRole('status', {name: (content, node) => node.textContent === '8888'})).toBeInTheDocument();
        });
        it('sorts entries with a scoring abbreviation below other entries', async ()=> {
            const entries = [
                // position 5
                {helm: competitorJillMyer, crew: null, race: raceGraduateA, dinghy: dinghy2928, laps: [], sumOfLapTimes: 6,
                    position: 5, scoringAbbreviation: 'RET', onLastLap: false, finishedRace: false, url: 'http://localhost:8081/dinghyracing/api/entries/12', metadata: {eTag: '"1"'}},
                // position 4
                {helm: competitorSarahPascal,race: raceScorpionA, dinghy: dinghy6745, laps: [

                ], sumOfLapTimes: 4, position: null, scoringAbbreviation: null, url: 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                // position 1
                {helm: competitorChrisMarshall,race: raceScorpionA, dinghy: dinghy1234, laps: [
                    {number: 1, time: 1}
                ], sumOfLapTimes: 3, position: 1, url: 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
                // position 2
                {helm: {name: 'Bob'},race: raceScorpionA, dinghy: {...dinghy1234, sailNumber: '9999'}, laps: [

                ], sumOfLapTimes: 0, position: null, scoringAbbreviation: null, url: 'http://localhost:8081/dinghyracing/api/entries/13', metadata: {eTag: '"1"'}},
                // position 3
                {helm: {name: 'Jane'},race: raceScorpionA, dinghy: {...dinghy1234, sailNumber: '8888'}, laps: [

                ], sumOfLapTimes: 0, position: null, scoringAbbreviation: null, url: 'http://localhost:8081/dinghyracing/api/entries/13', metadata: {eTag: '"1"'}}
            ];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entries})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            
            const sortByPositionButton = screen.getByRole('button', {'name': /by position/i});
            await act(async () => {
                await user.click(sortByPositionButton);
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '9999'})).toBeInTheDocument();
            expect(within(raceEntryViews[3]).getByRole('status', {name: (content, node) => node.textContent === '8888'})).toBeInTheDocument();
            expect(within(raceEntryViews[4]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        });
    });    
    describe('when sorting entries that include an entry that did not start', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for DNS entry which is placed last', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'scoringAbbreviation': 'DNS', 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await act(async () => {
                await user.click(sortByLapTimeButton);
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when sorting entries that include an entry that retired', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for RET entry which is placed last', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                    {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
                ], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'scoringAbbreviation': 'RET', 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await act(async () => {
                await user.click(sortByLapTimeButton);
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when sorting entries that include an entry that has been disqualified', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for DSQ entry which is placed last', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                    {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
                ], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'scoringAbbreviation': 'DSQ', 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await act(async () => {
                await user.click(sortByLapTimeButton);
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when sorting entries that include an entry that was on course side', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for OCS entry which is placed last', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                    {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
                ], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'scoringAbbreviation': 'OCS', 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await act(async () => {
                await user.click(sortByLapTimeButton);
            });
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
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
            await act(async () => {
                customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
            await act(async () => {
                await user.click(sortByLapTimeButton);
            });
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
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        // fast group entries
        let entry = (await screen.findByText((content, node) => /^Scorpion6745Sarah Pascal  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
        let onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        entry = (await screen.findByText((content, node) => /^Scorpion1234Chris Marshall  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
        onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        // sort by sail number
        const sortBySailNumber = screen.getByRole('button', {'name': /by sail number/i});
        await act(async () => {
            await user.click(sortBySailNumber);
        });
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
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        let entry = (await screen.findByText((content, node) => /^Scorpion6745Sarah Pascal  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
        const onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    });
    it('displays entries not fast grouped in the same order as before an entry was fast grouped', async () => {
        const entries = [
            {'helm': competitorJillMyer, 'crew': null, 'race': raceGraduateA,'dinghy': dinghy2928, 'laps': [
                {'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}
            ], 'sumOfLapTimes': 6, 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': null, 'url': 'http://localhost:8081/dinghyracing/api/entries/12', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
            ], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
            {'helm': competitorLouScrew,'race': raceGraduateA,'dinghy': dinghy2726, 'laps': [
            ], 'sumOfLapTimes': 0, scoringAbbreviation: 'DNS', 'url': 'http://localhost:8081/dinghyracing/api/entries/13', metadata: {eTag: '"1"'}},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [
                {'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}
            ], 'sumOfLapTimes': 3, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entries})});
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        // sort entries
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await act(async () => {
            await user.click(sortByLapTimeButton);
        });
        // fast group entry
        const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
        const onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[3]).getByRole('status', {name: (content, node) => node.textContent === '2726'})).toBeInTheDocument();
    });
    it('shows entries in order selected with first entry selected at the top', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA_bigData});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceGraduateA]} />, model);
        });
        let entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '2928'})).parentElement.parentElement.parentElement;
        let onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '2009'})).parentElement.parentElement.parentElement;
        onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '2373'})).parentElement.parentElement.parentElement;
        onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '2928'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '2009'})).toBeInTheDocument();
        expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '2373'})).toBeInTheDocument();
    });
    it('shows entries as fast group selected', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        });
        // fast group entries
        let entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
        let onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'})).parentElement.parentElement.parentElement;
        onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('checkbox')).toBeChecked();
        expect(within(raceEntryViews[1]).getByRole('checkbox')).toBeChecked();
        expect(within(raceEntryViews[2]).getByRole('checkbox')).not.toBeChecked();
    });
    it('does not allow an entry with a scoring abbreviation to be fast grouped', async () => {
        const entriesScorpionA_withSA = [{...entryChrisMarshallScorpionA1234, scoringAbbreviation: 'RET'}];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA_withSA});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        });
        const entry = (await screen.findByText((content, node) => /^Scorpion1234Chris Marshall  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view'))); // with only one entry RaceEntriesView and RaceEntryView both match test unless additional criteria specified
        const onFastGroupButton = within(entry).getByRole('checkbox');
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('checkbox')).not.toBeChecked();
        expect(screen.getByText('Cannot fast group an entry with a scoring abbreviation')).toBeInTheDocument();
    });
    describe('when an additional race is selected', () => {
        it('shows fast grouped entries at top of display order', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            let render;
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.name === 'Scorpion A') {
                    return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
                }
                else if (race.name === 'Comet A') {
                    return Promise.resolve({'success': true, 'domainObject': entriesCometA});
                }
            });
            await act(async () => {
                render = customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
            });
            // fast group entries
            const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
            const onFastGroupButton = within(entry).getByRole('checkbox');
            await act(async () => {
                await user.click(onFastGroupButton);
            });
            // select additional race
            await act(async () => {
                render.rerender(<RaceEntriesView races={[raceScorpionA, raceCometA]} />, model);
            });
            const raceEntryViews = document.getElementsByClassName('race-entry-view');
            expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
            expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '826'})).toBeInTheDocument();
            expect(within(raceEntryViews[2]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        });
    });
    describe('when a race is deselected', () => {
        it('shows fast grouped entries at top of display order', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            let render;
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.name === 'Scorpion A') {
                    return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
                }
                else if (race.name === 'Comet A') {
                    return Promise.resolve({'success': true, 'domainObject': entriesCometA});
                }
            });
            await act(async () => {
                render = customRender(<RaceEntriesView races={[raceScorpionA, raceCometA]} />, model);
            });
            // fast group entries
            let entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '826'})).parentElement.parentElement.parentElement;
            let onFastGroupButton = within(entry).getByRole('checkbox');
            await act(async () => {
                await user.click(onFastGroupButton);
            });
            entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'})).parentElement.parentElement.parentElement;
            onFastGroupButton = within(entry).getByRole('checkbox');
            await act(async () => {
                await user.click(onFastGroupButton);
            });
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
        const entriesScorpionA = [
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
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
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        // uncheck fast group
        await act(async () => {
            await user.click(onFastGroupButton);
        });
        const raceEntryViews = document.getElementsByClassName('race-entry-view');
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
    });
});

describe('when adding a lap time', () => {
    it('calls controller add lap function with value of time sailed', async () => {
        const entrySarahPascalScorpionA6745 = {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
            {'number': 1, 'time': 1}, {'number': 2, 'time': 2}
        ], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}};
        const entriesScorpionA = [entrySarahPascalScorpionA6745];

        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 7}};
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        const addLapSpy = jest.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true, 'domainObject': {}})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'});
        await act(async () => {
            await user.click(entry);
        });
        
        expect(addLapSpy).toBeCalledWith(entrySarahPascalScorpionA6745, 7);
    });
    it('updates model', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 7}};
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        const addLapSpy = jest.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true, 'domainObject': {}})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
               
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            await user.click(entry);
        });        
        expect(addLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 7);
    });
    it('refreshes display after addLap completed', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}, {'number': 2, 'time': 312568}], 'sumOfLapTimes': 625136, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"2"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
               
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        
        expect(await screen.queryByText('10:25')).not.toBeInTheDocument();
        await act(async () => {
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(await screen.findByText('10:25')).toBeInTheDocument();
    });
    it('displays a message if there is a problem adding the lap time', async () => {
        const entriesScorpionAPost = [{'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},{'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [],'url': 'http://localhost:8081/dinghyracing/api/entries/11'}];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
               
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            await user.click(entry);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });    
    it('releases entry if there is a problem adding the lap time', async () => {
        const entriesScorpionAPost = [{'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},{'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [],'url': 'http://localhost:8081/dinghyracing/api/entries/11'}];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
               
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            await user.click(entry);
        });
        expect(entry.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"2"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true, 'domainObject': {}})}).mockImplementationOnce((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            await user.click(entry);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();

        await act(async () => {
            await user.click(entry);
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});

describe('when removing a lap time', () => {
    it('updates model', async () => {
        const entryChrisMarshallScorpionA1234Pre = {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7}], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}};
        const entriesScorpionAPre = [entryChrisMarshallScorpionA1234Pre, {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}];

        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        const removeLapSpy = jest.spyOn(controller, 'removeLap').mockImplementation((entry, lap) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });        
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            await user.keyboard('{Control>}');
            await user.click(entry);
        });        
        expect(removeLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234Pre, {'number': 1, 'time': 7});
    });
    it('refreshes display after lap time removed', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        jest.spyOn(controller, 'removeLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        const lapTime = await screen.findByText('05:12');
        expect(lapTime).toBeInTheDocument();
        await act(async ()=> {
            await user.keyboard('{Control>}');
            await user.click(entry);
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(lapTime).not.toBeInTheDocument();
    });
    it('displays a message if there is a problem removing the lap time', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        jest.spyOn(controller, 'removeLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
               
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            await user.keyboard('{Control>}');
            await user.click(entry);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('releases entry if there is a problem problem removing the lap time', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        jest.spyOn(controller, 'removeLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
               
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            await user.keyboard('{Control>}');
            await user.click(entry);
        });
        expect(entry.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes':  0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        jest.spyOn(controller, 'removeLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})}).mockImplementationOnce((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
               
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'});
        await act(async () => {
            await user.keyboard('{Control>}');
            await user.click(entry);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        
        await act(async () => {
            await user.keyboard('{Control>}');
            await user.click(entry);
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});

describe('when updating a lap time', () => {
    it('updates model', async () => {
        const entryChrisMarshallScorpionA1234Pre = {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7000}], 'sumOfLapTimes': 7000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}};
        const entriesScorpionAPre = [
            entryChrisMarshallScorpionA1234Pre, 
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];

        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        const updateLapSpy = jest.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        // render updated components
        await act(async () => {
            await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        });
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await act(async () => {
            await user.clear(lapEntryCellInput);
            await user.type(lapEntryCellInput, '15:23');
            await user.keyboard('{Enter}');
        });
        // expect(updateLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234Pre, '15:23');
        expect(updateLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234Pre, 923000);
    });
    it('refreshes display after lap time updated', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7000}, {'number': 2, 'time': 7000}], 'sumOfLapTimes': 14000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"3"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7000}, {'number': 2, 'time': 8000}], 'sumOfLapTimes': 15000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"4"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        jest.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:14');
        // render updated components
        await act(async () => {
            await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        });
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:14'});
        await act(async () => { 
            await user.clear(lapEntryCellInput);
            await user.type(lapEntryCellInput, '00:15');
            await user.keyboard('{Enter}');
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(await within(raceEntryView).findByText('00:15')).toBeInTheDocument();
    });
    it('displays a message if there is a problem updating the lap time', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7000}], 'sumOfLapTimes': 7000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"2"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 15000}], 'sumOfLapTimes': 15000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"3"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        jest.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        await act(async () => {
            await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        });
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await act(async () => { 
            await user.clear(lapEntryCellInput);
            await user.type(lapEntryCellInput, '00:15');
            await user.keyboard('{Enter}');
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('releases entry if there is a problem updating the lap time', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7000}], 'sumOfLapTimes': 7000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"2"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 15000}], 'sumOfLapTimes': 15000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"3"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        jest.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        await act(async () => {
            await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        });
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await act(async () => { 
            await user.clear(lapEntryCellInput);
            await user.type(lapEntryCellInput, '00:15');
            await user.keyboard('{Enter}');
        });
        expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7000}], 'sumOfLapTimes': 7000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"2"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"3"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 312568,'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});

        jest.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true, 'domainObject': {}})}).mockImplementationOnce((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});

        jest.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
        const entry = await screen.findByRole('status', {name: (content, node) => node.textContent === '6745'});
        // after render perform update        
        await act(async () => {
            await user.click(entry);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        
        let raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        let lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        await act(async () => {
            await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        });

        // after render perform update
        let lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await act(async () => { 
            await user.clear(lapEntryCellInput);
            await user.type(lapEntryCellInput, '00:15');
            await user.keyboard('{Enter}');
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
    it('displays an error message when RaceEntryView fails validation of an updated lap time', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7000}], 'sumOfLapTimes': 7000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"2"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 15000}], 'sumOfLapTimes': 15000, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"3'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        const lapEntryCellOutput = within(raceEntryView).getByText('00:07');
        await act(async () => {
            await user.pointer({target: lapEntryCellOutput, keys: '[MouseRight]'});
        });
        // after render perform update
        const lapEntryCellInput = within(raceEntryView).getByRole('textbox', {value: '00:07'});
        await act(async () => { 
            await user.clear(lapEntryCellInput);
            await user.type(lapEntryCellInput, '0150012');
            await user.keyboard('{Enter}');
        });
        expect(await screen.findByText(/Time must be in the format \[hh:\]\[mm:\]ss./i)).toBeInTheDocument();
    });
});

describe('when setting a scoring abbreviation', () => {
    it('call controller setScoringAbbreviation', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        const controller = new DinghyRacingController(model);
        const setScoringAbbreviationSpy = jest.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await act(async () => {
            await user.selectOptions(selectSA, 'DNS');
        });
        expect(setScoringAbbreviationSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 'DNS');
    });
    it('displays a message if there is a problem updating the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        const controller = new DinghyRacingController(model);
        jest.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await act(async () => {
            await user.selectOptions(selectSA, 'DNS');
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('releases entry if there is a problem updating the lap time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        const controller = new DinghyRacingController(model);
        jest.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await act(async () => {
            await user.selectOptions(selectSA, 'DNS');
        });
        const raceEntryView = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'}).parentElement.parentElement.parentElement;
        expect(raceEntryView.getAttribute('class')).not.toMatch(/disabled/i);
    });
    it('clears error message on success', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        const controller = new DinghyRacingController(model);
        const setScoringAbbreviationSpy = jest.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': true})}).mockImplementationOnce((entry, scoringAbbreviation) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        // after render perform update
        const selectSA = screen.getAllByRole('combobox')[0];
        await act(async () => {
            await user.selectOptions(selectSA, 'DNS');
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        // after render perform update
        await act(async () => {
            await user.selectOptions(selectSA, 'DNS');
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});

describe('when user drags and drops an entry to a new position', () => {
    it('updates the display order to show the subject entry in the position above the target entry', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234, position: 4}, {...entrySarahPascalScorpionA6745, position: 3}]});})
        const controller = new DinghyRacingController(model);
        jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
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
        await act(async () => {
            fireEvent.dragStart(subjectREV, {dataTransfer: dataTransferObject});
        });
        await act(async () => {
            fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
        });
        expect(within(raceEntryViews[0]).getByRole('status', {name: (content, node) => node.textContent === '6745'})).toBeInTheDocument();
        expect(within(raceEntryViews[1]).getByRole('status', {name: (content, node) => node.textContent === '1234'})).toBeInTheDocument();
    });
    describe('when race is a pursuit race', () => {
        describe('when dropped on a target entry in the same race that has a position', () => {
            it('update subject entry race position', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const raceScorpionAPursuit = {...raceScorpionA, type: 'PURSUIT'};
                jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                    return Promise.resolve({'success': true, 'domainObject': [
                        {...entryChrisMarshallScorpionA1234, race: raceScorpionAPursuit, position: 4, metadata: {eTag: '"1"'}},
                        {...entrySarahPascalScorpionA6745, race: raceScorpionAPursuit, position: 3, metadata: {eTag: '"1"'}}
                    ]});
                });
                const controller = new DinghyRacingController(model);
                const setUpdateEntryPositionSpy = jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
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
                });
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(setUpdateEntryPositionSpy).toBeCalledWith({...entryChrisMarshallScorpionA1234, race: raceScorpionAPursuit, position: 4}, 3);
            });
        });
        describe('when dropped on a target entry in a different race that has a position', () => {
            it('does not update subject entry race position', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const raceScorpionAPursuit = {...raceScorpionA, type: 'PURSUIT'};
                const raceGraduateAPursuit = {...raceGraduateA, type: 'PURSUIT'};
                const entryJillMyerGraduateA2928 = {helm: competitorJillMyer, crew: null, race: raceGraduateA, dinghy: dinghy2928, laps: [], sumOfLapTimes: 0, correctedTime: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, 
                    position: 3, url: 'http://localhost:8081/dinghyracing/api/entries/12', metadata: {eTag: '"3'}};

                jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                    if (race.url === 'http://localhost:8081/dinghyracing/api/races/4') {
                        return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234, position: 4}]});
                    }
                    if (race.url === 'http://localhost:8081/dinghyracing/api/races/7') {
                        return Promise.resolve({'success': true, 'domainObject': [entryJillMyerGraduateA2928]});
                    }
                    
                });
                const controller = new DinghyRacingController(model);
                const setUpdateEntryPositionSpy = jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
                await act(async () => {
                    customRender(<RaceEntriesView races={[raceScorpionAPursuit, raceGraduateAPursuit]} />, model, controller);
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
                });
                await act(async () => {
                    fireEvent.drop(targetREV, {dataTransfer: dataTransferObject});
                });
                expect(setUpdateEntryPositionSpy).not.toBeCalledWith({...entryChrisMarshallScorpionA1234, position: 4}, 3);
            });
        });
        describe('when position in race of target has not been set', () => {
            describe('when position of subject in race has been set', () => {
                it('does not update subject entry race position', async () => {
                    const user = userEvent.setup();
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234}, {...entrySarahPascalScorpionA6745, position: 3}]});})
                    const controller = new DinghyRacingController(model);
                    const setUpdateEntryPositionSpy = jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
                    await act(async () => {
                        customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
                    });
                    // screen.debug();
                    const targetREV = screen.getByText(/chris marshall/i).parentElement.parentElement.parentElement;
                    const subjectREV = screen.getByText(/sarah pascal/i).parentElement.parentElement.parentElement;
            
                    const dataTransferObject = {
                        data: new Map(), 
                        setData(key, value) {this.data.set(key, value)},
                        getData(key) {return this.data.get(key)}
                    };
    
                    await act(async () => {
                        fireEvent.dragStart(targetREV, {dataTransfer: dataTransferObject});
                    });
                    await act(async () => {
                        fireEvent.drop(subjectREV, {dataTransfer: dataTransferObject});
                    });
                    expect(setUpdateEntryPositionSpy).not.toHaveBeenCalled();
                });
            });
            describe('when position of subject has not been set', () => {
                it('position of subject remains the same', async () => {
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234}, {...entrySarahPascalScorpionA6745}]});})
                    const controller = new DinghyRacingController(model);
                    const setUpdateEntryPositionSpy = jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
                    await act(async () => {
                        customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
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
                    });
                    await act(async () => {
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
                jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234, race: raceScorpionAPursuit, position: 4},
                    {...entrySarahPascalScorpionA6745, race: raceScorpionAPursuit, position: 3}]})});
                const controller = new DinghyRacingController(model);
                jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': false, message: 'Any old nonsense'})});
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
                });
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(await screen.findByText(/any old nonsense/i)).toBeInTheDocument();
            });
            it('releases entry if there is a problem updating the position', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const raceScorpionAPursuit = {...raceScorpionA, type: 'PURSUIT'};
                jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234, race: raceScorpionAPursuit, position: 4},
                    {...entrySarahPascalScorpionA6745, race: raceScorpionAPursuit, position: 3}]})});
                const controller = new DinghyRacingController(model);
                jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': false, message: 'Any old nonsense'})});
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
                });
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(rev1.getAttribute('class')).not.toMatch(/disabled/i);
            });
            it('clears error message on success', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const raceScorpionAPursuit = {...raceScorpionA, type: 'PURSUIT'};
                jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234, race: raceScorpionAPursuit, position: 4},
                    {...entrySarahPascalScorpionA6745, race: raceScorpionAPursuit, position: 3}]})});
                const controller = new DinghyRacingController(model);
                jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})}).mockImplementationOnce((entry, newPosition) => {return Promise.resolve({'success': false, message: 'Any old nonsense'})});
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
                await act(async () => {
                    fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                });
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(await screen.findByText(/Any old nonsense/i)).toBeInTheDocument();
                // after render perform update
                await act(async () => {
                    fireEvent.dragStart(rev1, {dataTransfer: dataTransferObject});
                });
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
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
                jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234, position: 4}, {...entrySarahPascalScorpionA6745, position: 3}]});})
                const controller = new DinghyRacingController(model);
                const setUpdateEntryPositionSpy = jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
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
                });
                await act(async () => {
                    fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
                });
                expect(setUpdateEntryPositionSpy).not.toBeCalledWith({...entryChrisMarshallScorpionA1234, position: 4}, 3);
            });
        });
    });
    describe('when entry dragged onto another entry with a scoring abbreviation', () => {
        it('does not change the positions of the entries and advises user that the operation is not allowed', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234}, {...entrySarahPascalScorpionA6745, position: 2, scoringAbbreviation: 'DNS'}]})});
            const controller = new DinghyRacingController(model);
            const setUpdateEntryPositionSpy = jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
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
            });
            await act(async () => {
                fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
            });
            expect(setUpdateEntryPositionSpy).not.toBeCalled();
            expect(await screen.findByText(/cannot change position of an entry with a scoring abbreviation/i)).toBeInTheDocument();
        });
    });
    describe('when entry with a scoring abbreviation is dragged onto another entry', () => {
        it('does not change the positions of the entries and advises user that the operation is not allowed', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234, position: 2, scoringAbbreviation: 'DNS'}, {...entrySarahPascalScorpionA6745}]})});
            const controller = new DinghyRacingController(model);
            const setUpdateEntryPositionSpy = jest.spyOn(controller, 'updateEntryPosition').mockImplementation((entry, newPosition) => {return Promise.resolve({'success': true})});
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
            });
            await act(async () => {
                fireEvent.drop(rev2, {dataTransfer: dataTransferObject});
            });
            expect(setUpdateEntryPositionSpy).not.toBeCalled();
            expect(await screen.findByText(/cannot change position of an entry with a scoring abbreviation/i)).toBeInTheDocument();
        });
    });
    describe('when a non-fast grouped entry is dropped onto a fast grouped entry', () => {
        it('inserts dropped entry into fast group at location of target and treats dropped entry as fast grouped', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
            ];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.name === 'Scorpion A') {
                    return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
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
            await act(async () => {
                await user.click(onFastGroupButton);
            });
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
            });
            await act(async () => {
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
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
            ];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.name === 'Scorpion A') {
                    return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
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
            await act(async () => {
                await user.click(onFastGroupButton);
            });
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
            });
            await act(async () => {
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
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}}
            ];
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
                if (race.name === 'Scorpion A') {
                    return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
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
            await act(async () => {
                await user.click(onFastGroupButton);
            });
            entry = (await screen.findByText((content, node) => /^Scorpion1234Chris Marshall  OCSDNCDNSDNFDSQRET$/.test(node.textContent) && node.classList.contains('race-entry-view')));
            onFastGroupButton = within(entry).getByRole('checkbox');
            await act(async () => {
                await user.click(onFastGroupButton);
            });
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
            });
            await act(async () => {
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
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [
                {'number': 1, 'time': 312568}
            ], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"1"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"1"'}}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [
                {'number': 1, 'time': 312568},
                {'number': 2, 'time': 312568}
            ], 'sumOfLapTimes': 625136, 'url': 'http://localhost:8081/dinghyracing/api/entries/10', metadata: {eTag: '"2"'}},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11', metadata: {eTag: '"2"'}}
        ];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
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
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Pursuit A') {
                return Promise.resolve({'success': true, 'domainObject': entriesPursuitA});
            }
        });
        await act(async () => {
            customRender(<RaceEntriesView races={[racePursuitA]} />, model);
        });
        const entry = (await screen.findByRole('status', {name: (content, node) => node.textContent === '1234'})).parentElement.parentElement.parentElement;        
        expect(within(entry).queryByRole('checkbox')).not.toBeInTheDocument();
        
    });
});