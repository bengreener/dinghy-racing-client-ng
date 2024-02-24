import { downloadRaceEntriesCSV } from '../utilities/csv-writer'
class DinghyRacingController {
    
    model;

    constructor(model) {
        if (!model) {
            throw new Error('A dinghy racing model is required when creating an instance of DinghyRacingController');
        }
        this.model = model;
        this.createDinghyClass = this.createDinghyClass.bind(this);
        this.createRace = this.createRace.bind(this);
        this.addLap = this.addLap.bind(this);
        this.postponeRace = this.postponeRace.bind(this);
    }

    /**
     * Add a lap to race entry
     * @param {Entry} entry
     * @param {Number} time The lap time duration in milliseconds
     * @returns {Promise<Result>}
     */
    addLap(entry, time) {
        if (!entry || !entry.url) {
            return Promise.resolve({'success': false, 'message': 'A valid entry is required to add a lap time.'});
        }
        // time can't be null and must be number
        if (isNaN(time)) {
            return Promise.resolve({'success': false, 'message': 'Time must be a number; in milliseconds.'});   
        }
        // time must be greater than zero
        if (time <= 0) {
            return Promise.resolve({'success': false, 'message': 'Time must be greater than zero.'});   
        }
        return this.model.addLap(entry, time);
    }

    /**
     * Remove a lap from a race entry
     * @param {Entry} entry
     * @param {Lap} lap The lap to remove
     * @returns {Promise<Result>}
     */
    removeLap(entry, lap) {
        if (!entry || !entry.url) {
            return Promise.resolve({'success': false, 'message': 'A valid entry is required to remove a lap.'});
        }
        // time can't be null and must be number
        if (!lap) {
            return Promise.resolve({'success': false, 'message': 'A lap to remove is required.'});   
        }
        return this.model.removeLap(entry, lap);
    }

    /**
     * Update the last lap time recorded for an entry in a race
     * @param {Entry} entry
     * @param {Number} time The lap time duration in milliseconds
     * @returns {Promise<Result>}
     */
    updateLap(entry, time) {
        if (!entry || !entry.url) {
            return Promise.resolve({'success': false, 'message': 'A valid entry is required to update a lap time.'});
        }
        // time can't be null and must be number
        if (isNaN(time)) {
            return Promise.resolve({'success': false, 'message': 'Time must be a number; in milliseconds.'});   
        }
        // time must be greater than zero
        if (time <= 0) {
            return Promise.resolve({'success': false, 'message': 'Time must be greater than zero.'});   
        }
        return this.model.updateLap(entry, time);
    }

    /**
     * Set a scoring abbreviation for an entry
     * @param {Entry} entry
     * @param {String} scoringAbbreviation
     */
    setScoringAbbreviation(entry, scoringAbbreviation) {
        if (!entry || !entry.url) {
            return Promise.resolve({'success': false, 'message': 'A valid entry is required to set a scoring abbreviation.'});
        }
        if (!scoringAbbreviation || scoringAbbreviation.length !== 3) {
            return Promise.resolve({'success': false, 'message': 'Scoring abbreviation must be 3 characters long.'});
        }
        return this.model.update(entry.url, {'scoringAbbreviation': scoringAbbreviation.toUpperCase()});
    }

    /**
     * Add a new competitor
     * @param {Competitor} 
     * @returns {Promise<Result>}
     */
    createCompetitor(competitor) {
        if (!competitor || !competitor.name) {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new competitor'});
        }
        return this.model.createCompetitor(competitor);
    }

    /**
     * Add a new dinghy
     * @param {Dinghy} dinghy
     * @returns {Promise<Result>} 
     */
    createDinghy(dinghy) {
        if (!dinghy || !dinghy.sailNumber) {
            return Promise.resolve({'success': false, 'message': 'A sail number is required for a new dinghy.'});
        }
        if (!dinghy.dinghyClass || !dinghy.dinghyClass.name) {
            return Promise.resolve({'success': false, 'message': 'A dinghy class is required for a new dinghy.'});
        }
        return this.model.createDinghy(dinghy);
    }

    /**
     * Create a new dinghy class
     * @param {DinghyClass} dinghyClass
     * @returns {Promise<Result>}
     */
    createDinghyClass(dinghyClass) {
        if (dinghyClass.name === null || dinghyClass.name === '') {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new dinghy class.'});
        }
        return this.model.createDinghyClass(dinghyClass);
    }

    /**
     * Create a new race
     * @param {Race} race
     * @returns {Promise<Result>}
     */
    createRace(race) {
        if (race.name === undefined || race.name === null || race.name === '') {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new race.'});
        }
        if (!(race.plannedStartTime instanceof Date)) {
            return Promise.resolve({'success': false, 'message': 'A time is required for a new race.'});
        }
        if ((race.plannedLaps === undefined || race.plannedLaps === null || race.plannedLaps === '')) {
            return Promise.resolve({'success': false, 'message': 'Planned laps is required for a new race.'});
        }
        return this.model.createRace(race);
    }

    /**
     * Sign up to a race
     * @param {Race} race Race to sign up to
     * @param {Competitor} helm Competitor signing up to helm dinghy
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @param {Competitor} crew 
     * @returns {Promise<Result>}
     */
    signupToRace(race, helm, dinghy, crew = null) {
        // check valid race, competitor, and dinghy provided
        if (!race.name || race.name === '' || !race.plannedStartTime) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        if (!helm.name || helm.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the helm.'});
        }
        if (!dinghy.sailNumber || dinghy.sailNumber === '' || !dinghy.dinghyClass || !dinghy.dinghyClass.name || dinghy.dinghyClass.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the dinghy.'});
        }
        if (crew && (!crew.name || crew.name === '')) {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the crew.'});
        }
        return this.model.createEntry(race, helm, dinghy, crew);
    }

    /**
     * Start a race
     * @param {Race} race to start
     * @return {Promise<Result>}
     */
    startRace(race) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        return this.model.startRace(race, new Date());
    }

    /**
     * Download a file containing the results for race
     * @param {Race} race to donwload results for
     * @return {Promise<Result>}
     */
    async downloadRaceResults(race) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        const result = await this.model.getEntriesByRace(race);
        if (result.success) {
            return downloadRaceEntriesCSV(race, result.domainObject);
        }
        else {
            return Promise.resolve(result);
        }
    }

    /**
     * Postponse a race
     * @param {race} race to postpone
     * @param {Number} duration, in milliseconds, by which to delay the race
     */
    async postponeRace(race, duration) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        if (!race.url) {
            const result = await this.model.getRaceByNameAndPlannedStartTime(race.name, race.plannedStartTime);
            if (result.success) {
                race.url = result.domainObject.url;
            }
            else {
                return Promise.resolve(result);
            }
        }
        const newTime = new Date(race.plannedStartTime.valueOf() + duration);
        return this.model.update(race.url, {'plannedStartTime': newTime});
    }
}

export default DinghyRacingController