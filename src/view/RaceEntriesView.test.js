import { screen } from '@testing-library/react';
import DinghyRacingModel from '../model/dinghy-racing-model';
import { customRender } from '../test-utilities/custom-renders';
import RaceEntriesView from './RaceEntriesView';
import { rootURL, entriesScorpionA } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');

it('renders', () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    customRender(<RaceEntriesView />, model);
    const raceEntries = document.getElementById('race-entries-table');

    expect(raceEntries).toBeInTheDocument();
});

it('displays entries for selected race', async () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    customRender(<RaceEntriesView />, model);

    const entry1 = await screen.findByText(/Scorpion 1234 Chris Marshall/i);
    const entry2 = await screen.findByText(/Scorpion 6745 Sarah Pascal/i);
    expect(entry1).toBeInTheDocument();
    expect(entry2).toBeInTheDocument();
});