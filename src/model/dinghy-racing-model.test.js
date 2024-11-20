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
    raceScorpion_AHAL, raceGraduate_AHAL, raceComet_AHAL, raceHandicap_AHAL,
    dinghy1234CrewsHAL,
    dinghyClasses, dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet,
    dinghies, dinghiesScorpion, dinghy1234, dinghy2726, dinghy6745, dinghy826,
    races, racesCollectionHAL, raceScorpionA, raceGraduateA, raceCometA,
    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, 
    competitorsCollection, competitorChrisMarshall, competitorLouScrew, 
    entriesScorpionAHAL, entriesCometAHAL, entryChrisMarshallDinghy1234HAL, entriesHandicapAHAL,
    entriesScorpionA, entriesCometA, entriesHandicapA,
    competitorSarahPascal, raceHandicapA, entryChrisMarshallScorpionA1234, competitorJillMyer, 
    entrySarahPascalScorpionA6745, entryJillMyerCometA826, entryChrisMarshallHandicapA1234,
    dinghy1234Crews
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
import StartSignal from './domain-classes/start-signal';
import FlagState from './domain-classes/flag-state';
import RaceType from './domain-classes/race-type';
import FlagRole from './domain-classes/flag-role';

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
        const promise = dinghyRacingModel.read('dinghyclasses?sort=name,asc');
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
                    json: () => Promise.resolve({})
                });
            }
            else {
                return Promise.resolve({
                    ok: false,
                    status: 404,
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
                status: 200, 
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
    it('if a dinghy class URL is not supplied looks up dinghy class to get URL and returns a promise that resolves to a result indicating success when race is created with http status 200', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body !== '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","type":"FLEET","startType":"CSCCLUBSTART","duration":2700,"plannedLaps":null,"lapsSailed":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"startSequenceState":"NONE","dinghyClasses":[],"url":""}') {
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
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClassScorpion})});
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 
            'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(getDinghyClassByNameSpy).toHaveBeenCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: raceScorpionA});
    });
    it('if a dinghy class URL is supplied does not look up dinghy class to get URL and returns a promise that resolves to a result indicating success when race is created with http status 200', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body !== '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","type":"FLEET","startType":"CSCCLUBSTART","duration":2700,"plannedLaps":null,"lapsSailed":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"startSequenceState":"NONE","dinghyClasses":[],"url":""}') {
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
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClassScorpion})});
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': dinghyClassScorpion, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(getDinghyClassByNameSpy).not.toHaveBeenCalled();
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: raceScorpionA});
    });
    it('returns a promise that resolves to a result indicating success when race is created with http status 201', async () => {
        fetch.mockImplementationOnce((resource, options) => {// check format of data passed to fetch to reduce risk of false positive
            // check format of data passed to fetch to reduce risk of false positive
            if(options.body !== '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","type":"FLEET","startType":"CSCCLUBSTART","duration":2700,"plannedLaps":null,"lapsSailed":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"startSequenceState":"NONE","dinghyClasses":[],"url":""}') {
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
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({success: true, domainObject: dinghyClassScorpion})});
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00.000Z'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, 'duration': 2700000, type:'FLEET', startType: 'CSCCLUBSTART'});
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
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, type:'FLEET', startType: 'CSCCLUBSTART'});
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
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, type:'FLEET', startType: 'CSCCLUBSTART'});
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
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, type:'FLEET', startType: 'CSCCLUBSTART'});
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
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, type:'FLEET', startType: 'CSCCLUBSTART'});
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
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, type:'FLEET', startType: 'CSCCLUBSTART'});
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
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, type:'FLEET', startType: 'CSCCLUBSTART'});
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 503 Service Unavailable Message: Some error resulting in HTTP 503'}); 
    });
    it('returns a promise that resolves to a result indicating failure when race is not created due to an error that causes fetch to reject; such as a network failure', async () => {
        fetch.mockImplementationOnce(() => {
            throw new TypeError('Failed to fetch');
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.createRace({...DinghyRacingModel.raceTemplate(), 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00'), 'dinghyClass': {...DinghyRacingModel.dinghyClassTemplate(), 'name': 'Scorpion'}, type:'FLEET', startType: 'CSCCLUBSTART'});
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
    describe('when there are more dinghy classes available than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('retrieves and returns complete list of dinghy classes', async () => {
                const dinghyClassCollectionHAL_p0 = {
                    '_embedded' : { 'dinghyClasses' : [ dinghyClassScorpionHAL, dinghyClassGraduateHAL ] }, '_links' : {
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                fetch.mockImplementation(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
                        json: () => Promise.resolve(dinghyClassCollectionHAL)
                    });
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                const dinghyClasses_p0 = [dinghyClassScorpion, dinghyClassGraduate];
                fetch.mockImplementation(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
                        json: () => Promise.resolve(dinghyClassCollectionHAL)
                    });
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                const dinghyClasses_p0 = [dinghyClassScorpion, dinghyClassGraduate];
                fetch.mockImplementation(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
                        json: () => Promise.resolve(dinghyClassCollectionHAL)
                    });
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
                        'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses' } }, 
                             'page' : { 'size' : 2, 'totalElements' : 3, 'totalPages' : 2, 'number' : 0 
                        } 
                };
                const dinghyClasses_p0 = [dinghyClassScorpion, dinghyClassGraduate];
                fetch.mockImplementation(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
                        json: () => Promise.resolve(dinghyClassCollectionHAL)
                    });
                }).mockImplementationOnce(() => {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
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

        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getRacesOnOrAfterTime(new Date('2021-10-14T10:00:00.000Z'));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': races});
    });
    describe('when a race is at a start sequence stage', () => {
        it('returns a promise that resolves to a race that includes the start sequence stage', async () => {
            const raceScorpion_warningSignal_AHAL = {...raceScorpion_AHAL, 'startSequenceState': 'WARNINGSIGNAL'};
            const raceScorpionA_warningSignal = {...raceScorpionA, 'startSequenceState': 'WARNINGSIGNAL'};
            const racesCollectionHAL = {'_embedded':{'races':[raceScorpion_warningSignal_AHAL, raceGraduate_AHAL, raceComet_AHAL, raceHandicap_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':20,'totalElements':4,'totalPages':1,'number':0}};
            const races = [raceScorpionA_warningSignal, raceGraduateA, raceCometA, raceHandicapA];
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
                if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
    
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.getRacesOnOrAfterTime(new Date('2022-10-10T10:00:00.000Z'));
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': races});
        });
    });
    describe('when there are more races than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('returns a success result containing all the races that start at or after the specified time', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=4') {
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeGreaterThanEqual?time=2022-10-10T10:00:00.000Z&page=0&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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
                    json: () => Promise.resolve({})
                });
            }
            else {
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
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
                    status: 200,
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
                            status: 200,
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
                            status: 200,
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
                            status: 200,
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
                            status: 200,
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
                            status: 200,
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
                            status: 200,
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
                            status: 200,
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
                            status: 200,
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
                status: 200, 
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
        expect(result).toEqual({success: false, message: "HTTP Error: 409 Conflict Message: The competitor 'some name' already exissts; this may be caused by an uppercase/ lowercase differencce between existing record and the value entered."});
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
                    status: 200,
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
                    status: 200,
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
            const bodyMatch = {name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215};
            if ((resource === 'http://localhost:8081/dinghyracing/api/dinghyclasses/1') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({...dinghyClassScorpionHAL, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215})
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.updateDinghyClass(dinghyClassScorpion, 'Scorpion Two', 3, 1215);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: {...dinghyClassScorpion, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215}});
    });
    describe('when only one property provided to update', () => {
        it('updates only provided value and leaves other values unchanged', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                const bodyMatch = {name: 'Scorpion Two'};
                if ((resource === 'http://localhost:8081/dinghyracing/api/dinghyclasses/1') && (options.body === JSON.stringify(bodyMatch))) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({...dinghyClassScorpionHAL, name: 'Scorpion Two'})
                    });
                };
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.updateDinghyClass(dinghyClassScorpion, 'Scorpion Two');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, domainObject: {...dinghyClassScorpion, name: 'Scorpion Two'}});
        });
    });
    describe('when two properties provided to update', () => {
        it('updates only provided properties and leaves other values unchanged', async () => {
            fetch.mockImplementationOnce((resource, options) => {
                const bodyMatch = {crewSize: 3, portsmouthNumber: 1215};
                if ((resource === 'http://localhost:8081/dinghyracing/api/dinghyclasses/1') && (options.body === JSON.stringify(bodyMatch))) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({...dinghyClassScorpionHAL, crewSize: 3, portsmouthNumber: 1215})
                    });
                };
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.updateDinghyClass(dinghyClassScorpion, null, 3, 1215);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, domainObject: {...dinghyClassScorpion, crewSize: 3, portsmouthNumber: 1215}});
        });
    });
    it('if dinghy class exists but URL not provided then updates dinghy class', async () => {
        fetch.mockImplementationOnce((resource, options) => {
            const bodyMatch = {name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215};
            if ((resource === 'http://localhost:8081/dinghyracing/api/dinghyclasses/1') && (options.body === JSON.stringify(bodyMatch))) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({...dinghyClassScorpionHAL, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215})
                });
            };
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation((name) => {
            if (name === 'Scorpion') {
                return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion});
            }
            else {
                return Promise.resolve({'success': false, 'message': `Dinghy class not found: ${name}`});
            }
        });
        const promise = dinghyRacingModel.updateDinghyClass({...dinghyClassScorpion, url: undefined}, 'Scorpion Two', 3, 1215);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, domainObject: {...dinghyClassScorpion, name: 'Scorpion Two', crewSize: 3, portsmouthNumber: 1215}});
    });
    it('if dinghy class does not exist returns message explaining issue', async () => {
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClassByName').mockImplementation((name) => {
            return Promise.resolve({'success': false, 'message': `Dinghy class not found: ${name}`});
        });
        const promise = dinghyRacingModel.updateDinghyClass({...dinghyClassScorpion, url: undefined}, 'Scorpion Two', 3, 1215);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'Dinghy class not found: Scorpion'});
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
                status: 200, 
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
                status: 200, 
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
        expect(result).toEqual({success: false, message: "HTTP Error: 409 Conflict Message: The dinghy '102-None' already exissts; this may be caused by an uppercase/ lowercase differencce between existing record and the value entered."});
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
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
                        json: () => Promise.resolve(dinghyClassGraduateHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
                            status: 200, 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
                            json: () => Promise.resolve(dinghyClassScorpionHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
                            json: () => Promise.resolve(dinghyClassGraduateHAL)
                        });
                    }
                    if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                                status: 200, 
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
                            status: 200, 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                                    status: 200, 
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
                            status: 200, 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                                    status: 200, 
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
                            status: 200, 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                                    status: 200, 
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
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
                        json: () => Promise.resolve(dinghyClassGraduateHAL)
                    });
                }
                if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&page=0&size=20' } }, 'page' : { 'size' : 1, 'totalElements' : 2, 'totalPages' : 2, 'number' : 0 } };
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghiesCollectionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&page=0&size=2') {
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
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                                status: 200, 
                                json: () => Promise.resolve(dinghiesCollectionHAL)
                            });
                        }
                        else if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&page=0&size=20' } }, 'page' : { 'size' : 1, 'totalElements' : 2, 'totalPages' : 2, 'number' : 0 } };
                    const dinghiesScorpion_p0 = [dinghy1234];
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&page=0') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&page=0&size=20' } }, 'page' : { 'size' : 1, 'totalElements' : 2, 'totalPages' : 2, 'number' : 0 } };
                    const dinghiesScorpion_p0 = [dinghy1234];
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&size=1') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                    ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&page=0&size=20' } }, 'page' : { 'size' : 1, 'totalElements' : 2, 'totalPages' : 2, 'number' : 0 } };
                    const dinghiesScorpion_p0 = [dinghy1234];
                    fetch.mockImplementation((resource) => {
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies?page=0&size=5') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
                            json: () => Promise.resolve(dinghiesCollectionHAL)
                        });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassScorpionHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' || resource === 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
                                json: () => Promise.resolve(dinghyClassGraduateHAL)
                            });
                        }
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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
                        if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&page=0&size=1') {
                            return Promise.resolve({
                                ok: true,
                                status: 200, 
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

it('provides a blank template for a competitor', () => {
    const competitor = DinghyRacingModel.competitorTemplate();

    expect(competitor).toEqual({'name': '', 'url': ''});
});

it('provides a blank template for a dinghy class', () => {
    const dinghyClass = DinghyRacingModel.dinghyClassTemplate();

    expect(dinghyClass).toEqual({'name': '', 'crewSize': 1, portsmouthNumber: null, 'url': ''});
});

it('provides a blank template for a dinghy', () => {
    const dinghy = DinghyRacingModel.dinghyTemplate();

    expect(dinghy).toEqual({'sailNumber': '', 'dinghyClass': DinghyRacingModel.dinghyClassTemplate(), 'url': ''});
});

it('provides a blank template for a race', () => {
    const race = DinghyRacingModel.raceTemplate();

    expect(race).toEqual({name: '', plannedStartTime: null, dinghyClass: DinghyRacingModel.dinghyClassTemplate(), type: null, startType: null, duration: 0, plannedLaps: null, lapsSailed: null, lapForecast: null, lastLapTime: null, averageLapTime: null, startSequenceState: 'NONE', dinghyClasses: [], clock: null, url: ''});
});

it('provides a blank template for a race entry', () => {
    const entry = DinghyRacingModel.entryTemplate();

    expect(entry).toEqual({race: DinghyRacingModel.raceTemplate(), helm: DinghyRacingModel.competitorTemplate(), crew: null, dinghy: DinghyRacingModel.dinghyTemplate(), laps: [], sumOfLapTimes: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: ''});
});

it('provides a blank template for a lap', () => {
    const lap = DinghyRacingModel.lapTemplate();

    expect(lap).toEqual({'number': null, 'time': 0});
});

it('provides a blank template for a crew', () => {
    const crew = DinghyRacingModel.crewTemplate();

    expect(crew).toEqual({helm: null, mate: null});
});

describe('when searching for entries by race', () => {
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and entries have crew recorded', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
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
                json: () => Promise.resolve(entriesHandicapAHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getEntry').mockImplementation((url) => {
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
        expect(result).toEqual({'success': true, 'domainObject': entriesHandicapA});
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
                        json: () => Promise.resolve(findByRaceGraduate_AHAL_bigData)
                    });
                }
                else if (resource === 'http://localhost:8081/dinghyracing/api/races/7/signedUp') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
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
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(raceScorpion_AHAL_withEntries)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
        const promise = dinghyRacingModel.getRace(raceScorpionA.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': raceScorpionA_withEntries});
    });
    // handicap races do not have a dinghy class set so a 404 when searcing for a dinghy class from race is an expected result
    it('returns a promise that resolves to a result indicating success and containing the race when the race is found but the dinghyClass is not found as the race is a handicap', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(raceHandicap_AHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'})});
        const promise = dinghyRacingModel.getRace(raceHandicapA.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': raceHandicapA});
    });
    describe('when race is at a start sequence stage', () => {
        it('returns a promise that resolves to a race that includes the start sequence stage', async () => {
            const raceScorpion_warningSignal_AHAL = {...raceScorpion_AHAL, 'startSequenceState': 'WARNINGSIGNAL'};
            const raceScorpionA_warningSignal = {...raceScorpionA, 'startSequenceState': 'WARNINGSIGNAL'};
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(raceScorpion_warningSignal_AHAL)
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
            const promise = dinghyRacingModel.getRace(raceScorpionA_warningSignal.url);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': raceScorpionA_warningSignal});
        });
    });
    describe('when an entry has already sailed a lap', () => {
        it('returns a race that includes the number of laps sailed by the lead entry', async () => {
            const raceScorpion_lapsSailed_AHAL = {...raceScorpion_AHAL, leadEntry: {...raceScorpion_AHAL.leadEntry, lapsSailed: 3}};
            const raceScorpion_lapsSailed = {...raceScorpionA, lapsSailed: 3};
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(raceScorpion_lapsSailed_AHAL)
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion})});
            const promise = dinghyRacingModel.getRace(raceScorpion_lapsSailed.url);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': raceScorpion_lapsSailed});
        })
    })
    it('returns a promise that resolves to a result indicating failure when race is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getRace(raceScorpionA.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
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
    });
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

describe('when updating the start sequence state for a race', () => {
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
            const promise = dinghyRacingModel.updateRaceStartSequenceState(raceScorpionA, StartSignal.WARNINGSIGNAL);
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
            const promise = dinghyRacingModel.updateRaceStartSequenceState(raceScorpionA, 'black flagged');
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
                    status: 200,
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getRaceByNameAndPlannedStartTime').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': {raceScorpionA}})});
            const promise = dinghyRacingModel.updateRaceStartSequenceState({ 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion}, StartSignal.PREPARATORYSIGNAL);
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
            const promise = dinghyRacingModel.updateRaceStartSequenceState({ 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion}, StartSignal.ONEMINUTE);
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
                status: 200,
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
                status: 200,
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

describe('when retrieving a list of races that start between the specified times', () => {
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
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
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
    
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'));
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': races});
    });
    describe('when a race is at a start sequence stage', () => {
        it('returns a promise that resolves to a race that includes the start sequence stage', async () => {
            const raceScorpion_warningSignal_AHAL = {...raceScorpion_AHAL, 'startSequenceState': 'WARNINGSIGNAL'};
            const raceScorpionA_warningSignal = {...raceScorpionA, 'startSequenceState': 'WARNINGSIGNAL'};
            const racesCollectionHAL = {'_embedded':{'races':[raceScorpion_warningSignal_AHAL, raceGraduate_AHAL, raceComet_AHAL, raceHandicap_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':20,'totalElements':4,'totalPages':1,'number':0}};
            const races = [raceScorpionA_warningSignal, raceGraduateA, raceCometA, raceHandicapA];
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
                if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
    
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'));
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': races});
        });
    });
    describe('when there are more races than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('returns a success result containing all the races that start at or after the specified time', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&page=0&size=4') {
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&page=0') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetween?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&page=0&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
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
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.getRacesBetweenTimes(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': races});
        });
    });
});

describe('when retrieving a list of races that start between the specified times', () => {
    // Can this test can be affected by BST, or other time zones (yes, if timezone changes test data (races) will need to be adjusted to reflect the change in the timezone (currently set up for British Summer Time))
    it('returns a collection of races that start between the specified times', async () => {
        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET') {
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
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
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
    
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getRacesBetweenTimesForType(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), RaceType.FLEET);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': races});
    });
    describe('when a race is at a start sequence stage', () => {
        it('returns a promise that resolves to a race that includes the start sequence stage', async () => {
            const raceScorpion_warningSignal_AHAL = {...raceScorpion_AHAL, 'startSequenceState': 'WARNINGSIGNAL'};
            const raceScorpionA_warningSignal = {...raceScorpionA, 'startSequenceState': 'WARNINGSIGNAL'};
            const racesCollectionHAL = {'_embedded':{'races':[raceScorpion_warningSignal_AHAL, raceGraduate_AHAL, raceComet_AHAL, raceHandicap_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':20,'totalElements':4,'totalPages':1,'number':0}};
            const races = [raceScorpionA_warningSignal, raceGraduateA, raceCometA, raceHandicapA];
            fetch.mockImplementation((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET') {
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
                if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
    
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.getRacesBetweenTimesForType(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), RaceType.FLEET);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': races});
        });
    });
    describe('when there are more races than fit on a single page', () => {
        describe('when page and size are not supplied', () => {
            it('returns a success result containing all the races that start at or after the specified time', async () => {
                const racesCollectionHAL_p0 = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':2,'totalElements':4,'totalPages':1,'number':0}};
                fetch.mockImplementation((resource) => {
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET&page=0&size=4') {
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                const promise = dinghyRacingModel.getRacesBetweenTimesForType(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), RaceType.FLEET);
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET') {
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET&page=0') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                const promise = dinghyRacingModel.getRacesBetweenTimesForType(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), RaceType.FLEET, 0);
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET') {
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                const promise = dinghyRacingModel.getRacesBetweenTimesForType(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), RaceType.FLEET, null, 2);
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET') {
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                    if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET&page=0&size=2') {
                        return Promise.resolve({
                            ok: true,
                            status: 200, 
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
                const promise = dinghyRacingModel.getRacesBetweenTimesForType(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), RaceType.FLEET, 0, 2);
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
                if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET&sort=plannedStartTime,ASC') {
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
            if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
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
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.getRacesBetweenTimesForType(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), RaceType.FLEET, null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': true, 'domainObject': races});
        });
    });
});

describe('when a StartSequence is requested', () => {
    it('returns a promise that resolves to a success containing a StartSequence for the races between the start and end times', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2021-10-14T10:10:00Z'));

        fetch.mockImplementation((resource) => {
            if (resource === 'http://localhost:8081/dinghyracing/api/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=2022-10-10T10:00:00.000Z&endTime=2022-10-10T11:00:00.000Z&type=FLEET&sort=plannedStartTime,ASC') {
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
        if (resource === 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass') {
            return Promise.resolve({
                ok: true,
                status: 200,
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

        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);

        const scorpionAWarningFlag = {name: 'Scorpion Class Flag', role: FlagRole.WARNING, actions: []};
        const preparatoryFlag = {name: 'Blue Peter', role: FlagRole.PREPARATORY, actions: []};
        const graduateAWarningFlag = {name: 'Graduate Class Flag', role: FlagRole.WARNING, actions: []};
        const cometAWarningFlag = {name: 'Comet Class Flag', role: FlagRole.WARNING, actions: []};
        const handicapAWarningFlag = {name: 'Club Burgee', role: FlagRole.WARNING, actions: []};
    
        const scorpionAWarningFlagRaiseAction = {flag: scorpionAWarningFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
        const scorpionAWarningFlagLowerAction = {flag: scorpionAWarningFlag, time: raceScorpionA.plannedStartTime, afterState: FlagState.LOWERED};
        
        const preparatoryFlagRaiseAction = {flag: preparatoryFlag, time: new Date(raceScorpionA.plannedStartTime.valueOf() - 300000), afterState: FlagState.RAISED};
        const preparatoryFlagLowerAction = {flag: preparatoryFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
        
        const graduateAWarningFlagRaiseAction = {flag: graduateAWarningFlag, time: new Date(raceGraduateA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
        const graduateAWarningFlagLowerAction = {flag: graduateAWarningFlag, time: raceGraduateA.plannedStartTime, afterState: FlagState.LOWERED};

        const cometAWarningFlagRaiseAction = {flag: cometAWarningFlag, time: new Date(raceCometA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
        const cometAWarningFlagLowerAction = {flag: cometAWarningFlag, time: raceCometA.plannedStartTime, afterState: FlagState.LOWERED};

        const handicapAWarningFlagRaiseAction = {flag: handicapAWarningFlag, time: new Date(raceHandicapA.plannedStartTime.valueOf() - 600000), afterState: FlagState.RAISED};
        const handicapAWarningFlagLowerAction = {flag: handicapAWarningFlag, time: raceHandicapA.plannedStartTime, afterState: FlagState.LOWERED};
    
        scorpionAWarningFlag.actions.push(scorpionAWarningFlagRaiseAction);
        scorpionAWarningFlag.actions.push(scorpionAWarningFlagLowerAction);
        
        preparatoryFlag.actions.push(preparatoryFlagRaiseAction);
        preparatoryFlag.actions.push(preparatoryFlagLowerAction);
        
        graduateAWarningFlag.actions.push(graduateAWarningFlagRaiseAction);
        graduateAWarningFlag.actions.push(graduateAWarningFlagLowerAction);
        
        cometAWarningFlag.actions.push(cometAWarningFlagRaiseAction);
        cometAWarningFlag.actions.push(cometAWarningFlagLowerAction);
        
        handicapAWarningFlag.actions.push(handicapAWarningFlagRaiseAction);
        handicapAWarningFlag.actions.push(handicapAWarningFlagLowerAction);


        const promise = dinghyRacingModel.getStartSequence(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), RaceType.FLEET);
        const result = await promise;
        const actions = result.domainObject.getActions();

        expect(promise).toBeInstanceOf(Promise);
        expect(actions).toHaveLength(10);
        expect(actions[0]).toStrictEqual(scorpionAWarningFlagRaiseAction);
        expect(actions[1]).toStrictEqual(scorpionAWarningFlagLowerAction);
        expect(actions[2]).toStrictEqual(graduateAWarningFlagRaiseAction);
        expect(actions[3]).toStrictEqual(graduateAWarningFlagLowerAction);
        expect(actions[4]).toStrictEqual(cometAWarningFlagRaiseAction);
        expect(actions[5]).toStrictEqual(cometAWarningFlagLowerAction);
        expect(actions[6]).toStrictEqual(handicapAWarningFlagRaiseAction);
        expect(actions[7]).toStrictEqual(handicapAWarningFlagLowerAction);
        expect(actions[8]).toStrictEqual(preparatoryFlagRaiseAction);
        expect(actions[9]).toStrictEqual(preparatoryFlagLowerAction);

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });
    it('returns a promise that resolves to a result indicating failure and providing a message indicating cause when a problem is encountered', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getStartSequence(new Date('2022-10-10T10:00:00.000Z'), new Date('2022-10-10T11:00:00.000Z'), RaceType.FLEET);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
    });
});

describe('when updating the plannedLaps for a race', () => {
    describe('when a url is provided for race', () => {
        it('returns a promise that resolves to a success response when race planned laps is successfully updated', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200,
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
                    status: 200,
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
                    status: 200,
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

describe('when an entry is requested', () => {
    describe('when dinghy has a crew', () => {
        it('returns a promise that resolves to a result indicating success and containing the entry when the entry is found', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
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
            expect(result).toEqual({'success': true, 'domainObject': entryChrisMarshallScorpionA1234});
        });
    });
    describe('when dinghy does not have a crew', () => {
        it('returns a promise that resolves to a result indicating success and containing the entry when the entry is found', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
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
            expect(result).toEqual({success: true, domainObject: {...entryChrisMarshallScorpionA1234, crew: null}});
        });
    });
    it('returns a promise that resolves to a result indicating failure when entry is not found', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: () => Promise.resolve({'cause': {'cause': null, 'message': 'Some error resulting in HTTP 404'}, 'message': 'Some error resulting in HTTP 404'})
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        const promise = dinghyRacingModel.getEntry(entryChrisMarshallScorpionA1234.url);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Not Found Message: Some error resulting in HTTP 404'});
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
                    status: 200, 
                    json: () => Promise.resolve(dinghiesCollectionHAL)
                });
            }
            else if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/search/findBySailNumber?sailNumber=1234') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(dinghy1234CollectionHAL)
                });
            }
            else if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve(dinghyClassScorpionHAL)
                });
            }
            else if (resource === 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
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
                    status: 200, 
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
    describe('when the dinghy does not have a uri', () => {
        it('returns a promise that resolves to a result indicating failure', async () => {
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.getCrewsByDinghy({sailNumber:'1234', dinghyClass: dinghyClassScorpion});
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'Cannot retrieve dinghy crews without URL for dinghy.'});
        });
    })
    describe('when no crew has sailed in the dinghy', () => {
        it('returns an empty crews', async () => {
            const emptyCrewsHAL = {_links: {self: {href: 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http%3A%2F%2Flocalhost%3A8081%2Fdinghyracing%2Fapi%2Fdinghies%2F2'}}};
            const emptyCrews = [];
            fetch.mockImplementation((resource) => {
                if (resource === 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http://localhost:8081/dinghyracing/api/dinghies/2') {
                    return Promise.resolve({
                        ok: true,
                        status: 200, 
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
})