import { act, screen, render } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import DinghyRacingModel from '../model/dinghy-racing-model';
import CompetitorsConsole from './CompetitorsConsole';
import { httpRootURL, wsRootURL, competitorsCollection } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    await act( async () => {
        customRender(<CompetitorsConsole />, model);
    });
    expect(screen.getByRole('heading', {name: 'Competitors'})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'Competitors'}));
});

describe('when there are competitors', () => {
    it('displays list of competitors', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
        await act( async () => {
            customRender(<CompetitorsConsole />, model);
        });
        expect(await screen.findByRole('cell', {name: /chris marshall/i})).toBeInTheDocument();
        expect(await screen.findByRole('cell', {name: /Sarah Pascal/i})).toBeInTheDocument();
    });
});

describe('when there is a problem retrieving competitors', () => {
    it('displays error message', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: false, message: 'Oops!'})});
        await act( async () => {
            customRender(<CompetitorsConsole />, model);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    })
});