/*
* Copyright 2022-2024 BG Information Systems Ltd
*
* Licensed under the Apache License, Version 2.0 (the License);
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an AS IS BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License. 
*/


import Clock from '../clock';
import Collection from '../collection';
import Competitor from '../competitor';
import Crew from '../crew';
import Dinghy from '../dinghy';
import DinghyClass from '../dinghy-class';
import EmbeddedRace from '../embedded-race';
import Entry from '../entry';
import Fleet from '../fleet';
import Lap from '../lap';
import Race from '../race';
import RaceType from '../race-type';
import SessionStartSequence from '../session-start-sequence';
import SignedUp from '../signed-up';
import {
    competitorBobHoskinsHAL, competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorLiuBaoHAL,  competitorLouScrewHAL, competitorJillMyerHAL, competitorOwainDaviesHAL,
    crews1234ScorpionHAL,
    dinghyClassCometHAL, dinghyClassGraduateHAL, dinghyClassScorpionHAL, 
    dinghy826HAL, dinghy1234HAL, dinghy2726HAL, dinghy6745HAL,
    embeddedRaceVeteransAHAL, embeddedRaceLadiesAHAL,
    entryLiuBao2726GraduateAHAL, entryChrisMarshall1234PursuitAHAL, entryJillMyer826PursuitAHAL,
    entryChrisMarshall1234HandicapAHAL, entryChrisMarshall1234ScorpionAHAL,
    entryJillMyer826CometAHAL, entryJillMyer826HandicapAHAL,
    entrySarahPascal6745HandicapAHAL, entrySarahPascal6745ScorpionAHAL,
    fleetCometHAL, fleetScorpionHAL, 
    raceScorpionAHAL, raceCometAHAL, raceGraduateAHAL, raceHandicapAHAL, racePursuitAHAL,
    fleetGraduateHAL, fleetHandicapHAL,
    signedUpChrisMarshallDinghy1234HandicapAHAL, signedUpChrisMarshallDinghy1234ScorpionAHAL, signedUpChrisMarshallDinghy1234VeteransAHAL, signedUpChrisMarshallDinghy1234PursuitAHAL,
    signedUpJillMyerDinghy826CometAHAL, signedUpJillMyerDinghy826HandicapAHAL, signedUpJillMyerDinghy826PursuitAHAL,
    signedUpSarahPascalDinghy6745HandicapAHAL, signedUpSarahPascalDinghy6745ScorpionAHAL, signedUpLiuBaoDinghy2726GraduateAHAL,
} from './test-data';

class SylphModel {

    #clock = new Clock();
    #competitorCreationCallbacks = new Set();
    #competitorUpdateCallbacks = new Map();
    #dinghyCreationCallbacks = new Set();
    #dinghyClassCreationCallbacks = new Set();
    #dinghyClassUpdateCallbacks = new Map();
    #entryCreationCallbacks = new Set();
    #entryDeletionCallbacks = new Map();
    #entryUpdateCallbacks = new Map();
    #fleetCreationCallbacks = new Set();
    #fleetUpdateCallbacks = new Map();
    #raceUpdateCallbacks = new Map();
    #raceEntryLapsUpdateCallbacks = new Map();
    
    constructor(httpRootURL, wsRootURL) {
        if (!httpRootURL) {
            throw new Error('An HTTP root URL is required when creating an instance of DinghyRacingModel');
        }
        if (!wsRootURL) {
            throw new Error('A WebSocket root URL is required when creating an instance of DinghyRacingModel');
        }
        this.handleCompetitorCreation = this.handleCompetitorCreation.bind(this);
        this.handleCompetitorUpdate = this.handleCompetitorUpdate.bind(this);
        this.handleDinghyCreation = this.handleDinghyCreation.bind(this);
        this.handleDinghyClassCreation = this.handleDinghyClassCreation.bind(this);
        this.handleDinghyClassUpdate = this.handleDinghyClassUpdate.bind(this);
        this.handleEntryCreation = this.handleEntryCreation.bind(this);
        this.handleEntryDeletion = this.handleEntryDeletion.bind(this);
        this.handleEntryUpdate = this.handleEntryUpdate.bind(this);
        this.handleFleetCreation = this.handleFleetCreation.bind(this);
        this.handleFleetUpdate = this.handleFleetUpdate.bind(this);
        this.handleRaceUpdate = this.handleRaceUpdate.bind(this);
        this.handleRaceEntryLapsUpdate = this.handleRaceEntryLapsUpdate.bind(this);
        this.httpRootURL = httpRootURL;
        this.wsRootURL = wsRootURL;
    }

    async addLap(entry, time) {
        return new Entry({}, {version: ''}, this);
    }

    convertISO8601DurationToMilliseconds(duration) {
        const match = /(^|\+)[Pp][Tt](\+?(\d+)[Hh])?(\+?(\d+)[Mm])?(\+?(\d+([.,]\d+)?)[Ss])?$/.exec(duration);
        // check id duration is a valid ISO 801 duration format
        if (!match) {
            throw new TypeError('Duration not in expected format or range. ISO 8601 format, positive time values only expected.');
        }
        // get hour component (group 3)
        const hourMS = match[3] ? match[3] * 3600000 : 0;
        // get minute component (group 5)
        const minuteMS = match[5] ? match[5] * 60000 : 0;
        // get second component (group 7)
        const secondDuration = /,/.test(match[7]) ? match[7].replace(',', '.') : match[7];
        const secondMS =  secondDuration ? secondDuration * 1000 : 0;
        return hourMS + minuteMS + secondMS;
    }

    async createCompetitor(name) {
        return new Competitor({}, {version: ''}, this);
    }

    async createDinghy(sailNumber, dinghyClass) {
        return new Dinghy({}, {version: ''}, this);
    }

    async createDinghyClass(name, crewSize, portsmouthNumber, externalName = null) {
        return new DinghyClass({}, {version: ''}, this);
    }
    
    async createFleet(name, dinghyClasses) {
        return new Fleet({}, {version: ''}, this);
    }
    
    async createRace(name, plannedStartTime, fleet, duration, plannedLaps, type, startType) {
        return new Race({}, {version: ''}, this);
    }

    getClock() {
        return this.#clock;
    }
    
    async getCompetitor(url) {
        let hal;
        let version = '';
        if (url === competitorChrisMarshallHAL._links.self.href || url === entryChrisMarshall1234HandicapAHAL._links.helm.href || url === entryChrisMarshall1234ScorpionAHAL._links.helm.href || url === entryChrisMarshall1234PursuitAHAL._links.helm.href) {
            hal = competitorChrisMarshallHAL;
            version = '"0"';
        }
        else if (url === competitorSarahPascalHAL._links.self.href || url === entrySarahPascal6745HandicapAHAL._links.helm.href || url === entrySarahPascal6745ScorpionAHAL._links.helm.href) {
            hal = competitorSarahPascalHAL;
            version = '"0"';
        }
        else if (url === competitorJillMyerHAL._links.self.href || url === entryJillMyer826CometAHAL._links.helm.href || url === entryJillMyer826HandicapAHAL._links.helm.href || url === entryJillMyer826PursuitAHAL._links.helm.href) {
            hal = competitorJillMyerHAL;
            version = '"0"';
        }
        else if (url === competitorLouScrewHAL._links.self.href || url === entryChrisMarshall1234HandicapAHAL._links.crew.href || url === entryChrisMarshall1234ScorpionAHAL._links.crew.href || url === entryChrisMarshall1234PursuitAHAL._links.crew.href) {
            hal = competitorLouScrewHAL;
            version = '"0"';
        }
        else if (url === competitorOwainDaviesHAL._links.self.href || url === entrySarahPascal6745HandicapAHAL._links.crew.href || url === entrySarahPascal6745ScorpionAHAL._links.crew.href) {
            hal = competitorOwainDaviesHAL;
            version = '"0"';
        }
        else if (url === competitorLiuBaoHAL._links.self.href || url === entryLiuBao2726GraduateAHAL._links.helm.href) {
            hal = competitorLiuBaoHAL;
            version = '"0"';
        }
        else if (url === competitorBobHoskinsHAL._links.self.href || url === entryLiuBao2726GraduateAHAL._links.crew.href) {
            hal = competitorBobHoskinsHAL;
            version = '"0"';
        }
        if (hal) {
            return new Competitor(hal, {version: version}, this);
        }
        throw new Error('HTTP Error: 404');
    }

    async getCompetitors(page, size) {
        const competitorChrisMarshall = new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, this);
        const competitorJillMyer = new Competitor(competitorJillMyerHAL, {version: '"0"'}, this);
        const competitorLiuBao = new Competitor(competitorLiuBaoHAL, {version: '"0"'}, this);
        const competitorLouScrew = new Competitor(competitorLouScrewHAL, {version: '"0"'}, this);
        const competitorOwainDavies = new Competitor(competitorOwainDaviesHAL, {version: '"0"'}, this);
        const competitorSarahPascal = new Competitor(competitorSarahPascalHAL, {version: '"0"'}, this);

        let competitors = [competitorChrisMarshall, competitorJillMyer, competitorLiuBao, competitorLouScrew, competitorOwainDavies, competitorSarahPascal];
        let totalElements = 6;

        return new Collection(competitors, {size: 20, totalElements: totalElements, totalPages: 0, number: 0});
    }

    async getCrewsByDinghy(dinghy) {
        let hal;
        if (dinghy.url === dinghy1234HAL._links.self.href) {
            // crews.push(new Crew(crews1234ScorpionHAL, {version: '"0"'}, this));
            hal = crews1234ScorpionHAL;
        }
        const crews = hal._embedded.crews.map(crew => {return new Crew(crew, null, this)});
        return new Collection(crews, {size: crews.length, totalElements: crews.length, totalPages: 1, number: 0});
    }

    async getDinghy(url) {
        let hal;
        let version = '';
        if (url === dinghy1234HAL._links.self.href) {
            hal = dinghy1234HAL;
            version = '"0"';
        }
        else if (url === entryChrisMarshall1234HandicapAHAL._links.dinghy.href || url === entryChrisMarshall1234ScorpionAHAL._links.dinghy.href || url === entryChrisMarshall1234PursuitAHAL._links.dinghy.href) {
            hal = dinghy1234HAL;
        }
        else if (url === dinghy6745HAL._links.self.href) {
            hal = dinghy6745HAL;
            version = '"0"';
        }
        else if (url === entrySarahPascal6745HandicapAHAL._links.dinghy.href || url === entrySarahPascal6745ScorpionAHAL._links.dinghy.href) {
            hal = dinghy6745HAL;
        }
        else if (url === dinghy826HAL._links.self.href) {
            hal = dinghy826HAL;
            version = '"0"';
        }
        else if (url === entryJillMyer826CometAHAL._links.dinghy.href || url === entryJillMyer826HandicapAHAL._links.dinghy.href || url === entryJillMyer826PursuitAHAL._links.dinghy.href) {
            hal = dinghy826HAL;
        }
        else if (url === entryLiuBao2726GraduateAHAL._links.dinghy.href) {
            hal = dinghy2726HAL;
        }
        return new Dinghy(hal, {version: version}, this);
    }

    async getDinghyBySailNumberAndDinghyClass(sailNumber, dinghyClass) {
        let hal;
        if (sailNumber === '826' && dinghyClass.url === 'http://localhost:8081/dinghyracing/api/dinghyClasses/16') {
            hal = dinghy826HAL;
        }
        else if (sailNumber === '1234' && dinghyClass.url === 'http://localhost:8081/dinghyracing/api/dinghyClasses/1') {
            hal = dinghy1234HAL;
        }
        else {
            throw new Error('HTTP Error: 404');
        }
        return new Dinghy(hal, {version: '"0"'}, this);
    }

    async getDinghyClass(url) {
        let hal;
        let version = '';
        if (url === dinghyClassScorpionHAL._links.self.href) {
            hal = dinghyClassScorpionHAL;
            version = '"0"';
        }
        else if (url === dinghy1234HAL._links.dinghyClass.href || url === dinghy6745HAL._links.dinghyClass.href) {
            hal = dinghyClassScorpionHAL;
        }
        else if (url === dinghyClassCometHAL._links.self.href) {
            hal = dinghyClassCometHAL;
            version = '"0"';
        }
        else if (url === dinghy826HAL._links.dinghyClass.href) {
            hal = dinghyClassCometHAL;
        }
        else if (url === dinghy2726HAL._links.dinghyClass.href) {
            hal = dinghyClassGraduateHAL;
        }
        return new DinghyClass(hal, {version: version}, this);
    }
    
    async getDinghyClasses(page, size) {
        return this.getDinghyClassesFromURL(this.httpRootURL + '/dinghyClasses', page, size);
    }

    async getDinghyClassesInRace(race) {
        return this.getDinghyClassesFromURL(this.httpRootURL + '/dinghyClasses/search/findByDinghySignedUpToRace?race=' + race.url);
    }

    async getDinghyClassesFromURL(url, page, size, sortParameters) {
        const dinghyClassComet = new DinghyClass(dinghyClassCometHAL, {version: '"0"'}, this);
        const dinghyClassGraduate = new DinghyClass(dinghyClassGraduateHAL, {version: '"0"'}, this);
        const dinghyClassScorpion = new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, this);

        let dinghyClasses = [];
        if (url === this.httpRootURL + '/dinghyClasses') {
            dinghyClasses = [dinghyClassComet, dinghyClassGraduate, dinghyClassScorpion];
        }
        else if (url === fleetScorpionHAL._links.dinghyClasses.href) {
            dinghyClasses.push(dinghyClassScorpion);
        }
        else if (url === fleetCometHAL._links.dinghyClasses.href) {
            dinghyClasses.push(dinghyClassComet);
        }
        
        return new Collection(dinghyClasses, {size: 20, totalElements: dinghyClasses.length, totalPages: 0, number: 0});
    }

    async getDinghiesBySailNumber(sailNumber, page, size) {
        let resource = this.httpRootURL + '/dinghies/search/findBySailNumber?sailNumber=' + sailNumber;
        return this.getDinghiesFromURL(resource, page, size);
    }

    async getDinghiesFromURL(url, page, size, sortParameters) {
        const dinghies = [];
        return new Collection(dinghies, {size: 20, totalElements: dinghies.length, totalPages: 0, number: 0});
    }

    async getDinghiesInDinghyClass(dinghyClass, page, size, sortParameters) {
        let dinghies = [];
        if (dinghyClass.url === dinghyClassCometHAL._links.self.href) {
            dinghies.push(new Dinghy(dinghy826HAL, {version: '"0"'}, this));
        }
        else if (dinghyClass.url === dinghyClassScorpionHAL._links.self.href) {
            dinghies.push(new Dinghy(dinghy1234HAL, {version: '"0"'}, this));
        }
        return new Collection(dinghies, {size: 20, totalElements: dinghies.length, totalPages: 0, number: 0});
    }

    async getEmbeddedRacesInRace(race) {
        let embeddedRaces = [];
        const embeddedRaceVeteransA = new EmbeddedRace(embeddedRaceVeteransAHAL, {version: '"0"'}, this);
        const embeddedRaceLadiesA = new EmbeddedRace(embeddedRaceLadiesAHAL, {version: '"0"'}, this);

        if (race.url === raceHandicapAHAL._links.self.href) {
            embeddedRaces = [embeddedRaceVeteransA, embeddedRaceLadiesA];
        }

        return new Collection(embeddedRaces, {size: 20, totalElements: embeddedRaces.length, totalPages: 0, number: 0});
    }

    async getEntriesByRace(race) {
        return this.getEntriesFromURL(this.httpRootURL + '/entries/search/findBySignedUpToRace?race=' + race.url);
    }

    async getEntriesFromURL(url, page, size, sortParameters) {
        let collection = [];

        if (url === this.httpRootURL + '/entries/search/findBySignedUpToRace?race=' + raceScorpionAHAL._links.self.href) {
            collection = [
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, this),
                new Entry(entrySarahPascal6745ScorpionAHAL, {version: '"0"'}, this)
            ];
        }
        else if (url === this.httpRootURL + '/entries/search/findBySignedUpToRace?race=' + raceGraduateAHAL._links.self.href) {
            collection = [
                new Entry(entryLiuBao2726GraduateAHAL, {version: '"0"'}, this)
            ];
        }
        else if (url === this.httpRootURL + '/entries/search/findBySignedUpToRace?race=' + raceCometAHAL._links.self.href) {
            collection = [
                new Entry(entryJillMyer826CometAHAL, {version: '"0"'}, this)
            ];
        }
        else if (url === this.httpRootURL + '/entries/search/findBySignedUpToRace?race=' + racePursuitAHAL._links.self.href) {
            collection = [
                new Entry(entryChrisMarshall1234PursuitAHAL, {version: '"0"'}, this),
                new Entry(entryJillMyer826PursuitAHAL, {version: '"0"'}, this)
            ];
        }
        else if (url === this.httpRootURL + '/entries/search/findBySignedUpToRace?race=' + raceHandicapAHAL._links.self.href) {
            collection = [
                new Entry(entryChrisMarshall1234HandicapAHAL, {version: '"0"'}, this),
                new Entry(entryJillMyer826HandicapAHAL, {version: '"0"'}, this),
                new Entry(entrySarahPascal6745HandicapAHAL, {version: '"0"'}, this)
            ];
        }
        return new Collection(collection, {size: 20, totalElements: collection.length, totalPages: 0, number: 0});
    }
    
    async getEntry(url) {
        return new Entry({}, {version: ''}, this);
    }

    async getEntryByRaceAndDinghy(race, dinghy) {
        return new Entry({}, {version: ''}, this);
    }

    async getFleet(url) {
        let hal;
        let version = '';
        if (url === fleetCometHAL._links.self.href) {
            hal = fleetCometHAL;
            version = '"0"';
        }
        else if (url === raceCometAHAL._links.fleet.href) {
            hal = fleetCometHAL;
        }
        else if (url === fleetGraduateHAL._links.self.href) {
            hal = fleetGraduateHAL;
            version = '"0"';
        }
        else if (url === raceGraduateAHAL._links.fleet.href) {
            hal = fleetGraduateHAL;
        }
        else if (url === fleetHandicapHAL._links.self.href || url === raceHandicapAHAL._links.fleet.href || url === racePursuitAHAL._links.fleet.href) {
            hal = fleetHandicapHAL;
        }
        else if (url === fleetScorpionHAL._links.self.href) {
            hal = fleetScorpionHAL;
            version = '"0"';
        }
        else if (url === raceScorpionAHAL._links.fleet.href) {
            hal = fleetScorpionHAL;
        }
        return new Fleet(hal, {version: version}, this);
    }

    async getFleets(page, size) {
        const fleetComet = new Fleet(fleetCometHAL, {version: '"0"'}, this);
        const fleetGraduate = new Fleet(fleetGraduateHAL, {version: '"0"'}, this);
        const fleetHandicap = new Fleet(fleetHandicapHAL, {version: '"0"'}, this);
        const fleetScorpion = new Fleet(fleetScorpionHAL, {version: '"0"'}, this);
        let collection = [fleetComet, fleetHandicap, fleetGraduate, fleetScorpion];
        let totalElements = 4;

        return new Collection(collection, {size: 20, totalElements: totalElements, totalPages: 0, number: 0});
    }

    async getLaps(url) {
        const lap1HAL = {number: 1, time: 'PT15M27S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/1' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/1' } }};
        const lap2HAL = {number: 1, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/2' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/2' } }};
        const lap3HAL = {number: 1, time: 'PT17M26S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/3' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/3' } }};
        const lap4HAL = {number: 2, time: 'PT15M59S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/4' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/4' } }};
        const lap5HAL = {number: 2, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/5' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/5' } }};
        let lapsCollection = [];

        if (url === 'http://localhost:8081/dinghyracing/api/entries/20/laps') {
            lapsCollection = [new Lap(lap1HAL, {version: '"0"'}, this), new Lap(lap4HAL, {version: '"0"'}, this)];
        }
        else if (url === 'http://localhost:8081/dinghyracing/api/entries/10/laps') {
            lapsCollection = [new Lap(lap2HAL, {version: '"0"'}, this), new Lap(lap5HAL, {version: '"0"'}, this)];
        }
        else if (url === 'http://localhost:8081/dinghyracing/api/entries/11/laps') {
            lapsCollection = [new Lap(lap3HAL, {version: '"0"'}, this)];
        }

        return new Collection(lapsCollection, {size: 20, totalElements: lapsCollection.length, totalPages: 0, number: 0});
    }

    async getRace(url) {
        let raceHAL = {};
        let version = {version: ''};
        if (url === signedUpChrisMarshallDinghy1234ScorpionAHAL._links.race.href || url === signedUpSarahPascalDinghy6745ScorpionAHAL._links.race.href) {
            raceHAL = raceScorpionAHAL;
            version = {version: '"0"'};
        }
        else if (url === signedUpLiuBaoDinghy2726GraduateAHAL._links.race.href) {
            raceHAL = raceGraduateAHAL;
            version = {version: '"0"'};
        }
        else if (url === signedUpChrisMarshallDinghy1234PursuitAHAL._links.race.href || url === signedUpJillMyerDinghy826PursuitAHAL._links.race.href) {
            raceHAL = racePursuitAHAL;
            version = {version: '"0"'};
        }
        else if (url === signedUpJillMyerDinghy826CometAHAL._links.race.href) {
            raceHAL = raceCometAHAL;
            version = {version: '"0"'};
        }
        else if (url === signedUpChrisMarshallDinghy1234HandicapAHAL._links.race.href || url === signedUpJillMyerDinghy826HandicapAHAL._links.race.href || url === signedUpSarahPascalDinghy6745HandicapAHAL._links.race.href) {
            raceHAL = raceHandicapAHAL;
            version = {version: '"0"'};
        }
        else if (url === signedUpChrisMarshallDinghy1234VeteransAHAL._links.race.href) {
            raceHAL = embeddedRaceVeteransAHAL;
            version = {version: '"0"'};
            return new EmbeddedRace(raceHAL, version, this);
        }
        return new Race(raceHAL, version, this);
    }

    async getRacesBetweenTimes(startTime, endTime, page, size, sortParameters) {
        return this.getRacesFromURL();
    }
    
    async getRacesBetweenTimesForType(startTime, endTime, type, page, size, sortParameters) {
        let collection = [];
        const raceCometA = new Race(raceCometAHAL, {version: '"0"'}, this);
        const raceGraduateA = new Race(raceGraduateAHAL, {version: '"0"'}, this);
        const raceHandicapA = new Race(raceHandicapAHAL, {version: '"0"'}, this);
        const raceScorpionA = new Race(raceScorpionAHAL, {version: '"0"'}, this);
        const racePursuitA = new Race(racePursuitAHAL, {version: '"0"'}, this);

        if (type === RaceType.FLEET) {
            collection = [
                raceScorpionA, raceGraduateA, raceCometA, raceHandicapA
            ];
        }
        else {
            collection = [
                racePursuitA
            ];
        }
        return new Collection(collection, {size: 20, totalElements: collection.length, totalPages: 0, number: 0});
    }

    async getRacesFromURL(url, page, size, sortParameters) {
        let collection = [];
        let totalElements = 0;
        const raceCometA = new Race(raceCometAHAL, {version: '"0"'}, this);
        const raceGraduateA = new Race(raceGraduateAHAL, {version: '"0"'}, this);
        const raceHandicapA = new Race(raceHandicapAHAL, {version: '"0"'}, this);
        const raceScorpionA = new Race(raceScorpionAHAL, {version: '"0"'}, this);

        collection = [
            raceCometA, raceGraduateA, raceHandicapA, raceScorpionA
        ];
        totalElements = 4;

        return new Collection(collection, {size: 20, totalElements: totalElements, totalPages: 0, number: 0});
    }
    
    async getSignedUp(url) {
        version = {version: '"0"'};
        return new SignedUp({}, version, this);
    }

    async getSignedUpTo(url) {
        const signedUpChrisMarshallDinghy1234HandicapA = new SignedUp(signedUpChrisMarshallDinghy1234HandicapAHAL, {version: '"0"'}, this);
        const signedUpChrisMarshallDinghy1234ScorpionA = new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, this);
        const signedUpChrisMarshallDinghy1234PursuitA = new SignedUp(signedUpChrisMarshallDinghy1234PursuitAHAL, {version: '"0"'}, this);
        const signedUpJillMyerDinghy826CometA = new SignedUp(signedUpJillMyerDinghy826CometAHAL, {version: '"0"'}, this);
        const signedUpJillMyerDinghy826HandicapA = new SignedUp(signedUpJillMyerDinghy826HandicapAHAL, {version: '"0"'}, this);
        const signedUpJillMyerDinghy826PursuitA = new SignedUp(signedUpJillMyerDinghy826PursuitAHAL, {version: '"0"'}, this);
        const signedUpSarahPascalDinghy6745HandicapA = new SignedUp(signedUpSarahPascalDinghy6745HandicapAHAL, {version: '"0"'}, this);
        const signedUpSarahPascalDinghy6745ScorpionA = new SignedUp(signedUpSarahPascalDinghy6745ScorpionAHAL, {version: '"0"'}, this);
        const signedUpLiuBaoDinghy2726GraduateA = new SignedUp(signedUpLiuBaoDinghy2726GraduateAHAL, {version: '"0"'}, this);
        let signedUpCollection = [];

        if (url === entryChrisMarshall1234HandicapAHAL._links.signedUpTo.href) {
            signedUpCollection = [signedUpChrisMarshallDinghy1234HandicapA];
        }
        else if (url === entryChrisMarshall1234ScorpionAHAL._links.signedUpTo.href) {
            signedUpCollection = [signedUpChrisMarshallDinghy1234ScorpionA];
        }
        else if (url === entryChrisMarshall1234PursuitAHAL._links.signedUpTo.href) {
            signedUpCollection = [signedUpChrisMarshallDinghy1234PursuitA];
        }
        else if (url === entrySarahPascal6745HandicapAHAL._links.signedUpTo.href) {
            signedUpCollection = [signedUpSarahPascalDinghy6745HandicapA];
        }
        else if (url === entrySarahPascal6745ScorpionAHAL._links.signedUpTo.href) {
            signedUpCollection = [signedUpSarahPascalDinghy6745ScorpionA];
        }
        else if (url === entryLiuBao2726GraduateAHAL._links.signedUpTo.href) {
            signedUpCollection = [signedUpLiuBaoDinghy2726GraduateA];
        }
        else if (url === entryJillMyer826CometAHAL._links.signedUpTo.href) {
            signedUpCollection = [signedUpJillMyerDinghy826CometA];
        }
        else if (url === entryJillMyer826HandicapAHAL._links.signedUpTo.href) {
            signedUpCollection = [signedUpJillMyerDinghy826HandicapA];
        }
        else if (url === entryJillMyer826PursuitAHAL._links.signedUpTo.href) {
            signedUpCollection = [signedUpJillMyerDinghy826PursuitA];
        }

        return new Collection(signedUpCollection, {size: 20,totalElements: signedUpCollection.length, totalPages: 0,number: 0});
    }

    async getSignedUpToRaceForEntry(race, entry) {
        version = {version: '"0"'};
        return new SignedUp({}, version, this);
    }

    getStartSequence(races) {
        if (races.length > 1 && !races.every(race => race.type === races[0].type)) {
            throw new InvalidParameter('All races in a start sequence must be of the same type.');
        }
        return new SessionStartSequence(races, this.#clock);
    }

    handleCompetitorCreation() {
        this.#competitorCreationCallbacks.forEach(cb => cb());
    }

    handleCompetitorUpdate(message) {
        if (this.#competitorUpdateCallbacks.has(message.body)) {
            this.#competitorUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    handleDinghyCreation() {
        this.#dinghyCreationCallbacks.forEach(cb => cb());
    }

    handleDinghyClassCreation() {
        this.#dinghyClassCreationCallbacks.forEach(cb => cb());
    }

    handleDinghyClassUpdate(message) {
        if (this.#dinghyClassUpdateCallbacks.has(message.body)) {
            this.#dinghyClassUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    handleEntryCreation() {
        this.#entryCreationCallbacks.forEach(cb => cb());
    }

    handleEntryDeletion(message) {
        if (this.#entryDeletionCallbacks.has(message.body)) {
            this.#entryDeletionCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    handleEntryUpdate(message) {
        if (this.#entryUpdateCallbacks.has(message.body)) {
            this.#entryUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    handleRaceUpdate(message) {
        if (this.#raceUpdateCallbacks.has(message.body)) {
            this.#raceUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    handleRaceEntryLapsUpdate(message) {
        if (this.#raceEntryLapsUpdateCallbacks.has(message.body)) {
            this.#raceEntryLapsUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    handleFleetCreation() {
        this.#fleetCreationCallbacks.forEach(cb => cb());
    }

    handleFleetUpdate(message) {
        if (this.#fleetUpdateCallbacks.has(message.body)) {
            this.#fleetUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    async removeLap(entry, lap) {
        return new Entry({}, {version: ''}, this);
    }

    registerCompetitorCreationCallback(callback) {
        this.#competitorCreationCallbacks.add(callback);
    }

    registerCompetitorUpdateCallback(key, callback) {
        if (this.#competitorUpdateCallbacks.has(key)) {
            this.#competitorUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#competitorUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    registerDinghyCreationCallback(callback) {
        this.#dinghyCreationCallbacks.add(callback);
    }

    registerDinghyClassCreationCallback(callback) {
        this.#dinghyClassCreationCallbacks.add(callback);
    }

    registerDinghyClassUpdateCallback(key, callback) {
        if (this.#dinghyClassUpdateCallbacks.has(key)) {
            this.#dinghyClassUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#dinghyClassUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    registerEntryCreationCallback(callback) {
        this.#entryCreationCallbacks.add(callback);
    }

    registerEntryDeletionCallback(key, callback) {
        if (this.#entryDeletionCallbacks.has(key)) {
            this.#entryDeletionCallbacks.get(key).add(callback);
        }
        else {
            this.#entryDeletionCallbacks.set(key, new Set([callback]));
        }
    }

    registerEntryUpdateCallback(key, callback) {
        if (this.#entryUpdateCallbacks.has(key)) {
            this.#entryUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#entryUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    registerFleetCreationCallback(callback) {
        this.#fleetCreationCallbacks.add(callback);
    }

    registerFleetUpdateCallback(key, callback) {
        if (this.#fleetUpdateCallbacks.has(key)) {
            this.#fleetUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#fleetUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    registerRaceUpdateCallback(key, callback) {
        if (this.#raceUpdateCallbacks.has(key)) {
            this.#raceUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#raceUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    registerRaceEntryLapsUpdateCallback(key, callback) {
        if (this.#raceEntryLapsUpdateCallbacks.has(key)) {
            this.#raceEntryLapsUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#raceEntryLapsUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    async setScoringAbbreviation(entry, scoringAbbreviation) {
        return entry;
    }
    
    async signUpToRace(race, helm, dinghy, crew) {
        return new Race({}, {version: ''}, this);
    }

    async signUpToEmbeddedRace(embddedRace, entry) {
        return new EmbeddedRace({}, {version: ''}, this);
    }

    unregisterCompetitorCreationCallback(callback) {
        this.#competitorCreationCallbacks.delete(callback);
    }

    unregisterCompetitorUpdateCallback(key, callback) {
        if (this.#competitorUpdateCallbacks.has(key)) {
            this.#competitorUpdateCallbacks.get(key).delete(callback);
        }
    }

    unregisterDinghyCreationCallback(callback) {
        this.#dinghyCreationCallbacks.delete(callback);
    }

    unregisterDinghyClassCreationCallback(callback) {
        this.#dinghyClassCreationCallbacks.delete(callback);
    }

    unregisterDinghyClassUpdateCallback(key, callback) {
        if (this.#dinghyClassUpdateCallbacks.has(key)) {
            this.#dinghyClassUpdateCallbacks.get(key).delete(callback);
        }
    }

    unregisterEntryCreationCallback(callback) {
        this.#entryCreationCallbacks.delete(callback);
    }
    
    unregisterEntryDeletionCallback(key, callback) {
        if (this.#entryDeletionCallbacks.has(key)) {
            this.#entryDeletionCallbacks.get(key).delete(callback);
        }
    }

    unregisterEntryUpdateCallback(key, callback) {
        if (this.#entryUpdateCallbacks.has(key)) {
            this.#entryUpdateCallbacks.get(key).delete(callback);
        }
    }

    unregisterFleetCreationCallback(callback) {
        this.#fleetCreationCallbacks.delete(callback);
    }
    
    unregisterFleetUpdateCallback(key, callback) {
        if (this.#fleetUpdateCallbacks.has(key)) {
            this.#fleetUpdateCallbacks.get(key).delete(callback);
        }
    }
    
    unregisterRaceUpdateCallback(key, callback) {
        if (this.#raceUpdateCallbacks.has(key)) {
            this.#raceUpdateCallbacks.get(key).delete(callback);
        }
    }

    unregisterRaceEntryLapsUpdateCallback(key, callback) {
        if (this.#raceEntryLapsUpdateCallbacks.has(key)) {
            this.#raceEntryLapsUpdateCallbacks.get(key).delete(callback);
        }
    }
    
    async updateCompetitor(competitor, name) {
        return new Competitor({}, {version: ''}, this);
    }
    
    async updateDinghyClass(dinghyClass, name, crewSize, portsmouthNumber, externalName = null) {
        return new DinghyClass({}, {version: ''}, this);
    }
    
    async updateEntry(entry, helm, dinghy, crew = null) {
        return new Entry({}, {version: ''}, this);
    }

    async updateEntryPosition(race, entry, newPosition) {
        return race;
    }

    async updateFleet(fleet, name, dinghyClasses) {
        return new Fleet({}, {version: ''}, this);
    }
    
    async updateLap(entry, time) {
        return new Entry({}, {version: ''}, this);
    }

    async updateRace(race, name, plannedStartTime, fleet, duration, plannedLaps, type, startType) {
        return new Race({}, {version: ''}, this);
    }
    
    async withdrawEntry(entry) {
        return true; // failure to delete results in an error
    }

    async withdrawEmbeddedSignUp(signedUp) {
        return true; // failure to delete results in an error
    }
}

class SortOrder {
    static ASCENDING = 'ASC';
    static DESCENDING = 'DESC';
}

export default SylphModel;
export { SortOrder };