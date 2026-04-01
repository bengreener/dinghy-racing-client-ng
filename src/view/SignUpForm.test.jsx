/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from './SignUpForm';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import Collection from '../model/collection';
import Competitor from '../model/competitor';
import Dinghy from '../model/dinghy';
import DinghyClass from '../model/dinghy-class';
import Entry from '../model/entry';
import Race from '../model/race';
import MissingParameter from '../errors/missing-parameter';
import InvalidParameter from '../errors/invalid-parameter';
import { httpRootURL, wsRootURL, fleetHandicapHAL, raceCometAHAL, raceScorpionAHAL, raceHandicapAHAL, racePursuitAHAL,
    dinghyClassCometHAL, dinghyClassGraduateHAL, dinghyClassScorpionHAL, dinghy826HAL, dinghy1234HAL,
    competitorChrisMarshallHAL, competitorLouScrewHAL, entryChrisMarshall1234ScorpionAHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../controller/sylph-controller');
vi.mock('../model/clock');

const model = new SylphModel(httpRootURL, wsRootURL);
const controller = new SylphController(model);    

beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

it('renders', async () => {
    const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<SignUpForm  model={model} race={race}/>);
    });
    const inputHelm = screen.getByLabelText(/helm/i);
    const inputSailNumber = screen.getByLabelText(/sail/i);
    const inputCrew = screen.getByLabelText(/crew/i);
    const btnCreate = screen.getByRole('button', {'name': /sign-up/i});
    const btnCancel = screen.getByRole('button', {'name': /cancel/i});
    expect(inputHelm).toBeInTheDocument();
    expect(inputSailNumber).toBeInTheDocument();
    expect(inputCrew).toBeInTheDocument();
    expect(btnCreate).toBeInTheDocument();
    expect(btnCancel).toBeInTheDocument();
});
it('only provides the option to select dinghy classes that are allowed for the race', async () => {
    const race = new Race(racePursuitAHAL, {version: '"0"'}, model);
    vi.spyOn(model, 'getDinghyClassesFromURL').mockImplementation(async (url) => {
        let dinghyClasses = [];
        if (url === fleetHandicapHAL._links.dinghyClasses.href) {
            dinghyClasses.push(new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model))
            dinghyClasses.push(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model));
        }
        return new Collection(dinghyClasses, {size: 20, totalElements: dinghyClasses.length, totalPages: 0, number: 0});
    })
    await act(async () => {
        render(<SignUpForm  model={model} race={race}/>);
    });
    const inputDinghyClass = screen.getByLabelText(/class/i);
    const options = within(inputDinghyClass).getAllByRole('option');
    expect(options.length).toBe(3);
    expect(within(inputDinghyClass).getByRole('option', {name: /scorpion/i})).toBeInTheDocument();
    expect(within(inputDinghyClass).getByRole('option', {name: /graduate/i})).toBeInTheDocument();
    expect(within(inputDinghyClass).getByRole('option', {name: ''})).toBeInTheDocument();
});
it('presents dinghy classes in ascending alphabetical order', async () => {
    const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<SignUpForm  model={model} race={race}/>);
    });
    const inputDinghyClass = screen.getByLabelText(/class/i);
    const options = within(inputDinghyClass).getAllByRole('option');
    const values = options.map(o => o.value);
    expect(values).toEqual(['', 'Comet', 'Graduate', 'Scorpion']);
});
it('displays helm name', async () => {
    const user = userEvent.setup();
    const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<SignUpForm  model={model} race={race}/>);
    });
    const inputHelm = screen.getByLabelText(/helm/i);
    await user.type(inputHelm, 'Chris Marshall');
    expect(inputHelm).toHaveValue('Chris Marshall');
});
it('displays sail number', async () => {
    const user = userEvent.setup();
    const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<SignUpForm  model={model} race={race}/>);
    });
    const inputSailNumber = screen.getByLabelText(/sail/i);
    await user.type(inputSailNumber, 'g6754i');
    expect(inputSailNumber).toHaveValue('g6754i');
});
describe('when a sail number is entered', () => {
    it('displays dinghy class and previous crews for boats with that sail number', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
        // vi.spyOn(model, 'getDinghiesBySailNumber').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [ dinghy1234, dinghy1234Graduate ]})});
        await act(async () => {
            render(<SignUpForm  model={model} race={race}/>);
        });
        // enter sail number
        const inputSailNumber = screen.getByLabelText(/sail/i);
        await user.type(inputSailNumber, '1234');
        // get table that is suppossed to contain details of dinghy class and previous crews
        const previousEntries = within(screen.getByTestId('previous-entries'));
        // check it contains dinghy classes and previous crews for boats with sail number
        expect(await previousEntries.findAllByRole('cell', {name: 'Scorpion'})).toHaveLength(1);
        expect(await previousEntries.findByRole('cell', {name: 'Chris Marshall'})).toBeInTheDocument();
        expect(await previousEntries.findByRole('cell', {name: 'Lou Screw'})).toBeInTheDocument();
    });
    it('only displays entries that are eligible to sail based on the fleet for the race', async () => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(model, 'getDinghyBySailNumberAndDinghyClass').mockImplementation((sailNumber, dinghyClass) => {
            let hal;
            if (sailNumber === '1234' && dinghyClass.url === 'http://localhost:8081/dinghyracing/api/dinghyClasses/16') {
                hal = dinghy826HAL;
            }
            else if (sailNumber === '1234' && dinghyClass.url === 'http://localhost:8081/dinghyracing/api/dinghyClasses/1') {
                hal = dinghy1234HAL;
            }
            else {
                throw new Error('HTTP Error: 404');
            }
            return new Dinghy(hal, {version: '"0"'}, model);
        });
        await act(async () => {
            render(<SignUpForm  model={model} race={race}/>);
        });
        // enter sail number
        const inputSailNumber = screen.getByLabelText(/sail/i);
        await user.type(inputSailNumber, '1234');
        // get table that is suppossed to contain details of dinghy class and previous crews
        const previousEntries = within(screen.getByTestId('previous-entries'));
        // check it contains dinghy classes and previous crews for boats with sail number
        expect(previousEntries.getAllByRole('cell', {name: 'Scorpion'})).toHaveLength(1);
        expect(previousEntries.getByRole('cell', {name: 'Chris Marshall'})).toBeInTheDocument();
        expect(previousEntries.getByRole('cell', {name: 'Lou Screw'})).toBeInTheDocument();
        expect(previousEntries.queryByRole('cell', {name: 'Comet'})).not.toBeInTheDocument();
        expect(previousEntries.getAllByRole('row')).toHaveLength(2);
    });
    describe('when a dinghy class has been selected', () => {
        it('only displays previous entries for that dinghy class and sail number', async () => {
            const user = userEvent.setup();
            const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
            const dinghyClassComet = new DinghyClass(dinghyClassCometHAL, {version: '"0"'}, model);
            const dinghyClassGraduate = new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model);
            const dinghyClassScorpion = new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model);
            const getDinghyBySailNumberAndDinghyClassSpy = vi.spyOn(model, 'getDinghyBySailNumberAndDinghyClass');
            await act(async () => {
                render(<SignUpForm  model={model} race={race}/>);
            });
            await (user.selectOptions(screen.getByLabelText('Dinghy Class'), 'Scorpion'));
            await user.type(screen.getByLabelText(/sail/i), '1234');
            expect(getDinghyBySailNumberAndDinghyClassSpy).toHaveBeenCalledWith('1234', dinghyClassScorpion);
            expect(getDinghyBySailNumberAndDinghyClassSpy).not.toHaveBeenCalledWith('1234', dinghyClassComet);
            expect(getDinghyBySailNumberAndDinghyClassSpy).not.toHaveBeenCalledWith('1234', dinghyClassGraduate);
        });
    })
});
it('displays crew name', async () => {
    const user = userEvent.setup();
    const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<SignUpForm  model={model} race={race}/>);
    });
    const inputCrew = screen.getByLabelText(/crew/i);
    await user.clear(inputCrew);
    await user.type(inputCrew, 'A Person');
    expect(inputCrew).toHaveValue('A Person');
});
describe('when sign-up button clicked', () => {
    it('signs up to race', async () => {
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        const signUpToRaceSpy = vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
            if (!(race instanceof Race)) {
                throw new MissingParameter('A race is required for a new race entry.');
            }
            if (!(helm instanceof Competitor)) {
                throw new MissingParameter('A helm is required for a new race entry.');
            }
            if (!(dinghy instanceof Dinghy)) {
                throw new MissingParameter('A dinghy is required for a new race entry.');
            }
            if (crew && !(crew instanceof Competitor)) {
                throw new InvalidParameter('Crew must be a competitor.');
            }
            if (!crew) {
                // check if dinghy class requires a crew
                const dinghyClass = await dinghy.getDinghyClass();
                if (dinghyClass.crewSize > 1) {
                    throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
                }
            }
            return race;
        });
        await act(async () => {
            render(<SignUpForm  model={model} race={race} onSignUp={controller.signUpToRace} />);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await user.type(inputHelm, 'Chris Marshall');
        await user.type(inputSailNumber, '1234');
        await user.type(inputCrew, 'Lou Screw');
        const signUpButton = screen.getByRole('button', {'name': /sign-up/i});
        await user.click(signUpButton);
        expect(signUpToRaceSpy).toHaveBeenCalledWith(race, new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model));
    }); 
    it('clears form on success', async () => {
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
            if (!(race instanceof Race)) {
                throw new MissingParameter('A race is required for a new race entry.');
            }
            if (!(helm instanceof Competitor)) {
                throw new MissingParameter('A helm is required for a new race entry.');
            }
            if (!(dinghy instanceof Dinghy)) {
                throw new MissingParameter('A dinghy is required for a new race entry.');
            }
            if (crew && !(crew instanceof Competitor)) {
                throw new InvalidParameter('Crew must be a competitor.');
            }
            if (!crew) {
                // check if dinghy class requires a crew
                const dinghyClass = await dinghy.getDinghyClass();
                if (dinghyClass.crewSize > 1) {
                    throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
                }
            }
            return race;
        });
        await act(async () => {
            render(<SignUpForm  model={model} race={race} onSignUp={controller.signUpToRace} />);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await user.type(inputHelm, 'Chris Marshall');
        await user.type(inputSailNumber, '1234');
        await user.type(inputCrew, 'Lou Screw');
        const signUpButton = screen.getByRole('button', {'name': /sign-up/i});
        await user.click(signUpButton);
        await act(async () => {});
        const previousEntries = within(screen.getByTestId('previous-entries'));
        expect(inputHelm).toHaveValue('');
        expect(inputSailNumber).toHaveValue('');
        expect(inputCrew).toHaveValue('');
        expect(previousEntries.getAllByRole('row')).toHaveLength(1);
        expect(screen.getByRole('button', {'name': /sign-up/i})).toBeInTheDocument();
    });
    describe('when sign-up fails', () => {
        it('displays failure message and entered values remain on form', async () => {
            vi.spyOn(console, 'error').mockImplementation(vi.fn());
            const user = userEvent.setup();
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
                throw new Error('Some error')
            });
            await act(async () => {
                render(<SignUpForm  model={model} race={race} onSignUp={controller.signUpToRace} />);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
            await user.type(inputCrew, 'Lou Screw');
            const signUpButton = screen.getByRole('button', {'name': /sign-up/i});
            await user.click(signUpButton);
            expect(screen.getByText('Some error')).toBeInTheDocument();
            expect(inputHelm).toHaveValue('Chris Marshall');
            expect(inputSailNumber).toHaveValue('1234');
            expect(inputCrew).toHaveValue(('Lou Screw'));
        });
    });
});
describe('when helm does not exist', () => {
    it('displays add helm & update button', async () => {
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race}/>);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await user.clear(inputHelm);
        await user.type(inputHelm, 'Not There');
        await user.clear(inputSailNumber);
        await user.type(inputSailNumber, '1234');
        await user.clear(inputCrew);
        await user.type(inputCrew, 'Lou Screw');
        expect(screen.getByRole('button', {'name': /add helm & sign-up/i}));
    });
    describe('when add helm and sign-up button clicked', () => {
        it('creates helm and signs up to race', async () => {
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const signUpToRaceSpy = vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
                if (!(race instanceof Race)) {
                    throw new MissingParameter('A race is required for a new race entry.');
                }
                if (!(helm instanceof Competitor)) {
                    throw new MissingParameter('A helm is required for a new race entry.');
                }
                if (!(dinghy instanceof Dinghy)) {
                    throw new MissingParameter('A dinghy is required for a new race entry.');
                }
                if (crew && !(crew instanceof Competitor)) {
                    throw new InvalidParameter('Crew must be a competitor.');
                }
                if (!crew) {
                    // check if dinghy class requires a crew
                    const dinghyClass = await dinghy.getDinghyClass();
                    if (dinghyClass.crewSize > 1) {
                        throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
                    }
                }
                return race;
            });
            const createCompetitorSpy = vi.spyOn(controller, 'createCompetitor').mockImplementation(async () => {
                return new Competitor({...competitorChrisMarshallHAL, name: 'Not There'}, {version: '"0"'}, model);
            });
            const user = userEvent.setup();
            await act(async () => {
                render(<SignUpForm  model={model} race={race} onCreateCompetitor={controller.createCompetitor} onSignUp={controller.signUpToRace} />);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await user.type(inputHelm, 'Not There');
            await user.type(inputSailNumber, '1234');
            await user.type(inputCrew, 'Lou Screw');
            const signUpButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
            await user.click(signUpButton);
            expect(createCompetitorSpy).toHaveBeenCalledWith('Not There');
            expect(signUpToRaceSpy).toHaveBeenCalledWith(race, new Competitor({...competitorChrisMarshallHAL, name: 'Not There'}, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model));
        });            
        describe('when helm not created', () => {
            it('displays failure message and entered values remain on form', async () => {
                vi.spyOn(console, 'error').mockImplementation(vi.fn());
                const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
                const createCompetitorSpy = vi.spyOn(controller, 'createCompetitor').mockImplementation(async () => {
                    throw new Error('Some error');
                });
                const user = userEvent.setup();
                await act(async () => {
                    render(<SignUpForm  model={model} race={race} onCreateCompetitor={controller.createCompetitor} />);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await user.type(inputHelm, 'Not There');
                await user.type(inputSailNumber, '1234');
                await user.type(inputCrew, 'Lou Screw');
                const signUpButton = screen.getByRole('button', {'name': /add helm & sign-up/i});
                await user.click(signUpButton);
                expect(screen.getByText('Some error')).toBeInTheDocument();
                expect(inputHelm).toHaveValue('Not There');
                expect(inputSailNumber).toHaveValue('1234');
                expect(inputCrew).toHaveValue('Lou Screw');
            });
        });
    });
});
describe('when dinghy does not exist', () => {
    it('displays add dinghy and sign-up button', async () => {
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race}/>);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await user.type(inputHelm, 'Chris Marshall');
        await user.type(inputSailNumber, 'g6754i');
        await user.type(inputCrew, 'Lou Screw');
        expect(screen.getByRole('button', {'name': /add dinghy & sign-up/i}));
    });
    describe('when add dinghy and sign-up button clicked', () => {
        it('creates dinghy and then updates entry with values entered into form', async () => {
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const signUpToRaceSpy = vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
                if (!(race instanceof Race)) {
                    throw new MissingParameter('A race is required for a new race entry.');
                }
                if (!(helm instanceof Competitor)) {
                    throw new MissingParameter('A helm is required for a new race entry.');
                }
                if (!(dinghy instanceof Dinghy)) {
                    throw new MissingParameter('A dinghy is required for a new race entry.');
                }
                if (crew && !(crew instanceof Competitor)) {
                    throw new InvalidParameter('Crew must be a competitor.');
                }
                if (!crew) {
                    // check if dinghy class requires a crew
                    const dinghyClass = await dinghy.getDinghyClass();
                    if (dinghyClass.crewSize > 1) {
                        throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
                    }
                }
                return race;
            });
            const createDinghySpy = vi.spyOn(controller, 'createDinghy').mockImplementation(() => {
                return new Dinghy({...dinghy1234HAL, sailNumber: 'xyz'}, {version: '"0"'}, model);
            });
            const user = userEvent.setup();
            await act(async () => {
                render(<SignUpForm model={model} race={race} onCreateDinghy={controller.createDinghy} onSignUp={controller.signUpToRace} />);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, 'xyz');
            await user.type(inputCrew, 'Lou Screw');
            const signUpButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
            await user.click(signUpButton);
            expect(createDinghySpy).toHaveBeenCalledWith('xyz', new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model));
            expect(signUpToRaceSpy).toHaveBeenCalledWith(race, new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new Dinghy({...dinghy1234HAL, sailNumber: 'xyz'}, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model));
        });
        describe('when dinghy not created', () => {
            it('displays failure message and entered values remain on form', async () => {
                vi.spyOn(console, 'error').mockImplementation(vi.fn());
                const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
                vi.spyOn(controller, 'createDinghy').mockImplementation(() => {
                    throw new Error('Some error');
                });
                const user = userEvent.setup();
                await act(async () => {
                    render(<SignUpForm model={model} race={race} onCreateDinghy={controller.createDinghy} />);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await user.type(inputHelm, 'Chris Marshall');
                await user.type(inputSailNumber, 'xyz');
                await user.type(inputCrew, 'Lou Screw');
                const signUpButton = screen.getByRole('button', {'name': /add dinghy & sign-up/i});
                await user.click(signUpButton);
                expect(screen.getByText('Some error')).toBeInTheDocument();
            });
        });
    });
});
describe('when crew does not exist', () => {
    it('displays add crew and sign-up button', async () => {
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race} />);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await user.type(inputHelm, 'Chris Marshall');
        await user.type(inputSailNumber, '1234');
        await user.type(inputCrew, 'Not There');
        expect(screen.getByRole('button', {'name': /add crew & sign-up/i}));
    });
    describe('when add crew and sign-up button clicked', () => {
        it('creates crew and then updates entry with values entered into form', async () => {
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const signUpToRaceSpy = vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
                if (!(race instanceof Race)) {
                    throw new MissingParameter('A race is required for a new race entry.');
                }
                if (!(helm instanceof Competitor)) {
                    throw new MissingParameter('A helm is required for a new race entry.');
                }
                if (!(dinghy instanceof Dinghy)) {
                    throw new MissingParameter('A dinghy is required for a new race entry.');
                }
                if (crew && !(crew instanceof Competitor)) {
                    throw new InvalidParameter('Crew must be a competitor.');
                }
                if (!crew) {
                    // check if dinghy class requires a crew
                    const dinghyClass = await dinghy.getDinghyClass();
                    if (dinghyClass.crewSize > 1) {
                        throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
                    }
                }
                return race;
            });
            const createCompetitorSpy = vi.spyOn(controller, 'createCompetitor').mockImplementation(async () => {
                return new Competitor({...competitorLouScrewHAL, name: 'Pop Off'}, {version: '"0"'}, model);
            });
            const user = userEvent.setup();
            await act(async () => {
                render(<SignUpForm  model={model} race={race} onCreateCompetitor={controller.createCompetitor} onSignUp={controller.signUpToRace} />);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, '1234');
            await user.type(inputCrew, 'Pop Off');
            const signUpButton = screen.getByRole('button', {'name': /add crew & sign-up/i});
            await user.click(signUpButton);
            expect(createCompetitorSpy).toHaveBeenCalledWith('Pop Off');
            expect(signUpToRaceSpy).toHaveBeenCalledWith(race, new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor({...competitorLouScrewHAL, name: 'Pop Off'}, {version: '"0"'}, model));
        });
        describe('when crew not created', () => {
            it('displays failure message and entered values remain on form', async () => {
                vi.spyOn(console, 'error').mockImplementation(vi.fn());
                const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
                vi.spyOn(controller, 'createCompetitor').mockImplementation(async () => {
                    throw new Error('Some error');
                });
                const user = userEvent.setup();
                await act(async () => {
                    render(<SignUpForm  model={model} race={race} onCreateCompetitor={controller.createCompetitor} />);
                });
                const inputHelm = screen.getByLabelText(/helm/i);
                const inputSailNumber = screen.getByLabelText(/sail/i);
                const inputCrew = screen.getByLabelText(/crew/i);
                await user.type(inputHelm, 'Chris Marshall');
                await user.type(inputSailNumber, '1234');
                await user.type(inputCrew, 'Not There');
                const signUpButton = screen.getByRole('button', {'name': /add crew & sign-up/i});
                await user.click(signUpButton);
                expect(screen.getByText('Some error')).toBeInTheDocument();
                expect(inputHelm).toHaveValue('Chris Marshall');
                expect(inputSailNumber).toHaveValue('1234');
                expect(inputCrew).toHaveValue('Not There');
            });
        });
    });
});
describe('when race for a fleet that includes only dinghy classes with no crew', () => {
    it('does not request entry of crew', async () => {
        const race = new Race(raceCometAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race}/>);
        });
        const inputCrew = screen.queryByLabelText(/crew/i);
        expect(inputCrew).not.toBeInTheDocument();
    });
});    
describe('when race for a fleet that includes only a single dinghy class', () => {
    it('does not request entry of dinghy class', async () => {
        const race = new Race(raceScorpionAHAL, {version: '"0'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race}/>);
        });
        const inputDinghyClass = screen.queryByLabelText(/class/i);
        expect(inputDinghyClass).not.toBeInTheDocument();
    });
});
it('has an option to cancel update that clears selected entry values to allow new entry to sign up', async () => {
    const user = userEvent.setup();
    const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<SignUpForm  model={model} race={race}/>);
    });
    const inputDinghyClass = screen.getByLabelText(/class/i);
    const inputHelm = screen.getByLabelText(/helm/i);
    const inputSailNumber = screen.getByLabelText(/sail/i);
    const inputCrew = screen.getByLabelText(/crew/i);
    await user.type(inputHelm, 'Chris Marshall');
    await user.type(inputSailNumber, '1234');
    await user.keyboard('{Tab}');
    await user.type(inputCrew, 'Lou Screw');
    await user.click(screen.getByRole('button', {name: /cancel/i}));
    expect(inputHelm).toHaveValue('');
    expect(inputCrew).toHaveValue('');
    expect(inputSailNumber).toHaveValue('');
});
describe('when updating an existing entry', () => {
    it('displays details for existing entry', async () => {
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race} entry={entry} />);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        expect(inputHelm).toHaveValue('Chris Marshall');
        expect(inputCrew).toHaveValue('Lou Screw');
        expect(inputSailNumber).toHaveValue('1234');
    });
    describe('when helm and dinghy and crew exist', () => {
        it('displays update button', async () => {
            const user = userEvent.setup();
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            await act(async () => {
                render(<SignUpForm  model={model} race={race} entry={entry}/>);
            });
            expect(screen.getByRole('button', {'name': /^update$/i}));
        });
        describe('when update button clicked', () => {
            it('updates entry with values entered into form', async () => {
                const user = userEvent.setup();
                const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
                const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
                const updateEntrySpy = vi.spyOn(controller, 'updateEntry').mockImplementation(async () => entry);
                await act(async () => {
                    render(<SignUpForm  model={model} race={race} entry={entry} onUpdate={updateEntrySpy} />);
                });
                const buttonUpdate = screen.getByRole('button', {'name': /update/i});
                await user.click(buttonUpdate);
                expect(updateEntrySpy).toHaveBeenCalledWith(entry, new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model));
            });
        });
    });
});
describe('when neither helm nor dinghy exist', () => {
    it('displays create helm and dinghy and update button', async () => {
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race}/>);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await user.type(inputHelm, 'Not There');
        await user.type(inputSailNumber, 'xyz');
        await user.type(inputCrew, 'Lou Screw');
        expect(screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i}));
    });
    describe('when sign-up button clicked', () => {
        it('creates helm and dinghy and then updates entry with values entered into form', async () => {
            const user = userEvent.setup();
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const signUpToRaceSpy = vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
                if (!(race instanceof Race)) {
                    throw new MissingParameter('A race is required for a new race entry.');
                }
                if (!(helm instanceof Competitor)) {
                    throw new MissingParameter('A helm is required for a new race entry.');
                }
                if (!(dinghy instanceof Dinghy)) {
                    throw new MissingParameter('A dinghy is required for a new race entry.');
                }
                if (crew && !(crew instanceof Competitor)) {
                    throw new InvalidParameter('Crew must be a competitor.');
                }
                if (!crew) {
                    // check if dinghy class requires a crew
                    const dinghyClass = await dinghy.getDinghyClass();
                    if (dinghyClass.crewSize > 1) {
                        throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
                    }
                }
                return race;
            });
            const createCompetitorSpy = vi.spyOn(controller, 'createCompetitor').mockImplementation(async () => new Competitor({...competitorChrisMarshallHAL, name: 'Not There'}, {version: '"0"'}, model));
            const createDinghySpy = vi.spyOn(controller, 'createDinghy').mockImplementation(() => new Dinghy({...dinghy1234HAL, sailNumber: 'xyz'}, {version: '"0"'}, model));
            await act(async () => {
                render(<SignUpForm  model={model} race={race} onCreateCompetitor={controller.createCompetitor} onCreateDinghy={controller.createDinghy} onSignUp={controller.signUpToRace} />);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await user.type(inputHelm, 'Not There');
            await user.type(inputSailNumber, 'xyz');
            await user.type(inputCrew, 'Lou Screw');
            const signUpButton = screen.getByRole('button', {'name': /add helm & dinghy & sign-up/i});
            await user.click(signUpButton);
            expect(createCompetitorSpy).toHaveBeenCalledWith('Not There');
            expect(createDinghySpy).toHaveBeenCalledWith('xyz', new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model));
            expect(signUpToRaceSpy).toHaveBeenCalledWith(race, new Competitor({...competitorChrisMarshallHAL, name: 'Not There'}, {version: '"0"'}, model), new Dinghy({...dinghy1234HAL, sailNumber: 'xyz'}, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model));
        });
    });
});
describe('when neither helm nor crew exist', () => {
    it('displays add helm & crew & update button', async () => {
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race}/>);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await user.type(inputHelm, 'Not There');
        await user.type(inputSailNumber, '1234');
        await user.type(inputCrew, 'Pop Off');
        expect(screen.getByRole('button', {'name': /add helm & crew & sign-up/i}));
    });
    describe('when update button clicked', () => {
        it('creates helm and crew and then updates entry with values entered into form', async () => {
            const user = userEvent.setup();
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const signUpToRaceSpy = vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
                if (!(race instanceof Race)) {
                    throw new MissingParameter('A race is required for a new race entry.');
                }
                if (!(helm instanceof Competitor)) {
                    throw new MissingParameter('A helm is required for a new race entry.');
                }
                if (!(dinghy instanceof Dinghy)) {
                    throw new MissingParameter('A dinghy is required for a new race entry.');
                }
                if (crew && !(crew instanceof Competitor)) {
                    throw new InvalidParameter('Crew must be a competitor.');
                }
                if (!crew) {
                    // check if dinghy class requires a crew
                    const dinghyClass = await dinghy.getDinghyClass();
                    if (dinghyClass.crewSize > 1) {
                        throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
                    }
                }
                return race;
            });
            const createCompetitorSpy = vi.spyOn(controller, 'createCompetitor').mockImplementation(async (name) => {
                if (name === 'Not There') {
                    return new Competitor({...competitorChrisMarshallHAL, name: 'Not There'}, {version: '"0"'}, model);
                }
                if (name === 'Pop Off') {
                    return new Competitor({...competitorLouScrewHAL, name: 'Pop Off'}, {version: '"0"'}, model);
                }
            });
            await act(async () => {
                render(<SignUpForm  model={model} race={race} onCreateCompetitor={controller.createCompetitor} onSignUp={controller.signUpToRace} />);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await user.type(inputHelm, 'Not There');
            await user.type(inputSailNumber, '1234');
            await user.type(inputCrew, 'Pop Off');
            const updateButton = screen.getByRole('button', {'name': /add helm & crew & sign-up/i});
            await user.click(updateButton);
            expect(createCompetitorSpy).toHaveBeenCalledWith('Not There');
            expect(createCompetitorSpy).toHaveBeenCalledWith('Pop Off');
            expect(signUpToRaceSpy).toHaveBeenCalledWith(race, new Competitor({...competitorChrisMarshallHAL, name: 'Not There'}, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor({...competitorLouScrewHAL, name: 'Pop Off'}, {version: '"0"'}, model));
        });
    });
});
describe('when neither dinghy nor crew exist', () => {
    it('displays add dinghy and crew and update button', async () => {
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race} />);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await user.type(inputHelm, 'Chris Marshall');
        await user.type(inputSailNumber, 'xyz');
        await user.type(inputCrew, 'Pop Off');
        expect(screen.getByRole('button', {'name': /add crew & dinghy & sign-up/i}));
    });
    describe('when update button clicked', () => {
        it('creates dinghy and crew and then updates entry with values entered into form', async () => {
            const user = userEvent.setup();
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const signUpToRaceSpy = vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
                if (!(race instanceof Race)) {
                    throw new MissingParameter('A race is required for a new race entry.');
                }
                if (!(helm instanceof Competitor)) {
                    throw new MissingParameter('A helm is required for a new race entry.');
                }
                if (!(dinghy instanceof Dinghy)) {
                    throw new MissingParameter('A dinghy is required for a new race entry.');
                }
                if (crew && !(crew instanceof Competitor)) {
                    throw new InvalidParameter('Crew must be a competitor.');
                }
                if (!crew) {
                    // check if dinghy class requires a crew
                    const dinghyClass = await dinghy.getDinghyClass();
                    if (dinghyClass.crewSize > 1) {
                        throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
                    }
                }
                return race;
            });
            const createCompetitorSpy = vi.spyOn(controller, 'createCompetitor').mockImplementation(async () => new Competitor({...competitorLouScrewHAL, name: 'Pop Off'}, {version: '"0"'}, model));
            const createDinghySpy = vi.spyOn(controller, 'createDinghy').mockImplementation(() => new Dinghy({...dinghy1234HAL, sailNumber: 'xyz'}, {version: '"0"'}, model));
            await act(async () => {
                render(<SignUpForm  model={model} race={race} onCreateCompetitor={controller.createCompetitor} onCreateDinghy={controller.createDinghy} onSignUp={controller.signUpToRace} />);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await user.type(inputHelm, 'Chris Marshall');
            await user.type(inputSailNumber, 'xyz');
            await user.type(inputCrew, 'Pop Off');
            const updateButton = screen.getByRole('button', {'name': /add crew & dinghy & sign-up/i});
            await user.click(updateButton);
            expect(createCompetitorSpy).toHaveBeenCalledWith('Pop Off');
            expect(createDinghySpy).toHaveBeenCalledWith('xyz', new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model));
            expect(signUpToRaceSpy).toHaveBeenCalledWith(race, new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy({...dinghy1234HAL, sailNumber: 'xyz'}, {version: '"0"'}, model), new Competitor({...competitorLouScrewHAL, name: 'Pop Off'}, {version: '"0"'}, model));
        });
    });
});
describe('when neither helm nor dinghy nor crew exist', () => {
    it('displays add helm and dinghy and crew and update button', async () => {
        const user = userEvent.setup();
        const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race} />);
        });
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        await user.type(inputHelm, 'Not There');
        await user.type(inputSailNumber, 'xyz');
        await user.type(inputCrew, 'Pop Off');
        expect(screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i}));
    });
    describe('when update button clicked', () => {
        it('creates helm and dinghy and crew and then updates entry with values entered into form', async () => {
            const user = userEvent.setup();
            const race = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const signUpToRaceSpy = vi.spyOn(controller, 'signUpToRace').mockImplementation(async (race, helm, dinghy, crew) => {
                if (!(race instanceof Race)) {
                    throw new MissingParameter('A race is required for a new race entry.');
                }
                if (!(helm instanceof Competitor)) {
                    throw new MissingParameter('A helm is required for a new race entry.');
                }
                if (!(dinghy instanceof Dinghy)) {
                    throw new MissingParameter('A dinghy is required for a new race entry.');
                }
                if (crew && !(crew instanceof Competitor)) {
                    throw new InvalidParameter('Crew must be a competitor.');
                }
                if (!crew) {
                    // check if dinghy class requires a crew
                    const dinghyClass = await dinghy.getDinghyClass();
                    if (dinghyClass.crewSize > 1) {
                        throw new MissingParameter(`A ${dinghyClass.name} needs a crew. Please select a crew.`);
                    }
                }
                return race;
            });
            const createCompetitorSpy = vi.spyOn(controller, 'createCompetitor').mockImplementation(async (name) => {
                if (name === 'Not There') {
                    return new Competitor({...competitorChrisMarshallHAL, name: 'Not There'}, {version: '"0"'}, model);
                }
                if (name === 'Pop Off') {
                    return new Competitor({...competitorLouScrewHAL, name: 'Pop Off'}, {version: '"0"'}, model);
                }
            });
            const createDinghySpy = vi.spyOn(controller, 'createDinghy').mockImplementation(() => new Dinghy({...dinghy1234HAL, sailNumber: 'xyz'}, {version: '"0"'}, model));
            await act(async () => {
                render(<SignUpForm  model={model} race={race} onCreateCompetitor={controller.createCompetitor} onCreateDinghy={controller.createDinghy} onSignUp={controller.signUpToRace} />);
            });
            const inputHelm = screen.getByLabelText(/helm/i);
            const inputSailNumber = screen.getByLabelText(/sail/i);
            const inputCrew = screen.getByLabelText(/crew/i);
            await user.type(inputHelm, 'Not There');
            await user.type(inputSailNumber, 'xyz');
            await user.type(inputCrew, 'Pop Off');
            const signUpButton = screen.getByRole('button', {'name': /add helm & crew & dinghy & sign-up/i});
            await user.click(signUpButton);
            expect(createCompetitorSpy).toHaveBeenCalledWith('Not There');
            expect(createCompetitorSpy).toHaveBeenCalledWith('Pop Off');
            expect(createDinghySpy).toHaveBeenCalledWith('xyz', new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model));
            expect(signUpToRaceSpy).toHaveBeenCalledWith(race, new Competitor({...competitorChrisMarshallHAL, name: 'Not There'}, {version: '"0"'}, model), new Dinghy({...dinghy1234HAL, sailNumber: 'xyz'}, {version: '"0"'}, model), new Competitor({...competitorLouScrewHAL, name: 'Pop Off'}, {version: '"0"'}, model));
        });
    });      
});
describe('when a new competitor is created', () => {
    it('updates competitors', async () => {
        const race = new Race(raceCometAHAL, {version: '"0"'}, model);
        const getCompetitorsSpy = vi.spyOn(model, 'getCompetitors');
        await act(async () => {
            render(<SignUpForm  model={model} race={race} />);
        });
        await act(async () => {
            model.handleCompetitorCreation('http://localhost:8081/dinghyracing/api/competitors/99');
        });
        expect(getCompetitorsSpy).toHaveBeenCalledTimes(2);
    });
});
describe('when a new dinghy is created', () => {
    it('updates dinghies', async () => {
        const race = new Race(raceCometAHAL, {version: '"0"'}, model);
        const getDinghiesInDinghyClassSpy = vi.spyOn(model, 'getDinghiesInDinghyClass');
        // wrap in act to ensure initial useEffects complete before dinghy creation update
        await act(async () => {
            render(<SignUpForm  model={model} race={race} />);
        });
        await act(async () => {
            model.handleDinghyCreation('http://localhost:8081/dinghyracing/api/dinghies/99');
        });
        expect(getDinghiesInDinghyClassSpy).toHaveBeenCalledTimes(2);
    });
});
describe('when a new dinghy class is created', () => {
    it('updates the list of dinghy classes', async () => {
        const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
        const getDinghyClassesSpy = vi.spyOn(model, 'getDinghyClasses');
        await act(async () => {
            render(<SignUpForm  model={model} race={race}/>);
        });
        await act(async () => {
            model.handleDinghyClassCreation('http://localhost:8081/dinghyracing/api/dinghyClasses/99');
        });
        expect(getDinghyClassesSpy).toHaveBeenCalledTimes(2);
    });
});
describe('when the fleet associated with the race is changed', () => {
    it('updates the list of dinghy classes', async () => {
        const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
        const getDinghyClassesSpy = vi.spyOn(model, 'getDinghyClasses');
        await act(async () => {
            render(<SignUpForm  model={model} race={race} />);
        });
        await act(async () => {
            model.handleFleetUpdate({'body': fleetHandicapHAL._links.self.href});
        });
        expect(getDinghyClassesSpy).toHaveBeenCalledTimes(2);
    });
});
describe('when a previous entry is selected', () => {
    it('populates the signup form with details from the previous entry', async () => {
        const user = userEvent.setup();
        const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race} />);
        });
        // enter sail number
        const inputSailNumber = screen.getByLabelText(/sail/i);
        await user.type(inputSailNumber, '1234');
        // get table that is suppossed to contain details of dinghy class and previous crews
        const previousEntries = within(screen.getByTestId('previous-entries'));
        const competitorCell = await previousEntries.findByRole('cell', {name: /chris marshall/i});
        await user.click(competitorCell);
        expect(await screen.findByLabelText(/helm/i)).toHaveValue('Chris Marshall');
        expect(await screen.findByLabelText(/crew/i)).toHaveValue('Lou Screw');
        expect(await screen.findByLabelText(/dinghy class/i)).toHaveValue('Scorpion');
        expect(await screen.findByLabelText(/sail number/i)).toHaveValue('1234');
    });
    it('overwrites any previously entered values removing any value entered for mate if mate in selected record is null', async () => {
        const user = userEvent.setup();
        const race = new Race(raceHandicapAHAL, {version: '"0"'}, model);
        await act(async () => {
            render(<SignUpForm  model={model} race={race} />);
        });
        // enter sail number
        const inputHelm = screen.getByLabelText(/helm/i);
        const inputCrew = screen.getByLabelText(/crew/i);
        const inputDinghyClass = screen.getByLabelText(/dinghy class/i);
        const inputSailNumber = screen.getByLabelText(/sail/i);
        await user.selectOptions(inputDinghyClass, 'Scorpion');
        await user.type(inputSailNumber, '1234');
        await user.type(inputHelm, 'J R Hartley');
        await user.type(inputCrew, 'Bilbo Baggins');
        // confirm there is a crew value to be replaced
        expect(inputCrew).toHaveValue('Bilbo Baggins');
        const previousEntries = within(screen.getByTestId('previous-entries'));
        const competitorCell = await previousEntries.findByRole('cell', {name: /chris marshall/i});
        await user.click(competitorCell);
        expect(inputHelm).toHaveValue('Chris Marshall');
        expect(inputCrew).toHaveValue('Lou Screw');
        expect(inputDinghyClass).toHaveValue('Scorpion');
        expect(inputSailNumber).toHaveValue('1234');
    });
});