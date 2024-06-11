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
import StartSignals from './domain-classes/start-signals';
import StartSequence from './domain-classes/start-sequence';

class DinghyRacingModel {
    httpRootURL;
    wsRootURL;
    stompClient;
    raceUpdateCallbacks = new Map(); // each key identifies an array of callbacks for the entry identified by the URI used as the key
    entryUpdateCallbacks = new Map(); // each key identifies an array of callbacks for the entry identified by the URI used as the key
    competitorCreationCallbacks = new Set();
    dinghyCreationCallbacks = new Set();

    /**
     * Provide a blank competitor template
     * @returns {Competitor}
     */
    static competitorTemplate() {
        return {'name': '', 'url': ''};
    }

    /**
     * Provide a blank dinghy class template
     * @returns {DinghyClass}
     */
    static dinghyClassTemplate() {
        return {'name': '', 'crewSize': 1, portsmouthNumber: null, 'url': ''};
    }

    /**
     * Provide a blank dinghy template
     * @returns {Dinghy}
     */
    static dinghyTemplate() {
        return {'sailNumber': '', 'dinghyClass': DinghyRacingModel.dinghyClassTemplate(), 'url': ''};
    }

    /**
     * Provide a blank race template
     * @returns {Race}
     */
    static raceTemplate() {
        return {'name': '', 'plannedStartTime': null, 'dinghyClass': DinghyRacingModel.dinghyClassTemplate(), 'duration': 0, 'plannedLaps': null, 'lapsSailed': null, 'lapForecast': null, 
            'lastLapTime': null, 'averageLapTime': null, 'clock': null, 'startSequenceState': StartSignals.NONE, 'url': ''};
    }

    /**
     * Provide a blank entry template.
     */
    static entryTemplate() {
        return {'race': DinghyRacingModel.raceTemplate(), 'helm': DinghyRacingModel.competitorTemplate(), 'crew': null, 
        'dinghy': DinghyRacingModel.dinghyTemplate(), 'laps': [], 'sumOfLapTimes': 0, 'onLastLap': false, 'finishedRace': false, 'scoringAbbreviation': null, 'url': ''};
    }

    /**
     * Provide a blank lap template
     */
    static lapTemplate() {
        return {'number': null, 'time': 0};
    }

    /**
     * 
     * @param {string} httpRootURL
     * @param {string} wsRootURL
     * @returns {DinghyRacingModel} 
     */
    constructor(httpRootURL, wsRootURL) {
        this.handleCompetitorCreation = this.handleCompetitorCreation.bind(this);
        this.handleDinghyCreation = this.handleDinghyCreation.bind(this);
        this.handleRaceUpdate = this.handleRaceUpdate.bind(this);
        this.handleEntryUpdate = this.handleEntryUpdate.bind(this);
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
            this.stompClient.subscribe('/topic/updateRace', this.handleRaceUpdate);
            this.stompClient.subscribe('/topic/updateEntry', this.handleEntryUpdate);
            this.stompClient.subscribe('/topic/deleteEntry', this.handleEntryUpdate);
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
     * @param {string} message URI of competitor that was created
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
     * @param {string} message URI of competitor that was created
     */
    handleDinghyCreation(message) {
        this.dinghyCreationCallbacks.forEach(cb => cb());
    }

    /**
     * Register a callback for when a race idenified by key is updated
     * @param {string} key URI of the race for which the update callback is being registered
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
     * @param {string} key URI of the race for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterRaceUpdateCallback(key, callback) {
        if (this.raceUpdateCallbacks.has(key)) {
            this.raceUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Handle a websocket race update message via the Stomp client
     * @param {string} message URI of race that has been updated
     */
    handleRaceUpdate(message) {
        if (this.raceUpdateCallbacks.has(message.body)) {
            this.raceUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Register a callback for when an entry identified by key is updated
     * @param {string} key URI of the entry for which the update callback is being registered
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
     * @param {string} key URI of the entry for which the update callback is being unregistered
     * @param {Function} callback
     */
    unregisterEntryUpdateCallback(key, callback) {
        if (this.entryUpdateCallbacks.has(key)) {
            this.entryUpdateCallbacks.get(key).delete(callback);
        }
    }

    /**
     * Handle a websocket entry update message via the Stomp client
     * @param {string} message URI of entry that has been updated
     */
    handleEntryUpdate(message) {
        if (this.entryUpdateCallbacks.has(message.body)) {
            this.entryUpdateCallbacks.get(message.body).forEach(cb => cb());
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
        const result = await this.update(entry.url + '/addLap', {'number': lapNumber, 'time': time / 1000}); 
        if (result.success) {
            entry.laps.push({...DinghyRacingModel.lapTemplate(), 'number': lapNumber, 'time': time}); 
            return Promise.resolve({...result, 'domainObject': entry});
        }
        else {
            return result;
        }
    }
    
    /**
     * Remove a lap from a race entry
     * @param {Entry} entry
     * @param {Lap} lap The lap to remove
     * @returns {Promise<Result}
     */
    async removeLap(entry, lap) {
        const result = await this.update(entry.url + '/removeLap', lap);
        return result;
    }

    /**
     * Update the last lap time recorded for an entry in a race
     * @param {Entry} entry
     * @param {Number} time The lap time duration in milliseconds
     * @returns {Promise<Result>}
     */
    async updateLap(entry, time) {
        const lapNumber = entry.laps.length;
        const result = await this.update(entry.url + '/updateLap', {'number': lapNumber, 'time': time / 1000}); 
        if (result.success) {
            entry.laps.push({...DinghyRacingModel.lapTemplate(), 'number': lapNumber, 'time': time}); 
            return Promise.resolve({...result, 'domainObject': entry});
        }
        else {
            return result;
        }
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
        const result = this.update(competitorURL, {name: name});
        if (result.success) {
            return Promise.resolve({success: true, domainObject: this._convertCompetitorHALToCompetitor((await result).domainObject)});
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
     * Create a new race
     * @param {Race} race 
     * @returns {Promise<Result>}
     */
    async createRace(race) {
        let dinghyClassURL;
        // if no dinghy class supplied than is a handicap race
        if (race.dinghyClass !== null && race.dinghyClass.name !== '') {
            // if not supplied get url for dinghyClass
            if (!(race.dinghyClass.url)) {
                const result = await this.getDinghyClassByName(race.dinghyClass.name);
                if (!result.success) {
                    return Promise.resolve(result);
                }
                dinghyClassURL = result.domainObject.url;
            } 
            else {
                dinghyClassURL = race.dinghyClass.url;
            }
        }

        // convert local race domain type into format required by REST service
        // REST service will accept a value in ISO 8601 format (time units only PT[n]H[n]M,n]S) or in seconds
        const newRace = {...race, 'dinghyClass': dinghyClassURL, 'duration': race.duration / 1000};
        const result = await this.create('races', newRace);
        if (result.success) {
            // get dinghyClass
            let dinghyClassResult = await this.getDinghyClass(result.domainObject._links.dinghyClass.href);
            // if race is a a handicap it will not have a dinghy class set and REST service will return a 404 not found error so in this case assume 404 error is a 'success' and provide an empty dinghy class
            const regex404 = /HTTP Error: 404/i;
            if (!dinghyClassResult.success && regex404.test(dinghyClassResult.message)) {
                dinghyClassResult = {'success': true, 'domainObject': null};
            }
            if (dinghyClassResult.success) {
                return Promise.resolve({success: true, domainObject: this._convertRaceHALToRace(result.domainObject, dinghyClassResult.domainObject)});
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
     * @param {integer} [page] number to return (0 indexed)
     * @param {integer} [size] number of elements to return per page
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
     * @param {integer} [page] number to return (0 indexed)
     * @param {integer} [size] number of elements to return per page
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
     * Get a dinghy by it's sail number and dinghy class
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
        const resource = this.httpRootURL + '/dinghyClasses/search/findByName?name=' + name;

        const result = await this.read(resource);
        if(result.success) {
            return Promise.resolve({'success': true, 'domainObject': this._convertDinghyClassHALToDinghyClass(result.domainObject)});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get dinghy classes in ascending order by class name
     * If page and/ or size are not provided will return all dinghy classes
     * @param {integer} [page] number to return (0 indexed)
     * @param {integer} [size] number of elements to return per page
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
        // get race, helm, dinghies, and laps
        const raceResult = await this.getRace(entryCollectionHAL[0]._links.race.href);
        if (!raceResult.success) {
            return Promise.resolve(raceResult);
        }
        const helmPromises = [];
        const dinghyPromises = [];
        const lapsPromises = [];
        const crewPromises = [];
        entryCollectionHAL.forEach(entry => {
            helmPromises.push(this.getCompetitor(entry._links.helm.href));
            dinghyPromises.push(this.getDinghy(entry._links.dinghy.href));
            lapsPromises.push(this.getLaps(entry._links.laps.href));
            crewPromises.push(this.getCompetitor(entry._links.crew.href));
        });
        const helmResults = await Promise.all(helmPromises);
        const dinghyResults = await Promise.all(dinghyPromises);
        const lapsResults = await Promise.all(lapsPromises);
        const crewResults = await Promise.all(crewPromises);
        const entries = [];
        for (let i = 0; i < entryCollectionHAL.length; i++) {
            if (!helmResults[i].success) {
                return Promise.resolve(helmResults[i]);
            }
            if (!dinghyResults[i].success) {
                return Promise.resolve(dinghyResults[i]);
            }
            if (!lapsResults[i].success) {
                return Promise.resolve(lapsResults[i]);
            }
            if (!crewResults[i].success) {
                // return Promise.resolve(crewResults[i]);
                if (/404/.test(crewResults[i].message)) {
                    crewResults[i] = {...crewResults[i], 'domainObject': null};
                }
                else {
                    return Promise.resolve(crewResults[i]);
                }
            }
            entries.push({...DinghyRacingModel.entryTemplate(), 'race': raceResult.domainObject, 'helm': helmResults[i].domainObject, 
                'dinghy': dinghyResults[i].domainObject, 'laps': lapsResults[i].domainObject,  'crew': crewResults[i].domainObject, 
                'sumOfLapTimes': this.convertISO8601DurationToMilliseconds(entryCollectionHAL[i].sumOfLapTimes), 'onLastLap': entryCollectionHAL[i].onLastLap, 
                'finishedRace': entryCollectionHAL[i].finishedRace, 'scoringAbbreviation': entryCollectionHAL[i].scoringAbbreviation, 'url': entryCollectionHAL[i]._links.self.href});
        };
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
            // get dinghyClass
            let dinghyClassResult = await this.getDinghyClass(result.domainObject._links.dinghyClass.href);
            // if race is a a handicap it will not have a dinghy class set and REST service will return a 404 not found error so in this case assume 404 error is a 
            // 'success' and provide an empty dinghy class 
            const regex404 = /HTTP Error: 404/i;
            if (!dinghyClassResult.success && regex404.test(dinghyClassResult.message)) {
                dinghyClassResult = {'success': true, 'domainObject': null};
            }
            if (dinghyClassResult.success) {
                return Promise.resolve({'success': true, 'domainObject': {...DinghyRacingModel.raceTemplate(), 'name': result.domainObject.name, 
                    'plannedStartTime': new Date(result.domainObject.plannedStartTime + 'Z'), 
                    'dinghyClass': dinghyClassResult.domainObject, 'duration': this.convertISO8601DurationToMilliseconds(result.domainObject.duration), 
                    'plannedLaps': result.domainObject.plannedLaps, 'lapsSailed': result.domainObject.leadEntry ? result.domainObject.leadEntry.lapsSailed : null,
                    'lapForecast': result.domainObject.lapForecast,
                    'lastLapTime': result.domainObject.leadEntry ? this.convertISO8601DurationToMilliseconds(result.domainObject.leadEntry.lastLapTime) : null, 
                    'averageLapTime': result.domainObject.leadEntry ? this.convertISO8601DurationToMilliseconds(result.domainObject.leadEntry.averageLapTime) : null, 
                    'startSequenceState': StartSignals.from(result.domainObject.startSequenceState),
                    'url': result.domainObject._links.self.href
                }});
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
     * Get races scheduled to start after the specified time
     * @param {Date} startTime The start time of the race
     * @param {integer} [page] number to return (0 indexed)
     * @param {integer} [size] number of elements to return per page
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
     * @param {integer} [page] number to return (0 indexed)
     * @param {integer} [size] number of elements to return per page
     * @param {SortParameters} [sortParameters] and order for sorting the requested races
     * @returns {Promise<Result>} If successful result domainObject will be Array<Race>
     */
    async getRacesBetweenTimes(startTime, endTime, page, size, sortParameters) {
        const resource = this.httpRootURL + '/races/search/findByPlannedStartTimeBetween?startTime=' + startTime.toISOString() + '&endTime=' + endTime.toISOString();

        return this.getRacesFromURL(resource, page, size, sortParameters);
    }

    /**
     * Get races from the specified resource location
     * @param {String} url to use to retrieve a collection of races
     * @param {integer} [page] number to return (0 indexed)
     * @param {integer} [size] number of elements to return per page
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
            const dinghyClassURLs = racesHAL.map(race => race._links.dinghyClass.href);
            const dinghyClassResults = await Promise.all(dinghyClassURLs.map(url => this.read(url)));
            
            const races = [];
            for (let i = 0; i < racesHAL.length; i++  ) {
                const dinghyClass = dinghyClassResults[i].success ? this._convertDinghyClassHALToDinghyClass(dinghyClassResults[i].domainObject) : null;
                // assume time received has been stored in UTC
                races.push({...DinghyRacingModel.raceTemplate(), 'name': racesHAL[i].name, 'plannedStartTime': new Date(racesHAL[i].plannedStartTime + 'Z'),
                    'dinghyClass': dinghyClass, 'duration': this.convertISO8601DurationToMilliseconds(racesHAL[i].duration), 'plannedLaps': racesHAL[i].plannedLaps, 
                    'lapsSailed': racesHAL[i].leadEntry ? racesHAL[i].leadEntry.lapsSailed : null, 
                    'lapForecast': racesHAL[i].lapForecast, 
                    'lastLapTime': racesHAL[i].leadEntry ? this.convertISO8601DurationToMilliseconds(racesHAL[i].leadEntry.lastLapTime) : null, 
                    'averageLapTime': racesHAL[i].leadEntry ? this.convertISO8601DurationToMilliseconds(racesHAL[i].leadEntry.averageLapTime) : null, 
                    'startSequenceState': StartSignals.from(racesHAL[i].startSequenceState),
                    'url': racesHAL[i]._links.self.href});
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
     * Update the start sequence for a race
     * @param {Race} race to update
     * @param {StartSignals} stage of the starting sequence reached
     */
    async updateRaceStartSequenceState(race, stage) {
        let result;
        if (!race.url) {
            result = await this.getRaceByNameAndPlannedStartTime(race.name, race.plannedStartTime);
        }
        else {
            result = {'success': true, 'domainObject': race};
        }
        if (result.success) {
            return this.update(result.domainObject.url, {'startSequenceState': stage});
        }
        else {
            return result;
        }
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
     * @param {Date} startTime The start time of the first race
     * @param {Date} endTime The start time of the last race
     * @returns {Promise<Result>} If successful result domainObject will be StartSequence
     */
    async getStartSequence(startTime, endTime) {
        const result = await this.getRacesBetweenTimes(startTime, endTime, null, null, {by: 'plannedStartTime', order: SortOrder.ASCENDING});

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
     * @param {string} name Name of the competitor
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
     * @param {string} urlPathSegment
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
        return this._processFetch(resource, {method: 'PATCH', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, 'body': body});
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
                return Promise.resolve({'success': true, domainObject: json});
            }
            else {
                const message = this._buildClientErrorMessage(response, json);
                return Promise.resolve({'success': false, 'message': message});
            }
        }
        catch (error) {
            return Promise.resolve({'success': false, 'message': error.toString()});
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
            // no mapping to user message found
            return 'HTTP Error: ' + response.status + ' ' + response.statusText + ' Message: ' + json.message;
        }
        // additional error details provided by server
        return 'HTTP Error: ' + response.status + ' ' + response.statusText;
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
        return {...DinghyRacingModel.competitorTemplate(), 'name': competitorHAL.name, 'url': competitorHAL._links.self.href};
    }

    _convertDinghyClassHALToDinghyClass(dinghyClassHAL) {
        return {...DinghyRacingModel.dinghyClassTemplate(), name: dinghyClassHAL.name, crewSize: dinghyClassHAL.crewSize, portsmouthNumber: dinghyClassHAL.portsmouthNumber, url: dinghyClassHAL._links.self.href};
    }

    _convertEntryHALtoEntry(entryHAL, race, helm, dinghy, crew, laps) {
        return {...DinghyRacingModel.entryTemplate(), 'race': race, 'helm': helm, 'dinghy': dinghy, 'laps': laps, 'crew': crew,
            'sumOfLapTimes': this.convertISO8601DurationToMilliseconds(entryHAL.sumOfLapTimes), 'onLastLap': entryHAL.onLastLap,
            'finishedRace': entryHAL.finishedRace, 'scoringAbbreviation': entryHAL.scoringAbbreviation, 'url': entryHAL._links.self.href
        }
    }

    _convertRaceHALToRace(raceHAL, dinghyClass) {
        return {...DinghyRacingModel.raceTemplate(), 'name': raceHAL.name,
            'plannedStartTime': new Date(raceHAL.plannedStartTime + 'Z'),
            'dinghyClass': dinghyClass, 'duration': this.convertISO8601DurationToMilliseconds(raceHAL.duration),
            'plannedLaps': raceHAL.plannedLaps, 'lapsSailed': raceHAL.leadEntry ? raceHAL.leadEntry.lapsSailed : null,
            'lapForecast': raceHAL.lapForecast,
            'lastLapTime': raceHAL.leadEntry ? this.convertISO8601DurationToMilliseconds(raceHAL.leadEntry.lastLapTime) : null,
            'averageLapTime': raceHAL.leadEntry ? this.convertISO8601DurationToMilliseconds(raceHAL.leadEntry.averageLapTime) : null,
            'startSequenceState': StartSignals.from(raceHAL.startSequenceState),
            'url': raceHAL._links.self.href
        }
    }
}

/**
 * @typedef SortParameters
 * @property {string} by name of the property to sort the collection by
 * @property {string} order sort order for collection; 'ASC' or 'DESC'
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