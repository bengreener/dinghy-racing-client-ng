import { act, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { customRender } from '../test-utilities/custom-renders';
import RaceEntriesView from './RaceEntriesView';
import { rootURL, competitorSarahPascal, competitorChrisMarshall, dinghy6745, dinghy1234, raceScorpionA, raceGraduateA, entriesScorpionA, entriesGraduateA } from '../model/__mocks__/test-data';

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
});