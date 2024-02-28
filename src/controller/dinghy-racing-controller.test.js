import DinghyRacingController from './dinghy-racing-controller.js';
import DinghyRacingModel from '../model/dinghy-racing-model.js';
import { httpRootURL, wsRootURL, competitorChrisMarshall, dinghyClassScorpion, dinghy1234, raceScorpionA, entryChrisMarshallScorpionA1234, entriesScorpionA, competitorLouScrew } from '../model/__mocks__/test-data.js';

jest.mock('../model/dinghy-racing-model');

describe('when creating a new Dinghy Class', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'createDinghyClass').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
   it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'createDinghyClass').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
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

describe('when creating a new race', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'createRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.createRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'createRace').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
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
            jest.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true});
        });
        it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            jest.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
        });
        it('returns a promise that resolves to a result indicating failure when race name is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace({ 'name': null, 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
        });
        it('returns a promise that resolves to a result indicating failure when race name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace({ 'name': '', 'plannedStartTime': undefined, 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
        });
        it('returns a promise that resolves to a result indicating failure when no time is provided a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace({ 'name': 'Scorpion A', 'plannedStartTime': undefined, 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
        });
        it('returns a promise that resolves to a result indicating failure when helms name is null or undefined and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, {'name':undefined}, dinghy1234);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Please provide details for the helm.'});
        });
        it('returns a promise that resolves to a result indicating failure when helm name is \'\' and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const promise = dinghyRacingController.signupToRace(raceScorpionA, {'name':''}, dinghy1234);
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
    });
    describe('when entry includes a crew', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            jest.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
            const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true});
        });
        it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            jest.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
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

describe('when creating a new dinghy then', () => {
    it('when operation is successful returns a promise that resolves to a result indicating success', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.createDinghy(dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('when operation is unsuccessful returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy(dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('when sail number is not provided returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy({});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A sail number is required for a new dinghy.'});
    });
    it('when dinghy class is not provided returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy({'sailNumber': '1234'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A dinghy class is required for a new dinghy.'});
    });
    it('when dinghy class name is not provided returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
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
            jest.spyOn(dinghyRacingModel, 'createCompetitor').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
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
            expect(result).toEqual({'success': false, 'message': 'A name is required for a new competitor'});
        });
    });
});

describe('when starting a race', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.startRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.startRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when race name is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.startRace({'name': null});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when race name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.startRace({'name': ''});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when race time is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.startRace({'name': 'Test Race', 'plannedStartTime': null});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating success when race name is \'\' and race time is null or undefined and a URL is provided', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'startRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.startRace({'name': '', 'plannedStartTime': null, 'url': 'http://localhost:8081/dinghyracing/api/races/4'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
});

describe('when adding a lap to an entry', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const expectedResponse = {...entryChrisMarshallScorpionA1234, 'laps': [{...DinghyRacingModel.lapTemplate(), 'number': 1, 'time': 1000}]};
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': expectedResponse})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': expectedResponse});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234, 1000);
        const result = await promise;
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.addLap(null, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A valid entry is required to add a lap time.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be a number; in milliseconds.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is not a number and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234, 'one thousand');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be a number; in milliseconds.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is zero and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234, 0);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be greater than zero.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is negative and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
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
        jest.spyOn(dinghyRacingModel, 'removeLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.removeLap(entryChrisMarshallScorpionA1234, {...DinghyRacingModel.lapTemplate(), 'number': 1, 'time': 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'removeLap').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.removeLap(entryChrisMarshallScorpionA1234, {...DinghyRacingModel.lapTemplate(), 'number': 1, 'time': 1000});
        const result = await promise;
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'removeLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.removeLap(null, {...DinghyRacingModel.lapTemplate(), 'number': 1, 'time': 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A valid entry is required to remove a lap.'});
    });
    it('returns a promise that resolves to a result indicating failure when lap is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'removeLap').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.removeLap(entryChrisMarshallScorpionA1234, null);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A lap to remove is required.'});
    });
});

describe('when updating a lap for an entry', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, 2000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, 2000);
        const result = await promise;
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(null, 2000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A valid entry is required to update a lap time.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be a number; in milliseconds.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is not a number and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, 'two thousand');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be a number; in milliseconds.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is zero and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, 0);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be greater than zero.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is negative and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'updateLap').mockImplementationOnce((entry, time) => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.updateLap(entryChrisMarshallScorpionA1234, -1);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Time must be greater than zero.'});
    });
});

describe('when writing race entries to a CSV file', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        global.URL.createObjectURL = jest.fn(); // function does not exist in jsdom
        global.URL.revokeObjectURL = jest.fn(); // function does not exist in jsdom
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.downloadRaceResults(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result.success).toBe(true);
    });
    it('returns a promise that resolves to a result indicating failure when operation cannot retrieve entries for the race and provides a message indicating teh cause of the failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getEntriesByRace').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Unable to retrieve entries'})})
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.downloadRaceResults(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Unable to retrieve entries'});
    });
});

describe('when race is postponed', () => {
    it('returns a promise that resolves to a result indicating success when race url is provided and operation is sucessful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {
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
        jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {
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
        jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {
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
        jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {
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
});

describe('when setting a scoring abbreviation for an entry', () => {
    describe('when a 3 character value is passed for scoring abbreviation', () => {
        it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
            const expectedResponse = {...entryChrisMarshallScorpionA1234, 'scoringAttribute': 'DNS'};
            jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': expectedResponse})});
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
            const updateSpy = jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {return Promise.resolve({'success': true, 'domainObject': expectedResponse})});
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
            const updateSpy = jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce((resource, object) => {return Promise.resolve({'success': true, 'domainObject': expectedResponse})});
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
        jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.setScoringAbbreviation(entryChrisMarshallScorpionA1234, 'DNS');
        const result = await promise;
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when entry is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.setScoringAbbreviation(null, 'DNS');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A valid entry is required to set a scoring abbreviation.'});
    });
    it('returns a promise that resolves to a result indicating failure when scoring abbreviation is less than 3 characters and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.setScoringAbbreviation(entryChrisMarshallScorpionA1234, 'DN');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Scoring abbreviation must be 3 characters long.'});
    });
    it('returns a promise that resolves to a result indicating failure when scoring abbreviation is more than 3 characters and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'update').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
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
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': entryChrisMarshallScorpionA1234Finished})});
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
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': entryChrisMarshallScorpionA1234DNS})});
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
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': entryChrisMarshallScorpionA1234RET})});
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
        jest.spyOn(dinghyRacingModel, 'addLap').mockImplementationOnce((entry) => {return Promise.resolve({'success': true, 'domainObject': entryChrisMarshallScorpionA1234DSQ})});
        const promise = dinghyRacingController.addLap(entryChrisMarshallScorpionA1234DSQ, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Cannot add a lap to an entry that has been disqualified from the race.'});
    })
});