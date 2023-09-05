import { act, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { customRender } from '../test-utilities/custom-renders';
import RaceEntriesView from './RaceEntriesView';
import { rootURL, competitorSarahPascal, competitorChrisMarshall, dinghy6745, dinghy1234, raceScorpionA, raceGraduateA, entriesScorpionA, entriesGraduateA, entryChrisMarshallScorpionA1234 } from '../model/__mocks__/test-data';
import DinghyRacingController from '../controller/dinghy-racing-controller';

jest.mock('../model/dinghy-racing-model');

afterEach(() => {
    jest.resetAllMocks();
})

it('renders', () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
    const raceEntries = document.getElementById('race-entries-table');

    expect(raceEntries).toBeInTheDocument();
});

it('displays entries for selected races', async () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesGraduateA})});
    customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);

    const entry1 = await screen.findByText(/Scorpion 1234 Chris Marshall/i);
    const entry2 = await screen.findByText(/Scorpion 6745 Sarah Pascal/i);
    const entry3 = await screen.findByText(/Graduate 2928 Jill Myer/i);
    expect(entry1).toBeInTheDocument();
    expect(entry2).toBeInTheDocument();
    expect(entry3).toBeInTheDocument();
});

describe('when no race is selected', () => {
    it('shows no entries', async () => {
        const model = new DinghyRacingModel(rootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        const cells = await screen.findAllByRole('cell');
        await act(async () => {
            waitForElementToBeRemoved(cells);
        });
    })
});

describe('when a race is unselected', () => {
    it('entries are removed from display', async () => {
        const model = new DinghyRacingModel(rootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        const graduateEntries = await screen.findAllByText(/Graduate/i);
        await act(async () => {
            waitForElementToBeRemoved(graduateEntries);
        });
    });
});

describe('when sorting entries', () => {
    it('sorts by the last three digits of the sail number', async () => {
        const entriesScorpionA = [{'competitor': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [],'url': 'http://localhost:8081/dinghyracing/api/entries/11'},{'competitor': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        const sortByLastThreeButton = screen.getByRole('button', {'name': /by last 3/i});
        await user.click(sortByLastThreeButton);
        const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const orderedEntries = cells.map(cell => cell.textContent);

        expect(orderedEntries).toEqual(['Scorpion 1234 Chris Marshall', 'Scorpion 6745 Sarah Pascal', 'Graduate 2928 Jill Myer']);
    });
    it('sorts back to the default order received from the REST server', async () => {
        const entriesScorpionA = [{'competitor': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [],'url': 'http://localhost:8081/dinghyracing/api/entries/11'},{'competitor': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const sortByLastThreeButton = screen.getByRole('button', {'name': /by last 3/i});
        const sortByDefaultButton = screen.getByRole('button', {'name': /default/i});
        // sort into a different order
        await user.click(sortByLastThreeButton);
        // sort back to original order
        await user.click(sortByDefaultButton);
        const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const orderedEntries = cells.map(cell => cell.textContent);

        expect(orderedEntries).toEqual(['Scorpion 6745 Sarah Pascal', 'Scorpion 1234 Chris Marshall', 'Graduate 2928 Jill Myer']);
    });
    it('sorts by the dinghy class and last three digits of the sail number', async () => {
        const entriesScorpionA = [{'competitor': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [],'url': 'http://localhost:8081/dinghyracing/api/entries/11'},{'competitor': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        customRender(<RaceEntriesView races={[raceScorpionA, raceGraduateA]} />, model);
        const sortByClassAndLastThreeButton = screen.getByRole('button', {'name': /by class & last 3/i});
        await user.click(sortByClassAndLastThreeButton);
        const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const orderedEntries = cells.map(cell => cell.textContent);

        expect(orderedEntries).toEqual(['Graduate 2928 Jill Myer', 'Scorpion 1234 Chris Marshall', 'Scorpion 6745 Sarah Pascal']);
    });
    it('sorts by the total recorded lap times of dinghies in ascending order', async () => {
        const entriesScorpionA = [{'competitor': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
            {'number': 1, 'time': 2}, {'number': 2, 'time': 2}
        ],'url': 'http://localhost:8081/dinghyracing/api/entries/11'},
        {'competitor': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [
            {'number': 1, 'time': 1}, {'number': 2, 'time': 1}, {'number': 3, 'time': 1}
        ], 'url': 'http://localhost:8081/dinghyracing/api/entries/10'}];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        customRender(<RaceEntriesView races={[raceScorpionA]} />, model);
        const sortByLapTimeButton = screen.getByRole('button', {'name': /by lap time/i});
        await user.click(sortByLapTimeButton);
        const cells = await screen.findAllByText(/\w+ (\d+) [\w ]+/i);
        const orderedEntries = cells.map(cell => cell.textContent);

        expect(orderedEntries).toEqual(['Scorpion 1234 Chris Marshall', 'Scorpion 6745 Sarah Pascal']);
    });
});

describe('when adding a lap time', () => {
    it('calculates lap time correctly as total elapsed time less sum of previous lap times', async () => {
        const entrySarahPascalScorpionA6745 = {'competitor': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [
            {'number': 1, 'time': 1}, {'number': 2, 'time': 2}
        ],'url': 'http://localhost:8081/dinghyracing/api/entries/11'};
        const entriesScorpionA = [entrySarahPascalScorpionA6745];

        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 7}};
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        const addLapSpy = jest.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true, 'domainObject': {}})});
        customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        
        const entry = await screen.findByText(/scorpion 6745/i);
        await user.click(entry);
        expect(addLapSpy).toBeCalledWith(entrySarahPascalScorpionA6745, 4);
    });
    it('updates model', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 7}};
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        const addLapSpy = jest.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true, 'domainObject': {}})});
        customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        
        const entry = await screen.findByText(/scorpion 1234/i);
        await user.click(entry);
        expect(addLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 7);
    });
    it('refreshes display after addLap completed', async () => {
        const entriesScorpionAPost = [{'competitor': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7}], 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},{'competitor': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [],'url': 'http://localhost:8081/dinghyracing/api/entries/11'}];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        const controller = new DinghyRacingController(model);
        const clock = {getElapsedTime: () => {return 7}};
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPost})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(controller, 'addLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true, 'domainObject': {}})});
        customRender(<RaceEntriesView races={[{...raceScorpionA, clock: clock}]} />, model, controller);
        
        const entry = await screen.findByText(/scorpion 1234/i);
        await user.click(entry);
        expect(await screen.findByRole('cell', {'name': 7})).toBeInTheDocument();
    });
});

describe('when removing a lap time', () => {
    it('updates model', async () => {
        const entryChrisMarshallScorpionA1234Pre = {'competitor': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7}], 'url': 'http://localhost:8081/dinghyracing/api/entries/10'};
        const entriesScorpionAPre = [entryChrisMarshallScorpionA1234Pre, {'competitor': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [],'url': 'http://localhost:8081/dinghyracing/api/entries/11'}];

        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        const removeLapSpy = jest.spyOn(controller, 'removeLap').mockImplementation((entry, lap) => {return Promise.resolve({'success': true})});
        customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        const entry = await screen.findByText(/scorpion 1234/i);
        await user.keyboard('{Control>}');
        await user.click(entry);
        expect(removeLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234Pre, {'number': 1, 'time': 7});
    });
    it('refreshes display after lap time removed', async () => {
        const entriesScorpionAPre = [{'competitor': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [{'number': 1, 'time': 7}], 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},{'competitor': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [],'url': 'http://localhost:8081/dinghyracing/api/entries/11'}];
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace')
            .mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})})
            .mockImplementationOnce((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionAPre})});
        jest.spyOn(controller, 'removeLap').mockImplementation((entry, time) => {return Promise.resolve({'success': true})});
        customRender(<RaceEntriesView races={[{...raceScorpionA}]} />, model, controller);
        
        const entry = await screen.findByText(/scorpion 1234/i);
        const cells = await screen.findAllByRole('cell', {'name': 7});
        
        waitForElementToBeRemoved(cells);
        await user.keyboard('{Control>}');
        await user.click(entry);
    });
});