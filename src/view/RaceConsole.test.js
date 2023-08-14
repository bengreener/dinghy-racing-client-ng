import { customRender } from '../test-utilities/custom-renders';import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import RaceConsole from './RaceConsole';
import { rootURL, racesCollectionHAL, races, raceScorpionA } from '../model/__mocks__/test-data';
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

it('enables a race to be selected', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model);
    const selectRace = await screen.findByLabelText(/Race/i);
    await screen.findAllByRole('option');
    await user.selectOptions(selectRace, 'Scorpion A');
    expect(selectRace).toHaveValue('Scorpion A');
});

it('starts the selected race', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    const startRaceSpy = jest.spyOn(model, 'startRace');

    customRender(<RaceConsole />, model);
    const selectRace = await screen.findByLabelText(/Race/i);
    await screen.findAllByRole('option');
    await user.selectOptions(selectRace, 'Scorpion A');
    
    const buttonStart = screen.getByText(/start/i);
    await user.click(buttonStart);
    expect(startRaceSpy).toBeCalledWith(raceScorpionA);
});