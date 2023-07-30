import DinghyRacingModel from './dinghy-racing-model';
import { rootURL, competitorsCollectionHAL, dinghyClassCollectionHAL, dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghy1234HAL, raceScorpion_AHAL, 
    dinghyClasses, dinghyClassScorpion, dinghyClassGraduate, dinghy1234, 
    races, racesCollectionHAL, raceScorpionA, 
    competitorsCollection, competitorChrisMarshall, competitorChrisMarshallHAL, entryChrisMarshallDinghy1234HAL } from './__mocks__/test-data';

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

describe('when reading a resource from REST', () => {
    it('returns a promise that resolves to a result indicating success and containing the hal+json resource when http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghyClassCollectionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.read('dinghyclasses?sort=name,asc');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghyClassCollectionHAL});
    });
    it('returns a promise that resolves to a result indicating failure when resource is not found and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.read('unknown');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'});
    });
    it('returns a promise that resolves to a result indicating failure when an error causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.read('dinghyclasses?sort=name,asc');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
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
    });
    it('returns a promise that resolves to a result indicating success when dinghy class is created with http status 201', async () => {
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
    });
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
    });
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
    });
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
    });
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
    });
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
    });
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
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghyClass({'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
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
    });
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
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'});
    });
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
    });
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
    });
    it('returns a promise that resolves to a result indicating success when race is created with http status 201', async () => {
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
    });
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
    });
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
    });
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
    });
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
    });
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
    });
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
    });
    it('returns a promise that resolves to a result indicating failure when race is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(rootURL);
        const promise = dinghyRacingModel.createRace({'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
});

describe('when retrieving a list of dinghy classes', () => {
    it('returns a promise containing an array of Dinghy classes sorted by name', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghyClassCollectionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.getDinghyClasses();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghyClasses});
    });
    it('returns a promise that resolves to a result indicating failure when list of dinghy classes is not found and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.read('unknown');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'});
    });
    it('returns a promise that resolves to a result indicating failure when an error causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.getDinghyClasses();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
});

// Can this test can be affected by BST, or other time zones
it('returns a collection of races that start at or after the specified time', async () => {
    fetch.mockImplementation((resource) => {
        if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z') {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(racesCollectionHAL)
            });
        }
        if (resource === 'http://localhost:8081/dinghyracing/api/races/4/dinghyClass') {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        }
        if (resource === 'http://localhost:8081/dinghyracing/api/races/7/dinghyClass') {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghyClassGraduateHAL)
            });
        }
        else {
            return Promise.resolve({
                ok: false,
                status: 404
            });
        }
    });

    const dinghyRacingModel = new DinghyRacingModel(rootURL);
    const promise = dinghyRacingModel.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'));
    const result = await promise;
    expect(promise).toBeInstanceOf(Promise);
    expect(result).toEqual({'success': true, 'domainObject': races});
});

describe('when signing up to a race', () => {
    // these tests can return a false positive if the logic makes a call to fetch but passes invalid argument as fetch mock does not check input
    it('if competitor exists and URL provided and dinghy exist and URL provided then creates race entry', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        // spy on related model functions to head off calls to fetch and return required results
        const getCompetitorByNameSpy = jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall}));
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        const getDinghyBySailNumberAndDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(getCompetitorByNameSpy).not.toBeCalled();
        expect(getDinghyClassByNameSpy).not.toBeCalled();
        expect(getDinghyBySailNumberAndDinghyClassSpy).not.toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('if competitor exists but URL not provided and dinghy exists and URL provided then creates race entry', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        // spy on related model functions to head off calls to fetch and return required results
        const getCompetitorByNameSpy = jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall}));
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        const getDinghyBySailNumberAndDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const competitorChrisMarshall = {'name':'Chris Marshall'};
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(getCompetitorByNameSpy).toBeCalled();
        expect(getDinghyClassByNameSpy).not.toBeCalled();
        expect(getDinghyBySailNumberAndDinghyClassSpy).not.toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('if competitor exists and URL provided and dinghy exists but dinghy URL not provided but dinghy class url provided then creates race entry', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        // spy on related model functions to head off calls to fetch and return required results
        const getCompetitorByNameSpy = jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall}));
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        const getDinghyBySailNumberAndDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const dinghy1234 = {'sailNumber':'1234','dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}};
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(getCompetitorByNameSpy).not.toBeCalled();
        expect(getDinghyClassByNameSpy).not.toBeCalled();
        expect(getDinghyBySailNumberAndDinghyClassSpy).toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('if competitor exists and URL provided and dinghy exists but dinghy URL not provided and dinghy class url not provided then creates race entry', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        // spy on related model functions to head off calls to fetch and return required results
        const getCompetitorByNameSpy = jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall}));
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        const getDinghyBySailNumberAndDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const dinghy1234 = {'sailNumber':'1234','dinghyClass':{'name':'Scorpion'}};
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(getCompetitorByNameSpy).not.toBeCalled();
        expect(getDinghyClassByNameSpy).toBeCalled();
        expect(getDinghyBySailNumberAndDinghyClassSpy).toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('if competitor exists but URL not provided and dinghy exists but URL not provided but dinghy class url provided then creates race entry', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        // spy on related model functions to head off calls to fetch and return required results
        const getCompetitorByNameSpy = jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall}));
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        const getDinghyBySailNumberAndDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const competitorChrisMarshall = {'name':'Chris Marshall'};
        const dinghy1234 = {'sailNumber':'1234','dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}};
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(getCompetitorByNameSpy).toBeCalled();
        expect(getDinghyClassByNameSpy).not.toBeCalled();
        expect(getDinghyBySailNumberAndDinghyClassSpy).toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('if competitor exists but URL not provided and dinghy exists but URL not provided and dinghy class url not provided then creates race entry', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        // spy on related model functions to head off calls to fetch and return required results
        const getCompetitorByNameSpy = jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall}));
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        const getDinghyBySailNumberAndDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const competitorChrisMarshall = {'name':'Chris Marshall'};
        const dinghy1234 = {'sailNumber':'1234','dinghyClass':{'name':'Scorpion'}};
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(getCompetitorByNameSpy).toBeCalled();
        expect(getDinghyClassByNameSpy).toBeCalled();
        expect(getDinghyBySailNumberAndDinghyClassSpy).toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('if competitor does not exist does not create entry and provides message indicating cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        // spy on related model functions to head off calls to fetch and return required results
        const getCompetitorByNameSpy = jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation(() => Promise.resolve({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'}));
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        const getDinghyBySailNumberAndDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const competitorChrisMarshall = {'name':'Chris Marshall'};
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(getCompetitorByNameSpy).toBeCalled();
        expect(getDinghyClassByNameSpy).not.toBeCalled();
        expect(getDinghyBySailNumberAndDinghyClassSpy).not.toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'});
    });
    it('if dinghy does not exist does not create entry and provides message indicating cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        // spy on related model functions to head off calls to fetch and return required results
        const getCompetitorByNameSpy = jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall}));
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        const getDinghyBySailNumberAndDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'}));
        const dinghy1234 = {'sailNumber':'1234','dinghyClass':{'name':'Scorpion'}};
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(getCompetitorByNameSpy).not.toBeCalled();
        expect(getDinghyClassByNameSpy).toBeCalled();
        expect(getDinghyBySailNumberAndDinghyClassSpy).toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'});
    });
    it('if neither competitor or dinghy exist does not create entry and provides message indicating cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        // spy on related model functions to head off calls to fetch and return required results
        const getCompetitorByNameSpy = jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation(() => Promise.resolve({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'}));
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        const getDinghyBySailNumberAndDinghyClassSpy = jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'}));
        const competitorChrisMarshall = {'name':'Chris Marshall'};
        const dinghy1234 = {'sailNumber':'1234','dinghyClass':{'name':'Scorpion'}};
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(getCompetitorByNameSpy).toBeCalled();
        expect(getDinghyClassByNameSpy).toBeCalled();
        expect(getDinghyBySailNumberAndDinghyClassSpy).toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found\nHTTP Error: 404 Message: Resource not found'});
    });
});

it('returns a collection of competitors', async () => {
    fetch.mockImplementationOnce(() => {
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(competitorsCollectionHAL)
        })
    })
   
    const dinghyRacingModel = new DinghyRacingModel(rootURL);
    const promise = dinghyRacingModel.getCompetitors();
    const result = await promise;
    expect(promise).toBeInstanceOf(Promise);
    expect(result).toEqual({'success': true, 'domainObject': competitorsCollection});
});

describe('when searching for a competitor by name', () => {
    it('returns a promise that resolves to a result indicating success and containing the competitor when competitor is found and http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.getCompetitorByName('Chris Marshall');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': competitorChrisMarshall});
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.getCompetitorByName('Bob Smith');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'});
    });
});

describe('when searching for a dinghy by sail number and dinghy class', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy when dinghy is found and http status 200', async () => {
        // this test can return a false positive if the logic makes a call to fetch but passes invalid argument as fetch mock does not check input
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.getDinghyBySailNumberAndDinghyClass('1234', dinghyClassScorpion);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghy1234});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.getDinghyBySailNumberAndDinghyClass('999', dinghyClassScorpion);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'});
    });
});

describe('when creating a new competitor', () => {
    it('returns a promise that resolves to a result indicating success when competitor is created with http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createCompetitor({'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating success when competitor is created with http status 201', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 201, 
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createCompetitor({'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 400 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createCompetitor({'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Message: Some error resulting in HTTP 400'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 404 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createCompetitor({'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 408 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 408, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 408'}, 'message': 'Some error resulting in HTTP 408'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createCompetitor({'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 408 Message: Some error resulting in HTTP 408'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 409 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createCompetitor({'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 409 Message: Some error resulting in HTTP 409'});
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 500 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 500'}, 'message': 'Some error resulting in HTTP 500'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createCompetitor({'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Message: Some error resulting in HTTP 500'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 503 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 503, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 503'}, 'message': 'Some error resulting in HTTP 503'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createCompetitor({'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Message: Some error resulting in HTTP 503'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createCompetitor({'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
});

describe('when creating a new dinghy', () => {
    it('returns a promise that resolves to a result indicating success when dinghy is created with http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating success when dinghy is created with http status 201', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 201, 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not created with http status 400 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Message: Some error resulting in HTTP 400'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not created with http status 404 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not created with http status 408 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 408, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 408'}, 'message': 'Some error resulting in HTTP 408'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 408 Message: Some error resulting in HTTP 408'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not created with http status 409 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 409 Message: Some error resulting in HTTP 409'});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not created with http status 500 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 500'}, 'message': 'Some error resulting in HTTP 500'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Message: Some error resulting in HTTP 500'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not created with http status 503 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 503, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 503'}, 'message': 'Some error resulting in HTTP 503'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Message: Some error resulting in HTTP 503'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel('https://host:8080/dinghyracing/api');
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
});