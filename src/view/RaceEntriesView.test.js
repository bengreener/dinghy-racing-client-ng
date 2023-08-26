import { act, queryAllByRole, screen, waitForElementToBeRemoved, waitFor, prettyDOM } from '@testing-library/react';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { customRender } from '../test-utilities/custom-renders';
import RaceEntriesView from './RaceEntriesView';
import { rootURL, raceScorpionA, raceGraduateA, entriesScorpionA, entriesGraduateA } from '../model/__mocks__/test-data';

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
            else if (race.name === 'Graduate A') {// console.log('Entries Graduate A');
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