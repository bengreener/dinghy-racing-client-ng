import DinghyRacingModel, { SortOrder }  from './dinghy-racing-model';
import { httpRootURL, wsRootURL, competitorsCollectionHAL, 
    dinghiesCollectionHAL, dinghiesScorpionCollectionHAL, 
    dinghyClassCollectionHAL, dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassCometHAL, dinghy1234HAL, dinghy2726HAL, dinghy6745HAL,
    raceScorpion_AHAL, raceGraduate_AHAL, raceComet_AHAL, raceHandicap_AHAL,
    dinghyClasses, dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet,
    dinghies, dinghiesScorpion, dinghy1234, dinghy2726, dinghy6745, dinghy826,
    races, racesCollectionHAL, raceScorpionA, raceGraduateA, raceCometA,
    competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, 
    competitorsCollection, competitorChrisMarshall, competitorLouScrew, 
    entriesScorpionAHAL, entriesCometAHAL, entryChrisMarshallDinghy1234HAL, entriesHandicapAHAL,
    entriesScorpionA, entriesCometA, entriesHandicapA,
    competitorSarahPascal, raceHandicapA, entryChrisMarshallScorpionA1234, competitorOwainDavies, competitorJillMyer } from './__mocks__/test-data';
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
import StartSignals from './domain-classes/start-signals';

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
            if(options.body !== '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","actualStartTime":null,"dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","duration":2700,"plannedLaps":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"startSequenceState":null,"url":""}') {
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
            if(options.body !== '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","actualStartTime":null,"dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","duration":2700,"plannedLaps":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"startSequenceState":null,"url":""}') {
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
            if(options.body !== '{"name":"Scorpion A","plannedStartTime":"2021-10-14T14:10:00.000Z","actualStartTime":null,"dinghyClass":"http://localhost:8081/dinghyracing/api/dinghyclasses/1","duration":2700,"plannedLaps":null,"lapForecast":null,"lastLapTime":null,"averageLapTime":null,"clock":null,"startSequenceState":null,"url":""}') {
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
                    status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234, competitorLouScrew);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
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
        const promise = dinghyRacingModel.createEntry(raceScorpionA, competitorChrisMarshall, dinghy1234);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true});
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
        expect(result).toEqual({'success': true});
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
        expect(result).toEqual({'success': true});
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
});

describe('when retrieving a list of cmpetitors', () => {
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
                    status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                                status: 404
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
                                    status: 404
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
                                status: 404
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
                                    status: 404
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
                                status: 404
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
                                    status: 404
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
                                status: 404
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
                                status: 404
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
                                status: 404
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
                                status: 404
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
                                status: 404
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
                                status: 404
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
                                status: 404
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

    expect(race).toEqual({'name': '', 'plannedStartTime': null, 'actualStartTime': null, 'dinghyClass': DinghyRacingModel.dinghyClassTemplate(), 'duration': 0, 'plannedLaps': null, 'lapForecast': null, 'lastLapTime': null, 'averageLapTime': null, 'startSequenceState': null, 'clock': null, 'url': ''});
});

it('provides a blank template for a race entry', () => {
    const entry = DinghyRacingModel.entryTemplate();

    expect(entry).toEqual({'race': DinghyRacingModel.raceTemplate(), 'helm': DinghyRacingModel.competitorTemplate(), 'crew': null, 'dinghy': DinghyRacingModel.dinghyTemplate(), 'laps': [], 'sumOfLapTimes': 0, 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': null, 'url': ''});
});

it('provides a blank template for a lap', () => {
    const lap = DinghyRacingModel.lapTemplate();

    expect(lap).toEqual({'number': null, 'time': 0});
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
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceScorpionA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/10/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            }
            else if (url === 'http://localhost:8081/dinghyracing/api/entries/11/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorSarahPascal});
            }
            else if (url === 'http://localhost:8081/dinghyracing/api/entries/10/crew') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            }
            else if (url === 'http://localhost:8081/dinghyracing/api/entries/11/crew') {
                return Promise.resolve({'success': true, 'domainObject': competitorOwainDavies});
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
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and entries do not have crew recorded', async () => {
        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entriesCometAHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceCometA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/19/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorJillMyer});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/entries/19/crew') {
                return Promise.resolve({'success': false, 'message': '404 Not Found'});
            }
            else {
                return Promise.resolve({'success': false, 'message': 'Unable to identify competitor.'});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/19/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy826});
            }
            else {
                return Promise.resolve({'success': false, 'message': 'Unable to identify dinghy.'});
            }
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassComet})});
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
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
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceHandicapA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/crew') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorJillMyer});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/crew') {
                return Promise.resolve({'success': false, 'message': 'Error 404 Not Found'});
            };
            return Promise.resolve({'success': false, 'message': 'Unable to identify competitor.'});
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy1234});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy826});
            };
            return Promise.resolve({'success': false, 'message': 'Unable to identify dinghy.'});
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass') {
                return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                return Promise.resolve({'success': true, 'domainObject': dinghyClassComet});
            }
            return Promise.resolve({'success': false, 'message': 'Error 404 Not Found'});
        });
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
        const promise = dinghyRacingModel.getEntriesByRace(raceHandicapA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesHandicapA});
    });
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and some entries are on the last lap', async () => {
        const entriesHandicapAHAL_onLastLap = { '_embedded' : { 'entries' : [
            { 'averageLapTime': 'PT0S', 'lastLapTime': 'PT0S', 'sumOfLapTimes': 'PT0S' , 'onLastLap': true, 'finishedRace': false, 'scoringAbbreviation': null, 
                '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/helm' }, 
                'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/crew' }, 
                'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/laps' }, 
                'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/race' }, 
                'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/dinghy' } } 
            }, 
            { 'averageLapTime': 'PT0S', 'lastLapTime': 'PT0S', 'sumOfLapTimes': 'PT0S', 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': null,
                '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/helm' }, 
                'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/crew' }, 
                'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/laps' }, 
                'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/race' }, 
                'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/dinghy' } }
            } 
        ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/8/signedUp' } }};

        const entriesHandicapA_OnLastLap = [
            {'helm': competitorChrisMarshall, 'crew': competitorLouScrew, 'race': raceHandicapA, 'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'onLastLap': true, 'finishedRace': false, 'scoringAbbreviation': null, 'url': 'http://localhost:8081/dinghyracing/api/entries/20'}, 
            {'helm': competitorJillMyer, 'crew': null, 'race': raceHandicapA, 'dinghy': dinghy826, 'laps': [], 'sumOfLapTimes': 0, 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': null, 'url': 'http://localhost:8081/dinghyracing/api/entries/21'}
        ];

        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entriesHandicapAHAL_onLastLap)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceHandicapA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/crew') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorJillMyer});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/crew') {
                return Promise.resolve({'success': false, 'message': 'Error 404 Not Found'});
            };
            return Promise.resolve({'success': false, 'message': 'Unable to identify competitor.'});
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy1234});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy826});
            };
            return Promise.resolve({'success': false, 'message': 'Unable to identify dinghy.'});
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass') {
                return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                return Promise.resolve({'success': true, 'domainObject': dinghyClassComet});
            }
            return Promise.resolve({'success': false, 'message': 'Error 404 Not Found'});
        });
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
        const promise = dinghyRacingModel.getEntriesByRace(raceHandicapA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesHandicapA_OnLastLap});
    });
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and some entries have finished the race', async () => {
        const entriesHandicapAHAL_finishedRace = { '_embedded' : { 'entries' : [
            { 'averageLapTime': 'PT0S', 'lastLapTime': 'PT0S', 'sumOfLapTimes': 'PT0S' , 'onLastLap': false, 'finishedRace': true, 'scoringAbbreviation': null,
                '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/helm' }, 
                'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/crew' }, 
                'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/laps' }, 
                'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/race' }, 
                'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/dinghy' } } 
            }, 
            { 'averageLapTime': 'PT0S', 'lastLapTime': 'PT0S', 'sumOfLapTimes': 'PT0S', 'onLastLap': true, 'finishedRace': false, 'scoringAbbreviation': null,
                '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/helm' }, 
                'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/crew' }, 
                'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/laps' }, 
                'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/race' }, 
                'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/dinghy' } }
            } 
        ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/8/signedUp' } }};

        const entriesHandicapA_OnLastLap = [
            {'helm': competitorChrisMarshall, 'crew': competitorLouScrew, 'race': raceHandicapA, 'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'onLastLap': false, 'finishedRace': true, 'scoringAbbreviation': null, 'url': 'http://localhost:8081/dinghyracing/api/entries/20'}, 
            {'helm': competitorJillMyer, 'crew': null, 'race': raceHandicapA, 'dinghy': dinghy826, 'laps': [], 'sumOfLapTimes': 0, 'onLastLap': true, 'finishedRace': false, 'scoringAbbreviation': null, 'url': 'http://localhost:8081/dinghyracing/api/entries/21'}
        ];

        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entriesHandicapAHAL_finishedRace)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceHandicapA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/crew') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorJillMyer});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/crew') {
                return Promise.resolve({'success': false, 'message': 'Error 404 Not Found'});
            };
            return Promise.resolve({'success': false, 'message': 'Unable to identify competitor.'});
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy1234});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy826});
            };
            return Promise.resolve({'success': false, 'message': 'Unable to identify dinghy.'});
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass') {
                return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                return Promise.resolve({'success': true, 'domainObject': dinghyClassComet});
            }
            return Promise.resolve({'success': false, 'message': 'Error 404 Not Found'});
        });
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
        const promise = dinghyRacingModel.getEntriesByRace(raceHandicapA);
        const result = await promise;
        expect(promise).toBeInstanceOf(Promise);
        expect(result).toEqual({'success': true, 'domainObject': entriesHandicapA_OnLastLap});
    });
    it('returns a promise that resolves to a result indicating success and containing the entries when entries are found and some entries have a scoring abbreviation of DNS recorded', async () => {
        const entriesHandicapAHAL_DNS = { '_embedded' : { 'entries' : [
            { 'averageLapTime': 'PT0S', 'lastLapTime': 'PT0S', 'sumOfLapTimes': 'PT0S' , 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': 'DNS',
                '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
                'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/helm' }, 
                'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/crew' }, 
                'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/laps' }, 
                'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/race' }, 
                'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/dinghy' } } 
            }, 
            { 'averageLapTime': 'PT0S', 'lastLapTime': 'PT0S', 'sumOfLapTimes': 'PT0S', 'onLastLap': true, 'finishedRace': false, 'scoringAbbreviation': null,
                '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
                'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/helm' }, 
                'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/crew' }, 
                'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/laps' }, 
                'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/race' }, 
                'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/dinghy' } }
            } 
        ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/8/signedUp' } }};

        const entriesHandicapA_DNS = [
            {'helm': competitorChrisMarshall, 'crew': competitorLouScrew, 'race': raceHandicapA, 'dinghy': dinghy1234, 'laps': [], 'sumOfLapTimes': 0, 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': 'DNS', 'url': 'http://localhost:8081/dinghyracing/api/entries/20'}, 
            {'helm': competitorJillMyer, 'crew': null, 'race': raceHandicapA, 'dinghy': dinghy826, 'laps': [], 'sumOfLapTimes': 0, 'onLastLap': true, 'finishedRace': false, 'scoringAbbreviation': null, 'url': 'http://localhost:8081/dinghyracing/api/entries/21'}
        ];

        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve(entriesHandicapAHAL_DNS)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceHandicapA})});
        jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorChrisMarshall});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/crew') {
                return Promise.resolve({'success': true, 'domainObject': competitorLouScrew});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/helm') {
                return Promise.resolve({'success': true, 'domainObject': competitorJillMyer});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/crew') {
                return Promise.resolve({'success': false, 'message': 'Error 404 Not Found'});
            };
            return Promise.resolve({'success': false, 'message': 'Unable to identify competitor.'});
        });
        jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/entries/20/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy1234});
            };
            if (url === 'http://localhost:8081/dinghyracing/api/entries/21/dinghy') {
                return Promise.resolve({'success': true, 'domainObject': dinghy826});
            };
            return Promise.resolve({'success': false, 'message': 'Unable to identify dinghy.'});
        });
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation((url) => {
            if (url === 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass') {
                return Promise.resolve({'success': true, 'domainObject': dinghyClassScorpion});
            }
            if (url === 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass') {
                return Promise.resolve({'success': true, 'domainObject': dinghyClassComet});
            }
            return Promise.resolve({'success': false, 'message': 'Error 404 Not Found'});
        });
        jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
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
    describe('when there are more than 20 entries (default Spring page size) for a race', () => {
        it(' returns all the entries', async () => {
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
                        json: () => {throw new SyntaxError('Unexpected end of JSON input')}
                    });
                }
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(dinghyRacingModel, 'getRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': raceGraduateA})});
            jest.spyOn(dinghyRacingModel, 'getCompetitor').mockImplementation((url) => {
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1430/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorCarmenWhiting});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1431/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorAjDavis});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1432/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorIvanPlatt});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1433/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorNellPowell});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1434/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorGraceRees});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1435/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorArranAshley});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1436/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorMacySmall});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1437/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorDestinyBourne});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1438/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorDominicBarnett});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1439/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorAlaraTaylor});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1440/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorKieraDaniels});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1441/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorAmariBarber});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1442/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorHazelWheeler});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1443/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorLucasMillward});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1444/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorLouiseBarron});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1445/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorAlastairKhatun});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1446/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorSamsonMcGowan});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1447/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorCalebParkinson});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1448/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorInayaRegan});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1449/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorLeiaHaynes});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1450/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorNatanNewman});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1451/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorJamesonSharpe});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1452/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorElifPugh});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1453/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorWilfredMead});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1454/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorFrankySheppard});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1455/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorLeniTyler});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1456/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorMahnoorHope});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1457/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorAnthonyDillon});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1458/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorZackaryLindsay});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1459/helm') {
                    return Promise.resolve({'success': true, 'domainObject': competitorKhalilRushton});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1430/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorNoelHills});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1431/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorDanielLittle});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1432/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorAizaAustin});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1433/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorWilliamMorrison});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1434/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorAugustKhan});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1435/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorYuvrajSheppard});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1436/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorMaximFlynn});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1437/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorCezarWhelan});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1438/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorBaileyPreston});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1439/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorNadiaBarrow});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1440/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorZimalGrainger});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1441/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorRuqayyahWhittle});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1442/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorJaysonGraves});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1443/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorBellaBourne});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1444/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorCobieBaldwin});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1445/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorIrisSandhu});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1446/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorEsmeHyde});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1447/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorDakotaMoss});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1448/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorLeoEaton});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1449/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorDarcyEmery});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1450/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorDiegoHoughton});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1451/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorShelbyMiller});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1452/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorMaceyVaughan});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1453/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorLaineyAbbott});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1454/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorPaddyLowe});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1455/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorBaaniManning});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1456/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorSarahPritchard});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1457/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorLucienHoare});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1458/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorSerenDuffy});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1459/crew') {
                    return Promise.resolve({'success': true, 'domainObject': competitorBiancaSwan});
                }
                else {
                    return Promise.resolve({'success': false, 'message': 'Unable to identify competitor.'});
                }
            });
            jest.spyOn(dinghyRacingModel, 'getDinghy').mockImplementation((url) => {
                if (url === 'http://localhost:8081/dinghyracing/api/entries/1430/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy1});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1431/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy290});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1432/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2009});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1433/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2097});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1434/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2373});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1435/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2471});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1436/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2482});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1437/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2725});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1438/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2849});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1439/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2862});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1440/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2889});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1441/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2910});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1442/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2912});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1443/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2928});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1444/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2931});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1445/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2938});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1446/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2969});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1447/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2970});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1448/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2971});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1449/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2973});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1450/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2985});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1451/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy2987});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1452/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy3006});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1453/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy3009});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1454/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy3014});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1455/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy3015});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1456/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy3020});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1457/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy3021});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1458/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy3022});
                }
                else if (url === 'http://localhost:8081/dinghyracing/api/entries/1459/dinghy') {
                    return Promise.resolve({'success': true, 'domainObject': dinghy3088});
                }
                else {
                    return Promise.resolve({'success': false, 'message': 'Unable to identify dinghy.'});
                }
            });
            jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': dinghyClassGraduate})});
            jest.spyOn(dinghyRacingModel, 'getLaps').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': []})});
            const promise = dinghyRacingModel.getEntriesByRace(raceGraduateA);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({success: true, domainObject: entriesGraduateA_bigData});
        });
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
                json: () => Promise.resolve(raceHandicap_AHAL)
            });
        });
        const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(dinghyRacingModel, 'getDinghyClass').mockImplementation(() => {return Promise.resolve({'success': false, 'message': 'HTTP Error: 404 Message: Some error resulting in HTTP 404'})});
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

describe('when updateing the start sequence state for a race', () => {
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
            const promise = dinghyRacingModel.updateStartSequence(raceScorpionA, StartSignals.WARNINGSIGNAL);
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result.success).toBeTruthy();
        });
        it('returns a promise that resolves to a result indicating failure when start sequence stae is rejected by REST service', async () => {
            fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                    ok: false,
                    status: 404, 
                    json: () => Promise.resolve({})
                });
            });
            const dinghyRacingModel = new DinghyRacingModel(httpRootURL, wsRootURL);
            const promise = dinghyRacingModel.updateStartSequence(raceScorpionA, 'black flagged');
            const result = await promise;
            expect(promise).toBeInstanceOf(Promise);
            expect(result).toEqual({'success': false, 'message': 'HTTP Error: 404 Message: No additional information available'});
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
            const promise = dinghyRacingModel.updateStartSequence({ 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion}, StartSignals.PREPARATORYSIGNAL);
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
            const promise = dinghyRacingModel.updateStartSequence({ 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion}, StartSignals.ONEMINUTE);
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                            status: 404
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
                        status: 404
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