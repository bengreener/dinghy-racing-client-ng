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
    }

    /**
     * Add a lap to race entry
     * @param {Entry} entry
     * @param {Number} time The lap time duration in milliseconds
     * @returns {Promise<Result}
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
     * @returns {Promise<Result}
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
     * @returns {Promise<Result}
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
     * Add a new competitor
     * @param {Competitor} competitor
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
     * @returns {Promise<Result}
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
     * @param {competitor} competitor Competitor signing up
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @returns {Promise<Result>}
     */
    signupToRace(race, competitor, dinghy) {
        // check valid race, competitor, and dinghy provided
        if (!race.name || race.name === '' || !race.plannedStartTime) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        if (!competitor.name || competitor.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the competitor.'});
        }
        if (!dinghy.sailNumber || dinghy.sailNumber === '' || !dinghy.dinghyClass || !dinghy.dinghyClass.name || dinghy.dinghyClass.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the dinghy.'});
        }
        return this.model.createEntry(race, competitor, dinghy);
    }

    /**
     * Start a race
     * @param {Race} Race to start
     * @return {Promise<Result>}
     */
    startRace(race) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        return this.model.startRace(race, new Date());
    }
}

export default DinghyRacingController