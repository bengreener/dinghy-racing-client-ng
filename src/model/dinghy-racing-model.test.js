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

import DinghyRacingModel, { SortOrder }  from './dinghy-racing-model';
import { httpRootURL, wsRootURL, competitorsCollectionHAL, 
    dinghiesCollectionHAL, dinghiesScorpionCollectionHAL, 
    dinghyClassCollectionHAL, dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassCometHAL, dinghy1234HAL, dinghy2726HAL, dinghy6745HAL,
    fleetsHAL, fleetScorpionHAL, fleetHandicapHAL, fleetGraduateHAL, fleetCometHAL,
    raceScorpion_AHAL, raceGraduate_AHAL, raceHandicap_AHAL,
    dinghyScorpion1234CrewsHAL,
    dinghyClasses, dinghyClassScorpion, dinghyClassGraduate, 
    fleets, fleetScorpion, fleetHandicap, fleetScorpionDinghyClassHAL, fleetHandicapDinghyClassHAL, fleetGraduateDinghyClassHAL, fleetCometDinghyClassHAL,
    dinghies, dinghiesScorpion, dinghy1234, dinghy2726, dinghy6745, dinghy826,
    races, racesCollectionHAL, raceScorpionA, raceGraduateA, raceCometA,
    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, competitorLiuBaoHAL, competitorLouScrewHAL,
    competitorsCollection, competitorChrisMarshall, competitorLouScrew, competitorSarahPascal, competitorLiuBao, 
    entriesScorpionAHAL, entriesCometAHAL, entryChrisMarshallDinghy1234HAL, entriesHandicapAHAL,
    entriesScorpionA, entriesCometA, entriesHandicapA,
    raceHandicapA, racePursuitA, entryChrisMarshallScorpionA1234, competitorJillMyer, 
    entrySarahPascalScorpionA6745, entryJillMyerCometA826, entryChrisMarshallHandicapA1234,
    dinghyScorpion1234Crews,
    dinghyClassComet
} from './__mocks__/test-data';
import {
    findByRaceGraduate_AHAL_bigData, signedUpGraduateAHAL_bigData,
    competitorCarmenWhiting, competitorAjDavis, competitorIvanPlatt, competitorNellPowell, competitorGraceRees, competitorArranAshley, competitorMacySmall,
    competitorDestinyBourne, competitorDominicBarnett, competitorAlaraTaylor, competitorKieraDaniels, competitorAmariBarber, competitorHazelWheeler, competitorLucasMillward,
    competitorLouiseBarron, competitorAlastairKhatun, competitorSamsonMcGowan, competitorCalebParkinson, competitorInayaRegan, competitorLeiaHaynes, competitorNatanNewman,
    competitorJamesonSharpe, competitorElifPugh, competitorWilfredMead, competitorFrankySheppard, competitorLeniTyler, competitorMahnoorHope, competitorAnthonyDillon,
    competitorZackaryLindsay, competitorKhalilRushton, competitorNoelHills, competitorDanielLittle, competitorAizaAustin, competitorWilliamMorrison, competitorAugustKhan,
    competitorYuvrajSheppard, competitorMaximFlynn, competitorCezarWhelan, competitorBaileyPreston, competitorNadiaBarrow, competitorZimalGrainger, competitorRuqayyahWhittle,
    competitorJaysonGraves, competitorBellaBourne, competitorCobieBaldwin, competitorIrisSandhu, competitorEsmeHyde, competitorDakotaMoss, competitorLeoEaton, competitorDarcyEmery,
    competitorDiegoHoughton, competitorShelbyMiller, competitorMaceyVaughan, competitorLaineyAbbott, competitorPaddyLowe, competitorBaaniManning, competitorSarahPritchard,
    competitorLucienHoare, competitorSerenDuffy, competitorBiancaSwan,

    dinghy1, dinghy290, dinghy2009, dinghy2097, dinghy2373, dinghy2471, dinghy2482, dinghy2725, dinghy2849, dinghy2862, dinghy2889, dinghy2910, dinghy2912, dinghy2928,
    dinghy2931, dinghy2938, dinghy2969, dinghy2970, dinghy2971, dinghy2973, dinghy2985, dinghy2987, dinghy3006, dinghy3009, dinghy3014, dinghy3015, dinghy3020, dinghy3021,
    dinghy3022, dinghy3088,

    entriesGraduateA_bigData
} from './__mocks__/test-data-more-data';
import FlagState from './domain-classes/flag-state';
import RaceType from './domain-classes/race-type';
import FlagRole from './domain-classes/flag-role';
import Clock from './domain-classes/clock';

global.fetch = jest.fn();

beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks();
    jest.restoreAllMocks();
});

describe('when creating a new object via REST', () => {
    it('Handles a situation where no body is returned', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            return Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.create('someobject', {'prop1': 'foo', 'prop2': 'bar'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Bad Request'});
    });
});

describe('when reading a resource from REST', () => {
    it('returns a promise that resolves to a result indicating success and containing the hal+json resource when http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers([['ETag', '"48"']]),
                json: () => Promise.resolve(dinghyClassCollectionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.read('dinghyClasses?sort=name,asc');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({success: true, domainObject: dinghyClassCollectionHAL, eTag: '"48"'});
    });
    it('returns a promise that resolves to a result indicating failure when resource is not found and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.read('unknown');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
    });
    it('returns a promise that resolves to a result indicating failure when an error causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.read('dinghyClasses?sort=name,asc');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
});

describe('when updating an object via REST', () => {
    it('returns a promise that resolves to a success response when update is successful', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
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
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.update(httpRootURL, {});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
});

describe('when deleting an object via REST', () => {
    it('returns a promise that resolves to a success response when update is successful', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/entries/6' && options.method === 'DELETE') {
                return Promise.resolve({
                    ok: true,
                    status: 204,
                    headers: new Headers(),
                    json: () => Promise.resolve({})
                });
            }
            else {
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    headers: new Headers(),
                    statusText: 'Not Found',
                    json: () => Promise.resolve({})
                });
            }
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.delete('http://localhost:8081/dinghyracing/api/entries/6');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result.success).toBeTruthy();
    });
    it('resturns a promise that resolves to a failed response and providing the cause of failure when update is unsuccessful', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.delete('http://localhost:8081/dinghyracing/api/entries/6');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
});

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
                status: 200, headers: new Headers(), 
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const newDinghyClass = {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion', crew: 2};
        const promise = dinghyRacingModel.createDinghyClass(newDinghyClass);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: dinghyClassScorpion});
    });
    it('returns a promise that resolves to a result indicating success when dinghy class is created with http status 201', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 201,
                headers: new Headers(),
                json: () => Promise.resolve(dinghyClassScorpionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: dinghyClassScorpion});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 400 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Bad Request Message: Some error resulting in HTTP 400'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 404 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 408 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 408, 
                statusText: 'Request Timeout',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 408'}, 'message': 'Some error resulting in HTTP 408'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 408 Request Timeout Message: Some error resulting in HTTP 408'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 409 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409,
                statusText: 'Conflict',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 409 Conflict Message: Some error resulting in HTTP 409'});
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 500 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 500'}, 'message': 'Some error resulting in HTTP 500'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Internal Server Error Message: Some error resulting in HTTP 500'}); 
    });
    it('returns a promise that resolves to a result indicating failure when dinghy class is not created with http status 503 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 503'}, 'message': 'Some error resulting in HTTP 503'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghyClass({...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Service Unavailable Message: Some error resulting in HTTP 503'}); 
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

describe('when searching for a dinghy class by name', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy class when dinghy class is found and http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
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
                statusText: 'Not Found',
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghyClassByName('Scorpion');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
})

describe('when creating a new race', () => {
    it('returns a promise that resolves to a result indicating success when race is created with http status 200', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body === '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","fleet":"http://localhost:8081/dinghyracing/api/fleets/1","type":"FLEET","startType":"CSCCLUBSTART","duration":2700,"plannedLaps":null,"lapsSailed":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"dinghyClasses":[],"url":""}') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(raceScorpion_AHAL)
                });
            } 
            else {
                return Promise.resolve({
                    ok: false,
                    status: 400, 
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Data passed to fetch was not in format required to create a Race'}, 'message': 'Data passed to fetch was not in format required to create a Race'})
                });
            }
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getFleet').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleetScorpion})});
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'fleet': fleetScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: raceScorpionA});
    });
    it('returns a promise that resolves to a result indicating success when race is created with http status 201', async () => {
        fetch.mockImplementationOnce((resource, options) => {// check format of data passed to fetch to reduce risk of false positive
            // check format of data passed to fetch to reduce risk of false positive
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body === '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","fleet":"http://localhost:8081/dinghyracing/api/fleets/1","type":"FLEET","startType":"CSCCLUBSTART","duration":2700,"plannedLaps":null,"lapsSailed":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"dinghyClasses":[],"url":""}') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(raceScorpion_AHAL)
                });
            } 
            else {
                return Promise.resolve({
                    ok: false,
                    status: 400, 
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Data passed to fetch was not in format required to create a Race'}, 'message': 'Data passed to fetch was not in format required to create a Race'})
                });
            }
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getFleet').mockImplementation(() => {return Promise.resolve({success: true, domainObject: fleetScorpion})});
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'fleet': fleetScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: raceScorpionA});
    });
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 400 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'fleet': fleetScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Bad Request Message: Some error resulting in HTTP 400'}); 
    });
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 404 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'fleet': fleetScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'}); 
    });
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 408 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 408,
                statusText: 'Request Timeout',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 408'}, 'message': 'Some error resulting in HTTP 408'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'fleet': fleetScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 408 Request Timeout Message: Some error resulting in HTTP 408'}); 
    });
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 409 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409,
                statusText: 'Conflict',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 409'}, 'message': 'Some error resulting in HTTP 409'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'fleet': fleetScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 409 Conflict Message: Some error resulting in HTTP 409'});
    });
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 500 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 500'}, 'message': 'Some error resulting in HTTP 500'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'fleet': fleetScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Internal Server Error Message: Some error resulting in HTTP 500'}); 
    });
    it('returns a promise that resolves to a result indicating failure when race is not created with http status 503 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 503'}, 'message': 'Some error resulting in HTTP 503'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'fleet': fleetScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Service Unavailable Message: Some error resulting in HTTP 503'}); 
    });
    it('returns a promise that resolves to a result indicating failure when race is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'fleet': fleetScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
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
                status: 200, headers: new Headers(), 
                json: () => Promise.resolve(dinghyClassCollectionHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghyClasses();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghyClasses});
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
                fetch.mockImplementation(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL)
                    });
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL_p0)
                    });
                });
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getDinghyClasses();
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': dinghyClasses});
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
                const dinghyClasses_p0 = [dinghyClassScorpion, dinghyClassGraduate];
                fetch.mockImplementation(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL)
                    });
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL_p0)
                    });
                });
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getDinghyClasses(1);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': dinghyClasses_p0});
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
                const dinghyClasses_p0 = [dinghyClassScorpion, dinghyClassGraduate];
                fetch.mockImplementation(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL)
                    });
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL_p0)
                    });
                });
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getDinghyClasses(null, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': dinghyClasses_p0});
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
                const dinghyClasses_p0 = [dinghyClassScorpion, dinghyClassGraduate];
                fetch.mockImplementation(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL)
                    });
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCollectionHAL_p0)
                    });
                });
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getDinghyClasses(0, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': dinghyClasses_p0});
            });
        });
    });
    it('returns a promise that resolves to a result indicating failure when list of dinghy classes is not found and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghyClasses('unknown');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
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

describe('when retrieving a list of races that start at or after a specified time', () => {
    // Can this test can be affected by BST, or other time zones (yes, if timezone changes test data (races) will need to be adjusted to reflect the change in the timezone (currently set up for British Summer Time))
    it('returns the races that start at or after the specified time', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2021-10-14T10:00:00.000Z') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(racesCollectionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometDinghyClassHAL)
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

        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getRacesOnOrAfterTime(new Date('2021-10-14T10:00:00.000Z'));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': races});
    });
    describe('when there are more races than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('returns a success result containing all the races that start at or after the specified time', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z') {
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
        
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'));
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': races});
            });
        });
        describe('when page number supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                const races_p0 = [raceScorpionA, raceGraduateA];
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0') {
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
        
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'), 0);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': races_p0});
            });
        });
        describe('when size is supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                const races_p0 = [raceScorpionA, raceGraduateA];
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&size=2') {
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
        
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'), null, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': races_p0});
            });
        });
        describe('when page and size supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                const races_p0 = [raceScorpionA, raceGraduateA];
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=2') {
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
        
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'), 0, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': races_p0});
            });
        });
    });
});

describe('when signing up to a race', () => {
    it('if race exists and URL provided and helm exists and URL provided and dinghy exist and URL provided and crew exists and URL provided then creates race entry', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const raceMatch = {'race': raceScorpionA.url, 'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries') && (options.body === JSON.stringify(raceMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
            else {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({success: true, domainObject: entryChrisMarshallScorpionA1234});
    });
    it('if race exists and URL provided helm exists and URL provided and dinghy exist and URL provided and crew not provided then creates race entry', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const raceMatch = {'race': raceScorpionA.url, 'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries') && (options.body === JSON.stringify(raceMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
            else {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': true, domainObject: entryChrisMarshallScorpionA1234});
    });
    it('if race exists and name and planned start time provided and helm exists and name provided and dinghy exists and sail number and class provided and crew exists and name provided then creates race entry', async () => {
        const race = {...raceScorpionA, 'url': ''};
        const helm = {...competitorChrisMarshall, 'url': null};
        const dinghy = {...dinghy1234, 'url': ''};
        const crew = {...competitorLouScrew, 'url': null};
        fetch.mockImplementationOnce((resource, options) => {
            const raceMatch = {'race': raceScorpionA.url, 'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries') && (options.body === JSON.stringify(raceMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
            else {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': raceScorpionA}));
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Chris Marshall') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            }
            else if (name === 'Lou Screw') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const promise = dinghyRacingModel.createEntry(race, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': true, domainObject: entryChrisMarshallScorpionA1234});
    });
    it('if race exists and name and planned start time provided and helm exists and name provided and dinghy exists and sail number and class provided and crew not provided then creates race entry', async () => {
        const race = {...raceScorpionA, 'url': null};
        const helm = {...competitorChrisMarshall, 'url': ''};
        const dinghy = {...dinghy1234, 'url': null};
        fetch.mockImplementationOnce((resource, options) => {
            const raceMatch = {'race': raceScorpionA.url, 'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries') && (options.body === JSON.stringify(raceMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
            else {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': raceScorpionA}));
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Chris Marshall') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall})
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const promise = dinghyRacingModel.createEntry(race, helm, dinghy);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': true, domainObject: entryChrisMarshallScorpionA1234});
    });
    it('race does not exist helm exists and URL provided dinghy exists and sail number and class provided crew exists and URL provided then does not create entry and provides message indicating cause of failure', async () => {
        const race = {...raceScorpionA, 'name': 'Race Nope', 'url': null};
        const helm = {...competitorChrisMarshall, 'url': null};
        const dinghy = {...dinghy1234, 'url': ''};
        const crew = {...competitorLouScrew, 'url': null};
        fetch.mockImplementationOnce((resource, options) => {
            const raceMatch = {'race': raceScorpionA.url, 'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries') && (options.body === JSON.stringify(raceMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => Promise.resolve({'success': false, 'message': 'Race not found'}));
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Chris Marshall') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            }
            else if (name === 'Lou Screw') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const promise = dinghyRacingModel.createEntry(race, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Race not found'}); 
    });
    it('race exists url provided helm does not exist dinghy exists url provided crew exists and name provided', async () => {
        const race = {...raceScorpionA};
        const helm = {...competitorChrisMarshall, 'name': 'Lucy Liu', 'url': ''};
        const dinghy = {...dinghy1234};
        const crew = {...competitorLouScrew, 'url': ''};
        fetch.mockImplementationOnce((resource, options) => {
            const raceMatch = {'race': raceScorpionA.url, 'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries') && (options.body === JSON.stringify(raceMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Lucy Liu') {
                return Promise.resolve({'success': false, 'message': 'Competitor not found'});
            }
            else if (name === 'Lou Screw') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const promise = dinghyRacingModel.createEntry(race, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Competitor not found'});
    });
    it('race exists and name provided helm exists and name provided dinghy does not exists crew exists and name provided', async () => {
        const race = {...raceScorpionA, 'url': ''};
        const helm = {...competitorChrisMarshall, 'url': ''};
        const dinghy = {...dinghy1234, 'sailNumber': 'xyz', 'url': null};
        const crew = {...competitorLouScrew, 'url': null};
        fetch.mockImplementationOnce((resource, options) => {
            const raceMatch = {'race': raceScorpionA.url, 'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries') && (options.body === JSON.stringify(raceMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': raceScorpionA}));
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Chris Marshall') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            }
            else if (name === 'Lou Screw') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': false, 'message': 'Dinghy does not exist'}));
        const promise = dinghyRacingModel.createEntry(race, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Dinghy does not exist'});
    });
    it('race exists url provided helm exists url provided, dinghy exists sail number and class provided crew does not exist', async () => {
        const race = {...raceScorpionA};
        const helm = {...competitorChrisMarshall};
        const dinghy = {...dinghy1234, 'url': ''};
        const crew = {...competitorLouScrew, 'name': 'Lucy Liu', 'url': null};
        fetch.mockImplementationOnce((resource, options) => {
            const raceMatch = {'race': raceScorpionA.url, 'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries') && (options.body === JSON.stringify(raceMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Lou Screw') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const promise = dinghyRacingModel.createEntry(race, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Competitor not found: Lucy Liu'});
    });
    describe('when dinghy is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: "could not execute statement [Duplicate entry '6-1' for key 'entry.UK_entry_dinghy_id_race_id'] [insert into entry (crew_id,dinghy_id,helm_id,race_id,scoring_abbreviation,version,id) values (?,?,?,?,?,?,?)]; SQL [insert into entry (crew_id,dinghy_id,helm_id,race_id,scoring_abbreviation,version,id) values (?,?,?,?,?,?,?)]; constraint [entry.UK_entry_dinghy_id_race_id]"})
                    });
                };
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A race entry already exists for the selected dinghy.'});
        });
    });
    describe('when helm is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: "could not execute statement [Duplicate entry '2-1' for key 'entry.UK_entry_helm_id_race_id'] [insert entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; SQL [insert entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; constraint [entry.UK_entry_helm_id_race_id]"})
                    });
                };
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A race entry already exists for the selected helm.'});
        });
    });
    describe('when crew is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: "could not execute statement [Duplicate entry '2-1' for key 'entry.UK_entry_helm_id_race_id'] [update entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; SQL [update entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; constraint [entry.UK_entry_crew_id_race_id]"})
                    });
                };
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A race entry already exists for the selected crew.'});
        });
    });
});

describe('when updating an entry for a race', () => {
    it('if entry exists and URL provided and helm exists and URL provided and dinghy exist and URL provided and crew exists and URL provided then updates entry', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries/10') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
            else {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        const promise = dinghyRacingModel.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234, competitorLouScrew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': true, domainObject: entryChrisMarshallScorpionA1234});
    });
    it('if entry exists and URL provided helm exists and URL provided and dinghy exists and URL provided and crew not provided then updates entry', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': null};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries/10') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
            else {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        const promise = dinghyRacingModel.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': true, domainObject: entryChrisMarshallScorpionA1234});
    });
    it('if entry exists and URL provided and helm exists and name provided and dinghy exists and sail number and class provided and crew exists and name provided then updates entry', async () => {
        const helm = {...competitorChrisMarshall, 'url': null};
        const dinghy = {...dinghy1234, 'url': ''};
        const crew = {...competitorLouScrew, 'url': null};
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries/10') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Chris Marshall') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            }
            else if (name === 'Lou Screw') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
            else {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        const promise = dinghyRacingModel.updateEntry(entryChrisMarshallScorpionA1234, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': true, domainObject: entryChrisMarshallScorpionA1234});
    });
    it('if entry exists url provided and helm exists and name provided and dinghy exists and sail number and class provided and crew not provided then updates entry', async () => {
        const helm = {...competitorChrisMarshall, 'url': ''};
        const dinghy = {...dinghy1234, 'url': null};
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': null};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries/10') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': raceScorpionA}));
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Chris Marshall') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall})
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
            else {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        const promise = dinghyRacingModel.updateEntry(entryChrisMarshallScorpionA1234, helm, dinghy);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': true, domainObject: entryChrisMarshallScorpionA1234});
    });
    it('entry exists url provided helm does not exist dinghy exists url provided crew exists and name provided does not update entry and returns message explaining reason', async () => {
        const helm = {...competitorChrisMarshall, 'name': 'Lucy Liu', 'url': ''};
        const dinghy = {...dinghy1234};
        const crew = {...competitorLouScrew, 'url': ''};
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries/10') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Lucy Liu') {
                return Promise.resolve({'success': false, 'message': 'Competitor not found'});
            }
            else if (name === 'Lou Screw') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const promise = dinghyRacingModel.updateEntry(entryChrisMarshallScorpionA1234, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, 'message': 'Competitor not found'});
    });
    it('entry exists and helm exists and name provided dinghy does not exists crew exists and name provided does not update entry and returns message explaining reason', async () => {
        const helm = {...competitorChrisMarshall, 'url': ''};
        const dinghy = {...dinghy1234, 'sailNumber': 'xyz', 'url': null};
        const crew = {...competitorLouScrew, 'url': null};
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries/10') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': raceScorpionA}));
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Chris Marshall') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            }
            else if (name === 'Lou Screw') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': false, 'message': 'Dinghy does not exist'}));
        const promise = dinghyRacingModel.updateEntry(entryChrisMarshallScorpionA1234, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, 'message': 'Dinghy does not exist'});
    });
    it('entry exists url provided helm exists url provided, dinghy exists sail number and class provided crew does not exist does not update entry and returns message explaining reason', async () => {
        const race = {...raceScorpionA};
        const helm = {...competitorChrisMarshall};
        const dinghy = {...dinghy1234, 'url': ''};
        const crew = {...competitorLouScrew, 'name': 'Lucy Liu', 'url': null};
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {'helm': competitorChrisMarshall.url, 'dinghy': dinghy1234.url, 'crew': competitorLouScrew.url};
            if ((resource === 'http://localhost:8081/dinghyracing/api/entries/10') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Lou Screw') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyBySailNumberAndDinghyClass').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghy1234}));
        const promise = dinghyRacingModel.updateEntry(entryChrisMarshallScorpionA1234, helm, dinghy, crew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, 'message': 'Competitor not found: Lucy Liu'});
    });
    describe('when dinghy is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries/10') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: "could not execute statement [Duplicate entry '3-1' for key 'entry.UK_entry_dinghy_id_race_id'] [insert entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; SQL [insert entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; constraint [entry.UK_entry_dinghy_id_race_id]"})
                    });
                };
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.updateEntry(entryChrisMarshallScorpionA1234, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            // let temp = {...entryChrisMarshallScorpionA1234};
            expect(result).toEqual({'success': false, message: 'A race entry already exists for the selected dinghy.'});
        });
    });
    describe('when helm is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: "could not execute statement [Duplicate entry '2-1' for key 'entry.UK_entry_helm_id_race_id'] [update entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; SQL [update entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; constraint [entry.UK_entry_helm_id_race_id]"})
                    });
                };
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A race entry already exists for the selected helm.'});
        });
    });
    describe('when crew is already recorded for entry in race', () => {
        it('returns a clear error message to user', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries') {
                    return Promise.resolve({
                        ok: false,
                        status: 409,
                        statusText: 'Conflict',
                        json: () => Promise.resolve({message: "could not execute statement [Duplicate entry '5-1' for key 'entry.UK_entry_crew_id_race_id'] [update entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; SQL [update entry set crew_id=?,dinghy_id=?,helm_id=?,race_id=?,scoring_abbreviation=?,version=? where id=? and version=?]; constraint [entry.UK_entry_crew_id_race_id]"})
                    });
                };
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, message: 'A race entry already exists for the selected crew.'});
        });
    });
});

describe('when withdrawing an entry for a race', () => {
    it('return a promise resolving to a success result when entry successfully withdrawn', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/entries/10' && options.method === 'DELETE') {
                return Promise.resolve({
                    ok: true,
                    status: 204,
                    headers: new Headers(),
                    json: () => Promise.resolve({})
                });
            }
            else {
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    headers: new Headers(),
                    json: () => Promise.resolve({})
                });
            }
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.withdrawEntry(entryChrisMarshallScorpionA1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result.success).toBeTruthy();
    });
    it('returns a promise resolvig to a failure result and containing a message describibg the cause of the failure when unable to withdraw', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.delete(entryChrisMarshallScorpionA1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
});

describe('when retrieving a list of competitors', () => {
    it('returns a collection of competitors', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(competitorsCollectionHAL)
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
       
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getCompetitors();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': competitorsCollection});
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc&page=0&size=6') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL_p0)
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
               
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getCompetitors();
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': competitorsCollection});
            });
        });
        describe('when page number supplied', () => {
            it('returns only a single page of competitors', async () => {
                const competitorsCollectionHAL_p0 = {'_embedded':{'competitors':[
                    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL
                ]},'_links':{
                    'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}
                },'page':{'size':3,'totalElements':6,'totalPages':1,'number':0}};
                const competitorsCollection_p0 = [competitorChrisMarshall, competitorSarahPascal, competitorJillMyer];
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc&page=0&size=6') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc&page=0') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL_p0)
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
               
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getCompetitors(0);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': competitorsCollection_p0});
            });
        });
        describe('when size is supplied', () => {
            it('returns only a single page of competitors', async () => {
                const competitorsCollectionHAL_p0 = {'_embedded':{'competitors':[
                    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL
                ]},'_links':{
                    'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}
                },'page':{'size':3,'totalElements':6,'totalPages':1,'number':0}};
                const competitorsCollection_p0 = [competitorChrisMarshall, competitorSarahPascal, competitorJillMyer];
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc&page=0&size=6') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc&size=3') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL_p0)
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
               
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getCompetitors(null, 3);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': competitorsCollection_p0});
            });
        });
        describe('when page and size supplied', () => {
            it('returns only a single page of competitors', async () => {
                const competitorsCollectionHAL_p0 = {'_embedded':{'competitors':[
                    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL
                ]},'_links':{
                    'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}
                },'page':{'size':3,'totalElements':6,'totalPages':1,'number':0}};
                const competitorsCollection_p0 = [competitorChrisMarshall, competitorSarahPascal, competitorJillMyer];
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc&page=0&size=6') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/competitors?sort=name,asc&page=0&size=3') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve(competitorsCollectionHAL_p0)
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
               
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getCompetitors(0, 3);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': competitorsCollection_p0});
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
                statusText: 'Not Found',
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getCompetitorByName('Bob Smith');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
});

describe('when searching for a dinghy by sail number and dinghy class', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy when dinghy is found and http status 200', async () => {
        // this test can return a false positive if the logic makes a call to fetch but passes invalid argument as fetch mock does not check input
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
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
                statusText: 'Not Found',
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghyBySailNumberAndDinghyClass('999', dinghyClassScorpion);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
});

describe('when creating a new competitor', () => {
    it('returns a promise that resolves to a result indicating success when competitor is created with http status 200', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: competitorChrisMarshall});
    });
    it('returns a promise that resolves to a result indicating success when competitor is created with http status 201', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 201,
                headers: new Headers(),
                json: () => Promise.resolve(competitorChrisMarshallHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: competitorChrisMarshall});
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 400 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Bad Request Message: Some error resulting in HTTP 400'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 404 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 408 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 408,
                statusText: 'Request Timeout',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 408'}, 'message': 'Some error resulting in HTTP 408'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 408 Request Timeout Message: Some error resulting in HTTP 408'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 409 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 409,
                statusText: 'Conflict',
                json: () => Promise.resolve({
                    "cause": {
                        "cause": {
                            "cause": null, "message": "Duplicate entry 'some name' for key 'competitor.UK_competitor_name'"
                        },
                        "message": "could not execute statement [Duplicate entry 'some name' for key 'competitor.UK_competitor_name'] [insert into competitor (name,version,id) values (?,?,?)]"
                    }, 
                    "message": "could not execute statement [Duplicate entry 'some name' for key 'competitor.UK_competitor_name'] [insert into competitor (name,version,id) values (?,?,?)]; SQL [insert into competitor (name,version,id) values (?,?,?)]; constraint [competitor.UK_competitor_name]"
                })
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({success: false, message: "HTTP Error: 409 Conflict Message: The competitor 'some name' already exists; this may be caused by an uppercase/ lowercase difference between existing record and the value entered."});
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 500 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 500'}, 'message': 'Some error resulting in HTTP 500'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Internal Server Error Message: Some error resulting in HTTP 500'}); 
    });
    it('returns a promise that resolves to a result indicating failure when competitor is not created with http status 503 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 503'}, 'message': 'Some error resulting in HTTP 503'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Service Unavailable Message: Some error resulting in HTTP 503'}); 
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

describe('when updating a competitor', () => {
    it('if competitor exists and URL provided then updates competitor', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {name: 'Chris Marshal'};
            if ((resource === 'http://localhost:8081/dinghyracing/api/competitors/8') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve({...competitorChrisMarshallHAL, name: 'Chris Marshal'})
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateCompetitor(competitorChrisMarshall, 'Chris Marshal');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: {...competitorChrisMarshall, name: 'Chris Marshal'}});
    });
    it('if competitor exists but URL not provided then updates competitor', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {name: 'Chris Marshal'};
            if ((resource === 'http://localhost:8081/dinghyracing/api/competitors/8') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve({...competitorChrisMarshallHAL, name: 'Chris Marshal'})
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            if (name === 'Chris Marshall') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
            }
        });
        const promise = dinghyRacingModel.updateCompetitor({...competitorChrisMarshall, url: undefined}, 'Chris Marshal');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: {...competitorChrisMarshall, name: 'Chris Marshal'}});
    });
    it('if competitor does not exist returns message explaining issue', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getCompetitorByName').mockImplementation((name) => {
            return Promise.resolve({'success': false, 'message': `Competitor not found: ${name}`});
        });
        const promise = dinghyRacingModel.updateCompetitor({name: 'Chris Martian'}, 'Chris Marshal');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Competitor not found: Chris Martian'});
    });
    it('if update fails returns failed indicator and message explaining cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateCompetitor(competitorChrisMarshall, 'Chris Marshal');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
});

describe('when updating a dinghy class', () => {
    it('if dinghy class exists and URL provided then updates dinghy class', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {...dinghyClassScorpion, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215, externalName: 'SCORPION TWO'};
            if ((resource === 'http://localhost:8081/dinghyracing/api/dinghyClasses/1') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve({...dinghyClassScorpionHAL, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215, externalName: 'SCORPION TWO'})
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateDinghyClass({...dinghyClassScorpion, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215, externalName: 'SCORPION TWO'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: {...dinghyClassScorpion, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215, externalName: 'SCORPION TWO'}});
    });
    it('if dinghy class does not exist returns message explaining issue', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateDinghyClass({...dinghyClassScorpion, url: undefined}, 'Scorpion Two', 3, 1215);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
});

describe('when creating a new dinghy', () => {
    it('when supplied dinghy class includes URL returns a promise that resolves to a result indicating success when dinghy is created', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => Promise.resolve({success: true, domainObject: dinghyClassScorpion}));

        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', 'dinghyClass': dinghyClassScorpion});
        const result = await promise;

        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: dinghy1234});
    });
    it('when supplied dinghy class does not contain URL but dinghy class exists returns a promise that resolves to a result indicating success when dinghy is created', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
                json: () => Promise.resolve(dinghy1234HAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getDinghyClassByNameSpy = jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation(() => Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion}));
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => Promise.resolve({success: true, domainObject: dinghyClassScorpion}));

        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', 'dinghyClass': {'name': 'Scorpion'}});
        const result = await promise;
        
        expect(getDinghyClassByNameSpy).toBeCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: dinghy1234});
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
    it('returns a promise that resolves to a result indicating failure when dinghy is not created with http status 409 and provides a message explaining the cause of failure', async () => {
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createCompetitor({...DinghyRacingModel.competitorTemplate(), 'name': 'Chris Marshall'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({success: false, message: "HTTP Error: 409 Conflict Message: The dinghy '102-None' already exists; this may be caused by an uppercase/ lowercase difference between existing record and the value entered."});
    });
    it('returns a promise that resolves to a result indicating failure when request is rejected by REST service', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createDinghy({'sailNumber': '1234', 'dinghyClass': dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Bad Request Message: Some error resulting in HTTP 400'}); 
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
    describe('when no dinghy class is supplied', () => {
        it('returns a success result containing all dinghies', async () => {
            fetch.mockImplementation((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghiesCollectionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghiesScorpionCollectionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassScorpionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassGraduateHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCometHAL)
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
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = model.getDinghies();
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': dinghies});
        });
        describe('when there are more dinghies than fit on a single page', () => {
            describe('when page and size are not supplied', () => {
                it('returns a success result containing all dinghies', async () => {
                    const dinghiesCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        dinghy1234HAL, dinghy2726HAL, dinghy6745HAL
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 3, 'totalElements' : 5, 'totalPages' : 2, 'number' : 0 } };
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghyClassScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghyClassGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghyClassCometHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesCollectionHAL_p0)
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies();
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual({'success': true, 'domainObject': dinghies});
                });
            });
            describe('when page number supplied', () => {
                it('returns only a single page of data', async () => {
                    const dinghiesCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        dinghy1234HAL, dinghy2726HAL, dinghy6745HAL
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 3, 'totalElements' : 5, 'totalPages' : 2, 'number' : 0 } };
                    const dinghies_p0 = [dinghy1234, dinghy2726, dinghy6745];
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassCometHAL)
                            });
                        }
                        else {
                            return Promise.resolve({
                                ok: false,
                                status: 404,
                                statusText: 'Not Found'
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0') {
                                return Promise.resolve({
                                    ok: true,
                                    status: 200, headers: new Headers(), 
                                    json: () => Promise.resolve(dinghiesCollectionHAL_p0)
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(null, 0);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual({'success': true, 'domainObject': dinghies_p0});
                });
            });
            describe('when size supplied', () => {
                it('returns only a single page of data', async () => {
                    const dinghiesCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        dinghy1234HAL, dinghy2726HAL, dinghy6745HAL
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 3, 'totalElements' : 5, 'totalPages' : 2, 'number' : 0 } };
                    const dinghies_p0 = [dinghy1234, dinghy2726, dinghy6745];
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassCometHAL)
                            });
                        }
                        else {
                            return Promise.resolve({
                                ok: false,
                                status: 404,
                                statusText: 'Not Found'
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?size=3') {
                                return Promise.resolve({
                                    ok: true,
                                    status: 200, headers: new Headers(), 
                                    json: () => Promise.resolve(dinghiesCollectionHAL_p0)
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(null, null, 3);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual({'success': true, 'domainObject': dinghies_p0});
                });
            });
            describe('when page and size supplied', () => {
                it('returns only a single page of data', async () => {
                    const dinghiesCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        dinghy1234HAL, dinghy2726HAL, dinghy6745HAL
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 3, 'totalElements' : 5, 'totalPages' : 2, 'number' : 0 } };
                    const dinghies_p0 = [dinghy1234, dinghy2726, dinghy6745];
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassCometHAL)
                            });
                        }
                        else {
                            return Promise.resolve({
                                ok: false,
                                status: 404,
                                statusText: 'Not Found'
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=3') {
                                return Promise.resolve({
                                    ok: true,
                                    status: 200, headers: new Headers(), 
                                    json: () => Promise.resolve(dinghiesCollectionHAL_p0)
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(null, 0, 3);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual({'success': true, 'domainObject': dinghies_p0});
                });
            });
        });
    });
    describe('when a dinghy class is supplied', () => {
        it('returns a success result containing only dinghies for that dinghy class', async () => {
            fetch.mockImplementation((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghiesCollectionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghiesScorpionCollectionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassScorpionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassGraduateHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghyClassCometHAL)
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
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = model.getDinghies(dinghyClassScorpion);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': dinghiesScorpion});
        });
        describe('when there are more dinghies available than fit on a single page', () => {
            describe('when page and size are not supplied', () => {
                it('returns a success result containing all dinghies for that dinghy class', async () => {
                    const dinghiesScorpionCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } } 
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1&page=0&size=20' } }, 'page' : { 'size' : 1, 'totalElements' : 2, 'totalPages' : 2, 'number' : 0 } };
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesCollectionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1&page=0&size=2') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesScorpionCollectionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassCometHAL)
                            });
                        }
                        else {
                            return Promise.resolve({
                                ok: false,
                                status: 404,
                                statusText: 'Not Found'
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesCollectionHAL)
                            });
                        }
                        else if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesScorpionCollectionHAL_p0)
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(dinghyClassScorpion);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual({'success': true, 'domainObject': dinghiesScorpion});
                });
            });
            describe('when page number supplied', () => {
                it('returns only a single page of data', async () => {
                    const dinghiesScorpionCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } } 
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1&page=0&size=20' } }, 'page' : { 'size' : 1, 'totalElements' : 2, 'totalPages' : 2, 'number' : 0 } };
                    const dinghiesScorpion_p0 = [dinghy1234];
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassCometHAL)
                            });
                        }
                        else {
                            return Promise.resolve({
                                ok: false,
                                status: 404,
                                statusText: 'Not Found'
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1&page=0') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesScorpionCollectionHAL_p0)
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(dinghyClassScorpion, 0);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual({'success': true, 'domainObject': dinghiesScorpion_p0});
                });
            });
            describe('when size supplied', () => {
                it('returns only a single page of data', async () => {
                    const dinghiesScorpionCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } } 
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1&page=0&size=20' } }, 'page' : { 'size' : 1, 'totalElements' : 2, 'totalPages' : 2, 'number' : 0 } };
                    const dinghiesScorpion_p0 = [dinghy1234];
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassCometHAL)
                            });
                        }
                        else {
                            return Promise.resolve({
                                ok: false,
                                status: 404,
                                statusText: 'Not Found'
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1&size=1') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesScorpionCollectionHAL_p0)
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(dinghyClassScorpion, null, 1);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual({'success': true, 'domainObject': dinghiesScorpion_p0});
                });
            });
            describe('when page and size supplied', () => {
                it('returns only a single page of data', async () => {
                    const dinghiesScorpionCollectionHAL_p0 = { '_embedded' : { 'dinghies' : [ 
                        { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } } 
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1&page=0&size=20' } }, 'page' : { 'size' : 1, 'totalElements' : 2, 'totalPages' : 2, 'number' : 0 } };
                    const dinghiesScorpion_p0 = [dinghy1234];
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghyClassCometHAL)
                            });
                        }
                        else {
                            return Promise.resolve({
                                ok: false,
                                status: 404,
                                statusText: 'Not Found'
                            });
                        }
                    }).mockImplementationOnce((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1&page=0&size=1') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, headers: new Headers(), 
                                json: () => Promise.resolve(dinghiesScorpionCollectionHAL_p0)
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
                    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                    const promise = model.getDinghies(dinghyClassScorpion, 0, 1);
                    const result = await promise;
                    expect(promise).toBeInstanceOf(Promise);
                    expect(result).toEqual({'success': true, 'domainObject': dinghiesScorpion_p0});
                });
            });
        });
    });
    it('when no dinghies are found for the supplied dinghy class it returns a failed result containing a message explaining the cause of the failure', async () =>{
        fetch.mockImplementation((resource) => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = model.getDinghies(dinghyClassScorpion);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
    });
});

describe('when creating a new fleet', () => {
    describe('without associated dinghy classes', () => {
        it('returns a promise that resolves to a result indicating success when fleet is created with http status 200', async () => {
            fetch.mockImplementation((resource, options) => {
                if (resource === httpRootURL + '/fleets' && options.body === '{"name":"Handicap","dinghyClasses":[],"url":""}') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetHandicapHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                    });
                }
                else {
                    return Promise.resolve({
                        ok: false,
                        status: 400,
                        statusText: 'Bad Request',
                        headers: new Headers(),
                        json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
                    });
                }
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Handicap', dinghyClasses: []});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, domainObject: fleetHandicap});
        });
        it('returns a promise that resolves to a result indicating success when fleet is created with http status 201', async () => {
            fetch.mockImplementation((resource, options) => {
                if (resource === httpRootURL + '/fleets' && options.body === '{"name":"Handicap","dinghyClasses":[],"url":""}') {
                    return Promise.resolve({
                        ok: true,
                        status: 201,
                        headers: new Headers(),
                        json: () => Promise.resolve(fleetHandicapHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 201, headers: new Headers(), 
                        json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                    });
                }
                else {
                    return Promise.resolve({
                        ok: false,
                        status: 400,
                        statusText: 'Bad Request',
                        headers: new Headers(),
                        json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
                    });
                }
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Handicap', dinghyClasses: []});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, domainObject: fleetHandicap});
        });
        it('returns a promise that resolves to a result indicating failure when fleet is not created with http status 400 and provides a message explaining the cause of failure', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 400,
                    statusText: 'Bad Request',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Scorpion'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Bad Request Message: Some error resulting in HTTP 400'}); 
        });
        it('returns a promise that resolves to a result indicating failure when fleet is not created with http status 404 and provides a message explaining the cause of failure', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 404, 
                    statusText: 'Not Found',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Scorpion'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'}); 
        });
        it('returns a promise that resolves to a result indicating failure when fleet is not created with http status 408 and provides a message explaining the cause of failure', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 408,
                    statusText: 'Request Timeout',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 408'}, 'message': 'Some error resulting in HTTP 408'})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Scorpion'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 408 Request Timeout Message: Some error resulting in HTTP 408'}); 
        });
        it('returns a promise that resolves to a result indicating failure when fleet is not created with http status 409 and provides a message explaining the cause of failure', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 409,
                    statusText: 'Conflict',
                    json: () => Promise.resolve({
                        "cause": {
                            "cause": {
                                "cause": null, "message": "Duplicate entry 'some name' for key 'fleet.UK_fleet_name'"
                            },
                            "message": "could not execute statement [Duplicate entry 'some name' for key 'fleet.UK_fleet_name'] [insert into fleet (name,version,id) values (?,?,?)]"
                        }, 
                        "message": "could not execute statement [Duplicate entry 'some name' for key 'fleet.UK_fleet_name'] [insert into fleet (name,version,id) values (?,?,?)]; SQL [insert into fleet (name,version,id) values (?,?,?)]; constraint [fleet.UK_fleet_name]"
                    })
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Scorpion'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({success: false, message: "HTTP Error: 409 Conflict Message: The fleet 'some name' already exists; this may be caused by an uppercase/ lowercase difference between existing record and the value entered."});
        });
        it('returns a promise that resolves to a result indicating failure when fleet is not created with http status 500 and provides a message explaining the cause of failure', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 500'}, 'message': 'Some error resulting in HTTP 500'})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Scorpion'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Internal Server Error Message: Some error resulting in HTTP 500'}); 
        });
        it('returns a promise that resolves to a result indicating failure when fleet is not created with http status 503 and provides a message explaining the cause of failure', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 503,
                    statusText: 'Service Unavailable',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 503'}, 'message': 'Some error resulting in HTTP 503'})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Scorpion'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Service Unavailable Message: Some error resulting in HTTP 503'}); 
        });
        it('returns a promise that resolves to a result indicating failure when fleet is not created due to an error that causes fetch to reject; such as a network failure', async () => {
            fetch.mockImplementationOnce(() => {
                throw new TypeError('Failed to fetch');
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Scorpion'});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
        });
    });    
    describe('with associated dinghy classes', () => {
        it('returns a promise that resolves to a result indicating success when fleet is created with http status 200', async () => {
            fetch.mockImplementation((resource, options) => {
                if (resource === httpRootURL + '/fleets' && options.body === '{"name":"Scorpion","dinghyClasses":["http://localhost:8081/dinghyracing/api/dinghyClasses/1"],"url":""}') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetScorpionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                    });
                }
                else {
                    return Promise.resolve({
                        ok: false,
                        status: 400,
                        statusText: 'Bad Request',
                        json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
                    });
                }
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Scorpion', dinghyClasses: [dinghyClassScorpion]});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, domainObject: fleetScorpion});
        });
        it('returns a promise that resolves to a result indicating success when fleet is created with http status 201', async () => {
            fetch.mockImplementation((resource, options) => {
                if (resource === httpRootURL + '/fleets' && options.body === '{"name":"Scorpion","dinghyClasses":["http://localhost:8081/dinghyracing/api/dinghyClasses/1"],"url":""}') {
                    return Promise.resolve({
                        ok: true,
                        status: 201,
                        headers: new Headers(),
                        json: () => Promise.resolve(fleetScorpionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 201, headers: new Headers(), 
                        json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                    });
                }
                else {
                    return Promise.resolve({
                        ok: false,
                        status: 400,
                        statusText: 'Bad Request',
                        headers: new Headers(),
                        json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
                    });
                }
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.createFleet({...DinghyRacingModel.fleetTemplate(), 'name': 'Scorpion', dinghyClasses: [dinghyClassScorpion]});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, domainObject: fleetScorpion});
        });
    });
});

describe('when updating a fleet', () => {
    it('returns a promise that resolves to a result indicating success when fleet dinghy classes are updated with http status 200', async () => {
        fetch.mockImplementation((resource, options) => {
            // if (resource === fleetScorpionHAL._links.self.href && options.method === 'PATCH' && options.body === '{"name":"Scorpion\","dinghyClasses":["' + fleetScorpion.dinghyClasses[0].url + '"],"url":' + fleetScorpion.url + '}') {
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1' 
                && options.method === 'PATCH' 
                && options.body === '{"name":"Scorpion","dinghyClasses":["http://localhost:8081/dinghyracing/api/dinghyClasses/1"],"url":"http://localhost:8081/dinghyracing/api/fleets/1\"}') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionHAL)
                });                    
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                });
            }
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateFleet(fleetScorpion);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({success: true, domainObject: fleetScorpion});
    });
    it('returns a promise that resolves to a result indicating failure when fleet dinghy classes are not updated with http status 400 and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 400'}, 'message': 'Some error resulting in HTTP 400'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateFleet(fleetScorpion);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 400 Bad Request Message: Some error resulting in HTTP 400'}); 
    });
});

describe('when retrieving a list of fleets', () => {
    it('returns a promise containing an array of fleets sorted by name', async () => {
        fetch.mockImplementation((resource, options) => {
            if (resource === httpRootURL + '/fleets?sort=name,asc') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetsHAL)
                });
            };
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getFleets();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': fleets});
    });
    describe('when there are more fleets available than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('retrieves and returns complete list of fleets', async () => {
                const fleetsHAL_p0 = {
                    '_embedded' : { 'fleets' : [ fleetScorpionHAL, fleetHandicapHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/fleets' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation((resource, options) => {
                    if (resource === httpRootURL + '/fleets?sort=name,asc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsHAL_p0)
                        });
                    };
                    if (resource === httpRootURL + '/fleets?page=0&size=3&sort=name,asc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsHAL)
                        });
                    };
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getFleets();
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': fleets});
            });
        });
        describe('when page number supplied', () => {
            it('returns only a single page of data', async () => {
                const fleetsHAL_p0 = {
                    '_embedded' : { 'fleets' : [ fleetScorpionHAL, fleetHandicapHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/fleets' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                const fleets_p0 = [fleetScorpion, fleetHandicap];
                fetch.mockImplementation((resource, options) => {
                    if (resource === httpRootURL + '/fleets?page=1&sort=name,asc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsHAL_p0)
                        });
                    };
                    if (resource === httpRootURL + '/fleets?page=0&size=3&sort=name,asc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsHAL)
                        });
                    };
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getFleets(1);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': fleets_p0});
            });
        });
        describe('when size supplied', () => {
            it('returns only a single page of data', async () => {
                const fleetsHAL_p0 = {
                    '_embedded' : { 'fleets' : [ fleetScorpionHAL, fleetHandicapHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/fleets' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                const fleets_p0 = [fleetScorpion, fleetHandicap];
                fetch.mockImplementation((resource, options) => {
                    if (resource === httpRootURL + '/fleets?size=2&sort=name,asc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsHAL_p0)
                        });
                    };
                    if (resource === httpRootURL + '/fleets?page=0&size=3&sort=name,asc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsHAL)
                        });
                    };
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getFleets(null, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': fleets_p0});
            });
        });
        describe('when page and size supplied', () => {
            it('returns only a single page of data', async () => {
                const fleetsHAL_p0 = {
                    '_embedded' : { 'fleets' : [ fleetScorpionHAL, fleetHandicapHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/fleets' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                const fleets_p0 = [fleetScorpion, fleetHandicap];
                fetch.mockImplementation((resource, options) => {
                    if (resource === httpRootURL + '/fleets?page=0&size=2&sort=name,asc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsHAL_p0)
                        });
                    };
                    if (resource === httpRootURL + '/fleets?page=0&size=3&sort=name,asc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetsHAL)
                        });
                    };
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getFleets(0, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': fleets_p0});
            });
        });
    });
    it('returns a promise that resolves to a result indicating failure when list of dinghy classes is not found and provides a message explaining the cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getFleets('unknown');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
    });
    it('returns a promise that resolves to a result indicating failure when an error causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getFleets();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'TypeError: Failed to fetch'});
    });
});

it('provides a blank template for a competitor', () => {
    const competitor = DinghyRacingModel.competitorTemplate();

    expect(competitor).toEqual({'name': '', 'url': ''});
});

it('provides a blank template for a dinghy class', () => {
    const dinghyClass = DinghyRacingModel.dinghyClassTemplate();

    expect(dinghyClass).toEqual({'name': '', 'crewSize': 1, portsmouthNumber: 1000, externalName: '', 'url': ''});
});

it('provides a blank template for a dinghy', () => {
    const dinghy = DinghyRacingModel.dinghyTemplate();

    expect(dinghy).toEqual({'sailNumber': '', 'dinghyClass': DinghyRacingModel.dinghyClassTemplate(), 'url': ''});
});

it('provides a blank template for a race', () => {
    const race = DinghyRacingModel.raceTemplate();

    expect(race).toEqual({name: '', plannedStartTime: null, fleet: DinghyRacingModel.fleetTemplate(), type: null, startType: null, duration: 0, plannedLaps: null, lapsSailed: null, lapForecast: null, lastLapTime: null, averageLapTime: null, dinghyClasses: [], clock: null, url: ''});
});

it('provides a blank template for a race entry', () => {
    const entry = DinghyRacingModel.entryTemplate();

    expect(entry).toEqual({race: DinghyRacingModel.raceTemplate(), helm: DinghyRacingModel.competitorTemplate(), crew: null, dinghy: DinghyRacingModel.dinghyTemplate(), laps: [], sumOfLapTimes: 0, correctedTime: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: '', metadata: null});
});

it('provides a blank template for a lap', () => {
    const lap = DinghyRacingModel.lapTemplate();

    expect(lap).toEqual({'number': null, 'time': 0});
});

it('provides a blank template for a crew', () => {
    const crew = DinghyRacingModel.crewTemplate();

    expect(crew).toEqual({helm: null, mate: null});
});

it('provides a blank template for a fleet', () => {
    const fleet = DinghyRacingModel.fleetTemplate();

    expect(fleet).toEqual({name: '', dinghyClasses: [], url: ''});
});

describe('when searching for entries by race', () => {
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and entries have crew recorded', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
                json: () => Promise.resolve(entriesScorpionAHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getEntry').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10') {
                return Promise.resolve({success: true, domainObject: entryChrisMarshallScorpionA1234});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/11') {
                return Promise.resolve({success: true, domainObject: entrySarahPascalScorpionA6745});
            }
        });
        const promise = dinghyRacingModel.getEntriesByRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesScorpionA});
    });
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and entries do not have crew recorded', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                headers: new Headers(),
                json: () => Promise.resolve(entriesCometAHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getEntry').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/19') {
                return Promise.resolve({success: true, domainObject: entryJillMyerCometA826});
            }
        });
        const promise = dinghyRacingModel.getEntriesByRace(raceCometA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesCometA});
    });
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and some entries have crew recorded and some do not', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                headers: new Headers(),
                json: () => Promise.resolve(entriesHandicapAHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getEntry').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20') {
                return Promise.resolve({success: true, domainObject: entryChrisMarshallHandicapA1234});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21') {
                return Promise.resolve({success: true, domainObject: {helm: competitorJillMyer, crew: null, race: raceHandicapA, dinghy: dinghy826, laps: [], sumOfLapTimes: 0, correctedTime: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, 
                    position: null, url: 'http://localhost:8081/dinghyracing/api/entries/21', metadata: null}});
            }
        });
        const promise = dinghyRacingModel.getEntriesByRace(raceHandicapA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesHandicapA});
    });    
    it('converts the value for lastLapTime to the correct value', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                headers: new Headers(),
                json: () => Promise.resolve(entriesScorpionAHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getEntry').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10') {
                return Promise.resolve({success: true, domainObject: entryChrisMarshallScorpionA1234});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/11') {
                return Promise.resolve({success: true, domainObject: entrySarahPascalScorpionA6745});
            }
        });
        const promise = dinghyRacingModel.getEntriesByRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesScorpionA});
    });
    it('converts the value for sumOfLapTimes to the correct value', async () => {
        const entryHAL = {...entryChrisMarshallDinghy1234HAL, sumOfLapTimes: 'PT11M00S'};
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'read').mockImplementation((resource) => {
            if (resource === raceScorpionA.url + '/signedUp') {
                return Promise.resolve({success: true, domainObject: {_embedded: {entries: [entryHAL]}}});
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/entries/10') {
                return Promise.resolve({success: true, domainObject: entryHAL, eTag: '"1"'});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/helm') {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        const promise = dinghyRacingModel.getEntriesByRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234, sumOfLapTimes: 660000, metadata: {eTag: '"1"'}}]});
    });    
    it('converts the value for correctedLapTime to the correct value', async () => {
        const entryHAL = {...entryChrisMarshallDinghy1234HAL, correctedTime: 'PT10M32.790S'};
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'read').mockImplementation((resource) => {
            if (resource === raceScorpionA.url + '/signedUp') {
                return Promise.resolve({success: true, domainObject: {_embedded: {entries: [entryHAL]}}});
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/entries/10') {
                return Promise.resolve({success: true, domainObject: entryHAL, eTag: '"1"'});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({success: true, domainObject: raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/helm') {
                return Promise.resolve({success: true, domainObject: competitorChrisMarshall});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({success: true, domainObject: competitorLouScrew});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghy1234})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
        const promise = dinghyRacingModel.getEntriesByRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': [{...entryChrisMarshallScorpionA1234, correctedTime: 632790, metadata: {eTag: '"1"'}}]});
    });
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and some entries are on the last lap', async () => {
        const entriesHandicapAHAL_onLastLap = { _embedded : { entries : [
            { averageLapTime: 'PT0S', lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', onLastLap: true, finishedRace: false, scoringAbbreviation: null, position: null, 
                _links : { self : { href : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                entry : { href : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                helm : { href : 'http://localhost:8081/dinghyracing/api/entries/20/helm' }, 
                crew : { href : 'http://localhost:8081/dinghyracing/api/entries/20/crew' }, 
                laps : { href : 'http://localhost:8081/dinghyracing/api/entries/20/laps' }, 
                race : { href : 'http://localhost:8081/dinghyracing/api/entries/20/race' }, 
                dinghy : { href : 'http://localhost:8081/dinghyracing/api/entries/20/dinghy' } } 
            }, 
            { averageLapTime: 'PT0S', lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, 
                _links : { self : { href : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                entry : { href : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                helm : { href : 'http://localhost:8081/dinghyracing/api/entries/21/helm' }, 
                crew : { href : 'http://localhost:8081/dinghyracing/api/entries/21/crew' }, 
                laps : { href : 'http://localhost:8081/dinghyracing/api/entries/21/laps' }, 
                race : { href : 'http://localhost:8081/dinghyracing/api/entries/21/race' }, 
                dinghy : { href : 'http://localhost:8081/dinghyracing/api/entries/21/dinghy' } }
            } 
        ] }, _links : { self : { href : 'http://localhost:8081/dinghyracing/api/races/8/signedUp' } }};

        const entriesHandicapA_OnLastLap = [
            {helm: competitorChrisMarshall, crew: competitorLouScrew, race: raceHandicapA, dinghy: dinghy1234, laps: [], sumOfLapTimes: 0, onLastLap: true, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/20'}, 
            {helm: competitorJillMyer, crew: null, race: raceHandicapA, dinghy: dinghy826, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/21'}
        ];

        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                headers: new Headers(),
                json: () => Promise.resolve(entriesHandicapAHAL_onLastLap)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getEntry').mockImplementationOnce((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20') {
                return Promise.resolve({success: true, domainObject: {helm: competitorChrisMarshall, crew: competitorLouScrew, race: raceHandicapA, dinghy: dinghy1234, laps: [], sumOfLapTimes: 0, onLastLap: true, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/20'}});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21') {
                return Promise.resolve({success: true, domainObject: {helm: competitorJillMyer, crew: null, race: raceHandicapA, dinghy: dinghy826, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/21'}});
            }
        }).mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20') {
                return Promise.resolve({success: true, domainObject: entryChrisMarshallHandicapA1234});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21') {
                return Promise.resolve({success: true, domainObject: {helm: competitorJillMyer, crew: null, race: raceHandicapA, dinghy: dinghy826, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, 
                    position: null, url: 'http://localhost:8081/dinghyracing/api/entries/21'}});
            }
        });
        const promise = dinghyRacingModel.getEntriesByRace(raceHandicapA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesHandicapA_OnLastLap});
    });
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and some entries have finished the race', async () => {
        const entriesHandicapAHAL_finishedRace = { _embedded : { entries : [
            { averageLapTime: 'PT0S', lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S' , onLastLap: false, finishedRace: true, scoringAbbreviation: null, position: null,
                _links : { self : { href : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                entry : { href : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                helm : { href : 'http://localhost:8081/dinghyracing/api/entries/20/helm' }, 
                crew : { href : 'http://localhost:8081/dinghyracing/api/entries/20/crew' }, 
                laps : { href : 'http://localhost:8081/dinghyracing/api/entries/20/laps' }, 
                race : { href : 'http://localhost:8081/dinghyracing/api/entries/20/race' }, 
                dinghy : { href : 'http://localhost:8081/dinghyracing/api/entries/20/dinghy' } } 
            }, 
            { averageLapTime: 'PT0S', lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', onLastLap: true, finishedRace: false, scoringAbbreviation: null, position: null,
                _links : { self : { href : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                entry : { href : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                helm : { href : 'http://localhost:8081/dinghyracing/api/entries/21/helm' }, 
                crew : { href : 'http://localhost:8081/dinghyracing/api/entries/21/crew' }, 
                laps : { href : 'http://localhost:8081/dinghyracing/api/entries/21/laps' }, 
                race : { href : 'http://localhost:8081/dinghyracing/api/entries/21/race' }, 
                dinghy : { href : 'http://localhost:8081/dinghyracing/api/entries/21/dinghy' } }
            } 
        ] }, _links : { self : { href : 'http://localhost:8081/dinghyracing/api/races/8/signedUp' } }};

        const entriesHandicapA_OnLastLap = [
            {helm: competitorChrisMarshall, crew: competitorLouScrew, race: raceHandicapA, dinghy: dinghy1234, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: true, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/20'}, 
            {helm: competitorJillMyer, crew: null, race: raceHandicapA, dinghy: dinghy826, laps: [], sumOfLapTimes: 0, onLastLap: true, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/21'}
        ];

        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                headers: new Headers(),
                json: () => Promise.resolve(entriesHandicapAHAL_finishedRace)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getEntry').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20') {
                return Promise.resolve({success: true, domainObject: {helm: competitorChrisMarshall, crew: competitorLouScrew, race: raceHandicapA, dinghy: dinghy1234, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: true, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/20'}});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21') {
                return Promise.resolve({success: true, domainObject: {helm: competitorJillMyer, crew: null, race: raceHandicapA, dinghy: dinghy826, laps: [], sumOfLapTimes: 0, onLastLap: true, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/21'}});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
        const promise = dinghyRacingModel.getEntriesByRace(raceHandicapA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesHandicapA_OnLastLap});
    });
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and some entries have a scoring abbreviation of DNS recorded', async () => {
        const entriesHandicapAHAL_DNS = { _embedded : { entries : [
            { averageLapTime: 'PT0S', lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S' , onLastLap: false, finishedRace: false, scoringAbbreviation: 'DNS', position: null,
                _links : { self : { href : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                entry : { href : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                helm : { href : 'http://localhost:8081/dinghyracing/api/entries/20/helm' }, 
                crew : { href : 'http://localhost:8081/dinghyracing/api/entries/20/crew' }, 
                laps : { href : 'http://localhost:8081/dinghyracing/api/entries/20/laps' }, 
                race : { href : 'http://localhost:8081/dinghyracing/api/entries/20/race' }, 
                dinghy : { href : 'http://localhost:8081/dinghyracing/api/entries/20/dinghy' } } 
            }, 
            { averageLapTime: 'PT0S', lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', onLastLap: true, finishedRace: false, scoringAbbreviation: null, position: null,
                _links : { self : { href : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                entry : { href : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                helm : { href : 'http://localhost:8081/dinghyracing/api/entries/21/helm' }, 
                crew : { href : 'http://localhost:8081/dinghyracing/api/entries/21/crew' }, 
                laps : { href : 'http://localhost:8081/dinghyracing/api/entries/21/laps' }, 
                race : { href : 'http://localhost:8081/dinghyracing/api/entries/21/race' }, 
                dinghy : { href : 'http://localhost:8081/dinghyracing/api/entries/21/dinghy' } }
            } 
        ] }, _links : { self : { href : 'http://localhost:8081/dinghyracing/api/races/8/signedUp' } }};

        const entryChrisMarshall_DNS = {helm: competitorChrisMarshall, crew: competitorLouScrew, race: raceHandicapA, dinghy: dinghy1234, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: 'DNS', position: null, url: 'http://localhost:8081/dinghyracing/api/entries/20'};
        const entryJillMyer_DNS = {helm: competitorJillMyer, crew: null, race: raceHandicapA, dinghy: dinghy826, laps: [], sumOfLapTimes: 0, onLastLap: true, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/21'};
        const entriesHandicapA_DNS = [entryChrisMarshall_DNS, entryJillMyer_DNS];

        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200,
                headers: new Headers(),
                json: () => Promise.resolve(entriesHandicapAHAL_DNS)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getEntry').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20') {
                return Promise.resolve({success: true, domainObject: entryChrisMarshall_DNS});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21') {
                return Promise.resolve({success: true, domainObject: entryJillMyer_DNS});
            }
        });
        const promise = dinghyRacingModel.getEntriesByRace(raceHandicapA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesHandicapA_DNS});
    });
    it('returns a promise that resolves to a result indicating failure when race is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => {throw new SyntaxError('Unexpected end of JSON input')}
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getEntriesByRace(raceScorpionA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
    it('returns a promise that resolves to a result indicating failure when race does not have a URL', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getEntriesByRace({name: 'Test Race', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Cannot retrieve race entries without URL for race.'});
    });
    describe('when there are more than 20 entries (default Spring page size) for a race', () => {
        it('returns all the entries', async () => {
            fetch.mockImplementationOnce((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/entries/search/findByRace?race=http://localhost:8081/dinghyracing/api/races/7') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: () => Promise.resolve(findByRaceGraduate_AHAL_bigData)
                    });
                }
                else if (resource === 'http://localhost:8081/dinghyracing/api/races/7/signedUp') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: () => Promise.resolve(signedUpGraduateAHAL_bigData)
                    });
                }
                else {
                    return Promise.resolve({
                        ok: false,
                        status: 404,
                        statusText: 'Not Found',
                        json: () => {throw new SyntaxError('Unexpected end of JSON input')}
                    });
                }
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getEntry').mockImplementation((url) => {
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1430') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorCarmenWhiting, crew: competitorNoelHills, race: raceGraduateA, dinghy: dinghy1, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1430'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1431') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorAjDavis, crew: competitorDanielLittle, race: raceGraduateA, dinghy: dinghy290, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1431'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1432') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorIvanPlatt, crew: competitorAizaAustin, race: raceGraduateA, dinghy: dinghy2009, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1432'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1433') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorNellPowell, crew: competitorWilliamMorrison, race: raceGraduateA, dinghy: dinghy2097, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1433'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1434') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorGraceRees, crew: competitorAugustKhan, race: raceGraduateA, dinghy: dinghy2373, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1434'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1435') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorArranAshley, crew: competitorYuvrajSheppard, race: raceGraduateA, dinghy: dinghy2471, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1435'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1436') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorMacySmall, crew: competitorMaximFlynn, race: raceGraduateA, dinghy: dinghy2482, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1436'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1437') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorDestinyBourne, crew: competitorCezarWhelan, race: raceGraduateA, dinghy: dinghy2725, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1437'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1438') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorDominicBarnett, crew: competitorBaileyPreston, race: raceGraduateA, dinghy: dinghy2849, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1438'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1439') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorAlaraTaylor, crew: competitorNadiaBarrow, race: raceGraduateA, dinghy: dinghy2862, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1439'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1440') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorKieraDaniels, crew: competitorZimalGrainger, race: raceGraduateA, dinghy: dinghy2889, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1440'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1441') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorAmariBarber, crew: competitorRuqayyahWhittle, race: raceGraduateA, dinghy: dinghy2910, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1441'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1442') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorHazelWheeler, crew: competitorJaysonGraves, race: raceGraduateA, dinghy: dinghy2912, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1442'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1443') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorLucasMillward, crew: competitorBellaBourne, race: raceGraduateA, dinghy: dinghy2928, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1443'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1444') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorLouiseBarron, crew: competitorCobieBaldwin, race: raceGraduateA, dinghy: dinghy2931, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1444'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1445') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorAlastairKhatun, crew: competitorIrisSandhu, race: raceGraduateA, dinghy: dinghy2938, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1445'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1446') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorSamsonMcGowan, crew: competitorEsmeHyde, race: raceGraduateA, dinghy: dinghy2969, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1446'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1447') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorCalebParkinson, crew: competitorDakotaMoss, race: raceGraduateA, dinghy: dinghy2970, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1447'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1448') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorInayaRegan, crew: competitorLeoEaton, race: raceGraduateA, dinghy: dinghy2971, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1448'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1449') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorLeiaHaynes, crew: competitorDarcyEmery, race: raceGraduateA, dinghy: dinghy2973, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1449'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1450') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorNatanNewman, crew: competitorDiegoHoughton, race: raceGraduateA, dinghy: dinghy2985, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1450'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1451') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorJamesonSharpe, crew: competitorShelbyMiller, race: raceGraduateA, dinghy: dinghy2987, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1451'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1452') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorElifPugh, crew: competitorMaceyVaughan, race: raceGraduateA, dinghy: dinghy3006, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1452'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1453') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorWilfredMead, crew: competitorLaineyAbbott, race: raceGraduateA, dinghy: dinghy3009, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1453'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1454') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorFrankySheppard, crew: competitorPaddyLowe, race: raceGraduateA, dinghy: dinghy3014, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1454'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1455') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorLeniTyler, crew: competitorBaaniManning, race: raceGraduateA, dinghy: dinghy3015, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1455'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1456') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorMahnoorHope, crew: competitorSarahPritchard, race: raceGraduateA, dinghy: dinghy3020, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1456'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1457') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorAnthonyDillon, crew: competitorLucienHoare, race: raceGraduateA, dinghy: dinghy3021, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1457'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1458') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorZackaryLindsay, crew: competitorSerenDuffy, race: raceGraduateA, dinghy: dinghy3022, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1458'}});
                }
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1459') {
                    return Promise.resolve({success: true, domainObject: {helm: competitorKhalilRushton, crew: competitorBiancaSwan, race: raceGraduateA, dinghy: dinghy3088, laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: 'http://localhost:8081/dinghyracing/api/entries/1459'}});
                }
            });
            const promise = dinghyRacingModel.getEntriesByRace(raceGraduateA);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({success: true, domainObject: entriesGraduateA_bigData});
        });
    });
});

describe('when a race is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the race when the race is found', async () => {
        const raceScorpion_AHAL_withEntries = {...raceScorpion_AHAL, dinghyClasses: [{name: 'Scorpion', crewSize: 2, portsmouthNumber: 1043}]};
        const raceScorpionA_withEntries = {...raceScorpionA, dinghyClasses: [{name: 'Scorpion', crewSize: 2, portsmouthNumber: 1043}]};
        fetch.mockImplementation((resource, options) => {
            if (resource === raceScorpionA.url) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers([['ETag', '"3"']]),
                    json: () => Promise.resolve(raceScorpion_AHAL_withEntries)
                });
            }            
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: () => Promise.resolve(fleetScorpionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: () => Promise.resolve(fleetGraduateHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        // jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
        const promise = dinghyRacingModel.getRace(raceScorpionA.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': raceScorpionA_withEntries, eTag: '"3"'});
    });
    describe('when an entry has already sailed a lap', () => {
        it('returns a race that includes the number of laps sailed by the lead entry', async () => {
            const raceScorpion_lapsSailed_AHAL = {...raceScorpion_AHAL, leadEntry: {...raceScorpion_AHAL.leadEntry, lapsSailed: 3}};
            const raceScorpion_lapsSailed = {...raceScorpionA, lapsSailed: 3};
            fetch.mockImplementation((resource) => {
                if (resource === raceScorpionA.url) {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers([['ETag', '"3"']]), 
                        json: () => Promise.resolve(raceScorpion_lapsSailed_AHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetScorpionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetGraduateHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetCometHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetHandicapHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
            const promise = dinghyRacingModel.getRace(raceScorpion_lapsSailed.url);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': raceScorpion_lapsSailed, eTag: '"3"'});
        })
    })
    it('returns a promise that resolves to a result indicating failure when race is not found', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === raceScorpionA.url) {
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getRace(raceScorpionA.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
    });
    it('returns a promise that resolves to a result indicating success and containing the race when the race is found and lead entry is null', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === raceGraduateA.url) {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"3"']]), 
                    json: () => Promise.resolve(raceGraduate_AHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassGraduate})});
        const promise = dinghyRacingModel.getRace(raceGraduateA.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({success: true, domainObject: raceGraduateA, eTag: '"3"'});
    });
    describe('when race has not changed from last time retrieved', () => {
        it('returns race from local store', async () => {
            const raceScorpion_AHAL_withEntries = {...raceScorpion_AHAL, dinghyClasses: [{name: 'Scorpion', crewSize: 2, portsmouthNumber: 1043}]};
            const raceScorpionA_withEntries = {...raceScorpionA, dinghyClasses: [{name: 'Scorpion', crewSize: 2, portsmouthNumber: 1043}]};
            fetch.mockImplementation((resource, options) => {
                if (resource === raceScorpionA.url) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers([['ETag', '"3"']]),
                        json: () => Promise.resolve(raceScorpion_AHAL_withEntries)
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
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            dinghyRacingModel.raceResultMap.set(raceScorpion_AHAL_withEntries._links.self.href, {success: true,domainObject: raceScorpionA_withEntries, eTag: '"3"'});
            const promise = dinghyRacingModel.getRace(raceScorpionA.url);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': raceScorpionA_withEntries, eTag: '"3"'});
        });
    });
    describe('when race accessed via a relation from another entity so does not have a version ETag', () => {
        it('retrieves race and does not update local store', async () => {
            const raceScorpion_AHAL_withEntries = {...raceScorpion_AHAL, dinghyClasses: [{name: 'Scorpion', crewSize: 2, portsmouthNumber: 1043}]};
            const raceScorpionA_withEntries = {...raceScorpionA, dinghyClasses: [{name: 'Scorpion', crewSize: 2, portsmouthNumber: 1043}]};
            fetch.mockImplementation((resource, options) => {
                if (resource === raceScorpionA.url) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: () => Promise.resolve(raceScorpion_AHAL_withEntries)
                    });
                }            
                if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: () => Promise.resolve(fleetScorpionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: () => Promise.resolve(fleetGraduateHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(), 
                        json: () => Promise.resolve(fleetCometHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers(), 
                        json: () => Promise.resolve(fleetHandicapHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            dinghyRacingModel.raceResultMap.set(raceScorpion_AHAL_withEntries._links.self.href, {success: true,domainObject: raceScorpion_AHAL_withEntries, eTag: '"3"'});
            const promise = dinghyRacingModel.getRace(raceScorpionA.url);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': raceScorpionA_withEntries, eTag: null});
        });
    });
});

describe('when a competitor is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the competitor when the competitor is found', async () => {
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
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
        fetch.mockImplementation(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getCompetitor(competitorChrisMarshall.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
    });
});

describe('when a dinghy is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy when the dinghy is found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
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
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghy(dinghy1234.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
    });
});

describe('when a dinghy class is requested', () => {
    it('returns a promise that resolves to a result indicating success and containing the dinghy class when the dinghy class is found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(), 
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
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getDinghyClass(dinghyClassScorpion.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
    });
});

describe('when starting a race', () => {
    describe('when a url is provided for race', () => {
        it('returns a promise that resolves to a success response when race is successfully started', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
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
                    statusText: 'Not Found',
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.startRace(raceScorpionA, new Date());
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
        });
    });
    describe('when a url is not provided for race', () => {
        it('retrieves race by name and planned start time then returns a promise that resolves to a success response when race is successfully started', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
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
                    status: 200, headers: new Headers(),
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
                status: 200, headers: new Headers(),
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.addLap({...entryChrisMarshallScorpionA1234}, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result.success).toBeTruthy();
    });
    it('returns a promise that resolves to a result indicating failure when lap is rejected by REST service', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.addLap({...entryChrisMarshallScorpionA1234}, 1000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
});

describe('when removing a lap from a race', () => {
    it('returns a promise that resolves to a success response when lap is successfully removed', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.removeLap({...entryChrisMarshallScorpionA1234}, {...DinghyRacingModel.lapTemplate(),'number': 1, 'time': 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result.success).toBeTruthy();
    });
    it('returns a promise that resolves to a result indicating failure when lap removal is rejected by REST service', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.removeLap({...entryChrisMarshallScorpionA1234}, {...DinghyRacingModel.lapTemplate(),'number': 1, 'time': 1000});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        // let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
    });
});

describe('when updating a lap from a race', () => {
    it('returns a promise that resolves to a success response when lap is successfully updated', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, headers: new Headers(),
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateLap({...entryChrisMarshallScorpionA1234}, 2000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result.success).toBeTruthy();
    });
    it('returns a promise that resolves to a result indicating failure when lap update is rejected by REST service', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404, 
                statusText: 'Not Found',
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateLap({...entryChrisMarshallScorpionA1234}, 2000);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
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
    it('does not set another reference to the same callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        dinghyRacingModel.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        expect(dinghyRacingModel.entryUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/entries/10').size).toBe(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback1);
        dinghyRacingModel.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback2);
        expect(dinghyRacingModel.entryUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/entries/10').size).toBe(2);
    });
    it('removes websocket message when requested', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        dinghyRacingModel.unregisterEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback);
        expect(dinghyRacingModel.entryUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/entries/10').size).toBe(0);
    });
    it('does not remove functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback1);
        dinghyRacingModel.registerEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback2);
        dinghyRacingModel.unregisterEntryUpdateCallback('http://localhost:8081/dinghyracing/api/entries/10', callback1);
        expect(dinghyRacingModel.entryUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/entries/10').size).toBe(1);
    });
});

describe('when a websocket message callback has been set for race update', () => {
    it('calls the callback', done => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        // create delay to give time for stomp mock to trigger callback
        setTimeout(() => {
            expect(callback).toBeCalled();
            done();
        }, 1);
    });
    it('does not set another reference to the same callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        dinghyRacingModel.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        expect(dinghyRacingModel.raceUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/races/4').size).toBe(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        dinghyRacingModel.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback2);
        expect(dinghyRacingModel.raceUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/races/4').size).toBe(2);
    });
    it('removes websocket message when requested', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        dinghyRacingModel.unregisterRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        expect(dinghyRacingModel.raceUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/races/4').size).toBe(0);
    });
    it('does not remove functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        dinghyRacingModel.registerRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback2);
        dinghyRacingModel.unregisterRaceUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        expect(dinghyRacingModel.raceUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/races/4').size).toBe(1);
    });
});

describe('when a websocket message callback has been set for race entry laps update', () => {
    it('calls the callback', done => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        // create delay to give time for stomp mock to trigger callback
        setTimeout(() => {
            expect(callback).toBeCalled();
            done();
        }, 1);
    });
    it('does not set another reference to the same callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        dinghyRacingModel.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        expect(dinghyRacingModel.raceEntryLapsUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/races/4').size).toBe(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        dinghyRacingModel.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback2);
        expect(dinghyRacingModel.raceEntryLapsUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/races/4').size).toBe(2);
    });
    it('removes websocket message when requested', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        dinghyRacingModel.unregisterRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback);
        expect(dinghyRacingModel.raceEntryLapsUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/races/4').size).toBe(0);
    });
    it('does not remove functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        dinghyRacingModel.registerRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback2);
        dinghyRacingModel.unregisterRaceEntryLapsUpdateCallback('http://localhost:8081/dinghyracing/api/races/4', callback1);
        expect(dinghyRacingModel.raceEntryLapsUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/races/4').size).toBe(1);
    });
});

describe('when retrieving a list of races that start between the specified times', () => {
    // Can this test can be affected by BST, or other time zones (yes, if timezone changes test data (races) will need to be adjusted to reflect the change in the timezone (currently set up for British Summer Time))
    it('returns a collection of races that start between the specified times', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(racesCollectionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                });
            }
            if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
    
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': races});
    });
    describe('when there are more races than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('returns a success result containing all the races that start at or after the specified time', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&page=0&size=4') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
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
        
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'));
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': races});
            });
        });
        describe('when page number supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                const races_p0 = [raceScorpionA, raceGraduateA];
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&page=0') {
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
        
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), 0);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': races_p0});
            });
        });
        describe('when size is supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                const races_p0 = [raceScorpionA, raceGraduateA];
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&size=2') {
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
        
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), null, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': races_p0});
            });
        });
        describe('when page and size supplied', () => {
            it('returns only a single page of data', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                const races_p0 = [raceScorpionA, raceGraduateA];
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(racesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(), 
                            json: () => Promise.resolve(fleetCometDinghyClassHAL)
                        });
                    }
                    else {
                        return Promise.resolve({
                            ok: false,
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                }).mockImplementationOnce((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&page=0&size=2') {
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
        
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
                const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), 0, 2);
                const result = await promise;
                expect(promise).toBeInstanceOf(Promise);
                expect(result).toEqual({'success': true, 'domainObject': races_p0});
            });
        });
    });
    describe('when sort criteria are provided', () => {
        it('requests a sorted collection from server', async () => {
            // checking request is correctly structured
            // not checking a sorted collection is returned as that is the responsibility of the server
            fetch.mockImplementation((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&sort=plannedStartTime,ASC') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(racesCollectionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/4/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetScorpionHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/7/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetGraduateHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/17/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetCometHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/races/8/fleet') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetHandicapHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetScorpionDinghyClassHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetHandicapDinghyClassHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetGraduateDinghyClassHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(fleetCometDinghyClassHAL)
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
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': races});
        });
    });
});

describe('when a StartSequence is requested', () => {
    it('returns a promise that resolves to a success containing a StartSequence for the races between the start and end times', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2021-10-14T10:10:00Z'));

        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);

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
        
        const scorpionWarningSignal = {meaning: 'Warning signal', time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), soundSignal: scorpionWarningSoundSignal, visualSignal: scorpionWarningVisualSignal};
        const graduateWarningSignal = {meaning: 'Warning signal', time: new Date(raceGraduateA.plannedStartTime.valueOf() - 600000), soundSignal: graduateWarningSoundSignal, visualSignal: graduateWarningVisualSignal};
        const cometWarningSignal = {meaning: 'Warning signal', time: new Date(raceCometA.plannedStartTime.valueOf() - 600000), soundSignal: cometWarningSoundSignal, visualSignal: cometWarningVisualSignal};
        const handicapWarningSignal = {meaning: 'Warning signal', time: new Date(raceHandicapA.plannedStartTime.valueOf() - 600000), soundSignal: handicapWarningSoundSignal, visualSignal: handicapWarningVisualSignal};
        
        const preparatorySignal = {meaning: 'Preparatory signal', time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), soundSignal: preparatorySoundSignal, visualSignal: preparatoryVisualSignal};
        const scorpionStartSignal = {meaning: 'Starting signal', time: new Date(raceScorpionA.plannedStartTime.valueOf()), soundSignal: scorpionStartSoundSignal, visualSignal: scorpionStartVisualSignal};
        const graduateStartSignal = {meaning: 'Starting signal', time: new Date(raceGraduateA.plannedStartTime.valueOf()), soundSignal: graduateStartSoundSignal, visualSignal: graduateStartVisualSignal};
        const cometStartSignal = {meaning: 'Starting signal', time: new Date(raceCometA.plannedStartTime.valueOf()), soundSignal: cometStartSoundSignal, visualSignal: cometStartVisualSignal};
        const endSequenceSignal = {meaning: 'Start sequence finished', time: new Date(raceHandicapA.plannedStartTime.valueOf()), soundSignal: null, visualSignal: endSequenceVisualSignal};
        const handicapStartSignal = {meaning: 'Starting signal', time: new Date(raceHandicapA.plannedStartTime.valueOf()), soundSignal: handicapStartSoundSignal, visualSignal: handicapStartVisualSignal};
        
        const promise = dinghyRacingModel.getStartSequence(races, RaceType.FLEET);
        const result = await promise;
        const signals = result.domainObject.getSignals();

        expect(promise).toBeInstanceOf(Promise);
        expect(signals.length).toBe(10);
        expect(signals).toEqual(expect.arrayContaining([scorpionWarningSignal, preparatorySignal, graduateWarningSignal, scorpionStartSignal, cometWarningSignal, graduateStartSignal, handicapWarningSignal, endSequenceSignal, cometStartSignal, handicapStartSignal]));

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });
    describe('when race is a pursuit race', () => {
        describe('when race is an open handicap', () => {
            it('provides the base class to be used for the fleet when calculating start offsets', async () => {
                // open handicap is defined as a fleet with no explicit classes set and RaceStartSequence needs a base class to caclculate offsets so additional action is required by DinghyRacingModel to supply this class
                jest.useFakeTimers().setSystemTime(new Date('2021-10-14T10:10:00Z'));
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/dinghyClasses/search/findTopByOrderByPortsmouthNumberDesc') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, headers: new Headers(),
                            json: () => Promise.resolve({
                                'name': 'Optimist (Club)',
                                'crewSize': 1,
                                'portsmouthNumber': 1835,
                                'externalName': null,
                                '_links': {
                                    'self': {
                                        'href': 'http://localhost:8081/dinghyracing/api/dinghyClasses/31'
                                    },
                                    'dinghyClass': {
                                        'href': 'http://localhost:8081/dinghyracing/api/dinghyClasses/31'
                                    }
                                }
                            })
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
                const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);


                const handicapClassFlag = {name: 'Handicap Class Flag'};
                const preparatoryFlag = {name: 'Blue Peter'};

                const handicapWarningVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.RAISED};
                const handicapWarningSoundSignal = {description: 'One'};
                const handicapWarningSignal = {meaning: 'Warning signal', time: new Date(racePursuitA.plannedStartTime.valueOf() - 300000), visualSignal: handicapWarningVisualSignal, soundSignal: handicapWarningSoundSignal};
                const preparatoryVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.RAISED};
                const preparatorySoundSignal = {description: 'One'};
                const preparatorySignal = {meaning: 'Preparatory signal', time: new Date(racePursuitA.plannedStartTime.valueOf() - 240000), visualSignal: preparatoryVisualSignal, soundSignal: preparatorySoundSignal};
                const oneMinuteVisualSignal = {flags: [preparatoryFlag], flagsState: FlagState.LOWERED};
                const oneMinuteSoundSignal = {description: 'One long'};
                const oneMinuteSignal = {meaning: 'One minute', time: new Date(racePursuitA.plannedStartTime.valueOf() - 60000), visualSignal: oneMinuteVisualSignal, soundSignal: oneMinuteSoundSignal};


                const handicapStartVisualSignal = {flags: [handicapClassFlag], flagsState: FlagState.LOWERED};
                const handicapStartSoundSignal = {description: 'One'};
                const handicapStartSignal = {meaning: 'Starting signal', time: racePursuitA.plannedStartTime, soundSignal: handicapStartSoundSignal, visualSignal: handicapStartVisualSignal};
                const cometStartSoundSignal = {description: 'One'};
                const cometStartSignal = {meaning: 'Comet start', time: new Date(racePursuitA.plannedStartTime.valueOf() + 920000), soundSignal: cometStartSoundSignal};
                const scorpionStartSoundSignal = {description: 'One'};
                const scorpionStartSignal = {meaning: 'Scorpion start', time: new Date(racePursuitA.plannedStartTime.valueOf() + 1166000), soundSignal: scorpionStartSoundSignal};

                const result = await dinghyRacingModel.getStartSequence([{...racePursuitA, dinghyClasses: [dinghyClassComet, dinghyClassScorpion]}], RaceType.PURSUIT);
                const signals = result.domainObject.getSignals();

                expect(signals).toHaveLength(6);
                expect(signals).toEqual(expect.arrayContaining([handicapWarningSignal, preparatorySignal, oneMinuteSignal, handicapStartSignal, cometStartSignal, scorpionStartSignal]));
                        
                jest.runOnlyPendingTimers();
                jest.useRealTimers();
            });
        });
    });
});

describe('when updating the plannedLaps for a race', () => {
    describe('when a url is provided for race', () => {
        it('returns a promise that resolves to a success response when race planned laps is successfully updated', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.updateRacePlannedLaps(raceScorpionA, 4);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result.success).toBeTruthy();
        });
        it('returns a promise that resolves to a result indicating failure when start sequence stae is rejected by REST service', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.updateRacePlannedLaps(raceScorpionA, 4);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found'});
        });
    });
    describe('when a url is not provided for race', () => {
        it('retrieves race by name and planned start time then returns a promise that resolves to a success response when race start sequence state is successfully updated', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': {raceScorpionA}})});
            const promise = dinghyRacingModel.updateRacePlannedLaps({ 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), plannedLaps: 5, 'dinghyClass': dinghyClassScorpion}, 4);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result.success).toBeTruthy();
        });
        it('returns a failure and advises reason for failure when race cannot be retrieved by name and planned start time', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'Something went wrong'})});
            const promise = dinghyRacingModel.updateRacePlannedLaps({ 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), plannedLaps: 5, 'dinghyClass': dinghyClassScorpion}, 4);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Something went wrong'});
        });
    });
});

describe('when a websocket message callback has been set for competitor creation', () => {
    it('calls the callback', done => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerCompetitorCreationCallback(callback);
        // create delay to give time for stomp mock to trigger callback
        setTimeout(() => {
            expect(callback).toBeCalled();
            done();
        }, 1);
    });
    it('does not set another reference to the same callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerCompetitorCreationCallback(callback);
        dinghyRacingModel.registerCompetitorCreationCallback(callback);
        expect(dinghyRacingModel.competitorCreationCallbacks.size).toBe(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerCompetitorCreationCallback(callback1);
        dinghyRacingModel.registerCompetitorCreationCallback(callback2);
        expect(dinghyRacingModel.competitorCreationCallbacks.size).toBe(2);
    });
    it('removes websocket message when requested', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerCompetitorCreationCallback(callback);
        dinghyRacingModel.unregisterCompetitorCreationCallback(callback);
        expect(dinghyRacingModel.competitorCreationCallbacks.size).toBe(0);
    });
    it('does not remove functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerCompetitorCreationCallback(callback1);
        dinghyRacingModel.registerCompetitorCreationCallback(callback2);
        dinghyRacingModel.unregisterCompetitorCreationCallback(callback1);
        expect(dinghyRacingModel.competitorCreationCallbacks.size).toBe(1);
    });
});

describe('when a websocket message callback has been set for dinghy creation', () => {
    it('calls the callback', done => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerDinghyCreationCallback(callback);
        // create delay to give time for stomp mock to trigger callback
        setTimeout(() => {
            expect(callback).toBeCalled();
            done();
        }, 1);
    });
    it('does not set another reference to the same callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerDinghyCreationCallback(callback);
        dinghyRacingModel.registerDinghyCreationCallback(callback);
        expect(dinghyRacingModel.dinghyCreationCallbacks.size).toBe(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerDinghyCreationCallback(callback1);
        dinghyRacingModel.registerDinghyCreationCallback(callback2);
        expect(dinghyRacingModel.dinghyCreationCallbacks.size).toBe(2);
    });
    it('removes websocket message when requested', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerDinghyCreationCallback(callback);
        dinghyRacingModel.unregisterDinghyCreationCallback(callback);
        expect(dinghyRacingModel.dinghyCreationCallbacks.size).toBe(0);
    });
    it('does not remove functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerDinghyCreationCallback(callback1);
        dinghyRacingModel.registerDinghyCreationCallback(callback2);
        dinghyRacingModel.unregisterDinghyCreationCallback(callback1);
        expect(dinghyRacingModel.dinghyCreationCallbacks.size).toBe(1);
    });
});

describe('when a websocket message callback has been set for dinghy class creation', () => {
    it('calls the callback', done => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerDinghyClassCreationCallback(callback);
        // create delay to give time for stomp mock to trigger callback
        setTimeout(() => {
            expect(callback).toBeCalled();
            done();
        }, 1);
    });
    it('does not set another reference to the same callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerDinghyClassCreationCallback(callback);
        dinghyRacingModel.registerDinghyClassCreationCallback(callback);
        expect(dinghyRacingModel.dinghyClassCreationCallbacks.size).toBe(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerDinghyClassCreationCallback(callback1);
        dinghyRacingModel.registerDinghyClassCreationCallback(callback2);
        expect(dinghyRacingModel.dinghyClassCreationCallbacks.size).toBe(2);
    });
    it('removes websocket message when requested', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerDinghyClassCreationCallback(callback);
        dinghyRacingModel.unregisterDinghyClassCreationCallback(callback);
        expect(dinghyRacingModel.dinghyClassCreationCallbacks.size).toBe(0);
    });
    it('does not remove functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerDinghyClassCreationCallback(callback1);
        dinghyRacingModel.registerDinghyClassCreationCallback(callback2);
        dinghyRacingModel.unregisterDinghyClassCreationCallback(callback1);
        expect(dinghyRacingModel.dinghyClassCreationCallbacks.size).toBe(1);
    });
});

describe('when a websocket message callback has been set for dinghy class update', () => {
    it('calls the callback', done => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        // create delay to give time for stomp mock to trigger callback
        setTimeout(() => {
            expect(callback).toBeCalled();
            done();
        }, 1);
    });
    it('does not set another reference to the same callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        dinghyRacingModel.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        expect(dinghyRacingModel.dinghyClassUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/dinghyClasses/1').size).toBe(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClass/1', callback1);
        dinghyRacingModel.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClass/1', callback2);
        expect(dinghyRacingModel.dinghyClassUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/dinghyClass/1').size).toBe(2);
    });
    it('removes websocket message when requested', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        dinghyRacingModel.unregisterDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback);
        expect(dinghyRacingModel.dinghyClassUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/dinghyClasses/1').size).toBe(0);
    });
    it('does not remove functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback1);
        dinghyRacingModel.registerDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback2);
        dinghyRacingModel.unregisterDinghyClassUpdateCallback('http://localhost:8081/dinghyracing/api/dinghyClasses/1', callback1);
        expect(dinghyRacingModel.dinghyClassUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/dinghyClasses/1').size).toBe(1);
    });
});

describe('when updating an entries position in the race', () => {
    it('if race exists and entry exists and URLs provided and position provided then updates competitor', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/races/4/updateEntryPosition?entry=http://localhost:8081/dinghyracing/api/entries/10&position=2') {
                return Promise.resolve({
                    ok: true,
                    status: 204,
                    headers: new Headers(),
                    json: () => Promise.resolve({})
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateEntryPosition({...entryChrisMarshallScorpionA1234}, 2);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        let temp = {...entryChrisMarshallScorpionA1234};
        expect(result.success).toBeTruthy();
    });
    it('if race URL not provided and entry exists and URL provided then returns message explaining issue', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateEntryPosition({...entryChrisMarshallScorpionA1234, race: {...raceScorpionA, url: null}}, 2);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, message: 'The race URL is required to update an entry position.'});
    });
    it('if race exists and URL provided and entry URL not provided then returns message explaining issue', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateEntryPosition({...entryChrisMarshallScorpionA1234, url: ''}, 2);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, message: 'An entry with a URL is required to update an entry position.'});
    });
    it('if update fails returns failed indicator and message explaining cause of failure', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 500, 
                statusText: 'Internal Server Error',
                json: () => Promise.resolve({})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateEntryPosition({...entryChrisMarshallScorpionA1234}, 2);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        let temp = {...entryChrisMarshallScorpionA1234};
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 500 Internal Server Error'});
    });
});

describe('when entry is requested', () => {
    describe('when dinghy has a crew', () => {
        it('returns a promise that resolves to a result indicating success and containing the entry when the entry is found', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"3"']]),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
            jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
                if (url === 'http://localhost:8081/dinghyracing/api/entries/10/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
                }
            });
            jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghy1234})});
            jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
            const promise = dinghyRacingModel.getEntry(entryChrisMarshallScorpionA1234.url);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({success: true, domainObject: {...entryChrisMarshallScorpionA1234, metadata: {eTag: '"3"'}}, eTag: '"3"'});
        });
    });
    describe('when dinghy does not have a crew', () => {
        it('returns a promise that resolves to a result indicating success and containing the entry when the entry is found', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"3"']]), 
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
            jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
                if (url === 'http://localhost:8081/dinghyracing/api/entries/10/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                    return Promise.resolve({'success': false, message: 'Unable to load race entries HTTP Error: 404 Message: JSON.parse: unexpected end of data at line 1 column 1 of the JSON data'});
                }
            });
            jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghy1234})});
            jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
            const promise = dinghyRacingModel.getEntry(entryChrisMarshallScorpionA1234.url);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({success: true, domainObject: {...entryChrisMarshallScorpionA1234, crew: null, metadata: {eTag: '"3"'}}, eTag: '"3"'});
        });
    });
    it('returns a promise that resolves to a result indicating failure when entry is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                headers: new Headers(),
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getEntry(entryChrisMarshallScorpionA1234.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
    });
    describe('when entry has not changed from last time retrieved', () => {
        it('returns entry from local store', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers([['ETag', '"3"']]),
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            dinghyRacingModel.entryResultMap.set(entryChrisMarshallDinghy1234HAL._links.self.href, {success: true,domainObject: {...entryChrisMarshallScorpionA1234, metadata: {eTag: '"3"'}}, eTag: '"3"'});
            const promise = dinghyRacingModel.getEntry(entryChrisMarshallScorpionA1234.url);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({success: true, domainObject: {...entryChrisMarshallScorpionA1234, metadata: {eTag: '"3"'}}, eTag: '"3"'});
        })
    });
    describe('when entry accessed via a relation from another entity so does not have a version ETag', () => {
        it('retrieves entry and does not update local store', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(entryChrisMarshallDinghy1234HAL)
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            dinghyRacingModel.entryResultMap.set(entryChrisMarshallDinghy1234HAL._links.self.href, {success: true, domainObject: {...entryChrisMarshallScorpionA1234, metadata: {eTag: '"3"'}}, eTag: '"3"'});
            jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
            jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
                if (url === 'http://localhost:8081/dinghyracing/api/entries/10/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
                }
            });
            jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghy1234})});
            jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
            const promise = dinghyRacingModel.getEntry(entryChrisMarshallScorpionA1234.url);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({success: true,domainObject: entryChrisMarshallScorpionA1234, eTag: null});
            expect(dinghyRacingModel.entryResultMap.get(entryChrisMarshallDinghy1234HAL._links.self.href)).toEqual({success: true, domainObject: {...entryChrisMarshallScorpionA1234, metadata: {eTag: '"3"'}}, eTag: '"3"'});
        })
    });
});

describe('when retrieving dinghies by sail number', () => {
    it('returns a success result containing dinghies with the provided sail number', async () => {
        const dinghy1234ScorpionHAL = {sailNumber: '1234', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } };
        const dinghy1234GraduateHAL = {sailNumber: '1234', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } };
        const dinghy1234CollectionHAL = {_embedded: {dinghies: [
            dinghy1234ScorpionHAL, dinghy1234GraduateHAL
        ]}, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/search/findBySailNumber?sailNumber=1234&page=0&size=20' } }, page: {size: 20, totalElements: 2, totalPages: 1, number: 0 }}
        const dinghy1234Scorpion = {sailNumber:'1234',dinghyClass: dinghyClassScorpion,url:'http://localhost:8081/dinghyracing/api/dinghies/2'};
        const dinghy1234Graduate = {sailNumber:'1234',dinghyClass: dinghyClassGraduate,url:'http://localhost:8081/dinghyracing/api/dinghies/6'};

        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghies') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghiesCollectionHAL)
                });
            }
            else if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findBySailNumber?sailNumber=1234') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghy1234CollectionHAL)
                });
            }
            else if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghyClassScorpionHAL)
                });
            }
            else if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghyClassGraduateHAL)
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
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = model.getDinghiesBySailNumber('1234');
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': [ dinghy1234Scorpion, dinghy1234Graduate ]});
    });
    describe('when no dinghies are found for the provided sail number', () => {
        it('returns a failed result containing a message explaining the cause of the failure', async () =>{
            fetch.mockImplementation((resource) => {
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
                });
            });
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = model.getDinghiesBySailNumber('1234');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
        });
    });
});

describe('when the crews that have sailed a dinghy are requested', () => {
    it('returns the crews', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http://localhost:8081/dinghyracing/api/dinghies/2') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(), 
                    json: () => Promise.resolve(dinghyScorpion1234CrewsHAL)
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

        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = model.getCrewsByDinghy(dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': dinghyScorpion1234Crews});
    });
    describe('when the crew only has a helm', () => {
        const dinghy1234CrewAHAL = {helm: competitorChrisMarshallHAL, mate: null};
        const dinghy1234CrewBHAL = {helm: competitorLiuBaoHAL, mate: competitorLouScrewHAL};
        const dinghy1234CrewsHAL = {_embedded: {crews: [dinghy1234CrewAHAL, dinghy1234CrewBHAL]}, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http%3A%2F%2Flocalhost%3A8081%2Fdinghyracing%2Fapi%2Fdinghies%2F2'}}};
        const dinghy1234CrewA = {helm: competitorChrisMarshall, mate: null};
        const dinghy1234CrewB = {helm: competitorLiuBao, mate: competitorLouScrew};
        const dinghy1234Crews = [dinghy1234CrewA, dinghy1234CrewB];

        it('returns the crews', async () => {
            fetch.mockImplementation((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http://localhost:8081/dinghyracing/api/dinghies/2') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(dinghy1234CrewsHAL)
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
    
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = model.getCrewsByDinghy(dinghy1234);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': dinghy1234Crews});
        });
    });
    describe('when the dinghy does not have a uri', () => {
        it('returns a promise that resolves to a result indicating failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.getCrewsByDinghy({sailNumber:'1234', dinghyClass: dinghyClassScorpion});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Cannot retrieve dinghy crews without URL for dinghy.'});
        });
    });
    describe('when no crew has sailed in the dinghy', () => {
        it('returns an empty crews', async () => {
            const emptyCrewsHAL = {_links: {self: {href: 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http%3A%2F%2Flocalhost%3A8081%2Fdinghyracing%2Fapi%2Fdinghies%2F2'}}};
            const emptyCrews = [];
            fetch.mockImplementation((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http://localhost:8081/dinghyracing/api/dinghies/2') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, headers: new Headers(), 
                        json: () => Promise.resolve(emptyCrewsHAL)
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

            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = model.getCrewsByDinghy(dinghy1234);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': emptyCrews});
        });
    });
    describe('when the dinghy does not exist', () => {
        it('returns a failed result containing a message explaining the cause of the failure', async () =>{
            fetch.mockImplementation((resource) => {
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
                });
            });
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = model.getDinghiesBySailNumber('1234');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
        });
    });
});

describe('when a websocket message callback has been set for fleet creation', () => {
    it('calls the callback', done => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerFleetCreationCallback(callback);
        // create delay to give time for stomp mock to trigger callback
        setTimeout(() => {
            expect(callback).toBeCalled();
            done();
        }, 1);
    });
    it('does not set another reference to the same callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerFleetCreationCallback(callback);
        dinghyRacingModel.registerFleetCreationCallback(callback);
        expect(dinghyRacingModel.fleetCreationCallbacks.size).toBe(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerFleetCreationCallback(callback1);
        dinghyRacingModel.registerFleetCreationCallback(callback2);
        expect(dinghyRacingModel.fleetCreationCallbacks.size).toBe(2);
    });
    it('removes websocket message when requested', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerFleetCreationCallback(callback);
        dinghyRacingModel.unregisterFleetCreationCallback(callback);
        expect(dinghyRacingModel.fleetCreationCallbacks.size).toBe(0);
    });
    it('does not remove functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerFleetCreationCallback(callback1);
        dinghyRacingModel.registerFleetCreationCallback(callback2);
        dinghyRacingModel.unregisterFleetCreationCallback(callback1);
        expect(dinghyRacingModel.fleetCreationCallbacks.size).toBe(1);
    });
});

describe('when a websocket message callback has been set for dinghy class update', () => {
    it('calls the callback', done => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        // create delay to give time for stomp mock to trigger callback
        setTimeout(() => {
            expect(callback).toBeCalled();
            done();
        }, 1);
    });
    it('does not set another reference to the same callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        dinghyRacingModel.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        expect(dinghyRacingModel.fleetUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/fleet/1').size).toBe(1);
    });
    it('sets a functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback1);
        dinghyRacingModel.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback2);
        expect(dinghyRacingModel.fleetUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/fleet/1').size).toBe(2);
    });
    it('removes websocket message when requested', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback = jest.fn();
        dinghyRacingModel.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        dinghyRacingModel.unregisterFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback);
        expect(dinghyRacingModel.fleetUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/fleet/1').size).toBe(0);
    });
    it('does not remove functionally equivalent but different callback', () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        dinghyRacingModel.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback1);
        dinghyRacingModel.registerFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback2);
        dinghyRacingModel.unregisterFleetUpdateCallback('http://localhost:8081/dinghyracing/api/fleet/1', callback1);
        expect(dinghyRacingModel.fleetUpdateCallbacks.get('http://localhost:8081/dinghyracing/api/fleet/1').size).toBe(1);
    });
});

describe('when the slowest dinghy class is requested', () => {
    it('returns the dinghy class', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/dinghyClasses/search/findTopByOrderByPortsmouthNumberDesc') {
                return Promise.resolve({
                    ok: true,
                    status: 200, headers: new Headers(),
                    json: () => Promise.resolve(dinghyClassCometHAL)
                });
            }
        });
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = model.getSlowestDinghyClass();
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({success: true, domainObject: dinghyClassComet});
    })
});

it('provides a clock', () => {
    const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
    expect(dinghyRacingModel.getClock()).toBeInstanceOf(Clock);
});