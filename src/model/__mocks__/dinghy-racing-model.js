import { entriesScorpionA } from './test-data';

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
        return {'name': '', 'url': ''};
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
     * Provide a blank entry template
     */
    static entryTemplate() {
        return {'race': DinghyRacingModel.raceTemplate(), 'helm': DinghyRacingModel.competitorTemplate(), 'crew': null, 
        'dinghy': DinghyRacingModel.dinghyTemplate(), 'laps': [], 'sumOfLapTimes': 0, 'url': ''};
    }

    /**
     * Provide a blank lap template
     */
    static lapTemplate() {
        return {'number': null, 'time': 0};
    }

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
    }

    registerRaceUpdateCallback(key, callback) {
        if (this.raceUpdateCallbacks.has(key)) {
            this.raceUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.raceUpdateCallbacks.set(key, new Set([callback]));
        }
    }

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

    registerEntryUpdateCallback(key, callback) {
        if (this.entryUpdateCallbacks.has(key)) {
            this.entryUpdateCallbacks.get(key).add(callback);
        }
        else {
            this.entryUpdateCallbacks.set(key, new Set([callback]));
        }
    }

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

    async addLap(entry, time) {
        return null;
    }
    
    async removeLap(entry, lap) {
        return null;
    }

    async updateLap(entry, time) {
        return null;
    }

    async createCompetitor(competitor) {
        return null;
    }

    async createDinghy(dinghy) {
        return null;
    }

    async createDinghyClass(dinghyClass) {
        return null;
    }

    async createEntry(race, helm, dinghy) {
        return null;
    }

    async createRace(race) {
        return null;
    }

    async getCompetitor(url) {
        return null;
    }

    async getDinghy(url) {
        return null;
    }

    async getDinghies(dinghyClass) {
        return null;
    }

    async getDinghyBySailNumberAndDinghyClass(sailNumber, dinghyClass) {
        return null;
    }

    async getDinghyClass(url) {
        return null;
    }

    async getDinghyClassByName(name) {
        return null;
    }

    async getDinghyClasses() {
        return null;
    }

    async getEntriesByRace(race) {
        return Promise.resolve({'success': true, 'domainObject': entriesScorpionA});
    }

    async getLaps(url) {
        return null;
    }

    async getRace(url) {
        return null;
    }

    async getRacesOnOrAfterTime(startTime) {
        return null;
    }

    async getRacesBetweenTimes(startTime, endTime) {
        return null;
    }

    async getRaceByNameAndPlannedStartTime(name, time) {
        return null;
    }

    async startRace(race, startTime) {
        return null;
    }

    async getCompetitors() {
        return null;
    }

    async getCompetitorByName(name) {
        return null;
    }

    async create(urlPathSegment, object) {
        return null;
    }

    async read(resource) {
        return null;
    }

    async update(resource, object) {
        return null;
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
}

export default DinghyRacingModel;