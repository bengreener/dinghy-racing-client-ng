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
        return this.create('dinghies', dinghy);
    }

    /**
     * Create a new dinghy class
     * @param {DinghyClass} dinghyClass 
     * @returns {Promise<Result>}
     */
     async createDinghyClass(dinghyClass) {
        return this.create('dinghyclasses', dinghyClass);
    }

    /**
     * Creata a new entry to a race
     * @param {Race} race Race to enter
     * @param {Competitor} competitor Competitor entering race
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @returns {Promise<Result>}
     */
    async createEntry(race, competitor, dinghy) {
        let finalCompetitor;
        let finalDinghy;
        let finalDinghyClass;

        // check if competitor and dinghy have reference to remote resource and if not fetch
        // assuming if a URL supplied resource exists in REST service
        let promises = [];
        let results = [];
        if (!competitor.url) {
            promises.push(this.getCompetitorByName(competitor.name));
        }
        else {
            promises.push(Promise.resolve({'success': true, 'domainObject': competitor}));
        }
        if (!dinghy.url) {
            if (!dinghy.dinghyClass.url) {
                finalDinghyClass = await this.getDinghyClassByName(dinghy.dinghyClass.name);
            }
            else {
                finalDinghyClass = dinghy.dinghyClass;
            }
            promises.push(this.getDinghyBySailNumberAndDinghyClass(dinghy.sailNumber, finalDinghyClass));
        }
        else {
            promises.push(Promise.resolve({'success': true, 'domainObject': dinghy}));
        }
        // check if competitor and dinghy retrieved via REST and if not create
        // if fetch was not required use competitor or dinghy passed as parameters
        results = await Promise.all(promises);
        promises = [];
        if(results[0].success) {
            promises.push(Promise.resolve(results[0]));
        }
        else {
            promises.push(this.createCompetitor(competitor));
        }
        if(results[1].success) {
            promises.push(Promise.resolve(results[1]));
        }
        else {
            promises.push(this.createDinghy(dinghy));
        }
        results = await Promise.all(promises);
        // if successful return success result
        if (results[0].success && results[1].success) {
            return this.create('entries', {'competitor': results[0].domainObject.url, 'dinghy': results[1].domainObject.url});
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

        // convert local race domain type into format required by REST service
        const newRace = {...race, 'plannedStartTime': race.time, 'dinghyClass': dinghyClassURL};
        return this.create('races', newRace);
    }

    /**
     * 
     */
    async getDinghyBySailNumberAndDinghyClass(sailNumber, dinghyClass) {
        const resource = this.rootURL + '/dinghyclasses/search/findByName?name=' + sailNumber + '&dinghyClass=' + dinghyClass.url;

        const result = await this.read(resource);
        if(result.success) {
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
        const resource = this.rootURL + '/dinghyclasses/search/findByName?name=' + name;

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
        const resource = this.rootURL + '/dinghyclasses?sort=name,asc';

        const result = await this.read(resource);
        if(result.success) {
            const collection = result.domainObject._embedded.dinghyClasses;
            const dinghyCollection = collection.map(dinghyClass => {return {'name': dinghyClass.name, 'url': dinghyClass._links.self.href}});
            return Promise.resolve({'success': true, 'domainObject': dinghyCollection});
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
                races.push({'name': racesHAL[i].name, 'time': new Date(racesHAL[i].plannedStartTime), 
                    'dinghyClass': dinghyClass, 'url': racesHAL[i]._links.self.href});
            };
            return Promise.resolve({'success': true, 'domainObject': races});
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * get a competitor by name
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