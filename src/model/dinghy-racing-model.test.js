import DinghyRacingModel from './dinghy-racing-model';
import { rootURL, dinghyClassScorpionHAL, raceScorpion_AHAL, dinghyClassScorpion } from './__mocks__/test-data';

global.fetch = jest.fn();

beforeEach(() => {
    fetch.mockClear();
});

describe('when creating a new object via REST', () => {
    it('Handles a situation where no body is returned', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            return Promise.resolve({
                ok: false,
                status: 400,
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.create('someobject', {'prop1': 'foo', 'prop2': 'bar'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Message: No additional information available'});
    });
})

describe('when creating a new instance of DinghyRacingModel', () => {
    it('requires a URL', () => {
        expect(() => {
            const dinghyRacingModel = new DinghyRacingModel();
        }).toThrow(Error);
    })
})

describe('when creating a new dinghy class', () => {
    it('returns a promise that resolves to a result indicating success when dinghy class is created with http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is created with http status 201', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 201, 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 400 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Message: Some error resulting in HTTP 400'}); 
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 404 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'}); 
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 408 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 408, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 408'}, 'message': 'Some error resulting in HTTP 408'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 408 Message: Some error resulting in HTTP 408'}); 
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 409 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 409 Message: Some error resulting in HTTP 409'});
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 500 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 500'}, 'message': 'Some error resulting in HTTP 500'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Message: Some error resulting in HTTP 500'}); 
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 503 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 503, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 503'}, 'message': 'Some error resulting in HTTP 503'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Message: Some error resulting in HTTP 503'}); 
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    })
});

describe('when searcing for a dinghy class by name', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy class when dinghy class is found and http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.getDinghyClassByName('Scorpion');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghyClassScorpion});
    })
    it('returns a promise that resolves to a result indicating failure when dinghy class is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.getDinghyClassByName('Scorpion');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Dinghy class not found'});
    })
})

describe('when creating a new race', () => {
    it('if a dinghy class URL is not supplied looks up dinghy class to get URL and returns a promise that resolves to a result indicating success when race is created with http status 200', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body !== '{"name":"Scorpion A","time":"2021-10-14T14:10:00.000Z","dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","plannedStartTime":"2021-10-14T14:10:00.000Z"}') {
                return Promise.resolve({
                    ok: false,
                    status: 400, 
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Data passed to fetch was not in format required to create a Race'}, 'message': 'Data passed to fetch was not in format required to create a Race'})
                });
            }
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(raceScorpion_AHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementationOnce(() => {return {'success': true, 'domainObject': dinghyClassScorpion}});
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(getDinghyClassByNameSpy).toHaveBeenCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    })
    it('if a dinghy class URL is supplied does not look up dinghy class to get URL and returns a promise that resolves to a result indicating success when race is created with http status 200', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body !== '{"name":"Scorpion A","time":"2021-10-14T14:10:00.000Z","dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","plannedStartTime":"2021-10-14T14:10:00.000Z"}') {
                return Promise.resolve({
                    ok: false,
                    status: 400, 
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Data passed to fetch was not in format required to create a Race'}, 'message': 'Data passed to fetch was not in format required to create a Race'})
                });
            }
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(raceScorpion_AHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementationOnce(() => {return {'success': true, 'domainObject': dinghyClassScorpion}});
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': dinghyClassScorpion});
        const result = await promise;
        expect(getDinghyClassByNameSpy).not.toHaveBeenCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    })
    it('returns a promise that resolves to a result indicating failure when race is created with http status 201', async () => {
        fetch.mockImplementationOnce((resource, options) => {// check format of data passed to fetch to reduce risk of false positive
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body !== '{"name":"Scorpion A","time":"2021-10-14T14:10:00.000Z","dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","plannedStartTime":"2021-10-14T14:10:00.000Z"}') {
                return Promise.resolve({
                    ok: false,
                    status: 400, 
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Data passed to fetch was not in format required to create a Race'}, 'message': 'Data passed to fetch was not in format required to create a Race'})
                });
            }
            return Promise.resolve({
                ok: true,
                status: 201, 
                json: () => Promise.resolve(raceScorpion_AHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementationOnce(() => {return {'success': true, 'domainObject': dinghyClassScorpion}});
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    })
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 400 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Message: Some error resulting in HTTP 400'}); 
    })
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 404 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'}); 
    })
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 408 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 408, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 408'}, 'message': 'Some error resulting in HTTP 408'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 408 Message: Some error resulting in HTTP 408'}); 
    })
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 409 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 409 Message: Some error resulting in HTTP 409'});
    })
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 500 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 500'}, 'message': 'Some error resulting in HTTP 500'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Message: Some error resulting in HTTP 500'}); 
    })
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 503 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 503, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 503'}, 'message': 'Some error resulting in HTTP 503'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Message: Some error resulting in HTTP 503'}); 
    })
    it('returns a promise that resolves to a result indicating failure when race is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    })
});