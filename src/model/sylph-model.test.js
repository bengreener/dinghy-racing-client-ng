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

import { describe, expect } from 'vitest';
import SylphModel, { SortOrder }  from './sylph-model';
import Clock from './clock';
import Collection from './collection';
import Competitor from './competitor';
import Crew from './crew';
import Dinghy from './dinghy';
import DinghyClass from './dinghy-class';
import Entry from './entry';
import FlagState from './flag-state';
import Fleet from './fleet';
import Lap from './lap';
import Metadata from './metadata';
import Race from './race';
import RaceType from './race-type';
import SignedUp from './signed-up';
import StartType from './start-type';
import { httpRootURL, wsRootURL, competitorsCollectionHAL, 
    dinghyClassCollectionHAL, 
    dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassCometHAL, 
    dinghy1234HAL, dinghy2726HAL, dinghy6745HAL, dinghy2928HAL, dinghy826HAL,
    dinghiesCollectionHAL,
    fleetScorpionHAL, fleetHandicapHAL, fleetGraduateHAL, fleetCometHAL,
    fleetsCollectionHAL, 
    raceScorpionAHAL, raceGraduateAHAL, raceHandicapAHAL, raceCometAHAL,
    dinghyScorpion1234CrewAHAL, dinghyScorpion1234CrewBHAL, dinghyScorpion1234CrewsHAL,
    racesCollectionHAL,
    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, competitorLiuBaoHAL, competitorLouScrewHAL, competitorOwainDaviesHAL,
    entryChrisMarshall1234ScorpionAHAL, entrySarahPascal6745ScorpionAHAL,
    entriesScorpionAHAL,
    racePursuitAHAL,
    signedUpChrisMarshallDinghy1234ScorpionAHAL, signedUpSarahPascalDinghy6745ScorpionAHAL,
    signedUpScorpionACollectionHAL,
    lap1HAL, lap4HAL
} from './__mocks__/test-data';

global.fetch = vi.fn();
vi.mock('./clock');
vi.mock('@stomp/stompjs');

beforeEach(() => {
    fetch.mockClear();
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.restoreAllMocks();
});

afterEach(() => {
    // vi.runOnlyPendingTimers();
    vi.useRealTimers();
})

describe('when creating a new object via REST', () => {
    it('calls fetch with correct body and headers', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const fetchMock = fetch.mockImplementation((resource, options) => {
            return Promise.resolve({
                ok: true,
                status: 201,
                statusText: 'Created',
                headers: new Headers(),
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        model._create(httpRootURL + '/collection', {prop1: 'foo', prop2: 'bar'});
        expect(fetchMock).toHaveBeenCalledWith(httpRootURL + '/collection', 
            {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, 'body': JSON.stringify({prop1: 'foo', prop2: 'bar'})}
        );
    });
    it('Handles a situation where no body is returned', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        fetch.mockImplementation((resource, options) => {
            return Promise.resolve({
                ok: true,
                status: 201,
                statusText: 'Created',
                headers: new Headers(),
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model._create('someobject', {'prop1': 'foo', 'prop2': 'bar'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: {}, metadata: new Metadata('')});
    });
});

describe('when reading a resource from REST', () => {
    it('returns a promise that resolves to a result indicating success and containing the hal+json resource when http status 200', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers([['ETag', '"48"']]),
                json: () => Promise.resolve(dinghyClassCollectionHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model._read('dinghyClasses?sort=name,asc');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: dinghyClassCollectionHAL, metadata: {version: '"48"'}});
    });
    it('throws an error containing any message returned by server when requested resource is not found', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({message: 'Some error resulting in HTTP 404'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model._read('unknown')).rejects.toThrowError('Some error resulting in HTTP 404');
    });
    it('throws an error when an error causes fetch to reject; such as a network failure', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        fetch.mockImplementation(
            () => {
            throw new TypeError('Failed to fetch');
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model._read('dinghyClasses?sort=name,asc')).rejects.toThrowError('Failed to fetch');
    });
});

describe('when updating an object via REST', () => {
    it('calls fetch with correct body and headers', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const fetchMock = fetch.mockImplementation((resource, options) => {
            return Promise.resolve({
                ok: true,
                status: 201,
                statusText: 'Created',
                headers: new Headers(),
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        model._update(httpRootURL + '/collection', {prop1: 'foo', prop2: 'bar'});
        expect(fetchMock).toHaveBeenCalledWith(httpRootURL + '/collection', 
            {method: 'PATCH', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, 'body': JSON.stringify({prop1: 'foo', prop2: 'bar'})}
        );
    });
    it('returns a promise that resolves to a FetchResult cntaining the data returned fro the server when update is successful', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model._update(httpRootURL, {});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: competitorChrisMarshallHAL, metadata: {version: ''}});
    });
    it('throws an error when update is unsuccessful', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500, 
                statusText: 'Internal Server Error',
                json: () => Promise.resolve({message: 'Some error resulting in HTTP 500'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model._update(httpRootURL, {})).rejects.toThrowError('Some error resulting in HTTP 500');
    });
});

describe('when deleting an object via REST', () => {
    it('calls fetch with correct body and headers', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const fetchMock = fetch.mockImplementation((resource, options) => {
            return Promise.resolve({
                ok: true,
                status: 204,
                statusText: 'No Content',
                headers: new Headers(),
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        model._delete(httpRootURL + '/collection/1');
        expect(fetchMock).toHaveBeenCalledWith(httpRootURL + '/collection/1', 
            {method: 'DELETE'}
        );
    });
    it('returns a promise that resolves to a FetchResult containing any data returned by the server when deletion is successful', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        fetch.mockImplementationOnce((resource, options) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/entries/6' && options.method === 'DELETE') {
                return Promise.resolve({
                    ok: true,
                    status: 204,
                    statusText: 'No Content',
                    headers: new Headers(),
                    json: () => {throw new SyntaxError('Unexpected end of JSON input')}
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model._delete('http://localhost:8081/dinghyracing/api/entries/6');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: {}, metadata: {version: ''}});
    });
    it('throws an error when deletion is unsuccessful', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({message: 'Some error resulting in HTTP 404'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model._delete('http://localhost:8081/dinghyracing/api/entries/6')).rejects.toThrowError('Some error resulting in HTTP 404');
    });
});

describe('when creating a new instance of SylphModel', () => {
    it('requires a URL for http calls', () => {
        expect(() => {
            const model = new SylphModel(null, 'someurl');
        }).toThrow(Error);
    });
    it('requires a URL for websocket calls', () => {
        expect(() => {
            const model = new SylphModel('someurl');
        }).toThrow(Error);
    });
});

describe('when creating a new dinghy class', () => {
    it('returns a promise that resolves to the new DinghyClass when create is successful', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.createDinghyClass('Scorpion', 2, 1043, 'SCORPION');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: dinghyClassScorpionHAL, metadata: {version: ''}, model: model});
    });
    describe('when an external name is not provided', () => {
        it('returns a promise that resolves to the new DinghyClass when create is successful', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve({...dinghyClassScorpionHAL, externaName: null})
                });
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const promise = model.createDinghyClass('Scorpion', 2, 1043);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({hal: {...dinghyClassScorpionHAL, externaName: null}, metadata: {version: ''}, model: model});
        });
    });
    it('throws an error when dinghy class is not created and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409,
                statusText: 'Conflict',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.createDinghyClass('Scorpion', 2, 1043, 'SCORPION')).rejects.toThrowError('Some error resulting in HTTP 409');
    });
});

describe('when searching for a dinghy class by name', () => {
    it('returns a promise that resolves to the requested DinghyClass', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers([['ETag', '"0"']]), 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getDinghyClassByName('Scorpion');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: dinghyClassScorpionHAL, metadata: {version: '"0"'}, model});
    });
    it('throws an error when dinghy class is not found', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => {throw new SyntaxError('Unexpected end of JSON input')},
                text: () => {return ''}
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getDinghyClassByName('Scorpion')).rejects.toThrowError();
    });
})

describe('when creating a new race', () => {
    it('calls fetch with correct body and headers', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const fetchMock = fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 201,
                statusText: 'Created',
                headers: new Headers(),
                json: () => {throw new SyntaxError('Unexpected end of JSON input')},
                text: () => Promise.resolve(''),
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        model.createRace('Scorpion A', new Date('2021-10-14T14:10:00.000Z'), new Fleet(fleetScorpionHAL, {version: '"0"'}, model), 2700000, 5, 'FLEET', 'CSCCLUBSTART');
        expect(fetchMock).toHaveBeenCalledWith(httpRootURL + '/directRaces', 
            {
                method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, 
                'body': JSON.stringify({name: 'Scorpion A', plannedStartTime: new Date('2021-10-14T14:10:00.000Z'), fleet: fleetScorpionHAL._links.self.href, 
                duration: 2700, plannedLaps: 5, type: 'FLEET', startType: 'CSCCLUBSTART'})
            }
        );
    });
    it('returns a promise that resolves to the new Race when race is successfully created', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
                json: () => Promise.resolve(raceScorpionAHAL),
                text: () => Promise.resolve(''),
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.createRace('Scorpion A', new Date('2021-10-14T14:10:00.000Z'), new Fleet(fleetScorpionHAL, {version: '"0"'}, model), 2700000, 5, 'FLEET', 'CSCCLUBSTART');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: raceScorpionAHAL, metadata: {version: ''}, model});
    });
    it('throws an error when race is not created', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409,
                statusText: 'Conflict',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'}),
                
                text: () => Promise.resolve('Some error resulting in HTTP 409'),
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.createRace('Scorpion A', new Date('2021-10-14T14:10:00.000Z'), new Fleet(fleetScorpionHAL, {version: '"0"'}, model), 2700000, 5, 'FLEET', 'CSCCLUBSTART')).rejects.toThrowError('Some error resulting in HTTP 409'); 
    });
});

describe('when retrieving a list of dinghy classes', () => {
    it('returns a promise that resolves to a collection of of Dinghy classes', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === dinghyClassCollectionHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghyClassCollectionHAL)
                });
            }
            if (resource === dinghyClassScorpionHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"1"']]), 
                    json: () => Promise.resolve(dinghyClassScorpionHAL)
                });
            }
            if (resource === dinghyClassGraduateHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(dinghyClassGraduateHAL)
                });
            }
            if (resource === dinghyClassCometHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(dinghyClassCometHAL)
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getDinghyClasses();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Collection([
            {hal: dinghyClassScorpionHAL, metadata: {version: '"1"'}}, 
            {hal: dinghyClassGraduateHAL, metadata: {version: '"0"'}}, 
            {hal: dinghyClassScorpionHAL, metadata: {version: '"0"'}}
        ], {size: 20, totalElements: 3, totalPages: 1, number: 0}));
    });
    describe('when there are more dinghy classes available than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('retrieves and returns complete list of dinghy classes', async () => {
                const dinghyClassCollectionHAL_p0 = {
                    '_embedded' : { 'dinghyClasses' : [ dinghyClassScorpionHAL, dinghyClassGraduateHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyClasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation((resource) => {
                    if (resource === dinghyClassCollectionHAL._links.self.href + '?page=0&size=3') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghyClassCollectionHAL)
                        });
                    }
                    if (resource === dinghyClassScorpionHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(dinghyClassScorpionHAL)
                        });
                    }
                    if (resource === dinghyClassGraduateHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(dinghyClassGraduateHAL)
                        });
                    }
                    if (resource === dinghyClassCometHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(dinghyClassCometHAL)
                        });
                    }
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(),
                        json: () => Promise.resolve(dinghyClassCollectionHAL_p0)
                    });
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getDinghyClasses();
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: dinghyClassScorpionHAL, metadata: {version: '"1"'}}, 
                    {hal: dinghyClassGraduateHAL, metadata: {version: '"0"'}}, 
                    {hal: dinghyClassScorpionHAL, metadata: {version: '"0"'}}
                ], {size: 20, totalElements: 3, totalPages: 1, number: 0}));
            });
        });
        describe('when page number supplied', () => {
            it('returns only a single page of data', async () => {
                const dinghyClassCollectionHAL_p0 = {
                    '_embedded' : { 'dinghyClasses' : [ dinghyClassScorpionHAL, dinghyClassGraduateHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyClasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation((resource) => {
                    if (resource === dinghyClassScorpionHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(dinghyClassScorpionHAL)
                        });
                    }
                    if (resource === dinghyClassGraduateHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(dinghyClassGraduateHAL)
                        });
                    }
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL_p0)
                    });
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getDinghyClasses(1);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: dinghyClassScorpionHAL, metadata: {version: '"1"'}}, 
                    {hal: dinghyClassGraduateHAL, metadata: {version: '"0"'}}
                ], {size: 2, totalElements: 3, totalPages: 2, number: 0}));
            });
        });
        describe('when size supplied', () => {
            it('returns only a single page of data', async () => {
                const dinghyClassCollectionHAL_p0 = {
                    '_embedded' : { 'dinghyClasses' : [ dinghyClassScorpionHAL, dinghyClassGraduateHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyClasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation((resource) => {
                    if (resource === dinghyClassScorpionHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(dinghyClassScorpionHAL)
                        });
                    }
                    if (resource === dinghyClassGraduateHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(dinghyClassGraduateHAL)
                        });
                    }
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL_p0)
                    });
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getDinghyClasses(null, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: dinghyClassScorpionHAL, metadata: {version: '"1"'}}, 
                    {hal: dinghyClassGraduateHAL, metadata: {version: '"0"'}}
                ], {size: 2, totalElements: 3, totalPages: 2, number: 0}));
            });
        });
        describe('when page and size supplied', () => {
            it('returns only a single page of data', async () => {
                const dinghyClassCollectionHAL_p0 = {
                    '_embedded' : { 'dinghyClasses' : [ dinghyClassScorpionHAL, dinghyClassGraduateHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyClasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation((resource) => {
                    if (resource === dinghyClassScorpionHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(dinghyClassScorpionHAL)
                        });
                    }
                    if (resource === dinghyClassGraduateHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(dinghyClassGraduateHAL)
                        });
                    }
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL_p0)
                    });
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getDinghyClasses(0, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: dinghyClassScorpionHAL, metadata: {version: '"1"'}}, 
                    {hal: dinghyClassGraduateHAL, metadata: {version: '"0"'}}
                ], {size: 2, totalElements: 3, totalPages: 2, number: 0}));
            });
        });
    });
    it('throws an error when there is a problem retrieving the list of dinghy classes', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'internal Server Error',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'}),
                text: () => Promise.resolve(() => {'Some error resulting in http 500'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getDinghyClasses('Some error resulting in http 500'));
    });
    it('returns a promise that resolves to a result indicating failure when an error causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementation(() => {
            throw new TypeError('Failed to fetch');
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getDinghyClasses('Failed to fetch'));
    });
});

describe('when retrieving a list of races that start at or after a specified time', () => {
    // Can this test can be affected by BST, or other time zones (yes, if timezone changes test data (races) will need to be adjusted to reflect the change in the timezone (currently set up for British Summer Time))
    it('returns a promise that resolves to a collection of races that start at or after the specified time', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=2021-10-14T10:00:00.000Z') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(racesCollectionHAL)
                });
            }
            if (resource === raceScorpionAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"1"']]), 
                    json: () => Promise.resolve(raceScorpionAHAL)
                });
            }
            if (resource === raceGraduateAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(raceGraduateAHAL)
                });
            }
            if (resource === raceCometAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(raceCometAHAL)
                });
            }
            if (resource === raceHandicapAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(raceHandicapAHAL)
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getRacesOnOrAfterTime(new Date('2021-10-14T10:00:00.000Z'));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Collection([
            {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
            {hal: raceGraduateAHAL, metadata: {version: '"0"'}}, 
            {hal: raceCometAHAL, metadata: {version: '"0"'}}, 
            {hal: raceHandicapAHAL, metadata: {version: '"0"'}}
        ], {size:20,totalElements:4,totalPages:1,number:0}));
    });
    describe('when there are more races than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('returns a success result containing all the races that start at or after the specified time', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'directRaces':[raceScorpionAHAL, raceGraduateAHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === raceScorpionAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(raceScorpionAHAL)
                        });
                    }
                    if (resource === raceGraduateAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceGraduateAHAL)
                        });
                    }
                    if (resource === raceCometAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceCometAHAL)
                        });
                    }
                    if (resource === raceHandicapAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceHandicapAHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL_p0)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'));
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
                    {hal: raceGraduateAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceCometAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceHandicapAHAL, metadata: {version: '"0"'}}
                ], {size:20,totalElements:4,totalPages:1,number:0}));
            });
        });
        describe('when page number supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'directRaces':[raceScorpionAHAL, raceGraduateAHAL]},
                    '_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},
                    'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === raceScorpionAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(raceScorpionAHAL)
                        });
                    }
                    if (resource === raceGraduateAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceGraduateAHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL_p0)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'), 0);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
                    {hal: raceGraduateAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceCometAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceHandicapAHAL, metadata: {version: '"0"'}}
                ], {'size':2,'totalElements':4,'totalPages':1,'number':0}));
            });
        });
        describe('when size is supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'directRaces':[raceScorpionAHAL, raceGraduateAHAL]},
                    '_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},
                    'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === raceScorpionAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(raceScorpionAHAL)
                        });
                    }
                    if (resource === raceGraduateAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceGraduateAHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL_p0)
                        });
                    }
                });
        
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'), null, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
                    {hal: raceGraduateAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceCometAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceHandicapAHAL, metadata: {version: '"0"'}}
                ], {'size':2,'totalElements':4,'totalPages':1,'number':0}));
            });
        });
        describe('when page and size supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'directRaces':[raceScorpionAHAL, raceGraduateAHAL]},
                    '_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},
                    'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === raceScorpionAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(raceScorpionAHAL)
                        });
                    }
                    if (resource === raceGraduateAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceGraduateAHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL_p0)
                        });
                    }
                });
        
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'), 0, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
                    {hal: raceGraduateAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceCometAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceHandicapAHAL, metadata: {version: '"0"'}}
                ], {'size':2,'totalElements':4,'totalPages':1,'number':0}));
            });
        });
    });
});

describe('when retrieving a list of races that start between the specified times', () => {
    // Can this test can be affected by BST, or other time zones (yes, if timezone changes test data (races) will need to be adjusted to reflect the change in the timezone (currently set up for British Summer Time))
    it('returns a promise that resolves to a collection of races that start between the specified times', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(racesCollectionHAL)
                });
            }
            if (resource === raceScorpionAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"1"']]), 
                    json: () => Promise.resolve(raceScorpionAHAL)
                });
            }
            if (resource === raceGraduateAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(raceGraduateAHAL)
                });
            }
            if (resource === raceCometAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(raceCometAHAL)
                });
            }
            if (resource === raceHandicapAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(raceHandicapAHAL)
                });
            }
        });
    
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Collection([
            {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
            {hal: raceGraduateAHAL, metadata: {version: '"0"'}}, 
            {hal: raceCometAHAL, metadata: {version: '"0"'}}, 
            {hal: raceHandicapAHAL, metadata: {version: '"0"'}}
        ], {size:20,totalElements:4,totalPages:1,number:0}));
    });
    describe('when there are more races than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('returns a success result containing all the races that start at or after the specified time', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'directRaces':[raceScorpionAHAL, raceGraduateAHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === raceScorpionAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(raceScorpionAHAL)
                        });
                    }
                    if (resource === raceGraduateAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceGraduateAHAL)
                        });
                    }
                    if (resource === raceCometAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceCometAHAL)
                        });
                    }
                    if (resource === raceHandicapAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceHandicapAHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL_p0)
                        });
                    }
                });
        
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'));
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
                    {hal: raceGraduateAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceCometAHAL, metadata: {version: '"0"'}}, 
                    {hal: raceHandicapAHAL, metadata: {version: '"0"'}}
                ], {size:20,totalElements:4,totalPages:1,number:0}));
            });
        });
        describe('when page number supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'directRaces':[raceScorpionAHAL, raceGraduateAHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === raceScorpionAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(raceScorpionAHAL)
                        });
                    }
                    if (resource === raceGraduateAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceGraduateAHAL)
                        });
                    }
                    if (resource === raceCometAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceCometAHAL)
                        });
                    }
                    if (resource === raceHandicapAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceHandicapAHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&page=0') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL_p0)
                        });
                    }
                });
        
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), 0);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
                    {hal: raceGraduateAHAL, metadata: {version: '"0"'}}
                ], racesCollectionHAL_p0.page));
            });
        });
        describe('when size is supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'directRaces':[raceScorpionAHAL, raceGraduateAHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === raceScorpionAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(raceScorpionAHAL)
                        });
                    }
                    if (resource === raceGraduateAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceGraduateAHAL)
                        });
                    }
                    if (resource === raceCometAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceCometAHAL)
                        });
                    }
                    if (resource === raceHandicapAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceHandicapAHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL_p0)
                        });
                    }
                });
        
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), null, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
                    {hal: raceGraduateAHAL, metadata: {version: '"0"'}}
                ], racesCollectionHAL_p0.page));
            });
        });
        describe('when page and size supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'directRaces':[raceScorpionAHAL, raceGraduateAHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === raceScorpionAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(raceScorpionAHAL)
                        });
                    }
                    if (resource === raceGraduateAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceGraduateAHAL)
                        });
                    }
                    if (resource === raceCometAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceCometAHAL)
                        });
                    }
                    if (resource === raceHandicapAHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(raceHandicapAHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&page=0&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL_p0)
                        });
                    }
                });
        
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), 0, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
                    {hal: raceGraduateAHAL, metadata: {version: '"0"'}}
                ], racesCollectionHAL_p0.page));
            });
        });
    });
    describe('when sort criteria are provided', () => {
        it('requests a sorted collection from server', async () => {
            // checking request is correctly structured
            // not checking a sorted collection is returned as that is the responsibility of the server
            fetch.mockImplementation((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&sort=plannedStartTime,ASC') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(racesCollectionHAL)
                    });
                }
                if (resource === raceScorpionAHAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"1"']]), 
                        json: () => Promise.resolve(raceScorpionAHAL)
                    });
                }
                if (resource === raceGraduateAHAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"0"']]), 
                        json: () => Promise.resolve(raceGraduateAHAL)
                    });
                }
                if (resource === raceCometAHAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"0"']]), 
                        json: () => Promise.resolve(raceCometAHAL)
                    });
                }
                if (resource === raceHandicapAHAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"0"']]), 
                        json: () => Promise.resolve(raceHandicapAHAL)
                    });
                }
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const promise = model.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual(new Collection([
                {hal: raceScorpionAHAL, metadata: {version: '"1"'}}, 
                {hal: raceGraduateAHAL, metadata: {version: '"0"'}}, 
                {hal: raceCometAHAL, metadata: {version: '"0"'}}, 
                {hal: raceHandicapAHAL, metadata: {version: '"0"'}}
            ], {size:20,totalElements:4,totalPages:1,number:0}));
        });
    });
});

describe('when retrieving a list of races of a specific type that start between the specified times', () => {
    it('calls getRacesFromURL with correct parameters', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const getRacesFromURLSpy = vi.spyOn(model, 'getRacesFromURL').mockImplementation(vi.fn());
        const startTime = new Date(Date.now() - 100000);
        const endTime = new Date();
        await model.getRacesBetweenTimesForType(startTime, endTime, RaceType.FLEET);
        const resource = httpRootURL + '/directRaces/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime='+ startTime.toISOString() + '&endTime=' + endTime.toISOString() + '&type=' + RaceType.FLEET;
        expect(getRacesFromURLSpy).toHaveBeenCalledWith(resource, undefined, undefined, undefined);
    });
    it('returns requested races', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const raceCometA = new Race(raceCometAHAL, {version: '"0"'}, this);
        const raceGraduateA = new Race(raceGraduateAHAL, {version: '"0"'}, this);
        const raceHandicapA = new Race(raceHandicapAHAL, {version: '"0"'}, this);
        const raceScorpionA = new Race(raceScorpionAHAL, {version: '"0"'}, this);
        const collection = [
            raceScorpionA, raceGraduateA, raceCometA, raceHandicapA
        ];
        const racesCollection = new Collection(collection, {size: 20, totalElements: collection.length, totalPages: 0, number: 0})
        vi.spyOn(model, 'getRacesFromURL').mockImplementation(() => racesCollection);
        const startTime = new Date(Date.now() - 100000);
        const endTime = new Date();
        const result = await model.getRacesBetweenTimesForType(startTime, endTime, RaceType.FLEET);
        expect(result).toEqual(racesCollection);
    })
})

describe('when signing up to a race', () => {
    it('if race provided and helm provided and dinghy provided and crew provided then creates race entry', async () => {
        // expecting HTTP 204 No Content response
        fetch.mockImplementationOnce((resource, options) => {
                if (resource === raceScorpionAHAL._links.self.href + '/signUp' && options.body === '{"helm":"http://localhost:8081/dinghyracing/api/competitors/8","dinghy":"http://localhost:8081/dinghyracing/api/dinghies/2","crew":"http://localhost:8081/dinghyracing/api/competitors/12"}') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"1"']]),
                    json: () => Promise.resolve(raceScorpionAHAL)
                });
            };
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.signUpToRace(new Race(raceScorpionAHAL, {version: '"1"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), 
            new Dinghy(dinghy1234HAL, {version: '"1"'}, model), new Competitor(competitorLouScrewHAL, {version: '"1"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: raceScorpionAHAL, metadata: {version: '"1"'}, model: model});
    });
    it('if race provided and helm provided and dinghy provided crew not provided then creates race entry', async () => {
        // expecting HTTP 204 No Content response
        fetch.mockImplementationOnce((resource, options) => {
                if (resource === raceScorpionAHAL._links.self.href + '/signUp' && options.body === '{"helm":"http://localhost:8081/dinghyracing/api/competitors/8","dinghy":"http://localhost:8081/dinghyracing/api/dinghies/2"}') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"1"']]),
                    json: () => Promise.resolve(raceScorpionAHAL)
                });
            };
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.signUpToRace(new Race(raceScorpionAHAL, {version: '"1"'}, model), new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), 
            new Dinghy(dinghy1234HAL, {version: '"1"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: raceScorpionAHAL, metadata: {version: '"1"'}, model: model});
    });
    describe('when dinghy is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 409,
                    statusText: 'Conflict',
                    json: () => Promise.resolve({message: 'Dinghy [id=2, version=0, dinghyClass=Scorpion, sailNumber=1234] has already signed up for race.'}),
                    text: () => Promise.resolve({message: 'Dinghy [id=2, version=0, dinghyClass=Scorpion, sailNumber=1234] has already signed up for race.'})
                });
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const race = new Race(raceScorpionAHAL, {version: '"1"'}, model);
            const helm = new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model);
            const dinghy = new Dinghy(dinghy1234HAL, {version: '"1"'}, model);
            const crew = new Competitor(competitorLouScrewHAL, {version: '"1"'}, model);
            await expect(() => model.signUpToRace(race, helm, dinghy, crew)).rejects.toThrowError('HTTP Error: 409 Conflict Message: Dinghy [id=2, version=0, dinghyClass=Scorpion, sailNumber=1234] has already signed up for race.');
        });
    });
    describe('when helm is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/4/signUp') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: 'Competitor [id=1, version=0, name=Chris Marshall] has already signed up for race.'})
                    });
                };
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const race = new Race(raceScorpionAHAL, {version: '"1"'}, model);
            const helm = new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model);
            const dinghy = new Dinghy(dinghy1234HAL, {version: '"1"'}, model);
            const crew = new Competitor(competitorLouScrewHAL, {version: '"1"'}, model);
            await expect(() => model.signUpToRace(race, helm, dinghy, crew)).rejects.toThrowError('HTTP Error: 409 Conflict Message: Competitor [id=1, version=0, name=Chris Marshall] has already signed up for race.');
        });
    });
    describe('when crew is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/4/signUp') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: 'Competitor [id=1, version=0, name=Chris Marshall] has already signed up for race.'})
                    });
                };
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const race = new Race(raceScorpionAHAL, {version: '"1"'}, model);
            const helm = new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model);
            const dinghy = new Dinghy(dinghy1234HAL, {version: '"1"'}, model);
            const crew = new Competitor(competitorLouScrewHAL, {version: '"1"'}, model);
            await expect(() => model.signUpToRace(race, helm, dinghy, crew)).rejects.toThrowError('HTTP Error: 409 Conflict Message: Competitor [id=1, version=0, name=Chris Marshall] has already signed up for race.');
        });
    });
});

describe('when updating an entry for a race', () => {
    it('if entry provided and helm provided and dinghy provided and crew provided then updates entry', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {'helm': competitorSarahPascalHAL._links.self.href, 'dinghy': dinghy6745HAL._links.self.href, 'crew': competitorOwainDaviesHAL._links.self.href};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries/10') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"1"']]),
                    json: () => Promise.resolve(entrySarahPascal6745ScorpionAHAL)
                });
            };
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const helm = new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model);
        const dinghy = new Dinghy(dinghy6745HAL, {version: '"1"'}, model);
        const crew = new Competitor(competitorOwainDaviesHAL, {version: '"1"'}, model);
        const promise = model.updateEntry(entry, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: entrySarahPascal6745ScorpionAHAL, metadata: {version: '"1"'}, model});
    });
    it('if entry provided and helm provided and dinghy provided and crew not provided then updates entry', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {'helm': competitorSarahPascalHAL._links.self.href, 'dinghy': dinghy6745HAL._links.self.href, 'crew': null};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries/10') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"1"']]),
                    json: () => Promise.resolve(entrySarahPascal6745ScorpionAHAL)
                });
            };
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
        const helm = new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model);
        const dinghy = new Dinghy(dinghy6745HAL, {version: '"1"'}, model);
        const promise = model.updateEntry(entry, helm, dinghy);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: entrySarahPascal6745ScorpionAHAL, metadata: {version: '"1"'}, model});
    });
    describe('when dinghy is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries/10') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: 'Dinghy [id=2, version=0, dinghyClass=Scorpion, sailNumber=1234] has already signed up for race.'})
                    });
                };
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            const helm = new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model);
            const dinghy = new Dinghy(dinghy6745HAL, {version: '"1"'}, model);
            const crew = new Competitor(competitorLouScrewHAL, {version: '"1"'}, model);
            await expect(() => model.updateEntry(entry, helm, dinghy, crew)).rejects.toThrowError('HTTP Error: 409 Conflict Message: Dinghy [id=2, version=0, dinghyClass=Scorpion, sailNumber=1234] has already signed up for race.');
        });
    });
    describe('when helm is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries/10') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: 'Competitor [id=1, version=0, name=Chris Marshall] has already signed up for race.'})
                    });
                };
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            const helm = new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model);
            const dinghy = new Dinghy(dinghy6745HAL, {version: '"1"'}, model);
            const crew = new Competitor(competitorLouScrewHAL, {version: '"1"'}, model);
            await expect(() => model.updateEntry(entry, helm, dinghy, crew)).rejects.toThrowError('HTTP Error: 409 Conflict Message: Competitor [id=1, version=0, name=Chris Marshall] has already signed up for race.');
        });
    });
    describe('when crew is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries/10') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: 'Competitor [id=1, version=0, name=Low Screw] has already signed up for race.'})
                    });
                };
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const entry = new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model);
            const helm = new Competitor(competitorSarahPascalHAL, {version: '"0"'}, model);
            const dinghy = new Dinghy(dinghy6745HAL, {version: '"1"'}, model);
            const crew = new Competitor(competitorLouScrewHAL, {version: '"1"'}, model);
            await expect(() => model.updateEntry(entry, helm, dinghy, crew)).rejects.toThrowError('HTTP Error: 409 Conflict Message: Competitor [id=1, version=0, name=Low Screw] has already signed up for race.');
        });
    });
});

describe('when withdrawing an entry for a race', () => {
    it('return a promise that resolves to true when entry successfully withdrawn', async () => {
        fetch.mockImplementation((resource, options) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/entries/10' && options.method === 'DELETE') {
                return Promise.resolve({
                    ok: true,
                    status: 204,
                    headers: new Headers(),
                    json: () => Promise.resolve({})
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.withdrawEntry(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toBe(true);
    });
    it('throws an error when request to withdraw fails', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.withdrawEntry(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model)).rejects.toThrowError('HTTP Error: 404 Not Found'));
    });
});

describe('when retrieving a list of competitors', () => {
    it('returns a collection of competitors', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,ASC') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(competitorsCollectionHAL)
                });
            };
            if (resource === competitorChrisMarshallHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag','"0"']]),
                    json: () => Promise.resolve(competitorChrisMarshallHAL)
                });
            };
            if (resource === competitorSarahPascalHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag','"0"']]),
                    json: () => Promise.resolve(competitorSarahPascalHAL)
                });
            }
            if (resource === competitorJillMyerHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag','"1"']]),
                    json: () => Promise.resolve(competitorJillMyerHAL)
                });
            }
            if (resource === competitorLouScrewHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag','"0"']]),
                    json: () => Promise.resolve(competitorChrisMarshallHAL)
                });
            }
            if (resource === competitorOwainDaviesHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag','"0"']]),
                    json: () => Promise.resolve(competitorOwainDaviesHAL)
                });
            }
            if (resource === competitorLiuBaoHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag','"0"']]),
                    json: () => Promise.resolve(competitorLiuBaoHAL)
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getCompetitors();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Collection([
            {hal: {competitorChrisMarshallHAL}, metadata: {version: '"0"'}, model},
            {hal: {competitorSarahPascalHAL}, metadata: {version: '"0"'}, model},
            {hal: {competitorJillMyerHAL}, metadata: {version: '"1"'}, model},
            {hal: {competitorLouScrewHAL}, metadata: {version: '"0"'}, model},
            {hal: {competitorOwainDaviesHAL}, metadata: {version: '"0"'}, model},
            {hal: {competitorLiuBaoHAL}, metadata: {version: '"0"'}, model}
        ], {"size": 20, "totalElements": 6, "totalPages": 1, "number": 0}));
    });
    describe('when there are more competitors than will fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('returns a success result containing all the competitors', async () => {
                const competitorsCollectionHAL_p0 = {'_embedded':{'competitors':[
                    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL
                ]},'_links':{
                    'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}
                },'page':{'size':3,'totalElements':6,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,ASC&page=0&size=6') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL)
                        });
                    }
                    if (resource === competitorChrisMarshallHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorChrisMarshallHAL)
                        });
                    };
                    if (resource === competitorSarahPascalHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorSarahPascalHAL)
                        });
                    }
                    if (resource === competitorJillMyerHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"1"']]),
                            json: () => Promise.resolve(competitorJillMyerHAL)
                        });
                    }
                    if (resource === competitorLouScrewHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorChrisMarshallHAL)
                        });
                    }
                    if (resource === competitorOwainDaviesHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorOwainDaviesHAL)
                        });
                    }
                    if (resource === competitorLiuBaoHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorLiuBaoHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,ASC') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL_p0)
                        });
                    }
                });
               
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getCompetitors();
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: {competitorChrisMarshallHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorSarahPascalHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorJillMyerHAL}, metadata: {version: '"1"'}, model},
                    {hal: {competitorLouScrewHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorOwainDaviesHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorLiuBaoHAL}, metadata: {version: '"0"'}, model}
                ], {"size": 20, "totalElements": 6, "totalPages": 1, "number": 0}));
            });
        });
        describe('when page number supplied', () => {
            it('returns only a single page of competitors', async () => {
                const competitorsCollectionHAL_p0 = {'_embedded':{'competitors':[
                    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL
                ]},'_links':{
                    'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}
                },'page':{'size':3,'totalElements':6,'totalPages':2,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === competitorChrisMarshallHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorChrisMarshallHAL)
                        });
                    };
                    if (resource === competitorSarahPascalHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorSarahPascalHAL)
                        });
                    }
                    if (resource === competitorJillMyerHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"1"']]),
                            json: () => Promise.resolve(competitorJillMyerHAL)
                        });
                    }
                    if (resource === competitorLouScrewHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorChrisMarshallHAL)
                        });
                    }
                    if (resource === competitorOwainDaviesHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorOwainDaviesHAL)
                        });
                    }
                    if (resource === competitorLiuBaoHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorLiuBaoHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?page=0&sort=name,ASC') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL_p0)
                        });
                    }
                });
               
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getCompetitors(0);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: {competitorChrisMarshallHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorSarahPascalHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorJillMyerHAL}, metadata: {version: '"1"'}, model},
                ], {"size": 3, "totalElements": 6, "totalPages": 2, "number": 0}));
            });
        });
        describe('when size is supplied', () => {
            it('returns only a single page of competitors', async () => {
                const competitorsCollectionHAL_p0 = {'_embedded':{'competitors':[
                    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL
                ]},'_links':{
                    'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}
                },'page':{'size':3,'totalElements':6,'totalPages':2,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === competitorChrisMarshallHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorChrisMarshallHAL)
                        });
                    };
                    if (resource === competitorSarahPascalHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorSarahPascalHAL)
                        });
                    }
                    if (resource === competitorJillMyerHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"1"']]),
                            json: () => Promise.resolve(competitorJillMyerHAL)
                        });
                    }
                    if (resource === competitorLouScrewHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorChrisMarshallHAL)
                        });
                    }
                    if (resource === competitorOwainDaviesHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorOwainDaviesHAL)
                        });
                    }
                    if (resource === competitorLiuBaoHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorLiuBaoHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?size=3&sort=name,ASC') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL_p0)
                        });
                    }
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getCompetitors(null, 3);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: {competitorChrisMarshallHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorSarahPascalHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorJillMyerHAL}, metadata: {version: '"1"'}, model},
                ], {"size": 3, "totalElements": 6, "totalPages": 2, "number": 0}));
            });
        });
        describe('when page and size supplied', () => {
            it('returns only a single page of competitors', async () => {
                const competitorsCollectionHAL_p0 = {'_embedded':{'competitors':[
                    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL
                ]},'_links':{
                    'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}
                },'page':{'size':3,'totalElements':6,'totalPages':2,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc&page=0&size=6') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL)
                        });
                    }
                    if (resource === competitorChrisMarshallHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorChrisMarshallHAL)
                        });
                    };
                    if (resource === competitorSarahPascalHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorSarahPascalHAL)
                        });
                    }
                    if (resource === competitorJillMyerHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"1"']]),
                            json: () => Promise.resolve(competitorJillMyerHAL)
                        });
                    }
                    if (resource === competitorLouScrewHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorChrisMarshallHAL)
                        });
                    }
                    if (resource === competitorOwainDaviesHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorOwainDaviesHAL)
                        });
                    }
                    if (resource === competitorLiuBaoHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag','"0"']]),
                            json: () => Promise.resolve(competitorLiuBaoHAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?page=0&size=3&sort=name,ASC') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL_p0)
                        });
                    }
                });
               
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getCompetitors(0, 3);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: {competitorChrisMarshallHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorSarahPascalHAL}, metadata: {version: '"0"'}, model},
                    {hal: {competitorJillMyerHAL}, metadata: {version: '"1"'}, model},
                ], {"size": 3, "totalElements": 6, "totalPages": 2, "number": 0}));
            });
        });
    });
});

describe('when searching for a competitor by name', () => {
    it('returns a promise that resolves to a result indicating success and containing the competitor when competitor is found and http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getCompetitorByName('Chris Marshall');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: competitorChrisMarshallHAL, metadata: {version: ''}, model});
    });
    it('throws an error when competitor is not found', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getCompetitorByName('Bob Smith')).rejects.toThrowError('HTTP Error: 404 Not Found');
    });
});

describe('when searching for a dinghy by sail number and dinghy class', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy when dinghy is found and http status 200', async () => {
        // this test can return a false positive if the logic makes a call to fetch but passes invalid argument as fetch mock does not check input
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers([['ETag', '"0"']]), 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getDinghyBySailNumberAndDinghyClass('1234', {hal: dinghyClassScorpionHAL, metadata: {version: '"0"'}, model});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: dinghy1234HAL, metadata: {version: '"0"'}, model});
    });
    it('throws an error when dinghy is not found', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getDinghyBySailNumberAndDinghyClass('999', {hal: dinghyClassScorpionHAL, metadata: {version: '"0"'}, model})).rejects.toThrowError('HTTP Error: 404 Not Found');
    });
});

describe('when creating a new competitor', () => {
    it('returns a promise that resolves to the new competitor when competitor is created', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.createCompetitor('Chris Marshall');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: competitorChrisMarshallHAL, metadata: {version: ''}, model});
    });
    it('throws an error when competitor is not created', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409,
                statusText: 'Bad Request',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.createCompetitor('Chris Marshall')).rejects.toThrowError('HTTP Error: 409 Bad Request Message: Some error resulting in HTTP 409'); 
    });
});

describe('when updating a competitor', () => {
    it('if competitor exists and URL provided then updates competitor', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            if ((resource === 'http://localhost:8081/dinghyracing/api/competitors/8') && (options.body === JSON.stringify({name: 'Chris Marshal'}))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve({...competitorChrisMarshallHAL, name: 'Chris Marshal'})
                });
            };
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.updateCompetitor(new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), 'Chris Marshal');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: {...competitorChrisMarshallHAL, name: 'Chris Marshal'}, metadata: {version: ''}, model});
    });
    it('if update fails throws error', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve()
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.updateCompetitor(new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), 'Chris Marshal')).rejects.toThrowError('HTTP Error: 404 Not Found');
    });
});

describe('when updating a dinghy class', () => {
    it('if dinghy class exists and URL provided then updates dinghy class', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            if ((resource === 'http://localhost:8081/dinghyracing/api/dinghyClasses/1') && (options.body === JSON.stringify({name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215, externalName: 'SCORPION TWO'}))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve({...dinghyClassScorpionHAL, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215, externalName: 'SCORPION TWO'})
                });
            };
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.updateDinghyClass(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),'Scorpion Two', 3, 1215, 'SCORPION TWO');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: {...dinghyClassScorpionHAL, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215, externalName: 'SCORPION TWO'}, metadata: {version: ''}, model});
    });
    it('if dinghy class does not exist throws error', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve()
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.updateDinghyClass(new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),'Scorpion Two', 3, 1215, 'SCORPION TWO')).rejects.toThrowError('HTTP Error: 404 Not Found');
    });
});

describe('when creating a new dinghy', () => {
    it('returns a promise that resolves to the new dinghy when dinghy is created', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers([['ETag', '"0"']]), 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);

        const promise = model.createDinghy('1234', new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Dinghy(dinghy1234HAL, {version: '"0"'}, model));
    });
    it('throws an error when dinghy is not created', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409,
                statusText: 'Conflict',
                json: () => Promise.resolve({
                    "cause":{
                        "cause":{
                            "cause":null,"message":"Duplicate entry '102-None' for key 'dinghy.UK_dinghy_dinghy_class_id_sail_number'"
                        },"message":"could not execute statement [Duplicate entry '102-None' for key 'dinghy.UK_dinghy_dinghy_class_id_sail_number'] [insert into dinghy (dinghy_class_id,sail_number,version,id) values (?,?,?,?)]"
                    },"message":"could not execute statement [Duplicate entry '102-None' for key 'dinghy.UK_dinghy_dinghy_class_id_sail_number'] [insert into dinghy (dinghy_class_id,sail_number,version,id) values (?,?,?,?)]; SQL [insert into dinghy (dinghy_class_id,sail_number,version,id) values (?,?,?,?)]; constraint [dinghy.UK_dinghy_dinghy_class_id_sail_number]"
                })
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.createDinghy('1234', new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model))).rejects.toThrowError("HTTP Error: 409 Conflict Message: The dinghy '102-None' already exists; this may be caused by an uppercase/ lowercase difference between existing record and the value entered.");
    });
});

describe('when retrieving a list of dinghies', () => {
    describe('when no dinghy class is supplied', () => {
        it('returns a promise that resolves to a collection of dinghies', async () => {
            fetch.mockImplementation((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?sort=sailNumber,ASC') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghiesCollectionHAL)
                    });
                }
                if (resource === dinghy1234HAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"0"']]), 
                        json: () => Promise.resolve(dinghy1234HAL)
                    });
                }
                if (resource === dinghy2726HAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"0"']]), 
                        json: () => Promise.resolve(dinghy2726HAL)
                    });
                }
                if (resource === dinghy6745HAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"0"']]), 
                        json: () => Promise.resolve(dinghy6745HAL)
                    });
                }
                if (resource === dinghy2928HAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"0"']]), 
                        json: () => Promise.resolve(dinghy2928HAL)
                    });
                }
                if (resource === dinghy826HAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"1"']]), 
                        json: () => Promise.resolve(dinghy826HAL)
                    });
                }
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const promise = model.getDinghies();
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual(new Collection([
                new Dinghy(dinghy1234HAL, {version: '"0"'}, model),
                new Dinghy(dinghy2726HAL, {version: '"0"'}, model),
                new Dinghy(dinghy6745HAL, {version: '"0"'}, model),
                new Dinghy(dinghy2928HAL, {version: '"0"'}, model),
                new Dinghy(dinghy826HAL, {version: '"1"'}, model),
            ], dinghiesCollectionHAL.page));
        });
        describe('when there are more dinghies than fit on a single page', () => {
            describe('when page and size are not supplied', () => {
                it('returns a success result containing all dinghies', async () => {
                    const dinghiesCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        dinghy1234HAL, dinghy2726HAL, dinghy6745HAL
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 
                    'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 3, 'totalElements' : 5, 'totalPages' : 2, 'number' : 0 } };
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?sort=sailNumber,ASC&page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                    }
                    if (resource === dinghy1234HAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(dinghy1234HAL)
                        });
                    }
                    if (resource === dinghy2726HAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(dinghy2726HAL)
                        });
                    }
                    if (resource === dinghy6745HAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(dinghy6745HAL)
                        });
                    }
                    if (resource === dinghy2928HAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(dinghy2928HAL)
                        });
                    }
                    if (resource === dinghy826HAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(dinghy826HAL)
                        });
                    }
                }).mockImplementationOnce((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?sort=sailNumber,ASC') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesCollectionHAL_p0)
                            });
                        }
                    });
                    const model = new SylphModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies();
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual(new Collection([
                        new Dinghy(dinghy1234HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy2726HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy6745HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy2928HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy826HAL, {version: '"1"'}, model),
                    ], dinghiesCollectionHAL.page));
                });
            });
            describe('when page number supplied', () => {
                it('returns only a single page of data', async () => {
                    const dinghiesCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        dinghy1234HAL, dinghy2726HAL, dinghy6745HAL
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 3, 'totalElements' : 5, 'totalPages' : 2, 'number' : 0 } };
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5&sort=sailNumber,ASC') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesCollectionHAL)
                            });
                        }
                        if (resource === dinghy1234HAL._links.self.href) {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers([['ETag', '"0"']]), 
                                json: () => Promise.resolve(dinghy1234HAL)
                            });
                        }
                        if (resource === dinghy2726HAL._links.self.href) {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers([['ETag', '"0"']]), 
                                json: () => Promise.resolve(dinghy2726HAL)
                            });
                        }
                        if (resource === dinghy6745HAL._links.self.href) {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers([['ETag', '"0"']]), 
                                json: () => Promise.resolve(dinghy6745HAL)
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&sort=sailNumber,ASC') {
                                return Promise.resolve({
                                    ok: true,
                                    status: 200, headers: new Headers(), 
                                    json: () => Promise.resolve(dinghiesCollectionHAL_p0)
                                });
                            }
                        });
                    const model = new SylphModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(0, null);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual(new Collection([
                        new Dinghy(dinghy1234HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy2726HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy6745HAL, {version: '"0"'}, model)
                    ], dinghiesCollectionHAL_p0.page));
                });
            });
            describe('when size supplied', () => {
                it('returns only a single page of data', async () => {
                    const dinghiesCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        dinghy1234HAL, dinghy2726HAL, dinghy6745HAL
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 3, 'totalElements' : 5, 'totalPages' : 2, 'number' : 0 } };
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5&sort=sailNumber,ASC') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesCollectionHAL)
                            });
                        }
                        if (resource === dinghy1234HAL._links.self.href) {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers([['ETag', '"0"']]), 
                                json: () => Promise.resolve(dinghy1234HAL)
                            });
                        }
                        if (resource === dinghy2726HAL._links.self.href) {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers([['ETag', '"0"']]), 
                                json: () => Promise.resolve(dinghy2726HAL)
                            });
                        }
                        if (resource === dinghy6745HAL._links.self.href) {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers([['ETag', '"0"']]), 
                                json: () => Promise.resolve(dinghy6745HAL)
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?size=3&sort=sailNumber,ASC') {
                                return Promise.resolve({
                                    ok: true,
                                    status: 200, headers: new Headers(), 
                                    json: () => Promise.resolve(dinghiesCollectionHAL_p0)
                                });
                            }
                        });
                    const model = new SylphModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(null, 3);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual(new Collection([
                        new Dinghy(dinghy1234HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy2726HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy6745HAL, {version: '"0"'}, model)
                    ], dinghiesCollectionHAL_p0.page));
                });
            });
            describe('when page and size supplied', () => {
                it('returns only a single page of data', async () => {
                    const dinghiesCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        dinghy1234HAL, dinghy2726HAL, dinghy6745HAL
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 3, 'totalElements' : 5, 'totalPages' : 2, 'number' : 0 } };
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5&sort=sailNumber,ASC') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesCollectionHAL)
                            });
                        }
                        if (resource === dinghy1234HAL._links.self.href) {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers([['ETag', '"0"']]), 
                                json: () => Promise.resolve(dinghy1234HAL)
                            });
                        }
                        if (resource === dinghy2726HAL._links.self.href) {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers([['ETag', '"0"']]), 
                                json: () => Promise.resolve(dinghy2726HAL)
                            });
                        }
                        if (resource === dinghy6745HAL._links.self.href) {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers([['ETag', '"0"']]), 
                                json: () => Promise.resolve(dinghy6745HAL)
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=3&sort=sailNumber,ASC') {
                                return Promise.resolve({
                                    ok: true,
                                    status: 200, headers: new Headers(), 
                                    json: () => Promise.resolve(dinghiesCollectionHAL_p0)
                                });
                            }
                        });
                    const model = new SylphModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(0, 3);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual(new Collection([
                        new Dinghy(dinghy1234HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy2726HAL, {version: '"0"'}, model),
                        new Dinghy(dinghy6745HAL, {version: '"0"'}, model)
                    ], dinghiesCollectionHAL_p0.page));
                });
            });
        });
    });
});

describe('when retrieving a list of dinghies in a dinghy class', () => {
    it('calls getDinghiesFromURL with correct parameters', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const getDinghiesByURLSpy = vi.spyOn(model, 'getDinghiesFromURL').mockImplementation(async () => new Collection([], {}));
        const dinghyClass = new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model);
        await model.getDinghiesInDinghyClass(dinghyClass);
        expect(getDinghiesByURLSpy).toHaveBeenCalledWith(httpRootURL + '/dinghies/search/findByDinghyClass?dinghyClass=' + dinghyClass.url, undefined, undefined, undefined);
    });
    it('returns collection of dinghies', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const dinghies = new Collection([new Dinghy(dinghy1234HAL, {version: '"0"'}, model)], {size: 20, totalElements: 1, totalPages: 0, number: 0});
        vi.spyOn(model, 'getDinghiesFromURL').mockImplementation(async () => dinghies);
        const dinghyClass = new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model);
        
        expect(await model.getDinghiesInDinghyClass(dinghyClass)).toEqual(dinghies);
    });
});

describe('when creating a new fleet', () => {
    describe('without associated dinghy classes', () => {
        it('returns a promise that resolves to the new fleet when fleet is created', async () => {
            fetch.mockImplementation((resource, options) => {
                if (resource === httpRootURL + '/fleets' && options.body === '{"name":"Handicap","dinghyClasses":[]}') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"0"']]), 
                        json: () => Promise.resolve(fleetHandicapHAL)
                    });
                }
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const promise = model.createFleet('Handicap', []);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual(new Fleet(fleetHandicapHAL, {version: '"0"'}, model));
        });
        it('throws an error when fleet is not created', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 409,
                    statusText: 'Bad Request',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'})
                });
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            await expect(() => model.createFleet('Handicap', [])).rejects.toThrowError('HTTP Error: 409 Bad Request Message: Some error resulting in HTTP 409'); 
        });
    });    
    describe('with associated dinghy classes', () => {
        it('returns a promise that resolves to a result indicating success when fleet is created with http status 200', async () => {
            fetch.mockImplementation((resource, options) => {
                if (resource === httpRootURL + '/fleets' && options.body === '{"name":"Scorpion","dinghyClasses":["http://localhost:8081/dinghyracing/api/dinghyClasses/1"]}') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"0"']]), 
                        json: () => Promise.resolve(fleetScorpionHAL)
                    });
                }
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const promise = model.createFleet('Scorpion', [new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)])
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual(new Fleet(fleetScorpionHAL, {version: '"0"'}, model));
        });
    });
});

describe('when updating a fleet', () => {
    it('returns a promise that resolves to a result indicating success when fleet dinghy classes are updated with http status 200', async () => {
        fetch.mockImplementation((resource, options) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1' 
                && options.method === 'PATCH' 
                && options.body === '{"name":"Scorpion B","dinghyClasses":["http://localhost:8081/dinghyracing/api/dinghyClasses/1"]}') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionHAL)
                });                    
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.updateFleet(new Fleet(fleetScorpionHAL, {version: '"0"'}, model), 'Scorpion B', [new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)]);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: fleetScorpionHAL, metadata: {version: ''}, model});
    });
    it('throws an error when dinghy classes are not updated', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.updateFleet(new Fleet(fleetScorpionHAL, {version: '"0"'}, model), 'Scorpion B', [new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)])).rejects.toThrowError('HTTP Error: 400 Bad Request Message: Some error resulting in HTTP 400'); 
    });
});

describe('when retrieving a list of fleets', () => {
    it('returns a promise that resolves to a collection of fleets', async () => {
        fetch.mockImplementation((resource, options) => {
            if (resource === httpRootURL + '/fleets?sort=name,ASC') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetsCollectionHAL)
                });
            };
            if (resource === fleetScorpionHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(fleetScorpionHAL)
                });
            }
            if (resource === fleetGraduateHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"1"']]), 
                    json: () => Promise.resolve(fleetGraduateHAL)
                });
            }
            if (resource === fleetCometHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(fleetCometHAL)
                });
            }
            if (resource === fleetHandicapHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]), 
                    json: () => Promise.resolve(fleetHandicapHAL)
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getFleets();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Collection([
            {hal: {fleetScorpionHAL}, metadata: {version: '"0"'}, model},
            {hal: {fleetGraduateHAL}, metadata: {version: '"1"'}, model},
            {hal: {fleetCometHAL}, metadata: {version: '"0"'}, model},
            {hal: {fleetHandicapHAL}, metadata: {version: '"0"'}, model},
        ], fleetsCollectionHAL.page));
    });
    describe('when there are more fleets available than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('retrieves and returns complete list of fleets', async () => {
                const fleetsCollectionHAL_p0 = {
                    '_embedded' : { 'fleets' : [ fleetScorpionHAL, fleetHandicapHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/fleets' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation((resource, options) => {
                    if (resource === httpRootURL + '/fleets?sort=name,ASC') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsCollectionHAL_p0)
                        });
                    };
                    if (resource === httpRootURL + '/fleets?sort=name,ASC&page=0&size=3') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsCollectionHAL)
                        });
                    };
                    if (resource === fleetScorpionHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === fleetGraduateHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === fleetCometHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === fleetHandicapHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getFleets();
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: {fleetScorpionHAL}, metadata: {version: '"0"'}, model},
                    {hal: {fleetGraduateHAL}, metadata: {version: '"1"'}, model},
                    {hal: {fleetCometHAL}, metadata: {version: '"0"'}, model},
                    {hal: {fleetHandicapHAL}, metadata: {version: '"0"'}, model},
                ], fleetsCollectionHAL.page));
            });
        });
        describe('when page number supplied', () => {
            it('returns only a single page of data', async () => {
                const fleetsCollectionHAL_p0 = {
                    '_embedded' : { 'fleets' : [ fleetScorpionHAL, fleetHandicapHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/fleets' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation((resource, options) => {
                    if (resource === httpRootURL + '/fleets?page=1&sort=name,ASC') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsCollectionHAL_p0)
                        });
                    };
                    if (resource === fleetScorpionHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === fleetGraduateHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === fleetCometHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === fleetHandicapHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getFleets(1);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: {fleetScorpionHAL}, metadata: {version: '"0"'}, model},
                    {hal: {fleetHandicapHAL}, metadata: {version: '"0"'}, model},
                ], fleetsCollectionHAL_p0.page));
            });
        });
        describe('when size supplied', () => {
            it('returns only a single page of data', async () => {
                const fleetsCollectionHAL_p0 = {
                    '_embedded' : { 'fleets' : [ fleetScorpionHAL, fleetHandicapHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/fleets' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation((resource, options) => {
                    if (resource === httpRootURL + '/fleets?size=2&sort=name,ASC') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsCollectionHAL_p0)
                        });
                    };
                    if (resource === fleetScorpionHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === fleetGraduateHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === fleetCometHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === fleetHandicapHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getFleets(null, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: {fleetScorpionHAL}, metadata: {version: '"0"'}, model},
                    {hal: {fleetHandicapHAL}, metadata: {version: '"0"'}, model},
                ], fleetsCollectionHAL_p0.page));
            });
        });
        describe('when page and size supplied', () => {
            it('returns only a single page of data', async () => {
                const fleetsCollectionHAL_p0 = {
                    '_embedded' : { 'fleets' : [ fleetScorpionHAL, fleetHandicapHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/fleets' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation((resource, options) => {
                    if (resource === httpRootURL + '/fleets?page=0&size=2&sort=name,ASC') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsCollectionHAL_p0)
                        });
                    };
                    if (resource === fleetScorpionHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === fleetGraduateHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"1"']]), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === fleetCometHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === fleetHandicapHAL._links.self.href) {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers([['ETag', '"0"']]), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                });
                const model = new SylphModel(httpRootURL, wsRootURL);
                const promise = model.getFleets(0, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual(new Collection([
                    {hal: {fleetScorpionHAL}, metadata: {version: '"0"'}, model},
                    {hal: {fleetHandicapHAL}, metadata: {version: '"0"'}, model},
                ], fleetsCollectionHAL_p0.page));
            });
        });
    });
    it('throws an error when list of dinghy classes is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getFleets('unknown')).rejects.toThrowError('HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404');
    });
});

describe('when searching for entries by race', () => {
    it('returns a promise that resolves to the entry', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/entries/search/findBySignedUpToRace?race=http://localhost:8081/dinghyracing/api/directRaces/4')
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
                json: () => Promise.resolve(entriesScorpionAHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getEntry').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10') {
                return Promise.resolve(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"1"'}, model));
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/11') {
                return Promise.resolve(new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"'}, model));
            }
        });
        const promise = model.getEntriesByRace(new Race(raceScorpionAHAL, {version: '"0"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Collection([
            {hal: entryChrisMarshall1234ScorpionAHAL, metadata: {version: '"1"'}, model},
            {hal: entrySarahPascal6745ScorpionAHAL, metadata: {version: '"0"'}, model}
        ], entriesScorpionAHAL.page));
    });
});

describe('when a race is requested', () => {
    it('returns a promise that resolves to the race', async () => {
        fetch.mockImplementation((resource, options) => {
            if (resource === raceScorpionAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers([['ETag', '"3"']]),
                    json: () => Promise.resolve(raceScorpionAHAL)
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getRace(raceScorpionAHAL._links.self.href);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: raceScorpionAHAL, metadata: {version: '"3"'}, model});
    });
    it('throws an error when race is not returned', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === raceScorpionAHAL._links.self.href) {
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getRace(raceScorpionAHAL._links.self.href)).rejects.toThrowError('HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404');
    });
});

describe('when a competitor is requested', () => {
    it('returns a promise that resolves to the competitor', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers([['ETag', '"0"']]), 
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getCompetitor(competitorChrisMarshallHAL._links.self.href);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: competitorChrisMarshallHAL, metadata: {version: '"0"'}, model});
    });
    it('throws an error when competitor is not returned', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getCompetitor(competitorChrisMarshallHAL._links.self.href)).rejects.toThrowError('HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404');
    });
});

describe('when a dinghy is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy when the dinghy is found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers([['ETag','"0"']]), 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getDinghy(dinghy1234HAL._links.self.href);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: dinghy1234HAL, metadata: {version: '"0"'}, model});
    });
    it('throws an error when dinghy is not returned', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getDinghy(dinghy1234HAL._links.self.href)).rejects.toThrowError('HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404');
    });
});

describe('when a dinghy class is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy class when the dinghy class is found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers([['ETag', '"1"']]), 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getDinghyClass(dinghyClassScorpionHAL._links.self.href);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: dinghyClassScorpionHAL, metadata: {version: '"1"'}, model});
    });
    it('throws an error when dinghy class is not returned', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getDinghyClass(dinghyClassScorpionHAL._links.self.href)).rejects.toThrowError('HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404');
    });
});

describe('when updating a race', () => {
    it('if all values provided then updates race', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
                json: () => Promise.resolve(raceScorpionAHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.updateRace(new Race(raceScorpionAHAL, {version: '"0"'}, model), 'Scorpion A', new Date(), new Fleet(fleetScorpionHAL, {version: '"0"'}, model), 2700000, 5, RaceType.FLEET, StartType.CSCCLUBSTART);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: raceScorpionAHAL, metadata: {version: ''}, model});
    });
    it('if race does not exist throws error', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve()
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.updateRace(new Race(raceScorpionAHAL, {version: '"0"'}, model), 'Scorpion A', new Date(), new Fleet(fleetScorpionHAL, {version: '"0"'}, model), 2700000, 5, RaceType.FLEET, StartType.CSCCLUBSTART))
            .rejects.toThrowError('HTTP Error: 404 Not Found');
    });
    // TODO: Test expected parameters are supplied
});
describe('when setting a scoring abbreviation for an entry', () => {
    it('calls _update with correct parameters', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const _updateSpy = vi.spyOn(model, '_update').mockImplementation(async () => {return {hal: {...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'RET'}, metadata: {version: '"1"'}}});
        model.setScoringAbbreviation(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 'RET');
        expect(_updateSpy).toHaveBeenCalledWith(entryChrisMarshall1234ScorpionAHAL._links.self.href, {scoringAbbreviation: 'RET'});
    });
    it('returns entry', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, '_update').mockImplementation(async () => {return {hal: {...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'RET'}, metadata: {version: '"1"'}}});
        model.setScoringAbbreviation(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 'RET');
        expect(await model.setScoringAbbreviation(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 'RET')).toEqual(new Entry({...entryChrisMarshall1234ScorpionAHAL, scoringAbbreviation: 'RET'}, {version: '"1"'}, model));
    });
});
describe('when provided with a duration in ISO 8601 format', () => {
    it('converts pt12h13m17.08s to 43,997,080 milliseconds', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('pt12h13m17.08s');
        expect(result).toBe(43997080);
    });
    it('converts PT12H13M17,08S to 43,997,080 milliseconds', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT12H13M17,08S');
        expect(result).toBe(43997080);
    });
    it('converts +PT12H13M17.08S to 43,997,080 milliseconds', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('+PT12H13M17.08S');
        expect(result).toBe(43997080);
    });
    it('converts PT+12H13M17.08S to 43,997,080 milliseconds', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT+12H13M17.08S');
        expect(result).toBe(43997080);
    });
    it('converts PT12H+13M17.08S to 43,997,080 milliseconds', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT12H+13M17.08S');
        expect(result).toBe(43997080);
    });
    it('converts PT12H13M+17.08S to 43,997,080 milliseconds', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT12H13M+17.08S');
        expect(result).toBe(43997080);
    });
    it('converts PT23M to 1,380,000 milliseconds', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT23M');
        expect(result).toBe(1380000);
    });
    it('converts PT1H15M to 4,500,000 milliseconds', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const result = model.convertISO8601DurationToMilliseconds('PT1H15M');
        expect(result).toBe(4500000);
    });
    it('throws error on -PT1H', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('-PT1H');
        }).toThrow(TypeError);
    });
    it('throws error on P1YT1H13M', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('P1YT1H13M');
        }).toThrow(TypeError);
    });
    it('throws error on P1DT12H13M', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('P1DT12H13M');
        }).toThrow(TypeError);
    });
    it('throws error on P1MT12H13M', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('P1MT12H13M');
        }).toThrow(TypeError);
    });
    it('throws error on P1WT12H13M', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('P1WT12H13M');
        }).toThrow(TypeError);
    });
    it('throws error on PT12H13', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('PT12H13');
        }).toThrow(TypeError);
    });
    it('throws error on PT12H13M12', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('PT12H13M12');
        }).toThrow(TypeError);
    });
    it('throws error on PT12', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        expect(() => {
            const result = model.convertISO8601DurationToMilliseconds('PT12');
        }).toThrow(TypeError);
    });
});
describe('when adding a lap to a race', () => {
    it('calls fetch with the address of the resource and a body containing the lap time divided by 1000', async () => {
        const fetchSpy = fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
                json: () => Promise.resolve(entryChrisMarshall1234ScorpionAHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.addLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: entryChrisMarshall1234ScorpionAHAL, metadata: {version: ''}, model: model});
        expect(fetchSpy).toHaveBeenCalledWith(entryChrisMarshall1234ScorpionAHAL._links.self.href + '/addLap', {method: 'PATCH', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, body: JSON.stringify({time: 1})});
    });
    it('throws an error when lap update fails', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.addLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 1000)).rejects.toThrowError('HTTP Error: 404 Not Found');
    });
});
describe('when removing a lap from an entry in a race', () => {
    it('calls fetch with the address of the entry remove lap and a body identifying the lap to remove', async () => {
        const fetchSpy = fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
                json: () => Promise.resolve(entryChrisMarshall1234ScorpionAHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.removeLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}), new Lap({...lap1HAL, number: 1, time: 1000}, {version: '"0"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: entryChrisMarshall1234ScorpionAHAL, metadata: {version: ''}, model: model});
        expect(fetchSpy).toHaveBeenCalledWith(entryChrisMarshall1234ScorpionAHAL._links.self.href + '/removeLap', {method: 'PATCH', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, body: JSON.stringify({...lap1HAL, number: 1, time: 1000})});
    });
    it('throws an error when lap removal fails', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.removeLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}), {'number': 1, 'time': 1000})).rejects.toThrowError('HTTP Error: 404 Not Found');
    });
});
describe('when updating the last lap for an entry in a race', () => {
    it('calls fetch with the address of the entry update lap and the new time for the lap divided by 1000', async () => {
        const fetchSpy = fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
                json: () => Promise.resolve(entryChrisMarshall1234ScorpionAHAL)
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.updateLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 2000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: entryChrisMarshall1234ScorpionAHAL, metadata: {version: ''}, model});
        expect(fetchSpy).toHaveBeenCalledWith(entryChrisMarshall1234ScorpionAHAL._links.self.href + '/updateLap', {method: 'PATCH', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, body: JSON.stringify({time: 2})});
    });
    it('throws an error when lap update fails', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.updateLap(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 2000)).rejects.toThrowError('HTTP Error: 404 Not Found');
    });
});
describe('when a StartSequence is requested', () => {
    it('returns a promise that resolves to a success containing a StartSequence for the races between the start and end times', async () => {
        vi.useFakeTimers().setSystemTime(new Date('2021-10-14T10:10:00Z'));
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getFleet').mockImplementation((url) => {
            switch (url) {
                case 'http://localhost:8081/dinghyracing/api/races/4/fleet':
                    return Promise.resolve(new Fleet(fleetScorpionHAL, {version: '"0"'}, model));
                case 'http://localhost:8081/dinghyracing/api/races/7/fleet':
                    return Promise.resolve(new Fleet(fleetGraduateHAL, {version: '"0"'}, model));
                case 'http://localhost:8081/dinghyracing/api/races/17/fleet':
                    return Promise.resolve(new Fleet(fleetCometHAL, {version: '"0"'}, model));
                case 'http://localhost:8081/dinghyracing/api/races/8/fleet':
                    return Promise.resolve(new Fleet(fleetHandicapHAL, {version: '"0"'}, model));
                default:
                    return null;
            }
        });
        const raceScorpionA = new Race(raceScorpionAHAL, {version: '"0"'}, model);
        const raceGraduateA = new Race(raceGraduateAHAL, {version: '"0"'}, model);
        const raceCometA = new Race(raceCometAHAL, {version: '"0"'}, model);
        const raceHandicapA = new Race(raceHandicapAHAL, {version: '"0"'}, model);

        const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];

        const scorpionClassFlag = {name: 'Scorpion Class Flag'};
        const preparatoryFlag = {name: 'Blue Peter'};
        const graduateClassFlag = {name: 'Graduate Class Flag'};
        const cometClassFlag = {name: 'Comet Class Flag'};
        const handicapClassFlag = {name: 'Handicap Class Flag'};

        const scorpionWarningVisualSignal = {flags: [scorpionClassFlag], flagsState: FlagState.RAISED};
        const scorpionWarningSoundSignal = {description: 'One'};
        const graduateWarningVisualSignal = {flags: [graduateClassFlag], flagsState: FlagState.RAISED};
        const graduateWarningSoundSignal = {description: 'One'};
        const cometWarningVisualSignal = {flags: [cometClassFlag], flagsState: FlagState.RAISED};
        const cometWarningSoundSignal = {description: 'One'};
        const handicapWarningVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.RAISED};
        const handicapWarningSoundSignal = {description: 'One'};
        const preparatoryVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.RAISED};
        const preparatorySoundSignal = {description: 'One'};
        const scorpionStartVisualSignal = {flags: [scorpionClassFlag], flagsState: FlagState.LOWERED};
        const scorpionStartSoundSignal = {description: 'One'};
        const graduateStartVisualSignal = {flags: [graduateClassFlag], flagsState: FlagState.LOWERED};
        const graduateStartSoundSignal = {description: 'One'};
        const cometStartVisualSignal = {flags: [cometClassFlag], flagsState: FlagState.LOWERED};
        const cometStartSoundSignal = {description: 'One'};
        const handicapStartVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.LOWERED};
        const handicapStartSoundSignal = {description: 'One'};
        const endSequenceVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.LOWERED};
        
        const scorpionWarningSignal = {meaning: 'Warning signal', time: raceScorpionA.plannedStartTime.getTime() - 600000, soundSignal: scorpionWarningSoundSignal, visualSignal: scorpionWarningVisualSignal};
        const graduateWarningSignal = {meaning: 'Warning signal', time: raceGraduateA.plannedStartTime.getTime() - 600000, soundSignal: graduateWarningSoundSignal, visualSignal: graduateWarningVisualSignal};
        const cometWarningSignal = {meaning: 'Warning signal', time: raceCometA.plannedStartTime.getTime() - 600000, soundSignal: cometWarningSoundSignal, visualSignal: cometWarningVisualSignal};
        const handicapWarningSignal = {meaning: 'Warning signal', time: raceHandicapA.plannedStartTime.getTime() - 600000, soundSignal: handicapWarningSoundSignal, visualSignal: handicapWarningVisualSignal};
        
        const preparatorySignal = {meaning: 'Preparatory signal', time: raceScorpionA.plannedStartTime.getTime() - 300000, soundSignal: preparatorySoundSignal, visualSignal: preparatoryVisualSignal};
        const scorpionStartSignal = {meaning: 'Starting signal', time: raceScorpionA.plannedStartTime.getTime(), soundSignal: scorpionStartSoundSignal, visualSignal: scorpionStartVisualSignal};
        const graduateStartSignal = {meaning: 'Starting signal', time: raceGraduateA.plannedStartTime.getTime(), soundSignal: graduateStartSoundSignal, visualSignal: graduateStartVisualSignal};
        const cometStartSignal = {meaning: 'Starting signal', time: raceCometA.plannedStartTime.getTime(), soundSignal: cometStartSoundSignal, visualSignal: cometStartVisualSignal};
        const endSequenceSignal = {meaning: 'Start sequence finished', time: raceHandicapA.plannedStartTime.getTime(), soundSignal: null, visualSignal: endSequenceVisualSignal};
        const handicapStartSignal = {meaning: 'Starting signal', time: raceHandicapA.plannedStartTime.getTime(), soundSignal: handicapStartSoundSignal, visualSignal: handicapStartVisualSignal};
        
        const StartSequence = model.getStartSequence(races);
        const promise = StartSequence.getSignals();
        const signals = await promise;

        expect(promise).toBeInstanceOf(Promise);
        expect(signals.length).toBe(10);
        expect(signals).toEqual(expect.arrayContaining([scorpionWarningSignal, preparatorySignal, graduateWarningSignal, scorpionStartSignal, cometWarningSignal, graduateStartSignal, handicapWarningSignal, endSequenceSignal, cometStartSignal, handicapStartSignal]));

        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });
    describe('when race is a pursuit race', () => {
        describe('when race is an open handicap', () => {
            it('provides the base class to be used for the fleet when calculating start offsets', async () => {
                // open handicap is defined as a fleet with no explicit classes set and RaceStartSequence needs a base class to caclculate offsets so additional action is required by SylphModel to supply this class
                vi.useFakeTimers().setSystemTime(new Date('2021-10-14T10:10:00Z'));
                const dinghyClassOptimistHAL = {name: 'Optimist (Club)', crewSize: 1, portsmouthNumber: 1835, externalName: null, '_links': { 'self': { 'href': 'http://localhost:8081/dinghyracing/api/dinghyClasses/31' }, 'dinghyClass': { 'href': 'http://localhost:8081/dinghyracing/api/dinghyClasses/31' } } };
                const model = new SylphModel(httpRootURL, wsRootURL);
                vi.spyOn(model, 'getFleet').mockImplementation((url) => {
                    switch (url) {
                        case 'http://localhost:8081/dinghyracing/api/races/9/fleet':
                            return Promise.resolve(new Fleet(fleetHandicapHAL, {version: '"0"'}, model));
                        default:
                            return null;
                    }
                });
                vi.spyOn(model, 'getDinghyClassesFromURL').mockImplementation((url) => {
                    switch (url) {
                        case httpRootURL + '/dinghyClasses/search/findByDinghySignedUpToRace?race=http://localhost:8081/dinghyracing/api/directRaces/9':
                            return Promise.resolve(new Collection([
                                new DinghyClass(dinghyClassCometHAL, {version: '"0"'}, model),
                                new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)
                            ], {"size": 20, "totalElements": 2, "totalPages": 1, "number": 0}));
                        case 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses':
                            return Promise.resolve(new Collection([
                                new DinghyClass(dinghyClassCometHAL, {version: '"0"'}, model),
                                new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model),
                                new DinghyClass(dinghyClassOptimistHAL, {version: '"0"'}, model)
                            ], {"size": 20, "totalElements": 3, "totalPages": 1, "number": 0}));
                    }
                });
                const racePursuitA = new Race(racePursuitAHAL, {version: '"0"'}, model);

                const handicapClassFlag = {name: 'Handicap Class Flag'};
                const preparatoryFlag = {name: 'Blue Peter'};

                const handicapWarningVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.RAISED};
                const handicapWarningSoundSignal = {description: 'One'};
                const handicapWarningSignal = {meaning: 'Warning signal', time: racePursuitA.plannedStartTime.getTime() - 300000, visualSignal: handicapWarningVisualSignal, soundSignal: handicapWarningSoundSignal};
                const preparatoryVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.RAISED};
                const preparatorySoundSignal = {description: 'One'};
                const preparatorySignal = {meaning: 'Preparatory signal', time: racePursuitA.plannedStartTime.getTime() - 240000, visualSignal: preparatoryVisualSignal, soundSignal: preparatorySoundSignal};
                const oneMinuteVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.LOWERED};
                const oneMinuteSoundSignal = {description: 'One long'};
                const oneMinuteSignal = {meaning: 'One minute', time: racePursuitA.plannedStartTime.getTime() - 60000, visualSignal: oneMinuteVisualSignal, soundSignal: oneMinuteSoundSignal};


                const handicapStartVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.LOWERED};
                const handicapStartSoundSignal = {description: 'One'};
                const handicapStartSignal = {meaning: 'Starting signal', time: racePursuitA.plannedStartTime.getTime(), soundSignal: handicapStartSoundSignal, visualSignal: handicapStartVisualSignal};
                const cometStartSoundSignal = {description: 'One'};
                const cometStartSignal = {meaning: 'Comet start', time: racePursuitA.plannedStartTime.getTime() + 920000, soundSignal: cometStartSoundSignal};
                const scorpionStartSoundSignal = {description: 'One'};
                const scorpionStartSignal = {meaning: 'Scorpion start', time: racePursuitA.plannedStartTime.getTime() + 1166000, soundSignal: scorpionStartSoundSignal};

                const signals = await model.getStartSequence([racePursuitA]).getSignals();

                expect(signals).toHaveLength(6);
                expect(signals).toEqual(expect.arrayContaining([handicapWarningSignal, preparatorySignal, oneMinuteSignal, handicapStartSignal, cometStartSignal, scorpionStartSignal]));
                        
                vi.runOnlyPendingTimers();
                vi.useRealTimers();
            });
        });
    });
    describe('when races are of different types', () => {
        it('throws error', () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const raceScorpionA = new Race(raceScorpionAHAL, {version: '"0"'}, model);
            const racePursuitA = new Race(racePursuitAHAL, {version: '"0"'}, model);
            const races = [raceScorpionA, racePursuitA];
            expect(() => model.getStartSequence(races)).toThrow('All races in a start sequence must be of the same type.');
        })
    })
});
describe('when updating an entries position in the race', () => {
    it('if race exists and entry exists and URLs provided and position provided then updates position', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/directRaces/4/updateEntryPosition?entry=http://localhost:8081/dinghyracing/api/entries/10&position=2') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: () => Promise.resolve(raceScorpionAHAL)
                });
            };
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.updateEntryPosition(new Race(raceScorpionAHAL, {version: '"0"'}, model), new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 2);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: raceScorpionAHAL, metadata: {version: ''}, model});
    });
    it('throws error if update fails', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500, 
                statusText: 'Internal Server Error',
                json: () => Promise.resolve({})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(model.updateEntryPosition(new Race(raceScorpionAHAL, {version: '"0"'}, model), new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 2)).rejects.toThrowError('HTTP Error: 500 Internal Server Error');
    });
});
describe('when entry is requested', () => {
    describe('when dinghy has a crew', () => {
        it('returns a promise that resolves to a result indicating success and containing the entry when the entry is found', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === entryChrisMarshall1234ScorpionAHAL._links.self.href) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"1"']]),
                        json: () => Promise.resolve(entryChrisMarshall1234ScorpionAHAL)
                    });
                }
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const promise = model.getEntry(entryChrisMarshall1234ScorpionAHAL._links.self.href);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({hal: entryChrisMarshall1234ScorpionAHAL, metadata: {version: '"1"'}, model});
        });
    });
    it('throws an error when entry is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                headers: new Headers(),
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        await expect(() => model.getEntry(entryChrisMarshall1234ScorpionAHAL._links.self.href)).rejects.toThrowError('HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404');
    });
});
describe('when retrieving dinghies by sail number', () => {
    it('returns a success result containing dinghies with the provided sail number', async () => {
        const dinghy1234ScorpionHAL = {sailNumber: '1234', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } };
        const dinghy1234GraduateHAL = {sailNumber: '1234', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } };
        const dinghy1234CollectionHAL = {_embedded: {dinghies: [
            dinghy1234ScorpionHAL, dinghy1234GraduateHAL
        ]}, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/search/findBySailNumber?sailNumber=1234&page=0&size=20' } }, page: {size: 20, totalElements: 2, totalPages: 1, number: 0 }}

        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findBySailNumber?sailNumber=1234') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghy1234CollectionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag','"0"']]), 
                    json: () => Promise.resolve(dinghy1234ScorpionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag','"0"']]), 
                    json: () => Promise.resolve(dinghy1234GraduateHAL)
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getDinghiesBySailNumber('1234');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Collection([
            new Dinghy(dinghy1234ScorpionHAL, {version: '"0"'}, model),
            new Dinghy(dinghy1234GraduateHAL, {version: '"0"'}, model)
        ], dinghy1234CollectionHAL.page));
    });
    describe('when no dinghies are found for the provided sail number', () => {
        it('returns a collection with an empty entitties array', async () =>{
            fetch.mockImplementation(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    statusText: 'OK', headers: new Headers(),
                    json: () => Promise.resolve({_embedded: {dinghies: []},_links: {self: {href: "http://localhost:8081/dinghyracing/api/dinghies/search/findBySailNumber?sailNumber=1497&page=0&size=20"}},
                        page: {size: 20,totalElements: 0,totalPages: 0,number: 0}})
                });
            });
            const model = new SylphModel(httpRootURL, wsRootURL);
            const promise = model.getDinghiesBySailNumber('1234');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual(new Collection([], {size: 20,totalElements: 0,totalPages: 0,number: 0}));
        });
    });
});
describe('when the crews that have sailed a dinghy are requested', () => {
    it('returns a promise that resolves to a collection containing the crews', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http://localhost:8081/dinghyracing/api/dinghies/2') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghyScorpion1234CrewsHAL)
                });
            }
            if (resource === dinghyScorpion1234CrewAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghyScorpion1234CrewAHAL)
                });
            }            
            if (resource === dinghyScorpion1234CrewBHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghyScorpion1234CrewBHAL)
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getCrewsByDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Collection([
            new Crew(dinghyScorpion1234CrewAHAL, {version: ''}, model),
            new Crew(dinghyScorpion1234CrewBHAL, {version: ''}, model)
        ], undefined));
    });
//     describe('when the crew only has a helm', () => {
//         const dinghy1234CrewAHAL = {helm: competitorChrisMarshallHAL, mate: null};
//         const dinghy1234CrewBHAL = {helm: competitorLiuBaoHAL, mate: competitorLouScrewHAL};
//         const dinghy1234CrewsHAL = {_embedded: {crews: [dinghy1234CrewAHAL, dinghy1234CrewBHAL]}, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http%3A%2F%2Flocalhost%3A8081%2Fdinghyracing%2Fapi%2Fdinghies%2F2'}}};
//         const dinghy1234CrewA = {helm: competitorChrisMarshall, mate: null};
//         const dinghy1234CrewB = {helm: competitorLiuBao, mate: competitorLouScrew};
//         const dinghy1234Crews = [dinghy1234CrewA, dinghy1234CrewB];

//         it('returns the crews', async () => {
//             fetch.mockImplementation((resource) => {
//                 if (resource === 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http://localhost:8081/dinghyracing/api/dinghies/2') {
//                     return Promise.resolve({
//                         ok: true,
//                         status: 200, headers: new Headers(), 
//                         json: () => Promise.resolve(dinghy1234CrewsHAL)
//                     });
//                 }
//                 else {
//                     return Promise.resolve({
//                         ok: false,
//                         status: 404,
//                         statusText: 'Not Found'
//                     });
//                 }
//             });
    
//             const model = new SylphModel(httpRootURL, wsRootURL);
//             const promise = model.getCrewsByDinghy(dinghy1234);
//             const result = await promise;
//             expect(promise).toBeInstanceOf(Promise);
//             expect(result).toEqual({'success': true, 'domainObject': dinghy1234Crews});
//         });
//     });
//     describe('when the dinghy does not have a uri', () => {
//         it('returns a promise that resolves to a result indicating failure', async () => {
//             const model = new SylphModel(httpRootURL, wsRootURL);
//             const promise = model.getCrewsByDinghy({sailNumber:'1234', dinghyClass: dinghyClassScorpion});
//             const result = await promise;
//             expect(promise).toBeInstanceOf(Promise);
//             expect(result).toEqual({'success': false, 'message': 'Cannot retrieve dinghy crews without URL for dinghy.'});
//         });
//     });
//     describe('when no crew has sailed in the dinghy', () => {
//         it('returns an empty crews', async () => {
//             const emptyCrewsHAL = {_links: {self: {href: 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http%3A%2F%2Flocalhost%3A8081%2Fdinghyracing%2Fapi%2Fdinghies%2F2'}}};
//             const emptyCrews = [];
//             fetch.mockImplementation((resource) => {
//                 if (resource === 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http://localhost:8081/dinghyracing/api/dinghies/2') {
//                     return Promise.resolve({
//                         ok: true,
//                         status: 200, headers: new Headers(), 
//                         json: () => Promise.resolve(emptyCrewsHAL)
//                     });
//                 }
//                 else {
//                     return Promise.resolve({
//                         ok: false,
//                         status: 404,
//                         statusText: 'Not Found'
//                     });
//                 }
//             });

//             const model = new SylphModel(httpRootURL, wsRootURL);
//             const promise = model.getCrewsByDinghy(dinghy1234);
//             const result = await promise;
//             expect(promise).toBeInstanceOf(Promise);
//             expect(result).toEqual({'success': true, 'domainObject': emptyCrews});
//         });
//     });
//     describe('when the dinghy does not exist', () => {
//         it('returns a failed result containing a message explaining the cause of the failure', async () =>{
//             fetch.mockImplementation((resource) => {
//                 return Promise.resolve({
//                     ok: false,
//                     status: 404,
//                     statusText: 'Not Found',
//                     json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
//                 });
//             });
//             const model = new SylphModel(httpRootURL, wsRootURL);
//             const promise = model.getDinghiesBySailNumber('1234');
//             const result = await promise;
//             expect(promise).toBeInstanceOf(Promise);
//             expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
//         });
//     });
});
describe('when a websocket message callback has been set for competitor creation', () => {
    it('calls the callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerCompetitorCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toBeCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerCompetitorCreationCallback(callback);
        model.registerCompetitorCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerCompetitorCreationCallback(callback1);
        model.registerCompetitorCreationCallback(callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerCompetitorCreationCallback(callback);
        model.unregisterCompetitorCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerCompetitorCreationCallback(callback1);
        model.registerCompetitorCreationCallback(callback2);
        model.unregisterCompetitorCreationCallback(callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for competitor update', () => {
    it('calls the callback', () => { 
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback);
        vi.advanceTimersByTime(1); // mock clock is ticking away in the background so only advance one millisecond to avaoid potentially hundreds of calls
        expect(callback).toHaveBeenCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback);
        model.registerCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback);
        vi.advanceTimersByTime(1); // advance by only one millisecond or function will be called a number of times based on mock clock ticks (essentially a random number of times)
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback1);
        model.registerCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback);
        model.unregisterCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback1);
        model.registerCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback2);
        model.unregisterCompetitorUpdateCallback('http://localhost:8081/dinghyracing/api/competitor/10', callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for entry creation', () => {
    it('calls the callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerEntryCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toBeCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerEntryCreationCallback(callback);
        model.registerEntryCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerEntryCreationCallback(callback1);
        model.registerEntryCreationCallback(callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerEntryCreationCallback(callback);
        model.unregisterEntryCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerEntryCreationCallback(callback1);
        model.registerEntryCreationCallback(callback2);
        model.unregisterEntryCreationCallback(callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for entry update', () => {
    it('calls the callback', () => { 
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        vi.advanceTimersByTime(1); // mock clock is ticking away in the background so only advance one millisecond to avaoid potentially hundreds of calls
        expect(callback).toHaveBeenCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        model.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        vi.advanceTimersByTime(1); // advance by only one millisecond or function will be called a number of times based on mock clock ticks (essentially a random number of times)
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback1);
        model.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        model.unregisterEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback1);
        model.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback2);
        model.unregisterEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for entry deletion', () => {
    it('calls the callback', () => { 
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        vi.advanceTimersByTime(1); // mock clock is ticking away in the background so only advance one millisecond to avaoid potentially hundreds of calls
        expect(callback).toHaveBeenCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        model.registerEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        vi.advanceTimersByTime(1); // advance by only one millisecond or function will be called a number of times based on mock clock ticks (essentially a random number of times)
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback1);
        model.registerEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        model.unregisterEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback1);
        model.registerEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback2);
        model.unregisterEntryDeletionCallback('http://localhost:8081/dinghyracing/api/entries/10', callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for race update', () => {
    it('calls the callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        model.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        model.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        model.unregisterRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        model.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback2);
        model.unregisterRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for race entry laps update', () => {
    it('calls the callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        model.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        model.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        model.unregisterRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        model.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback2);
        model.unregisterRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for dinghy creation', () => {
    it('calls the callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerDinghyCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toBeCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerDinghyCreationCallback(callback);
        model.registerDinghyCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerDinghyCreationCallback(callback1);
        model.registerDinghyCreationCallback(callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerDinghyCreationCallback(callback);
        model.unregisterDinghyCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerDinghyCreationCallback(callback1);
        model.registerDinghyCreationCallback(callback2);
        model.unregisterDinghyCreationCallback(callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for dinghy class creation', () => {
    it('calls the callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerDinghyClassCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toBeCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerDinghyClassCreationCallback(callback);
        model.registerDinghyClassCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerDinghyClassCreationCallback(callback1);
        model.registerDinghyClassCreationCallback(callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerDinghyClassCreationCallback(callback);
        model.unregisterDinghyClassCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerDinghyClassCreationCallback(callback1);
        model.registerDinghyClassCreationCallback(callback2);
        model.unregisterDinghyClassCreationCallback(callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for dinghy class update', () => {
    it('calls the callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        vi.advanceTimersByTime(1);
        expect(callback).toBeCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        model.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback1);
        model.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        model.unregisterDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback1);
        model.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback2);
        model.unregisterDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for fleet creation', () => {
    it('calls the callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerFleetCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toBeCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerFleetCreationCallback(callback);
        model.registerFleetCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerFleetCreationCallback(callback1);
        model.registerFleetCreationCallback(callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerFleetCreationCallback(callback);
        model.unregisterFleetCreationCallback(callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerFleetCreationCallback(callback1);
        model.registerFleetCreationCallback(callback2);
        model.unregisterFleetCreationCallback(callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
describe('when a websocket message callback has been set for fleet update', () => {
    it('calls the callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        vi.advanceTimersByTime(1);
        expect(callback).toBeCalled();
    });
    it('does not set another reference to the same callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        model.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback1);
        model.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback2);
        vi.advanceTimersByTime(1);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
    it('removes websocket message when requested', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback = vi.fn();
        model.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        model.unregisterFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        vi.advanceTimersByTime(1);
        expect(callback).not.toHaveBeenCalled();
    });
    it('does not remove functionally equivalent but different callback', () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        model.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback1);
        model.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback2);
        model.unregisterFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback1);
        vi.advanceTimersByTime(1);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });
});
it('provides a clock', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    expect(model.getClock()).toBeInstanceOf(Clock);
});
describe('when a signUp is requested', () => {
    it('returns a promise that resolves to a the signUp', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/entries/10/signedUpTo') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(signedUpChrisMarshallDinghy1234ScorpionAHAL)
                });
            }
        });
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getSignedUp(entryChrisMarshall1234ScorpionAHAL._links.signedUpTo.href);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({hal: signedUpChrisMarshallDinghy1234ScorpionAHAL, metadata: {version: ''}, model: model});
    });
});
describe('when signedUpTo is requested', () => {
    it('returns a promise that resolves to a collection of SignedUps', async () => {
        fetch.mockImplementation((resource, options) => {
            // signedUpTo
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4/signedUp') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(signedUpScorpionACollectionHAL)
                });
            }
            if (resource === signedUpChrisMarshallDinghy1234ScorpionAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"1"']]),
                    json: () => Promise.resolve(signedUpChrisMarshallDinghy1234ScorpionAHAL)
                });
            }
            if (resource === signedUpSarahPascalDinghy6745ScorpionAHAL._links.self.href) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"0"']]),
                    json: () => Promise.resolve(signedUpSarahPascalDinghy6745ScorpionAHAL)
                });
            }
        })
        const model = new SylphModel(httpRootURL, wsRootURL);
        const promise = model.getSignedUpTo('http://localhost:8081/dinghyracing/api/races/4/signedUp');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual(new Collection([
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"1"'}, model),
            new SignedUp(signedUpSarahPascalDinghy6745ScorpionAHAL, {version: '"0"'}, model)
        ], undefined));
    });
});
describe('when a lap is requested', () => {
    it('calls _read with correct parameters', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const _readSpy = vi.spyOn(model, '_read').mockImplementation(async () => {
            const lap1HAL = {number: 1, time: 'PT15M27S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/1' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/1' } }};
            return new Lap(lap1HAL, {version: '"0"'}, model);
        });
        await model.getLap(lap1HAL._links.self.href);
        expect(_readSpy).toHaveBeenCalledWith(lap1HAL._links.self.href);
    });
    it('returns the lap', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, '_read').mockImplementation(async () => {
            const lap1HAL = {number: 1, time: 'PT15M27S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/1' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/1' } }};
            return new Lap(lap1HAL, {version: '"0"'}, model);
        });
        expect(await model.getLap(lap1HAL._links.self.href)).toEqual(new Lap(lap1HAL, {version: '"0"'}, model));
    });
});
describe('when laps collection is requested', () => {
    it('calls getCollection with correct parameters', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const getCollectionSpy = vi.spyOn(model, 'getCollection').mockImplementation(async () => {
            return {hal: {_embedded: {laps: [
                lap1HAL, lap4HAL
            ]}, _links: {href: 'http://localhost:8081/dinghyracing/api/entries/10/laps'}}, metadata: {version: '""'}}
        });
        vi.spyOn(model, 'getLap').mockImplementation(vi.fn());
        model.getLaps(entryChrisMarshall1234ScorpionAHAL._links.laps.href);
        expect(getCollectionSpy).toHaveBeenCalledWith(entryChrisMarshall1234ScorpionAHAL._links.laps.href);
    });
    it('calls getLap with correct parameters', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getCollection').mockImplementation(async () => {
            return {hal: {_embedded: {laps: [
                lap1HAL, lap4HAL
            ]}, _links: {href: 'http://localhost:8081/dinghyracing/api/entries/10/laps'}}, metadata: {version: '""'}}
        });
        const getLapSpy = vi.spyOn(model, 'getLap').mockImplementation(vi.fn());
        await model.getLaps(entryChrisMarshall1234ScorpionAHAL._links.laps.href);
        expect(getLapSpy).toHaveBeenCalledWith('http://localhost:8081/dinghyracing/api/laps/1');
        expect(getLapSpy).toHaveBeenCalledWith('http://localhost:8081/dinghyracing/api/laps/4');
    });
    it('returns a collection containing the laps', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const lap1 = new Lap(lap1HAL, {version: '"0"'}, model);
        const lap2 = new Lap(lap4HAL, {version: '"0"'}, model);
        vi.spyOn(model, 'getCollection').mockImplementation(async () => {
            return {hal: {_embedded: {laps: [
                lap1HAL, lap4HAL
            ]}, _links: {href: 'http://localhost:8081/dinghyracing/api/entries/10/laps'}}, metadata: {version: '""'}}
        });
        vi.spyOn(model, 'getLap').mockImplementation(async (url) => {
            if (url === 'lap1HAL._links.self.href') {
                return lap1;
            }
            if (url === 'lap4HAL._links.self.href') {
                return lap2;
            }
        });
        expect(await model.getLaps(entryChrisMarshall1234ScorpionAHAL._links.laps.href)).toEqual(new Collection([lap1, lap2], {size: 2, totalElements: 2, totalPages: 1, number: 0}));
    });
});