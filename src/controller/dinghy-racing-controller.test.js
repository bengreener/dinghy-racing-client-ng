import DinghyRacingController from './dinghy-racing-controller.js';
import DinghyRacingModel from '../model/dinghy-racing-model.js';
import { rootURL, competitorChrisMarshall, dinghyClassScorpion, dinghy1234, raceScorpionA } from '../model/__mocks__/test-data.js';

jest.mock('../model/dinghy-racing-model');

describe('when creating a new Dinghy Class', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'createDinghyClass').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
   it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'createDinghyClass').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    })
    it('returns a promise that resolves to a result indicating failure when name is null and provides a message explaining the cause of failure', async () => {
        const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(rootURL));
        const promise = dinghyRacingController.createDinghyClass({'name': null});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A name is required for a new dinghy class.'});
    });
    it('returns a promise that resolves to a result indicating failure when name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(rootURL));
        const promise = dinghyRacingController.createDinghyClass({'name': ''});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A name is required for a new dinghy class.'});
    });
})

describe('when creating a new race', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'createRace').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.createRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const createDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'createRace').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('returns a promise that resolves to a result indicating failure when name is null and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.createRace({'name': null, 'time': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {'name': 'Scorpion', 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A name is required for a new race.'});
    });
    it('returns a promise that resolves to a result indicating failure when name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.createRace({'name': '', 'time': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {'name': 'Scorpion', 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A name is required for a new race.'});
    });
    it('returns a promise that resolves to a result indicating failure when time is not a valid time and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.createRace({'name': 'Scorpion A', 'time': '2022-12-14 10:20', 'dinghyClass': {'name': 'Scorpion', 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A time is required for a new race.'});
    });
})

describe('when signing up to a race', () => {
    it('returns a promise that resolves to a result indicating success when operation is successful', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    })
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createEntry').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    })
    it('returns a promise that resolves to a result indicating failure when race name is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.signupToRace({ 'name': null, 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when race name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.signupToRace({ 'name': '', 'time': undefined, 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when no time is provided a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.signupToRace({ 'name': 'Scorpion A', 'time': undefined, 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' }, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details of the race.'});
    });
    it('returns a promise that resolves to a result indicating failure when competitors name is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.signupToRace(raceScorpionA, {'name':undefined}, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details for the competitor.'});
    });
    it('returns a promise that resolves to a result indicating failure when competitora name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.signupToRace(raceScorpionA, {'name':''}, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details for the competitor.'});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy sail number is null or undefined and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':null,'dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy sail number is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':'','dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class name is not provided and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':'','dinghyClass':{'name':null},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class name is \'\' and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        const promise = dinghyRacingController.signupToRace(raceScorpionA, competitorChrisMarshall, {'sailNumber':'','dinghyClass':{'name':''},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Please provide details for the dinghy.'});
    });
})

describe('when creating a new dinghy then', () => {
    it('when operation is successful returns a promise that resolves to a result indicating success', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': true})});
        const promise = dinghyRacingController.createDinghy(dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('when operation is unsuccessful returns a promise that resolves to a result indicating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy(dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
    });
    it('when sail number is not provided returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy({});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A sail number is required for a new dinghy.'});
    });
    it('when dinghy class is not provided returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy({'sailNumber': '1234'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A dinghy class is required for a new dinghy.'});
    });
    it('when dinghy class name is not provided returns a promise that resolves to a result inficating failure and provides a message explaining the cause of failure', async () => {
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const dinghyRacingController = new DinghyRacingController(dinghyRacingModel);
        jest.spyOn(dinghyRacingModel, 'createDinghy').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
        const promise = dinghyRacingController.createDinghy({'sailNumber': '1234', 'dinghyClass': {'name': ''}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'A dinghy class is required for a new dinghy.'});
    });
})