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

import DinghyRacingController from './dinghy-racing-controller.js';
import DinghyRacingModel from '../model/dinghy-racing-model.js';
import { httpRootURL, wsRootURL, competitorChrisMarshall, dinghyClassScorpion, dinghy1234, dinghy826, raceScorpionA, raceCometA, 
    entryChrisMarshallScorpionA1234, entryJillMyerCometA826, entriesScorpionA, competitorLouScrew, fleetHandicap, fleetScorpion } from '../model/__mocks__/test-data.js';
import * as csvWriter from '../utilities/csv-writer.js';
import NameFormat from './name-format.js';

vi.mock('../model/dinghy-racing-model');
vi.mock('../model/domain-classes/clock');

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('when creating a new Dinghy Class', () => {
    describe('when a name is not supplied for a new dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), name: null, portsmouthNumber: 1000});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A name is required for a new dinghy class.'});
        });
    });
    describe('when a name is empty string', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), name: ''});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A name is required for a new dinghy class.'});
        });
    });
    describe('when a crew size not supplied for a new dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), name: 'Dinghy Class', crewSize: null});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A numeric crew size is required for a new dinghy class.'});
        });
    });
    describe('when a non-numeric crew size is supplied for a new dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), name: 'Dinghy Class', crewSize: 'One'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A numeric crew size is required for a new dinghy class.'});
        });
    });
    describe('when a portsmouth number not supplied for a new dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), name: 'Dinghy Class', crewSize: 1, portsmouthNumber: null});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A numeric portsmouth number is required for a new dinghy class.'});
        });
    });
    describe('when a non-numeric portsmouth number is supplied for a new dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), name: 'Dinghy Class', crewSize: 1, portsmouthNumber: 'One Thousand'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A numeric portsmouth number is required for a new dinghy class.'});
        });
    });
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = vi.spyOn(dinghyRacingModel, 'createDinghyClass').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), name: 'Scorpion', crewSize: 2, portsmouthNumber: 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = vi.spyOn(dinghyRacingModel, 'createDinghyClass').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion', portsmouthNumber: 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    })
    it('returns a promise that resolves to a result indicating failure when name is null and provides a message explaining the cause of failure', async () => {
        const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(httpRootURL, wsRootURL));
        const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': null});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A name is required for a new dinghy class.'});
    });
    it('returns a promise that resolves to a result indicating failure when name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(httpRootURL, wsRootURL));
        const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': ''});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A name is required for a new dinghy class.'});
    });
});

describe('when updating a dinghy class', () => {
    describe('when the url for an existing dinghy class is not supplied', () => {
        it('returns a message advising that the url for an exisiting dinghy class is required', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateDinghyClass({...dinghyClassScorpion, url: ''});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({success: false, message: 'The url of an existing dinghy class is required to update a dinghy class.'});
        });
    });
    describe('when the name is not supplied for the dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateDinghyClass({...dinghyClassScorpion, name: null});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A name is required for a dinghy class.'});
        });
    });
    describe('when the new name is an empty string', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateDinghyClass({...dinghyClassScorpion, name: ''});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A name is required for a dinghy class.'});
        });
    });
    describe('when a crew size not supplied for the dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateDinghyClass({...dinghyClassScorpion, name: 'Dinghy Class', crewSize: null});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A numeric crew size is required for a dinghy class.'});
        });
    });
    describe('when a non-numeric crew size is supplied for the dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateDinghyClass({...dinghyClassScorpion, name: 'Dinghy Class', crewSize: 'One'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A numeric crew size is required for a dinghy class.'});
        });
    });
    describe('when a portsmouth number not supplied for a new dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateDinghyClass({...dinghyClassScorpion, portsmouthNumber: null});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A numeric portsmouth number is required for a new dinghy class.'});
        });
    });
    describe('when a non-numeric portsmouth number is supplied for a new dinghy class', () => {
        it('returns a message that a name is required for a dinghy class', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateDinghyClass({...dinghyClassScorpion, portsmouthNumber: 'One Thousand'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A numeric portsmouth number is required for a new dinghy class.'});
        });
    });
    describe('when operation is successful', () => {
        it('returns a promise that resolves to a result indicating success', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            vi.spyOn(dinghyRacingModel, 'updateDinghyClass').mockImplementationOnce(() => {return Promise.resolve({success: true, domainObject: {...dinghyClassScorpion, name: 'Scorpion Pro', crewSize: 3, portsmouthNumber: 1154}})});
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateDinghyClass({...dinghyClassScorpion, name: 'Scorpion Pro', crewSize: 3, portsmouthNumber: 1154});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, domainObject: {...dinghyClassScorpion, name: 'Scorpion Pro', crewSize: 3, portsmouthNumber: 1154}});
        });
    });
    describe('when an exisitng dinghy class is not provided', () => {
        it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateDinghyClass(null);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'A dinghy class to update is required.'});
        });
    });
});

describe('when creating a new race', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = vi.spyOn(dinghyRacingModel, 'createRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.createRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = vi.spyOn(dinghyRacingModel, 'createRace').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when name is null and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.createRace({...DinghyRacingModel.raceTemplate(), 'name': null, 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion', 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A name is required for a new race.'});
    });
    it('returns a promise that resolves to a result indicating failure when name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.createRace({...DinghyRacingModel.raceTemplate(), 'name': '', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion', 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A name is required for a new race.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is not a valid time and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': '2022-12-14 10:20', 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion', 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A time is required for a new race.'});
    });
    it('returns a promise that resolves to a result indicating failure when planned laps is null and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion', 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Planned laps is required for a new race.'});
    });
});

describe('when signing up to a race', () => {
    describe('when entry does not not include a crew', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            vi.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true});
        });
        it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            vi.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
        });
        it('returns a promise that resolves to a result indicating failure when race name is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace({ 'name': null, 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
        });
        it('returns a promise that resolves to a result indicating failure when race name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace({ 'name': '', 'plannedStartTime': undefined, 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
        });
        it('returns a promise that resolves to a result indicating failure when no time is provided a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace({ 'name': 'Scorpion A', 'plannedStartTime': undefined, 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
        });
        it('returns a promise that resolves to a result indicating failure when helms name is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, {'name':undefined}, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the helm.'});
        });
        it('returns a promise that resolves to a result indicating failure when helm name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, {'name':''}, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the helm.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy sail number is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':null,'dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy sail number is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':'','dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy class name is not provided and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':'','dinghyClass':{'name':null},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy class name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':'','dinghyClass':{'name':''},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        describe('when dinghy is a 2 person dinghy and a crew is not provided', () => {
            it('signup fails and a message explaining the cause of failure is provided', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': false, 'message': 'You have selected a dinghy with a crew. Please select a crew.'});
            });
        });
        describe('when dinghy is a 1 person dinghy and no crew is provided', () => {
            it('signup is successful', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
                const promise = dinghyRacingController.signupToRace(raceCometA, competitorChrisMarshall, dinghy826);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true});
            });
        });
    });
    describe('when entry includes a crew', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            vi.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true});
        });
        it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            vi.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
        });
        it('returns a promise that resolves to a result indicating failure when race name is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace({ 'name': null, 'plannedStartTime': new Date('2021-10-14T14:10:00'), 
                'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
        });
        it('returns a promise that resolves to a result indicating failure when race name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace({ 'name': '', 'plannedStartTime': undefined, 
                'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
        });
        it('returns a promise that resolves to a result indicating failure when no time is provided a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace({ 'name': 'Scorpion A', 'plannedStartTime': undefined, 
                'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
        });
        it('returns a promise that resolves to a result indicating failure when crews name is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234, {'name':undefined});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the crew.'});
        });
        it('returns a promise that resolves to a result indicating failure when crew name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234, {'name':''});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the crew.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy sail number is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':null,
                'dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},
                'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy sail number is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':'',
                'dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},
                'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy class name is not provided and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':'',
                'dinghyClass':{'name':null},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy class name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':'',
                'dinghyClass':{'name':''},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
    });
});

describe('when updating an entry for a race', () => {
    describe('when updated entry does not not include a crew', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            vi.spyOn(dinghyRacingModel, 'updateEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true});
        });
        it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            vi.spyOn(dinghyRacingModel, 'updateEntry').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
        });
        it('returns a promise that resolves to a result indicating failure when race name is null or undefined and provides a message explaining the cause of failure', async () => {
            const entry = {...entryChrisMarshallScorpionA1234, url: null};
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entry, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide an existing race entry.'});
        });
        it('returns a promise that resolves to a result indicating failure when helms name is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, {'name':undefined}, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the helm.'});
        });
        it('returns a promise that resolves to a result indicating failure when helm name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, {'name':''}, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the helm.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy sail number is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, 
                {'sailNumber':null,'dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy sail number is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, 
                {'sailNumber':'','dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy class name is not provided and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, 
                {'sailNumber':'','dinghyClass':{'name':null},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy class name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, 
                {'sailNumber':'','dinghyClass':{'name':''},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        describe('when dinghy is a 2 person dinghy and a crew is not provided', () => {
            it('signup fails and a message explaining the cause of failure is provided', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': false, 'message': 'You have selected a dinghy with a crew. Please select a crew.'});
            });
        });
        describe('when dinghy is a 1 person dinghy and no crew is provided', () => {
            it('signup is successful', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'updateEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
                const promise = dinghyRacingController.updateEntry(entryJillMyerCometA826, competitorChrisMarshall, dinghy826);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true});
            });
        });
    });
    describe('when entry includes a crew', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            vi.spyOn(dinghyRacingModel, 'updateEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true});
        });
        it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            vi.spyOn(dinghyRacingModel, 'updateEntry').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
        });
        it('returns a promise that resolves to a result indicating failure when race name is null or undefined and provides a message explaining the cause of failure', async () => {
            const entry = {...entryChrisMarshallScorpionA1234, url: null};
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entry, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide an existing race entry.'});
        });
        it('returns a promise that resolves to a result indicating failure when crews name is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234, {'name':undefined});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the crew.'});
        });
        it('returns a promise that resolves to a result indicating failure when crew name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234, {'name':''});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the crew.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy sail number is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, {'sailNumber':null,
                'dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},
                'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy sail number is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, {'sailNumber':'',
                'dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},
                'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy class name is not provided and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, {'sailNumber':'',
                'dinghyClass':{'name':null},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
        it('returns a promise that resolves to a result indicating failure when dinghy class name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, {'sailNumber':'',
                'dinghyClass':{'name':''},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'}, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
        });
    });
});

describe('when withdrawing from a race', () => {
    describe('when entry has a URL', () => {
        describe('when withdrawal successful', () => {
            it('returns a promise that resolves to a result indicating success', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'withdrawEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
                const promise = dinghyRacingController.withdrawEntry(entryChrisMarshallScorpionA1234);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true});
            });
        });
        describe('when withdrawal is unsuccessful', () => {
            it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'withdrawEntry').mockImplementationOnce(() => {return Promise.resolve({success: false, message: 'Oops!'})});
                const promise = dinghyRacingController.withdrawEntry(entryChrisMarshallScorpionA1234);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({success: false, message: 'Oops!'});
            });
        });
    });
    describe('when entry does not have a URL', () => {
        it('returns a promise that resolves to a result indicating failure and contining a message explaining the cause of the failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.withdrawEntry(DinghyRacingModel.entryTemplate());
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({success: false, message: 'An entry with a URL is required to withdraw from a race.'});
        });
    })
});

describe('when creating a new dinghy then', () => {
    it('when operation is successful returns a promise that resolves to a result indicating success', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.createDinghy(dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('when operation is unsuccessful returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy(dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('when sail number is not provided returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy({});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A sail number is required for a new dinghy.'});
    });
    it('when dinghy class is not provided returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy({'sailNumber': '1234'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A dinghy class is required for a new dinghy.'});
    });
    it('when dinghy class name is not provided returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy({...DinghyRacingModel.dinghyTemplate(), 'sailNumber': '1234'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A dinghy class is required for a new dinghy.'});
    });
});

describe('when creating a new competitor', () => {
    describe('when operation is successful', () => {
        it('returns a promise that resolves to a result indicating success', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            vi.spyOn(dinghyRacingModel, 'createCompetitor').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Bill Withers'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true});
        });
    });
    describe('when competitor name is not provided', () => {
        it('returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': null});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'A name is required for a new competitor.'});
        });
    });
});

describe('when updating a competitor', () => {
    describe('when operation is successful', () => {
        it('returns a promise that resolves to a result indicating success', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            vi.spyOn(dinghyRacingModel, 'updateCompetitor').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateCompetitor(competitorChrisMarshall, 'Bill Withers');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true});
        });
    });
    describe('when an exisitng competitor is not provided', () => {
        it('returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateCompetitor(null, 'Bill Withers');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'An exisiting competitor to update is required.'});
        });
    });
    describe('when competitor new name is not provided', () => {
        it('returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateCompetitor(competitorChrisMarshall);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'A new name is required for the competitor.'});
        });
    });
});

describe('when creating a new fleet', () => {
    describe('when new fleet has not been assigned dinghy classes', () => {
        describe('when operation is successful', () => {
            it('returns a promise that resolves to a result indicating success', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'createFleet').mockImplementationOnce(() => {return Promise.resolve({success: true, domainObject: fleetHandicap})});
                const promise = dinghyRacingController.createFleet(fleetHandicap);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, domainObject: fleetHandicap});
            });
        });
        describe('when operation is unsuccessful', () => {
            it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'createFleet').mockImplementationOnce(() => {return Promise.resolve({success: false, message: 'Something went wrong'})});
                const promise = dinghyRacingController.createFleet(fleetHandicap);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({success: false, message: 'Something went wrong'});
            });
        });
    });
    describe('when new fleet has been assigned dinghy classes', () => {
        describe('when operation is successful', () => {
            it('returns a promise that resolves to a result indicating success', async () => {
                const fleetScorpionNoDinghyClasses = {...fleetScorpion, dinghyClasses: []};
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                vi.spyOn(dinghyRacingModel, 'createFleet').mockImplementationOnce(() => {return Promise.resolve({success: true, domainObject: fleetScorpion})});
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                const promise = dinghyRacingController.createFleet(fleetScorpion);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({success: true, domainObject: fleetScorpion});
            });
        });
        describe('when operation is unsuccessful', () => {
            it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'createFleet').mockImplementationOnce(() => {return Promise.resolve({success: false, message: 'Something went wrong'})});
                const promise = dinghyRacingController.createFleet(fleetScorpion);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({success: false, message: 'Something went wrong'});
            });
        });
    });
    describe('when fleet name is not provided', () => {
        it('returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': null});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'A name is required for a new fleet.'});
        });
    });
});

describe('when updating a fleet', () => {
    describe('when fleet has not been assigned dinghy classes', () => {
        describe('when operation is successful', () => {
            it('returns a promise that resolves to a result indicating success', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'updateFleet').mockImplementationOnce(() => {return Promise.resolve({success: true, domainObject: fleetHandicap})});
                const promise = dinghyRacingController.updateFleet(fleetHandicap);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, domainObject: fleetHandicap});
            });
        });
        describe('when operation is unsuccessful', () => {
            it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'updateFleet').mockImplementationOnce(() => {return Promise.resolve({success: false, message: 'Something went wrong'})});
                const promise = dinghyRacingController.updateFleet(fleetHandicap);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({success: false, message: 'Something went wrong'});
            });
        });
    });
    describe('when new fleet has been assigned dinghy classes', () => {
        describe('when operation is successful', () => {
            it('returns a promise that resolves to a result indicating success', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                vi.spyOn(dinghyRacingModel, 'updateFleet').mockImplementationOnce(() => {return Promise.resolve({success: true, domainObject: fleetScorpion})});
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                const promise = dinghyRacingController.updateFleet(fleetScorpion);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({success: true, domainObject: fleetScorpion});
            });
        });
        describe('when operation is unsuccessful', () => {
            it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
                vi.spyOn(dinghyRacingModel, 'updateFleet').mockImplementationOnce(() => {return Promise.resolve({success: false, message: 'Something went wrong'})});
                const promise = dinghyRacingController.updateFleet(fleetScorpion);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({success: false, message: 'Something went wrong'});
            });
        });
    });
    describe('when fleet name is not provided', () => {
        it('returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateFleet({...DinghyRacingModel.fleetTemplate(), 'name': null});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'A name is required for a fleet.'});
        });
    });
})

describe('when starting a race', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.startRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.startRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when race name is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.startRace({'name': null});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when race name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.startRace({'name': ''});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when race time is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.startRace({'name': 'Test Race', 'plannedStartTime': null});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating success when race name is \'\' and race time is null or undefined and a URL is provided', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.startRace({'name': '', 'plannedStartTime': null, 'url': 'http://localhost:8081/dinghyracing/api/races/4'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
});

describe('when adding a lap to an entry', () => {
    describe('when first lap', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const expectedResponse = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), 'number': 1, 'time': 1000}]};
            const addLapSpy = vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': expectedResponse})});
            const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234, 1000);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(addLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 1000);
            expect(result).toEqual({'success': true, 'domainObject': expectedResponse});
        });
    });
    describe('when second lap', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const entryChrisMarshallScorpionA1234WithLaps = {...entryChrisMarshallScorpionA1234, laps: [{number: 1, time: 1000}]}
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const expectedResponse = {...entryChrisMarshallScorpionA1234WithLaps, 'laps': [{...DinghyRacingModel.lapTemplate(), number: 1, time: 1000}, {number: 2, time: 2000}]};
            const addLapSpy = vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': expectedResponse})});
            const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234WithLaps, 3000);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(addLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234WithLaps, 2000);
            expect(result).toEqual({'success': true, 'domainObject': expectedResponse});
        });
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234, 1000);
        const result = await promise;
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.addLap(null, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A valid entry is required to add a lap time.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be a number; in milliseconds.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is not a number and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234, 'one thousand');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be a number; in milliseconds.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is zero and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234, 0);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be greater than zero.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is negative and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234, -1);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be greater than zero.'});
    });
});

describe('when removing a lap from an entry', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'removeLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.removeLap(entryChrisMarshallScorpionA1234, {...DinghyRacingModel.lapTemplate(), 'number': 1, 'time': 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'removeLap').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.removeLap(entryChrisMarshallScorpionA1234, {...DinghyRacingModel.lapTemplate(), 'number': 1, 'time': 1000});
        const result = await promise;
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'removeLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.removeLap(null, {...DinghyRacingModel.lapTemplate(), 'number': 1, 'time': 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A valid entry is required to remove a lap.'});
    });
    it('returns a promise that resolves to a result indicating failure when lap is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'removeLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.removeLap(entryChrisMarshallScorpionA1234, null);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A lap to remove is required.'});
    });
});

describe('when updating a lap for an entry', () => {
    it('accepts a positive numeric value greater than 0 and returns a promise that resolves to a result indicating success', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, 2000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('accepts a string integer > 0 and < 60 and returns a promise that resolves to a result indicating success', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, '43');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('accepts a string n:n where n is a string integer > 0 and less than 59 and returns a promise that resolves to a result indicating success', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, '23:43');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('accepts a string h:n:n where h is a string integer >= 0 and n is a string integer > 0 and less than 59 and returns a promise that resolves to a result indicating success', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, '999:1:1');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    describe('when passed a string time value', () => {
        it('correctly converts a seconds only value to milliseconds', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const updateLapSpy = vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
            dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, '47');
            
            expect(updateLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 47000);
        });
        it('correctly converts a minutes and seconds value to milliseconds', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const updateLapSpy = vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
            dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, '23:47');
            
            expect(updateLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 1427000);
        });
        it('correctly converts an hours, minutes and seconds value to milliseconds', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const updateLapSpy = vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
            dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, '1:23:47');
            
            expect(updateLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234, 5027000);
        });
    });
    it('converts a cumulative time to a time for the last lap', () => {
        const entryChrisMarshallScorpionA1234WithLaps = {...entryChrisMarshallScorpionA1234, laps: [{number: 1, time: 1000}, {number: 2, time: 1000}, {number: 3, time: 1000}]}; 
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const updateLapSpy = vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234WithLaps, '00:04');
        
        expect(updateLapSpy).toBeCalledWith(entryChrisMarshallScorpionA1234WithLaps, 2000);
    })
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, 2000);
        const result = await promise;
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(null, 2000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A valid entry is required to update a lap time.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be a number, in milliseconds, or a string value in the format [hh:][mm:]ss.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is not a number or a string in [[[h]h]h:][[m]m:][s]s and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, 'two thousand');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be a number, in milliseconds, or a string value in the format [hh:][mm:]ss.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is zero and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, 0);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be greater than zero.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is negative and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, -1);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be greater than zero.'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.downloadRaceResults(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result.success).toBe(true);
    });
    it('returns a promise that resolves to a result indicating failure when operation cannot retrieve entries for the race and provides a message indicating the cause of the failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(dinghyRacingModel, 'getEntriesByRace').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Unable to retrieve entries'})})
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.downloadRaceResults(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Unable to retrieve entries'});
    });
    it('calls downloadRaceEntriesCSV with options parameter passed in', async () => {
        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(),
            revokeObjectURL: vi.fn()
        });
        const downloadRaceEntriesCSVSpy = vi.spyOn(csvWriter, 'downloadRaceEntriesCSV');
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(dinghyRacingModel, 'getEntriesByRace').mockImplementation((race) => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.downloadRaceResults(raceScorpionA, {nameFormat: NameFormat.FIRSTNAMESURNAME});
        const result = await promise;
        expect(downloadRaceEntriesCSVSpy).toBeCalledWith(raceScorpionA, entriesScorpionA, {nameFormat: NameFormat.FIRSTNAMESURNAME});
        expect(promise).toBeInstanceOf(Promise);
        expect(result.success).toBe(true);
    })
});

describe('when race is postponed', () => {
    it('returns a promise that resolves to a result indicating success when race url is provided and operation is sucessful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4' && object.plannedStartTime instanceof Date) {
                return Promise.resolve({'success': true});
            }            
        });
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.postponeRace(raceScorpionA, 1800000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating success when race url null and race name and planned start time are provided and operation is sucessful', async () => {
        const raceNoURL = {...raceScorpionA, url: null};
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
        vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Wrong URL passed ${object.url}`});
            }
        });
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.postponeRace(raceNoURL, 1800000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating success when race url \'\' and race name and planned start time are provided and operation is sucessful', async () => {
        const raceNoURL = {...raceScorpionA, 'url': ''};
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
        vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4') {
                return Promise.resolve({'success': true});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Wrong URL passed ${object.url}`});
            }
        });
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.postponeRace(raceNoURL, 1800000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {
            return Promise.resolve({'success': false, 'message': `Update failed`});
        });
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.postponeRace(raceScorpionA, 1800000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Update failed'});
    });
    it('returns a promise that resolves to a result indicating failure when race url is null, and race name and race planned start date are not provided, and provides a message explaining the cause of failure', async () => {
        const raceNoURL = {'url': null};
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.postponeRace(raceNoURL, 1800000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when race url is \'\', and race name and race planned start date are not provided, and provides a message explaining the cause of failure', async () => {
        const raceNoURL = {'url': ''};
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.postponeRace(raceNoURL, 1800000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when race has laps recorded for an entry, and provides a message explaining the cause of failure', async () => {
        const raceScorpionAWithLaps = {...raceScorpionA, lapsSailed: 1};
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.postponeRace(raceScorpionAWithLaps, 1800000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Cannot postpone start after an entry has sailed a lap.'});
    });
});

describe('when setting a scoring abbreviation for an entry', () => {
    describe('when a 3 character value is passed for scoring abbreviation', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const expectedResponse = {...entryChrisMarshallScorpionA1234, 'scoringAttribute': 'DNS'};
            vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': expectedResponse})});
            const promise = dinghyRacingController.setScoringAbbreviation(entryChrisMarshallScorpionA1234, 'DNS');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': expectedResponse});
        });
    });
    describe('when an empty string is passed for scoring abbreviation', () => {
        it('calls model update with a null value for scoring abbreviation and returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const expectedResponse = {...entryChrisMarshallScorpionA1234, 'scoringAttribute': ''};
            const updateSpy = vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {return Promise.resolve({'success': true, 'domainObject': expectedResponse})});
            const promise = dinghyRacingController.setScoringAbbreviation(entryChrisMarshallScorpionA1234, '');
            const result = await promise;
            expect(updateSpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234.url, {'scoringAbbreviation': null});
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': expectedResponse});
        });
    });
    describe('when null is passed for scoring abbreviation', () => {
        it('calls model update with null value for scoring abbreviation and returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const expectedResponse = {...entryChrisMarshallScorpionA1234, 'scoringAttribute': null};
            const updateSpy = vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {return Promise.resolve({'success': true, 'domainObject': expectedResponse})});
            const promise = dinghyRacingController.setScoringAbbreviation(entryChrisMarshallScorpionA1234, '');
            const result = await promise;
            expect(updateSpy).toHaveBeenCalledWith(entryChrisMarshallScorpionA1234.url, {'scoringAbbreviation': null});
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': expectedResponse});
        });
    });

    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.setScoringAbbreviation(entryChrisMarshallScorpionA1234, 'DNS');
        const result = await promise;
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.setScoringAbbreviation(null, 'DNS');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A valid entry is required to set a scoring abbreviation.'});
    });
    it('returns a promise that resolves to a result indicating failure when scoring abbreviation is less than 3 characters and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.setScoringAbbreviation(entryChrisMarshallScorpionA1234, 'DN');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Scoring abbreviation must be 3 characters long.'});
    });
    it('returns a promise that resolves to a result indicating failure when scoring abbreviation is more than 3 characters and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.setScoringAbbreviation(entryChrisMarshallScorpionA1234, 'DNSF');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Scoring abbreviation must be 3 characters long.'});
    });
});

describe('when an entry has finished the race', () => {
    it('does not allow a new lap to be recorded for the entry', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const entryChrisMarshallScorpionA1234Finished = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), 'number': 1, 'time': 1000}], 'finishedRace': true};
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': entryChrisMarshallScorpionA1234Finished})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234Finished, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Cannot add a lap to an entry that has finished the race.'});
    })
});

describe('when an entry did not start the race', () => {
    it('does not allow a new lap to be recorded for the entry', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const entryChrisMarshallScorpionA1234DNS = {...entryChrisMarshallScorpionA1234, 'scoringAbbreviation': 'DNS'};
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': entryChrisMarshallScorpionA1234DNS})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234DNS, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Cannot add a lap to an entry that did not start the race.'});
    })
});

describe('when an entry has retired from the race', () => {
    it('does not allow a new lap to be recorded for the entry', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const entryChrisMarshallScorpionA1234RET = {...entryChrisMarshallScorpionA1234, 'scoringAbbreviation': 'RET'};
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': entryChrisMarshallScorpionA1234RET})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234RET, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Cannot add a lap to an entry that has retired from the race.'});
    })
});

describe('when an entry has been disqualified from the race', () => {
    it('does not allow a new lap to be recorded for the entry', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const entryChrisMarshallScorpionA1234DSQ = {...entryChrisMarshallScorpionA1234, 'scoringAbbreviation': 'DSQ'};
        vi.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': entryChrisMarshallScorpionA1234DSQ})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234DSQ, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Cannot add a lap to an entry that has been disqualified from the race.'});
    })
});

describe('when updating the planned laps for a race', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateRacePlannedLaps').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateRacePlannedLaps(raceScorpionA, 4);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateRacePlannedLaps').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.updateRacePlannedLaps(raceScorpionA, 4);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when race name is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateRacePlannedLaps').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateRacePlannedLaps({'name': null}, 4);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when race name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateRacePlannedLaps').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateRacePlannedLaps({'name': ''}, 4);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when race time is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateRacePlannedLaps').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.updateRacePlannedLaps({'name': 'Test Race', 'plannedStartTime': null}, 4);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating success when race name is \'\' and race time is null or undefined and a URL is provided', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        vi.spyOn(dinghyRacingModel, 'updateRacePlannedLaps').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateRacePlannedLaps({'name': '', 'plannedStartTime': null, 'url': 'http://localhost:8081/dinghyracing/api/races/4'}, 4);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    describe('when a non-integer value is provided for number of laps', () => {
        it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateRacePlannedLaps(raceScorpionA, 4.1);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide an integer value for the number of laps.'});
        });
    });    
    describe('when a string value is provided for number of laps', () => {
        it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateRacePlannedLaps(raceScorpionA, 'four');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide an integer value for the number of laps.'});
        });
    });
    describe('when no start sequence state is provided', () => {
        it('returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateRacePlannedLaps(raceScorpionA);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide an integer value for the number of laps.'});
        });
    });
});

describe('when updating the position of an entry in a race', () => {
    describe('when operation is successful', () => {
        it('returns a promise that resolves to a result indicating success', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            vi.spyOn(dinghyRacingModel, 'updateEntryPosition').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntryPosition(entryChrisMarshallScorpionA1234, 2);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true});
        });
    });
    describe('when race url is not provided', () => {
        it('returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntryPosition({...entryChrisMarshallScorpionA1234, race: {...raceScorpionA, url: undefined}}, 2);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'The race URL is required to update an entry position.'});
        });
    });
    describe('when an entry URL is not provided', () => {
        it('returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateEntryPosition({...entryChrisMarshallScorpionA1234, url: ''}, 2);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'An entry with a URL is required to update an entry position.'});
        });
    });
    describe('when new position is not provided', () => {
        it('returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.updateCompetitor(competitorChrisMarshall);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'A new name is required for the competitor.'});
        });
    });
});