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

import { Client } from '@stomp/stompjs';
import Fleet from './fleet';
import Metadata from './metadata';
import DirectRace from './direct-race';
import Clock from './clock';
import Collection from './collection';
import Competitor from './competitor';
import Crew from './crew';
import Dinghy from './dinghy';
import DinghyClass from './dinghy-class';
import EmbeddedRace from './embedded-race';
import Entry from './entry';
import SignedUp from './signed-up';
import RaceType from './race-type';
import Lap from './lap';
import SessionStartSequence from './session-start-sequence';
import InvalidParameter from '../errors/invalid-parameter';
import StartType from './start-type';

class SylphModel {
    #clock = new Clock();
    #competitorCreationCallbacks = new Set(); // each key identifies an array of callbacks for the entry identified by the URI used as the key
    #competitorUpdateCallbacks = new Map(); // each key identifies an array of callbacks for the entry identified by the URI used as the key
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
        this.addLap = this.addLap.bind(this);
        this.createCompetitor = this.createCompetitor.bind(this);
        this.createDinghy = this.createDinghy.bind(this);
        this.createDinghyClass = this.createDinghyClass.bind(this);
        this.createFleet = this.createFleet.bind(this);
        this.createRace = this.createRace.bind(this);
        this.getCollection = this.getCollection.bind(this);
        this.getCompetitor = this.getCompetitor.bind(this);
        this.getCompetitorByName = this.getCompetitorByName.bind(this);
        this.getCompetitors = this.getCompetitors.bind(this);
        this.getCrewsByDinghy = this.getCrewsByDinghy.bind(this);
        this.getDinghies = this.getDinghies.bind(this);
        this.getDinghiesBySailNumber = this.getDinghiesBySailNumber.bind(this);
        this.getDinghiesFromURL = this.getDinghiesFromURL.bind(this);
        this.getDinghiesInDinghyClass = this.getDinghiesInDinghyClass.bind(this);
        this.getDinghy = this.getDinghy.bind(this);
        this.getDinghyBySailNumberAndDinghyClass = this.getDinghyBySailNumberAndDinghyClass.bind(this);
        this.getDinghyClass = this.getDinghyClass.bind(this);
        this.getDinghyClassByName = this.getDinghyClassByName.bind(this);
        this.getDinghyClasses = this.getDinghyClasses.bind(this);
        this.getDinghyClassesFromURL = this.getDinghyClassesFromURL.bind(this);
        this.getDinghyClassesInRace = this.getDinghyClassesInRace.bind(this);
        this.getEntriesByRace = this.getEntriesByRace.bind(this);
        this.getEntriesFromURL = this.getEntriesFromURL.bind(this);
        this.getEntry = this.getEntry.bind(this);
        this.getEntryByRaceAndDinghy = this.getEntryByRaceAndDinghy.bind(this);
        this.getFleet = this.getFleet.bind(this);
        this.getFleets = this.getFleets.bind(this);
        this.getLap = this.getLap.bind(this);
        this.getLaps = this.getLaps.bind(this);
        this.getRace = this.getRace.bind(this);
        this.getDirectRacesBetweenTimes = this.getDirectRacesBetweenTimes.bind(this);
        this.getDirectRacesBetweenTimesForType = this.getDirectRacesBetweenTimesForType.bind(this);
        this.getRacesFromURL = this.getRacesFromURL.bind(this);
        this.getDirectRacesOnOrAfterTime = this.getDirectRacesOnOrAfterTime.bind(this);
        this.getSignedUp = this.getSignedUp.bind(this);
        this.getSignedUpTo = this.getSignedUpTo.bind(this);
        this.removeLap = this.removeLap.bind(this);
        this.setScoringAbbreviation = this.setScoringAbbreviation.bind(this);
        this.signUpToRace = this.signUpToRace.bind(this);
        this.updateCompetitor = this.updateCompetitor.bind(this);
        this.updateDinghyClass = this.updateDinghyClass.bind(this);
        this.updateEntry = this.updateEntry.bind(this);
        this.updateEntryPosition = this.updateEntryPosition.bind(this);
        this.updateFleet = this.updateFleet.bind(this);
        this.updateLap = this.updateLap.bind(this);
        this.updateRace = this.updateRace.bind(this);
        this.withdrawEntry = this.withdrawEntry.bind(this);
        this.withdrawEmbeddedSignUp = this.withdrawEmbeddedSignUp.bind(this);
        this.convertISO8601DurationToMilliseconds = this.convertISO8601DurationToMilliseconds.bind(this);
        this.getClock = this.getClock.bind(this);
        this.getStartSequence = this.getStartSequence.bind(this);
        this.handleCompetitorCreation = this.handleCompetitorCreation.bind(this);
        this.handleCompetitorUpdate = this.handleCompetitorUpdate.bind(this);
        this.handleDinghyClassCreation = this.handleDinghyClassCreation.bind(this);
        this.handleDinghyClassUpdate = this.handleDinghyClassUpdate.bind(this);
        this.handleDinghyCreation = this.handleDinghyCreation.bind(this);
        this.handleEntryCreation = this.handleEntryCreation.bind(this);
        this.handleEntryDeletion = this.handleEntryDeletion.bind(this);
        this.handleEntryUpdate = this.handleEntryUpdate.bind(this);
        this.handleFleetCreation = this.handleFleetCreation.bind(this);
        this.handleFleetUpdate = this.handleFleetUpdate.bind(this);
        this.handleRaceEntryLapsUpdate = this.handleRaceEntryLapsUpdate.bind(this);
        this.handleRaceUpdate = this.handleRaceUpdate.bind(this);
        this.registerCompetitorCreationCallback = this.registerCompetitorCreationCallback.bind(this);
        this.registerCompetitorUpdateCallback = this.registerCompetitorUpdateCallback.bind(this);
        this.registerDinghyClassCreationCallback = this.registerDinghyClassCreationCallback.bind(this);
        this.registerDinghyClassUpdateCallback = this.registerDinghyClassUpdateCallback.bind(this);
        this.registerDinghyCreationCallback = this.registerDinghyCreationCallback.bind(this);
        this.registerEntryCreationCallback = this.registerEntryCreationCallback.bind(this);
        this.registerEntryDeletionCallback = this.registerEntryDeletionCallback.bind(this);
        this.registerEntryUpdateCallback = this.registerEntryUpdateCallback.bind(this);
        this.registerFleetCreationCallback = this.registerFleetCreationCallback.bind(this);
        this.registerFleetUpdateCallback = this.registerFleetUpdateCallback.bind(this);
        this.registerRaceEntryLapsUpdateCallback = this.registerRaceEntryLapsUpdateCallback.bind(this);
        this.registerRaceUpdateCallback = this.registerRaceUpdateCallback.bind(this);
        this.unregisterCompetitorCreationCallback = this.unregisterCompetitorCreationCallback.bind(this);
        this.unregisterCompetitorUpdateCallback = this.unregisterCompetitorUpdateCallback.bind(this);
        this.unregisterDinghyClassCreationCallback = this.unregisterDinghyClassCreationCallback.bind(this);
        this.unregisterDinghyClassUpdateCallback = this.unregisterDinghyClassUpdateCallback.bind(this);
        this.unregisterDinghyCreationCallback = this.unregisterDinghyCreationCallback.bind(this);
        this.unregisterEntryCreationCallback = this.unregisterEntryCreationCallback.bind(this);
        this.unregisterEntryDeletionCallback = this.unregisterEntryDeletionCallback.bind(this);
        this.unregisterEntryUpdateCallback = this.unregisterEntryUpdateCallback.bind(this);
        this.unregisterFleetCreationCallback = this.unregisterFleetCreationCallback.bind(this);
        this.unregisterFleetUpdateCallback = this.unregisterFleetUpdateCallback.bind(this);
        this.unregisterRaceEntryLapsUpdateCallback = this.unregisterRaceEntryLapsUpdateCallback.bind(this);
        this.unregisterRaceUpdateCallback = this.unregisterRaceUpdateCallback.bind(this);
        this.httpRootURL = httpRootURL;
        this.wsRootURL = wsRootURL;
        this.stompClient = new Client({
            'brokerURL': wsRootURL
        });
        this.stompClient.onStompError = (frame) => {
            console.error(frame);
        };
        this.stompClient.onConnect = () => {
            this.stompClient.subscribe('/topic/createCompetitor', this.handleCompetitorCreation);
            this.stompClient.subscribe('/topic/updateCompetitor', this.handleCompetitorUpdate);
            this.stompClient.subscribe('/topic/createDinghy', this.handleDinghyCreation);
            this.stompClient.subscribe('/topic/createDinghyClass', this.handleDinghyClassCreation);
            this.stompClient.subscribe('/topic/createFleet', this.handleFleetCreation);
            this.stompClient.subscribe('/topic/updateDinghyClass', this.handleDinghyClassUpdate);
            this.stompClient.subscribe('/topic/createEntry', this.handleEntryCreation);
            this.stompClient.subscribe('/topic/deleteEntry', this.handleEntryDeletion);
            this.stompClient.subscribe('/topic/updateEntry', this.handleEntryUpdate);
            this.stompClient.subscribe('/topic/updateFleet', this.handleFleetUpdate);
            this.stompClient.subscribe('/topic/updateRace', this.handleRaceUpdate);
            this.stompClient.subscribe('/topic/updateRaceEntryLaps', this.handleRaceEntryLapsUpdate);
        };
        this.stompClient.activate();
    }

    /**
     * Add a lap to race entry
     * @param {Entry} entry
     * @param {Number} time The lap time duration in milliseconds
     * @returns {Promise<Entry>}
     * @throws {Error}
     */
    async addLap(entry, time) {
        const result = await this._update(entry.url + '/addLap', {'time': time / 1000});
        return new Entry(result.hal, result.metadata, this);
    }

    /**
     * Convert a duration into milliseconds
     * Format of duration is based on ISO 8601 duration format; with further restrictions on expected values.
     * Overall period is expected to be positive.
     * Duration provided by REST service is expected to be in positive time units (hours, minutes, seconds); no year, month, or day units.
     * If format or range is not as expected throws a TypeException error.
     * @param {String} duration
     * @returns {Number}
     */
    convertISO8601DurationToMilliseconds(duration) {
        const match = /(^|\+)[Pp][Tt](\+?(\d+)[Hh])?(\+?(\d+)[Mm])?(\+?(\d+([.,]\d+)?)[Ss])?$/.exec(duration);
        // check id duration is a valid ISO 8601 duration format
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

    /**
     * Create a new competitor
     * @param {String} name 
     * @return {Promise<Competitor>}
     * @throws {Error}
     */
    async createCompetitor(name) {
        const result = await this._create(this.httpRootURL + '/competitors', {name: name});
        return new Competitor(result.hal, result.metadata, this);
    }

    /**
     * Create a new dinghy
     * @param {String} sailNumber 
     * @returns {Promise<Dinghy>}
     * @throws {Error}
     */
    async createDinghy(sailNumber, dinghyClass) {
        const result = await this._create(this.httpRootURL + '/dinghies', {sailNumber: sailNumber, dinghyClass: dinghyClass.url});
        return new Dinghy(result.hal, result.metadata, this);
    }

    /**
     * Create a new dinghy class
     * @param {String} name of dinghy class
     * @param {Integer} crewSize
     * @param {Integer} portsmouthNumber
     * @param {String} [externalName]
     * @returns {Promise<DinghyClass>}
     * @throws {Error}
     */
    async createDinghyClass(name, crewSize, portsmouthNumber, externalName = null) {
        let dc = {name: name, crewSize: crewSize, portsmouthNumber: portsmouthNumber};
        if (externalName) {
            dc = {...dc, externalName: externalName}
        }
        const result = await this._create(this.httpRootURL + '/dinghyClasses', dc);
        return new DinghyClass(result.hal, result.metadata, this);
    }

    /**
     * Create a new fleet
     * @param {String} name
     * @param {Array<DinghyClass} dinghyClasses
     * @returns {Promise<Fleet>}
     * @throws {Error}
     */
    async createFleet(name, dinghyClasses) {
        const result = await this._create(this.httpRootURL + '/fleets', {name: name, dinghyClasses: dinghyClasses.map((dinghyClass) => {return dinghyClass.url})});
        return new Fleet(result.hal, result.metadata, this);
    }

    /**
     * Create a new race
     * @param {String} name
     * @param {Date} plannedStartTime
     * @param {Fleet} fleet
     * @param {Integer} duration in milliseconds
     * @param {Integer} plannedLaps
     * @param {RaceType} type
     * @param {StartType} startType
     * @returns {Promise<DirectRace>}
     * @throws {Error}
     */
    async createRace(name, plannedStartTime, fleet, duration, plannedLaps, type, startType) {
        const race = {
            name: name, plannedStartTime:plannedStartTime, fleet: fleet.url, duration: duration / 1000, plannedLaps: plannedLaps,
            type: type, startType: startType
        };
        const result = await this._create(this.httpRootURL + '/directRaces', race);
        return new DirectRace(result.hal, result.metadata, this);
    }

    /**
     * Get the clock
     * @returns {Clock}
     */
    getClock() {
        return this.#clock;
    }

    /**
     * Get a collection of entitites
     * @param {String} url 
     * @param {Integer} page 
     * @param {Integer} size 
     * @param {Integer} sortParameters 
      * @returns {Promise<FetchResult>}
     */
    async getCollection(url, page, size, sortParameters) {
        const hasPage = Number.isInteger(page);
        const hasSize = Number.isInteger(size);
        const hasSort = !(sortParameters == null);
        const hasParams = /\?/.test(url);
        if ((hasPage || hasSize || hasSort) && !hasParams) {
            url += '?';
        }
        if (hasPage) {
            if (hasParams) {
                url += '&page=' + page;
            }
            else {
                url += 'page=' + page;
            }
        }
        if (hasSize) {
            if (hasParams || hasPage) {
                url += '&size=' + size;
            }
            else {
                url += 'size=' + size;
            }
        }
        if (hasSort) {
            if (hasParams || hasPage || hasSize) {
                url += '&sort=' + sortParameters.by + ',' + (sortParameters.order || 'ASC');
            }
            else {
                url += 'sort=' + sortParameters.by + ',' + (sortParameters.order || 'ASC');
            }
        }
    
        const result = await this._read(url);
        if (!hasPage && !hasSize && result.hal.page?.totalElements > result.hal.page?.size) {
            return this.getCollection(url, 0, result.hal.page.totalElements);
        }
		return result;
    }

    /**
     * Get competitor
     * @param {String} url Address of the remote resource
     * @returns {Promise<Competitor>}
     * @throws {Error}
     */
    async getCompetitor(url) {
        const result = await this._read(url);
        return new Competitor(result.hal, result.metadata, this);
    }

    /**
     * Get a competitor by name
     * @param {String} name Name of the competitor
     * @returns {Promise<Competitor>}
     * @throws {Error}
     */
    async getCompetitorByName(name) {
        const resource = this.httpRootURL + '/competitors/search/findByName?name=' + name;
        return this.getCompetitor(resource);
    }

    /**
     * Get a collection of competitors, sorted by name in ascending order
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Collection<Competitor>>} If successful Result.domainObject will be an Array<Competitor>
     */
    async getCompetitors(page, size) {
        let resource = this.httpRootURL + '/competitors';
        const result = await this.getCollection(resource, page, size, {by: 'name', order: SortOrder.ASCENDING});
    
        const promises = [];
        for (let i = 0; i < result.hal._embedded.competitors.length; i++  ) {
            promises.push(this.getCompetitor(result.hal._embedded.competitors[i]._links.self.href));
        };
        const competitors = await Promise.all(promises);
        return new Collection(competitors, result.hal.page);
    }

    /**
     * Get all the crews that have sailed a dinghy.
     * Result.domainObject is an array of crews. If no crews have been recorded for dinghy the array will be empty.
     * @param {Dinghy} dinghy
     * @returns {Collection<Crew>}
     */
    async getCrewsByDinghy(dinghy) {
        const resource = this.httpRootURL + '/crews/search/findCrewsByDinghy?dinghy=' + dinghy.url;
        const result = await this.getCollection(resource);
        const crews = result.hal._embedded.crews.map(crew => {return new Crew(crew, null, this)});
        return new Collection(crews, {size: crews.length, totalElements: crews.length, totalPages: 1, number: 0});
    }

    /**
     * Get dinghy
     * @param {String} url Address of the remote resource
     * @returns {Promise<Dinghy>}
     */
    async getDinghy(url) {
        const result = await this._read(url);
        return new Dinghy(result.hal, result.metadata, this);
    }

    /**
     * Get dinghy by sail number and dinghy class
     * @param {String} sailNumber
     * @param {DinghyClass} dinghyClass
     * @returns {Promise<Dinghy>}
     */
    async getDinghyBySailNumberAndDinghyClass(sailNumber, dinghyClass) {
        const resource = this.httpRootURL + '/dinghies/search/findBySailNumberAndDinghyClass?sailNumber=' + sailNumber + '&dinghyClass=' + dinghyClass.url;
        return this.getDinghy(resource);
    }

    /**
     * Get a collection containing all dinghies, sorted by sail number in ascending order
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Collection<Dinghy>>}
     */
    async getDinghies(page, size) {
        let resource = this.httpRootURL + '/dinghies';
        return this.getDinghiesFromURL(resource, page, size, {by: 'sailNumber', order: SortOrder.ASCENDING});
    }

    /**
     * Gets all dinghies with the given sail number
     * If successful Result.domainObject will be an Array<Dinghy>
     * @param {String} sailNumber to search for
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Collection<Dinghy>>} 
     * @throws {Error}
     */
    async getDinghiesBySailNumber(sailNumber, page, size) {
        let resource = this.httpRootURL + '/dinghies/search/findBySailNumber?sailNumber=' + sailNumber;
        return this.getDinghiesFromURL(resource, page, size);
    }

    /**
     * Get dinghies that are in (of) the dinghy class
     * @param {dinghyClass} [dinghyClass] The dinghy class to filter by
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] order for sorting the requested races
     * @returns {Promise<Collection<Dinghy>>} 
     * @throws {Error}
     */
    async getDinghiesInDinghyClass(dinghyClass, page, size, sortParameters) {
        const resource = this.httpRootURL + '/dinghies/search/findByDinghyClass?dinghyClass=' + dinghyClass.url;
        return this.getDinghiesFromURL(resource, page, size, sortParameters);
    }

    /**
     * Get dinghies via the provided URL
     * @param {String} url
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] order for sorting the requested races
     * @returns {Promise<Collection<Dinghy>>} 
     * @throws {Error}
     */
    async getDinghiesFromURL(url, page, size, sortParameters) {
        const result = await this.getCollection(url, page, size, sortParameters);
        const promises = [];
        for (let i = 0; i < result.hal._embedded.dinghies.length; i++  ) {
            promises.push(this.getDinghy(result.hal._embedded.dinghies[i]._links.self.href));
        };
        const dinghies = await Promise.all(promises);
        return new Collection(dinghies, result.hal?.page);
    }

    /**
     * Get dinghy class
     * @param {String} url Address of the remote resource
     * @returns {Promise<DinghyClass>}
     * @throws {Error}
     */
    async getDinghyClass(url) {
        const result = await this._read(url);
        return new DinghyClass(result.hal, result.metadata, this);
    }

    /**
     * Get a dinghy class by the name of the class
     * @param {String} name
     * @returns {Promise<DinghyClass>}
     * @throws {Error}
     */
    async getDinghyClassByName(name) {
        return this.getDinghyClass(this.httpRootURL + '/dinghyClasses/search/findByName?name=' + name);
    }

    /**
     * Get a collection containing all dinghy classes
     * If page and/ or size are not provided will return all dinghy classes
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Collection<DinghyClass>>}
     * @throws {Error}
     */
    async getDinghyClasses(page, size) {
        return this.getDinghyClassesFromURL(this.httpRootURL + '/dinghyClasses', page, size);
    }

    /**
     * Get dinghy classes for dinghies that have signed up to race
     * @param {DirectRace} race
     * @returns {Promise<Collection<DirectRace>>}
     * @throws {Error}
     */
    async getDinghyClassesInRace(race) {
        return this.getDinghyClassesFromURL(this.httpRootURL + '/dinghyClasses/search/findByDinghySignedUpToRace?race=' + race.url);
    }

    /**
     * Get dinghy classes associated with an entity defined by HAL via the URL provided
     * @param {String} url
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] order for sorting the requested races
     * @return {Promise<Collection<DinghyClass>>} If successful Result.domainObject will be an Array<DinghyClass>
     * @throws {Error}
     */
    async getDinghyClassesFromURL(url, page, size, sortParameters) {
        const result = await this.getCollection(url, page, size, sortParameters);
        const promises = [];
        for (let i = 0; i < result.hal._embedded.dinghyClasses.length; i++  ) {
            promises.push(this.getDinghyClass(result.hal._embedded.dinghyClasses[i]._links.self.href));
        };
        const dinghyClasses = await Promise.all(promises);
        return new Collection(dinghyClasses, result.hal.page);
    }

    /**
     * Get races scheduled to start between the specified times
     * @param {Date} startTime The start time of the first race
     * @param {Date} endTime The start time of the last race
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] and order for sorting the requested races
     * @returns {Promise<Collection<DirectRace>>}
     * @throws {Error}
     */
    async getDirectRacesBetweenTimes(startTime, endTime, page, size, sortParameters) {
        const resource = this.httpRootURL + '/directRaces/search/findByPlannedStartTimeBetween?startTime=' + startTime.toISOString() + '&endTime=' + endTime.toISOString();
        return this.getRacesFromURL(resource, page, size, sortParameters);
    }

    /**
     * Get races of a specific type that are scheduled to start between the specified times
     * @param {Date} startTime The start time of the first race
     * @param {Date} endTime The start time of the last race
     * @param {RaceType} type The type of race
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] and order for sorting the requested races
     * @returns {Promise<Collection<DirectRace>>} If successful result domainObject will be Array<DirectRace>
     * @throws {Error}
     */
    async getDirectRacesBetweenTimesForType(startTime, endTime, type, page, size, sortParameters) {
        const resource = this.httpRootURL + '/directRaces/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=' + startTime.toISOString() + '&endTime=' + endTime.toISOString() + '&type=' + type;
        return this.getRacesFromURL(resource, page, size, sortParameters);
    }

    /**
     * Get races from the specified resource location
     * @param {String} url to use to retrieve a collection of races
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] order for sorting the requested races
     * @returns {Promise<Collection<EmbeddedRace>>}
     * @throws {Error}
     */
    // async getEmbeddedRacesFromURL(url, page, size, sortParameters) {
    //     const result = await this.getCollection(url, page, size, sortParameters);
    
    //     const promises = [];
    //     for (let i = 0; i < result.hal._embedded.embeddedRaces.length; i++  ) {
    //         promises.push(this.getRace(result.hal._embedded.embeddedRaces[i]._links.self.href));
    //     };
    //     const races = await Promise.all(promises);
    //     return new Collection(races, result.hal.page);
    // }

    /**
     * Get embedded races hosted in DirectRace
     * @param {DirectRace} race
     * @returns {Promise<Collection<EmbeddedRace>>}
     */
    async getEmbeddedRacesInRace(race) {
        // return this.getEmbeddedRacesFromURL(this.httpRootURL + '/embeddedRaces/search/findByHosts?host=' + race.url);
        return this.getRacesFromURL(this.httpRootURL + '/embeddedRaces/search/findByHosts?host=' + race.url);
    }

    /**
     * Get entries for a race
     * On success result domain object will be an array of Entry types; {Array<Entry>}
     * @param {DirectRace} race
     * @returns {Promise<Collection<Entry>>}
     * @throws {Error}
     */
    async getEntriesByRace(race) {
        return this.getEntriesFromURL(this.httpRootURL + '/entries/search/findBySignedUpToRace?race=' + race.url);
    }

    /**
    * Get entries from the specified resource location
    * Supports interaction with server paging and sorting
    * Result domainObject will be collection HAL so conversion to local model entities needs to be performed by another method
    * @param {String} url to use to retrieve a collection of races
    * @param {Integer} [page] number to return (0 indexed)
    * @param {Integer} [size] number of elements to return per page
    * @param {SortParameters} [sortParameters] and order for sorting the requested races
    * @returns {Promise<Collection<Entry>>} If successful result domainObject will be Array<DirectRace>
    * @throws {Error}
    */
    async getEntriesFromURL(url, page, size, sortParameters) {
        const result = await this.getCollection(url, page, size, sortParameters);
        const promises = [];
        for (let i = 0; i < result.hal._embedded.entries.length; i++  ) {
            promises.push(this.getEntry(result.hal._embedded.entries[i]._links.self.href));
        };
        const entries = await Promise.all(promises);
        return new Collection(entries, result.hal?.page);
    }

    /**
     * Get an entry
     * @param {String} url Address of the remote resource
     * @returns {Promise<Entry>}
     * @throws {Error}
     */
    async getEntry(url) {
        const result = await this._read(url);
        return new Entry(result.hal, result.metadata, this);
    }

    /**
     * Get an entry by the race signed up to and dinghy signed up with
     * @param {DirectRace} race the diraect race the entry has signed up to
     * @param {Dinghy} dinghy to be sailed in race
     * @returns {Promise<Entry>}
     * @throws {Error}
     */
    async getEntryByRaceAndDinghy(race, dinghy) {
        // const result = await this._read(this.httpRootURL + '/entries/search/findBySignedUpToRaceAndDinghy?race=' + race.url + '&dinghy=' + dinghy.url);
        return this.getEntry(this.httpRootURL + '/entries/search/findBySignedUpToRaceAndDinghy?race=' + race.url + '&dinghy=' + dinghy.url);
    }

    /**
     * Get a fleet
     * @param {String} url Address of the remote resource
     * @returns {Promise<Fleet>}
     * @throws {Error}
     */

    async getFleet(url) {
        const result = await this._read(url);
        return new Fleet(result.hal, result.metadata, this);
    }

    /**
     * Get fleets in ascending order by fleet name
     * If page and/ or size are not provided will return all fleets
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Collection<Fleet>>} If successful Result.domainObject will be an Array<Fleet>
     * @throws {Error}
     */
    async getFleets(page, size) {
        let resource = this.httpRootURL + '/fleets';
        const result = await this.getCollection(resource, page, size, {by: 'name', order: SortOrder.ASCENDING});

        const promises = [];
        for (let i = 0; i < result.hal._embedded.fleets.length; i++  ) {
            promises.push(this.getFleet(result.hal._embedded.fleets[i]._links.self.href));
        };
        const fleets = await Promise.all(promises);
        return new Collection(fleets, result.hal.page);
    }

    /**
     * Get a lap
     * @param {string} url 
     * @returns {Promise<Lap>}
     * @throws {Error}
     */
    async getLap(url) {
        const result = await this._read(url);
        return new Lap(result.hal, result.metadata, this);
    }

    /**
     * Gat a collection of laps from the url
     * @param {String} url 
     * @returns {Promise<Collection<Lap>>}
     * @throws {Error}
     */
    async getLaps(url) {
        const result = await this.getCollection(url);

        const laps = await Promise.all(result.hal._embedded.laps.map((hal) => {
            return this.getLap(hal._links.self.href);
        }));
        return new Collection(laps, result.hal.page);
    }

    /**
     * Gat a race
     * Don't know when this is called if return value wil be a direct or embedded race
     * @param {String} url 
     * @returns {<Promise<DirectRace | EmbeddedRace>>}
     * @throws {Error}
     */
    async getRace(url) {
        const result = await this._read(url);
        if (/embeddedRace/.test(result.hal._links.self.href)) {
            return new EmbeddedRace(result.hal, result.metadata, this);
        }
        return new DirectRace(result.hal, result.metadata, this);
    }

    /**
     * Get races scheduled to start between the specified times
     * @param {Date} startTime The start time of the first race
     * @param {Date} endTime The start time of the last race
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] and order for sorting the requested races
     * @returns {Promise<Collection<EmbeddedRace | DirectRace>>}
     * @throws {Error}
     */
    async getRacesBetweenTimes(startTime, endTime, page, size, sortParameters) {
        const resource = this.httpRootURL + '/races/search/findByPlannedStartTimeBetween?startTime=' + startTime.toISOString() + '&endTime=' + endTime.toISOString();
        return this.getRacesFromURL(resource, page, size, sortParameters);
    }

    /**
     * Get races from the specified resource location
     * @param {String} url to use to retrieve a collection of races
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] order for sorting the requested races
     * @returns {Promise<Collection<DirectRace>>}
     * @throws {Error}
     */
    async getRacesFromURL(url, page, size, sortParameters) {
        const result = await this.getCollection(url, page, size, sortParameters);
    
        const promises = [];
        for (let i = 0; i < result.hal._embedded.races?.length; i++) {
            promises.push(this.getRace(result.hal._embedded.races[i]._links.self.href));
        }
        for (let i = 0; i < result.hal._embedded.directRaces?.length; i++  ) {
            promises.push(this.getRace(result.hal._embedded.directRaces[i]._links.self.href));
        };
        for (let i = 0; i < result.hal._embedded.embeddedRaces?.length; i++  ) {
            promises.push(this.getRace(result.hal._embedded.embeddedRaces[i]._links.self.href));
        };
        const races = await Promise.all(promises);
        return new Collection(races, result.hal.page);
    }

    /**
     * Get races scheduled to start after the specified time
     * @param {Date} startTime The start time of the race
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Collection<DirectRace>>}
     * @throws {Error}
     */
    async getDirectRacesOnOrAfterTime(startTime, page, size) {
        const resource = this.httpRootURL + '/directRaces/search/findByPlannedStartTimeGreaterThanEqual?time=' + startTime.toISOString();

        return this.getRacesFromURL(resource, page, size);
    }

    /**
     * Get SignedUp
     * @param {String} url
     * @return {Promise<SignedUp>}
     * @throws {Error}
     */
    async getSignedUp(url) {
        const result = await this._read(url);
        return new SignedUp(result.hal, result.metadata, this);
    }
    
    /**
     * Get collection of signedup 
     * @param {String} url
     * @returns {Promise<Collection<SignedUp>>}
     * @throws {Error}
     */
    async getSignedUpTo(url) {
        const result = await this.getCollection(url);

        const signedUps = await Promise.all(result.hal._embedded.signedUps.map((hal) => {
            return this.getSignedUp(hal._links.self.href);
        }));
        return new Collection(signedUps, result.hal.page);
    }

    /**
     * Get the SignedUp to race for entry
     * @param {DirectRace | EmbeddedRace} race
     * @param {Entry} entry
     * @returns {SignedUp}
     */
    async getSignedUpToRaceForEntry(race, entry) {
        const url = this.httpRootURL + '/signedUps/search/findByRaceAndEntry?race=' + race.url + '&entry=' + entry.url;
        return this.getSignedUp(url);
    }

    /**
     * Get a start sequence for starting races during a session
     * Only one type of race can be included in the start sequence
     * @param {Array<DirectRace>} races Races to build the start sequence for
     * @returns {StartSequence}
     * @throws {InvalidParameter}
     */
    getStartSequence(races) {
        if (races.length > 1 && !races.every(race => race.type === races[0].type)) {
            throw new InvalidParameter('All races in a start sequence must be of the same type.');
        }
        return new SessionStartSequence(races, this.#clock);
    }

    /**
     * Handle a websocket competitor creation message via the Stomp client
     * @param {String} message URI of competitor that was created
     */
    handleCompetitorCreation() {
        this.#competitorCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Handle a websocket competitor update message via the Stomp client
     * @param {String} message URI of competitor that has been updated
     */
    handleCompetitorUpdate(message) {
        if (this.#competitorUpdateCallbacks.has(message.body)) {
            this.#competitorUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Handle a websocket dinghy creation message via the Stomp client
     * @param {String} message URI of dinghy that was created
     */
    handleDinghyCreation() {
        this.#dinghyCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Handle a websocket dinghy class creation message via the Stomp client
     * @param {String} message URI of competitor that was created
     */
    handleDinghyClassCreation() {
        this.#dinghyClassCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Handle a websocket dinghy class update message via the Stomp client
     * @param {String} message URI of dinghy class that has been updated
     */
    handleDinghyClassUpdate(message) {
        if (this.#dinghyClassUpdateCallbacks.has(message.body)) {
            this.#dinghyClassUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Handle a websocket entry creation message via the Stomp client
     * @param {String} message URI of entry that was created
     */
    handleEntryCreation() {
        this.#entryCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Handle a websocket entry deletion message via the Stomp client
     * @param {String} message URI of entry that has been updated
     */
    handleEntryDeletion(message) {
        if (this.#entryDeletionCallbacks.has(message.body)) {
            this.#entryDeletionCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Handle a websocket entry update message via the Stomp client
     * @param {String} message URI of entry that has been updated
     */
    handleEntryUpdate(message) {
        if (this.#entryUpdateCallbacks.has(message.body)) {
            this.#entryUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Handle a websocket fleet creation message via the Stomp client
     * @param {String} message URI of competitor that was created
     */
    handleFleetCreation() {
        this.#fleetCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Handle a websocket fleet update message via the Stomp client
     * @param {String} message URI of dinghy class that has been updated
     */
    handleFleetUpdate(message) {
        if (this.#fleetUpdateCallbacks.has(message.body)) {
            this.#fleetUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Handle a websocket race update message via the Stomp client
     * @param {String} message URI of race that has been updated
     */
    handleRaceUpdate(message) {
        if (this.#raceUpdateCallbacks.has(message.body)) {
            this.#raceUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Handle a websocket race entry laps update message via the Stomp client
     * @param {String} message URI of race that has been updated
     */
    handleRaceEntryLapsUpdate(message) {
        if (this.#raceEntryLapsUpdateCallbacks.has(message.body)) {
            this.#raceEntryLapsUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Register a callback for when a new competitor is created
     * @param {Function} callback
     */
    registerCompetitorCreationCallback(callback) {
        this.#competitorCreationCallbacks.add(callback);
    }

    /**
     * Register a callback for when a competitor identified by key is updated
     * @param {String} key URI of the competitor for which the update callback is being registered
     * @param {Function} callback 
     */
    registerCompetitorUpdateCallback(key, callback) {
        if (this.#competitorUpdateCallbacks.has(key)) {
            this.#competitorUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#competitorUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Register a callback for when a new dinghy is created
     * @param {Function} callback
     */
    registerDinghyCreationCallback(callback) {
        this.#dinghyCreationCallbacks.add(callback);
    }

    /**
     * Register a callback for when a new dinghy class is created
     * @param {Function} callback
     */
    registerDinghyClassCreationCallback(callback) {
        this.#dinghyClassCreationCallbacks.add(callback);
    }

    /**
     * Register a callback for when a dinghy class identified by key is updated
     * @param {String} key URI of the dinghy class for which the update callback is being registered
     * @param {Function} callback
     */
    registerDinghyClassUpdateCallback(key, callback) {
        if (this.#dinghyClassUpdateCallbacks.has(key)) {
            this.#dinghyClassUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#dinghyClassUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Register a callback for when a new entry is created
     * @param {Function} callback
     */
    registerEntryCreationCallback(callback) {
        this.#entryCreationCallbacks.add(callback);
    }

    /**
     * Register a callback for when an entry identified by key is updated
     * @param {String} key URI of the entry for which the update callback is being registered
     * @param {Function} callback 
     */
    registerEntryDeletionCallback(key, callback) {
        if (this.#entryDeletionCallbacks.has(key)) {
            this.#entryDeletionCallbacks.get(key).add(callback);
        }
        else {
            this.#entryDeletionCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Register a callback for when an entry identified by key is updated
     * @param {String} key URI of the entry for which the update callback is being registered
     * @param {Function} callback 
     */
    registerEntryUpdateCallback(key, callback) {
        if (this.#entryUpdateCallbacks.has(key)) {
            this.#entryUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#entryUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Register a callback for when a new fleet is created
     * @param {Function} callback
     */
    registerFleetCreationCallback(callback) {
        this.#fleetCreationCallbacks.add(callback);
    }

    /**
     * Register a callback for when a fleet identified by key is updated
     * @param {String} key URI of the fleet for which the update callback is being registered
     * @param {Function} callback
     */
    registerFleetUpdateCallback(key, callback) {
        if (this.#fleetUpdateCallbacks.has(key)) {
            this.#fleetUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#fleetUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Register a callback for when a race idenified by key is updated
     * @param {String} key URI of the race for which the update callback is being registered
     * @param {Function} callback
     */
    registerRaceUpdateCallback(key, callback) {
        if (this.#raceUpdateCallbacks.has(key)) {
            this.#raceUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#raceUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Register a callback for when the laps for an entry in a race identified by key is updated
     * @param {String} key URI of the race for which the update callback is being registered
     * @param {Function} callback
     */
    registerRaceEntryLapsUpdateCallback(key, callback) {
        if (this.#raceEntryLapsUpdateCallbacks.has(key)) {
            this.#raceEntryLapsUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.#raceEntryLapsUpdateCallbacks.set(key, new Set([callback]));
        }
    }
    
    /**
     * Remove a lap from a race entry
     * @param {Entry} entry
     * @param {Lap} lap The lap to remove
     * @returns {Promise<Entry>}
     * @throws {Error}
     */
    async removeLap(entry, lap) {
        const result = await this._update(entry.url + '/removeLap', lap.hal);
        return new Entry(result.hal, result.metadata, this);
    }

    /**
     * Set scoring abbreviation for entry
     * @param {Entry} entry
     * @param {String | null} scoringAbbreviation
     * @returns {Promise<Entry>}
     * @throws {Error}
     */
    async setScoringAbbreviation(entry, scoringAbbreviation) {
        const result = await this._update(entry.url, {scoringAbbreviation: scoringAbbreviation});
        return new Entry(result.hal, result.metadata, this);
    }

    /**
     * Sign up to a race
     * Supplied race, helm, dinghy, and crew must exist
     * @param {DirectRace} race DirectRace to enter
     * @param {Competitor} helm Competitor entering race as the helm
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @param {Competitor} [crew] Competitor entering race as the crew
     * @returns {Promise<DirectRace>}
     * @throws {Error}
     */
    async signUpToRace(race, helm, dinghy, crew) {
        let result;
        if (crew) {
            result = await this._update(race.url + '/signUp', {'helm': helm.url, 'dinghy': dinghy.url, 'crew': crew.url});
        }
        else {
            result = await this._update(race.url + '/signUp', {'helm': helm.url, 'dinghy': dinghy.url});
        }
        return new DirectRace(result.hal, result.metadata, this);
    }

    /**
     * Sign up to an embedded race
     * Supplied race, helm, dinghy, and crew must exist
     * @param {EmbeddedRace} embeddedrace to enter
     * @param {Entry} entry to a direct race to sign up with
     * @returns {Promise<EmbeddedRace>}
     * @throws {Error}
     */
    async signUpToEmbeddedRace(embeddedRace, entry) {
        const result = await this._update(embeddedRace.url + '/signUp?entry=' + entry.url);
        return new EmbeddedRace(result.hal, result.metadata, this);
    }

    /**
     * Unregister a callback for when a new competitor is created
     * @param {Function} callback
     */
    unregisterCompetitorCreationCallback(callback) {
        this.#competitorCreationCallbacks.delete(callback);
    }

    /**
     * Unregister a callback for when a competitor idenified by key is updated
     * @param {String} key URI of the competitor for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterCompetitorUpdateCallback(key, callback) {
        if (this.#competitorUpdateCallbacks.has(key)) {
            this.#competitorUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Unregister a callback for when a new dinghy is created
     * @param {Function} callback
     */
    unregisterDinghyCreationCallback(callback) {
        this.#dinghyCreationCallbacks.delete(callback);
    }

    /**
     * Unregister a callback for when a new dinghy class is created
     * @param {Function} callback
     */
    unregisterDinghyClassCreationCallback(callback) {
        this.#dinghyClassCreationCallbacks.delete(callback);
    }

    /**
     * Unregister a callback for when a dinghy class idenified by key is updated
     * @param {String} key URI of the dinghy class for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterDinghyClassUpdateCallback(key, callback) {
        if (this.#dinghyClassUpdateCallbacks.has(key)) {
            this.#dinghyClassUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Unregister a callback for when a new entry is created
     * @param {Function} callback
     */
    unregisterEntryCreationCallback(callback) {
        this.#entryCreationCallbacks.delete(callback);
    }

    /**
     * Unregister a callback for when an entry idenified by key is updated
     * @param {String} key URI of the entry for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterEntryDeletionCallback(key, callback) {
        if (this.#entryDeletionCallbacks.has(key)) {
            this.#entryDeletionCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Unregister a callback for when an entry idenified by key is updated
     * @param {String} key URI of the entry for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterEntryUpdateCallback(key, callback) {
        if (this.#entryUpdateCallbacks.has(key)) {
            this.#entryUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Unregister a callback for when a new fleet is created
     * @param {Function} callback
     */
    unregisterFleetCreationCallback(callback) {
        this.#fleetCreationCallbacks.delete(callback);
    }

    /**
     * Unregister a callback for when a fleet idenified by key is updated
     * @param {String} key URI of the fleet for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterFleetUpdateCallback(key, callback) {
        if (this.#fleetUpdateCallbacks.has(key)) {
            this.#fleetUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Unregister a callback for when a race idenified by key is updated
     * @param {String} key URI of the race for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterRaceUpdateCallback(key, callback) {
        if (this.#raceUpdateCallbacks.has(key)) {
            this.#raceUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Unregister a callback for when the laps for an entry in a race idenified by key is updated
     * @param {String} key URI of the race for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterRaceEntryLapsUpdateCallback(key, callback) {
        if (this.#raceEntryLapsUpdateCallbacks.has(key)) {
            this.#raceEntryLapsUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Update an exisiting competitor
     * @param {Competitor} competitor
     * @param {String} name new value for competitors name
     * @returns {Promise<Competitor>}
     * @throws {Error}
     */
    async updateCompetitor(competitor, name) {
        const result = await this._update(competitor.url, {name: name});
        return new Competitor(result.hal, result.metadata, this);
    }

    /**
     * Update a dinghy class
     * @param {DinghyClass} dinghyClass to update
     * @param {String} name
     * @param {Integer} crewSize
     * @param {Integer} portsmouthNumber
     * @param {String} [externalName]
     * @returns {Promise<DinghyClass>}
     * @throws {Error}
     */
    async updateDinghyClass(dinghyClass, name, crewSize, portsmouthNumber, externalName = null) {
        const result = await this._update(dinghyClass.url, {name: name, crewSize: crewSize, portsmouthNumber: portsmouthNumber, externalName: externalName});
        return new DinghyClass(result.hal, result.metadata, this);
    }

    /**
     * Update an entry to a race
     * Supplied entry, helm, dinghy, and crew must exist
     * On success returns a result containing the updated entry
     * @param {Entry} entry Entry to update
     * @param {Competitor} helm Competitor entering race as the helm
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @param {Competitor} [crew] Competitor entering race as the crew
     * @returns {Promise<Entry>}
     * @throws {Error}
     */
    async updateEntry(entry, helm, dinghy, crew = null) {
        let result;
        if (crew) {
            result = await this._update(entry.url, {'helm': helm.url, 'dinghy': dinghy.url, 'crew': crew.url});
        }
        else {
            result = await this._update(entry.url, {'helm': helm.url, 'dinghy': dinghy.url, crew: null});
        }
        return new Entry(result.hal, result.metadata, this);
    }

    /**
     * Update the position of an entry in a race
     * @param {DirectRace} race
     * @param {Entry} entry
     * @param {Integer} newPosition
     * @returns {Promise<DirectRace>}
     * @throws {InvalidParameter}
     * @throws {Error}
     */
    async updateEntryPosition(race, entry, newPosition) {
        const result = await this._update(race.url + '/updateEntryPosition?entry=' + entry.url + '&position=' + newPosition);
        return new DirectRace(result.hal, result.metadata, this);
    }

    /**
     * Update the last lap time recorded for an entry in a race
     * @param {Entry} entry
     * @param {Number} time The lap time duration in milliseconds
     * @returns {Promise<Entry>}
     * @throws {Error}
     */
    async updateLap(entry, time) {
        const result = await this._update(entry.url + '/updateLap', {'time': time / 1000});
        return new Entry(result.hal, result.metadata, this);
    }

    /**
     * Update race
     * @param {DirectRace} race
     * @param {String} name
     * @param {Date} plannedStartTime
     * @param {Fleet} fleet
     * @param {Integer} duration in milliseconds
     * @param {Integer} plannedLaps
     * @param {RaceType} type
     * @param {StartType} startType
     * @returns {Promise<DirectRace>}
     * @throws {Error}
     */
    async updateRace(race, name, plannedStartTime, fleet, duration, plannedLaps, type, startType) {
        const updatedRace = {
            name: name, plannedStartTime:plannedStartTime, fleet: fleet.url, duration: duration / 1000, plannedLaps: plannedLaps,
            type: type, startType: startType
        };
        const result = await this._update(race.url, updatedRace);
        return new DirectRace(result.hal, result.metadata, this);
    }

    /**
     * Update a fleet with dinghy classes
     * @param {fleet} fleet to be updated
     * @param {String} name of updated fleet
     * @param {Array<DinghyClass>} dinghyclasses in updated fleet
     * @returns {Promise<Fleet>}
     * @throws {Error}
     */
    async updateFleet(fleet, name, dinghyClasses) {
        const result = await this._update(fleet.url, {name: name, dinghyClasses: dinghyClasses.map((dinghyClass) => dinghyClass.url)});
        return new Fleet(result.hal, result.metadata, this);
    }

    /**
     * Withdraw an entry to a race
     * @param {Entry} entry to withdraw
     * @returns {Promise<Boolean>}
     */
    async withdrawEntry(entry) {
        await this._delete(entry.url);
        return true; // failure to delete results in an error
    }

    /**
     * Remove a signed up between an an entry and a race
     * Intended for use to remove connection to embedded races.
     * If used to remove connection between an entry and a direct race will result in orphaned entries.
     * @param {SignedUp} signedup 
     * @returns {Promise<Boolean>}
     */
    async withdrawEmbeddedSignUp(signedUp) {
        await this._delete(signedUp.url);
        return true; // failure to delete results in an error
    }

    // More generic functions (move to more generic module!)

    /**
     * Create a new domain object
     * @param {String} resource
     * @param {Object} object
     * @returns {Promise<FetchResult>}
     * @throws {Error}
     */
    async _create(resource, object) {
        const body = JSON.stringify(object); // convert to string so can be serialized into object by receiving service
        return this._processFetch(resource, {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, 'body': body});
    }

    /**
     * Get a HAL+JSON representation of a domain resource
     * @param {String} resource
     * @returns {Promise<FetchResult>}
     * @throws {Error}
     */
    async _read(resource) {
        return this._processFetch(resource, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, cache: 'no-cache'});
    }

    /**
     * Update an entity via REST
	 * PATCH is used as PUT does not update association links. Also allows for partial updates
     * @param {String} resource
     * @param {Object} object
     * @returns {Promise<FetchResult}
     */
    async _update(resource, object) {
        const body = JSON.stringify(object); // convert to string so can be serialized into object by receiving service
        return this._processFetch(resource, {method: 'PATCH', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, body: body});
    }

    /**
     * Delete the resource
     * @param {String} resource
     * @returns {Promise<FetchResult>}
     */
    async _delete(resource) {
        return this._processFetch(resource, {method: 'DELETE'});
    }

    /**
     * Get data from server via Fetch
     * Expected response contains a Hal document describing the resource on the server
     * @param {String} resource 
     * @param {RequestInit} options 
     * @returns {Promise<FetchResult>}
     * @throws {Error}
     */
    async _processFetch(resource, options) {
        let response;
        let json;
        // get data from server
        try {
            response = await fetch(resource, options);
        }
        catch (error) {
            console.error(error.message, error);
            throw error;
        }
        // handle response
        try {
            // handle based on Content-Type of response
            let text;
            if (response.headers.has('Content-Type')) {
                const contentType = response.headers.get('Content-Type');
                switch (contentType) {
                    case 'application/hal+json':
                        json = await response.json();
                        break;
                    case 'text/plain;charset=UTF-8':
                        text = await response.text();
                        json = {message: text}
                        break;
                    default:
                        json = {message: 'Unrecognised content type: ' + contentType};
                }
            }
            else {
                json = {};
            }
        }
        catch (error) {
            json = {message: error.message};
        }
        if (response.ok) {
            let eTag = "";
            if (response.headers.has('ETag')) {
                eTag = response.headers.get('ETag');
            }
            return {hal: json, metadata: new Metadata(eTag)};
        }
        else {
            throw Error(this._buildClientErrorMessage(response, json?.message));
        }
    }

    /**
     * Build error message
     * @param {Response} response
     * @param {Object} json
     * @returns {String}
     */
    _buildClientErrorMessage(response, message) {
        if (message) {
            const regex = /(could not execute statement \[)(Duplicate entry)( ')([\w -]+)(' for key ')(\w+)(.+)/;
            const regexResult = regex.exec(message);
            if (regexResult && regexResult[2] === 'Duplicate entry') {
                message = `The ${regexResult[6]} '${regexResult[4]}' already exists; this may be caused by an uppercase/ lowercase difference between existing record and the value entered.`;
            }
            return 'HTTP Error: ' + response.status + (response.statusText ? ' ' : '') + response.statusText + ' Message: ' + message;
        }
        return 'HTTP Error: ' + response.status + (response.statusText ? ' ' : '') + response.statusText;
    }
}

/**
 * @typedef SortParameters
 * @property {String} by name of the property to sort the collection by
 * @property {String} order sort order for collection; 'ASC' or 'DESC'
 */

/**
 * @typedef FetchResult
 * @property {HALObject} hal constructed from the Hal document returned by server; will be an empty object if no hal document returned
 * @property {Metadata} [metadata] string returned by server
 */

/**
 * Class providng enumeration of SortOrder options for SortObject type
 */
class SortOrder {
    static ASCENDING = 'ASC';
    static DESCENDING = 'DESC';
}

export default SylphModel;
export { SortOrder };