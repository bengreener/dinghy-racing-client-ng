import { Client } from '@stomp/stompjs';

class DinghyRacingModel {
    httpRootURL;
    wsRootURL;
    stompClient;
    raceUpdateCallbacks = new Map(); // each key identifies an array of callbacks for the entry identified by the URI used as the key
    entryUpdateCallbacks = new Map(); // each key identifies an array of callbacks for the entry identified by the URI used as the key

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
        return {'name': '', 'crewSize': 1, 'url': ''};
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
        return {'name': '', 'plannedStartTime': null, 'actualStartTime': null, 'dinghyClass': DinghyRacingModel.dinghyClassTemplate(), 'duration': 0, 'plannedLaps': null, 'lapForecast': null, 
            'lastLapTime': null, 'averageLapTime': null, 'clock': null, 'url': ''};
    }

    /**
     * Provide a blank entry template.
     */
    static entryTemplate() {
        return {'race': DinghyRacingModel.raceTemplate(), 'helm': DinghyRacingModel.competitorTemplate(), 'crew': null, 
        'dinghy': DinghyRacingModel.dinghyTemplate(), 'laps': [], 'sumOfLapTimes': 0, 'onLastLap': false, 'finishedRace': false, 'url': ''};
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
        this.handleRaceUpdate = this.handleRaceUpdate.bind(this);
        this.handleEntryUpdate = this.handleEntryUpdate.bind(this);
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
            this.stompClient.subscribe('/topic/updateRace', this.handleRaceUpdate);
            this.stompClient.subscribe('/topic/updateEntry', this.handleEntryUpdate);
        };
        this.stompClient.activate();
    }

    /**
     * Register a callback for when a race idenified by key is updated
     * @param {*} key
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
     * @param {*} key
     * @param {Function} callback
     */
    unregisterRaceUpdateCallback(key, callback) {
        if (this.raceUpdateCallbacks.has(key)) {
            this.raceUpdateCallbacks.get(key).delete(callback);
        }
    }

    handleRaceUpdate(message) {
        if (this.raceUpdateCallbacks.has(message.body)) {
            this.raceUpdateCallbacks.get(message.body).forEach(cb => cb());
        }
    }

    /**
     * Register a callback for when an entry idenified by key is updated 
     * @param {*} key 
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
     * @param {*} key
     * @param {Function} callback
     */
    unregisterEntryUpdateCallback(key, callback) {
        if (this.entryUpdateCallbacks.has(key)) {
            this.entryUpdateCallbacks.get(key).delete(callback);
        }
    }

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
        return this.create('competitors', competitor);
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
        return this.create('dinghies', {...dinghy, 'dinghyClass': dinghyClassURL});
    }

    /**
     * Create a new dinghy class
     * @param {DinghyClass} dinghyClass 
     * @returns {Promise<Result>}
     */
     async createDinghyClass(dinghyClass) {
        return this.create('dinghyClasses', dinghyClass);
    }

    /**
     * Create a new entry to a race
     * Supplied helm and dinghy must exist
     * @param {Race} race Race to enter
     * @param {Competitor} helm Competitor entering race as the helm
     * @param {Dinghy} dinghy Dinghy to be sailed in race
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
            // use supplied  url
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
            if (crew) {
                return this.create('entries', {'race': results[0].domainObject.url, 'helm': results[1].domainObject.url, 'dinghy': results[2].domainObject.url, 'crew': results[3].domainObject.url});
            }
            return this.create('entries', {'race': results[0].domainObject.url, 'helm': results[1].domainObject.url, 'dinghy': results[2].domainObject.url});
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
        return this.create('races', newRace);
    }

    /**
     * Get competitor
     * @param {String} url Address of the remote resource
     * @returns {Promise<Result>}
     */
    async getCompetitor(url) {
        const result = await this.read(url);
        if (result.success) {
            return Promise.resolve({'success': true, 'domainObject': {...DinghyRacingModel.competitorTemplate(), 'name': result.domainObject.name, 'url': result.domainObject._links.self.href}});
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
     */
    async getDinghies(dinghyClass) {
        let resource;
        if (!dinghyClass) {
            resource = this.httpRootURL + '/dinghies';
        }
        else {
            resource = this.httpRootURL + '/dinghies/search/findByDinghyClass?dinghyClass=' + dinghyClass.url;
        }
        const result = await this.read(resource);
        if (result.success) {
            const dinghiesHAL = result.domainObject._embedded.dinghies;
            const dinghyClassURLs = dinghiesHAL.map(race => race._links.dinghyClass.href);
            const dinghyClassResults = await Promise.all(dinghyClassURLs.map(url => this.read(url)));
            
            const dinghies = [];
            for (let i = 0; i < dinghiesHAL.length; i++  ) {
                const dinghyClass = dinghyClassResults[i].success ? {...DinghyRacingModel.dinghyClassTemplate(), 'name': dinghyClassResults[i].domainObject.name, 
                    'crewSize': dinghyClassResults[i].domainObject.crewSize, 'url': dinghyClassResults[i].domainObject._links.self.href} : null;
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
            return Promise.resolve({'success': true, 'domainObject': {...DinghyRacingModel.dinghyClassTemplate(), 'name': result.domainObject.name, 
            'crewSize': result.domainObject.crewSize, 'url': result.domainObject._links.self.href}});
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
            const domainObject = {...DinghyRacingModel.dinghyClassTemplate(), 'name': result.domainObject.name, 
                'crewSize': result.domainObject.crewSize, 'url': result.domainObject._links.self.href};
            return Promise.resolve({'success': true, 'domainObject': domainObject});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get dinghy classes
     * @return {Promise<Result>>} If successful Result.domainObject will be an Array<DinghyClass>
     */
    async getDinghyClasses() {
        const resource = this.httpRootURL + '/dinghyClasses?sort=name,asc';

        const result = await this.read(resource);
        if (result.success) {
            const collection = result.domainObject._embedded.dinghyClasses;
            const dinghyClassCollection = collection.map(dinghyClass => {return {...DinghyRacingModel.dinghyClassTemplate(), 'name': dinghyClass.name, 
                'crewSize': dinghyClass.crewSize, 'url': dinghyClass._links.self.href}});
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
        const resource = this.httpRootURL + '/entries/search/findByRace?race=' + race.url;
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
                'sumOfLapTimes': this.convertISO8601DurationToMilliseconds(entryCollectionHAL[i].sumOfLapTimes), 'onLastLap': entryCollectionHAL[i].onLastLap, 'finishedRace': entryCollectionHAL[i].finishedRace, 'url': entryCollectionHAL[i]._links.self.href});
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
                    'actualStartTime': result.domainObject.actualStartTime ? new Date(result.domainObject.actualStartTime + 'Z') : null, 
                    'dinghyClass': dinghyClassResult.domainObject, 'duration': this.convertISO8601DurationToMilliseconds(result.domainObject.duration), 
                    'plannedLaps': result.domainObject.plannedLaps, 'lapForecast': result.domainObject.lapForecast, 
                    'lastLapTime': result.domainObject.leadEntry ? this.convertISO8601DurationToMilliseconds(result.domainObject.leadEntry.lastLapTime) : null, 
                    'averageLapTime': result.domainObject.leadEntry ? this.convertISO8601DurationToMilliseconds(result.domainObject.leadEntry.averageLapTime) : null, 
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
     * @returns {Promise<Result>} If successful result domainObject will be Array<Race>
     */
    async getRacesOnOrAfterTime(startTime) {
        const resource = this.httpRootURL + '/races/search/findByPlannedStartTimeGreaterThanEqual?time=' + startTime.toISOString();

        const result = await this.read(resource);
        if (result.success) {
            const racesHAL = result.domainObject._embedded.races;
            const dinghyClassURLs = racesHAL.map(race => race._links.dinghyClass.href);
            const dinghyClassResults = await Promise.all(dinghyClassURLs.map(url => this.read(url)));
            
            const races = [];
            for (let i = 0; i < racesHAL.length; i++  ) {
                const dinghyClass = dinghyClassResults[i].success ? {...DinghyRacingModel.dinghyClassTemplate(), 'name': dinghyClassResults[i].domainObject.name, 
                    'crewSize': dinghyClassResults[i].domainObject.crewSize, 'url': dinghyClassResults[i].domainObject._links.self.href} : null;
                // assume time received has been stored in UTC
                races.push({...DinghyRacingModel.raceTemplate(), 'name': racesHAL[i].name, 'plannedStartTime': new Date(racesHAL[i].plannedStartTime + 'Z'), 
                    'actualStartTime': racesHAL[i].actualStartTime ? new Date(racesHAL[i].actualStartTime + 'Z') : null, 
                    'dinghyClass': dinghyClass, 'duration': this.convertISO8601DurationToMilliseconds(racesHAL[i].duration), 'plannedLaps': racesHAL[i].plannedLaps, 
                    'lapForecast': racesHAL[i].lapForecast, 
                    'lastLapTime': racesHAL[i].leadEntry ? this.convertISO8601DurationToMilliseconds(racesHAL[i].leadEntry.lastLapTime) : null, 
                    'averageLapTime': racesHAL[i].leadEntry ? this.convertISO8601DurationToMilliseconds(racesHAL[i].leadEntry.averageLapTime) : null, 
                    'url': racesHAL[i]._links.self.href});
            };
            return Promise.resolve({'success': true, 'domainObject': races});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get races scheduled to start between the specified times
     * @param {Date} startTime The start time of the first race
     * @param {Date} endTime The start time of the last race
     * @returns {Promise<Result>} If successful result domainObject will be Array<Race>
     */
    async getRacesBetweenTimes(startTime, endTime) {
        const resource = this.httpRootURL + '/races/search/findByPlannedStartTimeBetween?startTime=' + startTime.toISOString() + '&endTime=' + endTime.toISOString();

        const result = await this.read(resource);
        if (result.success) {
            const racesHAL = result.domainObject._embedded.races;
            const dinghyClassURLs = racesHAL.map(race => race._links.dinghyClass.href);
            const dinghyClassResults = await Promise.all(dinghyClassURLs.map(url => this.read(url)));
            
            const races = [];
            for (let i = 0; i < racesHAL.length; i++  ) {
                const dinghyClass = dinghyClassResults[i].success ? {...DinghyRacingModel.dinghyClassTemplate(), 'name': dinghyClassResults[i].domainObject.name, 
                    'crewSize': dinghyClassResults[i].domainObject.crewSize, 'url': dinghyClassResults[i].domainObject._links.self.href} : null;
                // assume time received has been stored in UTC
                races.push({...DinghyRacingModel.raceTemplate(), 'name': racesHAL[i].name, 'plannedStartTime': new Date(racesHAL[i].plannedStartTime + 'Z'), 
                    'actualStartTime': racesHAL[i].actualStartTime ? new Date(racesHAL[i].actualStartTime + 'Z') : null, 
                    'dinghyClass': dinghyClass, 'duration': this.convertISO8601DurationToMilliseconds(racesHAL[i].duration), 'plannedLaps': racesHAL[i].plannedLaps, 
                    'lapForecast': racesHAL[i].lapForecast, 
                    'lastLapTime': racesHAL[i].leadEntry ? this.convertISO8601DurationToMilliseconds(racesHAL[i].leadEntry.lastLapTime) : null, 
                    'averageLapTime': racesHAL[i].leadEntry ? this.convertISO8601DurationToMilliseconds(racesHAL[i].leadEntry.averageLapTime) : null, 
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
            // return this.update(result.domainObject.url, {'actualStartTime': startTime});
            return this.update(result.domainObject.url, {'plannedStartTime': startTime});
        }
        else { 
            return result;
        }
    }

    /**
     * Get a collection of competitors, sorted by name in ascending order
     * @returns {Promise<Result>} If successful Result.domainObject will be an Array<Competitor>
     */
    async getCompetitors() {
        const resource = this.httpRootURL + '/competitors?sort=name,asc';

        const result = await this.read(resource);
        if (result.success) {
            const collection = result.domainObject._embedded.competitors;
            const competitorCollection = collection.map(competitor => {return {...DinghyRacingModel.competitorTemplate(), 'name': competitor.name, 'url': competitor._links.self.href}});
            return Promise.resolve({'success': true, 'domainObject': competitorCollection});
        }
        else {
            return Promise.resolve(result);
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
     */
    async create(urlPathSegment, object) {
        const body = JSON.stringify(object); // convert to string so can be serialized into object by receiving service
        try {
            let json;
            const response = await fetch(this.httpRootURL + '/' + urlPathSegment, {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, 'body': body});
            try {
                // if body is empty reading json() will result in an error
                json = await response.json();
            }
            catch (error) {
                json = {};
            }
            if(response.ok) {
                return Promise.resolve({'success': true});
            }
            else {
                const message = json.message ? 'HTTP Error: ' + response.status + ' Message: ' + json.message : 'HTTP Error: ' + response.status + ' Message: No additional information available';
                return Promise.resolve({'success': false, 'message': message});
            }
        }
        catch (error) {
            return Promise.resolve({'success': false, 'message': error.toString()});
        }
    }

    /**
     * Get a HAL+JSON representation of a domain resource
     * @param {String} resource
     * @returns {Promise<Result>}
     */
    async read(resource) {
        try {
            let json;
            const response = await fetch(resource, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, cache: 'no-store'});
            try {
                // if body is empty reading json() will result in an error 
                json = await response.json();
            } 
            catch (error) {
                if (error.message === 'Unexpected end of JSON input') {
                    json = {message: 'Resource not found'};
                }
                else {
                    json = {};
                }
            }
            if (response.ok) {
                return Promise.resolve({'success': true, 'domainObject': json});
            }
            else {
                const message = json.message ? 'HTTP Error: ' + response.status + ' Message: ' + json.message : 'HTTP Error: ' + response.status + ' Message: No additional information available';
                return Promise.resolve({'success': false, 'message': message});
            }
        }
        catch (error) {
            return Promise.resolve({'success': false, 'message': error.toString()});
        }
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
        try {
            const response = await fetch(resource, {method: 'PATCH', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, 'body': body});
            if (response.ok) {
                return Promise.resolve({'success': true});
            }
            else {
                const message = 'HTTP Error: ' + response.status + ' Message: No additional information available';
                return Promise.resolve({'success': false, 'message': message});
            }
        }
        catch (error) {
            return Promise.resolve({'success': false, 'message': error.toString()});
        }        
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
}

export default DinghyRacingModel;