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
     * Creates a new dinghy class
     * @param {DinghyClass} dinghyClass 
     * @returns {Promise<Result>}
     */
     async createDinghyClass(dinghyClass) {
        return this.create('dinghyclasses', dinghyClass);
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
     * Get a dinghy class by the name of the class
     * @param {String} name
     * @returns {Promise<Result>}
     */
    async getDinghyClassByName(name) {
        const urlPathSegment = 'dinghyclasses/search/findByName';
        const query = 'name=' + name;
        try {
            var json;
            const response = await fetch(this.rootURL + '/' + urlPathSegment + '?' + query, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}});
            try {
                // if body is empty reading json() will result in an error 
                json = await response.json();
            } 
            catch (error) {
                if (error.message = 'Unexpected end of JSON input') {
                    json = {message: 'Dinghy class not found'};
                }
                else {
                    json = {};
                }
            }
            if(response.ok) {
                const domainObject = {'name': json.name, 'url': json._links.self.href};
                return Promise.resolve({'success': true, 'domainObject': domainObject});
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
}

export default DinghyRacingModel;