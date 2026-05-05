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

import SylphController from './sylph-controller';
import SylphModel from '../model/sylph-model';
import { httpRootURL, wsRootURL,
    dinghyClassCometHAL, dinghyClassScorpionHAL, dinghyClassGraduateHAL,
    fleetScorpionHAL, 
    raceCometAHAL, raceScorpionAHAL,  
    competitorChrisMarshallHAL, competitorLouScrewHAL, competitorJillMyerHAL,
    dinghy826HAL, dinghy1234HAL,
    entryChrisMarshall1234ScorpionAHAL, entryJillMyer826CometAHAL, entrySarahPascal6745ScorpionAHAL,
    fleetHandicapHAL,
    lap1HAL, lap2HAL, lap3HAL,
    signedUpChrisMarshallDinghy1234ScorpionAHAL, signedUpSarahPascalDinghy6745ScorpionAHAL
} from '../model/__mocks__/test-data.js';
import Collection from '../model/collection.js';
import Competitor from '../model/competitor.js';
import Dinghy from '../model/dinghy.js';
import DinghyClass from '../model/dinghy-class.js';
import Entry from '../model/entry.js';
import Fleet from '../model/fleet.js';
import Lap from '../model/lap.js';
import MissingParameter from '../errors/missing-parameter.js';
import DirectRace from '../model/direct-race.js';
import RaceType from '../model/race-type.js';
import SignedUp from '../model/signed-up.js';
import StartType from '../model/start-type.js';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('when creating a new Dinghy Class', () => {
    describe('when a name is not supplied for a new dinghy class', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.createDinghyClass(null, 2, 1000)).rejects.toThrowError('A name is required for a new dinghy class.');
        });
    });
    describe('when a name is empty string', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.createDinghyClass('', 2, 1000)).rejects.toThrowError('A name is required for a new dinghy class.');
        });
    });
    describe('when a crew size not supplied for a new dinghy class', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.createDinghyClass('Class Name', undefined, 1000)).rejects.toThrowError('Crew size must be a positive whole number.');
        });
    });
    describe('when a non-numeric crew size is supplied for a new dinghy class', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.createDinghyClass('Class Name', 'Two', 1000)).rejects.toThrowError('Crew size must be a positive whole number.');
        });
    });
    describe('when a portsmouth number not supplied for a new dinghy class', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.createDinghyClass('Class Name', 2)).rejects.toThrowError('Portsmouth number must be a positve whole number.');
        });
    });
    describe('when a non-numeric portsmouth number is supplied for a new dinghy class', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.createDinghyClass('Class Name', 2, 'One Thousand')).rejects.toThrowError('Portsmouth number must be a positve whole number.');
        });
    });
    it('returns a promise that resolves to the dinghy class when operation is successful', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'createDinghyClass').mockImplementation(() => {return Promise.resolve(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model))});
        const promise = controller.createDinghyClass('Scorpion', 2, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model));
    });
});

describe('when updating a dinghy class', () => {
    describe('when an existing dinghy class is not supplied', () => {
        it('throws error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateDinghyClass(dinghyClassScorpionHAL, 'Scorpion', 2, 1000)).rejects.toThrowError('A dinghy class to update is required.');
        });
    });
    describe('when the name is not supplied for the dinghy class', () => {
        it('throws error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateDinghyClass(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model), null, 2, 1000)).rejects.toThrowError('A name is required for a new dinghy class.');
        });
    });
    describe('when the new name is an empty string', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateDinghyClass(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model), '', 2, 1000)).rejects.toThrowError('A name is required for a new dinghy class.');
        });
    });
    describe('when a crew size not supplied for the dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateDinghyClass(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model), 'Scorpion', undefined, 1000)).rejects.toThrowError('Crew size must be a positive whole number.');
        });
    });
    describe('when a non-numeric crew size is supplied for the dinghy class', () => {
        it('throws error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateDinghyClass(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model), 'Scorpion', 'Two', 1000)).rejects.toThrowError('Crew size must be a positive whole number.');
        });
    });
    describe('when a portsmouth number not supplied for dinghy class', () => {
        it('throws error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);new DinghyClass(dinghyClassScorpionHAL, {version: '"1"'}, model)
        });
    });
    describe('when a non-numeric portsmouth number is supplied for dinghy class', () => {
        it('throws error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateDinghyClass(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model), 'Scorpion', 2, 'One Thousand')).rejects.toThrowError('Portsmouth number must be a positve whole number.');
        });
    });
    describe('when operation is successful', () => {
        it('returns a promise that resolves to dinghy class', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'updateDinghyClass').mockImplementationOnce(() => {return Promise.resolve(new DinghyClass(dinghyClassScorpionHAL, {version: '"1"'}, model))});
            const controller = new SylphController(model);
            const promise = controller.updateDinghyClass(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model), 'Scorpion Pro', 3, 1154);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({hal: dinghyClassScorpionHAL, metadata: {version: '"1"'}, model});
        });
    });
});

describe('when creating a new race', () => {
    it('returns a promise that resolves to the race', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'createRace').mockImplementation(() => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
        const promise = controller.createRace('Scorpion A', new Date('2021-10-14T10:30:00'), new Fleet(fleetScorpionHAL, {version: '"0"'}), 270000, 5, RaceType.FLEET, StartType.CSCCLUBSTART);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: raceScorpionAHAL, metadata: {version: '"0"'}, model: model});
    });
    it('throws error when name is null and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createRace(null, new Date('2021-10-14T10:30:00'), new Fleet(fleetScorpionHAL, {version: '"0"'}), 270000, 5, RaceType.FLEET, StartType.CSCCLUBSTART)).rejects.toThrowError(new MissingParameter('A name for the rece is required.'));
    });
    it('throws error when name is \'\'', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createRace('', new Date('2021-10-14T10:30:00'), new Fleet(fleetScorpionHAL, {version: '"0"'}), 270000, 5, RaceType.FLEET, StartType.CSCCLUBSTART)).rejects.toThrowError(new MissingParameter('A name for the rece is required.'));
    });
    it('throws error when time is not a valid time', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createRace('Scorpion A', '2021-10-14T10:30:00', new Fleet(fleetScorpionHAL, {version: '"0"'}), 270000, 5, RaceType.FLEET, StartType.CSCCLUBSTART)).rejects.toThrowError(new MissingParameter('A planned start tme for the race is required.'));
    });
    it('throws an error when a fleet is not provided', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createRace('Scorpion A', new Date('2021-10-14T10:30:00'), null, 270000, 5, RaceType.FLEET, StartType.CSCCLUBSTART)).rejects.toThrowError(new MissingParameter('A fleet for the race is required.'));
    });
    it('throws an error when a duration is not provided', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createRace('Scorpion A', new Date('2021-10-14T10:30:00'), new Fleet(fleetScorpionHAL, {version: '"0"'}), null, 5, RaceType.FLEET, StartType.CSCCLUBSTART)).rejects.toThrowError(new MissingParameter('A duration for the race class is required.'));
    });
    it('throws an error when a race type is not provided', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createRace('Scorpion A', new Date('2021-10-14T10:30:00'), new Fleet(fleetScorpionHAL, {version: '"0"'}), 270000, 5, null, StartType.CSCCLUBSTART)).rejects.toThrowError(new MissingParameter('A race type for the race is required.'));
    });
    it('throws an error when a start type is not provided', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createRace('Scorpion A', new Date('2021-10-14T10:30:00'), new Fleet(fleetScorpionHAL, {version: '"0"'}), 270000, 5, RaceType.PURSUIT, null)).rejects.toThrowError(new MissingParameter('A start type for the race is required.'));
    });
    it('throws error when planned laps is null', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createRace('Scorpion A', new Date('2021-10-14T10:30:00'), new Fleet(fleetScorpionHAL, {version: '"0"'}), 270000, null, RaceType.FLEET, StartType.CSCCLUBSTART)).rejects.toThrowError(new MissingParameter('A number of planned laps for the race is required.'));
    });
});

describe('when signing up to a race', () => {
    it('returns a promise that resolves to the race signed up to when operation is successful', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'signUpToRace').mockImplementationOnce((race, helm, dinghy, crew = null) => {return Promise.resolve(new DirectRace(raceScorpionAHAL, {version: '"0"'}, model))});
        const promise = controller.signUpToRace(new DirectRace(raceScorpionAHAL, {version: '"0"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: raceScorpionAHAL, metadata: {version: '"0"'}, model: model});
    });
    it('throws error when operation is unsuccessful', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'signUpToRace').mockImplementationOnce((race, helm, dinghy, crew = null) => {throw new Error('Oops!')});
        await expect(controller.signUpToRace(new DirectRace(raceScorpionAHAL, {version: '"0"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model))).rejects.toThrowError('Oops!');
    });
    it('throws error when race is null or undefined and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(controller.signUpToRace(null, new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model))).rejects.toThrowError('A race is required for a new race entry.');
    });
    it('throws an error when helms is null or undefined and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(controller.signUpToRace(new DirectRace(raceScorpionAHAL, {version: '"0"'}, model), null, new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model))).rejects.toThrowError('A helm is required for a new race entry.');
    });
    it('throws an error when dinghy is null or undefined and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(controller.signUpToRace(new DirectRace(raceScorpionAHAL, {version: '"0"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), null, new Competitor(competitorLouScrewHAL, {version: '"0"'}, model))).rejects.toThrowError('A dinghy is required for a new race entry.');
    });
    describe('when dinghy is a 2 person dinghy and a crew is not provided', () => {
        it('signup fails and a message explaining the cause of failure is provided', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getDinghyClass').mockImplementation(() => {return Promise.resolve(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model))});
            const controller = new SylphController(model);
            await expect(controller.signUpToRace(new DirectRace(raceScorpionAHAL, {version: '"0"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model))).rejects.toThrowError(`A Scorpion needs a crew. Please select a crew.`);
        });
        describe('when provided crew is not a competitor', () => {
            it('throws an error', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                await expect(controller.signUpToRace(new DirectRace(raceScorpionAHAL, {version: '"0"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), 'Lou Screw')).rejects.toThrowError('Crew must be a competitor.');
            });
        });
    });
    describe('when dinghy is a 1 person dinghy and no crew is provided', () => {
        it('signup is successful', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            vi.spyOn(model, 'signUpToRace').mockImplementationOnce((race, helm, dinghy, crew = null) => {return Promise.resolve(new DirectRace(raceCometAHAL, {version: '"0"'}, model))});
            vi.spyOn(model, 'getDinghyClass').mockImplementation(() => {return Promise.resolve(new DinghyClass(dinghyClassCometHAL, {version: '"0"'}, model))});
            const promise = controller.signUpToRace(new DirectRace(raceCometAHAL, {version: '"0"', model}), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy826HAL, {version: '"0"'}, model));
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({hal: raceCometAHAL, metadata: {version: '"0"'}, model: model});
        });
    });
});

describe('when updating an entry for a race', () => {
    describe('when updated entry does not not include a crew', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            vi.spyOn(model, 'updateEntry').mockImplementationOnce(() => {return Promise.resolve(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model))});
            const promise = controller.updateEntry(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model));
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({hal: entryChrisMarshall1234ScorpionAHAL, metadata: {version: '"0"'}, model: model});
        });
        describe('when entry not provided', () => {
            it('throws an error', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                await expect(() => controller.updateEntry(null, new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model))).rejects.toThrowError('An entry to update is required.');
            });
        });
        it('throws an error when helm is null or undefined and provides a message explaining the cause of failure', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateEntry(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), null, new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new Competitor(competitorLouScrewHAL, {version: '"0"'}, model))).rejects.toThrowError('A helm is required to sign up to a race.');
        });
        it('throws an error when dinghy is null or undefined and provides a message explaining the cause of failure', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateEntry(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), null, new Competitor(competitorLouScrewHAL, {version: '"0"'}, model))).rejects.toThrowError('A dinghy is required to sign up to a race.');
        });
        describe('when dinghy is a 2 person dinghy', () => {
            describe('when a crew is not provided', () => {
                it('throws an error', async () => {
                    const model = new SylphModel(httpRootURL, wsRootURL);
                    vi.spyOn(model, 'getDinghyClass').mockImplementation(() => {return Promise.resolve(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model))});
                    const controller = new SylphController(model);
                    await expect(() => controller.updateEntry(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model))).rejects.toThrowError(`A Scorpion needs a crew. Please select a crew.`);
                });
            });
            describe('when crew is not a competitor', () => {
                it('throws an error', async () => {
                    const model = new SylphModel(httpRootURL, wsRootURL);
                    vi.spyOn(model, 'getDinghyClass').mockImplementation(() => {return Promise.resolve(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model))});
                    const controller = new SylphController(model);
                    await expect(() => controller.updateEntry(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), new Dinghy(dinghy1234HAL, {version: '"0"'}, model), 'Lou Screw')).rejects.toThrowError(`Crew must be a competitor.`);
                });
            });
        });
        describe('when dinghy is a 1 person dinghy and no crew is provided', () => {
            it('signup is successful', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(model, 'updateEntry').mockImplementationOnce(() => {return Promise.resolve(new Entry(entryJillMyer826CometAHAL, {version: '"1"'}, model))});
                const promise = controller.updateEntry(new Entry(entryJillMyer826CometAHAL, {version: '"0"'}, model), new Competitor(competitorJillMyerHAL, {version: '"0"'}, model), new Dinghy(dinghy826HAL, {version: '"0"'}, model))
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({hal: entryJillMyer826CometAHAL, metadata: {version: '"1"'}, model: model});
            });
        });
    });
});

describe('when withdrawing from a race', () => {
    describe('when entry has a URL', () => {
        describe('when withdrawal successful', () => {
            it('returns a promise that resolves to true', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(model, 'withdrawEntry').mockImplementationOnce(() => {return Promise.resolve(true)});
                const promise = controller.withdrawEntry(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(true);
            });
        });
        describe('entry is not provided', () => {
            it('throws an error', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                await expect(() => controller.withdrawEntry(null)).rejects.toThrowError( 'An entry to withdraw is required.');
            });
        });
    });
});

describe('when creating a new dinghy then', () => {
    it('when operation is successful returns a promise that resolves to the new dinghy', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve(new Dinghy(dinghy1234HAL, {version: '"0"'}, model))});
        const promise = controller.createDinghy('1234', new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: dinghy1234HAL, metadata: {version: '"0"'}, model});
    });
    it('throws error when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'createDinghy').mockImplementationOnce(() => {throw new Error('Something went wrong.')});
        await expect(() => controller.createDinghy('1234', new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model))).rejects.toThrowError('Something went wrong.')
    });
    it('throws error when sail number is not provided', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createDinghy('', new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model))).rejects.toThrowError('A sail number is required for a new dinghy.');
    });
    it('throws error when dinghy class is not provided', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.createDinghy('1234')).rejects.toThrowError('A dinghy class is required for a new dinghy.');
    });
});

describe('when creating a new competitor', () => {
    describe('when operation is successful', () => {
        it('returns a promise that resolves to a result indicating success', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'createCompetitor').mockImplementationOnce(() => {return Promise.resolve(new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model))});
            const controller = new SylphController(model);
            const promise = controller.createCompetitor('Chris Marshall');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({hal: competitorChrisMarshallHAL, metadata: {version: '"0"'}, model: model});
        });
    });
    describe('when competitor name is not provided', () => {
        it('throws error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.createCompetitor('')).rejects.toThrowError('Name is required for a new competitor.');
        });
    });
});

describe('when updating a competitor', () => {
    describe('when operation is successful', () => {
        it('returns a promise that resolves to a result indicating success', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'updateCompetitor').mockImplementationOnce((competitor, name) => {return Promise.resolve(new Competitor({...competitorChrisMarshallHAL, name: name}, {version: '"1"'}, model))});
            const controller = new SylphController(model);
            const promise = controller.updateCompetitor(new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), 'Bill Withers');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({hal: {...competitorChrisMarshallHAL, name: 'Bill Withers'}, metadata: {version: '"1"'}, model});
        });
    });
    describe('when an exisitng competitor is not provided', () => {
        it('throws error and provides a message explaining the cause of failure', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateCompetitor(null, 'Bill Withers')).rejects.toThrowError('A competitor to update is required.');
        });
    });
    describe('when competitor new name is not provided', () => {
        it('returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateCompetitor(new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), '')).rejects.toThrowError('A name is required to update a competitor.');
        });
    });
});

describe('when creating a new fleet', () => {
    describe('when new fleet has not been assigned dinghy classes', () => {
        describe('when operation is successful', () => {
            it('returns a promise that resolves to a result indicating success', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(model, 'createFleet').mockImplementationOnce(async () => new Fleet(fleetHandicapHAL, {version: '"0"'}, model));
                const promise = controller.createFleet('Handicap', []);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({hal: fleetHandicapHAL, metadata: {version: '"0"'}, model});
            });
        });
        describe('when a name is not provided', () => {
            it('throws an error', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                await expect(() => controller.createFleet('', [])).rejects.toThrowError('A name for the fleet is required.');
            })
        });
        describe('when a dinghy classes array is not provided', async () => {
            it('throws an error', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                await expect(() => controller.createFleet('Fleet')).rejects.toThrowError('An array of dinghy classes is required to create a new fleet.');
            })
        });
        describe('when operation is unsuccessful', () => {
            it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(model, 'createFleet').mockImplementationOnce(() => {throw new Error('Something went wrong')});
                await expect(() => controller.createFleet('Handicap', [
                    new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),
                    new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model)
                ])).rejects.toThrowError('Something went wrong');
            });
        });
    });
    describe('when fleet has been assigned dinghy classes', () => {
        describe('when operation is successful', () => {
            it('returns a promise that resolves to the fleet', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(model, 'createFleet').mockImplementationOnce(() => {return Promise.resolve(new Fleet(fleetHandicapHAL, {version: '"0"'}, model))});
                const promise = controller.createFleet('Handicap', [
                    new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),
                    new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model)
                ]);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({hal: fleetHandicapHAL, metadata: {version: '"0"'}, model});
            });
        });
    });
    describe('when dinghy class array contains a non-dinghy class', () => {
        it('throws an error and provides a message explaining the cause of failure', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.createFleet('Handicap', [
                new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model)
            ])).rejects.toThrowError('An array of dinghy classes is required to create a new fleet.')
        });
    });
});

describe('when updating a fleet', () => {
    describe('when fleet has not been assigned dinghy classes', () => {
        describe('when operation is successful', () => {
            it('returns a promise that resolves updated fleet', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(model, 'updateFleet').mockImplementationOnce(() => {return Promise.resolve(new Fleet(fleetHandicapHAL, {version: '"0"'}, model))});
                const promise = controller.updateFleet(new Fleet(fleetHandicapHAL, {version: '"0"'}, model), 'Handicap', []);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({hal: fleetHandicapHAL, metadata: {version: '"0"'}, model});
            });
        });
        describe('when operation is unsuccessful', () => {
            it('throws an error and provides a message explaining the cause of failure', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                vi.spyOn(model, 'updateFleet').mockImplementationOnce(() => {throw new Error('Oops!')});
                const controller = new SylphController(model);
                await expect(() =>controller.updateFleet(new Fleet(fleetHandicapHAL, {version: '"0"'}, model), 'Handicap', [])).rejects.toThrowError('Oops!');
            });
        });
    });
    describe('when fleet has been assigned dinghy classes', () => {
        describe('when operation is successful', () => {
            it('returns a promise that resolves to the fleet', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                vi.spyOn(model, 'updateFleet').mockImplementationOnce(() => {return Promise.resolve(new Fleet(fleetHandicapHAL, {version: '"0"'}, model))});
                const controller = new SylphController(model);
                const promise = controller.updateFleet(new Fleet(fleetHandicapHAL, {version: '"0"'}, model), 'Handicap', [
                    new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),
                    new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model)
                ]);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({hal: fleetHandicapHAL, metadata: {version: '"0"'}, model});
            });
        });
        describe('when operation is unsuccessful', () => {
            it('throws an error and provides a message explaining the cause of failure', async () => {
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(model, 'updateFleet').mockImplementationOnce(() => {throw new Error('Something went wrong')});
                await expect(() => controller.updateFleet(new Fleet(fleetHandicapHAL, {version: '"0"'}, model), 'Handicap', [
                    new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),
                    new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model)
                ])).rejects.toThrowError('Something went wrong');
            });
        });
    });
    describe('when fleet name is not provided', () => {
        it('throws error and provides a message explaining the cause of failure', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateFleet(new Fleet(fleetHandicapHAL, {version: '"0"'}, model), null, [
                new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),
                new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model)
            ])).rejects.toThrowError('A name is required for the updated fleet.');
        });
    });
    describe('when fleet is not provided', () => {
        it('throws error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateFleet(null, 'Fleet Name', [
                new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),
                new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, model)
            ])).rejects.toThrowError('A fleet is required to update.');
        });
    });
    describe('when dinghy classes array is not provided', () => {
        it('throws error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateFleet(new Fleet(fleetHandicapHAL, {version: '"0"'}, model), 'Fleet Name')).rejects.toThrowError('A collection of dinghy classes are required for the updated fleet.');
        });
    });
});

describe('when starting a race', () => {
    it('returns a promise that resolves to the race when operation is successful', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'updateRace').mockImplementationOnce(() => {return Promise.resolve(new DirectRace(raceScorpionAHAL, {version: '"1"'}, model))});
        const promise = controller.startRace(new DirectRace(raceScorpionAHAL, {version: '"1"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new DirectRace(raceScorpionAHAL, {version: '"1"'}, model));
    });
    describe('when a race is not provided', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.startRace()).rejects.toThrowError('A race to start is required.');
        });
    });
});

describe('when adding a lap to an entry', () => {
    describe('when first lap', () => {
        it('returns a promise that resolves to the entry when operation is successful', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const addLapSpy = vi.spyOn(model, 'addLap').mockImplementationOnce(() => {return Promise.resolve(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model))});
            const promise = controller.addLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 1000);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(addLapSpy).toBeCalledWith(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 1000);
            expect(result).toEqual(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
        });
    });
    it('throws error when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'addLap').mockImplementationOnce(() => {throw new Error('Something went wrong')});
        await expect(() => controller.addLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 1000)).rejects.toThrowError('Something went wrong');
    });
    it('throws error when an entry is not provided', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(controller.addLap(null, 1000)).rejects.toThrowError('An entry is required to add a lap time.');
    });
    it('throws error when time is null or undefined and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'addLap');
        await expect(() => controller.addLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model))).rejects.toThrowError('Time must be a number; in milliseconds.');
    });
    it('throws error when time is not a number and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.addLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 'One')).rejects.toThrowError('Time must be a number; in milliseconds.');
    });
    it('throws error when time is zero and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.addLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 0)).rejects.toThrowError('Time must be greater than zero.');
    });
    it('throws error when time is negative and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.addLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), -1)).rejects.toThrowError('Time must be greater than zero.');
    });
    it('throws error if entry has finished race', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'addLap');
        await expect(() => controller.addLap(new Entry({...entryChrisMarshall1234ScorpionAHAL, finishedRace: true}, {version: '"0"'}, model))).rejects.toThrowError('Cannot add a lap to an entry that has finished the race.');
    });
    it('throws error if entry did not start the race', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'addLap');
        await expect(() => controller.addLap(new Entry({...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'DNS'}, {version: '"0"'}, model))).rejects.toThrowError('Cannot add a lap to an entry that did not start the race.');
    });
    it('throws error if entry disqualified', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'addLap');
        await expect(() => controller.addLap(new Entry({...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'DSQ'}, {version: '"0"'}, model))).rejects.toThrowError('Cannot add a lap to an entry that has been disqualified from the race.');
    });
    it('throws error if entry retired', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'addLap');
        await expect(() => controller.addLap(new Entry({...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'RET'}, {version: '"0"'}, model))).rejects.toThrowError('Cannot add a lap to an entry that has retired from the race.');
    });
});

describe('when removing a lap from an entry', () => {
    it('returns a promise that resolves to entry when operation is successful', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'removeLap').mockImplementationOnce(() => {return new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model)});
        const promise = controller.removeLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), new Lap(lap1HAL, {version: '"0"'}, this));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
    });
    it('throws error when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'removeLap').mockImplementationOnce(() => {throw new Error('Something went wrong')});
        await expect(() => controller.removeLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), new Lap(lap1HAL, {version: '"0"'}, this))).rejects.toThrowError('Something went wrong');
    });
    it('throws error when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.removeLap(null, new Lap(lap1HAL, {version: '"0"'}, this))).rejects.toThrowError('A valid entry is required to remove a lap.');
    });
    it('throws error when lap is null or undefined and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.removeLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model))).rejects.toThrowError('A lap to remove is required.');
    });
});

describe('when updating a lap for an entry', () => {
    it('accepts a positive numeric value greater than 0 and returns a promise that resolves the entry with the updated lap', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
        vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([new Lap(lap1HAL, {version: '"0"'}, model)], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
        vi.spyOn(model, 'updateLap').mockImplementation(async () => {return entry});
        const controller = new SylphController(model);
        // const promise = controller.updateLap(entry, 2000000);
        const promise = controller.updateLap(entry, 840000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
    });
    it('accepts a string integer > 0 and < 60 and returns a promise that resolves to a result indicating success', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
        vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([new Lap(lap1HAL, {version: '"0"'}, model)], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
        vi.spyOn(model, 'updateLap').mockImplementation(async () => {return entry});
        const controller = new SylphController(model);
        const promise = controller.updateLap(entry, '43');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
    });
    it('accepts a string n:n where n is a string integer > 0 and less than 59 and returns a promise that resolves to a result indicating success', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
        vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([new Lap(lap1HAL, {version: '"0"'}, model)], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
        vi.spyOn(model, 'updateLap').mockImplementation(async () => {return entry});
        const controller = new SylphController(model);
        const promise = controller.updateLap(entry, '23:43');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
    });
    it('accepts a string h:n:n where h is a string integer >= 0 and n is a string integer > 0 and less than 59 and returns a promise that resolves to a result indicating success', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
        vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([new Lap(lap1HAL, {version: '"0"'}, model)], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
        vi.spyOn(model, 'updateLap').mockImplementation(async () => {return entry});
        const controller = new SylphController(model);
        const promise = controller.updateLap(entry, '999:1:1');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
    });
    describe('when passed a string time value', () => {
        it('correctly converts a seconds only value to milliseconds', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
            vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([new Lap(lap1HAL, {version: '"0"'}, model)], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
            const updateLapSpy = vi.spyOn(model, 'updateLap').mockImplementation(async () => {return entry});
            const controller = new SylphController(model);
            await controller.updateLap(entry, '47');

            expect(updateLapSpy).toBeCalledWith(entry, 47000);
        });
        it('correctly converts a minutes and seconds value to milliseconds', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
            vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([new Lap(lap1HAL, {version: '"0"'}, model)], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
            const updateLapSpy = vi.spyOn(model, 'updateLap').mockImplementation(async () => {return entry});
            const controller = new SylphController(model);
            await controller.updateLap(entry, '23:47');
            
            expect(updateLapSpy).toBeCalledWith(entry, 1427000);
        });
        it('correctly converts an hours, minutes and seconds value to milliseconds', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
            vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([new Lap(lap1HAL, {version: '"0"'}, model)], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
            const updateLapSpy = vi.spyOn(model, 'updateLap').mockImplementation(async () => {return entry});
            const controller = new SylphController(model);
            await controller.updateLap(entry, '1:23:47');
            
            expect(updateLapSpy).toBeCalledWith(entry, 5027000);
        });
    });
    it('converts a cumulative time to a time for the last lap', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
        vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([
            new Lap({...lap1HAL, time: 'PT1S'}, {version: '"0"'}, model),
            new Lap({...lap2HAL, time: 'PT1S'}, {version: '"0"'}, model),
            new Lap({...lap3HAL, time: 'PT1S'}, {version: '"0"'}, model),
        ], {"size": 20, "totalElements": 3, "totalPages": 1, "number": 0})});
        const updateLapSpy = vi.spyOn(model, 'updateLap').mockImplementation(async () => {return entry});
        const controller = new SylphController(model);
        await controller.updateLap(entry, '00:04');
        
        expect(updateLapSpy).toBeCalledWith(entry, 2000);
    });
    it('does not accept a value greater than the elapsed time for the race', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getClock').mockImplementation(() => {return {getElapsedTime: () => 1500}});
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
        vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([
            new Lap({...lap1HAL, time: 'PT2S'}, {version: '"0"'}, model)
        ], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
        const controller = new SylphController(model);
        
        await expect(() => controller.updateLap(entry, '00:04')).rejects.toThrowError('Time should be less than or equal to the elapsed time of the race.');
    })
    it('throws error when update lap is unsuccessful and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
        vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([new Lap(lap1HAL, {version: '"0"'}, model)], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
        vi.spyOn(model, 'updateLap').mockImplementationOnce((entry, time) => {throw new Error('Something went wrong')});
        const controller = new SylphController(model);
        
        await expect(() => controller.updateLap(entry, 2000)).rejects.toThrowError('Something went wrong');
    });
    it('throws error when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        
        await expect(() => controller.updateLap(null, 2000)).rejects.toThrowError('An entry to update is required.');
    });
    it('throws an error when time is null or undefined and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        vi.spyOn(entry, 'getDirectRace').mockImplementation(async () => {return new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)});
        vi.spyOn(entry, 'getLaps').mockImplementation(async () => {return new Collection([new Lap(lap1HAL, {version: '"0"'}, model)], {"size": 20, "totalElements": 1, "totalPages": 1, "number": 0})});
        const controller = new SylphController(model);
        
        await expect(() => controller.updateLap(entry)).rejects.toThrowError('A time greater than zero is needed to update the lap.');
    });
    it('throws an error when time is not a number or a string in [[[h]h]h:][[m]m:][s]s and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const controller = new SylphController(model);
        
        await expect(() => controller.updateLap(entry, 'two thousand')).rejects.toThrowError('Time must be a number, in milliseconds, or a string value in the format [hh:][mm:]ss.');
    });
    it('throws error when time is zero and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const controller = new SylphController(model);
        
        await expect(() => controller.updateLap(entry, 0)).rejects.toThrowError('A time greater than zero is needed to update the lap.');
    });
    it('throws an error when time is negative and provides a message explaining the cause of failure', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const controller = new SylphController(model);
        
        await expect(() => controller.updateLap(entry, -1)).rejects.toThrowError('A time greater than zero is needed to update the lap.');
    });
});

describe('when writing race entries to a CSV file', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
         // JSDom will generate an error in the console when the test is run as a warning against navigating URLs during tests.
         // I don't know how to block this but, don't believe it is an issue here.
         // Error: Not implemented: navigation (except hash changes)
        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(),
            revokeObjectURL: vi.fn()
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model)
        vi.spyOn(race, 'getSignedUpToForEntry').mockImplementation((entry) => {
            if (entry.url === entryChrisMarshall1234ScorpionAHAL._links.self.href) {
                return new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model);
            }
            if (entry.url === entrySarahPascal6745ScorpionAHAL._links.self.href) {
                return new SignedUp(signedUpSarahPascalDinghy6745ScorpionAHAL, {version: '"0"'}, model);
            }
        });
        const promise = controller.downloadRaceResults(race);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toBe(true);
    });
    it('throws an error when race not provided', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        await expect(() => controller.downloadRaceResults(undefined, model)).rejects.toThrowError('Please provide a race to download.');
    });
});

describe('when race is postponed', () => {
    it('calls model updateRace with correct parameters', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const updateRaceSpy = vi.spyOn(model, 'updateRace');
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const fleet = new Fleet(fleetScorpionHAL, {version: ''}, model)
        await controller.postponeRace(race, 300000);
        expect(updateRaceSpy).toHaveBeenCalledWith(race, race.name, new Date(race.plannedStartTime.getTime() + 300000), fleet, race.duration, race.plannedLaps, race.type, race.startType);
    });
    describe('when race is not provided', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.postponeRace(null, 300000)).rejects.toThrow('A race to postpone is required.');
        });
    });
    describe('when delay is not provided', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
            await expect(() => controller.postponeRace(race)).rejects.toThrow('Duration must be a number.');
        });
    });
    describe('when an entry has sailed at least one lap', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const race = new DirectRace({...raceScorpionAHAL, leadEntry: {...raceScorpionAHAL.leadEntry, lapsSailed: 1}}, {version: '"0"'}, model);
            await expect(() => controller.postponeRace(race, 300000)).rejects.toThrow('Cannot postpone start after an entry has sailed a lap.');
        });
    })
});

describe('when setting a scoring abbreviation for an entry', () => {
    it('returns entry when operation is successful', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(model, 'setScoringAbbreviation').mockImplementationOnce(async (entry, scoringAbbreviation) => {
            return new Entry({...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: scoringAbbreviation}, {version: '"1"'}, model)
        });
        const promise = controller.setScoringAbbreviation(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 'DNS');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Entry({...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'DNS'}, {version: '"1"'}, model));
    });
    describe('when an empty string is passed for scoring abbreviation', () => {
        // if scoring abbreviation is an empty string pass null to model or will fail validation on REST server
        it('calls model setScoringAbbreviation with null', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            const setScoringAbbreviationSpy = vi.spyOn(model, 'setScoringAbbreviation');
            await controller.setScoringAbbreviation(entry, '');
            expect(setScoringAbbreviationSpy).toHaveBeenCalledWith(entry, null);
        });
    });
    describe('when null is passed for scoring abbreviation', () => {
        it('calls model setScoringAbbreviation with null value for scoring abbreviation', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            const setScoringAbbreviationSpy = vi.spyOn(model, 'setScoringAbbreviation');
            controller.setScoringAbbreviation(entry, null);
            expect(setScoringAbbreviationSpy).toHaveBeenCalledWith(entry, null);
        });
    });
    describe('when entry is null', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.setScoringAbbreviation(null, 'DNS')).rejects.toThrowError('An entry is required to set a scoring abbreviation.');
        });
    });
    describe('when scoring abbreviation is less than 3 characters', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.setScoringAbbreviation(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 'DS')).rejects.toThrowError('Scoring abbreviation must be 3 characters long.');
        });
    });
    describe('when scoring abbreviation is more than 3 characters', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.setScoringAbbreviation(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 'DNNS')).rejects.toThrowError('Scoring abbreviation must be 3 characters long.');
        });
    });
});

describe('when updating the planned laps for a race', () => {
    it('calls model UpdateRace with required parameters', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const updateRaceSpy = vi.spyOn(model, 'updateRace');
        await controller.updateRacePlannedLaps(race, 4);
        expect(updateRaceSpy).toBeCalledWith(race, race.name, race.plannedStartTime, new Fleet(fleetScorpionHAL, {version: ''}, model), race.duration, 4, race.type, race.startType);
    });
    describe('when race is not provided', () => {
        it('throws error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateRacePlannedLaps(null, 4)).rejects.toThrowError('A race to update is required.');
        });
    });
    describe('when a non-integer value is provided for number of laps', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateRacePlannedLaps(new DirectRace(raceScorpionAHAL, {version: '"0"'}, model), 4.1)).rejects.toThrowError('Number of laps must be a whole number greater than zero.');
        });
    });
});

describe('when updating the position of an entry in a race', () => {
    it('calls model updateEntryPosition with correct parameters', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const updateEntryPositionSpy = vi.spyOn(model, 'updateEntryPosition');
        const controller = new SylphController(model);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        await controller.updateEntryPosition(entry, 2);
        expect(updateEntryPositionSpy).toHaveBeenCalledWith(race, entry, 2);
    });
    describe('when entry is not provided', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await expect(() => controller.updateEntryPosition(null, 2)).rejects.toThrowError('An entry to update is required.');
        });
    });
    describe('when new position is not provided', () => {
        it('throws an error', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            await expect(() => controller.updateEntryPosition(entry)).rejects.toThrowError('A numeric new position greater than 0 is required to update an entry position.');
        });
    });
});