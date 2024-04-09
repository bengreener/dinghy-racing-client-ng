import { act, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { customRender } from '../test-utilities/custom-renders';
import RaceEntriesView from './RaceEntriesView';
import { httpRootURL, wsRootURL, competitorSarahPascal, competitorChrisMarshall, competitorJillMyer, dinghy6745, dinghy1234, dinghy2928, raceScorpionA, raceGraduateA, entriesScorpionA, entriesGraduateA, entryChrisMarshallScorpionA1234 } from '../model/__mocks__/test-data';
import DinghyRacingController from '../controller/dinghy-racing-controller';

jest.mock('../model/dinghy-racing-model');

// some of the updates display after tests may no longer be required as update route via web sockets is driven from server (2 tests lap times following entry update notification & clears error message after successful update)?

const entryRowLastCellLapTimeCellOffset = 3;

afterEach(() => {
    jest.resetAllMocks();
})

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    await act(async () => {
        customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
    });
    const raceEntries = document.getElementById('race-entries-table');
    expect(raceEntries).toBeInTheDocument();
});

it('displays entries for selected races', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesGraduateA})});
    await act(async () => {
        customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
    });
    const entry1 = await screen.findByText(/Scorpion 1234 Chris Marshall/i);
    const entry2 = await screen.findByText(/Scorpion 6745 Sarah Pascal/i);
    const entry3 = await screen.findByText(/Graduate 2928 Jill Myer/i);
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
    it('sorts by the last three digits of the sail number', async () => {
        const entriesScorpionA = [
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11'},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}
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
        const sortByLastThreeButton = screen.getByRole('button', {'name': /by last 3/i});
        await act(async () => {
            await user.click(sortByLastThreeButton);
        });
        const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const orderedEntries = cells.map(cell => cell.textContent);
        expect(orderedEntries).toEqual(['Scorpion 1234 Chris Marshall', 'Scorpion 6745 Sarah Pascal', 'Graduate 2928 Jill Myer']);
    });
    it('sorts back to the default order received from the REST server', async () => {
        const entriesScorpionA = [
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}
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
        await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const sortByLastThreeButton = screen.getByRole('button', {'name': /by last 3/i});
        const sortByDefaultButton = screen.getByRole('button', {'name': /default/i});
        // sort into a different order
        await act(async () => {
            await user.click(sortByLastThreeButton);
        });        
        // sort back to original order
        await act(async () => {
            await user.click(sortByDefaultButton);
        });
        const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const orderedEntries = cells.map(cell => cell.textContent);

        expect(orderedEntries).toEqual(['Scorpion 6745 Sarah Pascal', 'Scorpion 1234 Chris Marshall', 'Graduate 2928 Jill Myer']);
    });
    it('sorts by the dinghy class and last three digits of the sail number', async () => {
        const entriesScorpionA = [
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}
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
        
        const sortByClassAndLastThreeButton = screen.getByRole('button', {'name': /by class & last 3/i});
        await act(async () => {
            await user.click(sortByClassAndLastThreeButton);
        });
        
        const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const orderedEntries = cells.map(cell => cell.textContent);
        expect(orderedEntries).toEqual(['Graduate 2928 Jill Myer', 'Scorpion 1234 Chris Marshall', 'Scorpion 6745 Sarah Pascal']);
    });
    it('sorts by the total recorded lap times plus race start time of dinghies in ascending order', async () => {
        const entries = [
            {'helm': competitorJillMyer, 'crew': null, 'race': raceGraduateA,'dinghy': dinghy2928, 'laps': [
                {'number': 1, 'time': 2}, {'number': 2, 'time': 2}, {'number': 3, 'time': 2}
            ], 'sumOfLapTimes': 6, 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': null, 'url': 'http://localhost:8081/dinghyracing/api/entries/12'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
            ], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'},
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [
                {'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}
            ], 'sumOfLapTimes': 3, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}
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
        const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const orderedEntries = cells.map(cell => cell.textContent);

        expect(orderedEntries).toEqual(['Scorpion 1234 Chris Marshall', 'Scorpion 6745 Sarah Pascal', 'Graduate 2928 Jill Myer']);
    });
    describe('when sorting entries that include an entry that did not start', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for DNS entry which is placed last', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'scoringAbbreviation': 'DNS', 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}];
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
            const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
            const orderedEntries = cells.map(cell => cell.textContent);

            expect(orderedEntries).toEqual(['Scorpion 6745 Sarah Pascal', 'Scorpion 1234 Chris Marshall']);
        });
    });
    describe('when sorting entries that include an entry that retired', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for RET entry which is placed last', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                    {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
                ], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'scoringAbbreviation': 'RET', 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}];
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
            const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
            const orderedEntries = cells.map(cell => cell.textContent);

            expect(orderedEntries).toEqual(['Scorpion 6745 Sarah Pascal', 'Scorpion 1234 Chris Marshall']);
        });
    });
    describe('when sorting entries that include an entry that has been disqualified', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for DSQ entry which is placed last', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
                    {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
                ], 'sumOfLapTimes': 4, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'scoringAbbreviation': 'DSQ', 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}];
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
            const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
            const orderedEntries = cells.map(cell => cell.textContent);

            expect(orderedEntries).toEqual(['Scorpion 6745 Sarah Pascal', 'Scorpion 1234 Chris Marshall']);
        });
    });
    describe('when sorting entries that include an entry that has finished the race', () => {
        it('sorts by the total recorded lap times of dinghies in ascending order except for an entry that has finished the race which is placed last', async () => {
            const entriesScorpionA = [
                {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [{'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}], 'sumOfLapTimes': 3, 'finishedRace': true, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'},
                {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 2}, {'number': 2, 'time': 2}], 'sumOfLapTimes': 0, 'scoringAbbreviation': 'DSQ', 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}];
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
            const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
            const orderedEntries = cells.map(cell => cell.textContent);

            expect(orderedEntries).toEqual(['Scorpion 1234 Chris Marshall', 'Scorpion 6745 Sarah Pascal']);
        });
    });
});

describe('when adding a lap time', () => {
    it('calculates lap time correctly as total elapsed time less sum of previous lap times', async () => {
        const entrySarahPascalScorpionA6745 = {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
            {'number': 1, 'time': 1}, {'number': 2, 'time': 2}
        ], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11'};
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
        const entry = await screen.findByText(/scorpion 6745/i);
        await act(async () => {
            await user.click(entry);
        });
        
        expect(addLapSpy).toBeCalledWith(entrySarahPascalScorpionA6745, 4);
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
               
        const entry = await screen.findByText(/scorpion 1234/i);
        await act(async () => {
            await user.click(entry);
        });        
        expect(addLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 7);
    });
    it('refreshes display after addLap completed', async () => {
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
        ];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 312568}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        });
               
        const entry = await screen.findByText(/scorpion 1234/i);
        await act(async () => {
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(await screen.findAllByRole('cell', {'name': '05:13'})).toHaveLength(2);
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
               
        const entry = await screen.findByText(/scorpion 1234/i);
        await act(async () => {
            await user.click(entry);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('clears error message on success', async () => {
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
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
               
        const entry = await screen.findByText(/scorpion 1234/i);
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
        const entryChrisMarshallScorpionA1234Pre = {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7}], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'};
        const entriesScorpionAPre = [entryChrisMarshallScorpionA1234Pre, {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11'}];

        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        const removeLapSpy = jest.spyOn(controller, 'removeLap').mockImplementation((entry, lap) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });        
        const entry = await screen.findByText(/scorpion 1234/i);
        await act(async () => {
            await user.keyboard('{Control>}');
            await user.click(entry);
        });        
        expect(removeLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234Pre, {'number': 1, 'time': 7});
    });
    it('refreshes display after lap time removed', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
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
        const entry = await screen.findByText(/scorpion 1234/i);
        const cell = await screen.findAllByRole('cell', {'name': '05:13'});
        expect(cell).toHaveLength(2);
        await act(async ()=> {
            await user.keyboard('{Control>}');
            await user.click(entry);
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(cell[0]).not.toBeInTheDocument();
    });
    it('displays a message if there is a problem removing the lap time', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
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
               
        const entry = await screen.findByText(/scorpion 1234/i);
        await act(async () => {
            await user.keyboard('{Control>}');
            await user.click(entry);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('clears error message on success', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes':  0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
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
               
        const entry = await screen.findByText(/scorpion 1234/i);
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
        const entryChrisMarshallScorpionA1234Pre = {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7}], 'sumOfLapTimes': 7, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'};
        const entriesScorpionAPre = [
            entryChrisMarshallScorpionA1234Pre, 
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
        ];

        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        const updateLapSpy = jest.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const entryRow = screen.getByText(/scorpion 1234/i).parentElement;
        const lastCell = entryRow.children[entryRow.children.length - entryRowLastCellLapTimeCellOffset];
        // render updated components
        await act(async () => {
            await user.pointer({target: lastCell, keys: '[MouseRight]'});
        });
        // after render perform update
        await act(async () => {
            await user.clear(lastCell.lastChild);
            await user.type(lastCell.lastChild, '15678');
            await user.keyboard('{Enter}');
        });
        expect(updateLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234Pre, 15678);
    });
    it('refreshes display after lap time updated', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7}], 'sumOfLapTimes': 7, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 15678}], 'sumOfLapTimes': 15678, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
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
        const entryRow = screen.getByText(/scorpion 1234/i).parentElement;
        const lastCell = entryRow.children[entryRow.children.length - entryRowLastCellLapTimeCellOffset];
        // render updated components
        await act(async () => {
            await user.pointer({target: lastCell, keys: '[MouseRight]'});
        });
        // after render perform update
        await act(async () => { 
            await user.clear(lastCell.lastChild);
            await user.type(lastCell.lastChild, '15678');
            await user.keyboard('{Enter}');
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(await screen.findAllByRole('cell', {'name': '00:16'})).toHaveLength(2);
    });
    it('displays a message if there is a problem updating the lap time', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7}], 'sumOfLapTimes': 7, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
        ];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0, 'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
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
        const entryRow = screen.getByText(/scorpion 1234/i).parentElement;
        const lastCell = entryRow.children[entryRow.children.length - entryRowLastCellLapTimeCellOffset];
        await act(async () => {
            await user.pointer({target: lastCell, keys: '[MouseRight]'});
        });
        // after render perform update
        await act(async () => { 
            await user.clear(lastCell.lastChild);
            await user.type(lastCell.lastChild, '15678');
            await user.keyboard('{Enter}');
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
    it('clears error message on success', async () => {
        const entriesScorpionAPre = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7}], 'sumOfLapTimes': 7, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 0,'url': 'http://localhost:8081/dinghyracing/api/entries/11'}];
        const entriesScorpionAPost = [
            {'helm': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 312568}], 'sumOfLapTimes': 312568, 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
            {'helm': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [], 'sumOfLapTimes': 312568,'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
        ];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        jest.spyOn(controller, 'updateLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})}).mockImplementationOnce((entry, time) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const entryRow = screen.getByText(/scorpion 1234/i).parentElement;
        const lastCell = entryRow.children[entryRow.children.length - entryRowLastCellLapTimeCellOffset];
        await act(async () => {
            await user.pointer({target: lastCell, keys: '[MouseRight]'});
        });
        // after render perform update
        await act(async () => { 
            await user.clear(lastCell.lastChild);
            await user.type(lastCell.lastChild, '15678');
            await user.keyboard('{Enter}');
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();

        await act(async () => {
            await user.pointer({target: lastCell, keys: '[MouseRight]'});
        });
        // after render perform update
        await act(async () => { 
            await user.clear(lastCell.lastChild);
            await user.type(lastCell.lastChild, '15678');
            await user.keyboard('{Enter}');
            model.handleEntryUpdate({'body': entriesScorpionA[0].url});
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
});

describe('when setting a scoring abbreviation', () => {
    it('call controller setScoringAbbreviation', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        const setScoringAbbreviationSpy = jest.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': true})});
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
        const controller = new DinghyRacingController(model);
        const setScoringAbbreviationSpy = jest.spyOn(controller, 'setScoringAbbreviation').mockImplementation((entry, scoringAbbreviation) => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        });
        const selectSA = screen.getAllByRole('combobox')[0];
        await act(async () => {
            await user.selectOptions(selectSA, 'DNS');
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
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
})