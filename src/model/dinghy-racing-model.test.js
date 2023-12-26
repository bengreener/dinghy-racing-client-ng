import DinghyRacingModel from './dinghy-racing-model';
import { Client } from '@stomp/stompjs';
import Clock from './domain-classes/clock';
import { httpRootURL, wsRootURL, competitorsCollectionHAL, 
    dinghiesCollectionHAL, dinghiesScorpionCollectionHAL, 
    dinghyClassCollectionHAL, dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghy1234HAL, raceScorpion_AHAL, 
    dinghyClasses, dinghyClassScorpion, dinghyClassGraduate, 
    dinghies, dinghiesScorpion, dinghy1234, dinghy6745,
    races, racesCollectionHAL, raceScorpionA, raceNoClassHAL, raceGraduateA, raceGraduate_AHAL,
    competitorsCollection, competitorChrisMarshall, competitorChrisMarshallHAL, entriesScorpionAHAL, entryChrisMarshallDinghy1234HAL, entriesScorpionA, competitorSarahPascal, raceNoClass, entryChrisMarshallScorpionA1234 } from './__mocks__/test-data';

global.fetch = jest.fn();
// jest.mock('@stomp/stompjs');

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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.read('unknown');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'});
    });
    it('returns a promise that resolves to a result indicating failure when an error causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.read('dinghyclasses?sort=name,asc');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
})

describe('when creating a new instance of DinghyRacingModel', () => {
    it('requires a URL for http calls', () => {
        expect(() => {
            const dinghyRacingModel = new DinghyRacingModel(null, 'someurl');
        }).toThrow(Error);
    });
    it('requires a URL for websocket calls', () => {
        expect(() => {
            const dinghyRacingModel = new DinghyRacingModel('someurl');
        }).toThrow(Error);
    });
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Message: Some error resulting in HTTP 503'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
            if(options.body !== '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","actualStartTime":null,"dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","duration":2700,"plannedLaps":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"url":""}') {
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, 'duration': 2700000});
        const result = await promise;
        expect(getDinghyClassByNameSpy).toHaveBeenCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('if a dinghy class URL is supplied does not look up dinghy class to get URL and returns a promise that resolves to a result indicating success when race is created with http status 200', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body !== '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","actualStartTime":null,"dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","duration":2700,"plannedLaps":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"url":""}') {
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': dinghyClassScorpion, 'duration': 2700000});
        const result = await promise;
        expect(getDinghyClassByNameSpy).not.toHaveBeenCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('returns a promise that resolves to a result indicating success when race is created with http status 201', async () => {
        fetch.mockImplementationOnce((resource, options) => {// check format of data passed to fetch to reduce risk of false positive
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body !== '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","actualStartTime":null,"dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","duration":2700,"plannedLaps":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"url":""}') {
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, 'duration': 2700000});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Message: Some error resulting in HTTP 503'}); 
    });
    it('returns a promise that resolves to a result indicating failure when race is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.read('unknown');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'});
    });
    it('returns a promise that resolves to a result indicating failure when an error causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghyClasses();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
});

// Can this test can be affected by BST, or other time zones (yes, if timezone changes test data (races) will need to be adjusted to reflect the change in the timezone (currently set up for British Summer Time))
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

    const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
    const promise = dinghyRacingModel.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'));
    const result = await promise;
    expect(promise).toBeInstanceOf(Promise);
    expect(result).toEqual({'success': true, 'domainObject': races});
});

describe('when signing up to a race', () => {
    // these tests can return a false positive if the logic makes a call to fetch but passes invalid argument as fetch mock does not check input
    it('if helm exists and URL provided and dinghy exist and URL provided then creates race entry', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
    it('if helm exists but URL not provided and dinghy exists and URL provided then creates race entry', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
   
    const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Message: Some error resulting in HTTP 503'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
});

describe('when creating a new dinghy', () => {
    it('when supplied dinghy class includes URL returns a promise that resolves to a result indicating success when dinghy is created', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);

        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', 'dinghyClass': dinghyClassScorpion});
        const result = await promise;

        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('when supplied dinghy class does not contain URL but dinghy class exists returns a promise that resolves to a result indicating success when dinghy is created', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));

        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        
        expect(getDinghyClassByNameSpy).toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
    });
    it('when supplied dinghy class does not contain URL and dinghy class does not exist returns a promise that resolves to a result indicating failure', async () => {        
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': false, 'message': 'Dinghy class does not exist.'}));

        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Not a Dinghy Class'}});
        const result = await promise;
        
        expect(getDinghyClassByNameSpy).toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Dinghy class does not exist.'});
    });
    it('returns a promise that resolves to a result indicating failure when request is rejected by REST service', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400, 
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', 'dinghyClass': dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Message: Some error resulting in HTTP 400'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', 'dinghyClass': dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
});

describe('when retrieving a list of dinghies', () => {
    it('when no dinghy class is supplied it returns a success result containing all dinghies', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(dinghiesCollectionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(dinghiesScorpionCollectionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(dinghyClassScorpionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass') {
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
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = model.getDinghies();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghies});
    });
    it('when a dinghy class is supplied it only returns a success result containing only dinghies for that dinghy class', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(dinghiesCollectionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(dinghiesScorpionCollectionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(dinghyClassScorpionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass') {
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
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = model.getDinghies(dinghyClassScorpion);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghiesScorpion});
    });
    it('when no dinghies are found for the supplied dinghy class it returns a failed result containing a message explaining the cause of the failure', async () =>{
        fetch.mockImplementation((resource) => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = model.getDinghies(dinghyClassScorpion);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'});
    });
});

it('provides a blank template for a competitor', () => {
    const competitor = DinghyRacingModel.competitorTemplate();

    expect(competitor).toEqual({'name': '', 'url': ''});
});

it('provides a blank template for a dinghy class', () => {
    const dinghyClass = DinghyRacingModel.dinghyClassTemplate();

    expect(dinghyClass).toEqual({'name': '', 'crewSize': 1, 'url': ''});
});

it('provides a blank template for a dinghy', () => {
    const dinghy = DinghyRacingModel.dinghyTemplate();

    expect(dinghy).toEqual({'sailNumber': '', 'dinghyClass': DinghyRacingModel.dinghyClassTemplate(), 'url': ''});
});

it('provides a blank template for a race', () => {
    const race = DinghyRacingModel.raceTemplate();

    expect(race).toEqual({'name': '', 'plannedStartTime': null, 'actualStartTime': null, 'dinghyClass': DinghyRacingModel.dinghyClassTemplate(), 'duration': 0, 'plannedLaps': null, 'lapForecast': null, 'lastLapTime': null, 'averageLapTime': null, 'clock': null, 'url': ''});
});

it('provides a blank template for a race entry', () => {
    const entry = DinghyRacingModel.entryTemplate();

    expect(entry).toEqual({'race': DinghyRacingModel.raceTemplate(), 'helm': DinghyRacingModel.competitorTemplate(), 'crew': null, 'dinghy': DinghyRacingModel.dinghyTemplate(), 'laps': [],'url': ''});
});

it('provides a blank template for a lap', () => {
    const lap = DinghyRacingModel.lapTemplate();

    expect(lap).toEqual({'number': null, 'time': 0});
})

describe('when searching for entries by race', () => {
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entriesScorpionAHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            }
            else if (url === 'http://localhost:8081/dinghyracing/api/entries/11/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorSarahPascal});
            }
            else {
                return Promise.resolve({'success': false, 'message': 'Unable to identify competitor.'});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy1234});
            }
            else if (url === 'http://localhost:8081/dinghyracing/api/entries/11/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy6745});
            }
            else {
                return Promise.resolve({'success': false, 'message': 'Unable to identify dinghy.'});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
        const promise = dinghyRacingModel.getEntriesByRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesScorpionA});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getEntriesByRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Resource not found'});
    });
    it('returns a promise that resolves to a result indicating failure when race does not have a URL', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getEntriesByRace({name: 'Test Race', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Cannot retrieve race entries without URL for race.'});
    });
});

describe('when a race is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the race when the race is found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(raceScorpion_AHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
        const promise = dinghyRacingModel.getRace(raceScorpionA.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': raceScorpionA});
    });
    // handicap races do not have a dinghy class set so a 404 when searcing for a dinghy class from race is an expected result
    it('returns a promise that resolves to a result indicating success and containing the race when the race is found but the dinghyClass is not found as the race is a handicap', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(raceNoClassHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'})});
        const promise = dinghyRacingModel.getRace(raceNoClass.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': raceNoClass});
    });
    it('returns a promise that resolves to a result indicating failure when race is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getRace(raceScorpionA.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'});
    });
    it('returns a promise that resolves to a result indicating success and containing the race when the race is found and lead entry is null', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(raceGraduate_AHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassGraduate})});
        const promise = dinghyRacingModel.getRace(raceGraduateA.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': raceGraduateA});
    })
});

describe('when a competitor is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the competitor when the competitor is found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getCompetitor(competitorChrisMarshall.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': competitorChrisMarshall});
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getCompetitor(competitorChrisMarshall.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'});
    });
});

describe('when a dinghy is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy when the dinghy is found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
        const promise = dinghyRacingModel.getDinghy(dinghy1234.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghy1234});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghy(dinghy1234.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'});
    });
});

describe('when a dinghy class is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy class when the dinghy class is found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghyClass(dinghyClassScorpion.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghyClassScorpion});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghyClass(dinghyClassScorpion.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'});
    });
});

describe('when updating an object via REST', () => {
    it('returns a promise that resolves to a success response when update is successful', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.update(httpRootURL, {});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result.success).toBeTruthy();
    });
    it('resturns a promise that resolves to a failed response and probviding the cause of failure when update is unsuccessful', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.update(httpRootURL, {});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: No additional information available'});
    });
});

describe('when starting a race', () => {
    describe('when a url is provided for race', () => {
        it('returns a promise that resolves to a success response when race is successfully started', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.startRace(raceScorpionA, new Date());
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result.success).toBeTruthy();
        });
        it('returns a promise that resolves to a result indicating failure when race start is rejected by REST service', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 404, 
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.startRace(raceScorpionA, new Date());
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: No additional information available'});
        });
    });
    describe('when a url is not provided for race', () => {
        it('retrieves race by name and planned start time then returns a promise that resolves to a success response when race is successfully started', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': {raceScorpionA}})});
            const promise = dinghyRacingModel.startRace({ 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion}, new Date());
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result.success).toBeTruthy();
        });
        it('returns a failure and advises reason for failure when race cannot be retrieved by name and planned start time', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
            const promise = dinghyRacingModel.startRace({ 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion}, new Date());
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
        });
    });
});

describe('when provided with a duration in ISO 8601 format', () => {
    it('converts pt12h13m17.08s to 43,997,080 milliseconds', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('pt12h13m17.08s');
        expect(result).toBe(43997080);
    });
    it('converts PT12H13M17,08S to 43,997,080 milliseconds', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT12H13M17,08S');
        expect(result).toBe(43997080);
    });
    it('converts +PT12H13M17.08S to 43,997,080 milliseconds', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('+PT12H13M17.08S');
        expect(result).toBe(43997080);
    });
    it('converts PT+12H13M17.08S to 43,997,080 milliseconds', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT+12H13M17.08S');
        expect(result).toBe(43997080);
    });
    it('converts PT12H+13M17.08S to 43,997,080 milliseconds', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT12H+13M17.08S');
        expect(result).toBe(43997080);
    });
    it('converts PT12H13M+17.08S to 43,997,080 milliseconds', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT12H13M+17.08S');
        expect(result).toBe(43997080);
    });
    it('converts PT23M to 1,380,000 milliseconds', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT23M');
        expect(result).toBe(1380000);
    });
    it('converts PT1H15M to 4,500,000 milliseconds', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT1H15M');
        expect(result).toBe(4500000);
    });
    it('throws error on -PT1H', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('-PT1H');
        }).toThrow(TypeError);
    });
    it('throws error on P1YT1H13M', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('P1YT1H13M');
        }).toThrow(TypeError);
    });
    it('throws error on P1DT12H13M', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('P1DT12H13M');
        }).toThrow(TypeError);
    });
    it('throws error on P1MT12H13M', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('P1MT12H13M');
        }).toThrow(TypeError);
    });
    it('throws error on P1WT12H13M', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('P1WT12H13M');
        }).toThrow(TypeError);
    });
    it('throws error on PT12H13', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('PT12H13');
        }).toThrow(TypeError);
    });
    it('throws error on PT12H13M12', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('PT12H13M12');
        }).toThrow(TypeError);
    });
    it('throws error on PT12', () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('PT12');
        }).toThrow(TypeError);
    });
});

describe('when adding a lap to a race', () => {
    it('returns a promise that resolves to a success response when lap is successfully added', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.addLap(entryChrisMarshallScorpionA1234, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result.success).toBeTruthy();
    });
    it('returns a promise that resolves to a result indicating failure when lap is rejected by REST service', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.addLap(entryChrisMarshallScorpionA1234, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: No additional information available'});
    });
});

describe('when removing a lap from a race', () => {
    it('returns a promise that resolves to a success response when lap is successfully removed', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.removeLap(entryChrisMarshallScorpionA1234, {...DinghyRacingModel.lapTemplate(),'number': 1, 'time': 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result.success).toBeTruthy();
    });
    it('returns a promise that resolves to a result indicating failure when lap removal is rejected by REST service', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.removeLap(entryChrisMarshallScorpionA1234, {...DinghyRacingModel.lapTemplate(),'number': 1, 'time': 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: No additional information available'});
    });
});

describe('when updating a lap from a race', () => {
    it('returns a promise that resolves to a success response when lap is successfully updated', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateLap(entryChrisMarshallScorpionA1234, 2000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result.success).toBeTruthy();
    });
    it('returns a promise that resolves to a result indicating failure when lap update is rejected by REST service', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateLap(entryChrisMarshallScorpionA1234, 2000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: No additional information available'});
    });
});

describe('when a websocket message callback has been set for entry update', () => {
    it('calls the callback', done => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        // create delay to give time for stomp mock to trigger callback
        setTimeout(() => {
            expect(callback).toBeCalled();
            done();
        }, 1);
    });
});

// Can this test can be affected by BST, or other time zones (yes, if timezone changes test data (races) will need to be adjusted to reflect the change in the timezone (currently set up for British Summer Time))
it('returns a collection of races that start between the specified times', async () => {
    fetch.mockImplementation((resource) => {
        if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
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

    const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
    const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'));
    const result = await promise;
    expect(promise).toBeInstanceOf(Promise);
    expect(result).toEqual({'success': true, 'domainObject': races});
});