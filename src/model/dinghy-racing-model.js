class DinghyRacingModel {
    rootURL;

    /**
     * 
     * @param {string} rootURL
     * @returns {DinghyRacingModel} 
     */
    constructor(rootURL) {
        if (!rootURL) {
            throw new Error('A URL is required when creating an instance of DinghyRacingModel');
        }
        this.rootURL = rootURL;
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
     * Supplied competitor and dinghy must exist
     * @param {Race} race Race to enter
     * @param {Competitor} competitor Competitor entering race
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @returns {Promise<Result>}
     */
    async createEntry(race, competitor, dinghy) {
        let dinghyClass;

        // check if competitor and dinghy have reference to remote resource and if not fetch
        // assuming if a URL supplied resource exists in REST service
        let promises = [];
        let results = [];
        // need competitor url
        if (!competitor.url) {
            // lookup competitor
            promises.push(this.getCompetitorByName(competitor.name));
        }
        else {
            // use supplied competitor url
            promises.push(Promise.resolve({'success': true, 'domainObject': competitor}));
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
        // check if competitor and dinghy retrieved via REST
        // if fetch was not required use competitor or dinghy passed as parameters
        results = await Promise.all(promises);
        // if successful return success result
        if (results[0].success && results[1].success) {
            return this.create('entries', {'race': race.url, 'competitor': results[0].domainObject.url, 'dinghy': results[1].domainObject.url});
        }
        // if creation fails for competitor and dinghy combine messages and return failure
        if (!results[0].success && !results[1].success) {
            return Promise.resolve({'success': false, 'message': results[0].message + '\n' + results[1].message});
        }
        // if creation fails for competitor return failure
        if (!results[0].success) {
            return Promise.resolve({'success': false, 'message': results[0].message});
        }
        // if creation fails for dinghy return failure
        return Promise.resolve({'success': false, 'message': results[1].message});
    }

    /**
     * Create a new race
     * @param {Race} race 
     * @returns {Promise<Result>}
     */
    async createRace(race) {
        var dinghyClassURL;
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
        const newRace = {...race, 'plannedStartTime': race.time, 'dinghyClass': dinghyClassURL};
        return this.create('races', newRace);
    }

    /**
     * Get dinghies. If a dinghy class is provided only dinhies with that class will be returned
     * @param {dinghyClass} [dinghyClass] The dinghy class to filter by
     */
    async getDinghies(dinghyClass) {
        let resource;
        if (!dinghyClass) {
            resource = this.rootURL + '/dinghies';
        }
        else {
            resource = this.rootURL + '/dinghies/search/findByDinghyClass?dinghyClass=' + dinghyClass.url;
        }
        const result = await this.read(resource);
        if (result.success) {
            const dinghiesHAL = result.domainObject._embedded.dinghies;
            const dinghyClassURLs = dinghiesHAL.map(race => race._links.dinghyClass.href);
            const dinghyClassResults = await Promise.all(dinghyClassURLs.map(url => this.read(url)));
            
            const dinghies = [];
            for (let i = 0; i < dinghiesHAL.length; i++  ) {
                const dinghyClass = dinghyClassResults[i].success ? {'name': dinghyClassResults[i].domainObject.name, 'url': dinghyClassResults[i].domainObject._links.self.href} : null;
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
        const resource = this.rootURL + '/dinghies/search/findBySailNumberAndDinghyClass?sailNumber=' + sailNumber + '&dinghyClass=' + dinghyClass.url;

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
     * Get a dinghy class by the name of the class
     * @param {String} name
     * @returns {Promise<Result>}
     */
    async getDinghyClassByName(name) {
        const resource = this.rootURL + '/dinghyClasses/search/findByName?name=' + name;

        const result = await this.read(resource);
        if(result.success) {
            const domainObject = {'name': result.domainObject.name, 'url': result.domainObject._links.self.href};
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
        const resource = this.rootURL + '/dinghyClasses?sort=name,asc';

        const result = await this.read(resource);
        if (result.success) {
            const collection = result.domainObject._embedded.dinghyClasses;
            const dinghyClassCollection = collection.map(dinghyClass => {return {'name': dinghyClass.name, 'url': dinghyClass._links.self.href}});
            return Promise.resolve({'success': true, 'domainObject': dinghyClassCollection});
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
        const resource = this.rootURL + '/races/search/findByPlannedStartTimeGreaterThanEqual?time=' + startTime.toISOString();

        const result = await this.read(resource);
        if (result.success) {
            const racesHAL = result.domainObject._embedded.races;
            const dinghyClassURLs = racesHAL.map(race => race._links.dinghyClass.href);
            const dinghyClassResults = await Promise.all(dinghyClassURLs.map(url => this.read(url)));
            
            const races = [];
            for (let i = 0; i < racesHAL.length; i++  ) {
                const dinghyClass = dinghyClassResults[i].success ? {'name': dinghyClassResults[i].domainObject.name, 'url': dinghyClassResults[i].domainObject._links.self.href} : null;
                // assume time received has been stored in UTC
                races.push({'name': racesHAL[i].name, 'time': new Date(racesHAL[i].plannedStartTime + 'Z'), 
                    'dinghyClass': dinghyClass, 'url': racesHAL[i]._links.self.href});
            };
            return Promise.resolve({'success': true, 'domainObject': races});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Get a collection of competitors, sorted by name in ascending order
     * @returns {Promise<Result>} If successful Result.domainObject will be an Array<Competitor>
     */
    async getCompetitors() {
        const resource = this.rootURL + '/competitors?sort=name,asc';

        const result = await this.read(resource);
        if (result.success) {
            const collection = result.domainObject._embedded.competitors;
            const competitorCollection = collection.map(competitor => {return {'name': competitor.name, 'url': competitor._links.self.href}});
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
        const resource = this.rootURL + '/competitors/search/findByName?name=' + name;

        const result = await this.read(resource);
        if(result.success) {
            const domainObject = {'name': result.domainObject.name, 'url': result.domainObject._links.self.href};
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
            var json;
            const response = await fetch(this.rootURL + '/' + urlPathSegment, {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, 'body': body});
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
            var json;
            const response = await fetch(resource, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}});
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
            if(response.ok) {
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
}

export default DinghyRacingModel;