import DinghyRacingModel from './dinghy-racing-model';
import { dinghyClassScorpionHAL } from './__mocks__/test-data';

global.fetch = jest.fn();

beforeEach(() => {
    fetch.mockClear();
});

describe('when creating a new dinghy class', () => {
    it('returns a promise that resolves to a result indicating success when dinghy class is created with http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({ 
                status: 200, 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const promise = DinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is created with http status 201', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({ 
                status: 201, 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const promise = DinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 400 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({ 
                status: 400, 
                json: () => Promise.resolve({'success': false, 'message': 'Bad request'})
            });
        });
        const promise = DinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Message: Bad request'}); 
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 404 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({ 
                status: 404, 
                json: () => Promise.resolve({'success': false, 'message': 'Not Found'})
            });
        });
        const promise = DinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Not Found'}); 
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 408 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({ 
                status: 408, 
                json: () => Promise.resolve({'success': false, 'message': 'Request Timeout'})
            });
        });
        const promise = DinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 408 Message: Request Timeout'}); 
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 409 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({ 
                status: 409, 
                json: () => Promise.resolve({'success': false, 'message': 'Conflict'})
            });
        });
        const promise = DinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 409 Message: Conflict'});
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 500 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({ 
                status: 500, 
                json: () => Promise.resolve({'success': false, 'message': 'Internal Server Error'})
            });
        });
        const promise = DinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Message: Internal Server Error'}); 
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 503 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({ 
                status: 503, 
                json: () => Promise.resolve({'success': false, 'message': 'Service Unavailable'})
            });
        });
        const promise = DinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Message: Service Unavailable'}); 
    })
});