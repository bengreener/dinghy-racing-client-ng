import { customRender } from '../test-utilities/custom-renders';import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import RaceConsole from './RaceConsole';
import { rootURL, dinghyClassScorpion, racesCollectionHAL, races, raceScorpionA, entriesScorpionA } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';

jest.mock('../model/dinghy-racing-model');

it('renders', () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model);

    const selectRace = screen.getByLabelText(/Select Race/i);
    expect(selectRace).toBeInTheDocument();
});

it('displays races available for selection', async () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});

    customRender(<RaceConsole />, model);
    const optionScorpion = await screen.findByRole('option', {'name': /Scorpion A/i});
    const optionsGraduate = await screen.findByRole('option', {'name': /Graduate A/i});
    
    expect(optionScorpion).toBeInTheDocument();
    expect(optionsGraduate).toBeInTheDocument();
});

it('notifies user if races cannot be retrieved', async () => {
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Http 404 Error'})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});

    customRender(<RaceConsole />, model);
    const message = await screen.findByText(/Unable to load races/i);
    expect(message).toBeInTheDocument();
});

it('enables a race to be selected', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(rootURL);
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});

    customRender(<RaceConsole />, model);
    const selectRace = await screen.findByLabelText(/Race/i);
    await screen.findAllByRole('option');
    await user.selectOptions(selectRace, 'Scorpion A');
    expect(selectRace).toHaveValue('Scorpion A');
});

describe('when a race is selected', () => {
    it('shows the duration of the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});

        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await user.selectOptions(selectRace, 'Scorpion A');
        const outputDuration = screen.getByLabelText(/duration/i)
        expect(outputDuration).toHaveValue('00:45:00');
    });
    it('displays the entries for the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'startRace').mockImplementation(() => {return Promise.resolve({'success': true})});
        const controllerStartRaceSpy = jest.spyOn(controller, 'startRace');
    
        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await user.selectOptions(selectRace, 'Scorpion A');
        
        const entry1 = await screen.findByText(/Scorpion 1234 Chris Marshall/i);
        const entry2 = await screen.findByText(/Scorpion 6745 Sarah Pascal/i);
        expect(entry1).toBeInTheDocument();
        expect(entry2).toBeInTheDocument();
    });
    it('shows the remaining time', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(rootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});

        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await user.selectOptions(selectRace, 'Scorpion A');
        const outputRemaining = screen.getByLabelText(/remaining/i);
        expect(outputRemaining).toHaveValue('00:45:00');
    })
});