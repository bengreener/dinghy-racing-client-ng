import DinghyRacingController from './dinghy-racing-controller.js';
import DinghyRacingModel from '../model/dinghy-racing-model.js';
import { rootURL } from '../model/__mocks__/test-data.js';

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

    })
    it('returns a promise that resolves to a result indicating failure when operation is unsuccessful and provides a message explaining the cause of failure', async () => {
        
    })
    it('returns a promise that resolves to a result indicating failure when name is null and provides a message explaining the cause of failure', async () => {
        
    });
    it('returns a promise that resolves to a result indicating failure when name is \'\' and provides a message explaining the cause of failure', async () => {
        
    });
})