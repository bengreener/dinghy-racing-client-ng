import { customRender } from '../test-utilities/custom-renders';import userEvent from '@testing-library/user-event';
import { act, screen, waitForElementToBeRemoved } from '@testing-library/react';
import RaceConsole from './RaceConsole';
import { httpRootURL, wsRootURL, races, entriesScorpionA, entriesGraduateA } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';

jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

HTMLDialogElement.prototype.close = jest.fn();

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    
    await act(async () => {        
        customRender(<RaceConsole />, model);
    });

    const selectRace = screen.getByLabelText(/Select Race/i);
    expect(selectRace).toBeInTheDocument();
});

it('displays races available for selection', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model);

    const optionScorpion = await screen.findByRole('option', {'name': /Scorpion A/i});
    const optionsGraduate = await screen.findByRole('option', {'name': /Graduate A/i});
    
    expect(optionScorpion).toBeInTheDocument();
    expect(optionsGraduate).toBeInTheDocument();
});

it('notifies user if races cannot be retrieved', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Http 404 Error'})});

    customRender(<RaceConsole />, model);
    const message = await screen.findByText(/Unable to load races/i);
    expect(message).toBeInTheDocument();
});

it('enables a race to be selected', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model, controller);
    const selectRace = await screen.findByLabelText(/Race/i);
    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(selectRace, 'Scorpion A');
    }); 
    
    expect(selectRace.value).toBe('Scorpion A');
});

it('enables more than one race to be selected', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    customRender(<RaceConsole />, model, controller);
    const selectRace = await screen.findByLabelText(/Race/i);
    await screen.findAllByRole('option');
    await act(async () => {
        await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
    });
    
    const selected = [];
    for (let i = 0; i < selectRace.selectedOptions.length; i++) {
        selected.push(selectRace.selectedOptions[i].value);
    }
    expect(selected).toContain('Scorpion A');
    expect(selected).toContain('Graduate A');
});

describe('when a race is selected', () => {
    it('shows the duration of the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, 'Scorpion A');
        });
        const outputDuration = screen.getByLabelText(/duration/i)
        expect(outputDuration).toHaveValue('45:00');
    });
    it('displays the entries for the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        jest.spyOn(model, 'startRace').mockImplementation(() => {return Promise.resolve({'success': true})});
        const controllerStartRaceSpy = jest.spyOn(controller, 'startRace');
    
        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, 'Scorpion A');
        });
        
        const entry1 = await screen.findByText(/Scorpion 1234 Chris Marshall/i);
        const entry2 = await screen.findByText(/Scorpion 6745 Sarah Pascal/i);
        expect(entry1).toBeInTheDocument();
        expect(entry2).toBeInTheDocument();
    });
});

describe('when more than one race is selected', () => {
    it('shows the duration of the selected races', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }
            
        });
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        });
        
        const outputDuration = await screen.findAllByLabelText(/duration/i);
        expect(outputDuration).toHaveLength(2);
        expect(outputDuration[0]).toHaveValue('45:00');
        expect(outputDuration[1]).toHaveValue('45:00');
    });
    it('displays the entries for the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }
            
        });
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        jest.spyOn(model, 'startRace').mockImplementation(() => {return Promise.resolve({'success': true})});
        const controllerStartRaceSpy = jest.spyOn(controller, 'startRace');
    
        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        });
        
        const entry1 = await screen.findByText(/Scorpion 1234 Chris Marshall/i);
        const entry2 = await screen.findByText(/Scorpion 6745 Sarah Pascal/i);
        const entry3 = await screen.findByText(/Graduate 2928 Jill Myer/i)
        expect(entry1).toBeInTheDocument();
        expect(entry2).toBeInTheDocument();
        expect(entry3).toBeInTheDocument();
    });
});

describe('when a race is unselected', () => {
    it('removes race header from display', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }
        });
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async () => {
            await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        });
        
        const graduateHeader = await screen.findByText(/graduate a/i, {'selector': 'label'});
        expect(graduateHeader).toBeInTheDocument();
        await act(async () => {
            await user.deselectOptions(selectRace, ['Graduate A']);
        });
        expect(graduateHeader).not.toBeInTheDocument();
    });
    it('removes entries from display', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
            if (race.name === 'Scorpion A') {
                return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
            }
            else if (race.name === 'Graduate A') {
                return Promise.resolve({'success': true, 'domainObject': entriesGraduateA});
            }    
        });
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        customRender(<RaceConsole />, model, controller);
        const selectRace = await screen.findByLabelText(/Race/i);
        await screen.findAllByRole('option');
        await act(async() => {
            await user.selectOptions(selectRace, ['Scorpion A', 'Graduate A']);
        });
        
        const graduateEntries = await screen.findAllByRole('rowheader', {'name': /Graduate/i});
        graduateEntries.forEach(entry => expect(entry).toBeInTheDocument());
        await act(async () => {
            await user.deselectOptions(selectRace, ['Graduate A']);
        });
        graduateEntries.forEach(entry => expect(entry).not.toBeInTheDocument());
    });
});

describe('when a error is received', () => {
    it('displays error message', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        
        await act(async () => {        
            customRender(<RaceConsole />, model);
        });
    
        const errorMessage = screen.getByText(/Unable to load races/i);
        expect(errorMessage).toBeInTheDocument();
    });
    it('clears error message when a successful response is received', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})})
            .mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        let render;

        await act(async () => {        
            render = customRender(<RaceConsole key={Date.now()}/>, model);
        });
    
        const errorMessage = screen.getByText(/Unable to load races/i);
        expect(errorMessage).toBeInTheDocument();

        await act(async () => {
            render.rerender(<RaceConsole key={Date.now()}/>, model);
        });
        expect(screen.queryByText(/Unable to load races/i)).not.toBeInTheDocument();
    });
});

it('provides option to select start time for first race', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    
    await act(async () => {        
        customRender(<RaceConsole />, model);
    });

    const selectSessionStart = screen.getByLabelText(/session start/i);
    expect(selectSessionStart).toBeInTheDocument();
});

it('provides option to select end time for first race', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    
    await act(async () => {        
        customRender(<RaceConsole />, model);
    });

    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionEnd).toBeInTheDocument();
});

it('registers an interest in race updates for races in session', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const controller = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    const registerRaceUpdateCallbackSpy = jest.spyOn(model, 'registerRaceUpdateCallback');

    customRender(<RaceConsole />, model, controller);
    await screen.findAllByRole('option');
    
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(1, 'http://localhost:8081/dinghyracing/api/races/4', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(2, 'http://localhost:8081/dinghyracing/api/races/7', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(3, 'http://localhost:8081/dinghyracing/api/races/17', expect.any(Function));
    expect(registerRaceUpdateCallbackSpy).toHaveBeenNthCalledWith(4, 'http://localhost:8081/dinghyracing/api/races/8', expect.any(Function));
});

describe('when races within session are changed', () => {
    it('updates recorded details', async () => {
        const races_copy = [...races];
        races_copy[0] = {...races[0]};
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races_copy})});
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races_copy})});
        await act(async () => {        
            customRender(<RaceConsole />, model);
        });
        expect(screen.getByText('Scorpion A')).toBeInTheDocument();
        races_copy[0].name = 'Popeye Special';
        await act(async () => {
            model.handleRaceUpdate({'body': races_copy[0].url});
        });
        expect(screen.getByText('Popeye Special')).toBeInTheDocument();
    });
    it('removes a race that has had start time changed so it falls outside session time window', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        await act(async () => {        
            customRender(<RaceConsole />, model);
        });
        expect(screen.getByText('Handicap A')).toBeInTheDocument();
        const url = races[races.length -1].url;
        races.pop();
        await act(async () => {
            model.handleRaceUpdate({'body': url});
        });
        expect(screen.queryByText('Handicap A')).not.toBeInTheDocument();
    });
})