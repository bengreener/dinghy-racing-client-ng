import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import RaceConsole from './RaceConsole';
import { customRender } from '../test-utilities/custom-renders';
import { rootURL, racesCollectionHAL, races } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';

jest.mock('../model/dinghy-racing-model');

it('renders', () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model);

    const selectRace = screen.getByLabelText(/Select Race/i);
    expect(selectRace).toBeInTheDocument();
});

it('displays races available for selection', async () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model);
    const optionScorpion = await screen.findByRole('option', {'name': /Scorpion A/i});
    const optionsGraduate = await screen.findByRole('option', {'name': /Graduate A/i});
    
    expect(optionScorpion).toBeInTheDocument();
    expect(optionsGraduate).toBeInTheDocument();
});

it('notifies user if races cannot be retrieved', async () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Http 404 Error'})});

    customRender(<RaceConsole />, model);
    const message = await screen.findByText(/Unable to load races/i);
    expect(message).toBeInTheDocument();
});