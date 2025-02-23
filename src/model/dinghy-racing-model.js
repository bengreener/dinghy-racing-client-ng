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
import StartSequence from './domain-classes/start-sequence';
import RaceType from './domain-classes/race-type';
import StartType from './domain-classes/start-type';

class DinghyRacingModel {
    httpRootURL;
    wsRootURL;
    stompClient;
    raceUpdateCallbacks = new Map(); // each key identifies an array of callbacks for the entry identified by the URI used as the key
    entryUpdateCallbacks = new Map(); // each key identifies an array of callbacks for the entry identified by the URI used as the key
    competitorCreationCallbacks = new Set();
    dinghyCreationCallbacks = new Set();
    dinghyClassCreationCallbacks = new Set();
    dinghyClassUpdateCallbacks = new Map();
    fleetCreationCallbacks = new Set();
    fleetUpdateCallbacks = new Map();

    /**
     * Provide a blank competitor template
     * @returns {Competitor}
     */
    static competitorTemplate() {
        return {name: '', url: ''};
    }

    /**
     * Provide a blank dinghy class template
     * @returns {DinghyClass}
     */
    static dinghyClassTemplate() {
        return {name: '', crewSize: 1, portsmouthNumber: 1000, externalName: '', url: ''};
    }

    /**
     * Provide a blank dinghy template
     * @returns {Dinghy}
     */
    static dinghyTemplate() {
        return {sailNumber: '', dinghyClass: DinghyRacingModel.dinghyClassTemplate(), url: ''};
    }

    /**
     * Provide a blank race template
     * @returns {Race}
     */
    static raceTemplate() {
        return {name: '', plannedStartTime: null, fleet: DinghyRacingModel.fleetTemplate(), type: null, startType: null, duration: 0, plannedLaps: null, lapsSailed: null, lapForecast: null, 
            lastLapTime: null, averageLapTime: null, clock: null, dinghyClasses: [], url: ''};
    }

    /**
     * Provide a blank entry template.
     */
    static entryTemplate() {
        return {race: DinghyRacingModel.raceTemplate(), helm: DinghyRacingModel.competitorTemplate(), crew: null, 
        dinghy: DinghyRacingModel.dinghyTemplate(), laps: [], sumOfLapTimes: 0, correctedTime:0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, position: null, url: ''};
    }

    /**
     * Provide a blank lap template
     */
    static lapTemplate() {
        return {number: null, time: 0};
    }

    /**
     * Provide a blank crew template
     */
    static crewTemplate() {
        return {helm: null, mate: null};
    }

    /**
     * Provide a blank fleet template
     */
    static fleetTemplate() {
        return {name: '', dinghyClasses: [], url: ''};
    }

    /**
     * 
     * @param {String} httpRootURL
     * @param {String} wsRootURL
     * @returns {DinghyRacingModel} 
     */
    constructor(httpRootURL, wsRootURL) {
        this.handleCompetitorCreation = this.handleCompetitorCreation.bind(this);
        this.handleDinghyCreation = this.handleDinghyCreation.bind(this);
        this.handleRaceUpdate = this.handleRaceUpdate.bind(this);
        this.handleEntryUpdate = this.handleEntryUpdate.bind(this);
        this.handleDinghyClassCreation = this.handleDinghyClassCreation.bind(this);
        this.handleDinghyClassUpdate = this.handleDinghyClassUpdate.bind(this);
        this.handleFleetCreation = this.handleFleetCreation.bind(this);
        this.handleFleetUpdate = this.handleFleetUpdate.bind(this);
        this.getStartSequence = this.getStartSequence.bind(this);
        if (!httpRootURL) {
            throw new Error('An HTTP root URL is required when creating an instance of DinghyRacingModel');
        }
        if (!wsRootURL) {
            throw new Error('A WebSocket root URL is required when creating an instance of DinghyRacingModel');
        }
        this.httpRootURL = httpRootURL;
        this.wsRootURL = wsRootURL;
        this.stompClient = new Client({
            'brokerURL': wsRootURL
        });
        this.stompClient.onStompError = (frame) => {
            console.error(frame);
        };
        this.stompClient.onConnect = (frame) => {
            this.stompClient.subscribe('/topic/createCompetitor', this.handleCompetitorCreation);
            this.stompClient.subscribe('/topic/createDinghy', this.handleDinghyCreation);
            this.stompClient.subscribe('/topic/createDinghyClass', this.handleDinghyClassCreation);
            this.stompClient.subscribe('/topic/createFleet', this.handleFleetCreation);
            this.stompClient.subscribe('/topic/updateRace', this.handleRaceUpdate);
            this.stompClient.subscribe('/topic/updateEntry', this.handleEntryUpdate);
            this.stompClient.subscribe('/topic/deleteEntry', this.handleEntryUpdate);
            this.stompClient.subscribe('/topic/updateDinghyClass', this.handleDinghyClassUpdate);
            this.stompClient.subscribe('/topic/updateFleet', this.handleFleetUpdate);
        };
        this.stompClient.activate();
    }

    /**
     * Register a callback for when a new competitor is created
     * @param {Function} callback
     */
    registerCompetitorCreationCallback(callback) {
        this.competitorCreationCallbacks.add(callback);
    }

    /**
     * Unregister a callback for when a new competitor is created
     * @param {Function} callback
     */
    unregisterCompetitorCreationCallback(callback) {
        this.competitorCreationCallbacks.delete(callback);
    }

    /**
     * Handle a websocket competitor creation message via the Stomp client
     * @param {String} message URI of competitor that was created
     */
    handleCompetitorCreation(message) {
        this.competitorCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Register a callback for when a new dinghy is created
     * @param {Function} callback
     */
    registerDinghyCreationCallback(callback) {
        this.dinghyCreationCallbacks.add(callback);
    }

    /**
     * Unregister a callback for when a new dinghy is created
     * @param {Function} callback
     */
    unregisterDinghyCreationCallback(callback) {
        this.dinghyCreationCallbacks.delete(callback);
    }

    /**
     * Handle a websocket dinghy creation message via the Stomp client
     * @param {String} message URI of competitor that was created
     */
    handleDinghyCreation(message) {
        this.dinghyCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Register a callback for when a race idenified by key is updated
     * @param {String} key URI of the race for which the update callback is being registered
     * @param {Function} callback
     */
    registerRaceUpdateCallback(key, callback) {
        if (this.raceUpdateCallbacks.has(key)) {
            this.raceUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.raceUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Unregister a callback for when a race idenified by key is updated
     * @param {String} key URI of the race for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterRaceUpdateCallback(key, callback) {
        if (this.raceUpdateCallbacks.has(key)) {
            this.raceUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Handle a websocket race update message via the Stomp client
     * @param {String} message URI of race that has been updated
     */
    handleRaceUpdate(message) {
        if (this.raceUpdateCallbacks.has(message.body)) {
            this.raceUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Register a callback for when an entry identified by key is updated
     * @param {String} key URI of the entry for which the update callback is being registered
     * @param {Function} callback 
     */
    registerEntryUpdateCallback(key, callback) {
        if (this.entryUpdateCallbacks.has(key)) {
            this.entryUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.entryUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Unregister a callback for when an entry idenified by key is updated
     * @param {String} key URI of the entry for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterEntryUpdateCallback(key, callback) {
        if (this.entryUpdateCallbacks.has(key)) {
            this.entryUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Handle a websocket entry update message via the Stomp client
     * @param {String} message URI of entry that has been updated
     */
    handleEntryUpdate(message) {
        if (this.entryUpdateCallbacks.has(message.body)) {
            this.entryUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Register a callback for when a new dinghy class is created
     * @param {Function} callback
     */
    registerDinghyClassCreationCallback(callback) {
        this.dinghyClassCreationCallbacks.add(callback);
    }

    /**
     * Unregister a callback for when a new dinghy class is created
     * @param {Function} callback
     */
    unregisterDinghyClassCreationCallback(callback) {
        this.dinghyClassCreationCallbacks.delete(callback);
    }

    /**
     * Handle a websocket dinghy class creation message via the Stomp client
     * @param {String} message URI of competitor that was created
     */
    handleDinghyClassCreation(message) {
        this.dinghyClassCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Register a callback for when a dinghy class identified by key is updated
     * @param {String} key URI of the dinghy class for which the update callback is being registered
     * @param {Function} callback
     */
    registerDinghyClassUpdateCallback(key, callback) {
        if (this.dinghyClassUpdateCallbacks.has(key)) {
            this.dinghyClassUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.dinghyClassUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Unregister a callback for when a dinghy class idenified by key is updated
     * @param {String} key URI of the dinghy class for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterDinghyClassUpdateCallback(key, callback) {
        if (this.dinghyClassUpdateCallbacks.has(key)) {
            this.dinghyClassUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Handle a websocket dinghy class update message via the Stomp client
     * @param {String} message URI of dinghy class that has been updated
     */
    handleDinghyClassUpdate(message) {
        if (this.dinghyClassUpdateCallbacks.has(message.body)) {
            this.dinghyClassUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Register a callback for when a new fleet is created
     * @param {Function} callback
     */
    registerFleetCreationCallback(callback) {
        this.fleetCreationCallbacks.add(callback);
    }

    /**
     * Unregister a callback for when a new fleet is created
     * @param {Function} callback
     */
    unregisterFleetCreationCallback(callback) {
        this.fleetCreationCallbacks.delete(callback);
    }

    /**
     * Handle a websocket fleet creation message via the Stomp client
     * @param {String} message URI of competitor that was created
     */
    handleFleetCreation(message) {
        this.fleetCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Register a callback for when a fleet identified by key is updated
     * @param {String} key URI of the fleet for which the update callback is being registered
     * @param {Function} callback
     */
    registerFleetUpdateCallback(key, callback) {
        if (this.fleetUpdateCallbacks.has(key)) {
            this.fleetUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.fleetUpdateCallbacks.set(key, new Set([callback]));
        }
    }

    /**
     * Unregister a callback for when a fleet idenified by key is updated
     * @param {String} key URI of the fleet for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterFleetUpdateCallback(key, callback) {
        if (this.fleetUpdateCallbacks.has(key)) {
            this.fleetUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Handle a websocket fleet update message via the Stomp client
     * @param {String} message URI of dinghy class that has been updated
     */
    handleFleetUpdate(message) {
        if (this.fleetUpdateCallbacks.has(message.body)) {
            this.fleetUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Add a lap to race entry
     * @param {Entry} entry
     * @param {Number} time The lap time duration in milliseconds
     * @returns {Promise<Result}
     */
    async addLap(entry, time) {
        const lapNumber = entry.laps.length + 1;
        return this.update(entry.url + '/addLap', {'number': lapNumber, 'time': time / 1000});
    }
    
    /**
     * Remove a lap from a race entry
     * @param {Entry} entry
     * @param {Lap} lap The lap to remove
     * @returns {Promise<Result}
     */
    async removeLap(entry, lap) {
        return this.update(entry.url + '/removeLap', lap);
    }

    /**
     * Update the last lap time recorded for an entry in a race
     * @param {Entry} entry
     * @param {Number} time The lap time duration in milliseconds
     * @returns {Promise<Result>}
     */
    async updateLap(entry, time) {
        const lapNumber = entry.laps.length;
        return this.update(entry.url + '/updateLap', {'number': lapNumber, 'time': time / 1000}); 
    }

    /**
     * Create a new competitor
     * @param {Competitor} competitor 
     * @returns {Promise<Result>}
     */
    async createCompetitor(competitor) {
        const result = await this.create('competitors', competitor);
        if (result.success) {
            return Promise.resolve({success: true, domainObject: this._convertCompetitorHALToCompetitor(result.domainObject)});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Update an exisiting competitor
     * @param {Competitor} competitor
     * @param {String} name new value for competitors name
     * @returns {Promise<Result>}
     */
    async updateCompetitor(competitor, name) {
        let competitorURL = competitor.url;
        if (!competitor.url) {
            const result = await this.getCompetitorByName(competitor.name);
            if (result.success) {
                competitorURL = result.domainObject.url;
            }
            else {
                return Promise.resolve(result);
            }
        }
        const result = await this.update(competitorURL, {name: name});
        if (result.success) {
            return Promise.resolve({success: true, domainObject: this._convertCompetitorHALToCompetitor(result.domainObject)});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Create a new dinghy
     * @param {Dinghy} dinghy 
     * @returns {Promise<Result>}
     */
    async createDinghy(dinghy) {
        let dinghyClassURL;
        // if not supplied get url for dinghyClass
        if (!dinghy.dinghyClass.url) {
            const result = await this.getDinghyClassByName(dinghy.dinghyClass.name);
            if (!result.success) {
                return Promise.resolve(result);
            }
            dinghyClassURL = result.domainObject.url;
        } 
        else {
            dinghyClassURL = dinghy.dinghyClass.url;
        }
        // convert local dinghy domain type into format required for REST service
        const result = await this.create('dinghies', {...dinghy, 'dinghyClass': dinghyClassURL});
        if (result.success) {
            // get dinghyClass
            const dinghyClassResult = await this.getDinghyClass(result.domainObject._links.dinghyClass.href);
            if (dinghyClassResult.success) {
                return Promise.resolve({'success': true, 'domainObject': {...DinghyRacingModel.dinghyTemplate(), 'sailNumber': result.domainObject.sailNumber, 
                'dinghyClass': dinghyClassResult.domainObject, 'url': result.domainObject._links.self.href}});
            }
            else {
                return Promise.resolve(dinghyClassResult);
            }
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Create a new dinghy class
     * @param {DinghyClass} dinghyClass 
     * @returns {Promise<Result>}
     */
    async createDinghyClass(dinghyClass) {
        const result = await this.create('dinghyClasses', dinghyClass);
        if (result.success) {
            return Promise.resolve({'success': true, 'domainObject': this._convertDinghyClassHALToDinghyClass(result.domainObject)});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Update a dinghy class
     * @param {DinghyClass} dinghyClass to update
     * @param {String} [name]
     * @param {Integer} [crewSize]
     * @param {Integer} [portsmouthNumber]
     * @returns {Promise<Result>}
     */
    async updateDinghyClass(dinghyClass) {
        const result = await this.update(dinghyClass.url, dinghyClass);
        if (result.success) {
            return Promise.resolve({'success': true, 'domainObject': this._convertDinghyClassHALToDinghyClass(result.domainObject)});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Create a new fleet
     * @param {Fleet} fleet
     * @returns {Promise<Result>}
     */
    async createFleet(fleet) {
        const tempFleet = {...fleet};
        // convert dinghy classes collection to form appropriate for creation of dinghy class associations via server API
        if (fleet.dinghyClasses.length > 0) {
            tempFleet.dinghyClasses = fleet.dinghyClasses.map(dinghyClass => dinghyClass.url);
        }
        const result = await this.create('fleets', tempFleet);
        if (result.success) {
            let dinghyClassesResult = await this.getDinghyClassesByUrl(result.domainObject._links.dinghyClasses.href);
            if (dinghyClassesResult.success) {
                return Promise.resolve({success: true, domainObject: this._convertFleetHALToFleet(result.domainObject, dinghyClassesResult.domainObject)});
            }
            else {
                return Promise.resolve(dinghyClassesResult);
            }
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get a fleet by URL
     * @param {String} url Address of the remote resource
     * @returns {Promise<Result>}
     */
    async getFleet(url) {
        const result = await this.read(url);
        if (result.success) {
            let dinghyClassesResult = await this.getDinghyClassesByUrl(result.domainObject._links.dinghyClasses.href);
            if (dinghyClassesResult.success) {
                return Promise.resolve({success: true, domainObject: this._convertFleetHALToFleet(result.domainObject, dinghyClassesResult.domainObject)});
            }
            else {
                return Promise.resolve(dinghyClassesResult);
            }
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get fleets in ascending order by fleet name
     * If page and/ or size are not provided will return all fleets
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Result>} If successful Result.domainObject will be an Array<Fleet>
     */
    async getFleets(page, size) {
        let resource = this.httpRootURL + '/fleets?';
        if (Number.isInteger(page)) {
            resource += 'page=' + page + '&';
        }
        if (Number.isInteger(size)) {
            resource += 'size=' + size + '&';
        }
        resource += 'sort=name,asc';

        const result = await this.read(resource);
        if (result.success) {
            let tempFleets = result.domainObject._embedded.fleets;
            // check for additional fleets
            if (!Number.isInteger(page) && !Number.isInteger(size) && result.domainObject.page.totalElements > result.domainObject.page.size) {
                return this.getFleets(0, result.domainObject.page.totalElements);
            }
            // Get dinghy classes for fleets
            const dinghyClassResults = await Promise.all(tempFleets.map(fleetHAL => this.getDinghyClassesByUrl(fleetHAL._links.dinghyClasses.href)));
            const fleetCollection = [];
            for (let i = 0; i < tempFleets.length; i++ ) {
                if (dinghyClassResults[i].success) {
                    fleetCollection.push(this._convertFleetHALToFleet(tempFleets[i], dinghyClassResults[i].domainObject));
                }
                else {
                    return Promise.resolve(dinghyClassResults[i]);
                }
            }
            return Promise.resolve({'success': true, 'domainObject': fleetCollection});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Update a fleet with dinghy classes
     * @param {fleet} fleet including dinghy classes to be updated
     * @returns {Promise<Result>}
     */
    async updateFleet(fleet) {
        const tempFleet = {...fleet};
        // convert dinghy classes collection to form appropriate for updating dinghy class associations via server API
        if (fleet.dinghyClasses.length > 0) {
            tempFleet.dinghyClasses = fleet.dinghyClasses.map(dinghyClass => dinghyClass.url);
        }
        const result = await this.update(fleet.url, tempFleet);
        if (result.success) {
            let dinghyClassesResult = await this.getDinghyClassesByUrl(result.domainObject._links.dinghyClasses.href);
            if (dinghyClassesResult.success) {
                return Promise.resolve({success: true, domainObject: this._convertFleetHALToFleet(result.domainObject, dinghyClassesResult.domainObject)});
            }
            else {
                return Promise.resolve(dinghyClassesResult);
            }
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Create a new entry to a race
     * Supplied helm, dinghy, and crew must exist
     * @param {Race} race Race to enter
     * @param {Competitor} helm Competitor entering race as the helm
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @param {Competitor} [crew] Competitor entering race as the crew
     * @returns {Promise<Result>}
     */
    async createEntry(race, helm, dinghy, crew = null) {
        let dinghyClass;

        // check if helm, crew, and dinghy have reference to remote resource and if not fetch
        // assuming if a URL supplied resource exists in REST service
        let promises = [];
        let results = [];
        // need race url
        if (!race.url) {
            promises.push(this.getRaceByNameAndPlannedStartTime(race.name, race.plannedStartTime));
        }
        else {
            promises.push(Promise.resolve({'success': true, 'domainObject': race}));
        }
        // need helm url
        if (!helm.url) {
            // lookup helm
            promises.push(this.getCompetitorByName(helm.name));
        }
        else {
            // use supplied url
            promises.push(Promise.resolve({'success': true, 'domainObject': helm}));
        }
        // need dinghy url
        if (!dinghy.url) {
            // Need dinghy class url to lookup dinghy
            if (!dinghy.dinghyClass.url) {
                const result = await this.getDinghyClassByName(dinghy.dinghyClass.name);
                if (result.success) {
                    dinghyClass = result.domainObject;
                }
                else {
                    return Promise.resolve(result);
                }
            }
            else {
                dinghyClass = dinghy.dinghyClass;
            }
            // lookup dinghy
            promises.push(this.getDinghyBySailNumberAndDinghyClass(dinghy.sailNumber, dinghyClass));
        }
        else {
            // use supplied dinghy url
            promises.push(Promise.resolve({'success': true, 'domainObject': dinghy}));
        }
        // if crew supplied need crew URL
        if (crew && !crew.url) {
            promises.push(this.getCompetitorByName(crew.name));
        }
        else {
            // deal with a null crew later
            promises.push(Promise.resolve({'success': true, 'domainObject': crew}));
        }
        // check if helm and dinghy retrieved via REST
        // if fetch was not required use helm or dinghy passed as parameters
        results = await Promise.all(promises);
        // if successful return success result
        if (results[0].success && results[1].success && results[2].success && results[3].success) {
            let result;
            if (crew) {
                result = await this.create('entries', {'race': results[0].domainObject.url, 'helm': results[1].domainObject.url, 'dinghy': results[2].domainObject.url, 'crew': results[3].domainObject.url});
            }
            else {
                result = await this.create('entries', {'race': results[0].domainObject.url, 'helm': results[1].domainObject.url, 'dinghy': results[2].domainObject.url});
            }
            if (result.success) {
                return this._entryBuilder(result);
            }
            else {
                return Promise.resolve(result);
            }
        }
        else {
            // combine failure messages and return failure
            let message = '';
            results.forEach(result => {
                if (!result.success) {
                    if (message) {
                        message += '\n';
                    }
                    message += result.message;
                }
            })
            return Promise.resolve({'success': false, 'message': message});
        }
    }

    /**
     * Update an entry to a race
     * Supplied entry, helm, dinghy, and crew must exist
     * @param {Entry} entry Entry to update
     * @param {Competitor} helm Competitor entering race as the helm
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @param {Competitor} [crew] Competitor entering race as the crew
     * @returns {Promise<Result>}
     */
    async updateEntry(entry, helm, dinghy, crew = null) {
        let dinghyClass;

        // check if helm, crew, and dinghy have reference to remote resource and if not fetch
        // assuming if a URL supplied resource exists in REST service
        let promises = [];
        let results = [];
        // need helm url
        if (!helm.url) {
            // lookup helm
            promises.push(this.getCompetitorByName(helm.name));
        }
        else {
            // use supplied url
            promises.push(Promise.resolve({'success': true, 'domainObject': helm}));
        }
        // need dinghy url
        if (!dinghy.url) {
            // Need dinghy class url to lookup dinghy
            if (!dinghy.dinghyClass.url) {
                const result = await this.getDinghyClassByName(dinghy.dinghyClass.name);
                if (result.success) {
                    dinghyClass = result.domainObject;
                }
                else {
                    return Promise.resolve(result);
                }
            }
            else {
                dinghyClass = dinghy.dinghyClass;
            }
            // lookup dinghy
            promises.push(this.getDinghyBySailNumberAndDinghyClass(dinghy.sailNumber, dinghyClass));
        }
        else {
            // use supplied dinghy url
            promises.push(Promise.resolve({'success': true, 'domainObject': dinghy}));
        }
        // if crew supplied need crew URL
        if (crew && !crew.url) {
            promises.push(this.getCompetitorByName(crew.name));
        }
        else {
            // deal with a null crew later
            promises.push(Promise.resolve({'success': true, 'domainObject': crew}));
        }
        // check if helm and dinghy retrieved via REST
        // if fetch was not required use helm or dinghy passed as parameters
        results = await Promise.all(promises);
        // if successful return success result
        if (results[0].success && results[1].success && results[2].success) {
            let result;
            if (crew) {
                result = await this.update(entry.url, {'helm': results[0].domainObject.url, 'dinghy': results[1].domainObject.url, 'crew': results[2].domainObject.url});
            }
            else {
                result = await this.update(entry.url, {'helm': results[0].domainObject.url, 'dinghy': results[1].domainObject.url, crew: null});
            }
            if (result.success) {
                return this._entryBuilder(result);
            }
            else {
                return Promise.resolve(result);
            }
        }
        else {
            // combine failure messages and return failure
            let message = '';
            results.forEach(result => {
                if (!result.success) {
                    if (message) {
                        message += '\n';
                    }
                    message += result.message;
                }
            })
            return Promise.resolve({'success': false, 'message': message});
        }
    }

    async _entryBuilder(entryResult) {
        const raceResult = await this.getRace(entryResult.domainObject._links.race.href);
        const helmResult = await this.getCompetitor(entryResult.domainObject._links.helm.href);
        const dinghyResult = await this.getDinghy(entryResult.domainObject._links.dinghy.href);
        const lapsResult = await this.getLaps(entryResult.domainObject._links.laps.href);
        let crewResult = await this.getCompetitor(entryResult.domainObject._links.crew.href);
        if (!raceResult.success) {
            return Promise.resolve(raceResult);
        }
        if (!helmResult.success) {
            return Promise.resolve(helmResult);
        }
        if (!dinghyResult.success) {
            return Promise.resolve(dinghyResult);
        }
        if (!lapsResult.success) {
            return Promise.resolve(lapsResult);
        }
        if (!crewResult.success) {
            if (/404/.test(crewResult.message)) {
                crewResult = {...crewResult, 'domainObject': null};
            }
            else {
                return Promise.resolve(crewResult);
            }
        }
        return Promise.resolve({'success': true, 'domainObject': this._convertEntryHALtoEntry(entryResult.domainObject, raceResult.domainObject, helmResult.domainObject, dinghyResult.domainObject, crewResult.domainObject, lapsResult.domainObject)});
    }

    /**
     * Withdraw an entry to a race
     * @param {Entry} entry to withdraw
     * @returns {Promise<Result>}
     */
    async withdrawEntry(entry) {
        return this.delete(entry.url);
    }

    /**
     * Update the position of an entry in a race
     * @param {Entry} entry
     * @param {Integer} newPosition
     * @returns {Promise<Result}
     */
    async updateEntryPosition(entry, newPosition) {
        let message = '';
        if (!entry.race.url) {
            message += 'The race URL is required to update an entry position.';
        }
        if (!entry.url) {
            if (message !== '') {
                message += '/n';
            }
            message += 'An entry with a URL is required to update an entry position.';
        }
        if (message !== '') {
            return Promise.resolve({success: false, message: message});
        }
        return this.update(entry.race.url + '/updateEntryPosition?entry=' + entry.url + '&position=' + newPosition);
    }

    /**
     * Create a new race
     * @param {Race} race 
     * @returns {Promise<Result>}
     */
    async createRace(race) {
        // convert local race domain type into format required by REST service
        // REST service will accept a value in ISO 8601 format (time units only PT[n]H[n]M,n]S) or in seconds
        const newRace = {...race, fleet: race.fleet.url, 'duration': race.duration / 1000};
        const result = await this.create('races', newRace);
        if (result.success) {
            // get fleet
            let fleetResult = await this.getFleet(result.domainObject._links.fleet.href);
            if (fleetResult.success) {
                return Promise.resolve({success: true, domainObject: this._convertRaceHALToRace(result.domainObject, fleetResult.domainObject)});
            }
            else {
                return Promise.resolve(fleetResult);
            }
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get competitor
     * @param {String} url Address of the remote resource
     * @returns {Promise<Result>}
     */
    async getCompetitor(url) {
        const result = await this.read(url);
        if (result.success) {
            return Promise.resolve({'success': true, 'domainObject': this._convertCompetitorHALToCompetitor(result.domainObject)});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get a collection of competitors, sorted by name in ascending order
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Result>} If successful Result.domainObject will be an Array<Competitor>
     */
    async getCompetitors(page, size) {
        const hasPage = Number.isInteger(page);
        const hasSize = Number.isInteger(size);
        let resource = this.httpRootURL + '/competitors?sort=name,asc';

        if (hasPage) {
            resource += '&page=' + page;
        }
        if (hasSize) {
            resource += '&size=' + size;
        }
        const result = await this.read(resource);
        if (result.success) {
            if (!hasPage && !hasSize && result.domainObject.page.totalElements > result.domainObject.page.size) {
                return this.getCompetitors(0, result.domainObject.page.totalElements);
            }
            const collection = result.domainObject._embedded.competitors;
            const competitorCollection = collection.map(competitor => {return {...DinghyRacingModel.competitorTemplate(), 'name': competitor.name, 'url': competitor._links.self.href}});
            return Promise.resolve({'success': true, 'domainObject': competitorCollection});
        }
        else {
            return Promise.resolve(result);
        }
    }
    
    /**
     * Get all the crews that have sailed a dinghy.
     * Result.domainObject is an array of crews. If no crews have been recorded for dinghy the array will be empty.
     * @param {Dinghy} dinghy
     * @returns {Promise<Result>}
     */
    async getCrewsByDinghy(dinghy) {
        let crewsHAL = [];
        // if race does not have a URL cannot get entries
        if (!dinghy || !dinghy?.url) {
            return Promise.resolve({'success': false, 'message': 'Cannot retrieve dinghy crews without URL for dinghy.'});
        }
        // get crews
        const resource = this.httpRootURL + '/crews/search/findCrewsByDinghy?dinghy=' + dinghy.url;
        const result = await this.read(resource);
        if (!result.success) {
            return Promise.resolve(result);
        }
        if (result.domainObject._embedded) {
            crewsHAL = result.domainObject._embedded.crews;
        }
        if (crewsHAL.length === 0) {
            // no entries for race
            return Promise.resolve({'success': true, 'domainObject': []})
        }
        const crews = [];
        for (const crewHAL of crewsHAL) {
            const crew = {...DinghyRacingModel.crewTemplate()}
            crew.helm = crewHAL.helm ? this._convertCompetitorHALToCompetitor(crewHAL.helm) : null;
            crew.mate = crewHAL.mate ? this._convertCompetitorHALToCompetitor(crewHAL.mate) : null;
            crews.push(crew);
        }
        return Promise.resolve({'success': true, 'domainObject': crews});
    }

    /**
     * Get dinghy
     * @param {String} url Address of the remote resource
     * @returns {Promise<Result>}
     */
    async getDinghy(url) {
        const result = await this.read(url);
        if (result.success) {
            // get dinghyClass
            const dinghyClassResult = await this.getDinghyClass(result.domainObject._links.dinghyClass.href);
            if (dinghyClassResult.success) {
                return Promise.resolve({'success': true, 'domainObject': {...DinghyRacingModel.dinghyTemplate(), 'sailNumber': result.domainObject.sailNumber, 
                'dinghyClass': dinghyClassResult.domainObject, 'url': result.domainObject._links.self.href}});
            }
            else {
                return Promise.resolve(dinghyClassResult);
            }
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get dinghies. If a dinghy class is provided only dinghies with that class will be returned
     * @param {dinghyClass} [dinghyClass] The dinghy class to filter by
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     */
    async getDinghies(dinghyClass, page, size) {
        let resource;
        if (!dinghyClass) {
            resource = this.httpRootURL + '/dinghies';
        }
        else {
            resource = this.httpRootURL + '/dinghies/search/findByDinghyClass?dinghyClass=' + dinghyClass.url;
        }
        if (Number.isInteger(page) || Number.isInteger(size)) {
            if (!dinghyClass) {
                resource += '?';
            }
            else {
                resource += '&';
            }
        }
        if (Number.isInteger(page)) {
            resource += 'page=' + page;
        }
        if (Number.isInteger(size)) {
            if (Number.isInteger(page)) {
                resource += '&';
            }
            resource += 'size=' + size;
        }
        const result = await this.read(resource);
        if (result.success) {
            if (!Number.isInteger(page) && !Number.isInteger(size) && result.domainObject.page.totalElements > result.domainObject.page.size) {
                return this.getDinghies(dinghyClass, 0, result.domainObject.page.totalElements);
            }
            const dinghiesHAL = result.domainObject._embedded.dinghies;
            const dinghyClassURLs = dinghiesHAL.map(race => race._links.dinghyClass.href);
            const dinghyClassResults = await Promise.all(dinghyClassURLs.map(url => this.read(url)));
            
            const dinghies = [];
            for (let i = 0; i < dinghiesHAL.length; i++  ) {
                const dinghyClass = dinghyClassResults[i].success ? this._convertDinghyClassHALToDinghyClass(dinghyClassResults[i].domainObject) : null;
                dinghies.push({'sailNumber': dinghiesHAL[i].sailNumber, 'dinghyClass': dinghyClass, 'url': dinghiesHAL[i]._links.self.href});
            };
            return Promise.resolve({'success': true, 'domainObject': dinghies});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Gets all dinghies with the given sail number
     * If successful Result.domainObject will be an Array<Dinghy>
     * @param {String} sailNumber to search for
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Result>} 
     */
    async getDinghiesBySailNumber(sailNumber, page, size) {
        let resource = this.httpRootURL + '/dinghies/search/findBySailNumber?sailNumber=' + sailNumber;

        if (Number.isInteger(page)) {
            resource += 'page=' + page;
        }
        if (Number.isInteger(size)) {
            if (Number.isInteger(page)) {
                resource += '&';
            }
            resource += 'size=' + size;
        }
        const result = await this.read(resource);
        if (result.success) {
            if (!Number.isInteger(page) && !Number.isInteger(size) && result.domainObject.page.totalElements > result.domainObject.page.size) {
                return this.getDinghiesBySailNumber(sailNumber, 0, result.domainObject.page.totalElements);
            }
            const dinghiesHAL = result.domainObject._embedded.dinghies;
            const dinghyClassURLs = dinghiesHAL.map(race => race._links.dinghyClass.href);
            const dinghyClassResults = await Promise.all(dinghyClassURLs.map(url => this.read(url)));

            const dinghies = [];
            for (let i = 0; i < dinghiesHAL.length; i++  ) {
                const dinghyClass = dinghyClassResults[i].success ? this._convertDinghyClassHALToDinghyClass(dinghyClassResults[i].domainObject) : null;
                dinghies.push({'sailNumber': dinghiesHAL[i].sailNumber, 'dinghyClass': dinghyClass, 'url': dinghiesHAL[i]._links.self.href});
            };
            return Promise.resolve({'success': true, 'domainObject': dinghies});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get a dinghy by it's sail number and dinghy class
     * If successful Result.domainObject will be a Dinghy
     * @param {String} sailNumber
     * @param {DinghyClass} dinghyClass
     * @returns {Promise<Result>}
     */
    async getDinghyBySailNumberAndDinghyClass(sailNumber, dinghyClass) {
        const resource = this.httpRootURL + '/dinghies/search/findBySailNumberAndDinghyClass?sailNumber=' + sailNumber + '&dinghyClass=' + dinghyClass.url;

        const result = await this.read(resource);
        if (result.success) {
            const domainObject = {'sailNumber': result.domainObject.sailNumber, 'dinghyClass': dinghyClass, 'url': result.domainObject._links.self.href}; // should this go back to REST service and pull DinghyClass instead of assuming?
            return Promise.resolve({'success': true, 'domainObject': domainObject});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get dinghy class
     * @param {String} url Address of the remote resource
     * @returns {Promise<Result>}
     */
    async getDinghyClass(url) {
        const result = await this.read(url);
        if (result.success) {
            return Promise.resolve({'success': true, 'domainObject': this._convertDinghyClassHALToDinghyClass(result.domainObject)});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get a dinghy class by the name of the class
     * @param {String} name
     * @returns {Promise<Result>}
     */
    async getDinghyClassByName(name) {
        return this.getDinghyClass(this.httpRootURL + '/dinghyClasses/search/findByName?name=' + name);
    }

    /**
     * Get dinghy classes in ascending order by class name
     * If page and/ or size are not provided will return all dinghy classes
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @return {Promise<Result>>} If successful Result.domainObject will be an Array<DinghyClass>
     */
    async getDinghyClasses(page, size) {
        let resource = this.httpRootURL + '/dinghyClasses?';
        if (Number.isInteger(page)) {
            resource += 'page=' + page + '&';
        }
        if (Number.isInteger(size)) {
            resource += 'size=' + size + '&';
        }
        resource += 'sort=name,asc';

        const result = await this.read(resource);
        if (result.success) {
            let collection = result.domainObject._embedded.dinghyClasses;
            // check for additional dinghy classes
            if (!Number.isInteger(page) && !Number.isInteger(size) && result.domainObject.page.totalElements > result.domainObject.page.size) {
                return this.getDinghyClasses(0, result.domainObject.page.totalElements);
            }
            const dinghyClassCollection = collection.map(dinghyClassHAL => {return this._convertDinghyClassHALToDinghyClass(dinghyClassHAL)});
            return Promise.resolve({'success': true, 'domainObject': dinghyClassCollection});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get dinghy classes associated with an entity defined by HAL via the URL provided
     * @param {String} url
     * @return {Promise<Result>>} If successful Result.domainObject will be an Array<DinghyClass>
     */
    async getDinghyClassesByUrl(url) {
        const result = await this.read(url);
        if (result.success) {
            const dinghyClassCollection = result.domainObject._embedded.dinghyClasses.map(dinghyClassHAL => {return this._convertDinghyClassHALToDinghyClass(dinghyClassHAL)});
            return Promise.resolve({'success': true, 'domainObject': dinghyClassCollection});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get entry
     * @param {String} url Address of the remote resource
     * @returns {Promise<Result>}
     */
    async getEntry(url) {
        const result = await this.read(url);
        if (result.success) {
            // get race, helm, crew, and dinghy
            const promises = [];
            promises.push(this.getRace(result.domainObject._links.race.href)); // race
            promises.push(this.getCompetitor(result.domainObject._links.helm.href)); // helm
            promises.push(this.getDinghy(result.domainObject._links.dinghy.href)); // dinghy
            promises.push(this.getCompetitor(result.domainObject._links.crew.href)); // crew
            promises.push(this.getLaps(result.domainObject._links.laps.href)); // laps
            const results = await Promise.all(promises);
            // race
            if (!results[0].success) {
                return Promise.resolve(results[0]);
            }
            // helm
            if (!results[1].success) {
                return Promise.resolve(results[1]);
            }
            // dinghy
            if (!results[2].success) {
                return Promise.resolve(results[3]);
            }
            // crew
            if (!results[3].success) {
                // entry may not have a crew
                if (/404/.test(results[3].message)) {
                    results[3] = {...results[3], 'domainObject': null};
                }
                else {
                    return Promise.resolve(results[3]);
                }
            }
            // laps
            if (!results[4].success) {
                return Promise.resolve(results[4]);
            }
            return {success: true, domainObject: this._convertEntryHALtoEntry(result.domainObject, results[0].domainObject, results[1].domainObject, results[2].domainObject, results[3].domainObject, results[4].domainObject)};
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get entries for a race
     * On success result domain object will be an array of Entry types; {Array<Entry>}
     * @param {Race} race
     * @returns {Promise<Result>}
     */
    async getEntriesByRace(race) {
        // if race does not have a URL cannot get entries
        if (!race.url) {
            return Promise.resolve({'success': false, 'message': 'Cannot retrieve race entries without URL for race.'});
        }
        // get entries
        const resource = race.url + '/signedUp';
        const result = await this.read(resource);
        if (!result.success) {
            return Promise.resolve(result);
        }
        const entryCollectionHAL = result.domainObject._embedded.entries;
        if (entryCollectionHAL.length === 0) {
            // no entries for race
            return Promise.resolve({'success': true, 'domainObject': []})
        }
        // get individual entries (this will assist later with version management but, 1st up is an attempt to fix an issue with retrieving out of date data through the entity collection)
        const entryPromises = [];
        entryCollectionHAL.forEach(entry => {
            entryPromises.push(this.getEntry(entry._links.self.href));
        });
        const entryResults = await Promise.all(entryPromises);
        const entries = [];
        for (const entryResult of entryResults) {
            if (!entryResult.success) {
                return Promise.resolve(entryResult);
            }
            entries.push(entryResult.domainObject);
        }
        return Promise.resolve({'success': true, 'domainObject': entries});
    }

    /**
     * Get laps
     * On success result domain object will be an array of Lap types; {Array<Lap>}
     * @param {String} url Address of the remote resource
     * @returns {Promise<Result>}
     */
    async getLaps(url) {
        const result = await this.read(url);
        if (!result.success) {
            return result;
        }
        const lapsCollectionHAL = result.domainObject._embedded.laps;
        if (lapsCollectionHAL.length === 0) {
            return Promise.resolve({'success': true, 'domainObject': []});
        }
        // convert REST data to local format
        const laps = lapsCollectionHAL.map(lap => {return {...DinghyRacingModel.lapTemplate, 'number': lap.number, 'time': this.convertISO8601DurationToMilliseconds(lap.time)}});
        return Promise.resolve({'success': true, 'domainObject': laps});
    }

    /**
     * Get race
     * @param {String} url Address of the remote resource
     * @returns {Promise<Result>}
     */
    async getRace(url) {
        const result = await this.read(url);
        if (result.success) {
            // get fleet
            let fleetResult = await this.getFleet(result.domainObject._links.fleet.href);
            if (fleetResult.success) {
                return Promise.resolve({'success': true, 'domainObject': this._convertRaceHALToRace(result.domainObject, fleetResult.domainObject)});
            }
            else {
                return Promise.resolve(fleetResult);
            }
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get races scheduled to start after the specified time
     * @param {Date} startTime The start time of the race
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @returns {Promise<Result>} If successful result domainObject will be Array<Race>
     */
    async getRacesOnOrAfterTime(startTime, page, size) {
        const resource = this.httpRootURL + '/races/search/findByPlannedStartTimeGreaterThanEqual?time=' + startTime.toISOString();

        return this.getRacesFromURL(resource, page, size);
    }

    /**
     * Get races scheduled to start between the specified times
     * @param {Date} startTime The start time of the first race
     * @param {Date} endTime The start time of the last race
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] and order for sorting the requested races
     * @returns {Promise<Result>} If successful result domainObject will be Array<Race>
     */
    async getRacesBetweenTimes(startTime, endTime, page, size, sortParameters) {
        const resource = this.httpRootURL + '/races/search/findByPlannedStartTimeBetween?startTime=' + startTime.toISOString() + '&endTime=' + endTime.toISOString();

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
     * @returns {Promise<Result>} If successful result domainObject will be Array<Race>
     */
    async getRacesBetweenTimesForType(startTime, endTime, type, page, size, sortParameters) {
        const resource = this.httpRootURL + '/races/search/findByPlannedStartTimeBetweenAndTypeEquals?startTime=' + startTime.toISOString() + '&endTime=' + endTime.toISOString() + '&type=' + type;

        return this.getRacesFromURL(resource, page, size, sortParameters);
    }

    /**
     * Get races from the specified resource location
     * @param {String} url to use to retrieve a collection of races
     * @param {Integer} [page] number to return (0 indexed)
     * @param {Integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] and order for sorting the requested races
     * @returns {Promise<Result>} If successful result domainObject will be Array<Race>
     */
    async getRacesFromURL(url, page, size, sortParameters) {
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

        const result = await this.read(url);
        if (result.success) {
            if (!hasPage && !hasSize && result.domainObject.page.totalElements > result.domainObject.page.size) {
                return this.getRacesFromURL(url, 0, result.domainObject.page.totalElements);
            }
            const racesHAL = result.domainObject._embedded.races;
            const fleetURLs = racesHAL.map(race => race._links.fleet.href);
            const fleetResults = await Promise.all(fleetURLs.map(url => this.getFleet(url)));
            
            const races = [];
            for (let i = 0; i < racesHAL.length; i++  ) {
                races.push(this._convertRaceHALToRace(racesHAL[i], fleetResults[i].domainObject));
            };
            return Promise.resolve({'success': true, 'domainObject': races});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get race by name and planned start time
     * @param {String} name Name of the race
     * @param {Date} time Planned start time of the race
     * @returns {Promise<Result>}
     */
    async getRaceByNameAndPlannedStartTime(name, time) {
        const resource = this.rootUrl + 'races/search?name=' + name + '&time='+ time.toISOString();

        return this.getRace(resource);
    }

    /**
     * Update the planned laps for a race
     * @param {Race} race to update
     * @param {Integer} plannedLaps of the starting sequence reached
     */
    async updateRacePlannedLaps(race, plannedLaps) {
        let result;
        if (!race.url) {
            result = await this.getRaceByNameAndPlannedStartTime(race.name, race.plannedStartTime);
        }
        else {
            result = {'success': true, 'domainObject': race};
        }
        if (result.success) {
            return this.update(result.domainObject.url, {'plannedLaps': plannedLaps});
        }
        else {
            return result;
        }
    }

    /**
     * Get a start sequence for starting races during a session
     * Only one type of race can be included in the start sequence
     * @param {Date} startTime The start time of the first race
     * @param {Date} endTime The start time of the last race
     * @param {RaceType} type The type of race to include in the start sequence
     * @returns {Promise<Result>} If successful result domainObject will be StartSequence
     */
    async getStartSequence(startTime, endTime, type) {
        const result = await this.getRacesBetweenTimesForType(startTime, endTime, type, null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING});

        if (result.success) {
            const startSequence = new StartSequence(result.domainObject, this);
            return Promise.resolve({success: true, domainObject: startSequence});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Start a race
     * @param {Race} race
     * @param {Date} startTime
    */
    async startRace(race, startTime) {
        let result;
        // need URL for race
        if (!race.url) {
            result = await this.getRaceByNameAndPlannedStartTime(race.name, race.plannedStartTime);
        }
        else {
            result = {'success': true, 'domainObject': race};
        }
        if (result.success) {
            return this.update(result.domainObject.url, {'plannedStartTime': startTime});
        }
        else {
            return result;
        }
    }

    /**
     * Get a competitor by name
     * @param {String} name Name of the competitor
     * @returns {Promise<Result>}
     */
    async getCompetitorByName(name) {
        const resource = this.httpRootURL + '/competitors/search/findByName?name=' + name;

        const result = await this.read(resource);
        if(result.success) {
            const domainObject = {...DinghyRacingModel.competitorTemplate(), 'name': result.domainObject.name, 'url': result.domainObject._links.self.href};
            return Promise.resolve({'success': true, 'domainObject': domainObject});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Create a new domain object
     * @param {String} urlPathSegment
     * @param {Object} object
     * @returns {Promise<Result>}
     */
    async create(urlPathSegment, object) {
        const body = JSON.stringify(object); // convert to string so can be serialized into object by receiving service
        return this._processFetch(this.httpRootURL + '/' + urlPathSegment, {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, 'body': body});
    }

    /**
     * Get a HAL+JSON representation of a domain resource
     * @param {String} resource
     * @returns {Promise<Result>}
     */
    async read(resource) {
        return this._processFetch(resource, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, cache: 'no-store'});
    }

    /**
     * Update an entity via REST
	 * PATCH is used as PUT does not update association links. Also allows for partial updates
     * @param {String} resource
     * @param {Object} object
     * @returns {Promise<Result}
     */
    async update(resource, object) {
        const body = JSON.stringify(object); // convert to string so can be serialized into object by receiving service
        return this._processFetch(resource, {method: 'PATCH', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, body: body});
    }

	/**
	 * Update a to many relationship
	 * Will overwrite previous associations.
	 * @param {string} resource Address of remote resource
	 * @param {string} uriList A string formatted as a uri list; one uri per line with \r\n line endings
	 * @returns {Promise<Result>}
	 */
	updateToManyAssociation(resource, uriList) {
		return this._processFetch(resource, {method: 'PUT', headers: {'Content-Type': 'text/uri-list', 'Accept': 'application/hal+json'}, body: uriList});
	}

    /**
     * Delete the reosource
     * @param {String} resource
     * @returns {Promise<Result>}
     */
    async delete(resource) {
        return this._processFetch(resource, {method: 'DELETE'});
    }
    
    async _processFetch(resource, options) {
        try {
            let json;
            const response = await fetch(resource, options);
            try {
                // if body is empty reading json() will result in an error
                json = await response.json();
            }
            catch (error) {
                if (error.message === 'Unexpected end of JSON input') {
                    json = {};
                }
                else {
                    json = {message: error.message};
                }
            }
            if (response.ok) {
                return Promise.resolve({success: true, domainObject: json});
            }
            else {
                const message = this._buildClientErrorMessage(response, json);
                return Promise.resolve({success: false, message: message});
            }
        }
        catch (error) {
            return Promise.resolve({success: false, message: error.toString()});
        }
    }

    _buildClientErrorMessage(response, json) {
        if (json.message) {
            // An existing race entry already exists for the selected dinghy
            if (/constraint \[entry.UK_entry_dinghy_id_race_id\]/.test(json.message)) {
                return 'A race entry already exists for the selected dinghy.';
            }
            if (/constraint \[entry.UK_entry_helm_id_race_id\]/.test(json.message)) {
                return 'A race entry already exists for the selected helm.';
            }
            if (/constraint \[entry.UK_entry_crew_id_race_id\]/.test(json.message)) {
                return 'A race entry already exists for the selected crew.';
            }
            const regex = /(could not execute statement \[)(Duplicate entry)( ')([\w -]+)(' for key ')(\w+)(.+)/;
            const regexResult = regex.exec(json.message);
            if (regexResult && regexResult[2] === 'Duplicate entry') {
                return `HTTP Error: 409 Conflict Message: The ${regexResult[6]} '${regexResult[4]}' already exists; this may be caused by an uppercase/ lowercase difference between existing record and the value entered.`;
            }
            // no mapping to user message found
            return 'HTTP Error: ' + response.status + ' ' + response.statusText + ' Message: ' + json.message;
        }
        // additional error details provided by server
        return 'HTTP Error: ' + response.status + ' ' + response.statusText;
    }

    _convertUriArrayToUriList(uriArray) {
		return uriArray.join('\r\n');
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

    _convertCompetitorHALToCompetitor(competitorHAL) {
        return {...DinghyRacingModel.competitorTemplate(), name: competitorHAL?.name, url: competitorHAL?._links?.self?.href};
    }

    _convertDinghyClassHALToDinghyClass(dinghyClassHAL) {
        return {...DinghyRacingModel.dinghyClassTemplate(), name: dinghyClassHAL.name, crewSize: dinghyClassHAL.crewSize, portsmouthNumber: dinghyClassHAL.portsmouthNumber, 
            externalName: (dinghyClassHAL.externalName == null) ? '' : dinghyClassHAL.externalName, 
            url: dinghyClassHAL._links.self.href};
    }

    _convertEntryHALtoEntry(entryHAL, race, helm, dinghy, crew, laps) {
        // include check for corrected time equals 'infinity' indicating a lap has not been completed
        return {...DinghyRacingModel.entryTemplate(), race: race, helm: helm, dinghy: dinghy, laps: laps, crew: crew,
            sumOfLapTimes: this.convertISO8601DurationToMilliseconds(entryHAL.sumOfLapTimes),
            correctedTime: entryHAL.correctedTime === 'PT2562047788015215H30M7S' ? 0 : this.convertISO8601DurationToMilliseconds(entryHAL.correctedTime),
            onLastLap: entryHAL.onLastLap,
            finishedRace: entryHAL.finishedRace, scoringAbbreviation: entryHAL.scoringAbbreviation, position: entryHAL.position, url: entryHAL._links.self.href
        }
    }

    _convertRaceHALToRace(raceHAL, fleet) {
        return {...DinghyRacingModel.raceTemplate(), name: raceHAL.name,
            plannedStartTime: new Date(raceHAL.plannedStartTime + 'Z'),
            fleet: fleet, duration: this.convertISO8601DurationToMilliseconds(raceHAL.duration),
            type: RaceType.from(raceHAL.type),
            startType: StartType.from(raceHAL.startType),
            plannedLaps: raceHAL.plannedLaps, lapsSailed: raceHAL.leadEntry ? raceHAL.leadEntry.lapsSailed : null,
            lapForecast: raceHAL.lapForecast,
            lastLapTime: raceHAL.leadEntry ? this.convertISO8601DurationToMilliseconds(raceHAL.leadEntry.lastLapTime) : null,
            averageLapTime: raceHAL.leadEntry ? this.convertISO8601DurationToMilliseconds(raceHAL.leadEntry.averageLapTime) : null,
            dinghyClasses: raceHAL.dinghyClasses,
            url: raceHAL._links.self.href
        }
    }

    _convertFleetHALToFleet(fleetHAL, dinghyClasses = []) {
        return {...DinghyRacingModel.fleetTemplate(), name: fleetHAL.name, dinghyClasses: dinghyClasses,
            url: fleetHAL._links.self.href
        }
    }
}

/**
 * @typedef SortParameters
 * @property {String} by name of the property to sort the collection by
 * @property {String} order sort order for collection; 'ASC' or 'DESC'
 */

/**
 * Class providng enumeration of SortOrder options for SortObject type
 */
class SortOrder {
    static ASCENDING = 'ASC';
    static DESCENDING = 'DESC';
}

export default DinghyRacingModel;
export { SortOrder };